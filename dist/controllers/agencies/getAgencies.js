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
const postgres_1 = __importDefault(require("../../models/db/postgres"));
function default_1(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { rows } = yield postgres_1.default.query("create table if not exists users( name Varchar(20) not null, email varchar(20) unique not null)");
            const { rows: insierts } = yield postgres_1.default.query("insert into users(name, email) values('Henson Kudi Amah', 'aamahkkudi@gmail.com')");
            const { rows: selects } = yield postgres_1.default.query("select * from users");
            res.send(selects);
        }
        catch (err) {
            console.log(err);
        }
    });
}
exports.default = default_1;
