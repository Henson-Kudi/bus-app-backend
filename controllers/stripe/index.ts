import { Request, Response } from "express"
import Stripe from "stripe"

const stripe: Stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2022-08-01",
    typescript: true,
})

const createPaymentIntent = async (req: Request, res: Response): Promise<Response> => {
    const data: { amount: string } | undefined = req.body

    try {
        if (!data || isNaN(+data.amount) || !data.amount) {
            return res.status(500).json({ message: "Please provide an amount" })
        }

        const customer = await stripe.customers.create()
        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: customer.id },
            { apiVersion: "2020-08-27" }
        )

        const paymentIntent = await stripe.paymentIntents.create({
            amount: +data.amount,
            currency: "xaf",
            customer: customer.id,
            automatic_payment_methods: {
                enabled: true,
            },
        })

        return res.status(200).json({
            paymentIntent: paymentIntent.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: customer.id,
        })
    } catch (err: any) {
        console.log(err)

        return res.status(500).json({ message: err.message, ...err })
    }
}

export default createPaymentIntent
