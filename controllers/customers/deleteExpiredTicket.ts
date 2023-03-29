import { Request, Response } from "express"
import { QueryResult } from "pg"
import { uuidv4Regex } from "../../configs"
import pool from "../../models/db/postgres"

export default async function deleteExpiredTicket(req: Request, res: Response): Promise<Response> {
    const bookingQs = `DELETE FROM customer_bookings WHERE id = $1 RETURNING *`
    const id: string | undefined = req.params.id

    const test = "SELECT * FROM customer_bookings WHERE id = $1"

    try {
        if (!id) {
            return res.status(400).json({ message: "Invalid data sent" })
        }

        if (!uuidv4Regex.test(id)) {
            return res.status(404).json({ message: "Requested data not found" })
        }

        const bookingRes: QueryResult = await pool.query(bookingQs, [id])
        const [booking]: any[] = bookingRes.rows

        if (!booking?.id) {
            return res.status(404).json({ message: "Requested data not found" })
        }

        return res.status(200).json({ ...booking, message: "Deleted Successfully" })
    } catch (err: any) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}
