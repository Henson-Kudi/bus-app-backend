import { Request, Response } from "express"
import { QueryResult } from "pg"
import { uuidv4Regex } from "../../configs"
import { AgencyReview } from "../../types"
import pool from "../../models/db/postgres"

export default async function deleteAgencyReview(req: Request, res: Response): Promise<Response> {
    const agencyId: string | undefined = req.params.id
    const reviewId: string | undefined = req.params.reviewId

    const qs = "DELETE FROM agency_reviews WHERE agency = $1 AND id = $2 RETURNING *"

    if (!agencyId || !uuidv4Regex.test(agencyId)) {
        throw new Error("Invalid Id")
    }

    try {
        const result: QueryResult = await pool.query(qs, [agencyId, reviewId])

        const [deletedReview]: AgencyReview[] = result.rows

        return res.status(200).json({ ...deletedReview, message: "Deleted review successfully" })
    } catch (err: any) {
        console.log(err)

        if (err.message === "Invalid Id") {
            return res.status(400).json({ message: err.message })
        }
        return res.status(500).json({ message: "Internal server error" })
    }
}
