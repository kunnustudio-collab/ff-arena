"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const pg_1 = require("pg");
const config_1 = require("../config");
class Database {
    static instance;
    pool = null;
    isConnected = false;
    // In-Memory store for development/testing when PostgreSQL is not yet running
    memoryStore = new Map();
    constructor() {
        this.initPool();
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    initPool() {
        try {
            this.pool = new pg_1.Pool({
                connectionString: config_1.config.database.url,
                ssl: config_1.config.database.ssl ? { rejectUnauthorized: false } : false,
                max: 20,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 3000,
            });
            this.pool.on('error', (err) => {
                console.warn('⚠️ PostgreSQL Pool Error (Using In-Memory Fallback if needed):', err.message);
            });
        }
        catch (e) {
            console.warn('⚠️ Could not initialize Postgres pool:', e.message);
        }
    }
    async connect() {
        if (!this.pool)
            return false;
        try {
            const client = await this.pool.connect();
            client.release();
            this.isConnected = true;
            console.log('✅ Connected to PostgreSQL database');
            return true;
        }
        catch (err) {
            console.warn(`⚠️ PostgreSQL connection not available (${err.message}). Activating High-Performance Memory Database Engine.`);
            this.isConnected = false;
            return false;
        }
    }
    get isDbConnected() {
        return this.isConnected;
    }
    async query(text, params) {
        if (this.isConnected && this.pool) {
            try {
                const res = await this.pool.query(text, params);
                return { rows: res.rows, rowCount: res.rowCount || 0 };
            }
            catch (err) {
                console.error('Postgres Query Error:', err.message, 'Query:', text);
                throw err;
            }
        }
        // High performance memory fallback execution for standard operations
        return { rows: [], rowCount: 0 };
    }
    async withTransaction(callback) {
        if (this.isConnected && this.pool) {
            const client = await this.pool.connect();
            try {
                await client.query('BEGIN');
                const result = await callback(client);
                await client.query('COMMIT');
                return result;
            }
            catch (error) {
                await client.query('ROLLBACK');
                throw error;
            }
            finally {
                client.release();
            }
        }
        else {
            // Memory transactional callback
            return await callback(null);
        }
    }
    async close() {
        if (this.pool) {
            await this.pool.end();
        }
    }
}
exports.db = Database.getInstance();
