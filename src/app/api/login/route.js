import { NextResponse } from "next/server";
import pool from "@/db/MysqlConection";

export async function POST(req, res) { // Define una función asíncrona llamada POST que toma los objetos de solicitud (req) y respuesta (res).
    let datos = await req.json()   // Espera los datos de la solicitud y los convierte en un objeto JSON.
    const { user, pass } = datos  // Desestructura el objeto "datos" para obtener los campos "user" y "pass".

    let sql = `SELECT  Idvendedor,Nombre,Fechaingreso,Aguinaldo,Domicilio,Telefono,sucursal,Comision,Estatus,Puntos FROM  vendedores WHERE  Idvendedor = '${user}' AND contrasena = '${pass}' `;   // Crea una cadena SQL para seleccionar todos los usuarios que coincidan con el correo y la contraseña proporcionados.
    let [currentTime] = await pool.query('SELECT NOW() as currentTime');
    let sqlUpdate = `UPDATE vendedores
    SET  Fechaingreso= ? 
    WHERE Idvendedor='${user}';`
    let sqlLeyenda = `SELECT Mensaje FROM Mensajes WHERE Idmensaje = 1`;

    try {
        let resulUpdate = await pool.query(sqlUpdate, currentTime[0].currentTime);
        let [rows] = await pool.query(sql)
        let [resultLeyenda] = await pool.query(sqlLeyenda);
        rows.forEach(row => {
            row.requestTime = currentTime[0].currentTime;
            row.mensaje = resultLeyenda[0].Mensaje;
        });

        return NextResponse.json(rows);  

    } catch (error) {
        console.log(error)  
    }

}