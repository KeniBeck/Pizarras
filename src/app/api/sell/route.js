import { NextResponse } from "next/server";
import pool from "@/db/MysqlConection";

//normal
export async function POST(req, res) {
  let datos = await req.json();
  const {
    fecha,
    idSorteo,
    idVendedor,
    name,
    primerPremio,
    prizebox,
    segundoPremio,
    ticketNumber,
    topePermitido,
  } = datos;
  const fechaModificada = new Date(fecha)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ")
    .split(" ")[0];

  let sql = `
        INSERT INTO boletos
        ( Fecha, Primerpremio, Segundopremio, Boleto, Costo, comprador, Idvendedor,tipo_sorteo,Fecha_venta)
        VALUES( ?, ?, ?, ?, ?, ?, ?, ?,CURRENT_TIMESTAMP)
    `;
  let sqlUpdate = `UPDATE topes SET  Cantidad = Cantidad + ${prizebox} WHERE Numero = ${ticketNumber}`;
  let sqlSelect = `SELECT b.*, c.leyenda1 AS leyenda
        FROM boletos b
        CROSS JOIN configuracion c
        WHERE b.Boleto = ? 
        ORDER BY b.Idsorteo DESC 
        LIMIT 1;`;
 
  let values = [
    fechaModificada,
    primerPremio,
    segundoPremio,
    ticketNumber,
    prizebox,
    name,
    idVendedor,
    idSorteo,
  ];

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
  const {
    fecha,
    idSorteo,
    idVendedor,
    name,
    primerPremio,
    prizebox,
    segundoPremio,
    ticketNumber,
    topePermitido,
  } = datos;
  const fechaModificada = new Date(fecha)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ")
    .split(" ")[0];
  let sql = `
        INSERT INTO boletos
        ( Fecha, Primerpremio, Segundopremio, Boleto, Costo, comprador, Idvendedor,tipo_sorteo,Fecha_venta)
        VALUES( ?, ?, ?, ?, ?, ?, ?, ?,CURRENT_TIMESTAMP)
    `;
  // Obtener los últimos 10 elementos insertados
  let sqlSelect = `SELECT b.*, c.leyenda1 AS leyenda FROM boletos b 
  CROSS JOIN configuracion c
  WHERE comprador = ? ORDER BY Idsorteo DESC LIMIT 10`;
  let values = [
    fechaModificada,
    primerPremio,
    segundoPremio,
    ticketNumber,
    prizebox,
    name,
    idVendedor,
    idSorteo,
  ];

  try {
    let result = await pool.query(sql, values);
    let resultSelect = await pool.query(sqlSelect, [name]);
 
    return NextResponse.json(resultSelect);
  } catch (error) {
    console.log(error);
  }
}
