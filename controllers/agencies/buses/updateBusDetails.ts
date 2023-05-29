import { Request, Response } from "express"
import { QueryResult } from "pg"
import { Bus, BusSeats, RequestInterface } from "../../../types"
import pool from "../../../models/db/postgres"
import { uuidv4Regex } from "../../../configs"

export default async function updateBusDetails(
    req: RequestInterface,
    res: Response
): Promise<Response> {
    const agencyId: string | undefined = req.user.id
    const data: Bus = req.body

    // if (!agencyId || !uuidv4Regex.test(agencyId) || !data.id || !uuidv4Regex.test(data.id)) {
    //     return res.status(500).json({ message: "Invalid data sent" })
    // }

    const busSeatsArray: BusSeats[] =
        typeof data.seats === "string" ? JSON.parse(data.seats) : data.seats
    console.log(req.body)

    const updateBusQs = `
            UPDATE buses
                SET ${Object.keys(req.body)
                    ?.map((item, i) => `${item}=$${i + 1}`)
                    .join(",")}
                WHERE
                    id = ${Object.keys(data).length + 1} AND
                    agency = ${Object.keys(data).length + 2}
            RETURNING *;
        `

    const updateBusSeatsQs = `
            UPDATE bus_seats
                SET position = $1
                WHERE id = $2 AND number = $3 AND bus_id = $4
            RETURNING *;
        `

    try {
        console.log(updateBusQs)
        // const updateBusResult: QueryResult = await pool.query(updateBusQs, [
        //     data.number,
        //     data?.image ?? null,
        //     data.driver,
        //     data.id,
        //     data.agency,
        // ])

        // const [updatedBus]: Bus[] = updateBusResult.rows

        // const updatedSeats = busSeatsArray.map(async (seat) => {
        //     const res: QueryResult = await pool.query(updateBusSeatsQs, [
        //         seat.position,
        //         seat?.id,
        //         seat?.number,
        //         seat.bus_id,
        //     ])

        //     const [updatedData]: BusSeats[] = res.rows

        //     return updatedData
        // })

        // const ressolvedSeats = await Promise.all(updatedSeats)

        return res.status(400).json({})
    } catch (err) {
        return res.status(500).json({ message: "Internal Server error" })
    }
}
