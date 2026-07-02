import { ItemCategory } from '../model/IItem';
import { PostgresBookMapper } from './Book.mapper';
import { PostgresCakeMapper } from './Cake.mapper';
import { IMapper } from './IMapper';
import { PostgresToyMapper } from './Toy.mapper';

export class MapperFactory {
  public static create(category: ItemCategory): IMapper<any, any> {
    let mapper: IMapper<any, any>;
    switch (category) {
      case ItemCategory.CAKE:
        mapper = new PostgresCakeMapper();
        break;
      case ItemCategory.BOOK:
        mapper = new PostgresBookMapper();
        break;
      case ItemCategory.TOY:
        mapper = new PostgresToyMapper();
        break;
      default:
        throw new Error('Unsupported mapper category');
    }

    return mapper;
  }
}
