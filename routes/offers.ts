import express from "express"
import {getOffers} from "../controllers/offers"

const Router = express.Router({ strict: true })

Router.route("/").get(getOffers)

export default Router
