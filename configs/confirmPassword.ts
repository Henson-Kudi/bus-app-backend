import bcrypt from "bcryptjs"

export default async function confirmPassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
}
