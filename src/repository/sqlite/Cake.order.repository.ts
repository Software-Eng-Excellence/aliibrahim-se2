import { SQLiteCake, SQLiteCakeMapper } from '../../mappers/Cake.mapper';
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
      id TEXT PRIMARY KEY ,
      type TEXT NOT NULL,
        flavor TEXT NOT NULL,
        filling TEXT NOT NULL,
        size INTEGER NOT NULL,
        layers INTEGER NOT NULL,
        frostingType TEXT NOT NULL,
        frostingFlavor TEXT NOT NULL,
        decorationType TEXT NOT NULL,
        decorationColor TEXT NOT NULL,
        customMessage TEXT NOT NULL,
        shape TEXT NOT NULL,
        allergies TEXT NOT NULL,
        specialIngredients TEXT NOT NULL,
        packagingType TEXT NOT NULL
    );`;
const INSERT_CAKE = `INSERT INTO ${tableName} (id, type, flavor, filling, size, layers, frostingType, frostingFlavor, decorationType, decorationColor, customMessage, shape, allergies, specialIngredients, packagingType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
const SELECT_BY_ID = `SELECT * FROM ${tableName} WHERE id = ?`;
const SELECT_ALL = `SELECT * FROM ${tableName}`;
const Delete = `DELETE FROM ${tableName} WHERE id = ?`;
const UPDATE_ID = `UPDATE ${tableName} SET type = ?, flavor = ?, filling = ?, size = ?, layers = ?, frostingType = ?, frostingFlavor = ?, decorationType = ?, decorationColor = ?, customMessage = ?, shape = ?, allergies = ?, specialIngredients = ?, packagingType = ? WHERE id = ?`;
export class CakeRepository
  implements IRepository<IdentifiableCake>, Initializable
{
  async init() {
    try {
      const conn = await ConnectionManager.getConnection();
      await conn.exec(CREATE_TABLE);
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
    // it is expected that the transaction has been initialized before calling this method, so we don't start a transaction here
    try {
      const conn = await ConnectionManager.getConnection();
      await conn.run(INSERT_CAKE, [
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
      logger.error('Failed to create cake: %o', error as Error);
      throw new DbException('Failed to create cake', error as Error);
    }
  }
  async get(id: id): Promise<IdentifiableCake> {
    try {
      const conn = await ConnectionManager.getConnection();
      const result = await conn.get<SQLiteCake>(SELECT_BY_ID, [id]);
      if (!result) {
        logger.error('Cake with id %s not found', id);
        throw new ItemNotFoundException(`Cake with id ${id} not found`);
      }
      logger.info('Cake of id %s retrieved: %o', id, result);
      return new SQLiteCakeMapper().map(result);
    } catch (error: unknown) {
      logger.error('Failed to get cake of id %s: %o', id, error as Error);
      throw new DbException('Failed to get cake of id %s' + id, error as Error);
    }
  }
  async getAll(): Promise<IdentifiableCake[]> {
    try {
      const conn = await ConnectionManager.getConnection();
      const rows = await conn.all<SQLiteCake[]>(SELECT_ALL);
      if (!rows || rows.length === 0) {
        return [];
      }
      logger.info('All cakes retrieved: %o', rows);
      return rows.map((cake) => new SQLiteCakeMapper().map(cake));
    } catch (error: unknown) {
      logger.error('Failed to get all cakes: %o', error as Error);
      throw new DbException('Failed to get all cakes', error as Error);
    }
  }
  async update(item: IdentifiableCake): Promise<void> {
    try {
      const conn = await ConnectionManager.getConnection();
      await conn.run(UPDATE_ID, [
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
      logger.error('Failed to update cake: %o', error as Error);
      throw new DbException('Failed to update cake', error as Error);
    }
  }
  async delete(id: id): Promise<void> {
    try {
      const conn = await ConnectionManager.getConnection();
      const result = await conn.run(Delete, [id]);
      if (result.changes === 0) {
        logger.error('Cake with id %s not found for deletion', id);
        throw new ItemNotFoundException(
          `Cake with id ${id} not found for deletion`,
        );
      }
      logger.info('Cake with id %s deleted successfully', id);
    } catch (error: unknown) {
      logger.error('Failed to delete cake of id %s: %o', id, error as Error);
      throw new DbException(
        'Failed to delete cake of id %s' + id,
        error as Error,
      );
    }
  }
}
