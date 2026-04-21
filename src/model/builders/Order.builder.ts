import { OrderValidator } from '../validators/Order.validator';
import { IItem } from '../Item.model';
import { Order } from '../Order.model';
export class OrderBuilder {
  private id!: string;
  private item!: IItem;
  private price!: number;
  private quantity!: number;
  setId(id: string): OrderBuilder {
    this.id = id;
    return this;
  }
  setItem(item: IItem): OrderBuilder {
    this.item = item;
    return this;
  }
  setPrice(price: number): OrderBuilder {
    this.price = price;
    return this;
  }
  setQuantity(quantity: number): OrderBuilder {
    this.quantity = quantity;
    return this;
  }
  public static newBuilder(): OrderBuilder {
    return new OrderBuilder();
  }
  build(): Order {
    const fields = {
      id: this.id,
      item: this.item,
      price: this.price,
      quantity: this.quantity,
    };
    OrderValidator.validate(fields);
    return new Order(fields);
  }
}
