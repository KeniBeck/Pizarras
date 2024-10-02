import pool from "@/db/MysqlConection";
import { NextResponse } from "next/server";

export async function POST(req, res) {
  const data = await req.json();
  const { Idvendedor, Fechaingreso, sucursal } = data;

  const fecha = new Date(Fechaingreso)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ")
    .split(" ")[0];

  try {
    // Consulta para obtener los boletos especiales
    let sqlEspeciales = `
        SELECT b.*, s.Fecha AS FechaSorteo, v.Nombre AS nombreVendedor, v.Comision AS comisiones, d.cantidad AS deuda
        FROM boletos b
        JOIN sorteo s ON b.tipo_sorteo = s.Idsorteo
        JOIN vendedores v ON b.Idvendedor = v.Idvendedor
        LEFT JOIN deuda d ON v.Idvendedor = d.usuario
        WHERE s.Tipo_sorteo = 'especial' AND DATE(b.Fecha) = DATE(s.Fecha) AND corte_caja = FALSE;
        `;

    // Consulta para obtener los boletos normales
    let sqlNormales = `
        SELECT b.*, s.Fecha AS FechaSorteo, v.Nombre AS nombreVendedor, v.Comision AS comisiones, d.cantidad AS deuda
        FROM boletos b
        JOIN sorteo s ON b.tipo_sorteo = s.Idsorteo
        JOIN vendedores v ON b.Idvendedor = v.Idvendedor
        LEFT JOIN deuda d ON v.Idvendedor = d.usuario
        WHERE s.Tipo_sorteo = 'normal' AND DATE(b.Fecha) = DATE(s.Fecha) AND corte_caja = FALSE;
        `;

    // Ejecutar las consultas
    let [boletosEspeciales] = await pool.query(sqlEspeciales);
    let [boletosNormales] = await pool.query(sqlNormales);

    // Combinar los boletos en un solo array
    let boletos = [...boletosEspeciales, ...boletosNormales];

    // Obtener los IDs de los boletos seleccionados
    let ids = boletos.map((boleto) => boleto.Idsorteo);

    // Actualizar el atributo corte_caja a true para los boletos seleccionados
    if (ids.length > 0) {
      let sqlUpdate = `
          UPDATE boletos
          SET corte_caja = TRUE
          WHERE Idsorteo IN (${ids.join(",")});
          `;
      await pool.query(sqlUpdate);
    }

    // Calcular los valores necesarios
    let totalBoletosVendidos = boletos.length;
    let totalVentas = boletos.reduce(
      (total, boleto) => total + boleto.Costo,
      0
    );
    let comision = boletos.length > 0 ? boletos[0].comisiones / 100 : 0;
    let deuda = boletos.length > 0 ? boletos[0].deuda : 0;
    let caja = totalVentas - totalVentas * comision;
    let totalEntregado = totalVentas - totalVentas * 0.1;

    // Determinar el tipo de sorteo
    let tipoSorteo = "";
    if (boletosEspeciales.length > 0 && boletosNormales.length > 0) {
      tipoSorteo = "especial y normal";
    } else if (boletosEspeciales.length > 0) {
      tipoSorteo = "especial";
    } else if (boletosNormales.length > 0) {
      tipoSorteo = "normal";
    }

    // Verificar y ajustar los valores antes de la inserción
    if (totalBoletosVendidos === 0) {
      return NextResponse.json({
        message: "No se insertó porque los valores están en 0",
      });
    }

    // Insertar la información en la tabla cortesdecaja
    let sqlInsert = `
        INSERT INTO cortesdecaja
        (idcorte, Fecha_actual, fechasorteo, vendedor, sucursal, boletosvendidos, venta, porcentajecomision, comision, totalcaja, Tipo_sorteo, totalentregado)
        VALUES (0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
    let values = [
      new Date().toISOString().slice(0, 19).replace("T", " "),
      fecha,
      Idvendedor,
      sucursal,
      totalBoletosVendidos,
      totalVentas,
      comision * 100,
      totalVentas * comision,
      caja,
      tipoSorteo,
      totalEntregado,
    ];
    await pool.query(sqlInsert, values);

    // Devolver los resultados
    return NextResponse.json({
      boletosEspeciales: boletosEspeciales,
      boletosNormales: boletosNormales,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Error al ejecutar la consulta" });
  }
}
