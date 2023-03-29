import { Request, Response } from "express"
import getMtnTransferToken from "../../../configs/getMtnTransferToken"
import requestRefundMtn from "../../../configs/requestRefundMtn"
import { RequestToTransfer } from "../../../types"

export default async function requestToTransfer(req: Request, res: Response): Promise<Response> {
    const data: RequestToTransfer | undefined = req.body

    const development = process.env.NODE_ENV !== "production"
    const io = req.app.get("io")

    const testNumbers = ["46733123450", "46733123451", "46733123452", "46733123453", "46733123454"]
    const testNumberIndex = Math.floor(Math.random() * testNumbers.length)
    try {
        if (!data || !data.amount || !data.referenceId || !data.customerId || !data.momoNumber) {
            throw new Error("invalid data")
        }

        const transferPayload = {
            amount: development ? "100" : data.amount?.toString(),
            currency: development ? "EUR" : "XAF",
            externalId: data.customerId,
            payee: {
                partyIdType: "MSISDN",
                partyId: development ? testNumbers[testNumberIndex] : data.momoNumber,
            },
            payerMessage: development ? "test transfer" : "Refund for booking cancellation",
            payeeNote: development
                ? "testing transfer"
                : "Sorry to see you cancel your booking. Hope you book again with us",
        }

        const tokenInfo = await getMtnTransferToken()

        if (!tokenInfo) {
            throw new Error("mtn")
        }

        const refundRequestRes = await requestRefundMtn({
            ...transferPayload,
            token: tokenInfo?.access_token,
            referenceId: data.referenceId,
        })

        if (!refundRequestRes) {
            throw new Error("mtn")
        }

        io.to(data.customerId).emit("request_to_transfer_status", {
            message: "Processing transfer. Please wait",
            token: tokenInfo?.access_token,
            referenceId: data.referenceId,
            status: "PENDING",
            timeout: 30000,
        })

        return res.status(200).json(refundRequestRes)
    } catch (err: any) {
        console.log(err)

        io.to(data?.customerId).emit("request_to_transfer_status", {
            message: "FAILED",
            token: null,
            referenceId: null,
            status: "FAILED",
            timeout: 2000,
        })

        if (err.message === "mtn") {
            return res.status(502).json({ message: "Unexpected MTN error. Please try later" })
        }

        if (err.message === "invalid data") {
            return res.status(400).json({
                message: err.message,
            })
        }
        return res.status(500).json({ message: "Internal server error. Please try later." })
    }
}
