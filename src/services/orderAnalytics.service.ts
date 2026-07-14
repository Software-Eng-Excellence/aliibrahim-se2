import { ItemCategory } from '../model/IItem';
import { IIdentifiableOrderItem } from '../model/IOrder';
import { getRepo } from '../util';

export class OrderAnalyticsService {
  // 1. Private helper to fetch all orders grouped by their category in a single pass
  private async fetchOrdersByCategory(): Promise<
    Record<ItemCategory, IIdentifiableOrderItem[]>
  > {
    const categories = Object.values(ItemCategory);
    const data = {} as Record<ItemCategory, IIdentifiableOrderItem[]>;

    for (const category of categories) {
      const repo = await getRepo(category);
      data[category] = await repo.getAll();
    }

    return data;
  }

  // 1. Order Volume Analytics: Total Count
  public async getTotalOrderCount(): Promise<number> {
    const data = await this.fetchOrdersByCategory();
    return Object.values(data).reduce((sum, orders) => sum + orders.length, 0);
  }

  // 2. Order Volume Analytics: Count by Category
  public async getOrderCountByCategory(): Promise<
    Record<ItemCategory, number>
  > {
    const data = await this.fetchOrdersByCategory();
    const countByCategory = {} as Record<ItemCategory, number>;

    for (const category of Object.keys(data) as ItemCategory[]) {
      countByCategory[category] = data[category].length;
    }

    return countByCategory;
  }

  // 3. Revenue Analytics: Total Revenue
  public async getTotalRevenue(): Promise<number> {
    const data = await this.fetchOrdersByCategory();
    let totalRevenue = 0;

    for (const orders of Object.values(data)) {
      totalRevenue += orders.reduce(
        (sum, order) => sum + order.getPrice() * order.getQuantity(),
        0,
      );
    }

    return totalRevenue;
  }

  // 4. Revenue Analytics: Revenue by Category
  public async getRevenueByCategory(): Promise<Record<ItemCategory, number>> {
    const data = await this.fetchOrdersByCategory();
    const revenueByCategory = {} as Record<ItemCategory, number>;

    for (const category of Object.keys(data) as ItemCategory[]) {
      revenueByCategory[category] = data[category].reduce(
        (sum, order) => sum + order.getPrice() * order.getQuantity(),
        0,
      );
    }

    return revenueByCategory;
  }
}
