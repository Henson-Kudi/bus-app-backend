import { Request, Response } from "express"
import { QueryResult } from "pg"
import { BusSeats, Departure, Seats, TravelItem, TravelList } from "../../types"
import pool from "../../models/db/postgres"

export default async function updateTravelBus(req: Request, res: Response): Promise<Response> {
    const data: TravelItem = req.body

    // we want to check if there are already booked seats and the number of seats the new bus has is not same with number of seats of already listed bus, we deny the update

    if (
        !data.agency ||
        !data.driver.id ||
        !data.seats.length ||
        !Object.keys(data.departure).length
    ) {
        return res.status(500).json({ message: "Please submit valid data" })
    }

    const oldTravelListQs = `SELECT * FROM travel_list WHERE id = $1;`

    const travelListQs = `
        UPDATE travel_list
            SET driver = $1,
                title = $2,
                description = $3,
                type = $4,
                coupon_name = $5,
                coupon_rate = $6,
                number = $7,
                image = $8
            WHERE
                id = $9
            AND
                agency = $10
        RETURNING *;
    `

    const departureQs = `
        UPDATE travel_departures_and_returns
            SET
                depart_from = $1,
                depart_to = $2,
                date = $3,
                depart_time = $4,
                arrival_time = $5,
                stops = $6,
                price = $7,
                duration = $8,
                arrival_date = $9,
                type = $10
            WHERE
                id = $11
            AND 
                travel_id = $12
        RETURNING *;
    `

    const updateBusSeats = `
        UPDATE travel_seats
            SET position = $1
            WHERE number = $2
            AND travel_id = $3
        RETURNING *;
    `

    try {
        const travelItemResult: QueryResult = await pool.query(oldTravelListQs, [data?.id])
        const [travelItem]: TravelItem[] = travelItemResult.rows

        // if (travelItem.number_of_seats !== data.number_of_seats) {
        //     return res
        //         .status(500)
        //         .json({ message: "Cannot replace bus with a new bus that has less or more seats" })
        // }

        const travelListResult: QueryResult = await pool.query(travelListQs, [
            data.driver.id,
            data.title,
            data.description,
            data.type,
            data.coupon_name,
            data.coupon_rate,
            data.number,
            data.image,
            data.id,
            data.agency,
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
            data.departure.id,
            data.departure.travel_id ?? travelListData.id,
        ])

        const [departureData]: Departure[] = departurResult.rows

        const travel_seats = data.seats.length
            ? await Promise.all(
                  data.seats
                      ?.filter((seat) => !seat.booked)
                      ?.map(async (seat) => {
                          const seatResult: QueryResult = await pool.query(updateBusSeats, [
                              seat.position,
                              seat.number,
                              travelListData.id ?? data.departure.travel_id,
                          ])

                          const [updatedSeat]: BusSeats[] = seatResult.rows

                          return updatedSeat
                      })
              )
            : []

        return res
            .status(200)
            .json({ ...travelListData, departure: departureData, seats: travel_seats })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}
