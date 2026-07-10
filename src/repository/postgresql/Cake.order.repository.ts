import { PostgresCake, PostgresCakeMapper } from '../../mappers/Cake.mapper';
import { IdentifiableCake } from '../../model/Cake.model';
import { ItemCategory } from '../../model/IItem';
import {
  DbException,
  InitializationException,
  ItemNotFoundException,
} from '../../util/exceptions/repostiroyException';
import logger from '../../util/logger';
import { id, Initializable, IRepository } from '../IRepository';
import { ConnectionManager } from './ConnectionManager';
const tableName = ItemCategory.CAKE;
const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS ${tableName} (
    id VARCHAR(255) PRIMARY KEY,
    type VARCHAR(255) NOT NULL,
    flavor VARCHAR(255) NOT NULL,
    filling VARCHAR(255) NOT NULL,
    size INTEGER NOT NULL,
    layers INTEGER NOT NULL,
    frostingType VARCHAR(255) NOT NULL,
    frostingFlavor VARCHAR(255) NOT NULL,
    decorationType VARCHAR(255) NOT NULL,
    decorationColor VARCHAR(255) NOT NULL,
    customMessage TEXT NOT NULL,
    shape VARCHAR(255) NOT NULL,
    allergies TEXT NOT NULL,
    specialIngredients TEXT NOT NULL,
    packagingType VARCHAR(255) NOT NULL
);`;
const INSERT_CAKE = `INSERT INTO ${tableName} (id, type, flavor, filling, size, layers, frostingType, frostingFlavor, decorationType, decorationColor, customMessage, shape, allergies, specialIngredients, packagingType) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`;
const SELECT_BY_ID = `
  SELECT 
    id, type, flavor, filling, size, layers,
    frostingType ,
    frostingFlavor,
    decorationType  ,
    decorationColor  ,
    customMessage ,
    shape, allergies,
    specialIngredients,
    packagingType 
  FROM ${tableName} 
  WHERE id = $1
`;
const SELECT_ALL = `
  SELECT 
    id, type, flavor, filling, size, layers,
    frostingType ,
    frostingFlavor ,
    decorationType ,
    decorationColor ,
    customMessage ,
    shape, allergies,
    specialIngredients ,
    packagingType 
  FROM ${tableName} 

`;
const DELETE = `DELETE FROM ${tableName} WHERE id = $1`;
const UPDATE_ID = `UPDATE ${tableName} SET type = $1, flavor = $2, filling = $3, size = $4, layers = $5, frostingType = $6, frostingFlavor = $7, decorationType = $8, decorationColor = $9, customMessage = $10, shape = $11, allergies = $12, specialIngredients = $13, packagingType = $14 WHERE id = $15`;
export class CakeRepository
  implements IRepository<IdentifiableCake>, Initializable
{
  async init(): Promise<void> {
    try {
      const conn = await ConnectionManager.getPool();
      await conn.query(CREATE_TABLE);
      logger.info('Cakes table initialized');
    } catch (error: unknown) {
      logger.error('Failed to initialize cakes table: %o', error);
      throw new InitializationException(
        'InitializationException: Failed to initialize cakes table',
        error as Error,
      );
    }
  }
  async create(item: IdentifiableCake): Promise<id> {
    try {
      const conn = await ConnectionManager.getPool();
      await conn.query(INSERT_CAKE, [
        item.getId(),
        item.getType(),
        item.getFlavor(),
        item.getFilling(),
        item.getSize(),
        item.getLayers(),
        item.getFrostingType(),
        item.getFrostingFlavor(),
        item.getDecorationType(),
        item.getDecorationColor(),
        item.getCustomMessage(),
        item.getShape(),
        item.getAllergies(),
        item.getSpecialIngredients(),
        item.getPackagingType(),
      ]);
      return item.getId();
    } catch (error: unknown) {
      logger.error('Failed to create cake: %o', error);
      throw new DbException('Failed to create cake', error as Error);
    }
  }
  async get(id: id): Promise<IdentifiableCake> {
    try {
      const conn = await ConnectionManager.getPool();
      const result = await conn.query<PostgresCake>(SELECT_BY_ID, [id]);
      if (!result || result.rowCount === 0) {
        logger.error('Cake not found with id: %s', id);
        throw new ItemNotFoundException(`Cake not found with id: ${id}`);
      }
      logger.info('Cake retrieved with id: %s', id);
      return new PostgresCakeMapper().map(result.rows[0]);
    } catch (error: unknown) {
      if (error instanceof ItemNotFoundException) throw error;
      logger.error('Failed to get cake with id: %s, error: %o', id, error);
      throw new DbException('Failed to get cake', error as Error);
    }
  }
  async getAll(): Promise<IdentifiableCake[]> {
    try {
      const conn = await ConnectionManager.getPool();
      const result = await conn.query<PostgresCake>(SELECT_ALL);
      if (!result || result.rowCount === 0) {
        return [];
      }
      logger.info('Retrieved all cakes: %o', result.rows);
      return result.rows.map((row) => new PostgresCakeMapper().map(row));
    } catch (error: unknown) {
      logger.error('Failed to get all cakes: %o', error);
      throw new DbException('Failed to get all cakes', error as Error);
    }
  }
  async update(item: IdentifiableCake): Promise<void> {
    try {
      const conn = await ConnectionManager.getPool();
      await conn.query(UPDATE_ID, [
        item.getType(),
        item.getFlavor(),
        item.getFilling(),
        item.getSize(),
        item.getLayers(),
        item.getFrostingType(),
        item.getFrostingFlavor(),
        item.getDecorationType(),
        item.getDecorationColor(),
        item.getCustomMessage(),
        item.getShape(),
        item.getAllergies(),
        item.getSpecialIngredients(),
        item.getPackagingType(),
        item.getId(),
      ]);
    } catch (error: unknown) {
      logger.error(
        'Failed to update cake with id: %s, error: %o',
        item.getId(),
        error,
      );
      throw new DbException('Failed to update cake', error as Error);
    }
  }
  async delete(id: id): Promise<void> {
    try {
      const conn = await ConnectionManager.getPool();
      const result = await conn.query(DELETE, [id]);
      if (result.rowCount === 0) {
        logger.error('Cake not found with id: %s', id);
        throw new ItemNotFoundException(`Cake not found with id: ${id}`);
      }
      logger.info('Cake deleted with id: %s', id);
    } catch (error: unknown) {
      if (error instanceof ItemNotFoundException) throw error;
      logger.error('Failed to delete cake with id: %s, error: %o', id, error);
      throw new DbException('Failed to delete cake', error as Error);
    }
  }
}
