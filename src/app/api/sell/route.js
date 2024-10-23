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
  let sqlSelect = `SELECT * FROM boletos WHERE Boleto = ? ORDER BY Idsorteo DESC LIMIT 1`;
  let sqlLeyenda =`SELECT leyenda1 FROM configuracion`;
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
    let resulLeyenda = await pool.query(sqlLeyenda);
    
    let leyenda = resulLeyenda[0][0];
    let resultWithLeyenda = resultSelect.map(item => ({
      ...item,
      leyenda: leyenda
    }));

    return NextResponse.json(resultWithLeyenda);
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
  let sqlSelect = `SELECT * FROM boletos WHERE comprador = ? ORDER BY Idsorteo DESC LIMIT 10`;
  let sqlLeyenda =`SELECT leyenda1 FROM configuracion`;
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
    let resulLeyenda = await pool.query(sqlLeyenda);
    let resultSelect = await pool.query(sqlSelect, [name]);
    return NextResponse.json(resultSelect);
  } catch (error) {
    console.log(error);
  }
}
