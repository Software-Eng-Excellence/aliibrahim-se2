import { OrderRepository } from '../../src/repository/postgresql/Order.repository';
import { ConnectionManager } from '../../src/repository/postgresql/ConnectionManager';
import { IIdentifiableItem } from '../../src/model/IItem';
import { IIdentifiableOrderItem } from '../../src/model/IOrder';
import { ItemCategory } from '../../src/model/IItem';
import {
  DbException,
  InitializationException,
  ItemNotFoundException,
} from '../../src/util/exceptions/repostiroyException';
import { PostgreSQLOrderMapper } from '../../src/mappers/Order.mapper';
import {
  id,
  IRepository,
  Initializable,
} from '../../src/repository/IRepository';

describe('OrderRepository - PostgreSQL Unit & Integration Tests', () => {
  let orderRepository: OrderRepository;
  let mockItemRepository: jest.Mocked<
    IRepository<IIdentifiableItem> & Initializable
  >;
  const pool = ConnectionManager.getPool();

  // Pure domain entity stubs to avoid builder dependency overhead
  const stubItem: jest.Mocked<IIdentifiableItem> = {
    getId: jest.fn().mockReturnValue('mock-item-123'),
    getCategory: jest.fn().mockReturnValue(ItemCategory.CAKE),
  } as any;

  const stubOrder: jest.Mocked<IIdentifiableOrderItem> = {
    getId: jest.fn().mockReturnValue('mock-order-789'),
    getPrice: jest.fn().mockReturnValue(45.99),
    getQuantity: jest.fn().mockReturnValue(2),
    getItem: jest.fn().mockReturnValue(stubItem),
  } as any;

  beforeEach(() => {
    jest.setTimeout(15000);

    // Completely mock the sub-item repository dependency to isolate Order units
    mockItemRepository = {
      init: jest.fn().mockResolvedValue(undefined),
      create: jest.fn().mockResolvedValue('mock-item-123'),
      get: jest.fn().mockResolvedValue(stubItem),
      getAll: jest.fn().mockResolvedValue([stubItem]),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    orderRepository = new OrderRepository(mockItemRepository);

    // Default safe fallback query implementation mock to prevent falling back to real Neon network
    jest
      .spyOn(pool, 'query')
      .mockImplementation(() =>
        Promise.resolve({ rows: [], rowCount: 0 } as any),
      );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await pool.end();
  });

  // =========================================================================
  // 1. INITIALIZATION TESTS
  // =========================================================================
  describe('init()', () => {
    it('should initialize the table schema and delegate downstream initialization smoothly', async () => {
      const querySpy = jest
        .spyOn(pool, 'query')
        .mockImplementation(() => Promise.resolve({} as any));

      await orderRepository.init();

      expect(querySpy).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS orders'),
      );
      expect(mockItemRepository.init).toHaveBeenCalled();
    });

    it('should intercept structural layout failures and throw an InitializationException', async () => {
      jest.spyOn(pool, 'query').mockImplementation(() => {
        throw new Error('Neon cloud connection timeout');
      });

      await expect(orderRepository.init()).rejects.toThrow(
        InitializationException,
      );
    });
  });

  // =========================================================================
  // 2. CREATE TRANSACTION LOGIC TESTS
  // =========================================================================
  describe('create()', () => {
    it('should cleanly run a complete transaction block pipeline and commit the records', async () => {
      const querySpy = jest
        .spyOn(pool, 'query')
        .mockImplementation(() => Promise.resolve({} as any));

      const returnedId = await orderRepository.create(stubOrder);

      expect(returnedId).toBe('mock-order-789');
      expect(querySpy).toHaveBeenNthCalledWith(1, 'BEGIN');
      expect(mockItemRepository.create).toHaveBeenCalledWith(stubItem);
      expect(querySpy).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('INSERT INTO orders'),
        ['mock-order-789', 45.99, ItemCategory.CAKE, 2, 'mock-item-123'],
      );
      expect(querySpy).toHaveBeenNthCalledWith(3, 'COMMIT');
    });

    it('should cleanly intercept errors during structural creation, execute a ROLLBACK, and wrap into a DbException', async () => {
      const querySpy = jest
        .spyOn(pool, 'query')
        .mockImplementation((sql: string) => {
          if (sql.includes('INSERT INTO orders')) {
            throw new Error('Primary key violation on unique tracker index');
          }
          return Promise.resolve({} as any);
        });

      await expect(orderRepository.create(stubOrder)).rejects.toThrow(
        DbException,
      );
      expect(querySpy).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  // =========================================================================
  // 3. GET RETRIEVAL TESTS
  // =========================================================================
  describe('get()', () => {
    it('should successfully locate an order record row, grab related sub-items, and map it perfectly', async () => {
      const mockDbRow = {
        id: 'mock-order-789',
        price: 45.99,
        item_category: ItemCategory.CAKE,
        quantity: 2,
        item_id: 'mock-item-123',
      };

      jest.spyOn(pool, 'query').mockImplementation(() => {
        return Promise.resolve({
          rows: [mockDbRow],
          rowCount: 1,
        } as any);
      });
      const mapperSpy = jest
        .spyOn(PostgreSQLOrderMapper.prototype, 'map')
        .mockReturnValue(stubOrder);

      const result = await orderRepository.get('mock-order-789');

      expect(result).toBe(stubOrder);
      expect(mockItemRepository.get).toHaveBeenCalledWith('mock-item-123');
      expect(mapperSpy).toHaveBeenCalledWith({
        row: mockDbRow,
        item: stubItem,
      });
    });

    it('should explicitly throw an ItemNotFoundException when row counts return zero matches', async () => {
      jest.spyOn(pool, 'query').mockImplementation(() => {
        return Promise.resolve({
          rows: [],
          rowCount: 0,
        } as any);
      });
      await expect(orderRepository.get('missing-id')).rejects.toThrow(
        ItemNotFoundException,
      );
    });

    it('should transparently bubble up ItemNotFoundException without masking it inside a generic DbException', async () => {
      jest.spyOn(pool, 'query').mockImplementation(() => {
        return Promise.resolve({
          rows: [{ id: 'order-1', item_id: 'missing-item' }],
          rowCount: 1,
        } as any);
      });

      mockItemRepository.get.mockRejectedValueOnce(
        new ItemNotFoundException('Sub item disappeared'),
      );

      await expect(orderRepository.get('order-1')).rejects.toThrow(
        ItemNotFoundException,
      );
    });

    it('should cleanly handle unexpected system/database crashes by throwing a DbException', async () => {
      jest.spyOn(pool, 'query').mockImplementation(() => {
        throw new Error('Hardware failure');
      });

      await expect(orderRepository.get('any-id')).rejects.toThrow(DbException);
    });
  });

  // =========================================================================
  // 4. GET ALL AGGREGATION TESTS
  // =========================================================================
  describe('getAll()', () => {
    it('should instantly exit and return an empty array [] if no items exist down inside the item store repository', async () => {
      mockItemRepository.getAll.mockResolvedValueOnce([]);

      // Clear out global default mock setup to test zero queries execution condition
      const querySpy = jest.spyOn(pool, 'query').mockClear();

      const data = await orderRepository.getAll();

      expect(data).toEqual([]);
      expect(querySpy).not.toHaveBeenCalled();
    });

    it('should link, stitch, and resolve multi-row domain aggregates perfectly when valid sets correspond', async () => {
      const mockOrderRow = {
        id: 'mock-order-789',
        price: 45.99,
        item_category: ItemCategory.CAKE,
        quantity: 2,
        item_id: 'mock-item-123',
      };

      jest.spyOn(pool, 'query').mockImplementation(() =>
        Promise.resolve({
          rows: [mockOrderRow],
          rowCount: 1,
        } as any),
      );

      const mapperSpy = jest
        .spyOn(PostgreSQLOrderMapper.prototype, 'map')
        .mockReturnValue(stubOrder);

      const results = await orderRepository.getAll();

      expect(results).toHaveLength(1);
      expect(results[0]).toBe(stubOrder);
      expect(mapperSpy).toHaveBeenCalledWith({
        row: mockOrderRow,
        item: stubItem,
      });
    });

    it('should crash and throw a DbException if an order row points to a sub-item that was not loaded', async () => {
      const rogueOrderRow = {
        id: 'mock-order-789',
        price: 45.99,
        item_category: ItemCategory.CAKE,
        quantity: 2,
        item_id: 'unknown-ghost-item-id',
      };

      jest.spyOn(pool, 'query').mockImplementation(() => {
        return Promise.resolve({
          rows: [rogueOrderRow],
          rowCount: 1,
        } as any);
      });

      await expect(orderRepository.getAll()).rejects.toThrow(DbException);
    });

    it('should handle native driver selection layer processing crashes securely with a DbException wrapper', async () => {
      mockItemRepository.getAll.mockRejectedValueOnce(
        new Error('Table corrupted'),
      );

      await expect(orderRepository.getAll()).rejects.toThrow(DbException);
    });
  });

  // =========================================================================
  // 5. UPDATE OPERATION TESTS
  // =========================================================================
  describe('update()', () => {
    it('should execute updates across the complete relational layout inside transactional boundaries', async () => {
      const querySpy = jest
        .spyOn(pool, 'query')
        .mockImplementation(() => Promise.resolve({} as any));

      await orderRepository.update(stubOrder);

      expect(querySpy).toHaveBeenNthCalledWith(1, 'BEGIN');
      expect(mockItemRepository.update).toHaveBeenCalledWith(stubItem);
      expect(querySpy).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('UPDATE orders SET'),
        [45.99, ItemCategory.CAKE, 2, 'mock-item-123', 'mock-order-789'],
      );
      expect(querySpy).toHaveBeenNthCalledWith(3, 'COMMIT');
    });

    it('should trigger an implementation ROLLBACK immediately when database column assignment updates fail', async () => {
      const querySpy = jest
        .spyOn(pool, 'query')
        .mockImplementation((sql: string) => {
          if (sql.includes('UPDATE orders SET')) {
            throw new Error('Read-only system exception occurred');
          }
          return Promise.resolve({} as any);
        });

      await expect(orderRepository.update(stubOrder)).rejects.toThrow(
        DbException,
      );
      expect(querySpy).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  // =========================================================================
  // 6. DELETE OPERATION TESTS
  // =========================================================================
  describe('delete()', () => {
    it('should successfully drop downstream relational dependencies within safe transactions', async () => {
      const querySpy = jest
        .spyOn(pool, 'query')
        .mockImplementation(() => Promise.resolve({} as any));

      await orderRepository.delete('mock-order-789');

      expect(querySpy).toHaveBeenNthCalledWith(1, 'BEGIN');
      expect(mockItemRepository.delete).toHaveBeenCalledWith('mock-order-789');
      expect(querySpy).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('DELETE FROM orders'),
        ['mock-order-789'],
      );
      expect(querySpy).toHaveBeenNthCalledWith(3, 'COMMIT');
    });

    it('should intercept cascading drop exceptions, safely trigger a ROLLBACK statement, and reject cleanly', async () => {
      const querySpy = jest
        .spyOn(pool, 'query')
        .mockImplementation((sql: string) => {
          if (sql.includes('DELETE FROM orders')) {
            throw new Error('Foreign constraint deadlock threat detected');
          }
          return Promise.resolve({} as any);
        });

      await expect(orderRepository.delete('mock-order-789')).rejects.toThrow(
        DbException,
      );
      expect(querySpy).toHaveBeenCalledWith('ROLLBACK');
    });
  });
});
