"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postgres_1 = __importDefault(require("../../models/db/postgres"));
function default_1(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1 < 10 ? `0${today.getMonth() + 1}` : today.getMonth() + 1;
        const date = today.getDate() < 10 ? `0${today.getDate()}` : today.getDate();
        const hours = today.getHours() < 10 ? `0${today.getHours()}` : today.getHours();
        const minutes = today.getMinutes() < 10 ? `0${today.getMinutes()}` : today.getMinutes();
        try {
            const dateToday = `${year}-${month}-${date}`;
            const timeNow = `${hours}:${minutes}`;
            const travelBusQs = `
            SELECT
                travel_list.id,
                travel_list.title,
                travel_list.description,
                travel_list.type,
                travel_list.coupon_name,
                travel_list.coupon_rate,
                travel_list.number,
                travel_list.image,

                jsonb_build_object(
                    'id', drivers.id,
                    'name', drivers.name,
                    'contact', drivers.contact,
                    'email', drivers.email,
                    'position', drivers.position,
                    'agency', drivers.agency,
                    'rating', drivers.rating,
                    'image', drivers.image
                ) AS driver,

                jsonb_build_object(
                    'id', agencies.id,
                    'name', agencies.name,
                    'admin', agencies.admin,
                    'email', agencies.email,
                    'city', agencies.city,
                    'region', agencies.region,
                    'country_name', agencies.country_name,
                    'country_code', agencies.country_code,
                    'country_image', agencies.country_image,
                    'country_short', agencies.country_short,
                    'contact', agencies.contact,
                    'contact_verified', agencies.contact_verified,
                    'email_verified', agencies.email_verified
                ) AS agency,
               
                jsonb_build_object(
                    'id', travel_departures_and_returns.id,
                    'from', travel_departures_and_returns.depart_from,
                    'to', travel_departures_and_returns.depart_to,
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
                ) as departure,

                jsonb_agg(
                    jsonb_build_object(
                        'id', travel_seats.id,
                        'number', travel_seats.number,
                        'position', travel_seats.position,
                        'travel_id', travel_seats.travel_id,
                        'booked', travel_seats.booked
                    )
                ) AS seats

            FROM travel_list

            INNER JOIN travel_seats ON travel_seats.travel_id = travel_list.id

            INNER JOIN travel_departures_and_returns
                ON travel_list.id = travel_departures_and_returns.travel_id
            
            INNER JOIN agencies
                ON agencies.id = travel_list.agency
            
            INNER JOIN drivers
                ON drivers.id = travel_list.driver

            WHERE
                travel_departures_and_returns.date >= $1

            GROUP BY
                travel_list.id,
                travel_list.driver,
                travel_list.title,
                travel_list.description,
                travel_list.type,
                travel_list.coupon_name,
                travel_list.coupon_rate,
                travel_list.number,
                travel_list.image,
                travel_list.agency,
                travel_departures_and_returns.id,
                travel_departures_and_returns.depart_from,
                travel_departures_and_returns.depart_to,
                travel_departures_and_returns.date,
                travel_departures_and_returns.depart_time,
                travel_departures_and_returns.arrival_time,
                travel_departures_and_returns.seats_booked,
                travel_departures_and_returns.stops,
                travel_departures_and_returns.price,
                travel_departures_and_returns.duration,
                travel_departures_and_returns.arrival_date,
                travel_departures_and_returns.travel_id,
                drivers.id,
                drivers.name,
                drivers.contact,
                drivers.email,
                drivers.position,
                drivers.agency,
                drivers.rating,
                drivers.image,
                agencies.id,
                agencies.name,
                agencies.admin,
                agencies.email,
                agencies.city,
                agencies.region,
                agencies.country_name,
                agencies.country_code,
                agencies.country_image,
                agencies.country_short,
                agencies.contact,
                agencies.contact_verified,
                agencies.email_verified;
        `;
            const travelBusRes = yield postgres_1.default.query(travelBusQs, [dateToday]);
            const travelBusRows = travelBusRes.rows;
            return res.status(200).json(travelBusRows);
        }
        catch (err) {
            console.log(err);
            return res.status(500).json({ message: "Server error" });
        }
    });
}
exports.default = default_1;
