import { Request, Response } from "express"
import { QueryResult } from "pg"
import { tickets } from "../../demo-data"
import pool from "../../models/db/postgres"
import { TravelItem, Seats, Customer } from "../../types"

export default async function getMyTickets(req: Request, res: Response): Promise<Response> {
    const { userId } = req.params

    const bookingsQs = `SELECT * FROM customer_bookings WHERE id = $1`
    const customerQs = `
        SELECT
            id,
            name,
            email,
            country,
            contact,
            city,
            address
        FROM
            customers
        WHERE
            id = $1
    `

    const travelQs = `SELECT * FROM travel_list WHERE id = $1`
    const seatsQs = `SELECT * travel_seats FROM WHERE number = $1`

    try {
        const myBookingsList: QueryResult = await pool.query(bookingsQs, [userId])

        const myBookingsListRows = myBookingsList.rows as {
            customer_id: string
            travel_id: string
            seat_number: string
            id: string
        }[]

        const myBookings = myBookingsListRows?.map(async (item) => {
            const customers: QueryResult | any =
                item.customer_id && (await pool.query(customerQs, [item.customer_id]))

            const [customer] = customers.rows as Customer[]

            const travelTickets: QueryResult | any =
                item.travel_id && (await pool.query(travelQs, [item.travel_id]))

            const [ticket] = travelTickets.rows

            const seats: QueryResult | any =
                item.seat_number && (await pool.query(seatsQs, [item.seat_number]))
            const [seat] = seats.rows as Seats[]

            return {
                ...item,
                ...customer,
                ...seat,
                ...ticket,
            }
        })

        const myTickets = await Promise.all(myBookings)

        const pendingtickets = tickets?.filter(
            (ticket) => new Date(ticket?.departure?.date) > new Date()
        )

        const expiredTickets = tickets?.filter(
            (ticket) => new Date(ticket?.departure?.date) < new Date()
        )

        return res.status(200).json({ tickets: [...pendingtickets, ...myTickets], expiredTickets })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}
