import { item } from './Item.model';

export interface Order {
  getItem(): item;
  getPrice(): number;
  getQuantity(): number;
  getId(): string;
}
