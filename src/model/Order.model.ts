import { IItem } from './Item.model';
import { IOrder } from './IOrder';
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
