import { IItem } from './Item.model';

export interface IOrder {
  getItem(): IItem;
  getPrice(): number;
  getQuantity(): number;
  getId(): string;
}
