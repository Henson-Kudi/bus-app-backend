import { Request, Response } from "express"
import { QueryResult } from "pg"
import { emailRegex } from "../../../configs"
import { RegisterUser, UserData } from "../../../types"
import hashPassword from "../../../configs/hashPassword"
import pool from "../../../models/db/postgres"

export default async function registerCustomer(req: Request, res: Response): Promise<Response> {
    const data: RegisterUser | undefined = req.body

    if (!data) {
        return res.status(500).json({ message: "Please submit user data" })
    }

    if (
        !emailRegex.test(data.email) ||
        !data.password.trim() ||
        data.password !== data.confirmPassword
    ) {
        return res.status(500).json({ message: "Please submit valid data" })
    }

    const findUserQs = `SELECT * FROM customers WHERE email = $1`

    const registerQs = `
        INSERT INTO customers(
            name,
            email,
            country_name,
            country_code,
            country_image,
            country_short,
            contact,
            city,
            address,
            password_hash
        )
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *;
    `

    try {
        const foundUserResult: QueryResult = await pool.query(findUserQs, [data.email])

        const [foundUser]: UserData[] = foundUserResult.rows

        if (foundUser) {
            return res
                .status(500)
                .json({ message: "User already exist. Please try logging in if you're user" })
        }

        const hashedPassword = await hashPassword(data.password)

        const registerResult: QueryResult = await pool.query(registerQs, [
            data.userName,
            data.email,
            data.country.name,
            data.country.code,
            data.country.image,
            data.country.short,
            data.contact,
            data.city,
            data.address,
            hashedPassword,
        ])
        const [registeredUser]: UserData[] = registerResult.rows

        return res.status(200).json(registeredUser)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}
