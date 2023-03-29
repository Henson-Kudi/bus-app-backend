import { Request, Response } from "express"
import { QueryResult } from "pg"
import { emailRegex } from "../../configs"
import { AgencyData, RegisterAgency } from "../../types"
import pool from "../../models/db/postgres"
import hashPassword from "../../configs/hashPassword"

export default async function registerAgency(req: Request, res: Response): Promise<Response> {
    const data: RegisterAgency | undefined = req.body

    if (
        !data ||
        !data.name ||
        !data.admin ||
        emailRegex.test(data.email) ||
        data.password !== data.confirmPassword
    ) {
        return res.status(500).json({ message: "Please submit valid data" })
    }

    const agencyQs = `
        INSERT INTO agencies(
            name,
            admin,
            email,
            city,
            region,
            country_name,
            country_code,
            country_image,
            country_short,
            contact,
            password_hash
        )
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *;
    `

    const oldAgencyQs = `SELECT * FROM agencies WHERE email = $1`

    try {
        const oldAgencyResult: QueryResult = await pool.query(oldAgencyQs, [data.email])
        const [oldAgencyData]: AgencyData[] = oldAgencyResult.rows

        if (oldAgencyData) {
            return res.status(500).json({
                message:
                    "Agency already exist with this email. Please change email or login instead.",
            })
        }

        const hashedPassword = await hashPassword(data.password)

        const newAgencyResult: QueryResult = await pool.query(agencyQs, [
            data.name,
            data.admin,
            data.email,
            data.city,
            data.region,
            data.country.name,
            data.country.code,
            data.country.image,
            data.country.short,
            data.contact,
            hashedPassword,
        ])

        const [agency]: AgencyData[] = newAgencyResult.rows

        // send email for verification of email address (to be done later in future)

        return res.status(200).json({
            agency,
            message:
                "We have sent an email verification link to your email. Please verify your account to login",
        })
    } catch (err) {
        console.log(err)
        return res
            .status(500)
            .json({
                message: "Internal server error. Could not register agency. Please try again later",
            })
    }
}
