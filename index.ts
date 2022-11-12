import express, { Request, Response } from "express"
import home from "./routes"
import buses from "./routes/buses"
import offers from "./routes/offers"
import agencies from "./routes/agencies"
import tickets from "./routes/tickets"
import stripe from "./routes/stripe"

const app = express()

const PORT = process.env.PORT || 5000

app.use("/api/bus-list", buses)

app.use("/api/bus-offers", offers)

app.use("/api/agencies", agencies)

app.use("/api/tickets", tickets)

app.use("/api/stripe", stripe)

app.use("/api", home)

app.get("/", (req: Request, res: Response) => {
    res.redirect("/api")
})

app.listen(PORT, () => {
    console.log(`App listening on port:${PORT}`)
})
