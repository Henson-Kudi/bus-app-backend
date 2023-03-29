import twilio from "twilio"
import { Twilio } from "twilio/lib"

const accountId: string | undefined = process.env.TWILIO_SID
const accountAuthToken: string | undefined = process.env.TWILIO_AUTH_TOKEN

const twilioClient: Twilio = twilio(accountId, accountAuthToken)

export default twilioClient

export const sendMessage = async (params: { body: string; to: string }) => {
    const dev = process.env.NODE_ENV !== "production"

    const sender = process.env.TWILIO_NUMBER

    const receiver = dev ? process.env?.TWILIO_RECEIVER : params.to

    const message = await twilioClient.messages.create({
        body: params.body,
        to: receiver!,
        from: sender!,
    })

    return message
}
