import axios from "axios"

const mtnbaseUrl = process.env.MTN_MOMO_BASEURL
const mtnbaseUrlSandbox = process.env.MTN_MOMO_BASEURL_SANDBOX

const development = process.env.NODE_ENV !== "production"

export const baseUrl = axios.create({
    baseURL: development ? mtnbaseUrlSandbox : mtnbaseUrl,
    headers: {
        accept: "*/*",
        "Content-Type": "application/json",
    },
})
