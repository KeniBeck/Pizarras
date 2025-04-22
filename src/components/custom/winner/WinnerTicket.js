"use client";
import { useEffect, useState } from "react";
import { FaHome, FaMoneyBillWave } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const WinnerTicket = () => {
  const [premiados, setPremiados] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Cargar los boletos premiados al iniciar
  const fetchPremiados = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/winner");
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.premiados) {
        console.log("Boletos premiados:", data.premiados);
        setPremiados(data.premiados);
      } else {
        Swal.fire("Error", "No se pudieron cargar los boletos premiados", "error");
      }
    } catch (error) {
      console.error("Error al obtener boletos premiados:", error);
      Swal.fire("Error", "Ocurrió un error al cargar los boletos premiados", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Marcar un boleto como pagado
  const marcarComoPagado = async (id) => {
    try {
      setIsLoading(true);
      
      const response = await fetch("/api/winner", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      
      const data = await response.json();
      console.log("Respuesta del servidor:", data);
      
      if (data.success) {
        // Actualizar el estado local para reflejar el cambio
        setPremiados(prev => 
          prev.map(boleto => 
            boleto.Id_ganador === id ? { ...boleto, Estatus: "Pagado", Fecha_pago: new Date().toISOString() } : boleto
          )
        );
        
        Swal.fire("¡Éxito!", "Boleto marcado como pagado", "success");
      } else {
        Swal.fire("Error", data.error || "No se pudo marcar el boleto como pagado", "error");
      }
    } catch (error) {
      console.error("Error al marcar como pagado:", error);
      Swal.fire("Error", "Ocurrió un error al procesar el pago", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Confirmar antes de marcar como pagado
  const confirmarPago = (id, numeroBoleto) => {
    Swal.fire({
      title: "Confirmar pago",
      text: `¿Estás seguro de marcar este boleto como pagado?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, marcar como pagado",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        marcarComoPagado(id);
      }
    });
  };

  // Volver al menú principal
  const goToMenu = () => {
    router.push('/menu');
  };

  // Filtrar boletos según la búsqueda (por número de boleto)
  const filteredPremiados = premiados.filter(boleto => 
    boleto.Boleto && boleto.Boleto.toString().includes(search)
  );
  
  // Cargar datos al montar el componente
  useEffect(() => {
    fetchPremiados();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl text-white font-bold mb-4 text-center">Boletos Premiados</h1>
      
      {/* Estadísticas */}
      <div className="flex flex-col md:flex-row justify-between mb-4 text-white">
        <div className="bg-gray-800 p-3 rounded-md mb-2 md:mb-0 md:mr-2 flex-1">
          <p className="font-semibold">Total de boletos premiados: {premiados.length}</p>
        </div>
        <div className="bg-gray-800 p-3 rounded-md mb-2 md:mb-0 md:mx-2 flex-1">
          <p className="font-semibold">Pagados: {premiados.filter(b => b.Estatus === "Pagado").length}</p>
        </div>
        <div className="bg-gray-800 p-3 rounded-md md:ml-2 flex-1">
          <p className="font-semibold">Pendientes: {premiados.filter(b => b.Estatus === "No pagado").length}</p>
        </div>
      </div>
      
      {/* Buscador */}
      <div className="mb-4">
        <input
          type="search"
          className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          placeholder="Buscar por número de boleto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      
      {/* Tabla de boletos premiados */}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Boleto</th>
              <th scope="col" className="px-6 py-3">Cliente</th>
              <th scope="col" className="px-6 py-3">Premio</th>
              <th scope="col" className="px-6 py-3">Fecha</th>
              <th scope="col" className="px-6 py-3">Estado</th>
              <th scope="col" className="px-6 py-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            {filteredPremiados.length > 0 ? (
              filteredPremiados.map((boleto) => (
                <tr key={boleto.Id_ganador} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {boleto.Boleto}
                  </td>
                  <td className="px-6 py-4">
                    {boleto.Cliente}
                  </td>
                  <td className="px-6 py-4">
                    ${boleto.Premio}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(boleto.Fecha_sorteo).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${boleto.Estatus === "Pagado" ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                      {boleto.Estatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {boleto.Estatus === "No pagado" ? (
                      <button
                        onClick={() => confirmarPago(boleto.Id_ganador)}
                        className="text-blue-600 dark:text-blue-500 hover:text-blue-800 text-xl"
                        disabled={isLoading}
                      >
                        <FaMoneyBillWave title="Marcar como pagado" />
                      </button>
                    ) : (
                      <span className="text-gray-500">✓</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center">
                  {isLoading ? "Cargando..." : "No hay boletos premiados que coincidan con la búsqueda"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Botón para volver al menú */}
      <button
        onClick={goToMenu}
        className="fixed bottom-4 right-4 bg-red-700 text-white flex justify-center items-center p-2 rounded-full h-[40px] w-[40px]"
      >
        <FaHome />
      </button>
      
      {/* Overlay de carga */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
        </div>
      )}
    </div>
  );
};

export default WinnerTicket;