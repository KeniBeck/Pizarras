import { NextResponse } from "next/server";
import pool from "@/db/MysqlConection";

// GET: Obtener todos los boletos premiados
export async function GET() {
  try {
    // Consulta para obtener todos los boletos premiados
    const [premiados] = await pool.query('SELECT * FROM premiados');
    
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
    const { id } = data;
    
    if (!id) {
      return NextResponse.json({ 
        error: "Se requiere un ID de boleto premiado", 
        success: false 
      }, { 
        status: 400 
      });
    }
    
    // Consulta para actualizar el estado del boleto a pagado
    const resultado = await pool.query(
      'UPDATE premiados SET pagado = true WHERE idpremiados = ?', 
      [id]
    );
    
    if (resultado[0].affectedRows === 0) {
      return NextResponse.json({ 
        error: "No se encontró el boleto premiado con el ID proporcionado", 
        success: false 
      }, { 
        status: 404 
      });
    }
    
    // Devolver respuesta exitosa
    return NextResponse.json({ 
      message: "Boleto premiado actualizado correctamente",
      success: true 
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