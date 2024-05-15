// import { NextResponse } from "next/server";
// import pool from "@/db/MysqlConection";

// export async function GET(req, { params }) {
//     const { ticketNumber } = req.query;

//     let sql = `SELECT Tope FROM topes WHERE Numero = '${ticketNumber}'`;

//     try {
//         let [rows] = await pool.query(sql);
//         if (rows.length > 0) {
//             res.status(200).json({ tope: rows[0].Tope });
//         } else {
//             res.status(404).json({ error: 'No se encontró un tope para este número de boleto' });
//         }
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error: 'Ocurrió un error al consultar la base de datos' });
//     }
// }