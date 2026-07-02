import {
  RepositoryFactory,
  DBMode,
} from '../../src/repository/Repository.factory';
import { ItemCategory } from '../../src/model/IItem';
import { OrderRepository as PostgresOrderRepository } from '../../src/repository/postgresql/Order.repository';

describe('RepositoryFactory - PostgreSQL', () => {
  const categories = [ItemCategory.CAKE, ItemCategory.BOOK, ItemCategory.TOY];

  categories.forEach((category) => {
    it(`should return an initialized PostgresOrderRepository for ${category}`, async () => {
      const repo = await RepositoryFactory.create(DBMode.POSTGRES, category);
      expect(repo).toBeInstanceOf(PostgresOrderRepository);
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
