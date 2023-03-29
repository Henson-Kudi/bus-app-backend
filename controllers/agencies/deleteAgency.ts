import { resolveSoa } from "dns"
import { Request, Response } from "express"
import { QueryResult } from "pg"
import { uuidv4Regex } from "../../configs"
import pool from "../../models/db/postgres"
import { AgencyData as Agency } from "../../types"

export default async function deleteAgency(req: Request, res: Response): Promise<Response> {
    const id: string | undefined = req.params.id as string | undefined

    if (!id || !uuidv4Regex.test(id)) {
        return res.status(500).json({ message: "Please pass in valid id" })
    }

    try {
        const travelistQs = `
            SELECT COUNT(id) FROM travel_list WHERE agency = $1;
        `

        const deleteAgencyQs = `
            DELETE FROM agencies WHERE id = $1 RETURNING *;
        `

        const travelListResult: QueryResult = await pool.query(travelistQs, [id])

        const [{ count }] = travelListResult.rows as { count: number | string }[]

        if (Number(count)) {
            return res
                .status(201)
                .json({ message: "Please delete all buses listed for travel first" })
        }

        const deleteResult: QueryResult = await pool.query(deleteAgencyQs, [id])

        const [rows] = deleteResult.rows as Agency[]

        return res.status(200).json({ message: "Deleted successfully", ...rows })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}
