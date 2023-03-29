import express from "express"
import {
    cancelBooking,
    changeBookedSeat,
    changeTravelBus,
    creatCustomerBooking,
    deleteCustomer,
    deleteExpiredTicket,
    getCustomer,
    getCustomers,
    getMyTickets,
    updateCustomer,
} from "../controllers/customers"

const Router = express.Router()

Router.route("/").get(getCustomers).put(updateCustomer)

Router.route("/:id").get(getCustomer).delete(deleteCustomer)

Router.route("/create-booking").post(creatCustomerBooking)

Router.route("/tickets/:userId").get(getMyTickets)

Router.route("/bookings/change-seat").post(changeBookedSeat)
Router.route("/bookings/change-bus").post(changeTravelBus)
Router.route("/bookings/cancel-booking").post(cancelBooking)
Router.route("/expired-tickets/:id").delete(deleteExpiredTicket)

export default Router
