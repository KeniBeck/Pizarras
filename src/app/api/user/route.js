import pool from "@/db/MysqlConection";
import { NextResponse } from "next/server";

export async function POST(req, res) {
    const data = await req.json();
    const { userId } = data;

    let sql = `SELECT * FROM vendedores WHERE Idvendedor = ${userId}`;
    try {
        let rows = await pool.query(sql);
        return NextResponse.json(rows[0][0]);
    } catch (error) {
        return NextResponse.error(error);
    }
}