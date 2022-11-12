"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const stripe_1 = __importDefault(require("../controllers/stripe"));
const Router = express_1.default.Router();
Router.route("/create-client-secret").post(stripe_1.default);
exports.default = Router;
