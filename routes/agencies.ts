import express from "express"
import fileUpload from "express-fileupload"
import {
    getAgencies,
    getAgency,
    deleteDriver,
    createAgencyDriver,
    getDriver,
    getDrivers,
    updateDriverInfo,
    createBus,
    getAgencyBuses,
    deleteBus,
    getAgencyBusSeats,
    updateBusDetails,
    updateBusSeat,
    createDriverReview,
    getAllAgencyDriversReviews,
    getDriverReviews,
    deleteDriverReview,
    updateDriverReview,
    getAgencyReviews,
    createAgencyReview,
    deleteAgencyReview,
    updateAgencyReview,
    getAgencyScheduledBuses,
} from "../controllers/agencies"
import deleteAgency from "../controllers/agencies/deleteAgency"
import updateAgency from "../controllers/agencies/updateAgency"
import { registerAgency } from "../controllers/authentication/agencies"
import verifyAgency from "../utils/verifyAgency"

const Router = express.Router({ strict: true })

Router.route("/")
    .get(verifyAgency, getAgencies)
    .post(registerAgency)
    .put(verifyAgency, updateAgency)

Router.use(verifyAgency)

/////////// CRUD FOR AGENCY DRIVERS /////////////
Router.route("/drivers").post(createAgencyDriver).get(getDrivers).put(updateDriverInfo)
Router.route("/drivers/:driverId").delete(deleteDriver).get(getDriver)
/* crud for agency driver reviews*/
Router.route("/driver-reviews/create").post(createDriverReview)
Router.route("/driver-reviews/:reviewId").put(updateDriverReview).delete(deleteDriverReview)
Router.route("/driver-reviews").get(getAllAgencyDriversReviews)
Router.route("/driver-reviews/:driverId").get(getDriverReviews)

////////// CRUD FOR AGENCY BUSES /////////////

Router.route("/buses")
    .post(fileUpload(), createBus)
    .get(getAgencyBuses)
    .put(fileUpload(), updateBusDetails)
Router.route("/buses/:busId").delete(deleteBus)
Router.route("/buses/:busId/seats").put(updateBusSeat).get(getAgencyBusSeats)

////////// CRUD FOR AGENCY SCHEDULED BUSES /////////////

Router.route("/scheduled-buses").get(getAgencyScheduledBuses)
////////// CRUD FOR AGENCY REVIEWS /////////////

Router.route("/reviews").post(createAgencyReview).get(getAgencyReviews)
Router.route("/reviews/:reviewId").put(updateAgencyReview).delete(deleteAgencyReview)

// get an agency
Router.route("/:id").get(getAgency).delete(deleteAgency)

export default Router
