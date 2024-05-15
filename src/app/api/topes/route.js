import { NextResponse } from "next/server";
import pool from "@/db/MysqlConection";

export async function GET(req, res) {
    let sql = `SELECT * FROM topes WHERE Fecha_sorteo = CURDATE()`;

    try {
        let [rows] = await pool.query(sql);
        if (rows.length > 0) {
            return NextResponse.json(rows)
        } else {
            res.status(404).json({ error: 'No se encontraron topes para la fecha actual' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Ocurrió un error al consultar la base de datos' });
    }
}