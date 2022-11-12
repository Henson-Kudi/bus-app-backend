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
function getMyTickets(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { userId } = req.params;
        const bookingsQs = `SELECT * FROM customer_bookings WHERE id = $1`;
        const customerQs = `
        SELECT
            id,
            name,
            email,
            country,
            contact,
            city,
            address
        FROM
            customers
        WHERE
            id = $1
    `;
        const travelQs = `SELECT * FROM travel_list WHERE id = $1`;
        const seatsQs = `SELECT * travel_seats FROM WHERE number = $1`;
        try {
            const myBookingsList = yield postgres_1.default.query(bookingsQs, [userId]);
            const myBookingsListRows = myBookingsList.rows;
            const myBookings = myBookingsListRows === null || myBookingsListRows === void 0 ? void 0 : myBookingsListRows.map((item) => __awaiter(this, void 0, void 0, function* () {
                const customers = item.customer_id && (yield postgres_1.default.query(customerQs, [item.customer_id]));
                const [customer] = customers.rows;
                const travelTickets = item.travel_id && (yield postgres_1.default.query(travelQs, [item.travel_id]));
                const [ticket] = travelTickets.rows;
                const seats = item.seat_number && (yield postgres_1.default.query(seatsQs, [item.seat_number]));
                const [seat] = seats.rows;
                return Object.assign(Object.assign(Object.assign(Object.assign({}, item), customer), seat), ticket);
            }));
            const myTickets = yield Promise.all(myBookings);
            const pendingtickets = demo_data_1.tickets === null || demo_data_1.tickets === void 0 ? void 0 : demo_data_1.tickets.filter((ticket) => { var _a; return new Date((_a = ticket === null || ticket === void 0 ? void 0 : ticket.departure) === null || _a === void 0 ? void 0 : _a.date) > new Date(); });
            const expiredTickets = demo_data_1.tickets === null || demo_data_1.tickets === void 0 ? void 0 : demo_data_1.tickets.filter((ticket) => { var _a; return new Date((_a = ticket === null || ticket === void 0 ? void 0 : ticket.departure) === null || _a === void 0 ? void 0 : _a.date) < new Date(); });
            return res.status(200).json({ tickets: [...pendingtickets, ...myTickets], expiredTickets });
        }
        catch (err) {
            console.log(err);
            return res.status(500).json({ message: "Internal server error" });
        }
    });
}
exports.default = getMyTickets;
