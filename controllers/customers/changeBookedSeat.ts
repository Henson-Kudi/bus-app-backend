import { Request, Response } from "express"
import { QueryResult } from "pg"
import pool from "../../models/db/postgres"

type ChangeSeat = {
    oldSeat: {
        number: number //ticket number
        id: string //booking id
        position: string
        seat_number: string
        travel_id: string
    }
    selectedSeat: {
        number: number // seat number
        id: string
        position: string
        booked: boolean
        travel_id: string
    }
}

export default async function changeBookedSeat(req: Request, res: Response): Promise<Response> {
    const data: ChangeSeat | undefined = req.body

    const updateBookingQs = `
        UPDATE customer_bookings
            SET position = $1,
                seat_number = $2
        WHERE id = $3
        AND travel_id = $4
    `

    const updateTravelSeatQs = `
        UPDATE travel_seats
            SET booked = $1
        WHERE travel_id = $2
        AND number = $3
    `

    try {
        if (!data) {
            return res.status(400).json({ message: "Invalid data sent" })
        }

        await pool.query(updateBookingQs, [
            data.selectedSeat.position,
            data.selectedSeat.number,
            data.oldSeat.id,
            data.oldSeat.travel_id,
        ])

        await pool.query(updateTravelSeatQs, [
            false,
            data.selectedSeat.travel_id,
            data.oldSeat.seat_number,
        ])

        await pool.query(updateTravelSeatQs, [
            true,
            data.selectedSeat.travel_id,
            data.selectedSeat.number,
        ])
        return res.status(200).json({ message: "Successfully updated booking" })
    } catch (err: any) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}
