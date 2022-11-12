import { Request, Response } from "express"
import { reviews } from "../../demo-data"

export default function (req: Request, res: Response) {
    res.status(200).json(reviews)
}
