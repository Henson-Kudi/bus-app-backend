import { emailRegex } from "."
export default function validateEmail(email: string): boolean {
    const isValidEmail = email.match(emailRegex)
    return isValidEmail ? true : false
}
