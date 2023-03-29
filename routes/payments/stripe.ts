import express from "express"
import createPaymentIntent from "../../controllers/stripe"

const Router = express.Router()

Router.route("/create-payment-intent").post(createPaymentIntent)

export default Router
