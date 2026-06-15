import { IOrder } from '../../model/IOrder';
import {
  InvalidItemException,
  ItemNotFoundException,
} from '../../util/exceptions/repostiroyException';
import logger from '../../util/logger';
import { id, IRepository } from '../IRepository';

export abstract class OrderRepository implements IRepository<IOrder> {
  protected abstract load(): Promise<IOrder[]>;
  protected abstract save(orders: IOrder[]): Promise<void>;

  async create(item: IOrder): Promise<id> {
    // validate Order
    if (!item) {
      throw new InvalidItemException('order cant be null or undefined');
      logger.error('Invalid order: order cant be null or undefined');
    }
    // load all orders
    const orders = await this.load();

    // add new order
    const id = orders.push(item);

    // save all orders

    await this.save(orders);
    logger.info(`Order with id ${id} created successfully`);
    return id.toString();
  }
  async get(id: id): Promise<IOrder> {
    const orders = await this.load();
    const order = orders.find((o) => o.getId() === id);
    if (!order) {
      logger.error(`Order with id ${id} not found`);
      throw new ItemNotFoundException(`Order with id ${id} not found`);
    }
    logger.info(`Order with id ${id} retrieved successfully`);
    return order;
  }
  async getAll(): Promise<IOrder[]> {
    logger.info('Retrieving all orders');
    return this.load();
  }
  async update(item: IOrder): Promise<void> {
    if (!item) {
      logger.error('Invalid order: order cant be null or undefined');
      throw new InvalidItemException('order cant be null or undefined');
    }
    const orders = await this.load();
    const index = orders.findIndex((o) => o.getId() === item.getId());
    if (index === -1) {
      logger.error(`Order with id ${item.getId()} not found`);
      throw new ItemNotFoundException(
        `Order with id ${item.getId()} not found`,
      );
    }
    orders[index] = item;
    await this.save(orders);
    logger.info(`Order with id ${item.getId()} updated successfully`);
  }
  async delete(id: id): Promise<void> {
    if (!id) {
      logger.error('Invalid id: id cant be null or undefined');
      throw new InvalidItemException('id cant be null or undefined');
    }
    const orders = await this.load();
    const index = orders.findIndex((o) => o.getId() === id);
    if (index === -1) {
      logger.error(`Order with id ${id} not found`);
      throw new ItemNotFoundException(`Order with id ${id} not found`);
    }
    orders.splice(index, 1);
    await this.save(orders);
    logger.info(`Order with id ${id} deleted successfully`);
  }
}
