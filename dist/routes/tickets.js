"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tickets_1 = require("../controllers/tickets");
const Router = express_1.default.Router({ strict: true });
Router.route("/my-tickets/:userId").get(tickets_1.getMyTickets);
exports.default = Router;
