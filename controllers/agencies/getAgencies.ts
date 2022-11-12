import { Request, Response } from "express"
import pool from "../../models/db/postgres"

export default async function (req: Request, res: Response) {
    try {
        const { rows } = await pool.query(
            "create table if not exists users( name Varchar(20) not null, email varchar(20) unique not null)"
        )

        const { rows: insierts } = await pool.query(
            "insert into users(name, email) values('Henson Kudi Amah', 'aamahkkudi@gmail.com')"
        )

        const { rows: selects } = await pool.query("select * from users")

        res.send(selects)
    } catch (err) {
        console.log(err)
    }
}
