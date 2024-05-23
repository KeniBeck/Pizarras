import { NextResponse } from "next/server";
import pool from "@/db/MysqlConection";

export async function POST(req, res) {

    const data = await req.json();
    const { Idvendedor } = data;

    let sql = `SELECT * FROM boletos WHERE Idvendedor = ? ORDER BY Idsorteo DESC`;

    try {
        let resultView = await pool.query(sql, [Idvendedor]);
        return NextResponse.json(resultView[0]);

    } catch (error) {
        console.log(error);

    }
}