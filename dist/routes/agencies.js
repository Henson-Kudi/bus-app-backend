"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const agencies_1 = require("../controllers/agencies");
const Router = express_1.default.Router({ strict: true });
Router.route("/").get(agencies_1.getAgencies);
Router.route("/reviews/:id").get(agencies_1.getAgencyReview);
exports.default = Router;
