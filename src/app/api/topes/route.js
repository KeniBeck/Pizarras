import { NextResponse } from "next/server";
import pool from "@/db/MysqlConection";

export async function POST(req) {
    try {
        const { ticketNumber } = await req.json(); // Obtener el número de boleto del cuerpo de la solicitud
        const sql = `SELECT * FROM topes WHERE Fecha_sorteo = CURDATE() AND Numero = ?`;

        const [rows] = await pool.query(sql, [ticketNumber]); // Usar parámetros para evitar inyecciones SQL

        if (rows.length > 0) {
            return NextResponse.json({ tope: rows });
        } else {
            return NextResponse.json({ tope: [] }); // Devolver un array vacío si no se encuentran topes
        }
    } catch (error) {
        console.log(error);
        return NextResponse.json({ status: 500, message: 'Ocurrió un error al consultar la base de datos' });
    }
}