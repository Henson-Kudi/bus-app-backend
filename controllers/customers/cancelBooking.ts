import { Request, Response } from "express"
import pool from "../../models/db/postgres"
import { QueryResult } from "pg"
import { Customer, CustomerBooking } from "../../types"
import twilioClient, { sendMessage } from "../../configs/twilio"

interface CancelBooking extends CustomerBooking {
    price: number
}

export default async function cancelBooking(req: Request, res: Response): Promise<Response> {
    const data: CancelBooking | undefined = req.body
    const companyName = process.env.COMPANY_NAME

    const departureQs = `SELECT * FROM travel_departures_and_returns WHERE travel_id  = $1`

    const customerQs = `SELECT * FROM customers WHERE id = $1;`

    const deleteBookingQs = `DELETE FROM customer_bookings WHERE id = $1 RETURNING *;`

    const updateTravelSeatsQs = `
        UPDATE travel_seats 
            SET booked = $1
            WHERE number = $2
            AND position = $3
            AND travel_id = $4
        RETURNING *;
    `
    try {
        if (!data || !data.id || !data.position || !data.seat_number || !data.travel_id) {
            throw new Error("400-Invalid data sent.")
        }

        const deleteRes: QueryResult = await pool.query(deleteBookingQs, [data.id])

        const [deletedData]: CustomerBooking[] = deleteRes.rows

        const updateRes: QueryResult = await pool.query(updateTravelSeatsQs, [
            false,
            data.seat_number,
            data.position,
            data.travel_id,
        ])

        const customerRes:QueryResult = await pool.query(customerQs, [data.customer_id])

        const [customerData]:Customer[] = customerRes.rows 

        const message = await sendMessage({
            body: `CONFIRMATION:\nYour booking for ticket #${deletedData?.ticket_number} has been successfully cancelled.\nThank you for using ${companyName}`,
            to: `${customerData.country_code!}${customerData.contact}`,
        })

        return res.status(200).json({ message: "Booking cancelled successfully" })
    } catch (err: any) {
        if (err.message?.includes("400-")) {
            return res.status(400).json({ message: err?.message?.split("-")[1] })
        }
        return res.status(500).json({ message: "Internal server error" })
    }
}
