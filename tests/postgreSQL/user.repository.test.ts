import { UserRepository } from '../../src/repository/postgresql/User.repository';
import { ConnectionManager } from '../../src/repository/postgresql/ConnectionManager';
import { UserBuilder } from '../../src/model/builders/User.builder';
import {
  DbException,
  DuplicateItemException,
  InitializationException,
  ItemNotFoundException,
} from '../../src/util/exceptions/repostiroyException';

// These tests hit a real Postgres database (DATABASE_URL) and are skipped
// in CI, where no such database is available; run them locally with a .env.
const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

describeIfDb('UserRepository - PostgreSQL Integration Tests', () => {
  let repository: UserRepository;
  let pool: ReturnType<typeof ConnectionManager.getPool>;
  const createdIds: string[] = [];

  beforeAll(async () => {
    pool = ConnectionManager.getPool();
    repository = new UserRepository();
    await repository.init();
  });

  afterAll(async () => {
    for (const id of createdIds) {
      await pool.query('DELETE FROM users WHERE id = $1', [id]).catch(() => {});
    }
    await pool.end();
  });

  function createMockUser(overrides?: { id?: string; email?: string }) {
    const email = overrides?.email ?? `jane.${Date.now()}.${Math.random()}@example.com`;
    return UserBuilder.newBuilder()
      .setId(overrides?.id as string)
      .setName('Jane Doe')
      .setEmail(email)
      .setPassword('hashed-password')
      .build();
  }

  it('should handle full lifecycle creation, updates, and retrieval', async () => {
    const mockUser = createMockUser();
    createdIds.push(mockUser.getId());

    const createdId = await repository.create(mockUser);
    expect(createdId).toBe(mockUser.getId());

    const fetchedUser = await repository.get(createdId);
    expect(fetchedUser.getId()).toBe(createdId);
    expect(fetchedUser.getEmail()).toBe(mockUser.getEmail());

    const allUsers = await repository.getAll();
    expect(allUsers.length).toBeGreaterThanOrEqual(1);

    const updatedUser = UserBuilder.newBuilder()
      .setId(createdId)
      .setName('Jane Updated')
      .setEmail(mockUser.getEmail())
      .setPassword('new-hashed-password')
      .build();

    await repository.update(updatedUser);

    const verifiedMutation = await repository.get(createdId);
    expect(verifiedMutation.getName()).toBe('Jane Updated');
    expect(verifiedMutation.getPassword()).toBe('new-hashed-password');

    await repository.delete(createdId);

    await expect(repository.get(createdId)).rejects.toThrow(
      ItemNotFoundException,
    );
  });

  it('should throw a DuplicateItemException when creating a user with a duplicate email', async () => {
    const email = `duplicate.${Date.now()}@example.com`;
    const firstUser = createMockUser({ email });
    createdIds.push(firstUser.getId());
    await repository.create(firstUser);

    const secondUser = createMockUser({ email });
    createdIds.push(secondUser.getId());

    await expect(repository.create(secondUser)).rejects.toThrow(
      DuplicateItemException,
    );
  });

  it('should throw an ItemNotFoundException when retrieving a non-existent user', async () => {
    await expect(repository.get('NON_EXISTENT_ID_99X')).rejects.toThrow(
      ItemNotFoundException,
    );
  });

  it('should throw an ItemNotFoundException when deleting a non-existent user', async () => {
    await expect(repository.delete('PURGE_FAIL_88Y')).rejects.toThrow(
      ItemNotFoundException,
    );
  });

  it('should throw an ItemNotFoundException when updating a non-existent user', async () => {
    const nonExistentUser = createMockUser({ id: 'PURGE_FAIL_88Y' });

    await expect(repository.update(nonExistentUser)).rejects.toThrow(
      ItemNotFoundException,
    );
  });

  it('should throw an InitializationException when the table creation query fails', async () => {
    const querySpy = jest.spyOn(pool, 'query').mockImplementationOnce(() => {
      throw new Error('Database connection failure');
    });
    const faultRepository = new UserRepository();

    await expect(faultRepository.init()).rejects.toThrow(
      InitializationException,
    );

    querySpy.mockRestore();
  });

  it('should throw a DbException when the INSERT query fails', async () => {
    const querySpy = jest.spyOn(pool, 'query').mockImplementationOnce(() => {
      throw new Error('Deadlock detected');
    });
    const mockUser = createMockUser();

    await expect(repository.create(mockUser)).rejects.toThrow(DbException);

    querySpy.mockRestore();
  });

  it('should return an empty array when no users are stored', async () => {
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
      throw new Error('Table corrupted');
    });

    await expect(repository.getAll()).rejects.toThrow(DbException);

    querySpy.mockRestore();
  });

  it('should throw a DbException when the UPDATE query fails on the database side', async () => {
    const querySpy = jest.spyOn(pool, 'query').mockImplementationOnce(() => {
      throw new Error('Disk full');
    });
    const mockUser = createMockUser();

    await expect(repository.update(mockUser)).rejects.toThrow(DbException);

    querySpy.mockRestore();
  });
});
