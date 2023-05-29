import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { RequestInterface } from "../types"

export default async function verifyAgency(
    req: RequestInterface,
    res: Response,
    next: NextFunction
) {
    try {
        const authHeader = req.headers["authorization"]

        if (!authHeader) {
            return res.sendStatus(401)
        }

        const token = authHeader.split(" ")[1]

        const decoded = await jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET!)
        if (!decoded) {
            return res.sendStatus(403)
        }

        req.user = decoded
        next()
    } catch (err: any) {
        console.log(err)
        return res.sendStatus(403)
    }
}
