import { Request, Response } from "express"
import { QueryResult } from "pg"
import { uuidv4Regex } from "../../../configs"
import { DriverDetails, RequestInterface } from "../../../types"
import pool from "../../../models/db/postgres"

export default async function getDrivers(req: RequestInterface, res: Response): Promise<Response> {
    const agencyId: undefined | string = req.user.id

    if (!agencyId || !uuidv4Regex.test(agencyId)) {
        return res.status(400).json({ message: "Please submit valid agency id" })
    }

    const driverQs = `
        SELECT * FROM drivers WHERE agency = $1;
    `

    try {
        const queryResponse: QueryResult = await pool.query(driverQs, [agencyId])

        const driversList: DriverDetails[] = queryResponse.rows

        return res.status(200).json(driversList)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error. Please try again later" })
    }
}
