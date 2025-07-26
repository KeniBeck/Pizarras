import { NextResponse } from "next/server";
import pool from "@/db/MysqlConection";

// Devuelve los próximos 3 sorteos activos (martes, viernes, domingo)
export async function GET() {
  try {
    // Selecciona los próximos 3 sorteos activos (martes, viernes, domingo)
    const [rows] = await pool.query(`
      SELECT * FROM sorteo
      WHERE Estatus = 'abierto'
        AND (Tipo_sorteo = 'normal' OR Tipo_sorteo = 'domingo')
      ORDER BY Fecha ASC
      LIMIT 3
    `);
    return NextResponse.json({ result: rows });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
