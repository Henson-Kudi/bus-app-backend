import { Request, Response } from "express"
import { v4 as uuidv4 } from "uuid"
import { uuidv4Regex } from "../../../configs"
import format from "pg-format"
import { QueryResult } from "pg"
import pool from "../../../models/db/postgres"
import { Bus, BusSeats, RequestInterface } from "../../../types"
import uploadToS3 from "../../../utils/uploadToS3"

export default async function createBus(req: RequestInterface, res: Response): Promise<Response> {
    const agencyId: string | undefined = req.user.id

    const data: Bus = req.body

    const busImage = req?.files?.busImage as any
    const seatsChart = req.files?.seatsChart as any

    const busSeatsArray: BusSeats[] =
        typeof data.seats === "string" ? JSON.parse(data.seats) : data.seats

    if (!agencyId || !uuidv4Regex.test(agencyId)) {
        return res.status(400).json({ message: "Invalid data sent" })
    }

    if (!busSeatsArray.length) {
        return res
            .status(400)
            .json({ message: "Please provide bus seats. Bus seats cannot be empty" })
    }

    const busQs = `
        INSERT INTO buses(
                number,
                agency,
                image,
                driver,
                number_of_seats,
                seats_chart
            )
            VALUES(
                $1, 
                $2,
                $3,
                $4,
                $5,
                $6
            )
        RETURNING *;
    `

    const seatsQs = `INSERT INTO bus_seats(number, position, bus_id) VALUES %L RETURNING *`

    try {
        if (busImage) {
            const imageId = uuidv4()
            const imgExt = busImage?.name?.split(".")?.slice(-1)[0]

            const image = await uploadToS3(`${agencyId}/buses/${imageId}.${imgExt}`, busImage?.data)

            data.image = image
        }

        if (seatsChart) {
            const imageId = uuidv4()
            const imgExt = seatsChart?.name?.split(".")?.slice(-1)[0]

            const image = await uploadToS3(
                `${agencyId}/charts/${imageId}.${imgExt}`,
                seatsChart?.data
            )

            data.seats_chart = image
        }

        const busResponse: QueryResult = await pool.query(busQs, [
            data.number ?? req.body.busNumber,
            agencyId,
            data.image,
            data.driver,
            busSeatsArray.length,
        ])

        const [busData]: Bus[] = busResponse.rows

        const busSeatsValues = busSeatsArray?.map((seat) => [
            Number(seat.number),
            seat.position,
            busData.id,
        ])

        const busSeatsResult: QueryResult = await pool.query(format(seatsQs, busSeatsValues))

        return res.status(200).json({ ...busData, seats: busSeatsResult.rows })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}
