import { Request, Response } from "express"
import { QueryResult } from "pg"
import { uuidv4Regex } from "../../configs"
import { BusSeats } from "../../types"
import pool from "../../models/db/postgres"

export default async function getTravelBusSeats(req: Request, res: Response): Promise<Response> {
    const busId: string | undefined = req.params.busId

    if (!busId || !uuidv4Regex.test(busId)) {
        return res.status(500).json({ message: "No data found" })
    }

    const seatsQs = `SELECT * FROM travel_seats WHERE travel_id = $1;`

    try {
        const seatsResult: QueryResult = await pool.query(seatsQs, [busId])

        const seats: BusSeats[] = seatsResult.rows

        return res.status(200).json(seats)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}
