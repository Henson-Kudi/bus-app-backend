import axios from "axios"
import { RequestToTransfer } from "../types"

interface RequestData {
    amount: string
    currency: string
    externalId: string
    payee: {
        partyIdType: string
        partyId: string
    }
    payerMessage: string
    payeeNote: string
    token: string
    referenceId: string
}

export default async function requestRefundMtn(
    data: RequestData
): Promise<RequestData | undefined> {
    const { amount, currency, externalId, payee, payerMessage, payeeNote, referenceId, token } =
        data

    const development = process.env.NODE_ENV !== "production"
    const callbackHost = process.env.CALLBACK_HOST
    try {
        const { data: res } = await axios.post(
            process.env.MTN_TRANSFER_URL!,
            { amount, currency, externalId, payee, payerMessage, payeeNote },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "X-Reference-Id": referenceId,
                    "X-Target-Environment": development
                        ? "sandbox"
                        : process.env.TARGET_ENVIRONMENT,
                    "Content-Type": "application/json",
                    "Ocp-Apim-Subscription-Key": process.env.TRANSFER_KEY_MTN,
                    // "X-Callback-Url": `${callbackHost}/payments/mtn/refund-callback`,
                },
            }
        )

        return data
    } catch (err: any) {
        console.log(err)

        return undefined
    }
}
