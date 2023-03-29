import { string } from "pg-format"

export interface Seats {
    position: string
    number: number
    booked: boolean
}

export interface BusSeats {
    number: string
    position: string
    bus_id: string
    id?: string
}

export interface Bus {
    number: string
    agency: string
    image: string
    driver: string
    number_of_seats?: string
    seats: Seats[] | string
    id: string
}

export interface Departure {
    from: string
    to: string
    date: string
    depart_time: string
    arrival_time: string
    seats_booked?: number
    stops?: number
    price: number
    duration?: number
    arrival_date: string
    travel_id: string
    type?: string
    id?: string
}

export interface Review {
    id: string
    reviewer_id: string
    message: string
    stars: string
}

export interface Driver {
    position: string
    name: string
    id: string
    company: string
    rating: number
    reviews?: Review[]
    image?: string
    agency: string
}

export interface DriverReview {
    id: string
    reviewer_id: string
    driver_id: string
    message: string
    stars: number
}
export interface AgencyReview {
    id: string
    reviewer_id: string
    message: string
    stars: number
}

export interface TravelItem {
    id: string
    title: string
    description: string
    type: string
    coupon_name: string
    coupon_rate: string
    number: string
    image: string
    driver: Driver
    agency: string
    departure: Departure
    seats: Seats[]
}

export interface Customer {
    id: string
    name: string
    email: string
    country_name: string
    country_code: string
    country_image: string
    country_short: string
    contact: string
    city: string
    address: string
    password_hash: string
    image: string
    contact_verified: string
    email_verified: string
}

export interface DriverDetails {
    name: string
    contact: string
    email: string
    position: string
    agency: string
    rating: string
    id?: string
    image?: string
}

export interface TravelList {
    id: string
    driver: string
    title: string
    description: string
    type: string
    coupon_name: string
    coupon_rate: number
    number: string
    image: string
    agency: string
}

export interface UserData {
    id?: string
    name: string
    email: string
    country_name: string
    country_code: string
    country_image: string
    country_short: string
    contact: string
    city: string
    address: string
    password_hash: string
    image: string
    contact_verified: boolean
    email_verified: boolean
    notification_token: string | null
}

export interface RegisterUser {
    userName: string
    email: string
    contact: string
    city: string
    address: string
    password: string
    confirmPassword: string
    country: {
        image?: string
        code: string
        name: string
        short: string
    }
}

export interface AgencyData {
    id: string
    name: string
    admin: string
    email: string
    city: string
    region: string
    country_name: string
    country_code: string
    country_image: string
    country_short: string
    contact: string
    contact_verified: boolean
    email_verified: boolean
    password_hash: string
}

export interface RegisterAgency {
    name: string
    admin: string
    email: string
    city: string
    region: string
    contact: string
    password: string
    confirmPassword: string
    country: {
        image?: string
        code: string
        name: string
        short: string
    }
}

export interface LoginData {
    email: string
    password: string
}

export interface PayStatusData {
    referenceId: string
    token: string
    bus: TravelItem
    customer: {
        id: string
        name: string
        email: string
        city: string
        contact: string
        address: string
        country: {
            image: string
            code: string
            name: string
            short: string
        }
    }
    seats: { gender: string; name: string; range: string; seatNumber: string; position: string }[]
    discount: number
    payment_id: string
    means_of_payment: string
}

export interface RequestToPayData {
    amount: string
    currency: string
    externalId: string
    payer: {
        partyIdType: string //"MSISDN"
        partyId: string
    }
    payerMessage: string
    payeeNote: string
    status?: string
    reason?: string
}

export interface CustomerRequestToPay {
    bus: {
        driver: Driver
        number: string
        id: string
        seats: Seats[]
        image?: string
        agency: AgencyData
        departure: Departure
        return?: Departure
    }
    customer: {
        id: string
        name: string
        email: string
        city: string
        contact: string
        address: string
        country: {
            image: string
            code: string
            name: string
            short: string
        }
    }
    payment_id: string
    means_of_payment: string
}

export interface RequestToTransfer {
    customerId: string
    amount: number
    referenceId: string
    momoNumber: string
    transferType: string
}

export interface CustomerBooking {
    id: string
    customer_id: string
    travel_id: string
    seat_number: string
    name: string
    gender: string
    age_range: string
    means_of_payment: string
    payment_id: string
    position: string
    ticket_number: number
}

// socket io types
export interface ServerToClientEvents {
    noArg: () => void
    basicEmit: (a: number, b: string, c: Buffer) => void
    withAck: (d: string, callback: (e: number) => void) => void
    connection_created: (d: string) => void
}

export interface ClientToServerEvents {
    join_room: (room: string) => void
}

export interface InterServerEvents {
    ping: () => void
}

export interface SocketData {
    name: string
    age: number
}
