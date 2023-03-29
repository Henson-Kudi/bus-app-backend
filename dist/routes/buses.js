"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const buses_1 = require("../controllers/buses");
const Router = express_1.default.Router({ strict: true });
Router.route("/").get(buses_1.getBuses).post(buses_1.createTravelBus).put(buses_1.updateTravelBus);
Router.route('/search').post(buses_1.searchBuses);
Router.route("/:busId").delete(buses_1.deleteBus);
Router.route("/:busId/seats").get(buses_1.getTravelBusSeats);
exports.default = Router;
