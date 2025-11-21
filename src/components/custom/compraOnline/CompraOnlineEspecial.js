'use client'
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaHome, FaDice } from "react-icons/fa";
import Swal from "sweetalert2";
import { ErrorPrizes, loading, ValidateBox } from "../alerts/menu/Alerts";
import EspecialPreviewModalOnline from "./EspecialPreviewModalOnline";
import EspecialBoletosDisponiblesModalOnline from "./EspecialBoletosDisponiblesModalOnline";

const CompraOnlineEspecial = ({ sorteoId }) => {
  const [prizes, setPrizes] = useState(null);
  const [ticketNumber, setTicketNumber] = useState("");
  const [foundTope, setFoundTope] = useState(null);
  const [precioFijo, setPrecioFijo] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [boletos, setBoletos] = useState([]);
  const [boletosOnline, setBoletosOnline] = useState([]);
  const router = useRouter();
  const [previewModal, setPreviewModal] = useState(false);
  const [showDisponibles, setShowDisponibles] = useState(false);

  // Cargar datos del sorteo especial desde localStorage
  useEffect(() => {
    const cargarSorteoEspecial = async () => {
      try {
        const sorteoGuardado = localStorage.getItem('sorteoSeleccionado');
        if (sorteoGuardado) {
          const sorteo = JSON.parse(sorteoGuardado);
          setPrizes(sorteo);
        }

        // Cargar precio fijo
        const precioResponse = await fetch("/api/leyenda3");
        const precioData = await precioResponse.json();
        setPrecioFijo(precioData.precioBoleto);

        // Cargar boletos vendidos (tabla boletos)
        const responseBoletos = await fetch("/api/ticketBuy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const dataBoletos = await responseBoletos.json();
        setBoletos(dataBoletos.result || []);

        // Cargar boletos online filtrados por fecha (formato correcto)
        if (prizes?.Fecha) {
          const fechaFormateada = prizes.Fecha.split('T')[0];
          const responseOnline = await fetch(`/api/boletosOnline?fecha=${fechaFormateada}`);
          const dataOnline = await responseOnline.json();
          
          if (dataOnline.success) {
            setBoletosOnline(dataOnline.boletos || []);
          } else {
            console.error("Error cargando boletos online:", dataOnline.error);
            setBoletosOnline([]);
          }
        }

      } catch (error) {
        console.error("Error cargando sorteo especial:", error);
        Swal.fire("Error", "No se pudo cargar el sorteo especial", "error");
      }
    };

    cargarSorteoEspecial();
  }, [prizes?.Fecha]);

  // Función para obtener un número aleatorio disponible para boletos especiales ONLINE
  const getRandomNumberEspecialOnline = async () => {
    try {
      setIsLoading(true);

      // Obtener ambas listas de boletos vendidos
      const fechaFormateada = prizes.Fecha.split('T')[0];
      
      // Cargar boletos normales vendidos
      const responseBoletos = await fetch("/api/ticketBuy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const dataBoletos = await responseBoletos.json();

      // Cargar boletos online vendidos
      const responseOnline = await fetch(`/api/boletosOnline?fecha=${fechaFormateada}`);
      const dataOnline = await responseOnline.json();

      if (dataBoletos.result && dataOnline.success) {
        // Filtrar boletos normales vendidos para esta fecha
        const boletosNormalesVendidos = dataBoletos.result
          .filter(ticket => ticket.Fecha === fechaFormateada)
          .map(ticket => ticket.Boleto);

        // Obtener boletos online vendidos para esta fecha
        const boletosOnlineVendidos = dataOnline.boletos.map(ticket => ticket.numero_boleto);

        // Combinar ambas listas
        const todosLosBoletosVendidos = [...boletosNormalesVendidos, ...boletosOnlineVendidos];

        // Generar números hasta encontrar uno disponible
        let numeroAleatorio;
        let intentos = 0;
        const maxIntentos = 1000;

        do {
          numeroAleatorio = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
          intentos++;
        } while (todosLosBoletosVendidos.includes(parseInt(numeroAleatorio)) && intentos < maxIntentos);

        if (intentos >= maxIntentos) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se encontraron números disponibles'
          });
          return;
        }

        // Establecer el número encontrado
        setTicketNumber(numeroAleatorio);
        
        // Establecer nombre por defecto
        setName("Trébol de la Suerte");

        // Limpiar validación de tope
        setFoundTope(null);

        // Mostrar mensaje de éxito
        Swal.fire({
          icon: 'success',
          title: 'Número aleatorio generado',
          text: `Número: ${numeroAleatorio}`,
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error("Error al obtener número aleatorio online:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al conectar con el servidor'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (!prizes) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="relative w-32 h-32">
          <div className="absolute top-0 left-0 animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-500"></div>
          <div className="absolute top-0 left-0 flex items-center justify-center h-32 w-32">
            <span className="text-white text-sm">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  const handleTicketNumberChange = (e) => {
    let value = e.target.value;
    if (!/^[0-9]*$/.test(value)) {
      value = value.slice(0, -1);
    }
    setTicketNumber(value);

    const fechaFormateada = prizes.Fecha.split('T')[0];

    const boletoNormal = boletos.find((t) => 
      t.Boleto === Number(value) && t.Fecha === fechaFormateada
    );
    
    // Comparar como strings
    const boletoOnline = boletosOnline.find((t) => 
      t.numero_boleto === Number(value) && t.fecha_sorteo === fechaFormateada
    );
    
    /*console.log('Buscando boleto:', {
      boletoBuscado,
      boletosOnline: boletosOnline.map(b => ({ numero: b.numero_boleto, fecha: b.fecha_sorteo })),
      encontrado: boletoOnline
    });*/
    
    if (boletoNormal || boletoOnline) {
      setFoundTope(true);
    } else {
      setFoundTope(null);
    }
  };

  const handleBlur = (e) => {
    let value = e.target.value;
    value = value.padStart(3, "0");
    setTicketNumber(value);
  };

  const enviarDatosNormal = () => {
    if (!precioFijo || !name) {
      ValidateBox();
      return;
    }
    if (foundTope !== null) {
      Swal.fire("Este boleto ya no está disponible");
      return;
    }
    setPreviewModal(true);
  };

  if (isLoading) {
    loading();
  }

  const goToMenu = () => {
    router.push("/OnlineHome");
  };

  const confirmVenta = async ({ telefono, metodoPago, bancoSeleccionado }) => {
    setIsLoading(true);

    const boletoData = {
      idSorteo: prizes.Idsorteo,
      ticketNumber,
      prizebox: precioFijo, 
      name,
      tipoSorteo: prizes.Tipo_sorteo,
      fecha: prizes.Fecha,
      primerPremio: prizes.Primerpremio,
      segundoPremio: prizes.Segundopremio,
    };

    try {
      const res = await fetch("/api/boletosOnline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boletos: [boletoData],
          telefono,
          metodo_pago: metodoPago,
        }),
      });

      const data = await res.json();

      if (data.error) {
        Swal.fire("❌ Error al registrar compra especial online");
      } else {
        const fechaCorta = new Date(prizes.Fecha).toISOString().split("T")[0];
        const mensaje = encodeURIComponent(
            `\u{1F39F}\uFE0F *Compra Boleto Especial Online* \u{1F39F}\uFE0F\n\n` +
            `➡️ Boleto: ${ticketNumber}\n\u{1F4B0} Precio: $${precioFijo}\n\u{1F464} Nombre: ${name}` + // 🔄 Usar precioFijo
            `\n\n\u{1F4C5} Sorteo Especial: ${fechaCorta}` +
            `\n\u{1F4DE} Teléfono: ${telefono}` +
            `\n\u{1F4B3} Método de pago: ${metodoPago}` +
            (metodoPago === "Banco" && bancoSeleccionado
                ? `\n\u{1F3E6} Banco: ${bancoSeleccionado.Banco}\n\u{1F4B3} Cuenta: ${bancoSeleccionado.Cuenta}`
                : "") +
            `\n\n\u{26A0}\uFE0F El siguiente paso es enviar foto del comprobante de pago por aquí.`
        );

        const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile) {
          window.location.href = `whatsapp://send?phone=${whatsappNumber}&text=${mensaje}`;
        } else {
          window.open(`https://wa.me/${whatsappNumber}?text=${mensaje}`, "_blank");
        }

        try {
          // Recargar boletos normales
          const responseBoletos = await fetch("/api/ticketBuy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          const dataBoletos = await responseBoletos.json();
          setBoletos(dataBoletos.result || []);

          // Recargar boletos online
          const fechaFormateada = prizes.Fecha.split('T')[0];
          const responseOnline = await fetch(`/api/boletosOnline?fecha=${fechaFormateada}`);
          const dataOnline = await responseOnline.json();
          if (dataOnline.success) {
            setBoletosOnline(dataOnline.boletos || []);
          }
        } catch (error) {
          console.error("Error recargando datos:", error);
        }

        Swal.fire({
          icon: "success",
          title: "Compra registrada 🎉",
          text: "Revisa tu WhatsApp 📲",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error("Error confirmVenta Especial Online:", err);
      Swal.fire("⚠️ Error de conexión con el servidor");
    }

    setIsLoading(false);
    setPreviewModal(false);
    setTicketNumber("");
    setName("");
  };

  // Formatear fecha para mostrar
  const fechaFormateada = prizes
    ? new Date(
        new Date(prizes.Fecha).getTime() + new Date().getTimezoneOffset() * 60000
      ).toLocaleDateString()
    : "";

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-purple-800">Compra de Boletos Especiales</h1>
          <button
            onClick={goToMenu}
            className="bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 transition duration-200"
          >
            <FaHome size={24} />
          </button>
        </div>
        
        {/* Información del sorteo especial */}
        {prizes && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="font-semibold text-purple-700">SORTEO ESPECIAL</div>
              <div className="text-lg font-bold">{fechaFormateada}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="font-semibold text-green-700">1er PREMIO</div>
              <div className="text-lg font-bold">${prizes.Primerpremio}</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="font-semibold text-orange-700">2do PREMIO</div>
              <div className="text-lg font-bold">${prizes.Segundopremio}</div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6 text-center text-purple-700">
          Seleccionar Boleto Especial
        </h2>
        
        {/* Estado de disponibilidad */}
        <div className="mb-6 text-center">
          {foundTope !== null ? (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
              ⚠️ Boleto no disponible
            </div>
          ) : ticketNumber ? (
            <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg">
              ✅ Boleto disponible
            </div>
          ) : (
            <div className="bg-blue-100 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
              🔍 Ingresa un número de boleto
            </div>
          )}
        </div>

        {/* Formulario de compra */}
        <div className="space-y-4">
          {/* Número de boleto */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número del Boleto (3 dígitos)
            </label>
            
            {/* Input principal - Mejorado para móviles */}
            <div className="flex flex-col sm:flex-row gap-3 mb-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={ticketNumber}
                  onChange={handleTicketNumberChange}
                  onBlur={handleBlur}
                  maxLength={3}
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg text-center text-xl sm:text-2xl font-bold focus:border-blue-500 focus:outline-none"
                  placeholder="000"
                />
              </div>
              
              {/* En pantallas grandes: botón de Azar al lado */}
              <div className="hidden sm:flex gap-2">
                <button
                  onClick={getRandomNumberEspecialOnline}
                  disabled={isLoading}
                  className={`bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition duration-200 flex flex-col items-center justify-center ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  title="Generar número aleatorio"
                >
                  <FaDice className={`${isLoading ? "animate-spin" : ""} text-xl`} />
                  <span className="text-xs mt-1">Azar</span>
                </button>
              </div>
            </div>

            {/* En pantallas móviles: botón de Azar debajo */}
            <div className="sm:hidden flex justify-center">
              <button
                onClick={getRandomNumberEspecialOnline}
                disabled={isLoading}
                className={`bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition duration-200 flex items-center gap-2 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                title="Generar número aleatorio"
              >
                <FaDice className={`${isLoading ? "animate-spin" : ""}`} />
                <span>Generar Número Aleatorio</span>
              </button>
            </div>
          </div>

          {/* Precio FIJO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio ($)
            </label>
            <input
              type="text"
              value={precioFijo ? `$${precioFijo}` : "Cargando..."}
              readOnly
              disabled
              className="w-full p-4 border border-gray-300 rounded-lg bg-gray-100 text-center font-bold focus:outline-none"
            />
            <div className="mt-1 text-sm text-gray-500 text-center">
              Precio establecido
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del jugador
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder="Ingresa tu nombre completo"
            />
          </div>

          {/* Botones de acción */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <button
              onClick={() => setShowDisponibles(true)}
              className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold"
            >
              Ver Disponibles
            </button>
            <button
              onClick={enviarDatosNormal}
              className="bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition duration-200 font-semibold"
            >
              Comprar Boleto
            </button>
          </div>
        </div>

        {/* Información importante */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">📌 Información importante:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Los boletos especiales son únicos por número</li>
            <li>• Todos los boletos tiene Precio establecido</li>
            <li>• Verifica disponibilidad antes de comprar</li>
          </ul>
        </div>
      </div>

      {/* Modales */}
      {showDisponibles && (
        <EspecialBoletosDisponiblesModalOnline
          tickets={{
            boletosNormal: boletos, 
            boletosOnline: boletosOnline 
          }}
          onClose={() => setShowDisponibles(false)}
        />
      )}
      
      {previewModal && (
        <EspecialPreviewModalOnline
          onClose={() => setPreviewModal(false)}
          onConfirm={confirmVenta}
        />
      )}
    </div>
  );
};

export default CompraOnlineEspecial;