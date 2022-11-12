import express from "express"
import { getMyTickets } from "../controllers/tickets"

const Router = express.Router({ strict: true })

Router.route("/my-tickets/:userId").get(getMyTickets)

export default Router
