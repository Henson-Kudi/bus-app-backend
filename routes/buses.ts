import express from "express"
import { getBuses } from "../controllers/buses"

const Router = express.Router({ strict: true })

Router.route("/").get(getBuses)

export default Router
