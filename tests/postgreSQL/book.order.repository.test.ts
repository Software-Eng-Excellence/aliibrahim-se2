import { BookRepository } from '../../src/repository/postgresql/Book.order.repository'; // Update path as needed
import { ConnectionManager } from '../../src/repository/postgresql/ConnectionManager';
import {
  IdentifiableBookBuilder,
  BookBuilder,
} from '../../src/model/builders/Book.builder';
import { ItemCategory } from '../../src/model/IItem';
import {
  ItemNotFoundException,
  DbException,
  InitializationException,
} from '../../src/util/exceptions/repostiroyException';

const tableName = ItemCategory.BOOK;

describe('BookRepository - PostgreSQL Integration Tests', () => {
  let repository: BookRepository;
  const pool = ConnectionManager.getPool();

  beforeAll(async () => {
    repository = new BookRepository();
    jest.setTimeout(15000); // 15-second buffer for Neon network latency
    await repository.init();
  });

  afterAll(async () => {
    await pool.end(); // Clean up connection pool
  });

  /**
   * Helper utility to spin up a clean Book entity structure
   */
  function createMockBook() {
    return IdentifiableBookBuilder.newBuilder()
      .setBook(
        BookBuilder.newBuilder()
          .setTitle('The Pragmatic Programmer')
          .setAuthor('Andy Hunt')
          .setGenre('Software Engineering')
          .setFormat('Hardcover')
          .setLanguage('English')
          .setPublisher('Addison-Wesley')
          .setSpecialEdition('20th Anniversary Edition')
          .setPackaging('Bubble Wrap Sleeve')
          .build(),
      )
      .build();
  }

  // --- 1. FULL CRUD & BOOK PROP RETRIEVAL Lifecycle ---
  it('should handle full lifecycle creation, updates, and absolute retrieval of book properties safely', async () => {
    const mockBook = createMockBook();

    // Create record
    const createdId = await repository.create(mockBook);
    expect(createdId).toBe(mockBook.getId());

    // Fetch and check all properties specifically
    const fetchedBook = await repository.get(createdId);
    expect(fetchedBook.getId()).toBe(createdId);
    expect(fetchedBook.getTitle()).toBe('The Pragmatic Programmer');
    expect(fetchedBook.getAuthor()).toBe('Andy Hunt');
    expect(fetchedBook.getGenre()).toBe('Software Engineering');
    expect(fetchedBook.getFormat()).toBe('Hardcover');
    expect(fetchedBook.getLanguage()).toBe('English');
    expect(fetchedBook.getPublisher()).toBe('Addison-Wesley');
    expect(fetchedBook.getSpecialEdition()).toBe('20th Anniversary Edition');
    expect(fetchedBook.getPackaging()).toBe('Bubble Wrap Sleeve');

    // Get All array valuation
    const allBooks = await repository.getAll();
    expect(allBooks.length).toBeGreaterThanOrEqual(1);

    // Update execution mutation
    const updatedBook = IdentifiableBookBuilder.newBuilder()
      .setId(createdId)
      .setBook(
        BookBuilder.newBuilder()
          .setTitle('Clean Code') // Mutated
          .setAuthor('Robert C. Martin') // Mutated
          .setGenre('Software Engineering')
          .setFormat('Paperback') // Mutated
          .setLanguage('English')
          .setPublisher('Pearson') // Mutated
          .setSpecialEdition('Standard Edition') // Mutated
          .setPackaging('Cardboard Envelope') // Mutated
          .build(),
      )
      .build();

    await repository.update(updatedBook);

    // Verify changes applied perfectly
    const verifiedMutation = await repository.get(createdId);
    expect(verifiedMutation.getTitle()).toBe('Clean Code');
    expect(verifiedMutation.getAuthor()).toBe('Robert C. Martin');
    expect(verifiedMutation.getFormat()).toBe('Paperback');

    // Tear down clean-up via Repository Delete
    await repository.delete(createdId);

    // Ensure it is completely purged
    await expect(repository.get(createdId)).rejects.toThrow(
      ItemNotFoundException,
    );
  });

  // --- 2. TRANSACTION ROLLBACK EDGE CASE ---
  it('should successfully run an isolated transaction block, insert data, and ROLLBACK cleanly leaving no trace', async () => {
    const client = await pool.connect();
    const mockBook = createMockBook();

    try {
      await client.query('BEGIN');

      const insertQuery = `INSERT INTO ${tableName} (id, title, author, genre, format, language, publisher, specialEdition, packaging) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;

      await client.query(insertQuery, [
        mockBook.getId(),
        mockBook.getTitle(),
        mockBook.getAuthor(),
        mockBook.getGenre(),
        mockBook.getFormat(),
        mockBook.getLanguage(),
        mockBook.getPublisher(),
        mockBook.getSpecialEdition(),
        mockBook.getPackaging(),
      ]);

      const checkInsideTx = await client.query(
        `SELECT * FROM ${tableName} WHERE id = $1`,
        [mockBook.getId()],
      );
      expect(checkInsideTx.rowCount).toBe(1);
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }

    const checkOutsideTx = await pool.query(
      `SELECT * FROM ${tableName} WHERE id = $1`,
      [mockBook.getId()],
    );
    expect(checkOutsideTx.rowCount).toBe(0);
  });

  // --- 3. EXCEPTION HANDLING MOCK SPY EDGE CASES ---
  it('should throw an InitializationException when table creation fails', async () => {
    const querySpy = jest.spyOn(pool, 'query').mockImplementationOnce(() => {
      throw new Error('Schema modification permission denied');
    });

    const brokenRepo = new BookRepository();
    await expect(brokenRepo.init()).rejects.toThrow(InitializationException);
    querySpy.mockRestore();
  });

  it('should throw a DbException when the database fails to execute an INSERT query', async () => {
    const querySpy = jest.spyOn(pool, 'query').mockImplementationOnce(() => {
      throw new Error('Foreign key constraint violation');
    });

    const mockBook = createMockBook();
    await expect(repository.create(mockBook)).rejects.toThrow(DbException);
    querySpy.mockRestore();
  });

  it('should return an empty array [] when no records exist', async () => {
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
    querySpy.mockRestore();
  });

  it('should throw a DbException when the SELECT ALL query fails', async () => {
    const querySpy = jest.spyOn(pool, 'query').mockImplementationOnce(() => {
      throw new Error('Connection timeout');
    });

    await expect(repository.getAll()).rejects.toThrow(DbException);
    querySpy.mockRestore();
  });

  it('should throw a DbException when an UPDATE query fails', async () => {
    const querySpy = jest.spyOn(pool, 'query').mockImplementationOnce(() => {
      throw new Error('Database locked');
    });

    const mockBook = createMockBook();
    await expect(repository.update(mockBook)).rejects.toThrow(DbException);
    querySpy.mockRestore();
  });

  // --- 4. MISSING IDENTITY EDGE CASES ---
  it('should throw an ItemNotFoundException when retrieving a non-existent tracking identity', async () => {
    await expect(repository.get('MISSING_BOOK_ID')).rejects.toThrow(
      ItemNotFoundException,
    );
  });

  it('should throw an ItemNotFoundException when attempting to delete a missing record', async () => {
    await expect(repository.delete('MISSING_BOOK_ID')).rejects.toThrow(
      ItemNotFoundException,
    );
  });
  it('should throw a DbException when attempting to insert a duplicate entry with an identical ID', async () => {
    const mockBook = createMockBook();

    // 1. First insertion succeeds perfectly
    await repository.create(mockBook);

    // 2. Second insertion with the EXACT SAME object (same ID) must fail and throw a DbException
    await expect(repository.create(mockBook)).rejects.toThrow(DbException);

    // Clean up the entry from the database so it doesn't leak into subsequent tests
    await repository.delete(mockBook.getId());
  });
  it('should throw a DbException when a required field contains a null value, violating database constraints', async () => {
    const mockBook = createMockBook();

    // Force a required field to be null by bypassing TypeScript validation via "any"
    const badBookData = mockBook as any;
    badBookData.getTitle = () => null; // Mutate getter to return null

    // The database will intercept this null title and reject it, forcing our catch block
    await expect(repository.create(badBookData)).rejects.toThrow(DbException);
  });
});
