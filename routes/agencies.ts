import express from "express"
import {getAgencies, getAgencyReview} from '../controllers/agencies'

const Router = express.Router({ strict: true })

Router.route("/").get(getAgencies)

Router.route("/reviews/:id").get(getAgencyReview)

export default Router
