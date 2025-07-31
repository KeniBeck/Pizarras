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
    tipoSorteo,
  } = datos;
  // Usar solo la fecha (YYYY-MM-DD) para el campo Fecha
  const fechaModificada = fecha.split("T")[0];
  let sql = `
        INSERT INTO boletos
        ( Fecha, Primerpremio, Segundopremio, Boleto, Costo, comprador, Idvendedor, tipo_sorteo, Fecha_venta)
        VALUES( ?, ?, ?, ?, ?, ?, ?, ?,CURRENT_TIMESTAMP)
    `;
  let sqlTopes = `SELECT * FROM topes WHERE Numero = ? AND Fecha_sorteo = ?`;
  let sqlUpdate = `UPDATE topes SET  Cantidad = Cantidad + ${prizebox} WHERE Numero = ${ticketNumber}`;
  let sqlValidation = `SELECT b.Idsorteo AS idsorteo, b.Fecha AS Fecha_sorteo , b.Boleto AS boleto, s.Tipo_sorteo AS tipo FROM boletos b
         JOIN sorteo s ON b.tipo_sorteo
         WHERE s.Tipo_sorteo = 'especial' AND b.Fecha = ? AND b.Boleto = ?`;
  let sqlSelect = `
  SELECT b.*, c.leyenda1, s.leyenda2
  FROM boletos b
  JOIN sorteo s ON b.tipo_sorteo = s.Idsorteo
  CROSS JOIN configuracion c
  WHERE b.Boleto = ?
  ORDER BY b.Idsorteo DESC
  LIMIT 1;
`;

  let sqlSelectEspecial = `
  SELECT b.*, c.leyenda1, s.leyenda2
  FROM boletos b
  JOIN sorteo s ON b.tipo_sorteo = s.Idsorteo
  CROSS JOIN configuracion c
  WHERE b.Boleto = ?
  ORDER BY b.Idsorteo DESC
  LIMIT 1;
`;
  let values = [
    fechaModificada, // YYYY-MM-DD limpio, sin hora ni zona
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
    let [resultTopes] = await pool.query(sqlTopes, [
      ticketNumber,
      fechaModificada,
    ]);
    if (resultTopes.length > 0) {
      let tope = resultTopes[0].Tope;
      let cantidadActual = resultTopes[0].Cantidad;
      if (cantidadActual + prizebox > tope) {
        return NextResponse.json({
          error: "La cantidad de boletos vendidos supera el tope permitido",
        });
      }
    }
    // El tipoSorteo puede venir como 'domingo', 'normal', etc. pero también como id numérico. Normalizamos:
    let tipoSorteoNormalized = tipoSorteo;
    // Si es un número, buscamos el tipo real en la tabla sorteo
    if (!isNaN(tipoSorteo)) {
      const [rows] = await pool.query('SELECT Tipo_sorteo FROM sorteo WHERE Idsorteo = ?', [tipoSorteo]);
      if (rows.length > 0) {
        tipoSorteoNormalized = rows[0].Tipo_sorteo;
      }
    }
    if (tipoSorteoNormalized == "especial") {
      let [resultValidation] = await pool.query(sqlValidation, [
        fechaModificada,
        ticketNumber,
      ]);
      if (resultValidation.length > 0) {
        return NextResponse.json({ error: "El boleto ya fue vendido" });
      }
    }
    if (tipoSorteoNormalized === "normal" || tipoSorteoNormalized === "domingo") {
      let result = await pool.query(sql, values);
      let resultUpdate = await pool.query(sqlUpdate);
      let resultSelect = await pool.query(sqlSelect, [ticketNumber]);
      return NextResponse.json(resultSelect);
    }
    if (tipoSorteoNormalized === "especial") {
      let result = await pool.query(sql, values);
      let resultSelectUpdate = await pool.query(sqlSelectEspecial, [
        ticketNumber,
      ]);
      return NextResponse.json(resultSelectUpdate);
    }
    // Si no es normal, domingo ni especial
    return NextResponse.json({ error: "Tipo de sorteo no soportado" }, { status: 400 });
  } catch (error) {
    console.error("ERROR EN INSERTAR BOLETO:", error, { datos, values });
    return NextResponse.json({ error: error.message, detalle: error, datos, values }, { status: 500 });
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
  // Usar solo la fecha (YYYY-MM-DD) para el campo Fecha
  const fechaModificada = fecha.split("T")[0];
  let sql = `
        INSERT INTO boletos
        ( Fecha, Primerpremio, Segundopremio, Boleto, Costo, comprador, Idvendedor, tipo_sorteo, Fecha_venta)
        VALUES( ?, ?, ?, ?, ?, ?, ?, ?,CURRENT_TIMESTAMP)
    `;
  // Obtener los últimos 10 elementos insertados
   let sqlSelect = `
    SELECT b.*, c.leyenda1, s.leyenda2
    FROM boletos b
    JOIN sorteo s ON b.tipo_sorteo = s.Idsorteo
    CROSS JOIN configuracion c
    WHERE comprador = ?
    ORDER BY b.Idsorteo DESC
    LIMIT 10
  `;
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
