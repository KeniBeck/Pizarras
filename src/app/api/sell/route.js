import { NextResponse } from "next/server";
import pool from "@/db/MysqlConection";

export async function POST(req, res) {
    let datos = await req.json();
    const { fecha, idSorteo, idVendedor, name, primerPremio, prizebox, segundoPremio, ticketNumber, topePermitido } = datos;


    let sql = `
        INSERT INTO boletos
        ( Fecha, Primerpremio, Segundopremio, Boleto, Costo, comprador, Idvendedor)
        VALUES( CURRENT_TIMESTAMP(), ?, ?, ?, ?, ?, ?)
    `;
    let sqlUpdate = `UPDATE topes SET Tope = ${topePermitido} WHERE Numero = ${ticketNumber}`;
    let values = [primerPremio, segundoPremio, ticketNumber, prizebox, name, idVendedor];

    try {
        let result = await pool.query(sql, values);
        let resultUpdate = await pool.query(sqlUpdate);
        return NextResponse.json(result);
    } catch (error) {
        console.log(error);
    }
}