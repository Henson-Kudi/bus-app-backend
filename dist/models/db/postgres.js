"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const pg_1 = require("pg");
const { DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT } = process.env;
exports.default = new pg_1.Pool({
    max: 20,
    host: DB_HOST,
    user: DB_USER,
    database: DB_NAME,
    password: DB_PASS,
});
