import express from "express"

import {
    getBuses,
    createTravelBus,
    updateTravelBus,
    deleteBus,
    getTravelBusSeats,
    searchBuses,
} from "../controllers/buses"

const Router = express.Router({ strict: true })

Router.route("/").get(getBuses).post(createTravelBus).put(updateTravelBus)

Router.route('/search').post(searchBuses)

Router.route("/:busId").delete(deleteBus)

Router.route("/:busId/seats").get(getTravelBusSeats)

export default Router
