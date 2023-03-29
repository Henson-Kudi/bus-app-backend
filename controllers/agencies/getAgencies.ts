import { Request, Response } from "express"
import { QueryResult } from "pg"
import pool from "../../models/db/postgres"
import { AgencyData as Agency } from "../../types"

export default async function getAgencies(req: Request, res: Response): Promise<Response> {
    const agencyQs = `
            SELECT
                id,
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
                contact_verified,
                email_verified
            FROM
                agencies;
        `

    try {
        const queryResponse: QueryResult = await pool.query(agencyQs)

        const agencies = queryResponse.rows as Agency[]

        return res.status(200).json(agencies)
    } catch (err) {
        console.log(err)

        return res.status(500).json({ message: "Internal; server error" })
    }
}
