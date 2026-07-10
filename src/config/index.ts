import dotenv from 'dotenv';
import path from 'path';
import { DBMode } from './types';
dotenv.config({ path: path.join(__dirname, '../../.env') });

export default {
  logDir: process.env.LOG_DIR || './logs',
  isDev: process.env.NODE_ENV === 'development',
  storagePath: {
    csv: {
      cakes: 'src/data/cake orders.csv',
    },
    sqlite: 'src/data/orders.db',
  },
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  host: process.env.HOST || 'localhost',
  dbMode: DBMode.POSTGRES, // Change this to DBMode.SQLITE or DBMode.FILE as needed
};
