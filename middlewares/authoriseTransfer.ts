import { NextFunction, Request, Response } from "express"
import { QueryResult } from "pg"
import pool from "../models/db/postgres"
import { CustomerBooking, Departure } from "../types"

export default async function authoriseRefund(req: Request, res: Response, next: NextFunction) {
    try {
        const data: { bookingId: string; departureId: string } = req.body
        if (!data.bookingId || !data.departureId || !data) {
            throw new Error("invalid data")
        }

        const qs = `SELECT * FROM customer_bookings WHERE id = $1`
        const departursQs = `SELECT * FROM travel_departures_and_returns WHERE id = $1`

        const bookingRes: QueryResult = await pool.query(qs, [data.bookingId])
        const [booking] = bookingRes.rows as CustomerBooking[]

        if (!booking) {
            throw new Error("no booking")
        }

        const departureRes: QueryResult = await pool.query(departursQs, [data.departureId])
        const [departure] = departureRes.rows as Departure[]

        if (!departure) {
            throw new Error("invalid booking")
        }

        const today = new Date().getTime()
        const busDepartDate = new Date(departure?.date).getTime()

        const _48hrs = 1000 * 60 * 60 * 48

        if (busDepartDate - today < _48hrs) {
            throw new Error("less than 48")
        }
        next()
    } catch (err: any) {
        console.log(err.message)

        if (err.message === "invalid data") {
            return res.status(400).json({ message: "invalid data sent" })
        }

        if (err.message === "no booking" || err.message === "invalid booking") {
            return res.status(400).json({ message: "Unexpected error occured" })
        }

        if (err.message === "less than 48") {
            return res
                .status(400)
                .json({ message: "Cannot cancel booking before 48hrs of travel date." })
        }
        return res.status(500).json({ message: "Internal server error" })
    }
}
