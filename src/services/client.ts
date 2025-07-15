import { Client } from 'pg';

export const dbClient = new Client({
  connectionString: process.env.DATABASE_URL,
});