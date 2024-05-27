import { NextResponse } from "next/server";
import pool from "@/db/MysqlConection";

//normal
export async function POST(req, res) {
    let datos = await req.json();
    const { fecha, idSorteo, idVendedor, name, primerPremio, prizebox, segundoPremio, ticketNumber, topePermitido } = datos;

    let sql = `
        INSERT INTO boletos
        ( Fecha, Primerpremio, Segundopremio, Boleto, Costo, comprador, Idvendedor,tipo_sorteo)
        VALUES( CURRENT_TIMESTAMP(), ?, ?, ?, ?, ?, ?, ?)
    `;
    let sqlUpdate = `UPDATE topes SET Tope = ${topePermitido}, Cantidad = Cantidad - 1 WHERE Numero = ${ticketNumber}`;
    let sqlSelect = `SELECT * FROM boletos WHERE Boleto = ? ORDER BY Idsorteo DESC LIMIT 1`;
    let values = [primerPremio, segundoPremio, ticketNumber, prizebox, name, idVendedor, idSorteo];

    try {
        let result = await pool.query(sql, values);
        let resultUpdate = await pool.query(sqlUpdate);
        let resultSelect = await pool.query(sqlSelect, [ticketNumber]);

        return NextResponse.json(resultSelect);
    } catch (error) {
        console.log(error);
    }
}
//serie
export async function PUT(req, res) {
    let datos = await req.json();
    const { fecha, idSorteo, idVendedor, name, primerPremio, prizebox, segundoPremio, ticketNumber } = datos;


    let sql = `
        INSERT INTO boletos
        ( Fecha, Primerpremio, Segundopremio, Boleto, Costo, comprador, Idvendedor,tipo_sorteo)
        VALUES( CURRENT_TIMESTAMP(), ?, ?, ?, ?, ?, ?, ?)
    `;
    // Obtener los últimos 10 elementos insertados
    let sqlSelect = `SELECT * FROM boletos WHERE comprador = ? ORDER BY Idsorteo DESC LIMIT 10`;


    let values = [primerPremio, segundoPremio, ticketNumber, prizebox, name, idVendedor, idSorteo];

    try {
        let result = await pool.query(sql, values);
        let resultSelect = await pool.query(sqlSelect, [name]);
        return NextResponse.json(resultSelect);
    } catch (error) {
        console.log(error);
    }
}