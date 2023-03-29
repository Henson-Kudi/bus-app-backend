import { baseUrl as axios } from "./axios"
type AccessToken = {
    access_token: string
    token_type: string
    expires_in: number
}
export default async function getMtnAccessToken(): Promise<AccessToken | undefined> {
    const basicToken =
        process.env.NODE_ENV !== "production"
            ? process.env.MTN_MOMO_BASIC_AUTH_TOKEN_SANDBOX
            : process.env.MTN_MOMO_BASIC_AUTH_TOKEN

    const subscriptionKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY

    try {
        const { data } = await axios.post<AccessToken>(
            "/collection/token/",
            {},
            {
                headers: {
                    Authorization: `Basic ${basicToken!}`,
                    "Ocp-Apim-Subscription-Key": subscriptionKey!,
                },
            }
        )

        return data
    } catch (err) {
        console.log(err)
        return undefined
    }
}
