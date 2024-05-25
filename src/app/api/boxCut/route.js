import { NextResponse } from "next/server";
import pool from "@/db/MysqlConection";

export async function POST(req, res) {

    const data = await req.json();

    const { Idvendedor, Fecha } = data;
    const fecha = new Date(Fecha).toISOString().slice(0, 19).replace('T', ' ').split(' ')[0];

    let sql = `SELECT * FROM boletos WHERE Date(Fecha) = '${fecha}' AND Idvendedor = ? ORDER BY Idsorteo DESC`;

    try {
        let resultView = await pool.query(sql, [Idvendedor]);

        // Get the current server time
        const serverTimeQuery = 'SELECT NOW() as serverTime';
        const serverTimeResult = await pool.query(serverTimeQuery);
        const serverTime = serverTimeResult[0].serverTime;

        return NextResponse.json({ tickets: resultView[0], serverTime });

    } catch (error) {
        console.log(error);
    }
}