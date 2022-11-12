"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const buses_1 = require("../controllers/buses");
const Router = express_1.default.Router({ strict: true });
Router.route("/").get(buses_1.getBuses);
exports.default = Router;
