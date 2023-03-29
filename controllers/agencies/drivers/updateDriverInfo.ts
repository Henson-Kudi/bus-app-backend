import { Request, Response } from "express"
import { QueryResult } from "pg"
import { DriverDetails } from "../../../types"
import pool from "../../../models/db/postgres"
import { uuidv4Regex } from "../../../configs"

export default async function updateDriverInfo(req: Request, res: Response): Promise<Response> {
    const data: DriverDetails | undefined = req.body
    const agencyId: string | undefined = req.params.id

    if (!data || !data.id || !agencyId || !uuidv4Regex.test(agencyId)) {
        return res.status(500).json({ message: "please submit valid data" })
    }

    const driverQs = `
        UPDATE drivers
            SET name = $1,
                contact = $2,
                email = $3,
                position = $4,
                rating = $5
                --image = $8
            WHERE
                id = $6 AND
                agency = $7
        RETURNING *;
    `

    try {
        const updatedRes: QueryResult = await pool.query(driverQs, [
            data.name,
            data.contact,
            data.email,
            data.position,
            data.rating,
            // data.image,
            data.id,
            agencyId,
        ])

        const [updatedData]: DriverDetails[] = updatedRes.rows

        return res.status(200).json(updatedData)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}
