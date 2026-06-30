import { OrderValidator } from '../validators/Order.validator';
import { IIdentifiableItem, IItem } from '../IItem';
import { IdentifiableOrderItem, Order } from '../Order.model';
import logger from '../../util/logger';
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

export class IdentifiableOrderItemBuilder {
  private order!: Order;
  private item!: IIdentifiableItem;

  static newBuilder(): IdentifiableOrderItemBuilder {
    return new IdentifiableOrderItemBuilder();
  }

  setItem(item: IIdentifiableItem): IdentifiableOrderItemBuilder {
    this.item = item;
    return this;
  }
  setOrder(order: Order): IdentifiableOrderItemBuilder {
    this.order = order;
    return this;
  }

  build(): IdentifiableOrderItem {
    if (!this.order || !this.item) {
      logger.error(
        'Order and Item must be set before building IdentifiableOrderItem',
      );
      throw new Error(
        'Order and Item must be set before building IdentifiableOrderItem',
      );
    }
    const fields = {
      id: this.order.getId(),
      item: this.item,
      price: this.order.getPrice(),
      quantity: this.order.getQuantity(),
    };
    OrderValidator.validate(fields);
    return new IdentifiableOrderItem(fields);
  }
}
