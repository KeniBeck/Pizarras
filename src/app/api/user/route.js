import pool from "@/db/MysqlConection";
import { NextResponse } from "next/server";

export async function POST(req, res) {
    const data = await req.json();
    const { userId } = data;

    let sql = `SELECT Idvendedor,Nombre,Fechaingreso,Aguinaldo,Domicilio,Telefono,sucursal,Comision,Estatus,Puntos FROM vendedores WHERE Idvendedor = ${userId}`;
    let sqlLeyenda = `SELECT Mensaje FROM Mensajes WHERE Idmensaje = 1`;
    try {
        let [rows] = await pool.query(sql);
        let [resultLeyenda] = await pool.query(sqlLeyenda);

        rows.map(row => {
            row.mensaje = resultLeyenda[0].Mensaje;
        });
        return NextResponse.json(rows[0]);
    } catch (error) {
        return NextResponse.error(error);
    }
}