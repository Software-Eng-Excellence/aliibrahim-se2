import dotenv from 'dotenv';
import path from 'path';
import { DBMode } from './types';
dotenv.config({ path: path.join(__dirname, '../../.env') });
import { StringValue } from 'ms';
export default {
  logDir: process.env.LOG_DIR || './logs',
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
  storagePath: {
    csv: {
      cakes: 'src/data/cake orders.csv',
    },
    sqlite: 'src/data/orders.db',
  },
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  host: process.env.HOST || 'localhost',
  dbMode: DBMode.POSTGRES, // Change this to DBMode.SQLITE or DBMode.FILE as needed
  auth: {
    secretKey: process.env.JWT_SECRET || 'secret_1234567890',
    tokenExpiry: (process.env.JWT_EXPIRY || '15m') as StringValue, // Token expiry time
    refreshTokenExpiry: (process.env.JWT_REFRESH_EXPIRY || '7d') as StringValue, // Refresh token expiry time
  },
};
