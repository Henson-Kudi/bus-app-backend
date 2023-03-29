import { Request, Response } from "express"
import { QueryResult } from "pg"
import pool from "../../models/db/postgres"
import { Customer } from "../../types"

export default async function getCustomer(req: Request, res: Response): Promise<Response> {
    const customer_id: string = req.params.id

    const customersQs = `SELECT * FROM customers WHERE id = $1;`

    try {
        const queryRes: QueryResult = await pool.query(customersQs, [customer_id])

        const [customer]: Customer[] = queryRes.rows

        return res.status(200).json(customer)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: err, message: "Internal server error" })
    }
}
