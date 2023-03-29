"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const agencies_1 = require("../controllers/agencies");
const deleteAgency_1 = __importDefault(require("../controllers/agencies/deleteAgency"));
const updateAgency_1 = __importDefault(require("../controllers/agencies/updateAgency"));
const agencies_2 = require("../controllers/authentication/agencies");
const Router = express_1.default.Router({ strict: true });
Router.route("/").get(agencies_1.getAgencies).post(agencies_2.registerAgency).put(updateAgency_1.default);
Router.route("/:id").get(agencies_1.getAgency).delete(deleteAgency_1.default);
// Router.route("/reviews/:id").get(getAgencyReview)
/////////// CRUD FOR AGENCY DRIVERS /////////////
Router.route("/:id/drivers").post(agencies_1.createAgencyDriver).get(agencies_1.getDrivers).put(agencies_1.updateDriverInfo);
Router.route("/:id/drivers/:driverId").delete(agencies_1.deleteDriver).get(agencies_1.getDriver);
/* crud for agency driver reviews*/
Router.route("/:id/driver-reviews/create").post(agencies_1.createDriverReview);
Router.route("/:id/driver-reviews/:reviewId").put(agencies_1.updateDriverReview).delete(agencies_1.deleteDriverReview);
Router.route("/:id/driver-reviews").get(agencies_1.getAllAgencyDriversReviews);
Router.route("/:id/driver-reviews/:driverId").get(agencies_1.getDriverReviews);
////////// CRUD FOR AGENCY BUSES /////////////
Router.route("/:id/buses").post(agencies_1.createBus).get(agencies_1.getAgencyBuses).put(agencies_1.updateBusDetails);
Router.route("/:id/buses/:busId").delete(agencies_1.deleteBus);
Router.route("/:id/buses/:busId/seats").put(agencies_1.updateBusSeat).get(agencies_1.getAgencyBusSeats);
/* crud for agency agency reviews*/
Router.route("/:id/reviews").post(agencies_1.createAgencyReview).get(agencies_1.getAgencyReviews);
Router.route("/:id/reviews/:reviewId").put(agencies_1.updateAgencyReview).delete(agencies_1.deleteAgencyReview);
exports.default = Router;
