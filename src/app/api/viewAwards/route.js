import { NextResponse } from "next/server";
import pool from "@/db/MysqlConection";

export async function GET(req, res) {

    let sql = `SELECT * FROM premiados`;

    try {
        let resultView = await pool.query(sql);
        if (resultView[0].length === 0) {
            return NextResponse.json({ message: 'No hay premios disponibles.' });
        }
        return NextResponse.json(resultView[0]);

    } catch (error) {
        console.log(error);

    }
}