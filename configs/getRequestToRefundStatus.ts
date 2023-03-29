import { stat } from "fs"
import { RequestToPayData } from "../types"
import { baseUrl as axios } from "./axios"

export default async function getRequestToRefundStatus(
    referenceId: string,
    token: string
): Promise<RequestToPayData | undefined> {
    const subscriptionKey = process.env.TRANSFER_KEY_MTN
    const targetEnvironment =
        process.env.NODE_ENV !== "production" ? "sandbox" : process.env.TARGET_ENVIRONMENT

    try {
        // setTimeout(async () => {https://sandbox.momodeveloper.mtn.com/
        const { data } = await axios.get<RequestToPayData>(
            `/disbursement/v1_0/transfer/${referenceId}`,
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
