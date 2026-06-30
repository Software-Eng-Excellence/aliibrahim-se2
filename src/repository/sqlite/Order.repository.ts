import { IIdentifiableOrderItem } from '../../model/IOrder';
import { IIdentifiableItem } from '../../model/IItem';
import {
  DbException,
  InitializationException,
} from '../../util/exceptions/repostiroyException';
import logger from '../../util/logger';
import { id, Initializable, IRepository } from '../IRepository';
import { ConnectionManager } from './ConnectionManager';
import { SQLiteOrder, SQLiteOrderMapper } from '../../mappers/Order.mapper';
const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY ,
      price INTEGER NOT NULL,
      item_category TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      item_id TEXT NOT NULL 
    );`;

const INSERT_ORDER = `INSERT INTO orders (id, price, item_category, quantity, item_id) VALUES (?, ?, ?, ?, ?)`;
const SELECT_BY_ID = `SELECT * FROM orders WHERE id = ?`;
const SELECT_ALL = `SELECT * FROM orders WHERE item_category = ?`;
const DELETE_ID = `DELETE FROM orders WHERE id = ?`;
const UPDATE_ID = `UPDATE orders SET price = ?, item_category = ?, quantity = ?, item_id = ? WHERE id = ?`;
export class OrderRepository
  implements IRepository<IIdentifiableOrderItem>, Initializable
{
  constructor(
    private readonly itemRepository: IRepository<IIdentifiableItem> &
      Initializable,
  ) {}

  async init() {
    try {
      const conn = await ConnectionManager.getConnection();
      await conn.exec(CREATE_TABLE);
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
    let conn;
    try {
      conn = await ConnectionManager.getConnection();
      conn.exec('BEGIN TRANSACTION');
      const item_id = await this.itemRepository.create(order.getItem());
      await conn.run(INSERT_ORDER, [
        order.getId(),
        order.getPrice(),
        order.getItem().getCategory(),
        order.getQuantity(),
        item_id,
      ]);
      return order.getId();
    } catch (error: unknown) {
      logger.error('Failed to create order: %o', error);
      conn && conn.exec('ROLLBACK');
      throw new DbException('Failed to create order', error as Error);
    }
  }
  async get(id: id): Promise<IIdentifiableOrderItem> {
    try {
      const conn = await ConnectionManager.getConnection();
      const row = await conn.get<SQLiteOrder>(SELECT_BY_ID, [id]);
      if (!row) {
        logger.error('Order with id %s not found', id);
        throw new Error(`Order with id ${id} not found`);
      }
      const item = await this.itemRepository.get(row.item_id);

      logger.info('Order of id %s retrieved: %o', id, row);
      return new SQLiteOrderMapper().map({ data: row, item: item });
    } catch (error: unknown) {
      logger.error('Failed to get order of id %s: %o', id, error as Error);
      throw new DbException(
        'Failed to get order of id %s' + id,
        error as Error,
      );
    }
  }
  async getAll(): Promise<IIdentifiableOrderItem[]> {
    try {
      const conn = await ConnectionManager.getConnection();
      const items = await this.itemRepository.getAll();
      if (!items || items.length === 0) {
        return [];
      }
      const orders = await conn.all<SQLiteOrder[]>(SELECT_ALL, [
        items[0].getCategory(),
      ]);
      // bind orders to items
      const bindedOrders = orders.map((order) => {
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
      // for each order, find the corresponding item and map it to IIdentifiableOrderItem
      const identifiableOrders = bindedOrders.map(({ order, item }) => {
        return new SQLiteOrderMapper().map({ data: order, item: item });
      });
      //return list of IIdentifiableOrderItem
      return identifiableOrders;
    } catch (error: unknown) {
      logger.error('Failed to get all orders: %o', error as Error);
      throw new DbException('Failed to get all orders', error as Error);
    }
  }
  async update(order: IIdentifiableOrderItem): Promise<void> {
    let conn;
    try {
      conn = await ConnectionManager.getConnection();
      conn.exec('BEGIN TRANSACTION');
      await this.itemRepository.update(order.getItem());
      await conn.run(UPDATE_ID, [
        order.getPrice(),
        order.getItem().getCategory(),
        order.getQuantity(),
        order.getItem().getId(),
        order.getId(),
      ]);
      conn.exec('COMMIT');
    } catch (error: unknown) {
      logger.error('Failed to update order: %o', error);
      conn && conn.exec('ROLLBACK');
      throw new DbException('Failed to update order', error as Error);
    }
  }
  async delete(id: id): Promise<void> {
    let conn;
    try {
      conn = await ConnectionManager.getConnection();
      conn.exec('BEGIN TRANSACTION');
      await this.itemRepository.delete(id);
      await conn.run(DELETE_ID, [id]);
      conn.exec('COMMIT');
    } catch (error: unknown) {
      logger.error('Failed to delete order: %o', error);
      conn && conn.exec('ROLLBACK');
      throw new DbException('Failed to delete order', error as Error);
    }
  }
}
