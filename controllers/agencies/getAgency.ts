import { Request, Response } from "express"
import { QueryResult } from "pg"
import { AgencyData as Agency } from "../../types"
import pool from "../../models/db/postgres"

export default async function getAgency(req: Request, res: Response): Promise<Response> {
    const id: string | undefined = req.params?.id as string | undefined

    const agencyQs = `
        SELECT
            id,
            name,
            admin,
            email,
            city,
            region,
            country,
            contact
        FROM
            agencies
        WHERE
            id = $1;
    `

    if (!id) {
        return res.status(500).json({ message: "Invalid agency id sent" })
    }

    try {
        const queryResponse: QueryResult = await pool.query(agencyQs, [id])

        const [agency] = queryResponse.rows as Agency[]

        return res.status(200).json(agency)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}
