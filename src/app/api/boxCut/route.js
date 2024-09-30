import pool from "@/db/MysqlConection";
import { NextResponse } from "next/server";

export async function POST(req, res) {
  const data = await req.json();
  const { Idvendedor, Fechaingreso } = data;

  const fecha = new Date(Fechaingreso)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ")
    .split(" ")[0];

  const now = new Date();
  const dayOfWeek = now.getDay();
  const hourOfDay = now.getHours();

  let startDate, endDate;

  if (dayOfWeek === 0 && hourOfDay > 20) {
    // Domingo después de las 7pm
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 2);
    startDate.setHours(20, 0, 0, 0);
    endDate = new Date(now);
  } else if (dayOfWeek === 1 || (dayOfWeek === 2 && hourOfDay <= 19)) {
    // Lunes o Martes hasta las 7pm
    startDate = new Date(now);
    startDate.setDate(now.getDate() - (dayOfWeek + 1));
    startDate.setHours(20, 0, 0, 0);
    endDate = new Date(now);
  } else if (
    (dayOfWeek === 2 && hourOfDay > 20) ||
    dayOfWeek === 3 ||
    dayOfWeek === 4 ||
    (dayOfWeek === 5 && hourOfDay <= 20)
  ) {
    // Martes después de las 7pm hasta Viernes hasta las 7pm
    startDate = new Date(now);
    startDate.setDate(now.getDate() - (dayOfWeek - 2));
    startDate.setHours(20, 0, 0, 0);
    endDate = new Date(now);
  } else if (
    (dayOfWeek === 5 && hourOfDay > 20) ||
    dayOfWeek === 6 ||
    (dayOfWeek === 0 && hourOfDay <= 20)
  ) {
    // Viernes después de las 7pm hasta Domingo hasta las 7pm
    startDate = new Date(now);
    startDate.setDate(now.getDate() - (dayOfWeek - 5));
    startDate.setHours(20, 0, 0, 0);
    endDate = new Date(now);
  }

  startDate = startDate.toISOString().slice(0, 20).replace("T", " ");
  endDate = endDate.toISOString().slice(0, 20).replace("T", " ");

  try {
    // Consulta para obtener los boletos especiales
    let sqlEspeciales = `
        SELECT b.*, s.Fecha AS FechaSorteo, v.Nombre AS nombreVendedor, v.Comision AS comisiones, d.cantidad AS deuda
        FROM boletos b
        JOIN sorteo s ON b.tipo_sorteo = s.Idsorteo
        JOIN vendedores v ON b.Idvendedor = v.Idvendedor
        LEFT JOIN deuda d ON v.Idvendedor = d.usuario
        WHERE s.Tipo_sorteo = 'especial' AND b.Fecha_venta BETWEEN ? AND ?
        `;

    // Consulta para obtener los boletos normales
    let sqlNormales = `
        SELECT b.*, s.Fecha AS FechaSorteo, v.Nombre AS nombreVendedor, v.Comision AS comisiones, d.cantidad AS deuda
        FROM boletos b
        JOIN sorteo s ON b.tipo_sorteo = s.Idsorteo
        JOIN vendedores v ON b.Idvendedor = v.Idvendedor
        LEFT JOIN deuda d ON v.Idvendedor = d.usuario
        WHERE s.Tipo_sorteo = 'normal' AND b.Fecha_venta BETWEEN ? AND ?;
        `;

    // Ejecutar las consultas
    let boletosEspeciales = await pool.query(sqlEspeciales, [
      startDate,
      endDate,
    ]);
    let boletosNormales = await pool.query(sqlNormales, [startDate, endDate]);

    // Devolver los resultados
    return NextResponse.json({
      boletosEspeciales: boletosEspeciales[0],
      boletosNormales: boletosNormales[0],
    });
  } catch (error) {
    console.log(error);
  }
}
