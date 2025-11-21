import { NextResponse } from "next/server";
import pool from "@/db/MysqlConection";
import QRCode from "qrcode";

async function safeQuery(conn, sql, params = []) {
  // wrapper simple por si necesitas cambiar behavior (logs, etc)
  return conn.query(sql, params);
}

// normal
export async function POST(req) {
  const datos = await req.json();
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

  const fechaModificada = (fecha && fecha.split ? fecha.split("T")[0] : fecha);

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    //console.log("DATOS RECIBIDOS:", datos);

    // Verificar tope 
    const numeroBoleto = parseInt(ticketNumber); // Convertir a número
    const [ano, mes, dia] = fechaModificada.split('-');
    const fechaTope = `${dia}/${mes}/${ano}`; // Formato DD/MM/YYYY

    const [topesRows] = await connection.query(
      `SELECT * FROM topes WHERE Numero = ? AND Fecha_sorteo = ?`, 
      [numeroBoleto, fechaTope] // Usar formato corregido
    );
    
    if (topesRows.length > 0) {
      const tope = Number(topesRows[0].Tope) || 0;
      const cantidadActual = Number(topesRows[0].Cantidad) || 0;
      const prizeboxNum = Number(prizebox) || 0;
      
      if (cantidadActual + prizeboxNum > tope) {
        await connection.rollback();
        connection.release();
        return NextResponse.json({ error: "La cantidad de boletos vendidos supera el tope permitido" }, { status: 400 });
      }
    }

    // Insertar boleto
    const sqlInsert = `
      INSERT INTO boletos 
      (Fecha, Primerpremio, Segundopremio, Boleto, Costo, comprador, Idvendedor, tipo_sorteo, Fecha_venta) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    
    const [insertResult] = await connection.query(sqlInsert, [
      fechaModificada,
      primerPremio,
      segundoPremio,
      ticketNumber,
      Number(prizebox) || 0,
      name,
      idVendedor,
      idSorteo,
    ]);

    const insertedId = insertResult?.insertId;
    //console.log("INSERT RESULT:", insertResult);
    //console.log("ID INSERTADO:", insertedId);

    // Actualizar tope
    if (topesRows.length > 0) {
      await connection.query(
        `UPDATE topes SET Cantidad = Cantidad + ? WHERE Numero = ? AND Fecha_sorteo = ?`,
        [Number(prizebox) || 0, numeroBoleto, fechaTope] // Usar formato corregido
      );
    }
    
    if (!insertedId) {
      await connection.rollback();
      connection.release();
      throw new Error("No se obtuvo insertId al crear el boleto");
    }

    // Generar QR (usando el Idsorteo como identificador)
    const qrData = `N${insertedId}`;
    //console.log("GENERANDO QR PARA:", qrData);
    
    const qrCodeBase64 = await QRCode.toDataURL(qrData);
    //console.log("QR GENERADO");

    // Actualizar SOLO con qr_code
    const updateSql = `UPDATE boletos SET qr_code = ? WHERE Idsorteo = ?`;
    //console.log("🔧 EJECUTANDO UPDATE QR...");
    
    const [updateResult] = await connection.query(updateSql, [
      qrCodeBase64,
      insertedId
    ]);

    //console.log("UPDATE RESULT - Filas afectadas:", updateResult.affectedRows);

    if (updateResult.affectedRows === 0) {
      throw new Error("No se pudo actualizar el QR en la base de datos");
    }

    // Actualizar tope
    if (topesRows.length > 0) {
      await connection.query(
        `UPDATE topes SET Cantidad = Cantidad + ? WHERE Numero = ? AND Fecha_sorteo = ?`,
        [Number(prizebox) || 0, ticketNumber, fechaModificada]
      );
    }

    await connection.commit();
    //console.log("COMMIT EXITOSO");

    //Verificar el estado final del registro
    const [finalCheck] = await connection.query(
      `SELECT Idsorteo, qr_code FROM boletos WHERE Idsorteo = ?`,
      [insertedId]
    );
    
    /*console.log("🔍 ESTADO FINAL DEL BOLETO:", {
      id: finalCheck[0]?.Idsorteo,
      qr: finalCheck[0]?.qr_code ? "QR PRESENTE ✅" : "QR AUSENTE ❌"
    });*/

    // 8️⃣ Traer datos completos para respuesta
    const [boletoCompleto] = await connection.query(`
      SELECT 
        b.*, 
        COALESCE(c.leyenda1, '') as leyenda1, 
        COALESCE(s.leyenda2, '') as leyenda2
      FROM boletos b
      CROSS JOIN configuracion c
      LEFT JOIN sorteo s ON b.tipo_sorteo = s.Idsorteo
      WHERE b.Idsorteo = ?
      LIMIT 1
    `, [insertedId]);

    //console.log(" BOLETO PARA RESPONSE - QR:", boletoCompleto[0]?.qr_code ? "PRESENTE" : "AUSENTE");

    connection.release();

    return NextResponse.json([[boletoCompleto[0]], []]);

  } catch (error) {
    console.error("❌ ERROR CRÍTICO:", error);
    try { 
      if (connection) { 
        await connection.rollback(); 
        connection.release(); 
      } 
    } catch (e) {
      console.error("Error en cleanup:", e);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// serie 
export async function PUT(req) {
  const datos = await req.json();
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

  const fechaModificada = (fecha && fecha.split ? fecha.split("T")[0] : fecha);

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const prizeboxNum = Number(prizebox) || 0;
    const ticketNum = ticketNumber;

    // Insert
    const [insertResult] = await connection.query(`
      INSERT INTO boletos
      (Fecha, Primerpremio, Segundopremio, Boleto, Costo, comprador, Idvendedor, tipo_sorteo, Fecha_venta)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [
      fechaModificada,
      primerPremio,
      segundoPremio,
      ticketNum,
      prizeboxNum,
      name,
      idVendedor,
      idSorteo,
    ]);

    const insertedId = insertResult?.insertId;
    if (!insertedId) {
      await connection.rollback();
      connection.release();
      throw new Error("No se obtuvo insertId al crear el boleto de serie");
    }

    // Generar QR
    const qrData = `N${insertedId}`;
    const qrCodeBase64 = await QRCode.toDataURL(qrData);

    // Actualizar SOLO qr_code
    const [updateQrResult] = await connection.query(
      `UPDATE boletos SET qr_code = ? WHERE Idsorteo = ?`,
      [qrCodeBase64, insertedId]
    );

    if (!updateQrResult || updateQrResult.affectedRows === 0) {
      await connection.rollback();
      connection.release();
      throw new Error("Fallo al actualizar qr del boleto de serie");
    }

    await connection.commit();
    connection.release();

    // Retornar los últimos 10 del comprador
    const [resultSelect] = await pool.query(`
      SELECT 
        b.*, 
        COALESCE(c.leyenda1, '') as leyenda1, 
        COALESCE(s.leyenda2, '') as leyenda2
      FROM boletos b
      CROSS JOIN configuracion c
      LEFT JOIN sorteo s ON b.tipo_sorteo = s.Idsorteo
      WHERE comprador = ?
      ORDER BY b.Idsorteo DESC
      LIMIT 10
    `, [name]);

    return NextResponse.json(resultSelect);

  } catch (error) {
    console.error("ERROR EN INSERTAR BOLETO (PUT serie):", error, { datos });
    try { 
      if (connection) { 
        await connection.rollback(); 
        connection.release(); 
      } 
    } catch (e) { /* ignore */ }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}