import { Request, Response } from "express"
import { QueryResult } from "pg"
import { uuidv4Regex } from "../../../configs"
import { DriverDetails, RequestInterface, Review } from "../../../types"
import pool from "../../../models/db/postgres"

export default async function getDriver(req: RequestInterface, res: Response): Promise<Response> {
    const agencyId: undefined | string = req.user.id
    const driverId: undefined | string = req.params.driverId

    if (!agencyId || !uuidv4Regex.test(agencyId) || !driverId || !uuidv4Regex.test(driverId)) {
        return res.status(500).json({ message: "Please submit valid driver data" })
    }

    console.log(agencyId, driverId)

    const driverQs = `
        SELECT
            drivers.id,
            drivers.name,
            drivers.contact,
            drivers.email,
            drivers.position,
            drivers.agency,
            drivers.rating,
            drivers.image,
            agencies.name AS company
        FROM drivers INNER JOIN agencies ON drivers.agency = agencies.id WHERE drivers.agency = $1 AND drivers.id = $2;
    `

    const driverReviesQs = `
        SELECT * FROM driver_reviews WHERE driver_id = $1
    `

    try {
        const queryResponse: QueryResult = await pool.query(driverQs, [agencyId, driverId])

        const [driverData]: DriverDetails[] = queryResponse.rows

        const driverReviewsRes: QueryResult = await pool.query(driverReviesQs, [driverId])

        const driverReviews: Review[] = driverReviewsRes.rows

        return res.status(200).json({ ...driverData, reviews: driverReviews })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error. Please try again later" })
    }
}
