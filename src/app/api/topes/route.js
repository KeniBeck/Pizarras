import { NextResponse } from "next/server";
import pool from "@/db/MysqlConection";

export async function POST(req) {
    try {
        const { ticketNumber, fecha } = await req.json(); // Obtener el número de boleto del cuerpo de la solicitud
        const sql = `SELECT * FROM topes WHERE Fecha_sorteo = ? AND Numero = ?`;

        const [rows] = await pool.query(sql, [fecha, ticketNumber]); // Usar parámetros para evitar inyecciones SQL

        if (rows.length > 0) {
            return NextResponse.json({ tope: rows });
        } else {
            return NextResponse.json({ tope: [] }); // Devolver un array vacío si no se encuentran topes
        }
    } catch (error) {
        console.log(error);
        return NextResponse.json({ status: 500, message: 'Ocurrió un error al consultar la base de datos' });
    }
}

export async function PUT(req) {
    try {
        // Obtener fecha del cuerpo de la solicitud
        const { fecha } = await req.json();
        
        if (!fecha) {
            return NextResponse.json({ 
                success: false, 
                message: "Se requiere el parámetro 'fecha' en el cuerpo de la solicitud" 
            }, { status: 400 });
        }

        // Consultar los números disponibles según la tabla real
        // Según la imagen, la tabla tiene: id_tope, Numero, Cantidad, Fecha_sorteo, Tope, id
        const sql = `
            SELECT Numero, Tope, Cantidad 
            FROM topes 
            WHERE Fecha_sorteo = ? 
            AND Cantidad < Tope
        `;

        const [numerosDisponibles] = await pool.query(sql, [fecha]);
        
        if (numerosDisponibles.length === 0) {
            return NextResponse.json({ 
                success: false, 
                message: "No hay números disponibles para esta fecha" 
            });
        }

        // Seleccionar un número aleatorio entre los disponibles
        const indiceAleatorio = Math.floor(Math.random() * numerosDisponibles.length);
        const numeroSeleccionado = numerosDisponibles[indiceAleatorio];
        
        return NextResponse.json({ 
            success: true, 
            numero: numeroSeleccionado.Numero,
            disponibles: numeroSeleccionado.Tope - numeroSeleccionado.Cantidad,
            tope: numeroSeleccionado.Tope,
            fecha: fecha
        });
        
    } catch (error) {
        console.error("Error al generar número aleatorio:", error);
        return NextResponse.json({ 
            success: false, 
            message: "Error al procesar la solicitud",
            error: error.message
        }, { status: 500 });
    }
}