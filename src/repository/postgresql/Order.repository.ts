import { IIdentifiableItem } from '../../model/IItem';
import {
  DbException,
  InitializationException,
  ItemNotFoundException,
} from '../../util/exceptions/repostiroyException';
import logger from '../../util/logger';
import { id, Initializable, IRepository } from '../IRepository';
import { ConnectionManager } from './ConnectionManager';
import {
  PostgreSQLOrder,
  PostgreSQLOrderMapper,
} from '../../mappers/Order.mapper';
import { IIdentifiableOrderItem } from '../../model/IOrder';

const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS orders (
id VARCHAR(255) PRIMARY KEY,
price NUMERIC NOT NULL,
item_category VARCHAR(255) NOT NULL,
quantity INTEGER NOT NULL,
item_id VARCHAR(255) NOT NULL
);`;
const INSERT_ORDER = `INSERT INTO orders (id, price, item_category, quantity, item_id) VALUES ($1, $2, $3, $4, $5)`;
const SELECT_BY_ID = `SELECT * FROM orders WHERE id = $1`;
const SELECT_ALL = `SELECT * FROM orders WHERE item_category = $1`;
const DELETE_ID = `DELETE FROM orders WHERE id = $1`;
const UPDATE_ID = `UPDATE orders SET price = $1, item_category = $2, quantity = $3, item_id = $4 WHERE id = $5`;
export class OrderRepository
  implements IRepository<IIdentifiableOrderItem>, Initializable
{
  constructor(
    private readonly itemRepository: IRepository<IIdentifiableItem> &
      Initializable,
  ) {}

  async init() {
    try {
      const conn = await ConnectionManager.getPool();
      await conn.query(CREATE_TABLE);
      await this.itemRepository.init();
      logger.info('Orders table initialized');
    } catch (error: unknown) {
      logger.error('Failed to initialize orders table: %o', error);
      throw new InitializationException(
        'InitializationException: Failed to initialize orders table',
        error as Error,
      );
    }
  }
  async create(order: IIdentifiableOrderItem): Promise<id> {
    try {
      const conn = await ConnectionManager.getPool();
      const item_id = await this.itemRepository.create(order.getItem());
      await conn.query(INSERT_ORDER, [
        order.getId(),
        order.getPrice(),
        order.getItem().getCategory(),
        order.getQuantity(),
        item_id,
      ]);
      logger.info('Order created successfully with ID: %s', order.getId());
      return order.getId();
    } catch (error: unknown) {
      logger.error('Failed to create order: %o', error);
      throw new DbException('Failed to create order', error as Error);
    }
  }
  async get(id: id): Promise<IIdentifiableOrderItem> {
    try {
      const conn = await ConnectionManager.getPool();
      const result = await conn.query<PostgreSQLOrder>(SELECT_BY_ID, [id]);

      if (!result || result.rows.length === 0 || !result.rows[0]) {
        throw new ItemNotFoundException(`Order with id ${id} not found`);
      }

      const orderRow = result.rows[0];
      const item = await this.itemRepository.get(orderRow.item_id);

      logger.info('Order of id %s retrieved: %o', id, orderRow);

      return new PostgreSQLOrderMapper().map({ row: orderRow, item: item });
    } catch (error: unknown) {
      if (error instanceof ItemNotFoundException) throw error;
      logger.error('Failed to get order: %o', error);
      throw new DbException('Failed to get order', error as Error);
    }
  }
  async getAll(): Promise<IIdentifiableOrderItem[]> {
    try {
      const conn = await ConnectionManager.getPool();
      const items = await this.itemRepository.getAll();
      if (!items || items.length === 0) {
        return [];
      }
      const orders = await conn.query<PostgreSQLOrder>(SELECT_ALL, [
        items[0].getCategory(),
      ]);

      const bindedOrders = orders.rows.map((order) => {
        const item = items.find((item) => item.getId() === order.item_id);
        if (!item) {
          logger.error(
            'Item with id %s not found for order %s',
            order.item_id,
            order.id,
          );
          throw new DbException(
            `Item with id ${order.item_id} not found for order ${order.id}`,
            new Error('Item not found'),
          );
        }
        return { order, item };
      });
      const identifiableOrders = bindedOrders.map(({ order, item }) => {
        return new PostgreSQLOrderMapper().map({ row: order, item: item });
      });
      return identifiableOrders;
    } catch (error: unknown) {
      logger.error('Failed to get all orders: %o', error);
      throw new DbException('Failed to get all orders', error as Error);
    }
  }
  async update(item: IIdentifiableOrderItem): Promise<void> {
    try {
      const conn = await ConnectionManager.getPool();
      await this.itemRepository.update(item.getItem());
      await conn.query(UPDATE_ID, [
        item.getPrice(),
        item.getItem().getCategory(),
        item.getQuantity(),
        item.getItem().getId(),
        item.getId(),
      ]);
      logger.info('Order updated successfully with ID: %s', item.getId());
    } catch (error: unknown) {
      logger.error('Failed to update order: %o', error);
      throw new DbException('Failed to update order', error as Error);
    }
  }
  async delete(id: id): Promise<void> {
    try {
      const conn = await ConnectionManager.getPool();
      const result = await conn.query<PostgreSQLOrder>(SELECT_BY_ID, [id]);
      if (!result || result.rows.length === 0 || !result.rows[0]) {
        throw new ItemNotFoundException(`Order with id ${id} not found`);
      }
      const item_id = (await this.get(id)).getItem().getId();

      // Delete the order row first: if the linked item is already missing
      // (e.g. left over from a prior partial failure), the order must still
      // be removable rather than becoming permanently stuck.
      await conn.query(DELETE_ID, [id]);
      try {
        await this.itemRepository.delete(item_id);
      } catch (itemError: unknown) {
        if (itemError instanceof ItemNotFoundException) {
          logger.error(
            'Item %s for order %s was already missing during delete',
            item_id,
            id,
          );
        } else {
          throw itemError;
        }
      }
      logger.info('Order deleted successfully with ID: %s', id);
    } catch (error: unknown) {
      if (error instanceof ItemNotFoundException) throw error;
      logger.error('Failed to delete order: %o', error);
      throw new DbException('Failed to delete order', error as Error);
    }
  }
}
