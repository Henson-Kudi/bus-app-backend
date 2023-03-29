import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk"

const accessToken = process.env.EXPO_ACCESS_TOKEN!

const expo = new Expo({ accessToken })

export const sendNotification = async (params: {
    token: string
    body: string
    data?: any
    title?: string
}) => {
    if (!Expo.isExpoPushToken(params.token)) {
        return
    }
    const payload = {
        to: params.token,
        sound: "default",
        body: params.body,
        data: params.data,
    } as ExpoPushMessage

    const chunks = expo.chunkPushNotifications([payload])

    return await Promise.all(
        chunks?.map(async (chunk) => {
            try {
                const ticket = await expo.sendPushNotificationsAsync(chunk)
                console.log(ticket)

                return ticket
            } catch (err: any) {
                console.log(err)
                return false
            }
        })
    )
}

export const sendNotificationToMany = async (params: {
    tokens: string[]
    data: {
        body: string
        data?: any
        title?: string
    }
}) => {
    try {
        const messages: ExpoPushMessage[] = []

        params.tokens.map((token) => {
            if (!Expo.isExpoPushToken(token)) {
                console.log("invalid token")

                return
            }
            const payload = {
                to: token,
                sound: "default",
                body: params.data.body,
                data: params.data?.data,
            } as ExpoPushMessage

            messages.push(payload)
        })

        const chunks = expo.chunkPushNotifications(messages)

        const tickets: ExpoPushTicket[][] = []

        for (const chunk of chunks) {
            try {
                const ticket = await expo.sendPushNotificationsAsync(chunk)

                tickets.push(ticket)
            } catch (err: any) {
                console.log(err)
                return false
            }
        }
        return tickets
    } catch (err: any) {
        console.log(err)
        return false
    }
}

export default expo
