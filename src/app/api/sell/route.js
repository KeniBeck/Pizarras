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
  let sqlTopes = `SELECT * FROM topes WHERE Numero = ? AND Fecha_sorteo = ?`;  
  let sqlUpdate = `UPDATE topes SET  Cantidad = Cantidad + ${prizebox} WHERE Numero = ${ticketNumber}`;
  let sqlValidation = `SELECT b.Idsorteo AS idsorteo, b.Fecha AS Fecha_sorteo , b.Boleto AS boleto, s.Tipo_sorteo AS tipo FROM boletos b
         JOIN sorteo s ON b.tipo_sorteo
         WHERE s.Tipo_sorteo = 'especial' AND b.Fecha = ? AND b.Boleto = ?`;
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
     // Verificar el tope antes de realizar la venta
     let [resultTopes] = await pool.query(sqlTopes, [ticketNumber, fechaModificada]);
     if (resultTopes.length > 0) {
       let tope = resultTopes[0].Tope;
       let cantidadActual = resultTopes[0].Cantidad;
       if (cantidadActual + prizebox > tope) {
         return NextResponse.json({ error: "La cantidad de boletos vendidos supera el tope permitido" });
       }
     }
    let [resultValidation] = await pool.query(sqlValidation, [fechaModificada, ticketNumber]);
    if (resultValidation.length > 0) {
      return NextResponse.json({ error: "El boleto ya fue vendido" });
    }
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
