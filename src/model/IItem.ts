import { ID } from '../repository/IRepository';

export interface IItem {
  getCategory(): ItemCategory;
}
export interface IIdentifiableItem extends ID, IItem {}
export enum ItemCategory {
  CAKE = 'cake',
  BOOK = 'book',
  TOY = 'toy',
}
