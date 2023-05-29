import { Response } from "express";
import { Bus, RequestInterface } from "../../../types";
import { uuidv4Regex } from "../../../configs";
import { QueryResult } from "pg";
import pool from "../../../models/db/postgres";

export default async function getAgencyScheduledBuses(req: RequestInterface, res:Response):Promise<Response> {
    const agencyId: string | undefined = req.user.id

    if (!agencyId || !uuidv4Regex.test(agencyId)) {
        return res.status(404).json({ message: "Buses not found" })
    }

    const busesQs = `
        SELECT
            travel_list.id,
            travel_list.driver,
            travel_list.title,
            travel_list.description,
            travel_list.type,
            travel_list.coupon_name,
            travel_list.coupon_rate,
            travel_list.number,
            travel_list.image,
            travel_list.agency,
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
                    'id', travel_seats.id,
                    'number', travel_seats.number,
                    'position', travel_seats.position,
                    'travel_id', travel_seats.travel_id,
                    'booked', travel_seats.booked
                )
            ) AS seats,
            jsonb_build_object(
                'id', travel_departures_and_returns.id,
                'from', travel_departures_and_returns.depart_from,
                'to', travel_departures_and_returns.depart_to,
                'date', travel_departures_and_returns.date,
                'depart_time', travel_departures_and_returns.depart_time,
                'arrival_time', travel_departures_and_returns.arrival_time,
                'seats_booked', travel_departures_and_returns.seats_booked,
                'stops', travel_departures_and_returns.stops,
                'price', travel_departures_and_returns.price,
                'duration', travel_departures_and_returns.duration,
                'arrival_date', travel_departures_and_returns.arrival_date,
                'type', travel_departures_and_returns.type,
                'travel_id', travel_departures_and_returns.travel_id
            ) as departure
            FROM
                travel_list
            INNER JOIN drivers
            ON travel_list.agency = drivers.agency

            INNER JOIN travel_seats
            ON travel_list.id = travel_seats.travel_id

            INNER JOIN travel_departures_and_returns
                ON travel_list.id = travel_departures_and_returns.travel_id

            WHERE
                travel_list.agency = $1

            GROUP BY
                travel_list.id,
                drivers.id,
                travel_departures_and_returns.id
    `

    try {
        const busSeatsResult: QueryResult = await pool.query(busesQs, [agencyId])

        const busList = busSeatsResult.rows

        return res.status(200).json(busList)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}