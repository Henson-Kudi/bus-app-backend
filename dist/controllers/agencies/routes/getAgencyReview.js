"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const demo_data_1 = require("../../../demo-data");
function default_1(req, res) {
    res.status(200).json(demo_data_1.reviews);
}
exports.default = default_1;
