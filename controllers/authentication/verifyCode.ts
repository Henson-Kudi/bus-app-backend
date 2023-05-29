import { Request, Response } from "express"
import pool from "../../models/db/postgres"

export default async function verifyCode(req: Request, res: Response): Promise<Response> {
    try {
        const data:
            | {
                  type: "agency" | "customer"
                  id: string
                  code: string
              }
            | undefined = req.body

        const verifyCustReq = `
            SELECT * FROM customers WHERE id = $1 AND verification_code = $2
        `

        const updateCustReq = `UPDATE customers SET contact_verified = true WHERE id = $1 RETURNING *`

        const verifyAgencyReq = `
            SELECT * FROM agencies WHERE id = $1 AND verification_code = $2
        `
        const updateAgencyReq = `UPDATE customers SET contact_verified = true WHERE id = $1 RETURNING *`

        if (!data || !data.code || !data.id || !data.type) {
            throw new Error("400")
        }

        if (data.type == "agency") {
            const result = await pool.query(verifyAgencyReq, [data.id, data.code])

            const [rows] = result?.rows

            if (!rows) {
                throw new Error("400")
            }

            const updateRes = await pool.query(updateAgencyReq, [data.id])

            const [updated] = updateRes.rows

            return res.status(200).json(updated)
        }

        const queryRes = await pool.query(verifyCustReq, [data.id, data.code])

        const [rows] = queryRes.rows
        if (!rows) {
            throw new Error("400")
        }

        const updateCustomerRes = await pool.query(updateCustReq, [data.id])
        const [updatedCust] = updateCustomerRes.rows

        return res.status(200).json(updatedCust)
    } catch (err: any) {
        // console.log(err)
        return res.status(500).json({
            message: "Internal server error",
        })
    }
}
