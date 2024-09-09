import pool from "@/db/MysqlConection";
import { NextResponse } from "next/server";

export async function GET(req) {
    let sql = `SELECT Mensaje FROM Mensajes WHERE Idmensaje = 1`;
    try {
        let result = await pool.query(sql);
        return NextResponse.json(result[0][0]);

    } catch (error) {
        return NextResponse.error({ status: 500, message: error.message });

    }
}