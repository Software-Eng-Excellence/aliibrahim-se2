import { RepositoryFactory } from '../../src/repository/Repository.factory';
import { ItemCategory } from '../../src/model/IItem';
import { OrderRepository as PostgresOrderRepository } from '../../src/repository/postgresql/Order.repository';
import { DBMode } from '../../src/config/types';

describe('RepositoryFactory - PostgreSQL', () => {
  const categories = [ItemCategory.CAKE, ItemCategory.BOOK, ItemCategory.TOY];

  // These cases spin up a real PostgresOrderRepository against DATABASE_URL;
  // skip in CI, where no database is available, and run them locally with a .env.
  const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

  describeIfDb('with a live database', () => {
    categories.forEach((category) => {
      it(`should return an initialized PostgresOrderRepository for ${category}`, async () => {
        const repo = await RepositoryFactory.create(DBMode.POSTGRES, category);
        expect(repo).toBeInstanceOf(PostgresOrderRepository);
      });
    });
  });

  it('should throw an error for an unsupported category', async () => {
    await expect(
      RepositoryFactory.create(DBMode.POSTGRES, 'INVALID' as ItemCategory),
    ).rejects.toThrow('Unsupported category for PostgreSQL storage');
  });
  it('should throw an error for an unsupported DBMode', async () => {
    await expect(
      RepositoryFactory.create(999 as DBMode, ItemCategory.CAKE),
    ).rejects.toThrow('Invalid DBMode');
  });
});
