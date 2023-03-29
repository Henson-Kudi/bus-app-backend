import { Request, Response } from "express"
import getRequestToPayStatus from "../../../configs/getRequestToPayStatus"

export default async function requestToPayStatus(req: Request, res: Response): Promise<Response> {
    let data: { referenceId: string; token: string; customerId: string } | undefined = req.body

    const io: any = req.app.get("io")

    if (!data) {
        return res.status(400).json({ message: "Bad request" })
    }

    try {
        const paymentStatus = await getRequestToPayStatus(data.referenceId, data.token)

        if (!paymentStatus) {
            return res.status(500).json({ message: "Payment rejected." })
        }

        io.to(data.customerId).emit("request_to_pay_status", { ...paymentStatus, timeout: 15000 })

        return res.status(200).end()
    } catch (err: any) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error", ...err })
    }
}
