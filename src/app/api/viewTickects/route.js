import { NextResponse } from "next/server";
import pool from "@/db/MysqlConection";

export async function POST(req, res) {
  const data = await req.json();
  const { Idvendedor, Fechaingreso } = data;

  try {
    // Consulta para obtener los boletos especiales
    let sqlEspeciales = `
        SELECT b.*, s.Fecha AS FechaSorteo, v.Nombre AS nombreVendedor, v.Comision AS comisiones, d.cantidad AS deuda
        FROM boletos b
        JOIN sorteo s ON b.tipo_sorteo = s.Idsorteo
        JOIN vendedores v ON b.Idvendedor = v.Idvendedor
        LEFT JOIN deuda d ON v.Idvendedor = d.usuario
        WHERE s.Tipo_sorteo = 'especial' AND DATE(b.Fecha) = DATE(s.Fecha) AND corte_caja = FALSE AND b.Idvendedor = ?;
        `;

    // Consulta para obtener los boletos normales
    let sqlNormales = `
        SELECT b.*, s.Fecha AS FechaSorteo, v.Nombre AS nombreVendedor, v.Comision AS comisiones, d.cantidad AS deuda
        FROM boletos b
        JOIN sorteo s ON b.tipo_sorteo = s.Idsorteo
        JOIN vendedores v ON b.Idvendedor = v.Idvendedor
        LEFT JOIN deuda d ON v.Idvendedor = d.usuario
        WHERE s.Tipo_sorteo = 'normal' AND DATE(b.Fecha) = DATE(s.Fecha) AND corte_caja = FALSE AND b.Idvendedor = ?;
        `;

    // Ejecutar las consultas
    let [boletosEspeciales] = await pool.query(sqlEspeciales, [Idvendedor]);
    let [boletosNormales] = await pool.query(sqlNormales, [Idvendedor]);

    // Combinar los resultados en un solo array
    let boletos = [...boletosEspeciales, ...boletosNormales];

    // Devolver los resultados
    return NextResponse.json(boletos);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Error al ejecutar la consulta" });
  }
}
