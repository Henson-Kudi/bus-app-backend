import express from "express"
import home from "../controllers/home"

const Router = express.Router()

Router.route("/").get(home)

export default Router
