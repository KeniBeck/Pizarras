import { NextResponse } from "next/server";
import pool from "@/db/MysqlConection";

export async function POST(req) {
    let datos = await req.json()   // Espera los datos de la solicitud y los convierte en un objeto JSON.
    let { date } = datos  // Desestructura el objeto "datos" para obtener el campo "date".
    // Convierte la fecha a un string en formato ISO


    let sql = `SELECT * FROM sorteo WHERE Fecha = '${date}'`;   // Crea una cadena SQL para seleccionar todos los registros que coincidan con la fecha proporcionada.
    try {
        let [rows] = await pool.query(sql) // Ejecuta la consulta SQL utilizando la conexión a la base de datos "pool" y espera el resultado.
        return NextResponse.json(rows)  // Devuelve los datos obtenidos como respuesta en formato JSON utilizando NextResponse.

    } catch (error) {
        console.log(error)  // Captura cualquier error que ocurra durante la ejecución de la consulta y lo registra en la consola.
        return NextResponse.error({ status: 500, message: 'Internal Server Error' });
    }
}