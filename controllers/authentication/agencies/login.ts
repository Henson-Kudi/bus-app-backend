import { Request, Response } from "express"
import { QueryResult } from "pg"
import jwt from "jsonwebtoken"
import { emailRegex } from "../../../configs"
import { AgencyData, LoginData } from "../../../types"
import pool from "../../../models/db/postgres"
import confirmPassword from "../../../configs/confirmPassword"

export default async function loginAgency(req: Request, res: Response): Promise<Response> {
    const data: LoginData | undefined = req.body

    if (!data || !emailRegex.test(data.email) || !data.password) {
        return res.status(500).json({ message: "Please submit valid data" })
    }

    const agencyQs = `SELECT * FROM agencies WHERE email = $1`

    try {
        const agencyResult: QueryResult = await pool.query(agencyQs, [data.email])

        const [agencyData]: AgencyData[] = agencyResult.rows

        // if no user is found with provided email, we want to return an error of invalid credentials

        if (!agencyData) {
            return res.status(500).json({ message: "Invalid login credentials" })
        }

        // check if the agency email is verified

        if (!agencyData.email_verified) {
            return res.status(500).json({
                message: "Please verify your email before you can login \n Click here to verify",
                verifyLink: "", //to be added
            })
        }

        // check if hashed password confirms to saved hashed password in db

        const confirmedHashedPassword = await confirmPassword(
            data.password,
            agencyData.password_hash
        )

        if (!confirmedHashedPassword) {
            return res.status(500).json({ message: "Invalid login credentials" })
        }

        const accessTokenSecret: string | undefined = process.env.JWT_ACCESS_TOKEN_SECRET
        const refreshTokenSecret: string | undefined = process.env.JWT_REFERESH_TOKEN_SECRET

        const accessToken = jwt.sign({ id: agencyData.id }, accessTokenSecret!)
        const refereshToken = jwt.sign({ id: agencyData.id }, refreshTokenSecret!)

        return res
            .status(200)
            .header("auth-token", accessToken)
            .cookie("referesh_token", refereshToken, { httpOnly: true })
            .json({ ...agencyData, token: accessToken })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}
