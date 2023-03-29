import { stat } from "fs"
import { RequestToPayData } from "../types"
import { baseUrl as axios } from "./axios"

export default async function getRequestToPayStatus(
    referenceId: string,
    token: string
): Promise<RequestToPayData | undefined> {
    const subscriptionKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY
    const targetEnvironment = process.env.NODE_ENV !== "production" ? "sandbox" : process.env.TARGET_ENVIRONMENT

    try {
        // setTimeout(async () => {
        const { data } = await axios.get<RequestToPayData>(
            `/collection/v1_0/requesttopay/${referenceId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "X-Target-Environment": targetEnvironment,
                    "Ocp-Apim-Subscription-Key": subscriptionKey,
                },
            }
        )

        return data
        // }, 15000)
    } catch (err) {
        console.log(err)
        return undefined
    }
}
