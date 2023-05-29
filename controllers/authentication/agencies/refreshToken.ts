import { Request, Response } from "express"
import jwt from "jsonwebtoken"
import { QueryResult } from "pg"
import pool from "../../../models/db/postgres"
import { AgencyData, RefreshToken } from "../../../types"

export default async function refreshToken(req: Request, res: Response): Promise<Response> {
    const tokenQs = `SELECT * FROM refresh_tokens WHERE token = $1`

    const agencyDataQs = "SELECT * FROM agencies WHERE id = $1"

    try {
        const cookie = req.cookies

        const accessTokenSecret: string | undefined = process.env.JWT_ACCESS_TOKEN_SECRET

        if (!cookie?.refresh_token) {
            return res.sendStatus(401)
        }

        const refresh_token = cookie?.refresh_token

        const tokenRes: QueryResult = await pool.query(tokenQs, [refresh_token])
        const [token]: RefreshToken[] = tokenRes.rows

        if (!token) {
            return res.sendStatus(403)
        }

        const isVerified = jwt.verify(refresh_token, process.env.JWT_REFERESH_TOKEN_SECRET!) as {
            id: string
        }

        if (!isVerified || isVerified.id !== token.agency) {
            return res.sendStatus(403)
        }

        const agencyRes: QueryResult = await pool.query(agencyDataQs, [token.agency])
        const [agency]: AgencyData[] = agencyRes.rows

        const accessToken = jwt.sign({ id: isVerified.id! ?? token.agency }, accessTokenSecret!, {
            expiresIn: "15m", // should be 15m
        })

        return res.status(200).json({ ...agency, token: accessToken })
    } catch (err) {
        console.log("err", err)

        return res.status(500).json({ message: "Internal server error" })
    }
}
