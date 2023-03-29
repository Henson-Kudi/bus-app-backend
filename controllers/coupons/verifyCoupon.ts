import { Request, Response } from "express"
import { QueryResult } from "pg"
import pool from "../../models/db/postgres"
import { TravelItem } from "../../types"

export default async function verifyCoupon(req: Request, res: Response): Promise<Response> {
    const data: { couponCode: string; customerId: string; travelId: string } | undefined = req.body

    const travelItemQs = `
        SELECT * FROM travel_list WHERE id = $1 AND coupon_name = $2;
    `

    const usedCouponQs = `
        SELECT * FROM used_coupons WHERE customer_id = $1 AND travel_id = $2;
    `

    try {
        const travelItemResult: QueryResult = await pool.query(travelItemQs, [
            data?.travelId,
            data?.couponCode,
        ])

        // verify if the coupon sent is a valid coupon code

        const [travelItem]: TravelItem[] = travelItemResult.rows
        if (!travelItem) {
            return res.status(200).json({ message: "Invalid coupon code" })
        }

        // if the coupon code is valid, then we want to ensure that it has not been used already by quering from the used coupon table

        const usedCouponResult: QueryResult = await pool.query(usedCouponQs, [
            data?.customerId,
            data?.travelId,
        ])

        const [usedCoupon]: { customer_id: string; travel_id: string }[] = usedCouponResult.rows

        if (usedCoupon) {
            return res.status(200).json({ message: "Coupon code has been used already" })
        }

        // if coupon has not been used already, then we want to apply discount on coupon by resending the coupon, and coupon rate back to the user

        return res.status(200).json({
            message: "Valid coupon",
            coupon: travelItem.coupon_name,
            rate: travelItem.coupon_rate,
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}
