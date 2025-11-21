import { NextResponse } from "next/server";
import pool from "@/db/MysqlConection";

export async function GET(req, res) {
    let sql = `SELECT leyenda3 as precioBoleto FROM configuracion`;
    try {
        let result = await pool.query(sql);
        return NextResponse.json(result[0][0]);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Error al obtener el precio" }, { status: 500 });
    }
}