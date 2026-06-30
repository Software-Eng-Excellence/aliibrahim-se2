import { IIdentifiableItem, IItem } from './IItem';
import { IIdentifiableOrderItem, IOrder } from './IOrder';
export class Order implements IOrder {
  private id: string;
  private item: IItem;
  private price: number;
  private quantity: number;

  constructor(data: {
    id: string;
    item: IItem;
    price: number;
    quantity: number;
  }) {
    this.id = data.id;
    this.item = data.item;
    this.price = data.price;
    this.quantity = data.quantity;
  }

  getItem(): IItem {
    return this.item;
  }

  getPrice(): number {
    return this.price;
  }

  getQuantity(): number {
    return this.quantity;
  }

  getId(): string {
    return this.id;
  }
}

export class IdentifiableOrderItem implements IIdentifiableOrderItem {
  constructor(
    private fields: {
      id: string;
      item: IIdentifiableItem;
      price: number;
      quantity: number;
    },
  ) {}
  getPrice(): number {
    return this.fields.price;
  }
  getQuantity(): number {
    return this.fields.quantity;
  }
  getId(): string {
    return this.fields.id;
  }
  getItem(): IIdentifiableItem {
    return this.fields.item;
  }
}
