import { Request, Response } from "express"
import { QueryResult } from "pg"
import { Bus, BusSeats } from "../../../types"
import pool from "../../../models/db/postgres"
import { uuidv4Regex } from "../../../configs"

export default async function updateBusDetails(req: Request, res: Response): Promise<Response> {
    const agencyId: string | undefined = req.params.id
    const data: Bus = req.body

    if (!agencyId || !uuidv4Regex.test(agencyId) || !data.id || !uuidv4Regex.test(data.id)) {
        return res.status(500).json({ message: "Invalid data sent" })
    }

    const busSeatsArray: BusSeats[] =
        typeof data.seats === "string" ? JSON.parse(data.seats) : data.seats

    const updateBusQs = `
            UPDATE buses
                SET number = $1,
                    image = $2,
                    driver = $3
                    --number_of_seats = $4
                WHERE
                    id = $4 AND
                    agency = $5
            RETURNING *;
        `

    const updateBusSeatsQs = `
            UPDATE bus_seats
                SET position = $1
                WHERE id = $2 AND number = $3 AND bus_id = $4
            RETURNING *;
        `

    try {
        const updateBusResult: QueryResult = await pool.query(updateBusQs, [
            data.number,
            data?.image ?? null,
            data.driver,
            data.id,
            data.agency,
        ])

        const [updatedBus]: Bus[] = updateBusResult.rows

        const updatedSeats = busSeatsArray.map(async (seat) => {
            const res: QueryResult = await pool.query(updateBusSeatsQs, [
                seat.position,
                seat?.id,
                seat?.number,
                seat.bus_id,
            ])

            const [updatedData]: BusSeats[] = res.rows

            return updatedData
        })

        const ressolvedSeats = await Promise.all(updatedSeats)

        return res.status(200).json({ ...updatedBus, seats: ressolvedSeats })
    } catch (err) {
        return res.status(500).json({ message: "Internal Server error" })
    }
}
