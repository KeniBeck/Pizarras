import { NextResponse } from "next/server";
import pool from "@/db/MysqlConection";

export async function POST(req, res) { // Define una función asíncrona llamada POST que toma los objetos de solicitud (req) y respuesta (res).
    let datos = await req.json()   // Espera los datos de la solicitud y los convierte en un objeto JSON.
    const { user, pass } = datos  // Desestructura el objeto "datos" para obtener los campos "user" y "pass".

    let sql = `SELECT  * FROM  usuarios WHERE  Usuario = '${user}' AND Contra = '${pass}' AND Estatus = 'Pagador'`;   // Crea una cadena SQL para seleccionar todos los usuarios que coincidan con el correo y la contraseña proporcionados.
    let [currentTime] = await pool.query('SELECT NOW() as currentTime');

    try {
        let [rows] = await pool.query(sql)
        rows.forEach(row => row.requestTime = currentTime[0].currentTime);
        return NextResponse.json(rows);  // Devuelve los datos obtenidos como respuesta en formato JSON utilizando NextResponse.
    } catch (error) {
        console.log(error)  // Captura cualquier error que ocurra durante la ejecución de la consulta y lo registra en la consola.
    }

}