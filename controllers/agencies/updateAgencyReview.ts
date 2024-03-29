import { Request, Response } from "express"
import { uuidv4Regex } from "../../configs"
import { DriverReview } from "../../types"
import pool from "../../models/db/postgres"

export default async function updateAgencyReview(req: Request, res: Response): Promise<Response> {
    const userId: string | undefined | string[] = req.headers.user
    const reviewId: string | undefined = req.params.reviewId
    const agencyId: string | undefined = req.params.id

    const data: { message: string; stars: string } | undefined = req.body

    const qs = `
        UPDATE
            agency_reviews
        SET
            message= $1,
            stars = $2
        WHERE
            id = $3
        AND
            reviewer_id = $4
        AND
            agency = $5
        RETURNING *
    `

    try {
        if (!userId || !uuidv4Regex.test(userId.toString())) {
            throw new Error("Cannot edit post.")
        }
        if (!data || !reviewId) {
            throw new Error("Invalid credentials")
        }

        const result = await pool.query(qs, [data.message, data.stars, reviewId, userId, agencyId])
        const [updatedReview]: DriverReview[] = result.rows

        return res.status(200).json(updatedReview)
    } catch (err: any) {
        console.log(err)
        if (err.message === "Cannot edit post" || err.message === "Invalid credentials") {
            return res.status(400).json({ message: err.message })
        }
        return res.status(500).json({ meeage: "internal server error" })
    }
}
