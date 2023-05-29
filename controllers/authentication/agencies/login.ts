import { Request, Response } from "express"
import { QueryResult } from "pg"
import jwt from "jsonwebtoken"
import { emailRegex } from "../../../configs"
import { AgencyData, LoginData, RefreshToken } from "../../../types"
import pool from "../../../models/db/postgres"
import confirmPassword from "../../../configs/confirmPassword"

export default async function loginAgency(req: Request, res: Response): Promise<Response> {
    const data: LoginData | undefined = req.body

    if (!data || !emailRegex.test(data.email) || !data.password) {
        return res.status(400).json({ message: "Invalid username or password" })
    }

    const agencyQs = `SELECT * FROM agencies WHERE email = $1`

    const newRefreshTokenQs = `INSERT INTO refresh_tokens(agency, token) VALUES($1, $2) RETURNING *;`

    const agencyRefreshTokensQs = `SELECT * FROM refresh_tokens WHERE agency = $1;`

    try {

        const agencyResult: QueryResult = await pool.query(agencyQs, [data.email])

        const [agencyData]: AgencyData[] = agencyResult.rows

        // if no user is found with provided email, we want to return an error of invalid credentials

        if (!agencyData) {
            return res.status(401).json({ message: "Invalid username or password" })
        }

        // check if the agency email is verified

        if (!agencyData.email_verified) {
            return res.status(401).json({
                message: "Account not verified.",
                verifyLink: "", //to be added
            })
        }

        // check if hashed password confirms to saved hashed password in db

        const confirmedHashedPassword = await confirmPassword(
            data.password,
            agencyData.password_hash
        )

        if (!confirmedHashedPassword) {
            return res.status(401).json({ message: "Invalid username or password" })
        }

        const accessTokenSecret: string | undefined = process.env.JWT_ACCESS_TOKEN_SECRET
        const refreshTokenSecret: string | undefined = process.env.JWT_REFERESH_TOKEN_SECRET

        const oldTokensRes: QueryResult = await pool.query(agencyRefreshTokensQs, [agencyData?.id])

        let oldTokens: RefreshToken[] = oldTokensRes.rows

        let tokensToDelete: { token: string }[] | null = null

        if (oldTokens && oldTokens?.length) {
            tokensToDelete = await Promise.all(
                oldTokens?.filter(async (token) => {
                    const valid = await new Promise((reject, ressolve) => {
                        jwt.verify(token?.token, refreshTokenSecret!, (err, code) => {
                            if (err) {
                                ressolve({ token: token.token })
                            } else {
                                reject(null)
                            }
                        })
                    }).catch((err) => err)

                    return valid !== null
                })
            )
        }

        if (tokensToDelete && tokensToDelete?.length) {
            const deleteRes: QueryResult = await pool.query(
                `DELETE FROM refresh_tokens WHERE token IN(
                ${tokensToDelete?.map((item, i) => `$${i + 1}`)?.join(", ")}
            )`,
                tokensToDelete?.map((item) => item?.token)
            )
        }

        const accessToken = jwt.sign({ id: agencyData.id }, accessTokenSecret!, {
            expiresIn: "15m", // should be 15m
        })

        const refreshToken = jwt.sign({ id: agencyData.id }, refreshTokenSecret!, {
            expiresIn: "1d",
        })

        await pool.query(newRefreshTokenQs, [agencyData.id, refreshToken])

        return res
            .status(200)
            .cookie("refresh_token", refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 24 * 60 * 60 * 1000,
            })
            .json({ ...agencyData, token: accessToken })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}
