import { OrderAnalyticsService } from '../services/orderAnalytics.service';
import { Request, Response } from 'express';
export class OrderAnalyticsController {
  constructor(private readonly orderAnalyticsService: OrderAnalyticsService) {}

  public async getTotalOrderCount(req: Request, res: Response) {
    const totalCount = await this.orderAnalyticsService.getTotalOrderCount();
    res.status(200).json({ totalCount });
  }
  public async getOrderCountByCategory(req: Request, res: Response) {
    const countByCategory =
      await this.orderAnalyticsService.getOrderCountByCategory();
    res.status(200).json(countByCategory);
  }
  public async getTotalRevenue(req: Request, res: Response) {
    const totalRevenue = await this.orderAnalyticsService.getTotalRevenue();
    res.status(200).json({ totalRevenue });
  }
  public async getRevenueByCategory(req: Request, res: Response) {
    const revenueByCategory =
      await this.orderAnalyticsService.getRevenueByCategory();
    res.status(200).json(revenueByCategory);
  }
}
