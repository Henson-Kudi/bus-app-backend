import { Request, Response } from "express"
import { QueryResult } from "pg"
import { uuidv4Regex } from "../../../configs"
import pool from "../../../models/db/postgres"
import { Bus } from "../../../types"

export default async function deleteBus(req: Request, res: Response): Promise<Response> {
    const agencyId: string | undefined = req.params.id
    const busId: string | undefined = req.params.busId

    if (!agencyId || !uuidv4Regex.test(agencyId) || !busId || !uuidv4Regex.test(busId)) {
        return res.status(500).json({ message: "Invalid data sent" })
    }

    const deleteQs = `
        DELETE FROM buses WHERE id = $1 AND agency = $2 RETURNING *
    `

    const deleteSeatsQs = `
        DELETE FROM bus_seats WHERE bus_id = $1
    `

    try {
        // before deleting we have to check that this bus is not in listed on travel
        await pool.query(deleteSeatsQs, [busId])

        const queryResult: QueryResult = await pool.query(deleteQs, [busId, agencyId])

        const [queryRows]: Bus[] = queryResult.rows

        return res.status(200).json(queryRows)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}
