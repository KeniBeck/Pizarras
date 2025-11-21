import pool from "@/db/MysqlConection";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const fechaSorteo = searchParams.get('fecha');
    
    let sql = `SELECT numero_boleto, fecha_sorteo FROM boletos_online`;
    let params = [];
    
    if (fechaSorteo) {
      sql += ` WHERE fecha_sorteo = ?`;
      params.push(fechaSorteo);
    }
    
    const [result] = await pool.query(sql, params);
    
    return NextResponse.json({ 
      success: true,
      boletos: result 
    });
    
  } catch (error) {
    console.error("Error en GET /api/boletosOnline:", error);
    return NextResponse.json(
      { error: "Error al obtener boletos online", detalle: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const { boletos, telefono, metodo_pago } = data;

    if (!Array.isArray(boletos) || boletos.length === 0) {
      return NextResponse.json(
        { error: "No se enviaron boletos válidos" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insertar en boletos_online (sin cambios)
      const sqlInsert = `
        INSERT INTO boletos_online
        (id_sorteo, numero_boleto, costo, comprador, telefono, metodo_pago, tipo_sorteo, fecha_sorteo, estatus, fecha_compra)
        VALUES ?
      `;

      const values = boletos.map((b) => [
        b.idSorteo,                           
        b.ticketNumber,                       
        b.prizebox,                          
        b.name,                             
        telefono || "",                      
        metodo_pago || "",                    
        b.tipoSorteo,                         
        b.fecha.split("T")[0],                
        "pendiente",                          
        new Date().toISOString().slice(0, 19).replace("T", " ")
      ]);

      const [result] = await connection.query(sqlInsert, [values]);

      // ACTUALIZAR TOPES SOLO PARA BOLETOS NORMALES
      for (const boleto of boletos) {
        // DETECTAR SI ES SERIE POR EL TIPO_SORTEO
        const esSerie = boleto.tipoSorteo === "serie";
        
        // SOLO actualizar topes si NO es serie (es normal)
        if (!esSerie) {
          const numeroBoleto = parseInt(boleto.ticketNumber);
          const monto = boleto.prizebox;
          const fechaBoleto = boleto.fecha.split("T")[0];
          
          // CONVERTIR a formato correcto: "2025-11-07" → "07/11/2025"
          const [ano, mes, dia] = fechaBoleto.split('-');
          const fechaTope = `${dia}/${mes}/${ano}`;

          const sqlUpdateTope = `
            UPDATE topes 
            SET Cantidad = Cantidad + ? 
            WHERE Numero = ? AND Fecha_sorteo = ?
          `;
          
          const [updateResult] = await connection.query(sqlUpdateTope, [
            monto,
            numeroBoleto,
            fechaTope
          ]);

          if (updateResult.affectedRows === 0) {
            console.warn("⚠️ No se encontró tope para actualizar:", { 
              numeroBoleto, 
              fechaTope 
            });
          } else {
            console.log("✅ Tope actualizado para boleto NORMAL:", {
              numero: numeroBoleto,
              monto: monto,
              fecha: fechaTope
            });
          }
        } else {
          console.log("⏭️  SERIE detectada - Saltando actualización de tope:", {
            numero: boleto.ticketNumber,
            tipo: boleto.tipoSorteo,
            monto: boleto.prizebox
          });
        }
      }

      await connection.commit();

      // Recuperar boletos insertados
      const idsInsertados = result.insertId;
      const [boletosGuardados] = await connection.query(
        `SELECT * FROM boletos_online WHERE id_boleto_online >= ? ORDER BY id_boleto_online DESC LIMIT ?`,
        [idsInsertados, boletos.length]
      );

      return NextResponse.json({
        success: true,
        message: "Boletos guardados - Topes actualizados solo para normales",
        boletos: boletosGuardados,
      });

    } catch (error) {
      await connection.rollback();
      console.error("❌ Error en transacción:", error);
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error("💥 Error en /api/boletosOnline:", error);
    return NextResponse.json(
      { error: "Error al guardar boletos online", detalle: error.message },
      { status: 500 }
    );
  }
}