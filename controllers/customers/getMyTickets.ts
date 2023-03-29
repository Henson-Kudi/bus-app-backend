import { Request, Response } from "express"
import { QueryResult } from "pg"
import { uuidv4Regex } from "../../configs"
import { tickets } from "../../demo-data"
import pool from "../../models/db/postgres"
import { TravelItem, Seats, Customer, CustomerBooking, Departure } from "../../types"

interface BookingItem {
    id: string
    title: string
    description: string
    type: string
    coupon_name: string
    coupon_rate: string
    number: string
    image: string
    customer_booking_info: {
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
        ticket_number: string
    }
    driver: {
        id: string
        name: string
        contact: string
        email: string
    }
    agency: {
        id: string
        name: string
        email: string
        city: string
        region: string
        contact: string
    }
    departure: {
        id: string
        depart_from: string
        depart_to: string
        date: string
        depart_time: string
        arrival_time: string
        seats_booked: string
        stops: string
        price: string
        duration: string
        arrival_date: string
        type: string
        travel_id: string
    }
}

export default async function getMyTickets(req: Request, res: Response): Promise<Response> {
    const { userId } = req.params

    const travelQs = `SELECT 
        travel_list.id,
        travel_list.title,
        travel_list.description,
        travel_list.type,
        travel_list.coupon_name,
        travel_list.coupon_rate,
        travel_list.number,
        travel_list.image,
        
        jsonb_build_object(
            'id', customer_bookings.id,
            'customer_id', customer_bookings.customer_id,
            'travel_id', customer_bookings.travel_id,
            'seat_number', customer_bookings.seat_number,
            'position', customer_bookings.position,
            'name', customer_bookings.name,
            'gender', customer_bookings.gender,
            'age_range', customer_bookings.age_range,
            'means_of_payment', customer_bookings.means_of_payment,
            'payment_id', customer_bookings.payment_id,
            'ticket_number', customer_bookings.ticket_number
        ) AS customer_booking_info,

        jsonb_build_object(
            'id', drivers.id,
            'name', drivers.name,
            'contact', drivers.contact,
            'email', drivers.email,
            'agency', drivers.agency
        ) AS driver,

        jsonb_build_object(
            'id', agencies.id,
            'name', agencies.name,
            'email', agencies.email,
            'city', agencies.city,
            'region', agencies.region,
            'contact', agencies.contact
        ) AS agency,

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
        ) AS departure

    FROM travel_list

    INNER JOIN customer_bookings
    ON customer_bookings.travel_id = travel_list.id

    INNER JOIN travel_departures_and_returns
    ON travel_departures_and_returns.travel_id = travel_list.id

    INNER JOIN agencies
    ON agencies.id = travel_list.agency

    INNER JOIN drivers
    ON drivers.id = travel_list.driver

    WHERE customer_bookings.customer_id = $1;`

    try {
        if (!uuidv4Regex.test(userId)) {
            return res.status(500).json({ message: "Invalid user" })
        }

        const bookings: QueryResult = await pool.query(travelQs, [userId])

        const pendingtickets = bookings.rows?.filter(
            (ticket: BookingItem) => new Date(ticket?.departure?.date) > new Date()
        )

        const expiredTickets = bookings.rows?.filter(
            (ticket: BookingItem) => new Date(ticket?.departure?.date) < new Date()
        )

        return res.status(200).json({ tickets: bookings?.rows, expiredTickets })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}
