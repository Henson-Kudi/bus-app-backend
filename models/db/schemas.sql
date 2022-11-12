DROP DATABASE IF EXISTS travel_app_dev;

CREATE DATABASE travel_app_dev;

\c travel_app_dev;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- agencies

CREATE TABLE agencies(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE, --agency name
    admin VARCHAR(50) NOT NULL, --admin nam
    email VARCHAR(100) NOT NULL UNIQUE CHECK(email LIKE '%_@__%.__%'), --agency admin email
    city VARCHAR(100), -- agency city
    region VARCHAR(100), -- agency region
    country VARCHAR(100) NOT NULL, -- agency country
    contact VARCHAR(50) NOT NULL -- agency contact
);

-- customers (app users)

CREATE TABLE customers(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE CHECK(email LIKE '%_@__%.__%'),
    country VARCHAR(50),
    contact VARCHAR(30) NOT NULL,
    city VARCHAR(100),
    address VARCHAR(200),
    password_hash TEXT,
    image TEXT
);

CREATE TABLE drivers(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    contact VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL CHECK(email LIKE '%_@__%.__%'),
    position VARCHAR(100) NOT NULL,
    agency uuid NOT NULL,
    rating INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT fk_agencies
        FOREIGN KEY(agency)
        REFERENCES agencies(id)
);

CREATE TABLE buses(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    number VARCHAR(20) NOT NULL UNIQUE,
    agency uuid NOT NULL,
    image TEXT,
    driver uuid NOT NULL,
    CONSTRAINT fk_agencies
            FOREIGN KEY(agency)
            REFERENCES agencies(id),
    CONSTRAINT fk_drivers
            FOREIGN KEY(driver)
            REFERENCES drivers(id)
);

CREATE TABLE bus_seats(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    number INTEGER NOT NULL UNIQUE,
    position VARCHAR(5) NOT NULL,
    bus_id uuid NOT NULL,
    CONSTRAINT fk_buses
            FOREIGN KEY(bus_id)
            REFERENCES buses(id)
);

CREATE TABLE agency_reviews(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    reviewer_id uuid NOT NULL,
    message TEXT NOT NULL,
    stars INTEGER NOT NULL
);

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
    agency uuid NOT NULL,
    CONSTRAINT fk_agencies
        FOREIGN KEY(agency)
        REFERENCES agencies(id),
    CONSTRAINT fk_drivers
        FOREIGN KEY(driver)
        REFERENCES drivers(id)
);

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

    
CREATE TABLE travel_seats(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    number INTEGER NOT NULL UNIQUE,
    position VARCHAR(5) NOT NULL,
    travel_id uuid NOT NULL,
    booked BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT fk_travel_list
        FOREIGN KEY(travel_id)
        REFERENCES travel_list(id)
);

CREATE TABLE customer_bookings(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id uuid NOT NULL,
    travel_id uuid NOT NULL,
    seat_number INTEGER NOT NULL,
    CONSTRAINT fk_travel_list
        FOREIGN KEY(travel_id)
        REFERENCES travel_list(id),
    CONSTRAINT fk_customers
        FOREIGN KEY(customer_id)
        REFERENCES customers(id),
    CONSTRAINT fk_travel_seats
        FOREIGN KEY(seat_number)
        REFERENCES travel_seats(number)
);

INSERT INTO agencies (name, admin, email, city, region, country, contact) VALUES(
    'Moghamo Express', 'Henson Kudi Amah', 'amahkudi@gmail.com', 'Bamenda', 'North West', 'Cameroon', '678560446'
);

INSERT INTO customers (name, email, country, contact, city, address, password_hash) VALUES(
    'Amah Henson', 'henson@email.com', 'Cameroon', '678560446', 'Bamenda', 'Ntarinkon Bamenda', 'somepasswordstring'
);

-- new inserts to be copied and pasted

INSERT INTO drivers(name, contact, email, position, agency, rating) VALUES(
    'Driver number 1', '053967013', 'driver1@email.com', 'Driver', 'a4476285-d4f3-4cd4-b77c-db5d12b3cd87', 0
);

INSERT INTO buses(number, agency, driver) VALUES(
    'ABC123NW', 'a4476285-d4f3-4cd4-b77c-db5d12b3cd87', '1d6cab5a-7879-45b5-b8bb-646e53250452'
);

INSERT INTO bus_seats(number, position, bus_id) VALUES(
    1, 'RW', 'a9025bbf-73a7-46f4-bfe2-d44f7533ec69' -- bus_id
), (
    2, 'LW', 'a9025bbf-73a7-46f4-bfe2-d44f7533ec69' -- bus_id
), (
    3, 'M', 'a9025bbf-73a7-46f4-bfe2-d44f7533ec69' -- bus_id
), (
    4, 'EN', 'a9025bbf-73a7-46f4-bfe2-d44f7533ec69' -- bus_id
), (
    5, 'EN', 'a9025bbf-73a7-46f4-bfe2-d44f7533ec69' -- bus_id
), (
    6, 'M', 'a9025bbf-73a7-46f4-bfe2-d44f7533ec69' -- bus_id
), (
    7, 'LW', 'a9025bbf-73a7-46f4-bfe2-d44f7533ec69' -- bus_id
), (
    8, 'RW', 'a9025bbf-73a7-46f4-bfe2-d44f7533ec69' -- bus_id
), (
    9, 'M', 'a9025bbf-73a7-46f4-bfe2-d44f7533ec69' -- bus_id
), (
    10, 'EN', 'a9025bbf-73a7-46f4-bfe2-d44f7533ec69' -- bus_id
), (
    11, 'EN', 'a9025bbf-73a7-46f4-bfe2-d44f7533ec69' -- bus_id
), (
    12, 'M', 'a9025bbf-73a7-46f4-bfe2-d44f7533ec69' -- bus_id
), (
    13, 'RW', 'a9025bbf-73a7-46f4-bfe2-d44f7533ec69' -- bus_id
), (
    14, 'LW', 'a9025bbf-73a7-46f4-bfe2-d44f7533ec69' -- bus_id
), (
    15, 'M', 'a9025bbf-73a7-46f4-bfe2-d44f7533ec69' -- bus_id
), (
    16, 'EN', 'a9025bbf-73a7-46f4-bfe2-d44f7533ec69' -- bus_id
), (
    17, 'EN', 'a9025bbf-73a7-46f4-bfe2-d44f7533ec69' -- bus_id
), (
    18, 'LW', 'a9025bbf-73a7-46f4-bfe2-d44f7533ec69' -- bus_id
), (
    19, 'M', 'a9025bbf-73a7-46f4-bfe2-d44f7533ec69' -- bus_id
), (
    20, 'RW', 'a9025bbf-73a7-46f4-bfe2-d44f7533ec69' -- bus_id
);

