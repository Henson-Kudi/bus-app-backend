import { Request, Response } from "express"
import { QueryResult } from "pg"
import pool from "../../models/db/postgres"
import { Customer } from "../../types"

export default async function getCustomers(req: Request, res: Response): Promise<Response> {
    const customersQs = `SELECT * FROM customers;`

    try {
        const queryRes: QueryResult = await pool.query(customersQs)

        const customers: Customer[] = queryRes.rows

        return res.status(200).json(customers)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: err, message: "Internal server error" })
    }
}
