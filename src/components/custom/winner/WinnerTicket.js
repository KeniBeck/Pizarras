"use client";
import { useEffect, useState, useRef, useMemo } from "react";
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
  const [userData, setUserData] = useState(null);
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
  // Función para comprimir imagen antes de convertir a base64
  const comprimirImagen = (file, maxWidth = 800, maxHeight = 800, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Redimensionar manteniendo proporción si excede los límites
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Obtener imagen comprimida en formato base64
          const imagenComprimida = canvas.toDataURL('image/jpeg', quality);
          resolve(imagenComprimida);
        };
        img.onerror = () => {
          reject(new Error('Error al cargar la imagen para compresión'));
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Convertir imagen a base64 (mantenido para compatibilidad)
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Manejar selección de imagen con compresión
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        console.log("Archivo seleccionado:", file.name);
        
        // Verificar tamaño antes de procesar
        if (file.size > 10 * 1024 * 1024) { // 10MB límite
          Swal.fire("Error", "La imagen es demasiado grande. Máximo 10MB", "error");
          return;
        }
        
        // Aplicar compresión a la imagen
        const imagenComprimida = await comprimirImagen(file);
        console.log("Imagen comprimida correctamente");
        
        // Guardar imagen comprimida en el estado
        setSelectedImage(imagenComprimida);
        setPreviewImage(URL.createObjectURL(file));
        
        // Mostrar confirmación visual
        const previewContainer = document.getElementById("previewContainer");
        const previewImageElement = document.getElementById("previewImage");
        
        if (previewContainer && previewImageElement) {
          previewContainer.style.display = "block";
          previewImageElement.src = URL.createObjectURL(file);
        }
      } catch (error) {
        console.error("Error al procesar imagen:", error);
        Swal.fire("Error", "No se pudo procesar la imagen", "error");
      }
    }
  };

  // Marcar un boleto como pagado
  const marcarComoPagado = async (id, imageData = null) => {
    try {
      // Asegurarnos de tener los datos del usuario antes de continuar
      let currentUserData = userData;
      
      if (typeof window !== "undefined") {
        if (!currentUserData) {
          try {
            const localUserData = localStorage.getItem("userData");
            if (localUserData) {
              currentUserData = JSON.parse(localUserData);
              // Actualizar el estado con los datos obtenidos
              setUserData(currentUserData);
            } else {
              Swal.fire("Error", "No se encontró información del usuario", "error");
              return;
            }
          } catch (error) {
            console.error("Error al recuperar datos del usuario:", error);
            Swal.fire("Error", "Error al recuperar datos del usuario", "error");
            return;
          }
        }
      }

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
          ine: ineImage, 
          user: currentUserData // Usar currentUserData en lugar de userData
        }),
      });

      const data = await response.json();
      console.log("Respuesta del servidor:", data);
      if (data.success) {
        // Actualizar el estado local para reflejar el cambio
       const boletoActualizado = data.boleto;
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
            imprimirComprobante(id, folio, boletoActualizado);
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
  const imprimirComprobante = (id, folio, boletoActualizado = null) => {
    const boleto = boletoActualizado || premiados.find(b => b.Id_ganador === id);
  
    if (!boleto) {
      console.error("No se encontró el boleto con ID:", id);
      Swal.fire("Error", "No se pudo generar el comprobante", "error");
      return;
    }
    
    
    // Utilizar el generador de PDF externo
    generateWinnerPDF(boleto, folio);
  };

  //formatea fecha de sorteo de YYYY-MM-DD a DD/MM/YYYY con expreciones regulares
  const formatDate = (dateString) => {
    const regex = /(\d{4})-(\d{2})-(\d{2})/;
    const match = dateString.match(regex);
    if (match) {
      const year = match[1];
      const month = match[2];
      const day = match[3];
      return `${day}/${month}/${year}`;
    }
    return dateString; // Retorna la cadena original si no coincide con el formato
  };

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
              // Verificar tamaño antes de procesar
              if (file.size > 10 * 1024 * 1024) { // 10MB límite
                Swal.showValidationMessage("La imagen es demasiado grande. Máximo 10MB");
                return;
              }

              // Comprimir la imagen antes de usarla
              const imagenComprimida = await comprimirImagen(file);
              capturedImage = imagenComprimida;
              
              // Actualizar la vista previa
              const previewContainer = document.getElementById("previewContainer");
              const previewImageElement = document.getElementById("previewImage");
              
              if (previewContainer && previewImageElement) {
                previewContainer.style.display = "block";
                previewImageElement.src = URL.createObjectURL(file);
                hiddenInput.value = "true";
              }
            } catch (error) {
              console.error("Error al procesar imagen:", error);
              Swal.showValidationMessage("Error al procesar la imagen");
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

  // Filtrar boletos según la búsqueda (por número de folio) usando expresiones regulares
  const filteredPremiados = useMemo(() => {
    if (!search || search.length < 5) return [];
    
    try {
      // Crear una expresión regular a partir del texto de búsqueda
      // La bandera 'i' hace que sea insensible a mayúsculas/minúsculas
      const regex = new RegExp(search, 'i');
      
      return premiados.filter(boleto => 
        boleto.Folio && regex.test(boleto.Folio.toString())
      );
    } catch (error) {
      // Si hay un error en la expresión regular, usar búsqueda estándar
      console.error("Error en expresión regular:", error);
      return premiados.filter(boleto => 
        boleto.Folio && boleto.Folio.toString().toLowerCase().includes(search.toLowerCase())
      );
    }
  }, [premiados, search]);
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
          <p className="font-semibold">Pagados: {premiados.filter(b => b.Estatus === "pagado").length}</p>
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
          placeholder="Buscar por número de folio..."
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
      
        {/* Tabla de boletos premiados - solo se muestra cuando hay búsqueda */}
        {search !== "" && (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Folio</th>
                <th scope="col" className="px-6 py-3">Boleto</th>
                <th scope="col" className="px-6 py-3">Cliente</th>
                <th scope="col" className="px-6 py-3">Premio</th>
                <th scope="col" className="px-6 py-3">Fecha Sorteo</th>
                <th scope="col" className="px-6 py-3">Estado</th>
                <th scope="col" className="px-6 py-3">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredPremiados.length > 0 ? (
                filteredPremiados.map((boleto) => (
                  <tr key={boleto.Id_ganador} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {boleto.Folio}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {boleto.Boleto.toString().replace( /\.\d{2}$/, "")}
                    </td>
                    <td className="px-6 py-4">
                      {boleto.Cliente}
                    </td>
                    <td className="px-6 py-4">
                      ${boleto.Premio}
                    </td>
                    <td className="px-6 py-4">
                      {formatDate(boleto.Fecha_sorteo)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${boleto.Estatus === "pagado" ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
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
      )}
      
      {/* Mensaje cuando no hay búsqueda */}
      {search.length > 0 && search.length < 5 && (
        <div className="text-center text-white mt-8 mb-8">
          <p className="text-lg">Ingrese al menos 5 caracteres para buscar</p>
        </div>
      )}
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