import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

export class ConnectionManager {
  private static pool: Pool;
  public static getPool(): Pool {
    if (!this.pool) {
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is not defined');
      }
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });
    }
    return this.pool;
  }
}
