"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
require("dotenv/config");
const path_1 = __importDefault(require("path"));
const pg_1 = require("pg");
const postgres_migrations_1 = require("postgres-migrations");
const { DB_NAME, DB_USER, DB_HOST, DB_PASS, DB_PORT, DB_POOL_SIZE, DB_POOL_CLIENT_IDLE_TIMEOUT, DB_POOL_CLIENT_CONNECTION_TIMEOUT, } = process.env;
const poolConfig = {
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASS,
    host: DB_HOST,
    port: Number(DB_PORT),
    max: Number(DB_POOL_SIZE),
    idleTimeOutMillis: Number(DB_POOL_CLIENT_IDLE_TIMEOUT),
    connectionTimeoutMillis: Number(DB_POOL_CLIENT_CONNECTION_TIMEOUT),
};
const pool = new pg_1.Pool(poolConfig);
exports.db = {
    runMigrations: () => __awaiter(void 0, void 0, void 0, function* () {
        const client = yield pool.connect();
        try {
            yield (0, postgres_migrations_1.migrate)({ client }, path_1.default.resolve(__dirname, "migrations/sql"));
            console.log("Database connected");
        }
        catch (err) {
            console.log(err);
            process.exit(1);
        }
        finally {
            client.release();
        }
    }),
};
exports.default = pool;
