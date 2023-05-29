"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const agencies_1 = require("../controllers/agencies");
const deleteAgency_1 = __importDefault(require("../controllers/agencies/deleteAgency"));
const updateAgency_1 = __importDefault(require("../controllers/agencies/updateAgency"));
const agencies_2 = require("../controllers/authentication/agencies");
const verifyAgency_1 = __importDefault(require("../utils/verifyAgency"));
const Router = express_1.default.Router({ strict: true });
Router.route("/")
    .get(verifyAgency_1.default, agencies_1.getAgencies)
    .post(agencies_2.registerAgency)
    .put(verifyAgency_1.default, updateAgency_1.default);
Router.use(verifyAgency_1.default);
/////////// CRUD FOR AGENCY DRIVERS /////////////
Router.route("/drivers").post(agencies_1.createAgencyDriver).get(agencies_1.getDrivers).put(agencies_1.updateDriverInfo);
Router.route("/drivers/:driverId").delete(agencies_1.deleteDriver).get(agencies_1.getDriver);
/* crud for agency driver reviews*/
Router.route("/driver-reviews/create").post(agencies_1.createDriverReview);
Router.route("/driver-reviews/:reviewId").put(agencies_1.updateDriverReview).delete(agencies_1.deleteDriverReview);
Router.route("/driver-reviews").get(agencies_1.getAllAgencyDriversReviews);
Router.route("/driver-reviews/:driverId").get(agencies_1.getDriverReviews);
////////// CRUD FOR AGENCY BUSES /////////////
Router.route("/buses")
    .post((0, express_fileupload_1.default)(), agencies_1.createBus)
    .get(agencies_1.getAgencyBuses)
    .put((0, express_fileupload_1.default)(), agencies_1.updateBusDetails);
Router.route("/buses/:busId").delete(agencies_1.deleteBus);
Router.route("/buses/:busId/seats").put(agencies_1.updateBusSeat).get(agencies_1.getAgencyBusSeats);
////////// CRUD FOR AGENCY SCHEDULED BUSES /////////////
Router.route("/scheduled-buses").get(agencies_1.getAgencyScheduledBuses);
////////// CRUD FOR AGENCY REVIEWS /////////////
Router.route("/reviews").post(agencies_1.createAgencyReview).get(agencies_1.getAgencyReviews);
Router.route("/reviews/:reviewId").put(agencies_1.updateAgencyReview).delete(agencies_1.deleteAgencyReview);
// get an agency
Router.route("/:id").get(agencies_1.getAgency).delete(deleteAgency_1.default);
exports.default = Router;
