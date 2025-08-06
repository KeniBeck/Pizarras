import pool from "@/db/MysqlConection";
import { NextResponse } from "next/server";

export async function POST(req) {
    const data = await req.json();
    const { Sorteo } = data;
    try {
        let sql, params;
        if (Sorteo) {
            sql = `SELECT * FROM premiados WHERE Sorteo = ? ORDER BY idpremiados DESC LIMIT 1`;
            params = [Sorteo];
        } else {
            sql = `SELECT * FROM premiados ORDER BY idpremiados DESC LIMIT 1`;
            params = [];
        }
        const [rows] = await pool.query(sql, params);
        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}