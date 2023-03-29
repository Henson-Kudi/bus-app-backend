import { Request } from "express"
import { Interface } from "readline"

interface DriverReview {
    driver_id: string
    reviewer_id: string
    comment: string
    rating: string
}

export default async function addDriverReview(req: Request, res: Response): Promise<Response> {
    const { rating, comment, driver_id, reviewer_id } = req.body as DriverReview
    const driverReviewQs = `
        INSERT INTO driver_reviews(reviewer_id, driver_id, message, stars) VALUES($1, $2, $3, $4) RETURNING *;
    `
    try {
        return res
    } catch (err) {
        return res
    }
}
