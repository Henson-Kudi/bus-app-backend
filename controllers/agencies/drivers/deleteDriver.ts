import { Request, Response } from "express"
import { QueryResult } from "pg"
import { uuidv4Regex } from "../../../configs"
import { DriverDetails, RequestInterface, Review } from "../../../types"
import pool from "../../../models/db/postgres"

export default async function deleteDriver(req: RequestInterface, res: Response): Promise<Response> {
    const agencyId: string | undefined = req.user.id
    const driverId: string | undefined = req.params.driverId

    if (!agencyId || !uuidv4Regex.test(agencyId) || !driverId || !uuidv4Regex.test(driverId)) {
        return res.status(500).json({ message: "Please submit valid driver data" })
    }
    const driverQs = `
        DELETE FROM drivers WHERE agency = $1 AND id = $2 RETURNING *
    `

    const reviewsQs = `
        DELETE FROM driver_reviews WHERE driver_id = $1
    `

    try {
        const driverRes: QueryResult = await pool.query(driverQs, [agencyId, driverId])

        const [deletedDriver]: DriverDetails[] = driverRes.rows

        const reviewsRes: QueryResult = await pool.query(reviewsQs, [driverId])

        const deletedReviews: Review[] = reviewsRes.rows

        return res.status(200).json({
            ...deletedDriver,
            message: "Driver deleted successfully",
            reviews: deletedReviews,
        })
    } catch (err) {
        console.log(err)

        return res.status(500).json({ message: "Internal server error. Please try later" })
    }
}
