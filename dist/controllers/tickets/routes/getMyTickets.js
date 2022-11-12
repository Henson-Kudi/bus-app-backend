"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const demo_data_1 = require("../../../demo-data");
function getMyTickets(req, res) {
    const { userId } = req.params;
    const pendingtickets = demo_data_1.tickets === null || demo_data_1.tickets === void 0 ? void 0 : demo_data_1.tickets.filter((ticket) => { var _a; return new Date((_a = ticket === null || ticket === void 0 ? void 0 : ticket.departure) === null || _a === void 0 ? void 0 : _a.date) > new Date(); });
    const expiredTickets = demo_data_1.tickets === null || demo_data_1.tickets === void 0 ? void 0 : demo_data_1.tickets.filter((ticket) => { var _a; return new Date((_a = ticket === null || ticket === void 0 ? void 0 : ticket.departure) === null || _a === void 0 ? void 0 : _a.date) < new Date(); });
    res.status(200).json({ tickets: pendingtickets, expiredTickets });
}
exports.default = getMyTickets;
