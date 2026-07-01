import { PostgresBook, PostgresBookMapper } from '../../mappers/Book.mapper';
import { IdentifiableBook } from '../../model/Book.model';
import { ItemCategory } from '../../model/IItem';
import {
  DbException,
  InitializationException,
  ItemNotFoundException,
} from '../../util/exceptions/repostiroyException';
import logger from '../../util/logger';
import { id, Initializable, IRepository } from '../IRepository';
import { ConnectionManager } from './ConnectionManager';

const tableName = ItemCategory.BOOK;

const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS ${tableName} (
   id VARCHAR(255) PRIMARY KEY,
   title VARCHAR(255) NOT NULL,
   author VARCHAR(255) NOT NULL,
   genre VARCHAR(255) NOT NULL,
   format VARCHAR(255) NOT NULL,
   language VARCHAR(255) NOT NULL,
   publisher VARCHAR(255) NOT NULL,
   specialEdition VARCHAR(255) NOT NULL,
   packaging VARCHAR(255) NOT NULL
);`;

const INSERT_BOOK = `INSERT INTO ${tableName} (id, title, author, genre, format, language, publisher, specialEdition, packaging) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;

const SELECT_BY_ID = `
  SELECT id, title, author, genre, format, language, publisher, specialEdition, packaging
  FROM ${tableName} 
  WHERE id = $1
`;

const SELECT_ALL = `
  SELECT id, title, author, genre, format, language, publisher, specialEdition, packaging
  FROM ${tableName} 
`;

const DELETE = `DELETE FROM ${tableName} WHERE id = $1`;

const UPDATE_ID = `UPDATE ${tableName} SET title = $1, author = $2, genre = $3, format = $4, language = $5, publisher = $6, specialEdition = $7, packaging = $8 WHERE id = $9`;

export class BookRepository
  implements IRepository<IdentifiableBook>, Initializable
{
  async init(): Promise<void> {
    try {
      const conn = await ConnectionManager.getPool();
      await conn.query(CREATE_TABLE);
      logger.info('Books table initialized');
    } catch (error: unknown) {
      logger.error('Failed to initialize books table: %o', error);
      throw new InitializationException(
        'InitializationException: Failed to initialize books table',
        error as Error,
      );
    }
  }

  async create(item: IdentifiableBook): Promise<id> {
    try {
      const conn = await ConnectionManager.getPool();
      // Aligned exactly with column ordering in INSERT_BOOK string
      await conn.query(INSERT_BOOK, [
        item.getId(),
        item.getTitle(),
        item.getAuthor(),
        item.getGenre(),
        item.getFormat(),
        item.getLanguage(),
        item.getPublisher(),
        item.getSpecialEdition(),
        item.getPackaging(),
      ]);
      return item.getId();
    } catch (error: unknown) {
      logger.error('Failed to create book: %o', error);
      throw new DbException('Failed to create book', error as Error);
    }
  }

  async get(id: id): Promise<IdentifiableBook> {
    try {
      const conn = await ConnectionManager.getPool();
      const result = await conn.query<PostgresBook>(SELECT_BY_ID, [id]);

      // Safe row availability check
      if (!result || result.rowCount === 0 || !result.rows[0]) {
        logger.error('Book not found with id: %s', id);
        throw new ItemNotFoundException(`Book not found with id: ${id}`);
      }

      logger.info('Book retrieved with id: %s', id);
      return new PostgresBookMapper().map(result.rows[0]);
    } catch (error: unknown) {
      if (error instanceof ItemNotFoundException) throw error;
      logger.error('Failed to get book with id: %s, error: %o', id, error);
      throw new DbException('Failed to get book', error as Error);
    }
  }

  async getAll(): Promise<IdentifiableBook[]> {
    try {
      const conn = await ConnectionManager.getPool();
      const result = await conn.query<PostgresBook>(SELECT_ALL);
      if (!result || result.rowCount === 0) {
        return [];
      }
      logger.info('Retrieved all books: %o', result.rows);

      return result.rows.map((row) => new PostgresBookMapper().map(row));
    } catch (error: unknown) {
      logger.error('Failed to get all books: %o', error);
      throw new DbException('Failed to get all books', error as Error);
    }
  }

  async update(item: IdentifiableBook): Promise<void> {
    try {
      const conn = await ConnectionManager.getPool();
      await conn.query(UPDATE_ID, [
        item.getTitle(),
        item.getAuthor(),
        item.getGenre(),
        item.getFormat(),
        item.getLanguage(),
        item.getPublisher(),
        item.getSpecialEdition(),
        item.getPackaging(),
        item.getId(),
      ]);
    } catch (error: unknown) {
      logger.error(
        'Failed to update book with id: %s, error: %o',
        item.getId(),
        error,
      );
      throw new DbException('Failed to update book', error as Error);
    }
  }

  async delete(id: id): Promise<void> {
    try {
      const conn = await ConnectionManager.getPool();
      const result = await conn.query(DELETE, [id]);
      if (result.rowCount === 0) {
        logger.error('Book not found with id: %s', id);
        throw new ItemNotFoundException(`Book not found with id: ${id}`);
      }
      logger.info('Book deleted with id: %s', id);
    } catch (error: unknown) {
      if (error instanceof ItemNotFoundException) throw error;
      logger.error('Failed to delete book with id: %s, error: %o', id, error);
      throw new DbException('Failed to delete book', error as Error);
    }
  }
}
