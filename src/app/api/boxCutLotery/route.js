import pool from "@/db/MysqlConection";
import { NextResponse } from "next/server";

// POST: Recibe { Idvendedor, sucursal, fechaInicio, fechaFin, modo }
// modo: 'dia' o 'semana'
export async function POST(req) {
  try {
    const data = await req.json();
    const { Idvendedor, sucursal, fechaInicio, fechaFin, modo } = data;
    // Consulta para boletos especiales
    let sqlEspeciales = `
      SELECT b.*, s.Fecha AS FechaSorteo, v.Nombre AS nombreVendedor, v.Comision AS comisiones, v.sucursal AS sucursalVendedor, d.cantidad AS deuda
      FROM boletos b
      JOIN sorteo s ON b.tipo_sorteo = s.Idsorteo
      JOIN vendedores v ON b.Idvendedor = v.Idvendedor
      LEFT JOIN deuda d ON v.Idvendedor = d.usuario
      WHERE s.Tipo_sorteo = 'especial'
        AND b.Idvendedor = ?
        AND v.sucursal = ?
        AND DATE(b.Fecha_venta) BETWEEN ? AND ?
    `;

    // Consulta para boletos normales
    let sqlNormales = `
      SELECT b.*, s.Fecha AS FechaSorteo, v.Nombre AS nombreVendedor, v.Comision AS comisiones, v.sucursal AS sucursalVendedor, d.cantidad AS deuda
      FROM boletos b
      JOIN sorteo s ON b.tipo_sorteo = s.Idsorteo
      JOIN vendedores v ON b.Idvendedor = v.Idvendedor
      LEFT JOIN deuda d ON v.Idvendedor = d.usuario
      WHERE (s.Tipo_sorteo = 'normal' OR (s.Tipo_sorteo = 'domingo' AND DAYOFWEEK(s.Fecha) = 1))
        AND b.Idvendedor = ?
        AND v.sucursal = ?
        AND DATE(b.Fecha_venta) BETWEEN ? AND ?
    `;

    // Ejecutar las consultas
    let [boletosEspeciales] = await pool.query(sqlEspeciales, [Idvendedor, sucursal, fechaInicio, fechaFin]);
    let [boletosNormales] = await pool.query(sqlNormales, [Idvendedor, sucursal, fechaInicio, fechaFin]);

    // Agrupar por día
    let diasMap = {};
    const agrupa = (arr) => {
      arr.forEach((boleto) => {
        // Usar la fecha de venta (Fecha_venta) para agrupar, y formatear a YYYY-MM-DD
        let dia = boleto.Fecha_venta;
        if (dia instanceof Date) {
          dia = dia.toISOString().split("T")[0];
        } else if (typeof dia === "string" && dia.includes("T")) {
          dia = dia.split("T")[0];
        } else if (typeof dia === "string" && dia.length > 10) {
          dia = dia.substring(0, 10);
        }
        if (!diasMap[dia]) {
          diasMap[dia] = {
            dia,
            boletosvendidos: 0,
            venta: 0,
            comision: 0,
            totalcaja: 0,
            totalentregado: 0,
          };
        }
        diasMap[dia].boletosvendidos += 1;
        diasMap[dia].venta += boleto.Costo;
        diasMap[dia].comision += (boleto.Costo * (boleto.comisiones || 0)) / 100;
        diasMap[dia].totalcaja += boleto.Costo - (boleto.Costo * (boleto.comisiones || 0)) / 100;
        diasMap[dia].totalentregado += boleto.Costo - boleto.Costo * 0.1;
      });
    };
    agrupa(boletosEspeciales);
    agrupa(boletosNormales);

    // Convertir a array y ordenar por día ascendente
    let dias = Object.values(diasMap).sort((a, b) => a.dia.localeCompare(b.dia));

    // Si es modo semana, sumar todo para el resumen semanal
    let resumen = null;
    if (modo === 'semana') {
      resumen = dias.reduce((acc, row) => {
        acc.boletosvendidos += Number(row.boletosvendidos);
        acc.venta += Number(row.venta);
        acc.comision += Number(row.comision);
        acc.totalcaja += Number(row.totalcaja);
        acc.totalentregado += Number(row.totalentregado);
        return acc;
      }, {
        boletosvendidos: 0, venta: 0, comision: 0, totalcaja: 0, totalentregado: 0
      });
    }

    // Traer todos los boletos vendidos en el rango
    const boletosTodos = [...boletosEspeciales, ...boletosNormales];
    const boletosNumeros = boletosTodos.map(b => b.Boleto);

    // Consultar cancelados para esos boletos y sucursal
    let sqlCancelados = `
      SELECT c.*
      FROM Cancelados c
      JOIN vendedores v ON c.Idvendedor = v.Idvendedor
      WHERE c.Boleto IN (${boletosNumeros.length > 0 ? boletosNumeros.map(() => '?').join(',') : 'NULL'})
        AND v.sucursal = ?
    `;
    let cancelados = [];
    if (boletosNumeros.length > 0) {
      [cancelados] = await pool.query(sqlCancelados, [...boletosNumeros, sucursal]);
    }

    // Consultar ganadores para esos boletos y sucursal (solo por Boleto y Fecha_sorteo)
    let sqlGanadores = `
      SELECT g.*
      FROM Ganadores g
      WHERE (g.Boleto, DATE(g.Fecha_sorteo)) IN (${boletosTodos.length > 0 ? boletosTodos.map(() => '(?,?)').join(',') : 'NULL'})
    `;
    let ganadores = [];
    if (boletosTodos.length > 0) {
      // Armar los pares (boleto, fecha_sorteo) para el WHERE IN
      const params = [];
      boletosTodos.forEach(b => {
        let fecha = b.FechaSorteo;
        if (fecha instanceof Date) fecha = fecha.toISOString().split('T')[0];
        else if (typeof fecha === 'string' && fecha.includes('T')) fecha = fecha.split('T')[0];
        else if (typeof fecha === 'string' && fecha.length > 10) fecha = fecha.substring(0, 10);
        params.push(b.Boleto, fecha);
      });
      [ganadores] = await pool.query(sqlGanadores, params);
    }

    return NextResponse.json({
      dias,
      resumen,
      cancelados,
      ganadores
    });
  } catch (error) {
    console.error("[boxCutLotery] ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
