import bcrypt from "bcryptjs"

export default async (password: string): Promise<string> => {
    const saltTimes: number | undefined =
        process.env.BCRYPT_SALT_TIMES && +process.env.BCRYPT_SALT_TIMES
            ? +process.env.BCRYPT_SALT_TIMES
            : 10

    const bcryptSalt = await bcrypt.genSalt(saltTimes)

    const hashedPassword = await bcrypt.hash(password, bcryptSalt)

    return hashedPassword
}
