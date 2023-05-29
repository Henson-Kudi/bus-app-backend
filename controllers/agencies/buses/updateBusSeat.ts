import { Request, Response } from "express"
import { QueryResult } from "pg"
import { uuidv4Regex } from "../../../configs"
import { BusSeats, RequestInterface } from "../../../types"
import pool from "../../../models/db/postgres"

export default async function updateBusSeat(req: RequestInterface, res: Response): Promise<Response> {
    const busId: string | undefined = req.params.busId
    const agencyId: string | undefined = req.user.id
    const data: BusSeats = req.body

    if (!agencyId || !uuidv4Regex.test(agencyId) || !busId || !uuidv4Regex.test(busId)) {
        return res.status(500).json({ message: "Invalid data sent" })
    }

    const updateBusSeatsQs = `
            UPDATE bus_seats
                SET position = $1
                WHERE id = $2 AND number = $3 AND bus_id = $4
            RETURNING *;
        `

    try {
        const updateRes: QueryResult = await pool.query(updateBusSeatsQs, [
            data.position,
            data.id,
            data.number,
            data.bus_id,
        ])

        const [updatedData]: BusSeats[] = updateRes.rows

        return res.status(200).json(updatedData)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }

    return res
}
