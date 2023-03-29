import express, { Request, Response } from "express"
import requestToPay from "../../controllers/mobileMoney/mtn/requestToPay"
import requestToPayStatus from "../../controllers/mobileMoney/mtn/requestToPayStatus"
import requestToRefundStatus from "../../controllers/mobileMoney/mtn/requestToRefundStatus"
import requestToTransfer from "../../controllers/mobileMoney/mtn/requestTotransfer"

const Router = express.Router()

// COLLECTION API
Router.route("/request-to-pay").post(requestToPay)
Router.route("/request-to-pay-status").post(requestToPayStatus)

Router.route("/collection-callback").post(async (req: Request, res: Response) => {
    const io: any = req.app.get("io")

    const data: {
        externalId: string
        amount: string
        currency: string
        payer: {
            partyIdType: string
            partyId: string
        }
        payerMessage: string
        payeeNote: string
        status: string
        reason: string
    } = req.body

    await io.to(data.externalId).emit("request_to_pay_status", { ...data, timeout: 15000 })

    res.send("Ok, test working")
})

// CUSTOMER REFUND REQUESTS

Router.route("/refund-booking").post(
    // authoriseRefund,
    requestToTransfer
)

Router.route("/refund-booking-status").post(requestToRefundStatus)

Router.route("/refund-callback").post(async (req: Request, res: Response) => {
    const io: any = req.app.get("io")

    const data: {
        externalId: string
        amount: string
        currency: string
        payer: {
            partyIdType: string
            partyId: string
        }
        payerMessage: string
        payeeNote: string
        status: string
        reason: string
    } = req.body

    await io.to(data.externalId).emit("request_to_transfer_status", { ...data, timeout: 15000 })

    res.send("Ok, test refund working")
})

export default Router
