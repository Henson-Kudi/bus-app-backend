import express, { Request, Response } from "express"
import { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from "./types"
import http from "http"
import { Server } from "socket.io"
import home from "./routes"
import buses from "./routes/buses"
import offers from "./routes/offers"
import agencies from "./routes/agencies"
import tickets from "./routes/tickets"
import stripe from "./routes/payments/stripe"
import mtn from "./routes/payments/mtn"
import coupons from "./routes/coupons"
import customers from "./routes/customers"
import auth from "./routes/authentication"
import { db } from "./models/db/postgres"

const app = express()

const server = http.createServer(app)

const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
    server,
    { cors: { origin: "*" } }
)

const PORT = process.env.PORT || 5000

app.set("io", io)

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.use("/api/bus-list", buses)

app.use("/api/bus-offers", offers)

app.use("/api/agencies", agencies)

app.use("/api/tickets", tickets)

app.use("/api/payments/stripe", stripe)
app.use("/api/payments/mtn", mtn)

app.use("/api/coupons", coupons)

app.use("/api", home)

app.use("/api/customers", customers)

app.use("/api/auth", auth)

app.get("/", async (req: Request, res: Response) => {
    res.send("Hello")
})

io.on("connection", async (socket) => {
    console.log("a user connected", socket.id)

    const userId = socket.handshake.query.id

    if (!userId) {
        return
    }

    await socket.join(userId)

    socket.to(userId).emit("connection_created", `Successfully connected with id ${userId}`)
})

server.listen(PORT, () => {
    console.log(`App listening on port:${PORT}`)
    db.runMigrations()
})
