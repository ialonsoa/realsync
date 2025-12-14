import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config({ path: '../../../../.env' });

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'realsync',
  },
  pool: {
    min: 2,
    max: 10,
  },
});

export default db;
