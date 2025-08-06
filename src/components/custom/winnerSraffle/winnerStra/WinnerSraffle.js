"use client";
import { useState, useEffect } from "react";
import { FaHome, FaPrint, FaSearch } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import generatePDFSraffle from "./pdfSraffle";

const WinnerSraffle = () => {
  const [loading, setLoading] = useState(false);
  const [searchSorteo, setSearchSorteo] = useState("");
  const [winner, setWinner] = useState(null);
  const router = useRouter();
  const backgroundImage = "/Sencillo.png";

  // Cargar el último sorteo al iniciar
  useEffect(() => {
    fetchLatestWinner();
  }, []);

  // Función para buscar el último sorteo
  const fetchLatestWinner = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/winnerSraffle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // Sin parámetros para traer el último
      });
      
      if (!res.ok) throw new Error("Error al cargar datos");
      
      const data = await res.json();
      if (data && data.length > 0) {
        setWinner(data[0]);
        setSearchSorteo(""); // Limpiar la búsqueda
      } else {
        Swal.fire({
          icon: "info",
          title: "Sin resultados",
          text: "No se encontraron sorteos registrados",
        });
      }
    } catch (error) {
      console.error("Error fetching winner:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un problema al cargar los datos",
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para buscar un sorteo específico
  const searchSpecificSorteo = async () => {
    if (!searchSorteo.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campo vacío",
        text: "Por favor ingrese un número de sorteo",
      });
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/winnerSraffle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Sorteo: searchSorteo }),
      });
      
      if (!res.ok) throw new Error("Error al cargar datos");
      
      const data = await res.json();
      if (data && data.length > 0) {
        setWinner(data[0]);
      } else {
        Swal.fire({
          icon: "info",
          title: "Sin resultados",
          text: `No se encontró el sorteo número ${searchSorteo}`,
        });
      }
    } catch (error) {
      console.error("Error searching sorteo:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un problema al buscar el sorteo",
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para imprimir el sorteo actual
  const handlePrintWinner = () => {
    if (!winner) {
      Swal.fire({
        icon: "warning",
        title: "Sin datos",
        text: "No hay resultados para imprimir",
      });
      return;
    }
    
    generatePDFSraffle(winner);
  };

  const goToMenu = () => {
    router.push("/menu");
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return "";
    
    // Extraer componentes de fecha directamente del string para evitar ajustes de zona horaria
    if (typeof dateString === 'string') {
      // Si la fecha viene en formato ISO (YYYY-MM-DDTHH:mm:ss...)
      if (dateString.includes('T')) {
        const [datePart] = dateString.split('T');
        const [year, month, day] = datePart.split('-').map(num => parseInt(num, 10));
        
        // Crear fecha especificando que debe interpretarse como UTC
        const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
        
        // Obtener nombre del día en español
        const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const nombreDia = diasSemana[date.getUTCDay()];
        
        // Formatear con día de la semana, día numérico y mes
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        return `${nombreDia}, ${day} de ${meses[month - 1]} de ${year}`;
      }
      
      // Si la fecha viene en formato YYYY-MM-DD
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
        
        // Crear fecha especificando que debe interpretarse como UTC
        const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
        
        // Obtener nombre del día en español
        const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const nombreDia = diasSemana[date.getUTCDay()];
        
        // Formatear con día de la semana, día numérico y mes
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        return `${nombreDia}, ${day} de ${meses[month - 1]} de ${year}`;
      }
    }
    
    // Si llegamos aquí, usar el método estándar con precaución
    try {
      const date = new Date(dateString);
      // Añadir verificación para asegurarnos de que la fecha es válida
      if (isNaN(date.getTime())) {
        return "Fecha no válida";
      }
      return date.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC' // Importante: usar UTC como zona horaria base
      });
    } catch (e) {
      console.error("Error al formatear fecha:", e);
      return "Error en fecha";
    }
  };

  return (
    <div className="relative min-h-screen bg-[rgb(38,38,38)]">
      <div
        className="absolute inset-0 bg-no-repeat bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})`, opacity: 0.15 }}
      >
        <div className="bg-[rgb(38,38,38)] opacity-80 absolute inset-0"></div>
      </div>

      <div className="max-w-lg mx-auto w-full bg-[rgb(38,38,38)] relative z-10 rounded-lg shadow-lg p-4 mt-8 border border-red-700">
        <h2 className="text-white text-2xl font-bold mb-6 text-center">Resultados de Sorteos</h2>
        
        {/* Sección de búsqueda */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="text"
              placeholder="Número de sorteo"
              value={searchSorteo}
              onChange={(e) => setSearchSorteo(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white border border-red-700"
            />
            <button
              onClick={searchSpecificSorteo}
              className="bg-red-700 hover:bg-red-800 text-white p-2 rounded"
              disabled={loading}
            >
              <FaSearch />
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={fetchLatestWinner}
              className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded flex-1"
              disabled={loading}
            >
              Último Sorteo
            </button>
            <button
              onClick={handlePrintWinner}
              className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
              disabled={!winner || loading}
            >
              <FaPrint /> Imprimir
            </button>
          </div>
        </div>
        
        {/* Mostrar resultados */}
        {loading ? (
          <div className="text-white text-center py-4">Cargando...</div>
        ) : winner ? (
          <div className="bg-red-900 text-white p-4 rounded-lg shadow-lg border border-white">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold">Trébol de la Suerte</h3>
              <p className="text-sm">{formatDate(winner.fechasorteo)}</p>
              <p className="text-sm">
                Sorteo {winner.Sorteo} - {winner.Tipo_sorteo === "normal" ? "Normal" : winner.Tipo_sorteo === "domingo" ? "Domingo" : "Especial"}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center bg-red-950 p-3 rounded-lg border border-white">
                <h4 className="font-bold">1er Lugar</h4>
                <p className="text-2xl font-bold">{winner.primerlugar}</p>
              </div>
              <div className="text-center bg-red-950 p-3 rounded-lg border border-white">
                <h4 className="font-bold">2do Lugar</h4>
                <p className="text-2xl font-bold">{winner.segundolugar}</p>
              </div>
            </div>
            
            <p className="text-center text-sm italic">
              Resultados oficiales del sorteo
            </p>
          </div>
        ) : (
          <div className="text-white text-center py-4">
            No hay resultados disponibles. Busca un sorteo específico o consulta el último sorteo.
          </div>
        )}
      </div>

      <button
        onClick={goToMenu}
        className="fixed bottom-4 right-4 bg-red-700 text-white flex justify-center items-center text-4xl p-2 rounded-full h-[80px] w-[80px] z-10 border-4 border-white"
      >
        <FaHome />
      </button>
    </div>
  );
};

export default WinnerSraffle;