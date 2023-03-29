import express, { Request, Response } from "express"

import { loginAgency, registerAgency } from "../controllers/authentication/agencies"
import { loginCustomer, registerCustomer } from "../controllers/authentication/customers"

const Router = express.Router()

Router.route("/agency/login").post(loginAgency)
Router.route("/agency/register").post(registerAgency)

Router.route("/customer/register").post(registerCustomer)
Router.route("/customer/login").post(loginCustomer)

export default Router
