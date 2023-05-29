import "dotenv/config"
import path from "path"
import { Pool } from "pg"
import { migrate } from "postgres-migrations"

const {
    DB_NAME,
    DB_USER,
    DB_HOST,
    DB_PASS,
    DB_PORT,
    DB_POOL_SIZE,
    DB_POOL_CLIENT_IDLE_TIMEOUT,
    DB_POOL_CLIENT_CONNECTION_TIMEOUT,
} = process.env!

const poolConfig = {
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASS,
    host: DB_HOST,
    // port: Number(DB_PORT),
    max: Number(DB_POOL_SIZE),
    idleTimeOutMillis: Number(DB_POOL_CLIENT_IDLE_TIMEOUT),
    connectionTimeoutMillis: Number(DB_POOL_CLIENT_CONNECTION_TIMEOUT),
}

const pool = new Pool(poolConfig)

export const db = {
    runMigrations: async () => {
        const client = await pool.connect()
        try {
            await migrate({ client }, path.resolve(__dirname, "migrations/sql"))

            console.log("Database connected")
        } catch (err: any) {
            console.log(err)
            process.exit(1)
        } finally {
            client.release()
        }
    },
}

export default pool
