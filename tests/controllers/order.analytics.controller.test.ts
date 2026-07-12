import { OrderAnalyticsController } from '../../src/controllers/order.analytics.controller';
import { OrderAnalyticsService } from '../../src/services/orderAnalytics.service';
import { Request, Response } from 'express';
import { ItemCategory } from '../../src/model/IItem';

describe('OrderAnalyticsController', () => {
  let controller: OrderAnalyticsController;
  let mockService: jest.Mocked<OrderAnalyticsService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    // 1. Mock the whole service layer directly
    mockService = {
      getTotalOrderCount: jest.fn(),
      getOrderCountByCategory: jest.fn(),
      getTotalRevenue: jest.fn(),
      getRevenueByCategory: jest.fn(),
    } as unknown as jest.Mocked<OrderAnalyticsService>;

    controller = new OrderAnalyticsController(mockService);

    // 2. Mock Express response structure
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockRequest = {};
  });

  it('should return total order count object', async () => {
    mockService.getTotalOrderCount.mockResolvedValue(10);

    await controller.getTotalOrderCount(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ totalCount: 10 });
  });

  it('should return order counts by category map', async () => {
    const mockCounts = { [ItemCategory.CAKE]: 5, [ItemCategory.BOOK]: 5 };
    mockService.getOrderCountByCategory.mockResolvedValue(mockCounts as any);

    await controller.getOrderCountByCategory(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(mockCounts);
  });

  it('should return total revenue object', async () => {
    mockService.getTotalRevenue.mockResolvedValue(250);

    await controller.getTotalRevenue(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ totalRevenue: 250 });
  });

  it('should return revenue by category map', async () => {
    const mockRevenue = { [ItemCategory.CAKE]: 150, [ItemCategory.BOOK]: 100 };
    mockService.getRevenueByCategory.mockResolvedValue(mockRevenue as any);

    await controller.getRevenueByCategory(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(mockRevenue);
  });
});
