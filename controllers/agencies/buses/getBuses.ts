import { Request, Response } from "express"
import { QueryResult } from "pg"
import { uuidv4Regex } from "../../../configs"
import pool from "../../../models/db/postgres"
import { Bus } from "../../../types"

export default async function getAgencyBuses(req: Request, res: Response): Promise<Response> {
    const agencyId: string | undefined = req.params.id

    if (!agencyId || !uuidv4Regex.test(agencyId)) {
        return res.status(500).json({ message: "Buses not found" })
    }

    const busesQs = `
        SELECT * FROM buses WHERE agency = $1
    `

    try {
        const busSeatsResult: QueryResult = await pool.query(busesQs, [agencyId])

        const busList: Bus[] = busSeatsResult.rows

        return res.status(200).json(busList)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}
