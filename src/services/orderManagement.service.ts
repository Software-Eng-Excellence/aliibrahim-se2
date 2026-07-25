import logger from '../util/logger';
import { IIdentifiableOrderItem } from '../model/IOrder';
import { ItemCategory } from '../model/IItem';
import { getRepo } from '../util/index';
import { ItemNotFoundException } from '../util/exceptions/repostiroyException';
import { NotFoundException } from '../util/exceptions/http/NotFoundException';
import { BadRequestException } from '../util/exceptions/http/BadRequestException';
export class OrderManagementService {
  //create an order
  public async createOrder(
    order: IIdentifiableOrderItem,
  ): Promise<IIdentifiableOrderItem> {
    // validate order
    this.validateOrder(order);
    // persit new order
    const repo = await getRepo(order.getItem().getCategory());
    await repo.create(order);

    return order;
  }
  //Get Order
  public async getOrder(id: string): Promise<IIdentifiableOrderItem> {
    const categories = Object.values(ItemCategory);
    for (const category of categories) {
      try {
        const repo = await getRepo(category);

        return await repo.get(id);
      } catch {
        continue;
      }
    }
    throw new NotFoundException(`Order with id ${id} not found`);
  }
  //Update Order
  public async updateOrder(
    updatedOrder: IIdentifiableOrderItem,
  ): Promise<void> {
    // validate updated order
    this.validateOrder(updatedOrder);
    const repo = await getRepo(updatedOrder.getItem().getCategory());
    await repo.update(updatedOrder);
  }
  //Delete Order
  public async deleteOrder(id: string): Promise<void> {
    const categories = Object.values(ItemCategory);
    for (const category of categories) {
      const repo = await getRepo(category);
      try {
        await repo.delete(id);
        return;
      } catch (error) {
        if (error instanceof ItemNotFoundException) continue;
        throw error;
      }
    }
    throw new NotFoundException('Order not found');
  }
  //Get All Orders
  public async getAllOrders(): Promise<IIdentifiableOrderItem[]> {
    const allOrders: IIdentifiableOrderItem[] = [];
    const categories = Object.values(ItemCategory);
    for (const category of categories) {
      const repo = await getRepo(category);
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

  private validateOrder(order: IIdentifiableOrderItem): void {
    if (!order.getItem() || order.getPrice() <= 0 || order.getQuantity() <= 0) {
      logger.error('Invalid order data');
      const details = {
        ItemNotDefined: !order.getItem(),
        InvalidPrice: order.getPrice() <= 0,
        InvalidQuantity: order.getQuantity() <= 0,
      };
      throw new BadRequestException('Invalid order data', details);
    }
  }
}
