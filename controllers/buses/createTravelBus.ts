import { Request, Response } from "express"
import { Query, QueryResult } from "pg"
import { AgencyData, Departure, Seats, TravelItem, TravelList } from "../../types"
import pool from "../../models/db/postgres"
import format, { string } from "pg-format"
import { sendNotificationToMany } from "../../configs/expoNotifications"

export default async function createTravelBus(req: Request, res: Response): Promise<Response> {
    const data: TravelItem = req.body

    const companyName = process.env.COMPANY_NAME

    const checkDate = data.departure.date.split("/")

    const departDate = new Date(data.departure.date)
    const departHrs = Number(data?.departure?.depart_time?.split(":")[0]) * 60 * 60 * 1000
    const departMins = Number(data?.departure?.depart_time?.split(":")[1]) * 60 * 1000

    const departTime = departHrs + departMins

    departDate.setTime(departDate.getTime() + departTime)

    const today = new Date()

    const checkTravelBus = `SELECT id FROM travel_list WHERE number = $1`

    const checkExistingBus = `SELECT id FROM travel_departures_and_returns WHERE date = $1 AND depart_time = $2 AND travel_id = $3`

    const travelListQs = `
        INSERT INTO travel_list(
            driver,
            title,
            description,
            type,
            coupon_name,
            coupon_rate,
            number,
            image,
            agency
            --number_of_seats
        )
        VALUES(
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9
                --$10
            )
        RETURNING *;
    `

    const agencyQs = "SELECT * FROM agencies WHERE id = $1"

    const departureQs = `
        INSERT INTO travel_departures_and_returns(
            depart_from,
            depart_to,
            date,
            depart_time,
            arrival_time,
            stops,
            price,
            duration,
            arrival_date,
            type,
            travel_id
        )
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *;
    `

    const travelSeatsQs = ` INSERT INTO travel_seats(number, position, travel_id, booked) VALUES %L RETURNING *`

    const customersQs = `SELECT notification_token FROM customers WHERE notification_token IS NOT NULL;`

    try {
        if (
            !data.agency ||
            !data.driver.id ||
            !data.seats.length ||
            !Object.keys(data.departure).length
        ) {
            return res.status(400).json({ message: "Please submit valid data" })
        }

        if (today > departDate) {
            return res.status(400).json({ message: "Departure date is already passed." })
        }

        const travelBusesRes: QueryResult = await pool.query(checkTravelBus, [data.number])

        if (travelBusesRes.rows.length) {
            const existingRes = await Promise.all(
                travelBusesRes.rows.map(async (item: { id: string }) => {
                    const existinRes: QueryResult = await pool.query(checkExistingBus, [
                        data.departure.date,
                        data.departure.depart_time,
                        item.id,
                    ])

                    return existinRes.rows.length ? true : false
                })
            )

            const existingItem = existingRes.filter((item) => item)

            if (existingItem.length) {
                return res.status(400).json({ message: "Bus already booked for this timing" })
            }
        }

        const travelListResult: QueryResult = await pool.query(travelListQs, [
            data.driver.id,
            data.title,
            data.description,
            data.type ?? "normal",
            data.coupon_name,
            data.coupon_rate,
            data.number,
            data.image,
            data.agency,
            // data.seats.length,
        ])
        const [travelListData]: TravelList[] = travelListResult.rows

        const departurResult: QueryResult = await pool.query(departureQs, [
            data.departure.from,
            data.departure.to,
            data.departure.date,
            data.departure.depart_time,
            data.departure.arrival_time,
            data.departure.stops,
            data.departure.price,
            data.departure.duration,
            data.departure.arrival_date,
            data.departure.type,
            travelListData.id,
        ])

        const busSeatsValues = data.seats?.map((seat) => [
            seat.number,
            seat.position,
            travelListData.id,
            false,
        ])
        const [departureData]: Departure[] = departurResult.rows

        const travelSeatsResult: QueryResult = await pool.query(
            format(travelSeatsQs, busSeatsValues)
        )

        const travel_seats: Seats[] = travelSeatsResult.rows

        const agencyRes: QueryResult = await pool.query(agencyQs, [data.agency])
        const [agencyData]: AgencyData[] = agencyRes.rows

        const customersRes: QueryResult = await pool.query(customersQs)

        const customerTokens: { notification_token: string }[] = customersRes.rows

        const notificationTickets = await sendNotificationToMany({
            tokens: customerTokens?.map((item) => item?.notification_token),
            data: {
                body: `${agencyData?.name} added a new offer. Checkit out`,
                title: companyName,
            },
        })

        return res
            .status(200)
            .json({ ...travelListData, departure: departureData, seats: travel_seats })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}
