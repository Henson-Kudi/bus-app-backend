import { Request, Response } from "express"
import { AgencyData as Agency } from "../../types"
import pool from "../../models/db/postgres"
import { QueryResult } from "pg"

export default async (req: Request, res: Response): Promise<Response> => {
    const data: Agency | undefined = req.body as Agency | undefined

    if (!data || !data?.id) {
        return res.status(500).json({ message: "Please send valid data" })
    }

    const updateQs = `
        UPDATE agencies
        SET name = $1,
            admin = $2,
            email = $3,
            city = $4,
            region = $5,
            country_name = $6,
            country_code = $7,
            country_image = $8,
            country_short = $9,
            contact = $10
            contact_verified = $11
            email_verified = $12
        WHERE id = $13
        RETURNING *
    `

    try {
        const updateResult: QueryResult = await pool.query(updateQs, [
            data.name,
            data.admin,
            data.email,
            data.city,
            data.region,
            data.country_name,
            data.country_code,
            data.country_image,
            data.country_short,
            data.contact,
            data.contact_verified,
            data.email_verified,
            data.id,
        ])

        const [updatedRows]: Agency[] | undefined = updateResult.rows as Agency[]

        return res.status(200).json(updatedRows)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}
