import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

export const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/cinema_db',
  max: 10,
  idleTimeoutMillis: 30000,
});
