import { Request, Response } from "express"
import { QueryResult } from "pg"
import pool from "../../models/db/postgres"

export default async function getDriverReviews(req: Request, res: Response): Promise<Response> {
    const agencyId: string | undefined = req.params.id

    const qs = `
        SELECT
            agency_reviews.id AS id,
            message,
            stars,
            customers.name AS reviewer_name,
            agency,
            reviewer_id
        FROM agency_reviews
        JOIN customers
            ON customers.id = agency_reviews.reviewer_id
        WHERE
            agency = $1
    `

    try {
        if (!agencyId) {
            throw new Error("Cannot find agency of undefined")
        }
        const result: QueryResult = await pool.query(qs, [agencyId])

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
