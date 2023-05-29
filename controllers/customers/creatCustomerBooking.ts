import { Request, Response } from "express"
import { PayStatusData } from "../../types"
import pool from "../../models/db/postgres"
import { QueryResult } from "pg"
import format from "pg-format"
import { sendMessage } from "../../configs/twilio"
import nodeSchedule from "node-schedule"
import { sendNotification, sendNotificationToMany } from "../../configs/expoNotifications"

interface CustomerBooking {
    id: string
    customer_id: string
    travel_id: string
    seat_number: string
    position: string
    name: string
    gender: string
    age_range: string
    means_of_payment: string
    payment_id: string
    ticket_number: number
}

export default async function creatCustomerBooking(req: Request, res: Response): Promise<Response> {
    const data: PayStatusData | undefined = req.body

    const date = new Date(data?.bus.departure.date + "T" + data?.bus.departure.depart_time + "00Z")

    const companyName = process.env.COMPANY_NAME

    const _24hrsBefore = new Date(date.getTime() - 86400000)
    const _2hrsBefore = new Date(date.getTime() - 7200000)

    const agencyQs = `SELECT name FROM agencies WHERE id = $1`

    const bookingsQs = `
        INSERT INTO customer_bookings(customer_id, travel_id, seat_number, name, gender, age_range, payment_id, means_of_payment, position) VALUES %L RETURNING *;
    `

    const updateSeatsQs = `
        UPDATE travel_seats SET booked = $1 WHERE number = $2 AND travel_id = $3 RETURNING *;
    `

    const customerTokenQs = `SELECT notification_token FROM customers WHERE id = $1 AND notification_token IS NOT NULL;`

    try {
        if (!data) {
            return res.status(500).json({ message: "Please submit valid data" })
        }

        const bookingsValues = data.seats.map((seat) => [
            data.customer.id,
            data.bus.id,
            seat.seatNumber,
            seat.name,
            seat.gender,
            seat.range,
            data.payment_id ?? "",
            data.means_of_payment,
            seat.position,
        ])

        const bookingsResult: QueryResult = await pool.query(format(bookingsQs, bookingsValues))

        const bookings: CustomerBooking[] = bookingsResult?.rows

        const updatedSeatsResult = await Promise.all(
            data.seats.map(async (seat) => {
                const queryResult: QueryResult = await pool.query(updateSeatsQs, [
                    true,
                    seat.seatNumber,
                    data.bus.id,
                ])

                const [queryRows]: {
                    id: string
                    number: number
                    position: string
                    travel_id: string
                    booked: boolean
                }[] = queryResult.rows

                return queryRows
            })
        )

        const agencyRes: QueryResult = await pool.query(agencyQs, [data.bus.agency!])

        const [agency]: { name: string }[] = agencyRes.rows

        const tokenRes: QueryResult = await pool.query(customerTokenQs, [data.customer.id])

        const [token]: { notification_token: string }[] = tokenRes.rows

        console.log(token)

        if (data?.customer?.contact) {
            await Promise.all(
                bookings?.map(async (item) => {
                    const message = await sendMessage({
                        body: `
                        Thank you for your booking. \n Booking Details: \n Agency : ${agency?.name} \n Bus # : ${data.bus.number} \n Departure date : ${data.bus.departure.date} \n Departure time : ${data.bus.departure.depart_time} \n Ticket # : ${item?.ticket_number} \n\n Wish you a safe and happy journey.
                    `,
                        to: `${data?.customer?.country?.code}${data?.customer?.contact}`,
                    })

                    return message
                })
            )
        }

        if (token?.notification_token) {
            // schedule jobs
            const _24hrsToNotify = nodeSchedule.scheduleJob(_24hrsBefore, async () => {
                await sendNotificationToMany({
                    tokens: [token?.notification_token],
                    data: {
                        body: "Hi, Your booking will be due tomorrow.",
                        title: companyName,
                    },
                })

                _24hrsToNotify.cancel()
            })

            const _2hrsToNotify = nodeSchedule.scheduleJob(_2hrsBefore, async () => {
                await sendNotificationToMany({
                    tokens: [token?.notification_token],
                    data: {
                        body: "Hi, Your booking will be due in 2hrs from now.",
                        title: companyName,
                    },
                })

                _2hrsToNotify.cancel()
            })
        }

        return res
            .status(200)
            .json({ updatedSeatsResult, bookings, message: "Booking created successfully" })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Unexpected server error" })
    }
}
