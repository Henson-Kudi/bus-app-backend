import { Request, Response } from "express"
import { QueryResult } from "pg"
import { uuidv4Regex } from "../../configs"
import pool from "../../models/db/postgres"
import { Departure, Seats, TravelItem } from "../../types"

export default async function deleteTravelBus(req: Request, res: Response): Promise<Response> {
    const travelBusId: string | undefined = req.params.busId

    const deleteBTravelBusQs = `DELETE FROM travel_list WHERE id = $1 RETURNING *`

    const deleteTravel_departuresQs = `DELETE FROM travel_departures_and_returns WHERE travel_id = $1 RETURNING *`

    const deleteTravelSeatsQs = `DELETE FROM travel_seats WHERE travel_id = $1 RETURNING *`

    const travelSeatsQs = `SELECT * FROM travel_seats WHERE travel_id = $1`

    try {
        if (!uuidv4Regex.test(travelBusId)) {
            return res.status(500).json({ message: "Invalid bus id" })
        }
        const travelSeatsRes: QueryResult = await pool.query(travelSeatsQs, [travelBusId])

        const travelSeats: Seats[] = travelSeatsRes.rows

        const bookedSeat = travelSeats.find((seat) => seat.booked)

        if (bookedSeat) {
            return res
                .status(500)
                .json({ message: "Seats have been booked already. Cannot delete this item" })
        }

        const deletedSeatsRes: QueryResult = await pool.query(deleteTravelSeatsQs, [travelBusId])

        const deletedDepartureRes: QueryResult = await pool.query(deleteTravel_departuresQs, [
            travelBusId,
        ])

        const deletedTravelItemRes: QueryResult = await pool.query(deleteBTravelBusQs, [
            travelBusId,
        ])

        const deletedSeatsData: Seats[] = deletedSeatsRes.rows
        const [deletedDepartureData]: Departure[] = deletedDepartureRes.rows
        const [deletedTravelItemData]: TravelItem[] = deletedTravelItemRes.rows

        return res.status(200).json({
            message: "Travel item deleted successfully",
            data: {
                ...deletedTravelItemData,
                travel: deletedSeatsData,
                departure: deletedDepartureData,
            },
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}
