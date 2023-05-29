import { Request, Response } from "express"
import nodemailer from "nodemailer"
import AWS from "aws-sdk"
import SMTPTransport from "nodemailer/lib/smtp-transport"
import Mail from "nodemailer/lib/mailer"
import internal from "stream"

export const sendMail = async (params?: {
    from: string
    to: string
    subject?: string
    text?: string
    attachments?: { filename: string; content: any }[]
    html?: string
}): Promise<string | null> => {
    if (!params?.from || !params.to) {
        return null
    }

    const mailOptions: {
        from: string
        to: string
        text?: string
        subject?: string
        attachments?: Mail.Attachment[]
        html?: string | Buffer | internal.Readable | Mail.AttachmentLike | undefined
    } = {
        from: params?.from,
        to: params?.to,
    }

    if (params.text) {
        mailOptions.text = params.text
    }

    if (params.subject) {
        mailOptions.subject = params.subject
    }

    if (params.attachments?.length) {
        mailOptions.attachments = params.attachments
    }

    if (params.html) {
        mailOptions.html = params.html
    }

    const sesTransport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: 465,
        secure: true,
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD,
        },
        // tls: {
        //     rejectUnauthorized: false
        // }
    })

    const res = await sesTransport.sendMail(mailOptions)

    if (!res) {
        return null
    }

    return res.response
}
