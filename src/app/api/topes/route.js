import { NextResponse } from "next/server";
import pool from "@/db/MysqlConection";

export async function POST(req) {
    const { ticketNumber } = await req.json();
    let sql = `SELECT * FROM topes WHERE Fecha_sorteo = CURDATE() AND Numero = ${ticketNumber}`;

    try {
        let [rows] = await pool.query(sql);
        if (rows.length > 0) {
            return NextResponse.json({ tope: rows });
        } else {
            return NextResponse.json({ error: 'No se encontró un tope para la fecha actual' });
        }
    } catch (error) {
        console.log(error);
        return NextResponse.error({ status: 500, message: 'Ocurrió un error al consultar la base de datos' });
    }
}