'use client'
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaHome, FaDice, FaForward } from "react-icons/fa";
import { TbSquarePlus } from "react-icons/tb";
import Swal from "sweetalert2";
import { ErrorPrizes, ErrorTope, loading, ValidateBox } from "../alerts/menu/Alerts";
import TicketPreviewModalOnline from "./TicketPreviewModalOnline";

const CompraOnline = ({ sorteoId }) => {
  // Estados principales
  const [topePermitido, setTopePermitido] = useState(0);
  const [ticketNumber, setTicketNumber] = useState("");
  const [foundTope, setFoundTope] = useState(null);
  const [prizebox, setPrizebox] = useState("");
  const [name, setName] = useState("");
  const [prizeboxError, setPrizeboxError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const router = useRouter();
  const [cantidad, setCantidad] = useState(0);
  const [tickets, setTickets] = useState([]);
  const [numberTop, setNumberTop] = useState(0);
  const [topes, setTopes] = useState({});
  const [isGeneratingRandom, setIsGeneratingRandom] = useState(false);
  const [sorteos, setSorteos] = useState([]);
  const [selectedSorteo, setSelectedSorteo] = useState(null);
  const [avanceIndex, setAvanceIndex] = useState(0); 
  const [originalSorteo, setOriginalSorteo] = useState(null);
  const [tipoCompra, setTipoCompra] = useState("normal");
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  // Cargar sorteo seleccionado desde localStorage
  useEffect(() => {
    const cargarSorteoSeleccionado = () => {
      try {
        const sorteoGuardado = localStorage.getItem('sorteoSeleccionado');
        if (sorteoGuardado) {
          const sorteo = JSON.parse(sorteoGuardado);
          setSelectedSorteo(sorteo);
          setOriginalSorteo(sorteo);
          
          // También cargar la lista de sorteos para el avance
          fetch("/api/nextLotteries")
            .then((res) => res.json())
            .then((data) => {
              setSorteos(data.result || []);
            });
        }
      } catch (error) {
        console.error("Error cargando sorteo seleccionado:", error);
      }
    };

    cargarSorteoSeleccionado();
  }, []);

  const currentHour = new Date().getHours();

  // Loading state
  if (!selectedSorteo) {
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

  // FUNCIONES PRINCIPALES

  const handleTicketNumberChange = async (e) => {
    let value = e.target.value;
    if (!/^[0-9]*$/.test(value)) {
      value = value.slice(0, -1);
    }
    setTicketNumber(value);
    value = value.padStart(3, "0");
  };

  // Usar selectedSorteo para la fecha y formattedFecha
  const fecha = selectedSorteo
    ? new Date(
        new Date(selectedSorteo.Fecha).getTime() +
          new Date().getTimezoneOffset() * 60000
      ).toLocaleDateString()
    : "";
  const [day, month, year] = fecha.split("/").map((num) => num.padStart(2, "0"));
  const formattedFecha = `${day}/${month}/${year}`;

  // Función para obtener un número aleatorio disponible
  const getRandomNumber = async () => {
    try {
      setIsGeneratingRandom(true);

      const response = await fetch("/api/topes", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fecha: formattedFecha }),
      });

      const data = await response.json();

      if (data.success) {
        const numeroFormateado = data.numero.toString().padStart(3, "0");
        setTicketNumber(numeroFormateado);
        setPrizebox("10");
        setName("Trébol de la Suerte");
        setPrizeboxError(null);

        const event = { target: { value: numeroFormateado } };
        handleBlur(event);

        Swal.fire({
          icon: "success",
          title: "Número aleatorio generado",
          text: `Número: ${numeroFormateado}\nDisponibles: ${data.disponibles} de ${data.tope}`,
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "No se pudo generar un número aleatorio",
        });
      }
    } catch (error) {
      console.error("Error al obtener número aleatorio:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al conectar con el servidor",
      });
    } finally {
      setIsGeneratingRandom(false);
    }
  };

  const handleBlur = async (e) => {
    let value = e.target.value;
    value = value.padStart(3, "0");
    setTicketNumber(value);

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ticketNumber: value, fecha: formattedFecha }),
    };

    try {
      const response = await fetch("/api/topes", options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data.tope)) {
        const matchingTope = data.tope.find(
          (tope) => tope.Numero === Number(value)
        );

        if (matchingTope) {
          setFoundTope(matchingTope.Tope);
          setCantidad(matchingTope.Cantidad);
          setNumberTop(matchingTope.Numero);
          setTopes((prevTopes) => ({
            ...prevTopes,
            [matchingTope.Numero]: matchingTope.Cantidad,
          }));
        } else {
          setFoundTope(null);
        }
      } else {
        setFoundTope(null);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const idVendedor = userData.Idvendedor;
  const idSorteo = selectedSorteo?.Idsorteo;

  const Validate = () => {
    if (foundTope == 0) {
      if (cantidad >= foundTope) {
        Swal.fire(`No se pueden vender más boletos de este número`);
        setTicketNumber("");
        setPrizebox("");
        return false;
      }
    }

    if (prizeboxError) {
      ErrorPrizes();
      setPrizebox("");
      return false;
    }
    return true;
  };

  // Agregar al carrito con fecha específica
  const addTicketToList = (tipo = "normal", seriePadre = null) => {
    if (!Validate()) {
      return false;
    }

    // Obtener fecha formateada del sorteo ACTUAL
    const fechaActual = selectedSorteo
      ? new Date(
          new Date(selectedSorteo.Fecha).getTime() +
            new Date().getTimezoneOffset() * 60000
        ).toLocaleDateString()
      : "";
    const [day, month, year] = fechaActual.split("/").map((num) => num.padStart(2, "0"));
    const formattedFechaActual = `${day}/${month}/${year}`;

    // Filtrar boletos con el mismo número de tope Y MISMA FECHA
    const boletosConMismoTope = tickets.filter((ticket) => {
      return parseInt(ticket.numero) === numberTop && 
            ticket.fechaSorteo === formattedFechaActual;
    });

    // Calcular la cantidad acumulada de boletos en la lista PARA ESTA FECHA
    const totalAcumulado = boletosConMismoTope.reduce((acc, ticket) => {
      return acc + parseInt(ticket.precio);
    }, 0);
    const nuevaCantidad = totalAcumulado + cantidad + parseInt(prizebox);

    if (foundTope > 0) {
      if (nuevaCantidad > foundTope) {
        Swal.fire(
          `La cantidad permitida es ${(totalAcumulado + cantidad - foundTope) * -1
          }. Te estás pasando en ${nuevaCantidad - foundTope} pesos.`
        );
        setPrizebox("");
        return false;
      }
    } else if (foundTope === 0) {
      ErrorTope();
      setTicketNumber("");
      return false;
    }

    // Agregar el boleto actual a la lista de boletos acumulados
    if (ticketNumber && prizebox && name) {
      const precio = tipo === "serie" ? parseInt(prizebox) / 10 : parseInt(prizebox);
      const nuevoTicket = {
        id: Date.now() + Math.random(),
        numero: ticketNumber,
        precio: precio,
        cantidad: 1,
        subtotal: precio,
        comprador: name,
        tipo: tipo,
        seriePadre: seriePadre,
        // GUARDAR INFORMACIÓN DEL SORTEO ACTUAL - SOLO FECHA
        idSorteo: selectedSorteo?.Idsorteo,
        fechaSorteo: selectedSorteo?.Fecha ? selectedSorteo.Fecha.split('T')[0] : '',
        // FORMATEAR fechaDisplay para que sea solo la fecha
        fechaDisplay: selectedSorteo?.Fecha ? selectedSorteo.Fecha.split('T')[0] : formattedFechaActual,
        tipoSorteo: selectedSorteo?.Tipo_sorteo,
        primerPremio: selectedSorteo?.Primerpremio,
        segundoPremio: selectedSorteo?.Segundopremio
      };

      setTickets((prevTickets) => [...prevTickets, nuevoTicket]);
      
      if (tipo === "normal") {
        setTicketNumber("");
        setPrizebox("");
        setName("");
      }
      return true;
    }
    return false;
  };

  // Comprar Normal - Agrega automáticamente al carrito
  const enviarDatosNormal = async (e) => {
    e.preventDefault();
    
    if (!ticketNumber || !prizebox || !name) {
      ValidateBox();
      return;
    }

    if (!Validate()) {
      return;
    }

    // Agregar al carrito como NORMAL
    if (addTicketToList("normal")) {
      Swal.fire({
        icon: "success",
        title: "¡Agregado!",
        text: "Boleto normal agregado al carrito",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  // Comprar Serie - Agrega automáticamente al carrito
  const enviarDatosSerie = async (e) => {
    e.preventDefault();
    if (!prizebox || !name || !ticketNumber) {
      ValidateBox();
      return;
    }

    if (parseInt(prizebox) < 100 || parseInt(prizebox) % 100 !== 0) {
      Swal.fire({
        icon: "error",
        title: "Monto inválido",
        text: "Para series, el monto debe ser mínimo 100 pesos y múltiplo de 100",
      });
      return;
    }

    if (!Validate()) {
      return;
    }

    // OBTENER INFORMACIÓN DEL SORTEO ACTUAL PARA LAS SERIES
    const fechaActual = selectedSorteo
      ? new Date(
          new Date(selectedSorteo.Fecha).getTime() +
            new Date().getTimezoneOffset() * 60000
        ).toLocaleDateString()
      : "";
    const [day, month, year] = fechaActual.split("/").map((num) => num.padStart(2, "0"));
    const formattedFechaActual = `${day}/${month}/${year}`;

    // AGREGAR SERIE COMPLETA AL CARRITO
    const numTickets = 10;
    const ticketNumbers = Array.from({ length: numTickets }, (_, i) => {
      let ticket = Number(ticketNumber) + 100 * i;
      if (ticket >= 1000) ticket = ticket - 1000;
      return ticket.toString().padStart(3, "0");
    });

    // AGREGAR CADA BOLETO DE LA SERIE CON INFORMACIÓN DEL SORTEO
    ticketNumbers.forEach((tn, index) => {
      const nuevoTicket = {
        id: Date.now() + index,
        numero: tn,
        precio: prizebox / 10, // Precio unitario
        cantidad: 1,
        subtotal: prizebox / 10,
        comprador: name,
        tipo: "serie",
        seriePadre: ticketNumber, // Número base de la serie
        // INFORMACIÓN DEL SORTEO PARA CADA BOLETO DE SERIE
        idSorteo: selectedSorteo?.Idsorteo,
        fechaSorteo: selectedSorteo?.Fecha ? selectedSorteo.Fecha.split('T')[0] : '',
        fechaDisplay: selectedSorteo?.Fecha ? selectedSorteo.Fecha.split('T')[0] : formattedFechaActual,
        tipoSorteo: selectedSorteo?.Tipo_sorteo,
        primerPremio: selectedSorteo?.Primerpremio,
        segundoPremio: selectedSorteo?.Segundopremio
      };
      setTickets(prev => [...prev, nuevoTicket]);
    });

    // Limpiar campos
    setTicketNumber("");
    setPrizebox("");
    setName("");
    
    Swal.fire({
      icon: "success",
      title: "Serie agregada",
      text: `10 boletos de serie agregados al carrito`,
      timer: 2000,
      showConfirmButton: false,
    });
  };

  // Proceder al pago
  const procederAlPago = () => {
    if (tickets.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Carrito vacío",
        text: "Agrega boletos al carrito primero",
      });
      return;
    }
    setShowPreview(true);
  };

  // Confirmar venta - Usar fecha específica de cada boleto
  const confirmVenta = async ({ telefono, metodoPago, bancoSeleccionado }) => {
    setIsLoading(true);

    try {
      // SEPARAR boletos normales y series
      const boletosNormales = tickets.filter(t => t.tipo === "normal");
      const boletosSeries = tickets.filter(t => t.tipo === "serie");
      
      let boletosPayload = [];

      // Procesar SERIES (agrupar por seriePadre Y FECHA)
      const seriesAgrupadas = {};
      boletosSeries.forEach(boleto => {
        const key = `${boleto.seriePadre}-${boleto.fechaSorteo}`; // ✅ Incluir fecha en la clave
        if (!seriesAgrupadas[key]) {
          seriesAgrupadas[key] = [];
        }
        seriesAgrupadas[key].push(boleto);
      });

      // Agregar series al payload
      Object.values(seriesAgrupadas).forEach(serie => {
        serie.forEach((boleto, index) => {
          boletosPayload.push({
            idSorteo: boleto.idSorteo,
            ticketNumber: boleto.numero,
            prizebox: boleto.precio,
            name: boleto.comprador,
            tipoSorteo: "serie",
            fecha: boleto.fechaSorteo, // Usar fechaSorteo del boleto
            primerPremio: boleto.primerPremio,
            segundoPremio: boleto.segundoPremio,
            cantidadBoletos: 1,
            esSerie: true,
            serieIndex: index
          });
        });
      });

      // Agregar boletos normales al payload
      boletosNormales.forEach(t => {
        boletosPayload.push({
          idSorteo: t.idSorteo,
          ticketNumber: t.numero,
          prizebox: t.precio,
          name: t.comprador,
          tipoSorteo: "normal",
          fecha: t.fechaSorteo, // Usar fechaSorteo del boleto
          primerPremio: t.primerPremio,
          segundoPremio: t.segundoPremio,
          cantidadBoletos: 1,
          esSerie: false
        });
      });

      const res = await fetch("/api/boletosOnline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boletos: boletosPayload,
          telefono,
          metodo_pago: metodoPago,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Construir mensaje WhatsApp agrupado por fecha
        let mensaje = `\u{1F39F}\uFE0F *Compra Online - Múltiples Sorteos* \u{1F39F}\uFE0F\n\n`;

        // Agrupar boletos por fecha de sorteo
        const boletosPorFecha = {};
        tickets.forEach(boleto => {
          if (!boletosPorFecha[boleto.fechaSorteo]) {
            boletosPorFecha[boleto.fechaSorteo] = [];
          }
          boletosPorFecha[boleto.fechaSorteo].push(boleto);
        });

        // Mostrar boletos agrupados por fecha
        Object.entries(boletosPorFecha).forEach(([fecha, boletos]) => {
          const fechaDisplay = boletos[0].fechaDisplay || fecha;
          mensaje += `\u{1F4C5} *Sorteo: ${fechaDisplay}*\n`;
          
          // Agrupar series en esta fecha
          const seriesEnFecha = {};
          const normalesEnFecha = [];
          
          boletos.forEach(b => {
            if (b.tipo === "serie") {
              const key = b.seriePadre;
              if (!seriesEnFecha[key]) seriesEnFecha[key] = [];
              seriesEnFecha[key].push(b);
            } else {
              normalesEnFecha.push(b);
            }
          });

          // Mostrar series
          Object.values(seriesEnFecha).forEach(serie => {
            const primerBoleto = serie[0];
            const ultimoBoleto = serie[serie.length - 1];
            const totalSerie = serie.reduce((sum, b) => sum + b.precio, 0);
            mensaje += `   ➡️ Serie: ${primerBoleto.numero} - ${ultimoBoleto.numero}\n`;
            mensaje += `   \u{1F4E6} Cantidad: ${serie.length} boletos\n`;
            mensaje += `   \u{1F4B0} Total: $${totalSerie}\n`;
            mensaje += `   \u{1F464} Nombre: ${primerBoleto.comprador}\n\n`;
          });

          // Mostrar boletos normales
          normalesEnFecha.forEach(b => {
            mensaje += `   ➡️ Boleto: ${b.numero}\n`;
            mensaje += `   \u{1F4B0} Precio: $${b.precio}\n`;
            mensaje += `   \u{1F464} Nombre: ${b.comprador}\n\n`;
          });
        });

        // Información común
        mensaje += `\u{1F4DE} Teléfono: ${telefono}\n\u{1F4B3} Método de pago: ${metodoPago}`;
        
        if (metodoPago === "Banco" && bancoSeleccionado) {
          mensaje += `\n\u{1F3E6} Banco: ${bancoSeleccionado.Banco}\n\u{1F4B3} Cuenta: ${bancoSeleccionado.Cuenta}`;
        }
        
        mensaje += `\n\n\u{26A0}\uFE0F El siguiente paso es enviar foto del comprobante de pago por aquí.`;

        const mensajeCodificado = encodeURIComponent(mensaje);

        if (!whatsappNumber) {
          Swal.fire("⚠️ No se ha configurado el número de WhatsApp");
          return;
        }

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile) {
          window.location.href = `whatsapp://send?phone=${whatsappNumber}&text=${mensajeCodificado}`;
        } else {
          window.open(`https://wa.me/${whatsappNumber}?text=${mensajeCodificado}`, "_blank");
        }

        Swal.fire({
          icon: "success",
          title: "Compra registrada",
          text: `Boletos guardados para ${Object.keys(boletosPorFecha).length} sorteo(s)`,
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        console.error("Respuesta backend:", data);
        Swal.fire("Error al guardar la compra online");
      }
    } catch (err) {
      console.error("Error confirmVenta:", err);
      Swal.fire("Error de conexión con el servidor");
    }

    setIsLoading(false);
    setTickets([]);
    setShowPreview(false);
    setTicketNumber("");
    setPrizebox("");
    setName("");
  };

  const handlePrizeboxChange = (e) => {
    let value = e.target.value;
    setPrizebox(value);
    if (value % 10 !== 0) {
      setPrizeboxError("El precio debe ser un múltiplo de 10");
    } else {
      setPrizeboxError(null);
    }
  };

  if (isLoading) {
    loading();
  }

  const goToMenu = () => {
    router.push("/OnlineHome");
  };

  const handleDeleteTicket = (index) => {
    setTickets((prevTickets) => prevTickets.filter((_, i) => i !== index));
  };

  const diasSemana = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

  // Función de avance
  const handleSelectSorteoAvance = async () => {
    if (!sorteos.length) return;
    const inputOptions = sorteos.reduce((opts, s, idx) => {
      let label = s.Fecha;
      try {
        const fechaObj = new Date(s.Fecha);
        label = fechaObj.toLocaleDateString("es-MX", {
          weekday: "long",
          day: "numeric",
          month: "long",
          timeZone: "UTC",
        });
        label = label.charAt(0).toUpperCase() + label.slice(1);
      } catch (e) {
        label = s.Fecha;
      }
      opts[idx] = label;
      return opts;
    }, {});

    let showRevert = avanceIndex !== 0;
    let html = showRevert
      ? '<button id="revertSorteo" class="swal2-confirm swal2-styled" style="margin-bottom:10px;background:#4b5563;">Revertir a sorteo original</button><br/>'
      : "";
    const { value: idx } = await Swal.fire({
      title: "Sorteo en avance",
      html: html + "<div id='selectSorteoAvance'></div>",
      input: "select",
      inputOptions,
      inputPlaceholder: "Selecciona el sorteo",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        if (showRevert) {
          document.getElementById("revertSorteo").onclick = () => {
            setSelectedSorteo(originalSorteo);
            setAvanceIndex(0);
            Swal.close();
            Swal.fire({ icon: "success", title: "Sorteo original restaurado", timer: 1200, showConfirmButton: false });
          };
        }
      },
    });
    if (idx !== undefined && idx !== null && idx !== "") {
      setSelectedSorteo(sorteos[idx]);
      setAvanceIndex(Number(idx));
      Swal.fire({ icon: "success", title: "Sorteo cambiado", timer: 1200, showConfirmButton: false });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header moderno */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Compra de Boletos Online</h1>
          <button
            onClick={goToMenu}
            className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition duration-200"
          >
            <FaHome size={24} />
          </button>
        </div>
        
        {/* Información del sorteo */}
        {selectedSorteo && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="font-semibold text-blue-700">SORTEO</div>
              <div className="text-lg">{fecha}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="font-semibold text-green-700">1er PREMIO</div>
              <div className="text-lg">${selectedSorteo.Primerpremio}</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="font-semibold text-orange-700">2do PREMIO</div>
              <div className="text-lg">${selectedSorteo.Segundopremio}</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de selección - IZQUIERDA */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Seleccionar Boleto</h2>
          
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
              
              {/* En pantallas grandes: botones al lado */}
              <div className="hidden sm:flex gap-2">
                <button
                  onClick={getRandomNumber}
                  disabled={isGeneratingRandom}
                  className={`bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition duration-200 flex flex-col items-center justify-center ${
                    isGeneratingRandom ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  title="Generar número aleatorio"
                >
                  <FaDice className={`${isGeneratingRandom ? "animate-spin" : ""} text-xl`} />
                  <span className="text-xs mt-1">Azar</span>
                </button>
                
                <button
                  onClick={handleSelectSorteoAvance}
                  className="bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700 transition duration-200 flex flex-col items-center justify-center"
                  title="Sorteo en avance"
                >
                  <FaForward className="text-xl" />
                  <span className="text-xs mt-1">Avance</span>
                </button>
              </div>
            </div>
            
            {/* En pantallas pequeñas: botones debajo */}
            <div className="sm:hidden grid grid-cols-2 gap-3">
              <button
                onClick={getRandomNumber}
                disabled={isGeneratingRandom}
                className={`bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-200 flex items-center justify-center gap-2 ${
                  isGeneratingRandom ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <FaDice className={`${isGeneratingRandom ? "animate-spin" : ""}`} />
                <span className="text-sm font-semibold">Azar</span>
              </button>
              
              <button
                onClick={handleSelectSorteoAvance}
                className="bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition duration-200 flex items-center justify-center gap-2"
              >
                <FaForward />
                <span className="text-sm font-semibold">Avance</span>
              </button>
            </div>
            
            {/* Información de tope */}
            {foundTope !== null && (
              <div className="mt-2 text-sm text-blue-600 font-medium">
                Tope permitido: ${foundTope - cantidad}
              </div>
            )}
          </div>

          {/* Precio */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio ($)
            </label>
            <input
              type="number"
              value={prizebox}
              onChange={(e) => {
                const value = e.target.value;
                if (!/^[0-9]*$/.test(value)) {
                  e.target.value = value.slice(0, -1);
                }
                handlePrizeboxChange(e);
              }}
              maxLength={4}
              className="w-full p-4 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Ej: 50"
            />
            {prizeboxError && (
              <div className="mt-1 text-sm text-red-600">{prizeboxError}</div>
            )}
          </div>

          {/* Nombre */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del jugador
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Ingresa tu nombre completo"
            />
          </div>

          {/* Botones de Compra */}
          <div className="space-y-3">
            {/* Botones de Compra */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={enviarDatosNormal}
                className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold"
              >
                Comprar Normal
              </button>
              <button
                onClick={enviarDatosSerie}
                className="bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition duration-200 font-semibold"
              >
                Comprar Serie
              </button>
            </div>

            {/* Botón de Pago */}
            {tickets.length > 0 && (
              <button
                onClick={procederAlPago}
                className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 transition duration-200 font-semibold text-lg"
              >
                🛒 PAGAR ({tickets.length} boleto{tickets.length > 1 ? 's' : ''})
              </button>
            )}
          </div>
        </div>

        {/* Carrito - DERECHA */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Tu Carrito</h2>
          
          {tickets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🛒</div>
              <p>Tu carrito está vacío</p>
              <p className="text-sm">Selecciona &quot;Comprar Normal&quot; o &quot;Comprar Serie&quot;</p>            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                {tickets.map((ticket, index) => (
                  <div key={ticket.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition duration-200">
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-lg">#{ticket.numero}</span>
                          <span className="text-gray-600 ml-2">- ${ticket.precio}</span>
                          {ticket.tipo === "serie" && (
                            <span className="ml-2 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">Serie</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteTicket(index)}
                          className="text-red-500 hover:text-red-700 transition duration-200"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{ticket.comprador}</div>
                      {/* MOSTRAR INFORMACIÓN DEL SORTEO ESPECÍFICO */}
                      <div className="text-xs text-blue-600 mt-1">
                        Sorteo: {
                          ticket.fechaDisplay ? 
                          (() => {
                            const fecha = new Date(ticket.fechaDisplay + 'T12:00:00'); // Usar medio día para evitar cambios
                            return fecha.toLocaleDateString('es-MX', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit'
                            });
                          })() : 
                          ticket.fechaSorteo
                        } - {ticket.tipoSorteo}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-lg">Total:</span>
                  <span className="font-bold text-xl text-green-600">
                    ${tickets.reduce((total, ticket) => total + ticket.precio, 0)}
                  </span>
                </div>
                
                <div className="text-sm text-gray-500 text-center">
                  {tickets.length} boleto(s) en el carrito
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de preview */}
      {showPreview && (
        <TicketPreviewModalOnline
          tickets={tickets}
          onClose={() => setShowPreview(false)}
          onConfirm={confirmVenta}
          onDelete={handleDeleteTicket}
        />
      )}
    </div>
  );
};

export default CompraOnline;