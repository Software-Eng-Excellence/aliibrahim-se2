import { PostgresUser, PostgresUserMapper } from '../../mappers/User.mapper';
import { User } from '../../model/User.model';
import {
  DbException,
  DuplicateItemException,
  InitializationException,
  ItemNotFoundException,
} from '../../util/exceptions/repostiroyException';
import logger from '../../util/logger';
import { id, Initializable, IRepository } from '../IRepository';
import { ConnectionManager } from './ConnectionManager';

const tableName = 'users';
const UNIQUE_VIOLATION = '23505';

const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS ${tableName} (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);`;
const INSERT_USER = `INSERT INTO ${tableName} (id, name, email, password) VALUES ($1, $2, $3, $4)`;
const SELECT_BY_ID = `SELECT id, name, email, password FROM ${tableName} WHERE id = $1`;
const SELECT_ALL = `SELECT id, name, email, password FROM ${tableName}`;
const DELETE = `DELETE FROM ${tableName} WHERE id = $1`;
const UPDATE_ID = `UPDATE ${tableName} SET name = $1, email = $2, password = $3 WHERE id = $4`;

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === UNIQUE_VIOLATION
  );
}

export class UserRepository implements IRepository<User>, Initializable {
  async init(): Promise<void> {
    try {
      const conn = await ConnectionManager.getPool();
      await conn.query(CREATE_TABLE);
      logger.info('Users table initialized');
    } catch (error: unknown) {
      logger.error('Failed to initialize users table: %o', error);
      throw new InitializationException(
        'InitializationException: Failed to initialize users table',
        error as Error,
      );
    }
  }
  async create(item: User): Promise<id> {
    try {
      const conn = await ConnectionManager.getPool();
      await conn.query(INSERT_USER, [
        item.getId(),
        item.getName(),
        item.getEmail(),
        item.getPassword(),
      ]);
      return item.getId();
    } catch (error: unknown) {
      if (isUniqueViolation(error)) {
        logger.error('User with email %s already exists', item.getEmail());
        throw new DuplicateItemException(
          `User with email ${item.getEmail()} already exists`,
        );
      }
      logger.error('Failed to create user: %o', error);
      throw new DbException('Failed to create user', error as Error);
    }
  }
  async get(id: id): Promise<User> {
    try {
      const conn = await ConnectionManager.getPool();
      const result = await conn.query<PostgresUser>(SELECT_BY_ID, [id]);
      if (!result || result.rowCount === 0) {
        logger.error('User not found with id: %s', id);
        throw new ItemNotFoundException(`User not found with id: ${id}`);
      }
      logger.info('User retrieved with id: %s', id);
      return new PostgresUserMapper().map(result.rows[0]);
    } catch (error: unknown) {
      if (error instanceof ItemNotFoundException) throw error;
      logger.error('Failed to get user with id: %s, error: %o', id, error);
      throw new DbException('Failed to get user', error as Error);
    }
  }
  async getAll(): Promise<User[]> {
    try {
      const conn = await ConnectionManager.getPool();
      const result = await conn.query<PostgresUser>(SELECT_ALL);
      if (!result || result.rowCount === 0) {
        return [];
      }
      logger.info('Retrieved all users');
      return result.rows.map((row) => new PostgresUserMapper().map(row));
    } catch (error: unknown) {
      logger.error('Failed to get all users: %o', error);
      throw new DbException('Failed to get all users', error as Error);
    }
  }
  async update(item: User): Promise<void> {
    try {
      const conn = await ConnectionManager.getPool();
      const result = await conn.query(UPDATE_ID, [
        item.getName(),
        item.getEmail(),
        item.getPassword(),
        item.getId(),
      ]);
      if (result.rowCount === 0) {
        logger.error('User not found with id: %s', item.getId());
        throw new ItemNotFoundException(
          `User not found with id: ${item.getId()}`,
        );
      }
      logger.info('User updated with id: %s', item.getId());
    } catch (error: unknown) {
      if (error instanceof ItemNotFoundException) throw error;
      if (isUniqueViolation(error)) {
        logger.error('User with email %s already exists', item.getEmail());
        throw new DuplicateItemException(
          `User with email ${item.getEmail()} already exists`,
        );
      }
      logger.error(
        'Failed to update user with id: %s, error: %o',
        item.getId(),
        error,
      );
      throw new DbException('Failed to update user', error as Error);
    }
  }
  async delete(id: id): Promise<void> {
    try {
      const conn = await ConnectionManager.getPool();
      const result = await conn.query(DELETE, [id]);
      if (result.rowCount === 0) {
        logger.error('User not found with id: %s', id);
        throw new ItemNotFoundException(`User not found with id: ${id}`);
      }
      logger.info('User deleted with id: %s', id);
    } catch (error: unknown) {
      if (error instanceof ItemNotFoundException) throw error;
      logger.error('Failed to delete user with id: %s, error: %o', id, error);
      throw new DbException('Failed to delete user', error as Error);
    }
  }
}
