import { IMapper } from './IMapper';
import { IIdentifiableOrderItem, IOrder } from '../model/IOrder';
import {
  IdentifiableOrderItemBuilder,
  OrderBuilder,
} from '../model/builders/Order.builder';
import { IIdentifiableItem, IItem } from '../model/IItem';
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

export interface SQLiteOrder {
  id: string;
  price: number;
  category: string;
  quantity: number;
  item_id: string;
}
export class SQLiteOrderMapper implements IMapper<
  { data: SQLiteOrder; item: IIdentifiableItem },
  IIdentifiableOrderItem
> {
  static map: IIdentifiableOrderItem[] | PromiseLike<IIdentifiableOrderItem[]>;
  map({
    data,
    item,
  }: {
    data: SQLiteOrder;
    item: IIdentifiableItem;
  }): IIdentifiableOrderItem {
    const order = OrderBuilder.newBuilder()
      .setId(data.id)
      .setPrice(data.price)
      .setQuantity(data.quantity)
      .setItem(item)
      .build();
    return IdentifiableOrderItemBuilder.newBuilder()
      .setOrder(order)
      .setItem(item)
      .build();
  }
  reverse(data: IIdentifiableOrderItem): {
    data: SQLiteOrder;
    item: IIdentifiableItem;
  } {
    return {
      data: {
        id: data.getId(),
        price: data.getPrice(),
        quantity: data.getQuantity(),
        category: data.getItem().getCategory(),
        item_id: data.getItem().getId(),
      },
      item: data.getItem(),
    };
  }
}
export class PostgreSQLOrderMapper implements IMapper<
  { row: PostgreSQLOrder; item: IIdentifiableItem },
  IIdentifiableOrderItem
> {
  map(data: {
    row: PostgreSQLOrder;
    item: IIdentifiableItem;
  }): IIdentifiableOrderItem {
    const { row, item } = data;
    const order = OrderBuilder.newBuilder()
      .setId(row.id)
      .setPrice(row.price)
      .setQuantity(row.quantity)
      .setItem(item)
      .build();
    return IdentifiableOrderItemBuilder.newBuilder()
      .setOrder(order)
      .setItem(item)
      .build();
  }
  reverse(data: IIdentifiableOrderItem): {
    row: PostgreSQLOrder;
    item: IIdentifiableItem;
  } {
    return {
      row: {
        id: data.getId(),
        price: data.getPrice(),
        quantity: data.getQuantity(),
        category: data.getItem().getCategory(),
        item_id: data.getItem().getId(),
      },
      item: data.getItem(),
    };
  }
}
export interface PostgreSQLOrder {
  id: string;
  price: number;
  category: string;
  quantity: number;
  item_id: string;
}
