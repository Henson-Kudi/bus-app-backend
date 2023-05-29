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
        const userResult: QueryResult = await pool.query(userQs, [data.email?.toLowerCase()])

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

        return res.status(200).json({
            id: userData?.id,
            name: userData?.name,
            email: userData?.email,
            country_name: userData?.country_name,
            country_code: userData?.country_code,
            country_image: userData?.country_image,
            country_short: userData?.country_short,
            contact: userData?.contact,
            city: userData?.city,
            address: userData?.address,
            image: userData?.image,
            contact_verified: userData?.contact_verified,
            email_verified: userData?.email_verified,
            notification_token: userData?.notification_token,
            loggedIn: true,
            country: {
                image: { uri: userData?.country_image ?? "https://flagcdn.com/w320/cm.png" },
                code: userData?.country_code ?? "+237",
                name: userData?.country_name ?? "Cameroon",
                short: userData?.country_short ?? "CMR",
            },
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal servewr error" })
    }
}
