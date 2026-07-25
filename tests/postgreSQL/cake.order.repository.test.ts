import { CakeRepository } from '../../src/repository/postgresql/Cake.order.repository';
import { ConnectionManager } from '../../src/repository/postgresql/ConnectionManager';
import { IdentifiableCakeBuilder } from '../../src/model/builders/Cake.builder';
import { CakeBuilder } from '../../src/model/builders/Cake.builder';
import { ItemCategory } from '../../src/model/IItem';
import {
  DbException,
  InitializationException,
  ItemNotFoundException,
} from '../../src/util/exceptions/repostiroyException';

const tableName = ItemCategory.CAKE;

// These tests hit a real Postgres database (DATABASE_URL) and are skipped
// in CI, where no such database is available; run them locally with a .env.
const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

describeIfDb('CakeRepository - PostgreSQL Integration Tests', () => {
  let repository: CakeRepository;
  let pool: ReturnType<typeof ConnectionManager.getPool>;

  beforeAll(async () => {
    pool = ConnectionManager.getPool();
    repository = new CakeRepository();
    // Initialize table schema in Neon before tests run
    await repository.init();
  });

  afterAll(async () => {
    // Explicitly tear down the pool so Jest can cleanly exit terminal
    await pool.end();
  });

  /**
   * Helper utility to spin up an identical clean Cake entity structure
   */
  function createMockCake() {
    return IdentifiableCakeBuilder.newBuilder()
      .setCake(
        CakeBuilder.newBuilder()
          .setType('Wedding')
          .setFlavor('Red Velvet')
          .setFilling('Cream Cheese')
          .setSize(10)
          .setLayers(3)
          .setFrostingType('Fondant')
          .setFrostingFlavor('Vanilla')
          .setDecorationType('Flowers')
          .setDecorationColor('White')
          .setCustomMessage('Forever Always')
          .setShape('Tiered Round')
          .setAllergies('Nuts')
          .setSpecialIngredients('Gold Leaf')
          .setPackagingType('Reinforced Box')

          .build(),
      )
      .build();
  }

  // --- 1. CORE CRUD & TRANSACTION ROLLBACK EDGE CASE ---
  it('should successfully run a transaction block, insert data, and ROLLBACK cleanly leaving no trace', async () => {
    const client = await pool.connect();
    const mockCake = createMockCake();

    try {
      // Begin separate isolated transaction timeline
      await client.query('BEGIN');

      const insertQuery = `INSERT INTO ${tableName} (id, type, flavor, filling, size, layers, frostingType, frostingFlavor, decorationType, decorationColor, customMessage, shape, allergies, specialIngredients, packagingType) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`;

      await client.query(insertQuery, [
        mockCake.getId(),
        mockCake.getType(),
        mockCake.getFlavor(),
        mockCake.getFilling(),
        mockCake.getSize(),
        mockCake.getLayers(),
        mockCake.getFrostingType(),
        mockCake.getFrostingFlavor(),
        mockCake.getDecorationType(),
        mockCake.getDecorationColor(),
        mockCake.getCustomMessage(),
        mockCake.getShape(),
        mockCake.getAllergies(),
        mockCake.getSpecialIngredients(),
        mockCake.getPackagingType(),
      ]);

      // Assert row visibility inside the active transaction window
      const checkInsideTx = await client.query(
        `SELECT * FROM ${tableName} WHERE id = $1`,
        [mockCake.getId()],
      );
      expect(checkInsideTx.rowCount).toBe(1);
      expect(checkInsideTx.rows[0].flavor).toBe('Red Velvet');
    } finally {
      // Abort structural modification commands
      await client.query('ROLLBACK');
      client.release();
    }

    // Assert that the record does not exist on Neon globally after the rollback
    const checkOutsideTx = await pool.query(
      `SELECT * FROM ${tableName} WHERE id = $1`,
      [mockCake.getId()],
    );
    expect(checkOutsideTx.rowCount).toBe(0);
  });

  // --- 2. PERSISTED VERIFICATIONS (CLEANUP VIA DIRECT REPO COMMANDS) ---
  it('should handle full lifecycle creation, updates, and absolute retrieval operations safely', async () => {
    const mockCake = createMockCake();

    // Create record
    const createdId = await repository.create(mockCake);
    expect(createdId).toBe(mockCake.getId());

    // Fetch and Map verification
    const fetchedCake = await repository.get(createdId);
    expect(fetchedCake.getId()).toBe(createdId);
    expect(fetchedCake.getFlavor()).toBe('Red Velvet');

    // Get All count evaluation
    const allCakes = await repository.getAll();
    expect(allCakes.length).toBeGreaterThanOrEqual(1);

    // Update execution mutation
    const updatedCake = IdentifiableCakeBuilder.newBuilder()
      .setId(createdId)
      .setCake(
        CakeBuilder.newBuilder()
          .setType('Wedding')
          .setFlavor('Chocolate Fudge') // Mutated field
          .setFilling('Cream Cheese')
          .setSize(10)
          .setLayers(3)
          .setFrostingType('Fondant')
          .setFrostingFlavor('Vanilla')
          .setDecorationType('Flowers')
          .setDecorationColor('White')
          .setCustomMessage('Forever Always')
          .setShape('Tiered Round')
          .setAllergies('Nuts')
          .setSpecialIngredients('Gold Leaf')
          .setPackagingType('Reinforced Box')
          .build(),
      )
      .build();

    await repository.update(updatedCake);

    const verifiedMutation = await repository.get(createdId);
    expect(verifiedMutation.getFlavor()).toBe('Chocolate Fudge');

    // Tear down clean-up via Repository Delete
    await repository.delete(createdId);

    // Ensure it is completely purged
    await expect(repository.get(createdId)).rejects.toThrow(DbException);
  });

  // --- 3. MISSING RETRIEVAL OPERATIONS EDGE CASES ---
  it('should throw an DException when retrieving a non-existent tracking identity', async () => {
    const invalidSearchTarget = 'NON_EXISTENT_ID_99X';
    await expect(repository.get(invalidSearchTarget)).rejects.toThrow(
      DbException,
    );
  });

  it('should throw an DbException when attempting to delete a missing target key record', async () => {
    const invalidPurgeTarget = 'PURGE_FAIL_88Y';
    await expect(repository.delete(invalidPurgeTarget)).rejects.toThrow(
      DbException,
    );
  });

  it('should throw an InitializationException when the table creation query fails', async () => {
    // Spy on the pool's query method and force it to reject with an error
    const querySpy = jest.spyOn(pool, 'query').mockImplementationOnce(() => {
      throw new Error('Database connection failure');
    });
    // Create a fresh instance to ensure a clean state
    const faultRepository = new CakeRepository();

    await expect(faultRepository.init()).rejects.toThrow(
      InitializationException,
    );

    // Clean up the spy so it doesn't break other tests
    querySpy.mockRestore();
  });
  it('should throw a DbException when the database fails to execute the INSERT query', async () => {
    const querySpy = jest.spyOn(pool, 'query').mockImplementationOnce(() => {
      throw new Error('Deadlock detected');
    });
    const mockCake = createMockCake(); // Uses your helper from before

    await expect(repository.create(mockCake)).rejects.toThrow(DbException);

    querySpy.mockRestore();
  });
  it('should return an empty array [] when no cakes are stored in the database table', async () => {
    // Mock a successful query return that has 0 rows
    const querySpy = jest.spyOn(pool, 'query').mockImplementationOnce(() => {
      return Promise.resolve({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: [],
      } as any);
    });

    const result = await repository.getAll();
    expect(result).toEqual([]);
    expect(result.length).toBe(0);

    querySpy.mockRestore();
  });

  it('should throw a DbException when the SELECT ALL query fails', async () => {
    const querySpy = jest.spyOn(pool, 'query').mockImplementationOnce(() => {
      throw new Error('Table corrupted');
    });

    await expect(repository.getAll()).rejects.toThrow(DbException);

    querySpy.mockRestore();
  });
  it('should throw a DbException when the UPDATE query fails on the database side', async () => {
    const querySpy = jest.spyOn(pool, 'query').mockImplementationOnce(() => {
      throw new Error('Disk full');
    });
    const mockCake = createMockCake();

    await expect(repository.update(mockCake)).rejects.toThrow(DbException);

    querySpy.mockRestore();
  });
});
