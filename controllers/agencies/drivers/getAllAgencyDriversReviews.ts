import { Request, Response } from "express"
import { QueryResult } from "pg"
import pool from "../../../models/db/postgres"
import { DriverReview } from "../../../types"

export default async function getAllAgencyDriversReviews(
    req: Request,
    res: Response
): Promise<Response> {
    const agencyId: string | undefined = req.params.id

    const qs = `
        SELECT
            driver_reviews.id AS id,
            customers.name AS reviewer_name,
            message,
            stars,
            driver_id,
            reviewer_id
        FROM driver_reviews
        JOIN drivers
            ON drivers.id = driver_id
        JOIN customers
            ON customers.id = reviewer_id
        JOIN agencies
            ON agencies.id = drivers.agency
        WHERE agencies.id = $1
    `

    try {
        if (!agencyId) {
            throw new Error("Cannot find agency of undefined")
        }
        const result: QueryResult = await pool.query(qs, [agencyId])

        const agencyReviews: DriverReview[] = result.rows

        return res.status(200).json(agencyReviews)
    } catch (err: any) {
        console.log(err, "\n\n", err.message)
        if (err.message === "Cannot find agency of undefined") {
            return res.status(400).json({ message: err.message })
        }
        return res.status(500).json({ ...err, message: "internal server error" })
    }
}
