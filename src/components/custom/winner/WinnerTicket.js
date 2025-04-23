"use client";
import { useEffect, useState, useRef } from "react";
import { FaHome, FaMoneyBillWave, FaCamera, FaShare } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import generateWinnerPDF from "./generateWinnerPDF";

const WinnerTicket = () => {
  const [premiados, setPremiados] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [currentBoletoId, setCurrentBoletoId] = useState(null);
  const fileInputRef = useRef(null);
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

  // Convertir imagen a base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Manejar selección de imagen
  // Manejar selección de imagen
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        console.log("Archivo seleccionado:", file.name);
        const base64Image = await fileToBase64(file);
        setSelectedImage(base64Image);
        setPreviewImage(URL.createObjectURL(file));
        
        // Mostrar confirmación visual
        const previewContainer = document.getElementById("previewContainer");
        const previewImageElement = document.getElementById("previewImage");
        
        if (previewContainer && previewImageElement) {
          previewContainer.style.display = "block";
          previewImageElement.src = URL.createObjectURL(file);
        }
        
        console.log("Imagen cargada correctamente");
      } catch (error) {
        console.error("Error al convertir imagen:", error);
        Swal.fire("Error", "No se pudo procesar la imagen", "error");
      }
    }
  };

  // Marcar un boleto como pagado
  const marcarComoPagado = async (id, imageData = null) => {
    try {

      const ineImage = imageData || selectedImage;
      if (!ineImage) {
        Swal.fire("Error", "Debe capturar la identificación del cliente", "error");
        return;
      }
      
      setIsLoading(true);
      
      const response = await fetch("/api/winner", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          id, 
          ine: ineImage 
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Actualizar el estado local para reflejar el cambio
        const boletoActualizado = {...premiados.find(b => b.Id_ganador === id)};
        boletoActualizado.Estatus = "Pagado";
        boletoActualizado.Fecha_pago = new Date().toISOString();
        boletoActualizado.Folio = data.folio || boletoActualizado.Folio;
        
        setPremiados(prev => 
          prev.map(boleto => 
            boleto.Id_ganador === id ? boletoActualizado : boleto
          )
        );
        
        // Mostrar folio y opciones
        const folio = data.folio || boletoActualizado.Folio;
        Swal.fire({
          title: "¡Boleto pagado con éxito!",
          html: `
            <p>El boleto ha sido marcado como pagado.</p>
            <p>Folio de pago: <strong>${folio}</strong></p>
          `,
          icon: "success",
          showCancelButton: true,
          confirmButtonText: "Imprimir comprobante",
          cancelButtonText: "Cerrar",
        }).then((result) => {
          if (result.isConfirmed) {
            // Función para imprimir comprobante
            imprimirComprobante(id, folio);
          }
        });
        
        // Limpiar la imagen seleccionada
        setSelectedImage(null);
        setPreviewImage(null);
        setCurrentBoletoId(null);
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

  // Imprimir comprobante de pago
  const imprimirComprobante = (id, folio) => {
    const boleto = premiados.find(b => b.Id_ganador === id);
    if (!boleto) return;
    
    // Utilizar el generador de PDF externo
    generateWinnerPDF(boleto, folio);
  };

  // Confirmar antes de marcar como pagado
   // Confirmar antes de marcar como pagado
   const confirmarPago = (id) => {
    const boleto = premiados.find(b => b.Id_ganador === id);
    let capturedImage = null;
    
    setCurrentBoletoId(id);
    
    Swal.fire({
      title: "Capturar identificación",
      html: `
        <p>Para marcar el boleto #${boleto.Boleto} como pagado, capture la identificación del cliente:</p>
        <div id="capturaContainer" style="margin-top: 15px;">
          <button id="captureButton" class="swal2-confirm swal2-styled" style="margin: 0 auto; display: block;">
            Seleccionar foto de identificación
          </button>
        </div>
        <div id="previewContainer" style="margin-top: 15px; text-align: center; display: none;">
          <img id="previewImage" style="max-width: 100%; max-height: 200px; margin: 0 auto;" />
          <p style="margin-top: 10px; font-size: 12px;">Identificación capturada</p>
        </div>
        <input type="hidden" id="imageSelected" value="false">
      `,
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: "Confirmar pago",
      cancelButtonText: "Cancelar",
      didOpen: () => {
        const captureButton = document.getElementById("captureButton");
        const hiddenInput = document.getElementById("imageSelected");
        
        // Definir una función especial para el manejador dentro del modal
        const handleFileSelect = async (e) => {
          const file = e.target.files[0];
          if (file) {
            try {
              const reader = new FileReader();
              reader.onload = function(event) {
                // Guardar la imagen capturada
                capturedImage = event.target.result;
                
                // Actualizar la vista previa
                const previewContainer = document.getElementById("previewContainer");
                const previewImageElement = document.getElementById("previewImage");
                
                if (previewContainer && previewImageElement) {
                  previewContainer.style.display = "block";
                  previewImageElement.src = URL.createObjectURL(file);
                  hiddenInput.value = "true";
                }
              };
              reader.readAsDataURL(file);
            } catch (error) {
              console.error("Error al procesar imagen:", error);
            }
          }
        };
        
        // Crear un input file temporal para este modal específico
        const tempFileInput = document.createElement("input");
        tempFileInput.type = "file";
        tempFileInput.accept = "image/*";
        tempFileInput.style.display = "none";
        tempFileInput.addEventListener("change", handleFileSelect);
        document.body.appendChild(tempFileInput);
        
        // Asignar evento al botón de captura
        if (captureButton) {
          captureButton.addEventListener("click", () => {
            tempFileInput.click();
          });
        }
      },
      preConfirm: () => {
        // Verificar que la imagen existe
        const hiddenInput = document.getElementById("imageSelected");
        if (hiddenInput.value !== "true" || !capturedImage) {
          Swal.showValidationMessage("Debe capturar la identificación del cliente");
          return false;
        }
        return true;
      }
    }).then((result) => {
      if (result.isConfirmed && capturedImage) {
        // Actualizar el estado de React con la imagen capturada
        setSelectedImage(capturedImage);
        // Luego proceder con el pago
        marcarComoPagado(id, capturedImage);
      } else {
        // Limpiar selección si se cancela
        setSelectedImage(null);
        setPreviewImage(null);
        setCurrentBoletoId(null);
      }
    });
  };
  
  // Observar cambios en la previsualización
  useEffect(() => {
    if (previewImage && currentBoletoId) {
      const previewContainer = document.getElementById("previewContainer");
      const previewImageElement = document.getElementById("previewImage");
      
      if (previewContainer && previewImageElement) {
        previewContainer.style.display = "block";
        previewImageElement.src = previewImage;
      }
    }
  }, [previewImage, currentBoletoId]);

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
      
      {/* Input oculto para seleccionar archivo */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleImageChange}
      />
      
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
                      <div className="flex space-x-3">
                        <span className="text-green-500">✓</span>
                        <button
                          onClick={() => imprimirComprobante(boleto.Id_ganador, boleto.Folio)}
                          className="text-blue-600 dark:text-blue-500 hover:text-blue-800"
                          title="Imprimir comprobante"
                        >
                          <FaShare />
                        </button>
                      </div>
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