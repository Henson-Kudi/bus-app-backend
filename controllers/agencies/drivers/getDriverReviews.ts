import { Request, Response } from "express"
import { QueryResult } from "pg"
import pool from "../../../models/db/postgres"

export default async function getDriverReviews(req: Request, res: Response): Promise<Response> {
    const driverId: string | undefined = req.params.driverId

    const qs = `
        SELECT
            driver_reviews.id AS id,
            message,
            stars,
            customers.name AS reviewer_name,
            driver_id,
            reviewer_id
        FROM driver_reviews
        JOIN customers
            ON customers.id = driver_reviews.reviewer_id
        WHERE
            driver_id = $1
    `

    try {
        if (!driverId) {
            throw new Error("Cannot find driver of undefined")
        }
        const result: QueryResult = await pool.query(qs, [driverId])

        const reviews = result.rows
        return res.status(200).json(reviews)
    } catch (err: any) {
        console.log(err)
        if (err.message === "Cannot find driver of undefined") {
            return res.status(400).json({ message: err.message })
        }
        return res.status(500).json({ ...err, message: "internal server error" })
    }
}
