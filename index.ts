import express, { Request, Response } from "express"
import expressFileUpload from "express-fileupload"
import cors from "cors"
import cookierParser from "cookie-parser"
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
import credentials from "./controllers/credentials"

const app = express()

app.use(credentials)

app.use(
    cors({
        origin: (origin, cb) => {
            cb(null, origin)
        },
    })
)

const server = http.createServer(app)

const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
    server,
    {
        cors: {
            origin: (origin, cb) => {
                cb(null, origin)
            },
        },
    }
)

const PORT = process.env.PORT || 5000

app.set("io", io)

app.use(express.json())

app.use(cookierParser())

app.use(express.urlencoded({ extended: true }))

// app.use(expressFileUpload({}))

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

// console.log(
//     new Buffer("79039a6f-d667-4a12-bc9f-10142dab643d:bc2acfd62a36493bb044ecaf8bc3c4de").toString(
//         "base64"
//     )
// )
