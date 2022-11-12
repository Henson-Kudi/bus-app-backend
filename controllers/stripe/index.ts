import { Request, Response } from "express"
import Stripe from "stripe"

const stripe: Stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2022-08-01",
    typescript: true,
})

const createPaymentIntent = async (req: Request, res: Response): Promise<Response> => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 1099,
            currency: "usd",
            payment_method_types: ["card"],
        })

        const clientSecret = paymentIntent.client_secret

        return res.status(200).json(clientSecret)
    } catch (err: any) {
        return res.status(500).json({ error: err.message })
    }
}

export default createPaymentIntent
