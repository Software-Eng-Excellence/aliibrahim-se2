import { OrderAnalyticsService } from '../../src/services/orderAnalytics.service';
import { getRepo } from '../../src/util';
import { ItemCategory } from '../../src/model/IItem';
import { IIdentifiableOrderItem } from '../../src/model/IOrder';

// 1. Mock the entire utility module where getRepo is exported
jest.mock('../../src/util', () => ({
  getRepo: jest.fn(),
}));

describe('OrderAnalyticsService', () => {
  let service: OrderAnalyticsService;

  // Helper to manufacture fake order items for testing
  const createMockOrder = (
    price: number,
    quantity: number,
  ): IIdentifiableOrderItem => {
    return {
      getPrice: () => price,
      getQuantity: () => quantity,
    } as IIdentifiableOrderItem;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OrderAnalyticsService();
  });

  it('should compute metrics correctly across cakes, toys, and books categories', async () => {
    // 2. Define fake database data matching your specific categories
    const mockCakes = [
      createMockOrder(15, 2), // Revenue = 30
      createMockOrder(20, 1), // Revenue = 20
    ];
    const mockToys = [
      createMockOrder(10, 3), // Revenue = 30
    ];
    const mockBooks = [
      createMockOrder(8, 2), // Revenue = 16
    ];

    // 3. Program the mocked getRepo dynamically based on your category keys
    (getRepo as jest.Mock).mockImplementation(
      async (category: ItemCategory) => {
        // Adjusted matching to fit CAKE, TOY, and BOOK
        if (category === ItemCategory.CAKE) {
          return { getAll: jest.fn().mockResolvedValue(mockCakes) };
        }
        if (category === ItemCategory.TOY) {
          return { getAll: jest.fn().mockResolvedValue(mockToys) };
        }
        if (category === ItemCategory.BOOK) {
          return { getAll: jest.fn().mockResolvedValue(mockBooks) };
        }
        return { getAll: jest.fn().mockResolvedValue([]) };
      },
    );

    // 4. Assertions for Order Volume Analytics
    const totalCount = await service.getTotalOrderCount();
    expect(totalCount).toBe(4); // 2 cakes + 1 toy + 1 book

    const countByCategory = await service.getOrderCountByCategory();
    expect(countByCategory[ItemCategory.CAKE]).toBe(2);
    expect(countByCategory[ItemCategory.TOY]).toBe(1);
    expect(countByCategory[ItemCategory.BOOK]).toBe(1);

    // 5. Assertions for Revenue Analytics
    const totalRevenue = await service.getTotalRevenue();
    expect(totalRevenue).toBe(96); // 30 + 20 + 30 + 16

    const revenueByCategory = await service.getRevenueByCategory();
    expect(revenueByCategory[ItemCategory.CAKE]).toBe(50);
    expect(revenueByCategory[ItemCategory.TOY]).toBe(30);
    expect(revenueByCategory[ItemCategory.BOOK]).toBe(16);
  });
});
