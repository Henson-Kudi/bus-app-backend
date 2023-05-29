import allowedOrigins from "./allowedOrigins"

const corsOptions = {
    origin: (origin: string, callback: (param1: null | Error, params2: boolean) => {}) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error("Origin not allowed"), false)
        }
    },
}
