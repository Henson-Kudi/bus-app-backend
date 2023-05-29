import { Request, Response } from "express"
import { QueryResult } from "pg"
import jwt from "jsonwebtoken"
import pool from "../../../models/db/postgres"

export default async function agencyLogout(req: Request, res: Response): Promise<Response> {
    const deleteTokenQs = `DELETE FROM refresh_tokens WHERE token = $1;`

    try {
        const cookie = req.cookies
        if (!cookie?.refresh_token) {
            return res.status(204).json({ token: "" })
        }

        const refresh_token = cookie.refresh_token

        const verifiedJwt = jwt.verify(refresh_token, process.env.JWT_REFERESH_TOKEN_SECRET!)

        if (!verifiedJwt) {
            res.clearCookie("refresh_token", {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 24 * 60 * 60 * 1000,
            })
            await pool.query(deleteTokenQs, [refresh_token])

            return res.status(204).json({ token: "" })
        }

        await pool.query(deleteTokenQs, [refresh_token])

        res.clearCookie("refresh_token", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000,
        })

        return res.status(204).json({ token: "" })
    } catch (err: any) {
        console.log(err)

        res.clearCookie("refresh_token")

        return res.status(500).json({ message: "Internal server error", token: "" })
    }
}
