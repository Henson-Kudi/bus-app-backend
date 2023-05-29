import { Request, Response } from "express"
import { QueryResult } from "pg"
import { uuidv4Regex } from "../../../configs"
import pool from "../../../models/db/postgres"
import { Bus, RequestInterface } from "../../../types"

export default async function getAgencyBuses(
    req: RequestInterface,
    res: Response
): Promise<Response> {
    const agencyId: string | undefined = req.user.id

    if (!agencyId || !uuidv4Regex.test(agencyId)) {
        return res.status(404).json({ message: "Buses not found" })
    }

    const busesQs = `
        SELECT
            buses.id,
            buses.number,
            buses.agency,
            buses.image,
            jsonb_build_object(
                'id', drivers.id,
                'name', drivers.name,
                'contact', drivers.contact,
                'email', drivers.email,
                'position', drivers.position,
                'agency', drivers.agency,
                'rating', drivers.rating,
                'image', drivers.image
            ) AS driver,
            jsonb_agg(
                jsonb_build_object(
                    'id', bus_seats.id,
                    'number', bus_seats.number,
                    'position', bus_seats.position,
                    'bus_id', bus_seats.bus_id
                )
            ) AS seats
            FROM
                buses
            INNER JOIN drivers
            ON buses.agency = drivers.agency
            INNER JOIN bus_seats
            ON buses.id = bus_seats.bus_id
            WHERE
                buses.agency = $1
            GROUP BY
                buses.id,
                drivers.id
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
