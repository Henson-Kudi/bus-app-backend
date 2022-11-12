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
const demo_data_1 = require("../../demo-data");
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
            const departuresListQs = `
            SELECT
                id,
                depart_from AS from,
                depart_to AS to,
                date,
                depart_time,
                arrival_time,
                seats_booked,
                stops,
                price,
                duration,
                arrival_date,
                type,
                travel_id
            FROM travel_departures_and_returns
            WHERE
                date >= $1
            AND
                depart_time >= $2
        `;
            const seatsQs = `
            SELECT
                id,
                number,
                position,
                travel_id,
                booked
            FROM
                travel_seats
            WHERE
                travel_id = $1 `;
            const busListQs = `
            SELECT
                id,
                driver,
                title,
                description,
                type,
                coupon_name,
                coupon_rate,
                number,
                image,
                agency
            
            FROM
                travel_list
            WHERE id = $1`;
            const driverQs = `SELECT * FROM drivers WHERE id = $1`;
            const agencyQs = `SELECT id, name AS agency FROM agencies WHERE id = $1`;
            // const driverReviewsQs = `SELECT * FROM driver_reviews WHERE driver_id = $1`
            console.log("hiit");
            const departureRes = yield postgres_1.default.query(departuresListQs, [dateToday, timeNow]);
            const departureRows = departureRes.rows;
            const list = departureRows === null || departureRows === void 0 ? void 0 : departureRows.map((departure) => __awaiter(this, void 0, void 0, function* () {
                const busRes = yield postgres_1.default.query(busListQs, [departure.travel_id]);
                const [bus] = busRes.rows;
                const seatsRes = yield postgres_1.default.query(seatsQs, [bus.id]);
                const seats = seatsRes.rows;
                const rowsRes = yield postgres_1.default.query(driverQs, [bus.driver]);
                const [driver] = rowsRes.rows;
                const agencyRes = yield postgres_1.default.query(agencyQs, [bus.agency]);
                const [agency] = agencyRes.rows;
                // const { rows: driverReviews } = await pool.query(driverReviewsQs, [driver?.id])
                const travelItem = Object.assign(Object.assign(Object.assign({}, bus), agency), { driver: Object.assign(Object.assign({}, driver), { reviews: [] }), //remember to change the value of reviews
                    seats, departure: {
                        from: departure === null || departure === void 0 ? void 0 : departure.from,
                        to: departure === null || departure === void 0 ? void 0 : departure.to,
                        date: departure === null || departure === void 0 ? void 0 : departure.date,
                        depart_time: departure === null || departure === void 0 ? void 0 : departure.depart_time,
                        arrival_time: departure === null || departure === void 0 ? void 0 : departure.arrival_time,
                        seats_booked: departure === null || departure === void 0 ? void 0 : departure.seats_booked,
                        stops: departure === null || departure === void 0 ? void 0 : departure.stops,
                        price: departure === null || departure === void 0 ? void 0 : departure.price,
                        duration: departure === null || departure === void 0 ? void 0 : departure.duration,
                        arrival_date: departure === null || departure === void 0 ? void 0 : departure.arrival_date,
                        type: departure === null || departure === void 0 ? void 0 : departure.type,
                        travel_id: departure === null || departure === void 0 ? void 0 : departure.travel_id,
                    } });
                return travelItem;
            }));
            const busList = yield Promise.all(list);
            // handle database query
            return res.status(200).json([...busList, ...demo_data_1.busList]);
        }
        catch (err) {
            return res.status(500).json({ message: "Server error" });
        }
    });
}
exports.default = default_1;
