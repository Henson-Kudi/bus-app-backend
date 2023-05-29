import { Request, Response } from "express"
import { QueryResult } from "pg"
import { emailRegex } from "../../../configs"
import { RegisterUser, UserData } from "../../../types"
import hashPassword from "../../../configs/hashPassword"
import pool from "../../../models/db/postgres"
import { sendMessage } from "../../../configs/twilio"
import { sendMail } from "../../../configs/email"
import validateEmail from "../../../configs/validateEmail"

export default async function registerCustomer(req: Request, res: Response): Promise<Response> {
    const data: RegisterUser | undefined = req.body

    if (!data) {
        return res.status(500).json({ message: "Please submit user data" })
    }

    if (
        !emailRegex.test(data.email) ||
        !data.password.trim() ||
        data.password !== data.confirmPassword
    ) {
        return res.status(500).json({ message: "Please submit valid data" })
    }

    const findUserQs = `SELECT * FROM customers WHERE email = $1`

    const registerQs = `
        INSERT INTO customers(
            name,
            email,
            country_name,
            country_code,
            country_image,
            country_short,
            contact,
            city,
            address,
            password_hash,
            verification_code
        )
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *;
    `

    try {
        const foundUserResult: QueryResult = await pool.query(findUserQs, [data.email])

        const [foundUser]: UserData[] = foundUserResult.rows

        if (foundUser) {
            return res
                .status(500)
                .json({ message: "User already exist. Please try logging in if you're user" })
        }

        const hashedPassword = await hashPassword(data.password)

        const verificationCode = Math.floor(Math.random() * 9000 + 1000)

        const registerResult: QueryResult = await pool.query(registerQs, [
            data.userName,
            data.email.toLowerCase(),
            data.country.name,
            data.country.code,
            data.country.image,
            data.country.short,
            data.contact,
            data.city,
            data.address,
            hashedPassword,
            verificationCode,
        ])
        const [registeredUser]: UserData[] = registerResult.rows
        const dev = process.env.NODE_ENV !== "production"

        const sender = process.env.SMTP_SENDER

        const messageSent = await sendMessage({
            body: `Your verification code is:\n${verificationCode}`,
            to: dev ? process.env.TWILIO_RECEIVER! : `${data?.country?.code}${data?.contact}`,
        })

        if (sender && validateEmail(data.email)) {
            await sendMail({
                from: sender,
                to: data?.email,
                html: `
                    <p>Thank you for chosing 237 Bookings </p>
                    <p> Your verification code is: ${verificationCode} </p>
                `,
                subject: "Verification Code",
            })
        }

        if (!messageSent.sid) {
            throw new Error("400")
        }

        console.log(registeredUser)

        return res.status(200).json(registeredUser)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" })
    }
}
