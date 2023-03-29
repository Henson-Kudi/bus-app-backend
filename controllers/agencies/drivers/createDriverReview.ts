import { Request, Response } from "express"
import { QueryResult } from "pg"
import { DriverReview } from "../../../types"
import pool from "../../../models/db/postgres"

export default async function createDriverReview(req: Request, res: Response): Promise<Response> {
    const data: DriverReview | undefined = req.body

    const qs = `INSERT INTO driver_reviews( reviewer_id, driver_id, message, stars ) VALUES( $1, $2, $3, $4 ) RETURNING *`

    try {
        if (!data || !data.reviewer_id || !data.driver_id || !data.message || !data.stars) {
            throw new Error("Invalid data sent")
        }
        const result: QueryResult = await pool.query(qs, [
            data.reviewer_id,
            data.driver_id,
            data.message,
            data.stars,
        ])

        const [review]: DriverReview[] = result.rows

        return res.status(200).json(review)
    } catch (err: any) {
        console.log(err)

        if (err.message === "Invalid data sent") {
            return res.status(400).json({ message: err.message })
        }

        return res.status(500).json({ message: "Internal server error" })
    }
}
