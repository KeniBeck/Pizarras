import pool from "@/db/MysqlConection";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT IdBanco, Banco, Cuenta FROM Bancos");
    return NextResponse.json({ bancos: rows });
  } catch (error) {
    console.error("Error al obtener bancos:", error);
    return NextResponse.json(
      { error: "Error al obtener bancos" },
      { status: 500 }
    );
  }
}
