-- DROP DATABASE IF EXISTS postgres;

-- CREATE DATABASE postgres;

-- \c postgres;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- agencies

CREATE TABLE agencies(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE, --agency name
    admin VARCHAR(50) NOT NULL, --admin nam
    email VARCHAR(100) NOT NULL UNIQUE CHECK(email LIKE '%_@__%.__%'), --agency admin email
    city VARCHAR(100), -- agency city
    region VARCHAR(100), -- agency region
    country_name VARCHAR(100) NOT NULL, -- agency country
    country_code VARCHAR(50), -- AGENCY COUNTRY CODE
    country_image TEXT, -- AGENCY COUNTRY FLAG
    country_short VARCHAR(50), -- AGENCY COUNTRY SHORT
    contact VARCHAR(50) NOT NULL, -- agency contact
    password_hash TEXT NOT NULL,
    contact_verified BOOLEAN NOT NULL DEFAULT false,
    email_verified BOOLEAN NOT NULL DEFAULT false
);

-- customers (app users)

CREATE TABLE customers(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE CHECK(email LIKE '%_@__%.__%'),
    country_name VARCHAR(50),
    country_code VARCHAR(50),
    country_image TEXT,
    country_short VARCHAR(50),
    contact VARCHAR(30) NOT NULL,
    city VARCHAR(100),
    address VARCHAR(200),
    password_hash TEXT NOT NULL,
    image TEXT,
    contact_verified BOOLEAN NOT NULL DEFAULT false,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    notification_token VARCHAR(100),
    verification_code INT NOT NULL
);

-- agency drivers
CREATE TABLE drivers(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    contact VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL CHECK(email LIKE '%_@__%.__%'),
    position VARCHAR(100) NOT NULL DEFAULT 'driver',
    agency uuid NOT NULL,
    rating INTEGER NOT NULL DEFAULT 0,
    image VARCHAR(100),
    CONSTRAINT fk_agencies
        FOREIGN KEY(agency)
        REFERENCES agencies(id)
);

-- agency buses. We use these buses to create travel plans (travel_list)
CREATE TABLE buses(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    number VARCHAR(20) NOT NULL UNIQUE,
    agency uuid NOT NULL,
    image TEXT,
    seats_chart TEXT,
    description TEXT,
    driver uuid NOT NULL,
    number_of_seats INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT fk_agencies
            FOREIGN KEY(agency)
            REFERENCES agencies(id),
    CONSTRAINT fk_drivers
            FOREIGN KEY(driver)
            REFERENCES drivers(id)
);

-- seats for a bus

CREATE TABLE bus_seats(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    number INTEGER NOT NULL,
    position VARCHAR(5) NOT NULL,
    bus_id uuid NOT NULL,
    CONSTRAINT pk_buses PRIMARY KEY(number, bus_id),
    CONSTRAINT fk_buses
            FOREIGN KEY(bus_id)
            REFERENCES buses(id)
);

-- customer reviews about a particular agency

CREATE TABLE agency_reviews(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    reviewer_id uuid NOT NULL,
    message TEXT NOT NULL,
    stars INTEGER NOT NULL,
    agency uuid NOT NULL,
    CONSTRAINT fk_agency_reviews
        FOREIGN KEY(reviewer_id)
        REFERENCES customers(id),
    CONSTRAINT fk_agencies
        FOREIGN KEY(agency)
        REFERENCES agencies(id)
);

-- customer reviews about a particular belonging to an agency

CREATE TABLE driver_reviews(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    reviewer_id uuid NOT NULL,
    driver_id uuid NOT NULL,
    message TEXT NOT NULL,
    stars INTEGER NOT NULL,
    CONSTRAINT fk_customers
        FOREIGN KEY(reviewer_id)
        REFERENCES customers(id),
    CONSTRAINT fk_drivers
        FOREIGN KEY(driver_id)
        REFERENCES drivers(id)
);

-- travel plan for a given date.This bus is ready to be booked and is what would be displayed to customers

CREATE TABLE travel_list( -- this takes both offers and normal traveks. We'll use the type to filter between both.
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver uuid NOT NULL,
    title TEXT,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type = 'normal' OR type = 'offer') DEFAULT 'normal',
    coupon_name VARCHAR(100),
    coupon_rate INTEGER NOT NULL DEFAULT 0,
    number VARCHAR(100) NOT NULL,
    image TEXT,
    seats_chart TEXT,
    agency uuid NOT NULL,
    CONSTRAINT fk_agencies
        FOREIGN KEY(agency)
        REFERENCES agencies(id),
    CONSTRAINT fk_drivers
        FOREIGN KEY(driver)
        REFERENCES drivers(id)
);

-- an extension of travel_list (contains information about departure date and return date of a given bus on travel_list)

CREATE TABLE travel_departures_and_returns(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    depart_from VARCHAR(100) NOT NULL,
    depart_to VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    depart_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    seats_booked INTEGER NOT NULL DEFAULT 0,
    stops INTEGER NOT NULL DEFAULT 0,
    price INTEGER NOT NULL DEFAULT 0,
    duration INTEGER NOT NULL DEFAULT 0,
    arrival_date DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(20) NOT NULL CHECK (type = 'departure' OR type='return') DEFAULT 'departure',
    travel_id uuid NOT NULL,
    CONSTRAINT fk_travel_list
        FOREIGN KEY(travel_id)
        REFERENCES travel_list(id)
);

-- contains seats of a bus ready to be booked. These seats would be updated to booked once a customer books the bus
    
CREATE TABLE travel_seats(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    number INTEGER NOT NULL,
    position VARCHAR(5) NOT NULL,
    travel_id uuid NOT NULL,
    booked BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT pk_travel_list PRIMARY KEY(number, travel_id),
    CONSTRAINT fk_travel_list
        FOREIGN KEY(travel_id)
        REFERENCES travel_list(id)
);

-- contains information of all the travel_list booked by customer

CREATE TABLE customer_bookings(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id uuid NOT NULL,
    travel_id uuid NOT NULL,
    seat_number INTEGER NOT NULL,
    position VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(20),
    age_range VARCHAR(20),
    means_of_payment VARCHAR(100) NOT NULL,
    payment_id VARCHAR(100) NOT NULL,
    ticket_number SERIAL,
    CONSTRAINT fk_travel_list
        FOREIGN KEY(travel_id)
        REFERENCES travel_list(id),
    CONSTRAINT fk_customers
        FOREIGN KEY(customer_id)
        REFERENCES customers(id)
    --CONSTRAINT fk_travel_seats
        --FOREIGN KEY(seat_number)
        --REFERENCES travel_seats(number)
);

CREATE TABLE used_coupons(
    customer_id uuid NOT NULL,
    travel_id uuid NOT NULL,
    PRIMARY KEY(customer_id, travel_id),
    CONSTRAINT fk_customers
        FOREIGN KEY(customer_id)
        REFERENCES customers(id),
    CONSTRAINT fk_travel_list
        FOREIGN KEY(travel_id)
        REFERENCES travel_list(id)
);

CREATE TABLE refresh_tokens(
    id SERIAL,
    agency uuid NOT NULL,
    token TEXT NOT NULL UNIQUE,
    browser_id TEXT,
    CONSTRAINT fk_agencies
        FOREIGN KEY(agency)
        REFERENCES agencies(id)
);



