import pool from "@/db/MysqlConection";
import { NextResponse } from "next/server";

export async function POST(req) {
    const data = await req.json();
    const { Sorteo, fecha } = data;
    
    try {
        let sql, params;
        
        if (Sorteo) {
            // Búsqueda por número de sorteo
            sql = `SELECT * FROM premiados WHERE Sorteo = ? ORDER BY idpremiados DESC LIMIT 1`;
            params = [Sorteo];
        } else if (fecha) {
            // Búsqueda por fecha 
            sql = `SELECT * FROM premiados WHERE DATE(fechasorteo) = ? ORDER BY idpremiados DESC LIMIT 1`;
            params = [fecha];
        } else {
            // Último resultado
            sql = `SELECT * FROM premiados ORDER BY idpremiados DESC LIMIT 1`;
            params = [];
        }
        
        const [rows] = await pool.query(sql, params);
        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}