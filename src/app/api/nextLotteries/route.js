export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import pool from "@/db/MysqlConection";

// Devuelve los próximos 3 sorteos activos normales
export async function GET(req) {
  try {
    // Traer los próximos 3 sorteos abiertos que no sean especiales
    const [rows] = await pool.query(`
      SELECT * FROM sorteo
      WHERE Estatus = 'abierto'
      AND Tipo_sorteo != 'especial'  
      ORDER BY Fecha ASC
      LIMIT 3
    `);
    
    const res = NextResponse.json({ result: rows });
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (error) {
    console.error("[nextLotteries] ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
