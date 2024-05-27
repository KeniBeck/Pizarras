import pool from "@/db/MysqlConection";
import { NextResponse } from "next/server";

export async function POST(req, res) {
    const data = await req.json();

    const { Idvendedor, Fechaingreso } = data;


    const fecha = new Date(Fechaingreso).toISOString().slice(0, 19).replace('T', ' ').split(' ')[0];

    try {
        // Consulta para obtener los boletos especiales
        let sqlEspeciales = `
        SELECT b.*, s.Fecha AS FechaSorteo, v.Nombre AS nombreVendedor, d.cantidad AS deuda
        FROM boletos b
        JOIN sorteo s ON b.tipo_sorteo = s.Idsorteo
        JOIN vendedores v ON b.Idvendedor = v.Idvendedor
        LEFT JOIN deuda d ON v.Idvendedor = d.usuario
        WHERE s.Tipo_sorteo = 'especial' AND DATE(b.Fecha) = CURDATE()
        `;

        // Consulta para obtener los boletos normales
        let sqlNormales = `
        SELECT b.*, s.Fecha AS FechaSorteo, v.Nombre AS nombreVendedor, d.cantidad AS deuda
        FROM boletos b
        JOIN sorteo s ON b.tipo_sorteo = s.Idsorteo
        JOIN vendedores v ON b.Idvendedor = v.Idvendedor
        LEFT JOIN deuda d ON v.Idvendedor = d.usuario
        WHERE s.Tipo_sorteo = 'normal' AND DATE(b.Fecha) = CURDATE();
        `;

        // Ejecutar las consultas
        let boletosEspeciales = await pool.query(sqlEspeciales, [Idvendedor]);
        let boletosNormales = await pool.query(sqlNormales, [Idvendedor]);
        // Agregar el nombre del vendedor a cada boleto


        // Devolver los resultados
        return NextResponse.json({ boletosEspeciales: boletosEspeciales[0], boletosNormales: boletosNormales[0] });

    } catch (error) {
        console.log(error);
    }
}