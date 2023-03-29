import { Request, Response } from "express"
import { uuidv4Regex } from "../../../configs"
import format from "pg-format"
import { QueryResult } from "pg"
import pool from "../../../models/db/postgres"
import { Bus, BusSeats } from "../../../types"

export default async (req: Request, res: Response): Promise<Response> => {
    const agencyId: string | undefined = req.params.id

    const data: Bus = req.body

    const busSeatsArray: BusSeats[] =
        typeof data.seats === "string" ? JSON.parse(data.seats) : data.seats

    if (!agencyId || !uuidv4Regex.test(agencyId) || !data?.agency) {
        return res.status(500).json({ message: "Invalid data sent" })
    }

    if (!busSeatsArray.length) {
        return res
            .status(500)
            .json({ message: "Please provide bus seats. Bus seats cannot be empty" })
    }

    const busQs = `
        INSERT INTO buses(
                number,
                agency,
                image,
                driver,
                number_of_seats
            )
            VALUES(
                $1, 
                $2,
                $3,
                $4,
                $5
            )
        RETURNING *;
    `

    const seatsQs = `INSERT INTO bus_seats(number, position, bus_id) VALUES %L`

    try {
        const busResponse: QueryResult = await pool.query(busQs, [
            data.number,
            data.agency ?? agencyId,
            data.image,
            data.driver,
            busSeatsArray.length,
        ])

        const [busData]: Bus[] = busResponse.rows

        const busSeatsValues = busSeatsArray?.map((seat) => [
            seat.number,
            seat.position,
            busData.id,
        ])

        const busSeatsResult: QueryResult = await pool.query(format(seatsQs, busSeatsValues))

        return res.status(200).json({ ...busData, seats: busSeatsResult.rows })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}
