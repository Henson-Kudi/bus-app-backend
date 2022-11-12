export interface Seats {
    position: string
    number: number
    booked: boolean
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

export interface TravelItem {
    id: string
    driver: Driver
    title: string
    description: string
    type: string
    coupon_name?: string
    coupon_rate?: number
    number: string
    image?: string | undefined | null
    agency: string
    seats: Seats[]
    departure: Departure
}

export interface Customer {
    id: string
    name: string
    email: string
    country: string
    contact: string
    city: string
    address: string
}
