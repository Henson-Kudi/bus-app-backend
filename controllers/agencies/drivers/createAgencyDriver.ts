import { Request, Response } from "express"
import { QueryResult } from "pg"
import { DriverDetails } from "../../../types"
import pool from "../../../models/db/postgres"
import { uuidv4Regex } from "../../../configs"

export default async function createAgencyDriver(req: Request, res: Response): Promise<Response> {
    const data: DriverDetails | undefined = req.body
    const agencyId: string | undefined = req.params.id

    console.log(data)

    if (
        !data ||
        !data.name ||
        (!data.agency && (!agencyId || !uuidv4Regex.test(agencyId))) ||
        !data.contact ||
        !data.email
    ) {
        return res.status(500).json({ message: "Invalid data sent. All fields required" })
    }

    const driverQs = `
        INSERT INTO
            drivers(
                name,
                contact,
                email,
                position,
                agency,
                rating
                --image
            )
            VALUES(
                $1,
                $2,
                $3,
                $4,
                $5,
                $6
                --$7
            )
        RETURNING *;
    `

    try {
        const queryResponse: QueryResult = await pool.query(driverQs, [
            data.name,
            data.contact,
            data.email,
            data.position ?? "driver",
            data.agency ?? agencyId,
            data.rating ?? 0,
            // data.image ?? null, //u need to reenable this column once the table for driver is updated
        ])

        const [driverResult]: DriverDetails[] = queryResponse.rows as DriverDetails[]

        return res.status(200).json(driverResult)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}
