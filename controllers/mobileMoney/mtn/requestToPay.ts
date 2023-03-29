import { time } from "console"
import { Request, Response } from "express"
import getMtnAccessToken from "../../../configs/getMtnAccessToken"
import getRequestToPayStatus from "../../../configs/getRequestToPayStatus"
import requestToPaymtn from "../../../configs/requestToPayMtn"
import pool from "../../../models/db/postgres"
import {
    AgencyData,
    CustomerRequestToPay,
    Departure,
    Driver,
    RequestToPayData,
    Seats,
} from "../../../types"

export default async function requestToPay(req: Request, res: Response): Promise<Response> {
    const data: CustomerRequestToPay | undefined = req.body
    const development = process.env.NODE_ENV !== "production"
    const io = req.app.get("io")

    if (!data) {
        return res.status(500).json({ message: "Please submit valid json data" })
    }

    const testNumbers = ["46733123450", "46733123451", "46733123452", "46733123453", "46733123454"]
    const testNumberIndex = Math.floor(Math.random() * testNumbers.length)

    try {
        const paymentRequestData: RequestToPayData = {
            amount: development ? "100" : data.bus.departure.price.toString(),
            currency: development ? "EUR" : "XAF",
            externalId: data.customer.id,
            payer: {
                partyIdType: "MSISDN",
                partyId: development
                    ? testNumbers[testNumberIndex]
                    : data.customer.contact.toString(),
            },
            payeeNote: `Conform booking for bus number ${data.bus.number} traveling on ${data.bus.departure.date}`,
            payerMessage: "Please confirm payment for your booking",
        }

        const token = await getMtnAccessToken()

        if (!token) {
            throw new Error("Unexpected error")
        }

        const paymentRequestId = await requestToPaymtn(
            token.access_token,
            paymentRequestData,
            data.payment_id
        )

        if (!paymentRequestId) {
            throw new Error("no id")
        }

        io.to(data.customer.id).emit("request_to_pay_status", {
            message: "Please confirm payment",
            token,
            status: "PENDING",
            timeout: 30000,
        })

        return res.status(200).end()
    } catch (err: any) {
        console.log(err.message)

        io.to(data.customer.id).emit("request_to_pay_status", {
            message: "FAILED",
            token: null,
            status: "FAILED",
            timeout: 2000,
        })

        if (err.message === "no id") {
            return res.status(500).json({ message: "Payment rejected. Unexpected Error" })
        }

        return res.status(500).json({
            message: "Some unecpexted error occured. Payment not effected",
            ...err,
        })
    }
}
