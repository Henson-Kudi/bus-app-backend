import { Request, Response } from "express"
import { QueryResult } from "pg"
import { AgencyReview } from "../../types"
import pool from "../../models/db/postgres"
import { uuidv4Regex } from "../../configs"

export default async function createAgencyReview(req: Request, res: Response): Promise<Response> {
    const data: AgencyReview | undefined = req.body
    const agencyId = req.params.id as string

    const qs = `INSERT INTO agency_reviews( reviewer_id, agency, message, stars ) VALUES( $1, $2, $3, $4 ) RETURNING *`

    try {
        if (
            !data ||
            !data.reviewer_id ||
            !data.message ||
            !data.stars ||
            !uuidv4Regex.test(agencyId)
        ) {
            throw new Error("Invalid data sent")
        }
        const result: QueryResult = await pool.query(qs, [
            data.reviewer_id,
            agencyId,
            data.message,
            data.stars,
        ])

        const [review]: AgencyReview[] = result.rows

        return res.status(200).json(review)
    } catch (err: any) {
        console.log(err)

        if (err.message === "Invalid data sent") {
            return res.status(400).json({ message: err.message })
        }

        return res.status(500).json({ message: "Internal server error" })
    }
}
