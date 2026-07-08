import { ServiceException } from '../util/exceptions/ServiceException';
import logger from '../util/logger';
import { RepositoryFactory } from '../repository/Repository.factory';
import config from '../config';
import { IIdentifiableOrderItem } from '../model/IOrder';
import { ItemCategory } from '../model/IItem';
import { IRepository } from '../repository/IRepository';

export class OrderManagementService {
  //create an order
  public async createOrder(
    order: IIdentifiableOrderItem,
  ): Promise<IIdentifiableOrderItem> {
    // validate order
    this.validateOrder(order);
    // persit new order
    const repo = await this.getRepo(order.getItem().getCategory());
    repo.create(order);

    return order;
  }
  //Get Order
  public async getOrder(id: string): Promise<IIdentifiableOrderItem> {
    const categories = Object.values(ItemCategory);
    for (const category of categories) {
      const repo = await this.getRepo(category);
      const order = await repo.get(id);
      if (order) {
        return order;
      }
    }
    throw new ServiceException('Order not found');
  }
  //Update Order
  public async updateOrder(
    id: string,
    updatedOrder: IIdentifiableOrderItem,
  ): Promise<void> {
    // validate updated order
    this.validateOrder(updatedOrder);
    const repo = await this.getRepo(updatedOrder.getItem().getCategory());
    repo.update(updatedOrder);
  }
  //Delete Order
  public async deleteOrder(id: string): Promise<void> {
    const categories = Object.values(ItemCategory);
    for (const category of categories) {
      const repo = await this.getRepo(category);
      const order = await repo.get(id);
      if (order) {
        repo.delete(id);
        return;
      }
    }
    throw new ServiceException('Order not found');
  }
  //Get All Orders
  public async getAllOrders(): Promise<IIdentifiableOrderItem[]> {
    const allOrders: IIdentifiableOrderItem[] = [];
    const categories = Object.values(ItemCategory);
    for (const category of categories) {
      const repo = await this.getRepo(category);
      const orders = await repo.getAll();
      allOrders.push(...orders);
    }
    return allOrders;
  }

  // get total revenue
  public async getTotalRevenue(): Promise<number> {
    const allOrders = await this.getAllOrders();
    return allOrders.reduce(
      (total, order) => total + order.getPrice() * order.getQuantity(),
      0,
    );
  }

  // get total orders
  public async getTotalOrders(): Promise<number> {
    const allOrders = await this.getAllOrders();
    return allOrders.length;
  }

  private async getRepo(
    category: ItemCategory,
  ): Promise<IRepository<IIdentifiableOrderItem>> {
    return await RepositoryFactory.create(config.dbMode, category);
  }
  private validateOrder(order: IIdentifiableOrderItem): void {
    if (!order.getItem() || order.getPrice() <= 0 || order.getQuantity() <= 0) {
      logger.error('Invalid order data');
      throw new ServiceException('Invalid order data');
    }
  }
}
