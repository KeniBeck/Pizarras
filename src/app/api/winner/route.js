import { NextResponse } from "next/server";
import pool from "@/db/MysqlConection";

// GET: Obtener todos los boletos premiados
export async function GET() {
  try {
    // Consulta para obtener todos los boletos premiados
    const [premiados] = await pool.query('select Id_ganador,Premio,Folio,Boleto,Costo,Cliente,Premio,Fecha_pago,Fecha_sorteo,Vendedor,Estatus from Ganadores;');

    // Devolver la respuesta con los datos
    return NextResponse.json({
      premiados,
      success: true
    });
  } catch (error) {
    console.error("Error al obtener boletos premiados:", error);
    // Siempre devolver una respuesta en caso de error
    return NextResponse.json({
      error: "Error al obtener boletos premiados: " + error.message,
      success: false
    }, {
      status: 500
    });
  }
}

// PUT: Actualizar estado de boleto premiado a pagado
export async function PUT(request) {
  try {
    // Obtener el ID del boleto a actualizar desde el cuerpo de la solicitud
    const data = await request.json();
    const { id, ine, user } = data;

    const fecha_pago = new Date();

    if (!id) {
      return NextResponse.json({
        error: "Se requiere un ID de boleto premiado",
        success: false
      }, {
        status: 400
      });
    }

    // Verificar si el ID_ganadoir ya esta pagado
    const [boletoExistente] = await pool.query(
      'SELECT * FROM Ganadores WHERE Id_ganador = ? AND Estatus = "pagado"',
      [id]
    );
    if (boletoExistente.length > 0) {
      return NextResponse.json({
        error: "El boleto ya está marcado como pagado",
        success: false
      }, {
        status: 400
      });
    }

    // Consulta para actualizar el estado del boleto a pagado
    const resultado = await pool.query(
      'UPDATE Ganadores SET Estatus = ?, Ine = ?, Fecha_pago = ?, Vendedor= ? WHERE Id_ganador = ?',
      ["pagado", ine, fecha_pago, user.Nombre, id]
    );

    if (resultado[0].affectedRows === 0) {
      return NextResponse.json({
        error: "No se encontró el boleto premiado con el ID proporcionado",
        success: false
      }, {
        status: 404
      });
    }

    // Consulta adicional para obtener los datos actualizados
    const [boletoActualizado] = await pool.query(
      'SELECT Id_ganador, Premio, Folio, Boleto, Costo, Cliente, Premio, Fecha_pago, Fecha_sorteo, Vendedor, Estatus FROM Ganadores WHERE Id_ganador = ?',
      [id]
    );

    // Devolver respuesta exitosa con los datos del boleto actualizado
  
    return NextResponse.json({
      value: resultado,
      message: "Boleto premiado actualizado correctamente",
      success: true,
      boleto: boletoActualizado[0], // Incluir los datos del boleto actualizado
      folio: boletoActualizado[0]?.Folio // Incluir el folio específicamente
    });
  } catch (error) {
    console.error("Error al actualizar boleto premiado:", error);
    // Siempre devolver una respuesta en caso de error
    return NextResponse.json({
      error: "Error al actualizar boleto premiado: " + error.message,
      success: false
    }, {
      status: 500
    });
  }
}