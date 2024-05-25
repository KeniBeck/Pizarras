import { NextResponse } from "next/server";
import pool from "@/db/MysqlConection";


export async function POST(req, res) {

    const data = await req.json();

    const { Idvendedor, Fechaingreso } = data;

    const fecha = new Date(Fechaingreso).toISOString().slice(0, 19).replace('T', ' ').split(' ')[0];
    let sql = `SELECT * FROM boletos WHERE Date(Fecha) = '${fecha}' AND Idvendedor = ? ORDER BY Idsorteo DESC`;

    try {
        let resultView = await pool.query(sql, [Idvendedor]);
        if (resultView[0].length === 0) {
            return NextResponse.json({ message: 'No hay ventas para este vendedor en la fecha especificada.' });
        }
        return NextResponse.json(resultView[0]);

    } catch (error) {
        console.log(error);

    }
}
export async function DELETE(req, res) {

    const data = await req.json();
    const { Idvendedor, Boleto, Costo, Fecha, Idsorteo, Primerpremio, Segundopremio, comprador } = data;


    let sql = `DELETE FROM boletos
    WHERE Idsorteo='${Idsorteo}';`;

    try {
        let resultView = await pool.query(sql);
        return NextResponse.json(resultView[0]);

    } catch (error) {
        console.log(error);

    }
}