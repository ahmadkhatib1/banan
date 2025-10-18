const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();

class MySQLDatabase {
    constructor() {
        this.pool = null;
        this.config = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'edu_les',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            acquireTimeout: 60000,
            timeout: 60000,
            reconnect: true,
            charset: 'utf8mb4'
        };
    }

    async connect() {
        try {
            if (!this.pool) {
                this.pool = mysql.createPool(this.config);
                console.log('✅ MySQL connection pool created successfully');
                
                // Test the connection
                const connection = await this.pool.getConnection();
                await connection.ping();
                connection.release();
                console.log('✅ MySQL database connected successfully');
            }
            return this.pool;
        } catch (error) {
            console.error('❌ MySQL connection error:', error.message);
            throw error;
        }
    }

    async disconnect() {
        try {
            if (this.pool) {
                await this.pool.end();
                this.pool = null;
                console.log('✅ MySQL connection pool closed');
            }
        } catch (error) {
            console.error('❌ Error closing MySQL connection:', error.message);
            throw error;
        }
    }

    async query(sql, params = []) {
        try {
            if (!this.pool) {
                await this.connect();
            }
            
            const [rows, fields] = await this.pool.execute(sql, params);
            return rows;
        } catch (error) {
            console.error('❌ MySQL query error:', error.message);
            console.error('SQL:', sql);
            console.error('Params:', params);
            throw error;
        }
    }

    async select(table, conditions = {}, options = {}) {
        try {
            let sql = `SELECT * FROM ${table}`;
            const params = [];

            if (Object.keys(conditions).length > 0) {
                const whereClause = Object.keys(conditions)
                    .map(key => `${key} = ?`)
                    .join(' AND ');
                sql += ` WHERE ${whereClause}`;
                params.push(...Object.values(conditions));
            }

            if (options.orderBy) {
                sql += ` ORDER BY ${options.orderBy}`;
            }

            if (options.limit) {
                sql += ` LIMIT ${options.limit}`;
            }

            if (options.offset) {
                sql += ` OFFSET ${options.offset}`;
            }

            return await this.query(sql, params);
        } catch (error) {
            console.error('❌ MySQL select error:', error.message);
            throw error;
        }
    }

    async insert(table, data) {
        try {
            const columns = Object.keys(data);
            const placeholders = columns.map(() => '?').join(', ');
            const values = Object.values(data);

            const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
            const result = await this.query(sql, values);
            
            return {
                insertId: result.insertId,
                affectedRows: result.affectedRows
            };
        } catch (error) {
            console.error('❌ MySQL insert error:', error.message);
            throw error;
        }
    }

    async update(table, data, conditions) {
        try {
            const setClause = Object.keys(data)
                .map(key => `${key} = ?`)
                .join(', ');
            
            const whereClause = Object.keys(conditions)
                .map(key => `${key} = ?`)
                .join(' AND ');

            const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
            const params = [...Object.values(data), ...Object.values(conditions)];
            
            const result = await this.query(sql, params);
            return {
                affectedRows: result.affectedRows,
                changedRows: result.changedRows
            };
        } catch (error) {
            console.error('❌ MySQL update error:', error.message);
            throw error;
        }
    }

    async delete(table, conditions) {
        try {
            const whereClause = Object.keys(conditions)
                .map(key => `${key} = ?`)
                .join(' AND ');

            const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
            const params = Object.values(conditions);
            
            const result = await this.query(sql, params);
            return {
                affectedRows: result.affectedRows
            };
        } catch (error) {
            console.error('❌ MySQL delete error:', error.message);
            throw error;
        }
    }

    async beginTransaction() {
        try {
            if (!this.pool) {
                await this.connect();
            }
            const connection = await this.pool.getConnection();
            await connection.beginTransaction();
            return connection;
        } catch (error) {
            console.error('❌ MySQL transaction begin error:', error.message);
            throw error;
        }
    }

    async commitTransaction(connection) {
        try {
            await connection.commit();
            connection.release();
        } catch (error) {
            console.error('❌ MySQL transaction commit error:', error.message);
            await connection.rollback();
            connection.release();
            throw error;
        }
    }

    async rollbackTransaction(connection) {
        try {
            await connection.rollback();
            connection.release();
        } catch (error) {
            console.error('❌ MySQL transaction rollback error:', error.message);
            connection.release();
            throw error;
        }
    }

    async executeTransaction(queries) {
        const connection = await this.beginTransaction();
        
        try {
            const results = [];
            for (const { sql, params } of queries) {
                const [result] = await connection.execute(sql, params || []);
                results.push(result);
            }
            
            await this.commitTransaction(connection);
            return results;
        } catch (error) {
            await this.rollbackTransaction(connection);
            throw error;
        }
    }

    // Helper method to check if database exists
    async databaseExists() {
        try {
            const tempConfig = { ...this.config };
            delete tempConfig.database;
            
            const tempPool = mysql.createPool(tempConfig);
            const [rows] = await tempPool.execute(
                'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
                [this.config.database]
            );
            
            await tempPool.end();
            return rows.length > 0;
        } catch (error) {
            console.error('❌ Error checking database existence:', error.message);
            return false;
        }
    }

    // Helper method to create database
    async createDatabase() {
        try {
            const tempConfig = { ...this.config };
            delete tempConfig.database;
            
            const tempPool = mysql.createPool(tempConfig);
            await tempPool.execute(`CREATE DATABASE IF NOT EXISTS \`${this.config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
            await tempPool.end();
            
            console.log(`✅ Database '${this.config.database}' created successfully`);
        } catch (error) {
            console.error('❌ Error creating database:', error.message);
            throw error;
        }
    }
}

// Create and export a singleton instance
const database = new MySQLDatabase();

module.exports = database;