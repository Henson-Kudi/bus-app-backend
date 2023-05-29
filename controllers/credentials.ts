import { NextFunction, Request, Response } from "express"
import allowedOrigins from "../configs/allowedOrigins"

export default async function credentials(req: Request, res: Response, next: NextFunction) {
    const origin = req.headers.origin!

    if (allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Credentials", "true")
    }
    res.header("Access-Control-Allow-Credentials", "true") // just for mean time cuz we need to use for the app too
    next()
}
