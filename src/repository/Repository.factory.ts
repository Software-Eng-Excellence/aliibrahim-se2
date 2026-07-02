import config from '../config';
import { ItemCategory } from '../model/IItem';
import { IOrder } from '../model/IOrder';
import { CakeOrderRepository } from './file/Cake.order.repository';
import { Initializable, IRepository } from './IRepository';
import { CakeRepository } from './sqlite/Cake.order.repository';
import { OrderRepository } from './sqlite/Order.repository';
import { CakeRepository as PostgresCakeRepository } from './postgresql/Cake.order.repository';
import { OrderRepository as PostgresOrderRepository } from './postgresql/Order.repository';
import { BookRepository as PostgresBookRepository } from './postgresql/Book.order.repository';
import { ToyRepository as PostgresToyRepository } from './postgresql/Toy.order.repository';

export enum DBMode {
  SQLITE,
  FILE,
  POSTGRES,
}
export class RepositoryFactory {
  public static async create(
    model: DBMode,
    category: ItemCategory,
  ): Promise<IRepository<IOrder>> {
    switch (model) {
      case DBMode.SQLITE:
        let repository: IRepository<IOrder> & Initializable;
        switch (category) {
          case ItemCategory.CAKE:
            repository = new OrderRepository(new CakeRepository());
            break;

          default:
            throw new Error('Unsupported category for SQLite storage');
        }
        await repository.init();
        return repository;
      case DBMode.FILE:
        switch (category) {
          case ItemCategory.CAKE:
            return new CakeOrderRepository(config.storagePath.csv.cakes);

          default:
            throw new Error('Unsupported category for file storage');
        }

      case DBMode.POSTGRES:
        let pgRepository: IRepository<IOrder> & Initializable;
        switch (category) {
          case ItemCategory.CAKE:
            pgRepository = new PostgresOrderRepository(
              new PostgresCakeRepository(),
            );
            break;
          case ItemCategory.BOOK:
            pgRepository = new PostgresOrderRepository(
              new PostgresBookRepository(),
            );
            break;
          case ItemCategory.TOY:
            pgRepository = new PostgresOrderRepository(
              new PostgresToyRepository(),
            );
            break;
          default:
            throw new Error('Unsupported category for PostgreSQL storage');
        }

        await pgRepository.init();
        return pgRepository;
      default:
        throw new Error('Invalid DBMode');
    }
  }
}
