import axios from "axios"
import { Request, Response } from "express"

export default async function createMtnuser(req: Request, res: Response): Promise<Response> {
    try {
        const data: { callbackHost?: string; referenceId: string } = req.body
        if (!data.referenceId) {
            throw new Error("Provide reference id")
        }

        const params: { providerCallbackHost?: string } = {}

        if (data.callbackHost) {
            params.providerCallbackHost = data.callbackHost
        }

        const { data: response } = await axios.post(
            "https://sandbox.momodeveloper.mtn.com/v1_0/apiuser",
            params,
            {
                headers: {
                    "X-Reference-Id": data.referenceId,
                    "Content-Type": "application/json",
                    "Ocp-Apim-Subscription-Key": process.env.MTN_MOMO_SUBSCRIPTION_KEY,
                },
            }
        )

        const { data: apikeyRes } = await axios.post(
            `https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/${data.referenceId}/apikey`,
            {},
            {
                headers: {
                    "Ocp-Apim-Subscription-Key": process.env.MTN_MOMO_SUBSCRIPTION_KEY,
                },
            }
        )

        return res
            .status(200)
            .json({
                message: "User created",
                userId: data.referenceId,
                providerCallbackHost: data.callbackHost,
                ...apikeyRes,
            })
    } catch (err: any) {
        return res.status(500).json(err)
    }
}
