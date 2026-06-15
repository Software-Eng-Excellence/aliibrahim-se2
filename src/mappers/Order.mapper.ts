import { IMapper } from './IMapper';
import { IOrder } from '../model/IOrder';
import { OrderBuilder } from '../model/builders/Order.builder';
import { IItem } from '../model/Item.model';
import { CSVCakeMapper } from './Cake.mapper';
export class CSVOrderMapper implements IMapper<string[], IOrder> {
  constructor(private itemMapper: IMapper<string[], IItem>) {}

  map(data: string[]): IOrder {
    const item: IItem = this.itemMapper.map(data);
    return OrderBuilder.newBuilder()
      .setId(data[0])
      .setQuantity(parseInt(data[data.length - 1]))
      .setPrice(parseFloat(data[data.length - 2]))
      .setItem(item)
      .build();
  }
  reverse(data: IOrder): string[] {
    return [
      data.getId(),
      ...this.itemMapper.reverse(data.getItem()),
      data.getPrice().toString(),
      data.getQuantity().toString(),
    ];
  }
}
