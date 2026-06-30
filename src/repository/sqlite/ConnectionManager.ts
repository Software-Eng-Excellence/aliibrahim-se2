import { Database, Statement } from 'sqlite3';
import { Database as SqliteDatabase, open } from 'sqlite';
import config from '../../config';
import { DataBaseConnectionException } from '../../util/exceptions/DatabaseConnectionException';
import logger from '../../util/logger';

export class ConnectionManager {
  private constructor() {}
  private static db: SqliteDatabase<Database, Statement> | null = null;
  public static async getConnection(): Promise<
    SqliteDatabase<Database, Statement>
  > {
    new ConnectionManager();
    if (!this.db) {
      try {
        this.db = await open({
          filename: config.storagePath.sqlite,
          driver: Database,
        });
      } catch (error: unknown) {
        logger.error('Failed to get database connection: %o', error);
        throw new DataBaseConnectionException(
          'Failed to get database connection:',
          error as Error,
        );
      }
    }
    return this.db;
  }
  // get instance() returns a db connection instance the same instance gets called every time
}
