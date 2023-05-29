import { Request, Response } from "express"
import { QueryResult } from "pg"
import { uuidv4Regex } from "../../../configs"
import { DriverReview, RequestInterface } from "../../../types"
import pool from "../../../models/db/postgres"

export default async function deleteDriverReview(req: RequestInterface, res: Response): Promise<Response> {
    const driverId: string | undefined = req.params.driverId
    const reviewId: string | undefined = req.params.reviewId

    const qs = "DELETE FROM driver_reviews WHERE driver_id = $1 AND id = $2 RETURNING *"

    if (!driverId || !uuidv4Regex.test(driverId)) {
        throw new Error("Invalid Id")
    }

    try {
        const result: QueryResult = await pool.query(qs, [driverId, reviewId])

        const [deletedReview]: DriverReview[] = result.rows

        return res.status(200).json({ ...deletedReview, message: "Deleted review successfully" })
    } catch (err: any) {
        console.log(err)

        if (err.message === "Invalid Id") {
            return res.status(400).json({ message: err.message })
        }
        return res.status(500).json({ message: "Internal server error" })
    }
}
