import { v4 as uuidv4 } from 'uuid';
import { RepositoryFactory } from '../repository/Repository.factory';
import config from '../config';
import { ItemCategory } from '../model/IItem';
import { IIdentifiableOrderItem } from '../model/IOrder';
import { IRepository } from '../repository/IRepository';

export const generateUUID = (prefix?: string): string => {
  return prefix ? `${prefix}_${uuidv4()}` : uuidv4();
};

export const getRepo = async (
  category: ItemCategory,
): Promise<IRepository<IIdentifiableOrderItem>> => {
  return await RepositoryFactory.create(config.dbMode, category);
};