INSERT INTO agency_reviews(reviewer_id, message, stars) VALUES(
    'a82b7627-49b3-4216-aad5-0f8c3c23c38b', 'This app is awesome', 5
);

INSERT INTO driver_reviews(reviewer_id, message, stars) VALUES(
    'a82b7627-49b3-4216-aad5-0f8c3c23c38b', 'This driver is awesome', 5
);

INSERT INTO travel_list(driver, title, description, type, coupon_name, coupon_rate, number, agency) VALUES(
    '1d6cab5a-7879-45b5-b8bb-646e53250452', 'Buy one get 2', 'Description of this offer is great', 'offer', 'coupon code', 10, 'ABC123NW', 'a4476285-d4f3-4cd4-b77c-db5d12b3cd87'
);

INSERT INTO travel_list(driver, title, description, type, coupon_name, coupon_rate, number, agency) VALUES(
    '1d6cab5a-7879-45b5-b8bb-646e53250452', 'Title of normal', 'Description of this normal is great', 'normal', '', 0, 'ABC123NW', 'a4476285-d4f3-4cd4-b77c-db5d12b3cd87'
);

INSERT INTO travel_departures_and_returns(depart_from, depart_to, date, depart_time, arrival_time, seats_booked, stops, price, duration, arrival_date, type, travel_id) VALUES(
    'Bamenda', 'Douala', '2022-10-09', '10:00', '19:30', 0, 7, 6000, 9, '2022-10-10', 'return', '09dac992-fc04-4bf6-99a9-d90ca88588c2'
);

INSERT INTO travel_departures_and_returns(depart_from, depart_to, date, depart_time, arrival_time, seats_booked, stops, price, duration, arrival_date, type, travel_id) VALUES(
    'Yaounde', 'Baffoussam', '2022-10-09', '22:00', '07:30', 0, 5, 4500, 7, '2022-10-11', 'departure', '63a02bea-17a6-4c54-8cc5-3562f1cfbeeb'
);

INSERT INTO travel_seats(number, position, travel_id, booked) VALUES(
    1, 'RW', '09dac992-fc04-4bf6-99a9-d90ca88588c2', false -- bus_id
), (
    2, 'LW', '09dac992-fc04-4bf6-99a9-d90ca88588c2', false -- bus_id
), (
    3, 'M', '09dac992-fc04-4bf6-99a9-d90ca88588c2', false -- bus_id
), (
    4, 'EN', '09dac992-fc04-4bf6-99a9-d90ca88588c2', false -- bus_id
), (
    5, 'EN', '09dac992-fc04-4bf6-99a9-d90ca88588c2', false -- bus_id
), (
    6, 'M', '09dac992-fc04-4bf6-99a9-d90ca88588c2', false -- bus_id
), (
    7, 'LW', '09dac992-fc04-4bf6-99a9-d90ca88588c2', false -- bus_id
), (
    8, 'RW', '09dac992-fc04-4bf6-99a9-d90ca88588c2', false -- bus_id
), (
    9, 'M', '09dac992-fc04-4bf6-99a9-d90ca88588c2', false -- bus_id
), (
    10, 'EN', '09dac992-fc04-4bf6-99a9-d90ca88588c2', true -- bus_id
), (
    11, 'EN', '09dac992-fc04-4bf6-99a9-d90ca88588c2', false -- bus_id
), (
    12, 'M', '09dac992-fc04-4bf6-99a9-d90ca88588c2', false -- bus_id
), (
    13, 'RW', '09dac992-fc04-4bf6-99a9-d90ca88588c2', false -- bus_id
), (
    14, 'LW', '09dac992-fc04-4bf6-99a9-d90ca88588c2', false -- bus_id
), (
    15, 'M', '09dac992-fc04-4bf6-99a9-d90ca88588c2', false -- bus_id
), (
    16, 'EN', '09dac992-fc04-4bf6-99a9-d90ca88588c2', false -- bus_id
), (
    17, 'EN', '09dac992-fc04-4bf6-99a9-d90ca88588c2', false -- bus_id
), (
    18, 'LW', '09dac992-fc04-4bf6-99a9-d90ca88588c2', false -- bus_id
), (
    19, 'M', '09dac992-fc04-4bf6-99a9-d90ca88588c2', false -- bus_id
), (
    20, 'RW', '09dac992-fc04-4bf6-99a9-d90ca88588c2', false -- bus_id
);

INSERT INTO customer_bookings(customer_id, travel_id, seat_number) VALUES(
    'a82b7627-49b3-4216-aad5-0f8c3c23c38b', '63a02bea-17a6-4c54-8cc5-3562f1cfbeeb', 10
);


