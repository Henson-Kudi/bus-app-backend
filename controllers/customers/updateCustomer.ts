import { Request, Response } from "express"
import { QueryResult } from "pg"
import { uuidv4Regex } from "../../configs"
import pool from "../../models/db/postgres"
import { UserData } from "../../types"

const verifyEmailIsValid = async (id: string): Promise<boolean> => {
    const emailQs = `SELECT email FROM customers WHERE id != $1`
    const phoneQs = `SELECT contact FROM customers WHERE id != $1`

    try {
        const emailRes: QueryResult = await pool.query(emailQs, [id])
        const [email]: { email: string }[] = emailRes.rows

        const phoneRes: QueryResult = await pool.query(phoneQs, [id])

        const [phone]: { contact: string }[] = phoneRes.rows

        if (email || phone) {
            return true
        }

        return false
    } catch (err) {
        return true
    }
}

export default async function updateCustomer(req: Request, res: Response): Promise<Response> {
    // verify that the new email and new tel is does not belong to any other person. if it does, then deny request to update
    const id = req.body.id

    const customer: UserData = req.body

    delete customer?.id

    const qs = `
        UPDATE customers
            SET
                ${Object.entries(customer)
                    .map(([key, value]) => {
                        return `${key} = ${typeof value === "string" ? `'${value}'` : value}`
                    })
                    .join(", ")}
            WHERE
                id = $1
        RETURNING *;
    `
    try {
        if (!uuidv4Regex.test(id!)) {
            throw new Error("Invalid customer")
        }

        const verifyEmailExist = await verifyEmailIsValid(id!)

        if (verifyEmailExist) {
            throw new Error("Email and phone verification failed. Please try again later.")
        }

        const result: QueryResult = await pool.query(qs, [id])

        const [updatedCustomer]: UserData[] = result.rows

        return res.status(200).json(updatedCustomer)
    } catch (err: any) {
        console.log(err)

        return res.status(500).json({ err, message: err?.message })
    }
}
