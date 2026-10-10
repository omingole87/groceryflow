import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { PGlite } from '@electric-sql/pglite';
import { config } from '../config/env.js';

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

export interface TransactionClient {
  query: <T = any>(sql: string, params?: any[]) => Promise<QueryResult<T>>;
}

class Database {
  private pgPool: pg.Pool | null = null;
  private pglite: PGlite | null = null;
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;

    if (config.databaseUrl) {
      console.log('[DB] Connecting to PostgreSQL at:', config.databaseUrl.replace(/:[^:]*@/, ':****@'));
      this.pgPool = new pg.Pool({ connectionString: config.databaseUrl });
      await this.pgPool.query('SELECT 1');
      console.log('[DB] PostgreSQL pool connected successfully.');
    } else {
      console.log('[DB] No DATABASE_URL provided. Initializing embedded persistent PostgreSQL (PGlite)...');
      fs.mkdirSync(config.dataPath, { recursive: true });
      this.pglite = new PGlite(config.dataPath);
      console.log('[DB] PGlite storage initialized at:', config.dataPath);
    }

    await this.applySchema();
    this.isInitialized = true;
  }

  async applySchema(): Promise<void> {
    const schemaPath = path.resolve(import.meta.dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    if (this.pgPool) {
      await this.pgPool.query(schemaSql);
    } else if (this.pglite) {
      await this.pglite.exec(schemaSql);
    }
    console.log('[DB] Database schema verified & applied.');
  }

  async query<T = any>(text: string, params: any[] = []): Promise<QueryResult<T>> {
    await this.init();

    // Serialize object/array params to JSON strings for JSONB columns if needed
    const normalizedParams = params.map((p) => {
      if (p !== null && typeof p === 'object' && !(p instanceof Date)) {
        return JSON.stringify(p);
      }
      return p;
    });

    if (this.pgPool) {
      const res = await this.pgPool.query(text, normalizedParams);
      return { rows: res.rows as T[], rowCount: res.rowCount ?? 0 };
    } else if (this.pglite) {
      const res = await this.pglite.query(text, normalizedParams);
      return { rows: res.rows as T[], rowCount: (res.rows ? res.rows.length : 0) };
    }
    throw new Error('Database not initialized');
  }

  async exec(sql: string): Promise<void> {
    await this.init();
    if (this.pgPool) {
      await this.pgPool.query(sql);
    } else if (this.pglite) {
      await this.pglite.exec(sql);
    }
  }

  async transaction<T>(callback: (client: TransactionClient) => Promise<T>): Promise<T> {
    await this.init();

    if (this.pgPool) {
      const client = await this.pgPool.connect();
      try {
        await client.query('BEGIN');
        const txClient: TransactionClient = {
          query: async <R = any>(sql: string, params: any[] = []) => {
            const normalized = params.map((p) => (p !== null && typeof p === 'object' && !(p instanceof Date) ? JSON.stringify(p) : p));
            const r = await client.query(sql, normalized);
            return { rows: r.rows as R[], rowCount: r.rowCount ?? 0 };
          },
        };
        const result = await callback(txClient);
        await client.query('COMMIT');
        return result;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } else if (this.pglite) {
      // In PGlite, transaction wrapper executes in sequence
      return await this.pglite.transaction(async (tx) => {
        const txClient: TransactionClient = {
          query: async <R = any>(sql: string, params: any[] = []) => {
            const normalized = params.map((p) => (p !== null && typeof p === 'object' && !(p instanceof Date) ? JSON.stringify(p) : p));
            const r = await tx.query(sql, normalized);
            return { rows: r.rows as R[], rowCount: r.rows ? r.rows.length : 0 };
          },
        };
        return await callback(txClient);
      });
    }

    throw new Error('Database not initialized');
  }

  async close(): Promise<void> {
    if (this.pgPool) {
      await this.pgPool.end();
    }
    if (this.pglite) {
      await this.pglite.close();
    }
    this.isInitialized = false;
  }
}

export const db = new Database();
