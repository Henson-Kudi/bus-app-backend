import { Request, Response } from "express"
import { QueryResult } from "pg"
import pool from "../../models/db/postgres"
import twilioClient, { sendMessage } from "../../configs/twilio"
import { CustomerBooking, Departure } from "../../types"
import nodeSchedule from "node-schedule"
import { sendNotificationToMany } from "../../configs/expoNotifications"

interface ChangeBus {
    customer: string
    oldTicket: {
        age_range: string
        customer_id: string
        gender: string
        id: string
        means_of_payment: string
        name: string
        payment_id: string
        position: string
        seat_number: number
        ticket_number: number
        travel_id: string
    }
    newTicket: {
        travel_id: string
        seatNumber: string
        position: string
        departure_id: string
    }
}

export default async function changeTravelBus(req: Request, res: Response): Promise<Response> {
    const data: ChangeBus | undefined = req.body

    const travelQs = `
        SELECT
        travel_list.id,
        travel_list.driver,
        travel_list.title,
        travel_list.description,
        travel_list.type,
        travel_list.coupon_name,
        travel_list.coupon_rate,
        travel_list.number,
        travel_list.image,

        jsonb_build_object(
            'id', travel_departures_and_returns.id,
            'depart_from', travel_departures_and_returns.depart_from,
            'depart_to', travel_departures_and_returns.depart_to,
            'date', travel_departures_and_returns.date,
            'depart_time', travel_departures_and_returns.depart_time,
            'arrival_time', travel_departures_and_returns.arrival_time,
            'seats_booked', travel_departures_and_returns.seats_booked,
            'stops', travel_departures_and_returns.stops,
            'price', travel_departures_and_returns.price,
            'duration', travel_departures_and_returns.duration,
            'arrival_date', travel_departures_and_returns.arrival_date,
            'type', travel_departures_and_returns.type,
            'travel_id', travel_departures_and_returns.travel_id
        ) AS departure,

        jsonb_build_object(
            'id', agencies.id,
            'name', agencies.name,
            'email', agencies.email,
            'city', agencies.city,
            'region', agencies.region,
            'contact', agencies.contact
        ) AS agency

        FROM travel_list

        INNER JOIN travel_departures_and_returns ON travel_departures_and_returns.travel_id = travel_list.id

        INNER JOIN agencies ON agencies.id = travel_list.agency

        WHERE travel_list.id = $1;

    `

    const customerQs = `SELECT notification_token, country_code, contact FROM customers WHERE id = $1`

    const busSeatQs = `
        UPDATE travel_seats
        SET booked = $1
        WHERE travel_id = $2
        AND number = $3
        AND position = $4
        RETURNING *;
    `

    const customerBookingQs = `
        UPDATE customer_bookings
        SET
            travel_id = $1,
            seat_number = $2,
            position = $3
        WHERE id = $4
        AND customer_id =$5
        RETURNING *;
    `

    const departureQs = `
        SELECT * FROM travel_departures_and_returns WHERE id = $1;
    `
    try {
        if (!data || !data.customer || typeof data.customer !== "string") {
            throw new Error("400")
        }

        if (
            !data.newTicket.position ||
            !data.newTicket.seatNumber ||
            !data.newTicket.travel_id ||
            !data.newTicket.departure_id
        ) {
            throw new Error("400")
        }

        if (!data.oldTicket.position || !data.oldTicket.seat_number || !data.oldTicket.travel_id) {
            throw new Error("400")
        }

        const oldSeatRes: QueryResult = await pool.query(busSeatQs, [
            0,
            data.oldTicket.travel_id,
            data.oldTicket.seat_number,
            data.oldTicket.position,
        ])

        const newSeatRes = await pool.query(busSeatQs, [
            true,
            data.newTicket.travel_id,
            data.newTicket.seatNumber,
            data.newTicket.position,
        ])

        const customerBookingRes = await pool.query(customerBookingQs, [
            data.newTicket.travel_id,
            data.newTicket.seatNumber,
            data.newTicket.position,
            data.oldTicket.id,
            data.customer,
        ])

        const [customer_booking_info]: CustomerBooking[] = customerBookingRes.rows

        const departureRes: QueryResult = await pool.query(departureQs, [
            data.newTicket.departure_id,
        ])

        const [departure]: Departure[] = departureRes.rows

        const travelRes = await pool.query(travelQs, [data.newTicket.travel_id])

        const [travelData]: any[] = travelRes.rows

        const customerRes = await pool.query(customerQs, [data.customer])

        const [customer]: any[] = customerRes.rows

        const date = new Date(
            travelData?.departure?.date + "T" + travelData?.departure?.depart_time + "00Z"
        )

        const companyName = process.env.COMPANY_NAME

        const _24hrsBefore = new Date(date.getTime() - 86400000)
        const _2hrsBefore = new Date(date.getTime() - 7200000)

        if (customer?.country_code && customer?.contact) {
            await sendMessage({
                body: `
                You changed your travel bus.\nDetails:\nTravel date : ${travelData?.departure?.date}\nTravel Time : ${travelData?.departure?.depart_time}\nAgency : ${travelData?.agency?.name}\nBus # : ${travelData?.number}Seat # : ${data.newTicket?.seatNumber}\n\nEnjoy your journey.
            `,
                to: customer?.country_code + customer?.contact,
            })
        }

        if (customer.notification_token) {
            const _24hrsToNotify = nodeSchedule.scheduleJob(_24hrsBefore, async () => {
                await sendNotificationToMany({
                    tokens: [customer?.notification_token],
                    data: {
                        body: "Hi, Your booking will be due tomorrow.",
                        title: companyName,
                    },
                })

                _24hrsToNotify.cancel()
            })

            const _2hrsToNotify = nodeSchedule.scheduleJob(_2hrsBefore, async () => {
                await sendNotificationToMany({
                    tokens: [customer?.notification_token],
                    data: {
                        body: "Hi, Your booking will be due in 2hrs from now.",
                        title: companyName,
                    },
                })

                _2hrsToNotify.cancel()
            })
        }

        return res.status(200).json({
            newTicket: { customer_booking_info, departure },
            message: "Updated booking successfully",
        })
    } catch (err: any) {
        console.log(err)

        if (err.message === "400") {
            return res.status(400).json({ message: "Invalid data" })
        }
        return res.status(500).json({ message: "internal server error" })
    }
}
