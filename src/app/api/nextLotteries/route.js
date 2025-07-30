import { NextResponse } from "next/server";
import pool from "@/db/MysqlConection";

// Devuelve los próximos 3 sorteos activos (sin limitar por tipo de día)
export async function GET(req) {
  try {
    // Forzar no-caché
    const response = NextResponse;
    response.headers = { ...(response.headers || {}), 'Cache-Control': 'no-store' };
    // Traer los próximos 3 sorteos abiertos, sin filtrar por tipo de sorteo
    const [rows] = await pool.query(`
      SELECT * FROM sorteo
      WHERE Estatus = 'abierto'
      ORDER BY Fecha ASC
      LIMIT 3
    `);
    console.log("[nextLotteries] Resultados:", rows);
    return NextResponse.json({ result: rows });
  } catch (error) {
    console.error("[nextLotteries] ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
