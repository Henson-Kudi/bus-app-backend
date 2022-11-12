import { Request, Response, RequestHandler } from "express"

export default function <RequestHandler>(req: Request, res: Response) {
    res.send("<h1>Hello from app</h1>")
}
