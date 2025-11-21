'use client'
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ResultadosOnline from "@/components/custom/resultadosOnline/ResultadosOnline";

const OnlineHome = () => {
  const [activeTab, setActiveTab] = useState("juegos");
  const [sorteos, setSorteos] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Cargar sorteos normales Y especiales
  useEffect(() => {
    const fetchSorteos = async () => {
      try {
        setLoading(true);
        
        const [normalesResponse, especialesResponse] = await Promise.all([
          fetch("/api/ticketBuy", { method: "GET" }),
          fetch("/api/ticketBuy", { method: "PUT" })
        ]);

        const normalesData = await normalesResponse.json();
        const especialesData = await especialesResponse.json();

        const todosSorteos = [
          ...(normalesData.result || []),
          ...(especialesData.result || [])
        ];

        setSorteos(todosSorteos);
      } catch (error) {
        console.error("Error cargando sorteos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSorteos();
  }, []);

    const handleJugar = (sorteo) => {
        // Guardar el sorteo seleccionado en localStorage para que los componentes lo lean
        localStorage.setItem('sorteoSeleccionado', JSON.stringify(sorteo));
        
        if (sorteo.Tipo_sorteo === "especial") {
            router.push("/CompraOnlineEspecial");
        } else {
            router.push("/CompraOnline");
        }
    };

  const formatFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header con pestañas */}
      <div className="bg-red-600 p-4">
        <div className="flex space-x-8 justify-center">
          <button
            onClick={() => setActiveTab("juegos")}
            className={`px-6 py-2 rounded-full font-bold text-lg transition-all ${
              activeTab === "juegos" 
                ? "bg-yellow-400 text-red-600 shadow-lg" 
                : "text-white hover:bg-red-700"
            }`}
          >
            JUEGOS
          </button>
          <button
            onClick={() => setActiveTab("resultados")}
            className={`px-6 py-2 rounded-full font-bold text-lg transition-all ${
              activeTab === "resultados" 
                ? "bg-yellow-400 text-red-600 shadow-lg" 
                : "text-white hover:bg-red-700"
            }`}
          >
            RESULTADOS
          </button>
        </div>
      </div>

      {/* Contenido de las pestañas */}
      <div className="p-6">
        {activeTab === "juegos" ? (
          // ... (tu código existente de juegos)
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              SORTEOS DISPONIBLES
            </h1>

            <div className="text-center mb-6">
                <p className="text-lg text-red-600 font-semibold">
                    Hoy es {new Date().toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long',
                    year: 'numeric'
                    })}
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorteos.map((sorteo) => (
                <div 
                  key={sorteo.Idsorteo}
                  className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {sorteo.Tipo_sorteo === "especial" && (
                    <div className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block text-center w-full">
                      ESPECIAL
                    </div>
                  )}
                  
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-red-700 mb-2">
                      {sorteo.leyenda2.split(' - ')[0]}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      {formatFecha(sorteo.Fecha)}
                    </p>
                    <div className="text-xs text-gray-500">
                      <span className="font-semibold">1ro: </span>${sorteo.Primerpremio} |{" "}
                      <span className="font-semibold">2do: </span>${sorteo.Segundopremio}
                    </div>
                  </div>

                  <button
                    onClick={() => handleJugar(sorteo)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                    >
                    JUGAR AHORA
                </button>
                </div>
              ))}
            </div>

            {sorteos.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">
                  No hay sorteos disponibles en este momento
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Pestaña de Resultados */
          <ResultadosOnline />
        )}
      </div>
    </div>
  );
};

export default OnlineHome;