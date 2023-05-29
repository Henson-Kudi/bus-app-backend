import express from "express"

import { loginAgency, registerAgency } from "../controllers/authentication/agencies"
import { loginCustomer, registerCustomer } from "../controllers/authentication/customers"
import verifyCode from "../controllers/authentication/verifyCode"
import verifyAgency from "../utils/verifyAgency"
import refreshToken from "../controllers/authentication/agencies/refreshToken"
import agencyLogout from "../controllers/authentication/agencies/logout"

const Router = express.Router()

Router.route("/agency/login").post(loginAgency)
Router.route("/agency/refresh-token").get(refreshToken)
Router.route("/agency/register").post(registerAgency)
Router.route("/agency/logout").post(agencyLogout)

Router.route("/customer/register").post(registerCustomer)
Router.route("/customer/login").post(loginCustomer)

Router.route("/verify-code").post(verifyCode)

export default Router
