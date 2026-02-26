import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function setup() {
  // Connect without a database to create it
  const adminPool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: 'postgres',
  });

  try {
    const dbName = process.env.DB_NAME || 'survivor50';
    const res = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1", [dbName]
    );
    if (res.rows.length === 0) {
      await adminPool.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database "${dbName}" created successfully`);
    } else {
      console.log(`Database "${dbName}" already exists`);
    }
  } catch (err) {
    console.error('Database setup failed:', err);
  } finally {
    await adminPool.end();
  }
}

setup();
