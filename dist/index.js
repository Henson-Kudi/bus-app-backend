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
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const routes_1 = __importDefault(require("./routes"));
const buses_1 = __importDefault(require("./routes/buses"));
const offers_1 = __importDefault(require("./routes/offers"));
const agencies_1 = __importDefault(require("./routes/agencies"));
const tickets_1 = __importDefault(require("./routes/tickets"));
const stripe_1 = __importDefault(require("./routes/payments/stripe"));
const mtn_1 = __importDefault(require("./routes/payments/mtn"));
const coupons_1 = __importDefault(require("./routes/coupons"));
const customers_1 = __importDefault(require("./routes/customers"));
const authentication_1 = __importDefault(require("./routes/authentication"));
const postgres_1 = require("./models/db/postgres");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, { cors: { origin: "*" } });
const PORT = process.env.PORT || 5000;
app.set("io", io);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api/bus-list", buses_1.default);
app.use("/api/bus-offers", offers_1.default);
app.use("/api/agencies", agencies_1.default);
app.use("/api/tickets", tickets_1.default);
app.use("/api/payments/stripe", stripe_1.default);
app.use("/api/payments/mtn", mtn_1.default);
app.use("/api/coupons", coupons_1.default);
app.use("/api", routes_1.default);
app.use("/api/customers", customers_1.default);
app.use("/api/auth", authentication_1.default);
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send("Hello");
}));
io.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("a user connected", socket.id);
    const userId = socket.handshake.query.id;
    if (!userId) {
        return;
    }
    yield socket.join(userId);
    socket.to(userId).emit("connection_created", `Successfully connected with id ${userId}`);
}));
server.listen(PORT, () => {
    console.log(`App listening on port:${PORT}`);
    postgres_1.db.runMigrations();
});
