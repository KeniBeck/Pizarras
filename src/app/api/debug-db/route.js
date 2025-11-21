import { NextResponse } from "next/server";
import pool from "@/db/MysqlConection";

export async function GET() {
  try {
    const [result] = await pool.query('SELECT DATABASE() as db, USER() as user');
    const [tables] = await pool.query('SHOW TABLES');
    const [ganadores] = await pool.query('SELECT COUNT(*) as count FROM Ganadores');
    
    return NextResponse.json({
      database: result[0],
      tables: tables,
      totalGanadores: ganadores[0].count
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}