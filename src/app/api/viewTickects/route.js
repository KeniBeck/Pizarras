import { NextResponse } from "next/server";
import pool from "@/db/MysqlConection";

export async function POST(req, res) {
  const data = await req.json();
  const { Idvendedor, Fechaingreso } = data;

  const now = new Date(Fechaingreso);
  const dayOfWeek = now.getDay();
  const hourOfDay = now.getHours();

  let startDate, endDate;

  if (dayOfWeek === 0 && hourOfDay > 19) {
    // Domingo después de las 7pm
    startDate = new Date(now);
    startDate.setDate(now.getDate() - (dayOfWeek + 6)); // Retrocede al viernes anterior
    startDate.setHours(19, 0, 0, 0);
    endDate = new Date(now);
  } else if (dayOfWeek === 1 || (dayOfWeek === 2 && hourOfDay <= 19)) {
    // Lunes o Martes hasta las 7pm
    startDate = new Date(now);
    startDate.setDate(now.getDate() - (dayOfWeek + 1)); // Retrocede al domingo anterior
    startDate.setHours(19, 0, 0, 0);
    endDate = new Date(now);
  } else if (
    (dayOfWeek === 2 && hourOfDay > 19) ||
    dayOfWeek === 3 ||
    dayOfWeek === 4 ||
    (dayOfWeek === 5 && hourOfDay <= 19)
  ) {
    // Martes después de las 7pm hasta Viernes hasta las 7pm
    startDate = new Date(now);
    startDate.setDate(now.getDate() - (dayOfWeek - 2)); // Retrocede al martes anterior
    startDate.setHours(19, 0, 0, 0);
    endDate = new Date(now);
  } else if (
    (dayOfWeek === 5 && hourOfDay > 19) ||
    dayOfWeek === 6 ||
    (dayOfWeek === 0 && hourOfDay <= 19)
  ) {
    // Viernes después de las 7pm hasta Domingo hasta las 7pm
    startDate = new Date(now);
    startDate.setDate(now.getDate() - (dayOfWeek - 5)); // Retrocede al viernes anterior
    startDate.setHours(19, 0, 0, 0);
    endDate = new Date(now);
  }

  startDate = startDate.toISOString().slice(0, 19).replace("T", " ");
  endDate = endDate.toISOString().slice(0, 19).replace("T", " ");

  let sql = `
    SELECT * FROM boletos 
    WHERE Idvendedor = ? 
    AND Fecha_venta BETWEEN ? AND ? 
    ORDER BY Idsorteo DESC
  `;

  try {
    let resultView = await pool.query(sql, [Idvendedor, startDate, endDate]);
    if (resultView[0].length === 0) {
      return NextResponse.json({
        message: "No hay ventas para este vendedor en la fecha especificada.",
      });
    }
    return NextResponse.json(resultView[0]);
  } catch (error) {
    console.log(error);
  }
}
