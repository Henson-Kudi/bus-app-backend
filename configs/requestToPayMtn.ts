import { baseUrl as axios } from "./axios"
import { v4 as uuid } from "uuid"
import { RequestToPayData } from "../types"

export default async function requestToPaymtn(
    token: string,
    data: RequestToPayData,
    referenceId: string
): Promise<{ referenceId: string } | undefined> {
    const subscriptionKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY
    const targetEnvironment = process.env.NODE_ENV !== "production" ? "sandbox" : "production"
    const callbackHost = process.env.CALLBACK_HOST

    try {
        const res = await axios.post("/collection/v1_0/requesttopay", data, {
            headers: {
                Authorization: `Bearer ${token}`,
                "X-Reference-Id": referenceId,
                "X-Target-Environment": targetEnvironment,
                "Ocp-Apim-Subscription-Key": subscriptionKey,
                // "X-Callback-Url": `${callbackHost}/payments/mtn/collection-callback`,
            },
        })

        return { referenceId }
    } catch (err: any) {
        console.log(err)

        return undefined
    }
}
