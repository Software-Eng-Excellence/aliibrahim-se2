import { PostgresToy, PostgresToyMapper } from '../../mappers/Toy.mapper';
import { IdentifiableToy } from '../../model/Toy.model';
import { ItemCategory } from '../../model/IItem';
import {
  DbException,
  InitializationException,
  ItemNotFoundException,
} from '../../util/exceptions/repostiroyException';
import logger from '../../util/logger';
import { id, Initializable, IRepository } from '../IRepository';
import { ConnectionManager } from './ConnectionManager';

const tableName = ItemCategory.TOY;

const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS ${tableName} (
   id VARCHAR(255) PRIMARY KEY,
   toytype VARCHAR(255) NOT NULL,
   agegroup VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    material VARCHAR(255) NOT NULL,
    batteryrequired BOOLEAN NOT NULL,
    educational BOOLEAN NOT NULL
);`;

const INSERT_TOY = `INSERT INTO ${tableName} (id, toytype, agegroup, brand, material, batteryrequired, educational) VALUES ($1, $2, $3, $4, $5, $6, $7)`;

const SELECT_BY_ID = `
  SELECT id, toytype, agegroup, brand, material, batteryrequired, educational
  FROM ${tableName} 
  WHERE id = $1
`;

const SELECT_ALL = `
  SELECT id, toytype, agegroup, brand, material, batteryrequired, educational
  FROM ${tableName} 
`;

const DELETE = `DELETE FROM ${tableName} WHERE id = $1`;

const UPDATE_ID = `UPDATE ${tableName} SET toytype = $1, agegroup = $2, brand = $3, material = $4, batteryrequired = $5, educational = $6 WHERE id = $7`;

export class ToyRepository
  implements IRepository<IdentifiableToy>, Initializable
{
  async init(): Promise<void> {
    try {
      const conn = await ConnectionManager.getPool();
      await conn.query(CREATE_TABLE);
      logger.info('Toys table initialized');
    } catch (error: unknown) {
      logger.error('Failed to initialize toys table: %o', error);
      throw new InitializationException(
        'InitializationException: Failed to initialize toys table',
        error as Error,
      );
    }
  }

  async create(item: IdentifiableToy): Promise<id> {
    try {
      const conn = await ConnectionManager.getPool();
      // Aligned exactly with column ordering in INSERT_TOY string
      await conn.query(INSERT_TOY, [
        item.getId(),
        item.getToyType(),
        item.getAgeGroup(),
        item.getBrand(),
        item.getMaterial(),
        item.isBatteryRequired(),
        item.isEducational(),
      ]);
      return item.getId();
    } catch (error: unknown) {
      logger.error('Failed to create toy: %o', error);
      throw new DbException('Failed to create toy', error as Error);
    }
  }

  async get(id: id): Promise<IdentifiableToy> {
    try {
      const conn = await ConnectionManager.getPool();
      const result = await conn.query<PostgresToy>(SELECT_BY_ID, [id]);

      // Safe row availability check
      if (!result || result.rowCount === 0 || !result.rows[0]) {
        logger.error('Toy not found with id: %s', id);
        throw new ItemNotFoundException(`Toy not found with id: ${id}`);
      }

      logger.info('Toy retrieved with id: %s', id);
      return new PostgresToyMapper().map(result.rows[0]);
    } catch (error: unknown) {
      if (error instanceof ItemNotFoundException) throw error;
      logger.error('Failed to get toy with id: %s, error: %o', id, error);
      throw new DbException('Failed to get toy', error as Error);
    }
  }

  async getAll(): Promise<IdentifiableToy[]> {
    try {
      const conn = await ConnectionManager.getPool();
      const result = await conn.query<PostgresToy>(SELECT_ALL);
      if (!result || result.rowCount === 0) {
        return [];
      }
      logger.info('Retrieved all toys: %o', result.rows);

      return result.rows.map((row) => new PostgresToyMapper().map(row));
    } catch (error: unknown) {
      logger.error('Failed to get all toys: %o', error);
      throw new DbException('Failed to get all toys', error as Error);
    }
  }

  async update(item: IdentifiableToy): Promise<void> {
    try {
      const conn = await ConnectionManager.getPool();
      await conn.query(UPDATE_ID, [
        item.getToyType(),
        item.getAgeGroup(),
        item.getBrand(),
        item.getMaterial(),
        item.isBatteryRequired(),
        item.isEducational(),
        item.getId(),
      ]);
    } catch (error: unknown) {
      logger.error(
        'Failed to update toy with id: %s, error: %o',
        item.getId(),
        error,
      );
      throw new DbException('Failed to update toy', error as Error);
    }
  }

  async delete(id: id): Promise<void> {
    try {
      const conn = await ConnectionManager.getPool();
      const result = await conn.query(DELETE, [id]);
      if (result.rowCount === 0) {
        logger.error('Toy not found with id: %s', id);
        throw new ItemNotFoundException(`Toy not found with id: ${id}`);
      }
      logger.info('Toy deleted with id: %s', id);
    } catch (error: unknown) {
      if (error instanceof ItemNotFoundException) throw error;
      logger.error('Failed to delete toy with id: %s, error: %o', id, error);
      throw new DbException('Failed to delete toy', error as Error);
    }
  }
}
