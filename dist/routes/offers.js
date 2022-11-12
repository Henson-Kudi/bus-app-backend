"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const offers_1 = require("../controllers/offers");
const Router = express_1.default.Router({ strict: true });
Router.route("/").get(offers_1.getOffers);
exports.default = Router;
