import { Request, Response } from "express"
import { QueryResult } from "pg"
import { emailRegex } from "../../../configs"
import { LoginData, UserData } from "../../../types"
import pool from "../../../models/db/postgres"
import confirmPassword from "../../../configs/confirmPassword"

export default async function loginCustomer(req: Request, res: Response): Promise<Response> {
    const data: LoginData | undefined = req.body

    if (!data || !data.password || !emailRegex.test(data.email)) {
        return res.status(500).json({ message: "Please submit valid data" })
    }

    const userQs = `SELECT * FROM customers WHERE email = $1`

    try {
        const userResult: QueryResult = await pool.query(userQs, [data.email])

        const [userData]: UserData[] = userResult.rows

        // if no user is found with provided email, we want to return an error of invalid credentials

        if (!userData) {
            return res.status(500).json({ message: "Invalid login credentials" })
        }

        // check if hashed password confirms to saved hashed password in db

        const confirmedHashedPassword = await confirmPassword(data.password, userData.password_hash)

        if (!confirmedHashedPassword) {
            return res.status(500).json({ message: "Invalid login credentials" })
        }

        return res.status(200).json(userData)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal servewr error" })
    }
}
