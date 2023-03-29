import { Request, Response } from "express"
import { QueryResult } from "pg"
import { uuidv4Regex } from "../../../configs"
import pool from "../../../models/db/postgres"
import { BusSeats } from "../../../types"

export default async function getAgencyBusSeats(req: Request, res: Response): Promise<Response> {
    const agencyId: string | undefined = req.params.id
    const busId: string | undefined = req.params.busId

    if (!agencyId || !uuidv4Regex.test(agencyId) || !busId || !uuidv4Regex.test(busId)) {
        return res.status(500).json({ message: "No data found" })
    }

    const seatsQs = `
        SELECT * FROM bus_seats WHERE bus_id = $1;
    `

    try {
        const seatsResult: QueryResult = await pool.query(seatsQs, [busId])

        const seats: BusSeats[] = seatsResult.rows

        return res.status(200).json(seats)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}
