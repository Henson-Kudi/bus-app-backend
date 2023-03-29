import express from "express"
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
} from "../controllers/agencies"
import deleteAgency from "../controllers/agencies/deleteAgency"
import updateAgency from "../controllers/agencies/updateAgency"
import { registerAgency } from "../controllers/authentication/agencies"

const Router = express.Router({ strict: true })

Router.route("/").get(getAgencies).post(registerAgency).put(updateAgency)

Router.route("/:id").get(getAgency).delete(deleteAgency)

// Router.route("/reviews/:id").get(getAgencyReview)

/////////// CRUD FOR AGENCY DRIVERS /////////////
Router.route("/:id/drivers").post(createAgencyDriver).get(getDrivers).put(updateDriverInfo)
Router.route("/:id/drivers/:driverId").delete(deleteDriver).get(getDriver)
/* crud for agency driver reviews*/
Router.route("/:id/driver-reviews/create").post(createDriverReview)
Router.route("/:id/driver-reviews/:reviewId").put(updateDriverReview).delete(deleteDriverReview)
Router.route("/:id/driver-reviews").get(getAllAgencyDriversReviews)
Router.route("/:id/driver-reviews/:driverId").get(getDriverReviews)

////////// CRUD FOR AGENCY BUSES /////////////

Router.route("/:id/buses").post(createBus).get(getAgencyBuses).put(updateBusDetails)
Router.route("/:id/buses/:busId").delete(deleteBus)
Router.route("/:id/buses/:busId/seats").put(updateBusSeat).get(getAgencyBusSeats)
/* crud for agency agency reviews*/
Router.route("/:id/reviews").post(createAgencyReview).get(getAgencyReviews)
Router.route("/:id/reviews/:reviewId").put(updateAgencyReview).delete(deleteAgencyReview)

export default Router
