import { Request, Response } from "express"
import { QueryResult } from "pg"
import { offers } from "../../demo-data"
import pool from "../../models/db/postgres"

import { Seats, Departure, Review, Driver, TravelItem } from "../../types"

export default async function (req: Request, res: Response): Promise<Response> {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1 < 10 ? `0${today.getMonth() + 1}` : today.getMonth() + 1
    const date = today.getDate() < 10 ? `0${today.getDate()}` : today.getDate()
    const hours = today.getHours() < 10 ? `0${today.getHours()}` : today.getHours()
    const minutes = today.getMinutes() < 10 ? `0${today.getMinutes()}` : today.getMinutes()

    try {
        const dateToday = `${year}-${month}-${date}`
        const timeNow = `${hours}:${minutes}`

        const departuresListQs = `
            SELECT
                id,
                depart_from AS from,
                depart_to AS to,
                date,
                depart_time,
                arrival_time,
                seats_booked,
                stops,
                price,
                duration,
                arrival_date,
                type,
                travel_id
            FROM travel_departures_and_returns
            WHERE
                date >= $1
            AND
                depart_time >= $2
        `

        const seatsQs = `
            SELECT
                id,
                number,
                position,
                travel_id,
                booked
            FROM
                travel_seats
            WHERE
                travel_id = $1 `

        const busListQs = `
            SELECT
                id,
                driver,
                title,
                description,
                type,
                coupon_name,
                coupon_rate,
                number,
                image,
                agency
            
            FROM
                travel_list
            WHERE id = $1 AND type = 'offer'`

        const driverQs = `SELECT * FROM drivers WHERE id = $1`
        const agencyQs = `SELECT id, name AS agency FROM agencies WHERE id = $1`

        // const driverReviewsQs = `SELECT * FROM driver_reviews WHERE driver_id = $1`

        const departureRes: QueryResult = await pool.query(departuresListQs, [dateToday, timeNow])

        const departureRows = departureRes.rows as Departure[]

        const list = departureRows?.map(async (departure) => {
            const busRes: QueryResult = await pool.query(busListQs, [departure.travel_id])
            const [bus] = busRes.rows

            const seatsRes: QueryResult = await pool.query(seatsQs, [bus.id])
            const seats = seatsRes.rows as Seats[]

            const rowsRes: QueryResult = await pool.query(driverQs, [bus.driver])

            const [driver] = rowsRes.rows as Driver[]

            const agencyRes: QueryResult = await pool.query(agencyQs, [bus.agency])

            const [agency] = agencyRes.rows

            // const { rows: driverReviews } = await pool.query(driverReviewsQs, [driver?.id])

            const travelItem: TravelItem = {
                ...bus,
                ...agency,
                driver: { ...driver, reviews: [] }, //remember to change the value of reviews
                seats,
                departure: {
                    from: departure?.from,
                    to: departure?.to,
                    date: departure?.date,
                    depart_time: departure?.depart_time,
                    arrival_time: departure?.arrival_time,
                    seats_booked: departure?.seats_booked,
                    stops: departure?.stops,
                    price: departure?.price,
                    duration: departure?.duration,
                    arrival_date: departure?.arrival_date,
                    type: departure?.type,
                    travel_id: departure?.travel_id,
                },
            }

            return travelItem
        })

        const offersList: TravelItem[] = await Promise.all(list)

        // handle database query

        return res.status(200).json([...offersList, ...offers])
    } catch (err) {
        return res.status(500).json({ message: "Server error" })
    }
}
