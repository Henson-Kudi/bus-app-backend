"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const buses_1 = __importDefault(require("./routes/buses"));
const offers_1 = __importDefault(require("./routes/offers"));
const agencies_1 = __importDefault(require("./routes/agencies"));
const tickets_1 = __importDefault(require("./routes/tickets"));
const stripe_1 = __importDefault(require("./routes/stripe"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use("/api/bus-list", buses_1.default);
app.use("/api/bus-offers", offers_1.default);
app.use("/api/agencies", agencies_1.default);
app.use("/api/tickets", tickets_1.default);
app.use("/api/stripe", stripe_1.default);
app.use("/api", routes_1.default);
app.get("/", (req, res) => {
    res.redirect("/api");
});
app.listen(PORT, () => {
    console.log(`App listening on port:${PORT}`);
});
