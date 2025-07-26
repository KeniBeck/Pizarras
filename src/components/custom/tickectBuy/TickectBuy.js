import { PiNumberSquareOneFill } from "react-icons/pi";
import { PiNumberSquareTwoFill } from "react-icons/pi";
import { BsCalendarDateFill } from "react-icons/bs";
import { useEffect, useState } from "react";
import generatePDF from "./pdf";
import {
  ErrorPrizes,
  loading,
  ErrorTope,
  ValidateBox,
} from "../alerts/menu/Alerts";
import { useRouter } from "next/navigation";
import { FaHome, FaDice, FaForward } from "react-icons/fa";
import generatePDFSerie from "./pdfSerie";
import Swal from "sweetalert2";
import { TbSquarePlus } from "react-icons/tb";
import TicketPreviewModal from "./TicketPreviewModal";
import VailidationEstatus from "@/hook/validationEstatus";
import updateInfo from "../validation/updateInfo";

const TicketBuy = () => {
  const [prizes, setPrizes] = useState(null);
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
  const [avanceIndex, setAvanceIndex] = useState(0); // 0 = sorteo original
  const [originalSorteo, setOriginalSorteo] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/ticketBuy")
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => setPrizes(data.result[0])),
    ]).catch((error) => console.error("Error:", error));
  }, []);

  // Obtener sorteos activos para avance
  useEffect(() => {
    fetch("/api/nextLotteries")
      .then((res) => res.json())
      .then((data) => {
        setSorteos(data.result || []);
        setSelectedSorteo((data.result && data.result[0]) || null);
        setOriginalSorteo((data.result && data.result[0]) || null);
      });
  }, []);

  const currentHour = new Date().getHours();

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
  const handleTicketNumberChange = async (e) => {
    let value = e.target.value;
    if (!/^[0-9]*$/.test(value)) {
      value = value.slice(0, -1);
    }
    setTicketNumber(value);

    // Asegúrate de que el valor tenga una longitud de 3 caracteres
    value = value.padStart(3, "0");
  };

  // Usar selectedSorteo para la fecha y formattedFecha
  const fecha = selectedSorteo ? new Date(
    new Date(selectedSorteo.Fecha).getTime() + new Date().getTimezoneOffset() * 60000
  ).toLocaleDateString() : "";
  const [day, month, year] = fecha.split('/').map(num => num.padStart(2, '0'));
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
        // Formatear el número para que tenga 3 dígitos con ceros a la izquierda
        const numeroFormateado = data.numero.toString().padStart(3, '0');
        setTicketNumber(numeroFormateado);

        // Establecer valores predeterminados
        setPrizebox("10");
        setName("Trébol de la Suerte");

        // Limpiar errores de validación del precio
        setPrizeboxError(null);

        // Simular evento de blur para cargar la información del tope
        const event = { target: { value: numeroFormateado } };
        handleBlur(event);

        // Mostrar mensaje de éxito
        Swal.fire({
          icon: 'success',
          title: 'Número aleatorio generado',
          text: `Número: ${numeroFormateado}\nDisponibles: ${data.disponibles} de ${data.tope}`,
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'No se pudo generar un número aleatorio'
        });
      }
    } catch (error) {
      console.error("Error al obtener número aleatorio:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al conectar con el servidor'
      });
    } finally {
      setIsGeneratingRandom(false);
    }
  };

  const handleBlur = async (e) => {
    let value = e.target.value;
    // Asegúrate de que el valor sea un número y tenga una longitud de 3 caracteres
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
          setFoundTope(matchingTope.Tope); // Guarda el tope encontrado en el estado
          setCantidad(matchingTope.Cantidad);
          setNumberTop(matchingTope.Numero);
          setTopes((prevTopes) => ({
            ...prevTopes,
            [matchingTope.Numero]: matchingTope.Cantidad,
          }));
        } else {
          setFoundTope(null); // Si no se encuentra un tope, establece el estado a null
        }
      } else {
        setFoundTope(null);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const userData = JSON.parse(localStorage.getItem("userData"));
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

  const enviarDatosNormal = async () => {
    VailidationEstatus();
    if (tickets.length === 0 && (!prizebox || !name)) {
      ValidateBox();
      return;
    }
    if (tickets.length > 0) {
      setShowPreview(true);
    }
    if (!Validate()) {
      return;
    }

    if (!addTicketToList()) {
      return;
    }

    setShowPreview(true);
  };

  const confirmVenta = async () => {
    VailidationEstatus();
    setIsLoading(true);
    const ticketData = [];
    for (const ticket of tickets) {
      const data = {
        prizebox: ticket.price,
        name: ticket.name,
        ticketNumber: ticket.number,
        idVendedor,
        tipoSorteo: selectedSorteo.Tipo_sorteo,
        idSorteo: selectedSorteo.Idsorteo,
        topePermitido: foundTope - ticket.price,
        fecha: selectedSorteo.Fecha,
        primerPremio: selectedSorteo.Primerpremio,
        segundoPremio: selectedSorteo.Segundopremio,
      };
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      };
      await fetch("/api/sell", options)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            Swal.fire(data.error);
          } else if (data[0][0]) {
            ticketData.push(data[0][0]);
          }
        });
    }
    setIsLoading(false);
    setTickets([]);
    setTicketNumber("");
    setPrizebox("");
    setName("");
    generatePDF(ticketData, fecha);
    setShowPreview(false);
  };
  const enviarDatosSerie = async () => {
    if (!prizebox || !name) {
      ValidateBox();
      return;
    }

    if (parseInt(prizebox) < 100 || parseInt(prizebox) % 100 !== 0) {
      Swal.fire({
        icon: 'error',
        title: 'Monto inválido',
        text: 'Para series, el monto debe ser mínimo 100 pesos y múltiplo de 100 (100, 200, ...900)',
      });
      return;
    }

    if (!Validate()) {
      return;
    }
    setIsLoading(true);

    // Calcula la cantidad de boletos en la serie
    const numTickets = 10;

    // Genera los números de boleto en serie
    const ticketNumbers = Array.from({ length: numTickets }, (_, i) => {
      let ticket = Number(ticketNumber) + 100 * i;
      if (ticket >= 1000) {
        ticket = ticket - 1000;
      }
      return ticket.toString().padStart(3, "0");
    });

    const allTicketData = [];

    // Envía cada boleto al servidor
    for (const ticketNumber of ticketNumbers) {
      const data = {
        prizebox: prizebox / 10,
        name,
        ticketNumber,
        idVendedor,
        idSorteo: selectedSorteo.Idsorteo,
        topePermitido: foundTope - prizebox,
        fecha: selectedSorteo.Fecha,
        primerPremio: selectedSorteo.Primerpremio,
        segundoPremio: selectedSorteo.Segundopremio,
      };
      const options = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      };
      await fetch("/api/sell", options)
        .then((res) => res.json())
        .then((data) => {
          if (data[0]) {
            allTicketData.push(data[0][0]);
          }
        });
    }

    setIsLoading(false);
    setTicketNumber("");
    setPrizebox("");
    setName("");

    generatePDFSerie(allTicketData, fecha);
  };

  const handlePrizeboxChange = (e) => {
    let value = e.target.value;
    setPrizebox(value);
    // Verifica si el valor es un múltiplo de 10
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
    updateInfo(idVendedor).then(() => {
      router.push("/menu");
    });
  };

  const addTicketToList = () => {
    VailidationEstatus();
    if (!Validate()) {
      return false;
    }

    // Filtrar boletos con el mismo número de tope
    const boletosConMismoTope = tickets.filter((ticket) => {
      return parseInt(ticket.number) === numberTop;
    });

    // Calcular la cantidad acumulada de boletos en la lista
    const totalAcumulado = boletosConMismoTope.reduce((acc, ticket) => {
      return acc + parseInt(ticket.price);
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
      setTickets((prevTickets) => [
        ...prevTickets,
        { number: ticketNumber, price: prizebox, name },
      ]);
      setTicketNumber("");
      setPrizebox("");
      return true;
    }
  };
  const handlePlusTicket = () => {
    if (addTicketToList()) {
      console.log(tickets);
    }
  };
  const handleDeleteTicket = (index) => {
    setTickets((prevTickets) => prevTickets.filter((_, i) => i !== index));
  };

  const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  // Cambia el sorteo activo según el índice
  const handleSelectSorteoAvance = async () => {
    if (!sorteos.length) return;
      const inputOptions = sorteos.reduce((opts, s, idx) => {
      const [yyyy, mm, dd] = s.Fecha.split('-');
      const fechaObj = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      const dia = diasSemana[fechaObj.getDay()];
      const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      const mesNombre = meses[Number(mm) - 1];
      opts[idx] = `${dia} ${parseInt(dd, 10)} de ${mesNombre}`;
      return opts;
    }, {});

    // Si ya está en avance, mostrar opción de revertir
    let showRevert = avanceIndex !== 0;
    let html = showRevert ? '<button id="revertSorteo" class="swal2-confirm swal2-styled" style="margin-bottom:10px;background:#4b5563;">Revertir a sorteo original</button><br/>' : '';
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
            Swal.fire({ icon: 'success', title: 'Sorteo original restaurado', timer: 1200, showConfirmButton: false });
          };
        }
      }
    });
    if (idx !== undefined && idx !== null && idx !== "") {
      setSelectedSorteo(sorteos[idx]);
      setAvanceIndex(Number(idx));
      Swal.fire({ icon: 'success', title: 'Sorteo cambiado', timer: 1200, showConfirmButton: false });
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="max-w-sm mx-auto w-full bg-[rgb(38,38,38)]">
        <div className="text-2xl text-white flex justify-center items-center pb-4 pt-6 ">
          Boletos
        </div>
        <div className="w-full flex justify-center items-center flex-col space-y-1  relative">
          <label className="text-white text-xl flex justify-center items-center realative pr-8 ">
            <BsCalendarDateFill className="inline-block h-6 w-6 mr-1 text-red-600 " />{" "}
            Sorteo:{fecha}
          </label>
          <label className="text-white text-xl flex justify-center items-center relative">
            <PiNumberSquareOneFill className="text-red-600 inline-block h-6 w-6 mr-1" />
            Premio:{selectedSorteo?.Primerpremio}
          </label>
          <label className="text-white text-xl flex justify-center items-center  realative">
            <PiNumberSquareTwoFill className="inline-block h-6 w-6 mr-1 text-red-600" />{" "}
            Premio:{selectedSorteo?.Segundopremio}
          </label>
        </div>

        {foundTope !== null ? (
          <div className="text-xl text-red-500 text-center pt-6">
            Tope permitido: {foundTope - cantidad}
          </div>
        ) : (
          <div className="text-xl text-red-500 text-center pt-6"></div>
        )}

        <div className="flex mx-8 flex-col space-y-3 pt-6">
          {/* Fila de Boleto */}
          <div className="flex flex-row gap-12 relative">
            <div className="text-white flex justify-center items-center text-2xl w-[80px]">
              Boleto
            </div>
            <input
              className="bg-neutral-300 border rounded w-[150px] outline-none h-[40px] pl-10"
              value={ticketNumber}
              onChange={handleTicketNumberChange}
              onBlur={handleBlur}
              maxLength={3}
            />
            <button
              onClick={handlePlusTicket}
              className="absolute right-0 bg-green-700 text-white flex justify-center items-center rounded-lg h-[40px] w-[40px] text-4xl"
            >
              <TbSquarePlus />
            </button>
          </div>

          {/* Fila de Precio */}
          <div className="flex flex-row gap-12 relative">
            <div className="text-white flex justify-center items-center text-2xl w-[80px]">
              Precio
            </div>
            <input
              className="bg-neutral-300 border rounded w-[150px] outline-none h-[40px] pl-10"
              value={prizebox}
              onChange={(event) => {
                const value = event.target.value;
                if (!/^[0-9]*$/.test(value)) {
                  event.target.value = value.slice(0, -1);
                }
                handlePrizeboxChange(event);
              }}
              maxLength={4}
            />
          </div>

          {/* Fila de Nombre */}
          <div className="flex flex-row gap-12 relative">
            <div className="text-white flex justify-center items-center text-2xl w-[80px]">
              Nombre
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-neutral-300 border rounded w-[150px] outline-none h-[40px] pl-3"
            />
          </div>

          {/* Fila de botones Azar y Avance */}
          <div className="flex flex-row gap-4 justify-center items-center pt-2">
            <button
              onClick={getRandomNumber}
              disabled={isGeneratingRandom}
              className={`bg-blue-700 text-white flex flex-col justify-center items-center rounded-lg h-[56px] w-[56px] text-xl ${isGeneratingRandom ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Generar número aleatorio"
            >
              <FaDice className={`${isGeneratingRandom ? 'animate-spin' : ''} text-2xl`} />
              <span className="text-xs font-semibold mt-1">Azar</span>
            </button>
            <button
              onClick={handleSelectSorteoAvance}
              className="bg-gray-700 text-white flex flex-col justify-center items-center rounded-lg h-[56px] w-[56px] text-xl"
              title="Sorteo en avance"
            >
              <FaForward className="text-2xl" />
              <span className="text-xs font-semibold mt-1">Avance</span>
            </button>
          </div>
        </div>

        <div className="flex justify-center items-center flex-col space-y-2 pt-4 px-8">
          <button
            onClick={enviarDatosNormal}
            className="w-full rounded-lg bg-red-700 text-white h-[60px] text-xl"
          >
            Normal
          </button>
          <button
            onClick={enviarDatosSerie}
            className="w-full rounded-lg bg-red-700 text-white h-[60px] text-xl"
          >
            Serie
          </button>
        </div>

        <div className="flex justify-center items-center flex-col pt-2 px-8">
          <button
            onClick={() => router.push("/viewTickects")}
            className="w-full rounded-lg bg-red-700 text-white h-[60px] text-xl"
          >
            Revisar Boletos
          </button>
        </div>
      </div>
      <button
        onClick={goToMenu}
        className="fixed bottom-4 right-4 bg-red-700 text-white flex justify-center items-center rounded-full w-[60px] h-[60px] text-3xl"
      >
        <FaHome />
      </button>

      {showPreview && (
        <TicketPreviewModal
          tickets={tickets}
          onClose={() => setShowPreview(false)}
          onConfirm={confirmVenta}
          onDelete={handleDeleteTicket}
        />
      )}
    </div>
  );
};

export default TicketBuy;