'use client'
import { useState, useEffect } from "react";
import { FaSearch, FaCalendarAlt} from "react-icons/fa";
import Swal from "sweetalert2";

const ResultadosOnline = () => {
  const [loading, setLoading] = useState(false);
  const [searchSorteo, setSearchSorteo] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [winner, setWinner] = useState(null);
  const [recentWinners, setRecentWinners] = useState([]);

  // Cargar últimos sorteos al iniciar
  useEffect(() => {
    fetchLatestWinners();
    // Establecer fecha actual por defecto
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, []);

  // Función para buscar últimos sorteos
  const fetchLatestWinners = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/winnerSraffle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "recent" }),
      });
      
      if (!res.ok) throw new Error("Error al cargar datos");
      
      const data = await res.json();
      if (data && data.length > 0) {
        setWinner(data[0]);
        setRecentWinners(data.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching winners:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un problema al cargar los datos",
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para buscar por número de sorteo
  const searchBySorteo = async () => {
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

// Función para buscar por fecha
const searchByDate = async () => {
  if (!selectedDate) {
    Swal.fire({
      icon: "warning",
      title: "Fecha requerida",
      text: "Por favor seleccione una fecha",
    });
    return;
  }
  
  setLoading(true);
  try {
    
    const res = await fetch("/api/winnerSraffle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        fecha: selectedDate
      }),
    });
    
    if (!res.ok) throw new Error("Error al cargar datos");
    
    const data = await res.json();
    
    // siempre mostrar el primer resultado si existe, sin importar la fecha
    if (data && data.length > 0) {
      const resultado = data[0];
      setWinner(resultado);
      setRecentWinners(data.slice(0, 5));
      
      Swal.fire({
        icon: "success",
        title: "Resultado encontrado",
        text: `Sorteo del ${formatDate(resultado.fechasorteo)}`,
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        icon: "info",
        title: "Sin resultados",
        text: `No se encontraron sorteos`,
      });
      setWinner(null);
      setRecentWinners([]);
    }
  } catch (error) {
    console.error("Error searching by date:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Ocurrió un problema al buscar por fecha",
    });
  } finally {
    setLoading(false);
  }
};

  // Formatear fecha CORREGIDA para zona horaria
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      // Crear fecha en UTC para evitar problemas de zona horaria
      const date = new Date(dateString);
      
      // Ajustar para compensar la zona horaria
      const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
      
      return adjustedDate.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return "Fecha no válida";
    }
  };

  return (
    <div className="w-full bg-white">
      {/* Header de Resultados */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-red-600 mb-2">RESULTADOS DE LOTERÍAS</h1>
        <p className="text-gray-600">Resultados oficiales - Trébol de la Suerte</p>
      </div>

      {/* Panel de Búsqueda */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Consultar Resultados</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Búsqueda por número */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Número de Sorteo
            </label>
            <div className="flex">
              <input
                type="text"
                placeholder="Ej: 12345"
                value={searchSorteo}
                onChange={(e) => setSearchSorteo(e.target.value)}
                className="flex-1 p-3 rounded-l border border-gray-300 focus:border-red-500 focus:outline-none"
              />
              <button
                onClick={searchBySorteo}
                className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-r transition duration-200"
                disabled={loading}
              >
                <FaSearch />
              </button>
            </div>
          </div>

          {/* Búsqueda por fecha */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Por Fecha
            </label>
            <div className="flex">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex-1 p-3 rounded-l border border-gray-300 focus:border-red-500 focus:outline-none"
              />
              <button
                onClick={searchByDate}
                className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-r transition duration-200"
                disabled={loading}
              >
                <FaCalendarAlt />
              </button>
            </div>
          </div>

          {/* Botón últimos resultados */}
          <div className="flex items-end">
            <button
              onClick={fetchLatestWinners}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded transition duration-200"
              disabled={loading}
            >
              Últimos Resultados
            </button>
          </div>
        </div>
      </div>

      {/* Resultado Principal */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando resultados...</p>
        </div>
      ) : winner ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8">
          {/* Header del Sorteo */}
          <div className="bg-red-600 text-white p-4 rounded-t-lg">
            <div className="text-center">
              <h3 className="text-2xl font-bold">TRÉBOL DE LA SUERTE</h3>
              <p className="text-lg">{formatDate(winner.fechasorteo)}</p>
              <p className="text-sm opacity-90">
                Sorteo {winner.Sorteo} - 
                {winner.Tipo_sorteo === "normal" ? " Normal" : 
                 winner.Tipo_sorteo === "domingo" ? " Domingo" : " Especial"}
              </p>
            </div>
          </div>
          
          {/* Resultados */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="text-center bg-red-50 p-6 rounded-lg border border-red-200">
                <h4 className="font-bold text-xl mb-3 text-red-700">1er Lugar</h4>
                <p className="text-5xl font-bold text-red-600">{winner.primerlugar}</p>
              </div>
              <div className="text-center bg-red-50 p-6 rounded-lg border border-red-200">
                <h4 className="font-bold text-xl mb-3 text-red-700">2do Lugar</h4>
                <p className="text-5xl font-bold text-red-600">{winner.segundolugar}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xl text-gray-600 mb-2">No hay resultados disponibles</p>
          <p className="text-gray-500">Utilice las opciones de búsqueda para consultar resultados</p>
        </div>
      )}

      {/* Sorteos Recientes */}
      {recentWinners.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Sorteos Recientes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentWinners.map((sorteo, index) => (
              <div 
                key={index}
                className="bg-white p-4 rounded-lg border border-gray-200 cursor-pointer hover:border-red-300 hover:shadow-md transition duration-200"
                onClick={() => setWinner(sorteo)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">
                    Sorteo {sorteo.Sorteo}
                  </span>
                  <span className="text-xs text-gray-500">
                    {sorteo.Tipo_sorteo === "especial" ? "Especial" : "Normal"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{formatDate(sorteo.fechasorteo)}</p>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">1ro: {sorteo.primerlugar}</span>
                  <span className="font-semibold">2do: {sorteo.segundolugar}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultadosOnline;