import "dotenv/config"
import { Pool } from "pg"

const { DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT } = process.env

export default new Pool({
    max: 20,
    host: DB_HOST,
    user: DB_USER,
    database: DB_NAME,
    password: DB_PASS,
})
