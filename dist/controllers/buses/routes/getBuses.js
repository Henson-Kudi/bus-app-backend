"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const demo_data_1 = require("../../../demo-data");
function default_1(req, res) {
    try {
        // handle database query
        res.status(200).json(demo_data_1.busList);
    }
    catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}
exports.default = default_1;
