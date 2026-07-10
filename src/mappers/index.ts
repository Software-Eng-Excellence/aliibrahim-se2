import { ItemCategory } from '../model/IItem';
import { JsonRequestCakeMapper } from './Cake.mapper';
import { IMapper } from './IMapper';
import { JsonRequestOrderMapper } from './Order.mapper';

export class JsonRequestFactory {
  public static create(type: string): IMapper<any, any> {
    switch (type) {
      case ItemCategory.CAKE:
        return new JsonRequestOrderMapper(new JsonRequestCakeMapper());
      default:
        throw new Error(`No mapper found for type: ${type}`);
    }
  }
}
