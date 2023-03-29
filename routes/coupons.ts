import express from "express"
import verifyCoupon from "../controllers/coupons/verifyCoupon"

const Router = express.Router()

Router.route("/verify-coupon").post(verifyCoupon)

export default Router
