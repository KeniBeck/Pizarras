"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaHome, FaPrint } from "react-icons/fa";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import "jspdf-autotable";
import generatePDFBoxCutWeek from "./pdfBoxCutWeek";
import generatePDFBoxCutDay from "./pdfBoxCutDay";

// Función para obtener la fecha actual en zona horaria de México
function getFreshMexicoDate() {
  // Usar toLocaleString para obtener la fecha en la zona horaria de México
  // y luego crear un nuevo objeto Date a partir de esa cadena
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
}

const diasSemana = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

function getNombreDia(fechaStr) {
  const fecha = new Date(fechaStr);
  return diasSemana[fecha.getDay()];
}

function getMondayAndSundayOfCurrentWeek() {
  // Get current date in Mexico City timezone
  const nowMX = getFreshMexicoDate();
  console.log('Current date for week range (Mexico timezone):', nowMX.toString());
  
  const day = nowMX.getDay();
  // Lunes = 1, Domingo = 0
  const diffToMonday = day === 0 ? -6 : 1 - day;
  
  const monday = new Date(nowMX);
  monday.setDate(nowMX.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  // Formato YYYY-MM-DD
  const formatDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const mondayStr = formatDate(monday);
  const sundayStr = formatDate(sunday);
  
  console.log('Week range:', mondayStr, 'to', sundayStr);
  
  return {
    monday: mondayStr,
    sunday: sundayStr,
  };
}

// Utilidades para fechas
function getLastNDays(n) {
  const days = [];
  
  // Create a fresh Date object in Mexico timezone
  const nowMX = getFreshMexicoDate();
  
  // Log current date and time for debugging
  console.log('Current date in Mexico timezone:', nowMX.toString());
  
  // Format the date manually for consistency
  const year = nowMX.getFullYear();
  const month = String(nowMX.getMonth() + 1).padStart(2, '0');
  const day = String(nowMX.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;
  
  console.log('Today formatted (YYYY-MM-DD):', todayStr);
  
  for (let i = n - 1; i >= 0; i--) {
    // Create a new date for each day calculation to avoid reference issues
    const d = new Date(nowMX.getTime());
    d.setDate(nowMX.getDate() - i);
    
    // Format as YYYY-MM-DD manually to ensure consistency
    const dateYear = d.getFullYear();
    const dateMonth = String(d.getMonth() + 1).padStart(2, '0');
    const dateDay = String(d.getDate()).padStart(2, '0');
    const dateStr = `${dateYear}-${dateMonth}-${dateDay}`;
    
    days.push({
      date: dateStr,
      label: dateStr === todayStr ? "HOY" : diasSemana[d.getDay()],
    });
  }
  
  return days;
}

// Devuelve las últimas 3 semanas basadas en la fecha actual
function getLastNWeeks(n) {
  const weeks = [];
  
  // Crear una fecha nueva en zona horaria de México
  const nowMX = getFreshMexicoDate();
  console.log('Current date for weeks (Mexico timezone):', nowMX.toString());
  
  const dayOfWeek = nowMX.getDay(); // 0-6 (0 es domingo)
  console.log('Day of week:', dayOfWeek, '(', diasSemana[dayOfWeek], ')');
  
  // Calcular días para llegar al lunes más reciente (día inicial de la semana)
  // Si hoy es lunes (1), diff = 0
  // Si hoy es domingo (0), diff = -6 (retroceder 6 días)
  // Para cualquier otro día (2-6), diff = 1 - dayOfWeek (retroceder los días necesarios)
  const diffToMonday = dayOfWeek === 1 ? 0 : dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  console.log('Difference to Monday:', diffToMonday);
  
  // Obtener el lunes de la semana actual
  const currentWeekStart = new Date(nowMX);
  currentWeekStart.setDate(nowMX.getDate() + diffToMonday);
  currentWeekStart.setHours(0, 0, 0, 0);
  console.log('Current week start (Monday):', currentWeekStart.toString());
  
  // Meses en español abreviados
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  
  for (let i = 0; i < n; i++) {
    // Calcular inicio de semana (lunes) restando 7 días por cada semana anterior
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(currentWeekStart.getDate() - (7 * i));
    
    // Calcular fin de semana (domingo)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // 6 días después del lunes = domingo
    
    // Formatear fechas en el formato deseado (dd-mmm)
    const startDay = weekStart.getDate().toString().padStart(2, '0');
    const startMonth = meses[weekStart.getMonth()];
    const startFormatted = `${startDay}-${startMonth}`;
    
    const endDay = weekEnd.getDate().toString().padStart(2, '0');
    const endMonth = meses[weekEnd.getMonth()];
    const endFormatted = `${endDay}-${endMonth}`;
    
    // Calcular también las fechas en formato YYYY-MM-DD para la API
    const startYear = weekStart.getFullYear();
    const startMonthNum = String(weekStart.getMonth() + 1).padStart(2, '0');
    const startDateISO = `${startYear}-${startMonthNum}-${startDay}`;
    
    const endYear = weekEnd.getFullYear();
    const endMonthNum = String(weekEnd.getMonth() + 1).padStart(2, '0');
    const endDateISO = `${endYear}-${endMonthNum}-${endDay}`;
    
    weeks.push({
      start: startFormatted,
      end: endFormatted,
      startDate: startDateISO, // Fecha en formato YYYY-MM-DD para la API
      endDate: endDateISO,     // Fecha en formato YYYY-MM-DD para la API
      label: `Semana ${i === 0 ? 'actual' : i === 1 ? 'pasada' : 'antepasada'}`
    });
  }
  
  console.log('Generated weeks:', weeks);
  return weeks;
}

function formatDayMonth(fechaStr) {
  // Si ya viene formateada como "dd-mmm", la devolvemos tal cual
  if (typeof fechaStr === 'string' && fechaStr.match(/^\d{2}-[a-z]{3}$/)) {
    return fechaStr;
  }
  
  let fechaMX;
  
  // Convert to Mexico timezone
  if (typeof fechaStr === 'string') {
    if (fechaStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Si es formato YYYY-MM-DD, creamos una fecha y la ajustamos a la zona horaria de México
      const [year, month, day] = fechaStr.split('-');
      // Create a date string that JS will interpret in local timezone
      const dateStr = `${year}-${month}-${day}T12:00:00`; // Noon to avoid DST issues
      const tmpDate = new Date(dateStr);
      fechaMX = new Date(tmpDate.toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
    } else {
      // Para otros formatos de string
      const tmpDate = new Date(fechaStr);
      fechaMX = new Date(tmpDate.toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
    }
  } else {
    // Si ya es un objeto Date
    fechaMX = new Date(fechaStr.toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
  }
  
  // Formatear día y mes según el requisito (formato "26-jul")
  const day = fechaMX.getDate().toString().padStart(2, '0');
  
  // Obtener abreviatura del mes en español
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const mes = meses[fechaMX.getMonth()];
  
  const result = `${day}-${mes}`;
  console.log(`formatDayMonth: ${fechaStr} → ${result}`);
  
  return result;
}

// Devuelve la fecha en formato YYYY-MM-DD en horario de México
function getFechaMX(date = new Date()) {
  // Handle string dates by converting to Date object first
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  // Get the date components in Mexico timezone
  const mx = new Date(date.toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
  
  // Format as YYYY-MM-DD manually to ensure consistency
  const year = mx.getFullYear();
  const month = String(mx.getMonth() + 1).padStart(2, '0');
  const day = String(mx.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// Función para obtener la fecha correcta para mostrar el fin de semana
function getEndDisplayDate(endDate) {
  // Aseguramos que se muestre correctamente el domingo
  return endDate;
}

const BoxCutLotery = () => {
  const [userData, setUserData] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const router = useRouter();
  const backgroundImage = "/Sencillo.png";
  const { monday, sunday } = getMondayAndSundayOfCurrentWeek();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const localUserData = JSON.parse(localStorage.getItem("userData"));
      setUserData(localUserData);
    }
  }, []);

  useEffect(() => {
    if (userData) {
      // Calcular fechas frescas cada vez que el componente se monta
      const calculatedDays = getLastNDays(8);
      const calculatedWeeks = getLastNWeeks(3);
      
      setDays(calculatedDays);
      setWeeks(calculatedWeeks);
      
      // Consultar datos después de actualizar días y semanas
      setTimeout(() => {
        handleConsultar();
      }, 0);
    }
    // eslint-disable-next-line
  }, [userData]);

  const handleConsultar = async () => {
    setLoading(true);
    try {
      // Esperar a que se calculen las semanas
      if (weeks.length === 0) {
        console.log("Waiting for weeks to be calculated...");
        // Si las semanas no están calculadas aún, usamos getMondayAndSundayOfCurrentWeek
        const { monday: inicio, sunday: fin } = getMondayAndSundayOfCurrentWeek();
        
        console.log("Initial API request using:", {
          fechaInicio: inicio,
          fechaFin: fin
        });
        
        const res = await fetch("/api/boxCutLotery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Idvendedor: userData.Idvendedor,
            sucursal: userData.sucursal,
            fechaInicio: inicio,
            fechaFin: fin,
            modo: "semana",
          }),
        });
        const data = await res.json();
        setResult(data);
        
        // Seleccionar automáticamente la semana actual
        if (weeks.length > 0) {
          setSelectedWeek({ start: weeks[0].start, end: weeks[0].end });
        }
      } else {
        // Usar la primera semana (actual) de nuestras semanas calculadas
        const currentWeek = weeks[0];
        
        console.log("API request using calculated week:", {
          fechaInicio: currentWeek.startDate,
          fechaFin: currentWeek.endDate,
          display: `${currentWeek.start} a ${currentWeek.end}`
        });
        
        const res = await fetch("/api/boxCutLotery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Idvendedor: userData.Idvendedor,
            sucursal: userData.sucursal,
            fechaInicio: currentWeek.startDate,
            fechaFin: currentWeek.endDate,
            modo: "semana",
          }),
        });
        const data = await res.json();
        setResult(data);
        
        // Seleccionar automáticamente la semana actual para la UI
        setSelectedWeek({ start: currentWeek.start, end: currentWeek.end });
      }
    } catch (e) {
      console.error("Error en handleConsultar:", e);
      Swal.fire({ icon: "error", title: "Error consultando" });
    }
    setLoading(false);
  };

  const goToMenu = () => {
    router.push("/menu");
    localStorage.removeItem("loggedAdmin");
  };
  
  // Recalculate days and weeks on component mount to ensure freshness
  const [days, setDays] = useState([]);
  const [weeks, setWeeks] = useState([]);
  
  useEffect(() => {
    // Calculate days and weeks when component mounts
    const calculatedDays = getLastNDays(8);
    const calculatedWeeks = getLastNWeeks(3);
    
    setDays(calculatedDays);
    setWeeks(calculatedWeeks);
    
    // Log for debugging
    console.log("Component mounted, calculated days:", calculatedDays);
    console.log("Component mounted, calculated weeks:", calculatedWeeks);
  }, []);

  // Consulta por día
  const handleDayClick = async (date) => {
    setLoading(true);
    setSelectedDay(date);
    setSelectedWeek(null);
    
    try {
      // Ensure we're using the exact date that was passed without any timezone conversion issues
      console.log("Selected date for API request:", date);
      
      const res = await fetch("/api/boxCutLotery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Idvendedor: userData.Idvendedor,
          sucursal: userData.sucursal,
          fechaInicio: date, // Use the exact date string that was passed in
          fechaFin: date,    // Use the exact date string that was passed in
          modo: "dia",
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error consultando" });
    }
    setLoading(false);
  };

  // Consulta por semana
  const handleWeekClick = async (start, end) => {
    setLoading(true);
    setSelectedDay(null);
    setSelectedWeek({ start, end });
    
    try {
      // Encontrar la semana seleccionada en nuestro arreglo de semanas
      const selectedWeekObj = weeks.find(w => w.start === start && w.end === end);
      
      if (!selectedWeekObj) {
        console.error("No se encontró la semana seleccionada", { start, end, weeks });
        throw new Error("No se encontró la semana seleccionada");
      }
      
      // Usar las fechas en formato YYYY-MM-DD que ya calculamos en getLastNWeeks
      const fechaInicio = selectedWeekObj.startDate;
      const fechaFin = selectedWeekObj.endDate;
      
      console.log("API request for week:", {
        display: `${start} a ${end}`,
        apiDates: `${fechaInicio} a ${fechaFin}`,
        weekObj: selectedWeekObj
      });
      
      const res = await fetch("/api/boxCutLotery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Idvendedor: userData.Idvendedor,
          sucursal: userData.sucursal,
          fechaInicio,
          fechaFin,
          modo: "semana",
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error consultando" });
    }
    setLoading(false);
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
        <h2 className="text-white text-2xl font-bold mb-4 text-center">Corte de caja</h2>
        <div className="mb-4">
          <div className="text-white font-bold mb-2">Días recientes</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {days.map((d) => (
              <button
                key={d.date}
                className={`rounded p-3 flex flex-col items-center shadow font-bold border-2 ${
                  selectedDay === d.date
                    ? 'bg-red-700 text-white border-white'
                    : 'bg-red-700 text-white border-red-700'
                }`}
                onClick={() => handleDayClick(d.date)}
              >
                <span className="capitalize">{d.label}</span>
                <span className="text-xs">{formatDayMonth(d.date)}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <div className="text-white font-bold mb-2">Reporte semanal</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {weeks.map((w) => (
              <button
                key={w.start}
                className={`rounded p-3 flex flex-col items-center shadow font-bold border-2 ${
                  selectedWeek && selectedWeek.start === w.start
                    ? 'bg-red-700 text-white border-white'
                    : 'bg-red-700 text-white border-red-700'
                }`}
                onClick={() => handleWeekClick(w.start, w.end)}
              >
                <span>{w.label}</span>
                <span className="text-xs">{w.start} a {w.end}</span>
              </button>
            ))}
          </div>
        </div>
        {loading && <div className="text-white text-center">Cargando...</div>}
        {result && (
          <div className="space-y-4 mt-4">
            {selectedDay && (
              <div className="bg-[rgb(38,38,38)] border border-red-700 rounded p-4 text-white flex flex-col items-center shadow">
                <span className="font-bold text-lg mb-2">Corte de caja del día</span>
                <span className="mb-2">{formatDayMonth(selectedDay)}</span>
                {result.dias && result.dias.length > 0 ? (
                  <>
                    <span>Boletos vendidos: <b>{result.dias[0].boletosvendidos}</b></span>
                    <span>Venta: <b>${result.dias[0].venta}</b></span>
                    
                    {/* Mostrar cancelados del día si existen */}
                    {(() => {
                      // Filtrar cancelados solo para este día
                      const canceladosHoy = result.cancelados ? result.cancelados.filter(c => {
                        let diaCancelado = c.Fecha_cancelacion;
                        if (diaCancelado instanceof Date) {
                          diaCancelado = diaCancelado.toISOString().split("T")[0];
                        } else if (typeof diaCancelado === "string" && diaCancelado.includes("T")) {
                          diaCancelado = diaCancelado.split("T")[0];
                        } else if (typeof diaCancelado === "string" && diaCancelado.length > 10) {
                          diaCancelado = diaCancelado.substring(0, 10);
                        }
                        return diaCancelado === selectedDay;
                      }) : [];
                      
                      if (canceladosHoy.length > 0) {
                        const totalCancelados = canceladosHoy.reduce((acc, c) => acc + (Number(c.Costo) || 0), 0);
                        return <span>Cancelados ({canceladosHoy.length}): <b>-${totalCancelados.toFixed(2)}</b></span>;
                      }
                      return null;
                    })()}
                    
                    {/* Calcular venta neta (venta - cancelados) */}
                    {(() => {
                   
                      const ventaNeta = result.dias[0].venta;
                      return <span>Venta neta: <b>${ventaNeta.toFixed(2)}</b></span>;
                    })()}
                    
                    <span>Comisión: <b>${result.dias[0].comision}</b></span>
                    <span>Total caja: <b>${result.dias[0].totalcaja}</b></span>
                    
                    {/* Mostrar premiados del día si existen */}
                    {(() => {
                      // Filtrar ganadores solo para este día
                      console.log("All ganadores:", result.ganadores, "result", result);  
                      const ganadoresHoy = result.ganadores ? result.ganadores.filter(g => {
                        let diaPago = g.Fecha_pago;
                        if (diaPago instanceof Date) {
                          diaPago = diaPago.toISOString().split("T")[0];
                        } else if (typeof diaPago === "string" && diaPago.includes("T")) {
                          diaPago = diaPago.split("T")[0];
                        } else if (typeof diaPago === "string" && diaPago.length > 10) {
                          diaPago = diaPago.substring(0, 10);
                        }
                        return diaPago === selectedDay;
                      }) : [];

                      console.log("Ganadores hoy:", ganadoresHoy);
                      if (ganadoresHoy.length > 0) {
                        const premiosTotal = ganadoresHoy.reduce((acc, g) => acc + (Number(g.Premio) || 0), 0);
                        const comisionPremiados = premiosTotal * 0.01;
                        const totalPremiados = premiosTotal + comisionPremiados;
                        
                        return (
                          <>
                            <span>Premiados ({ganadoresHoy.length}): <b>-${premiosTotal.toFixed(2)}</b></span>
                            <span>Comisión premiados: <b>-${comisionPremiados.toFixed(2)}</b></span>
                            <span>Total premiados: <b>-${totalPremiados.toFixed(2)}</b></span>
                          </>
                        );
                      }
                      return null;
                    })()}
                    
                    {/* Calcular total a pagar */}
                    {(() => {
                      // Filtrar cancelados solo para este día
                      const ventaNeta = result.dias[0].venta;
                      const comision = result.dias[0].comision;
                      const corteCaja = ventaNeta - comision;
                      
                      // Filtrar ganadores solo para este día
                      const ganadoresHoy = result.ganadores ? result.ganadores.filter(g => {
                        let diaPago = g.Fecha_pago;
                        if (diaPago instanceof Date) {
                          diaPago = diaPago.toISOString().split("T")[0];
                        } else if (typeof diaPago === "string" && diaPago.includes("T")) {
                          diaPago = diaPago.split("T")[0];
                        } else if (typeof diaPago === "string" && diaPago.length > 10) {
                          diaPago = diaPago.substring(0, 10);
                        }
                        return diaPago === selectedDay;
                      }) : [];
                      
                      let pagadosTotal = 0;
                      if (ganadoresHoy.length > 0) {
                        const premiosTotal = ganadoresHoy.reduce((acc, g) => acc + (Number(g.Premio) || 0), 0);
                        const comisionPremiados = premiosTotal * 0.01;
                        pagadosTotal = premiosTotal + comisionPremiados;
                      }
                      
                      const totalPagar = corteCaja - pagadosTotal;
                      return <span className="mt-4 text-lg font-bold">TOTAL A PAGAR: <b>${totalPagar.toFixed(2)}</b></span>;
                    })()}
                    
                    <button
                      className="mt-4 bg-red-700 text-white px-4 py-2 rounded font-bold flex items-center gap-2 hover:bg-red-800"
                      onClick={() => generatePDFBoxCutDay({
                        userData,
                        dia: formatDayMonth(selectedDay),
                        data: {
                          ...result.dias[0],
                          cancelados: result.cancelados,
                          ganadores: result.ganadores,
                        }
                      }, "share")}
                    >
                      <FaPrint /> Compartir corte de caja
                    </button>

                    <button
                      className="mt-4 bg-red-700 text-white px-4 py-2 rounded font-bold flex items-center gap-2 hover:bg-red-800"
                      onClick={() => generatePDFBoxCutDay({
                        userData,
                        dia: formatDayMonth(selectedDay),
                        data: {
                          ...result.dias[0],
                          cancelados: result.cancelados,
                          ganadores: result.ganadores,
                        }
                      }, "download")}
                    >
                      <FaPrint /> Descargar corte de caja
                    </button>
                  </>
                ) : (
                  <span>No hay datos para este día.</span>
                )}
              </div>
            )}
            {selectedWeek && result.resumen && (
              <div className="bg-red-900 border border-white rounded p-4 text-white flex flex-col items-center shadow">
                <span className="font-bold text-xl mb-2">{weeks.find(w => w.start === selectedWeek.start)?.label || 'Semana'}</span>
                <span className="mb-2">{selectedWeek.start} a {selectedWeek.end}</span>
                <span>Boletos vendidos: <b>{result.resumen.boletosvendidos}</b></span>
                <span>Venta total: <b>${result.resumen.venta}</b></span>
                
                {/* Mostrar cancelados si existen */}
                {result.cancelados && result.cancelados.length > 0 && (
                  <span>Cancelados: <b>-${result.cancelados.reduce((acc, c) => acc + (Number(c.Costo) || 0), 0).toFixed(2)}</b></span>
                )}
                
                {/* Calcular venta neta (venta - cancelados) */}
                {(() => {
                  const canceladosTotal = result.cancelados && result.cancelados.length > 0 
                    ? result.cancelados.reduce((acc, c) => acc + (Number(c.Costo) || 0), 0) 
                    : 0;
                  const ventaNeta = result.resumen.venta;
                  return <span>Venta neta: <b>${ventaNeta.toFixed(2)}</b></span>;
                })()}
                
                <span>Comisión: <b>${result.resumen.comision}</b></span>
                <span>Total caja: <b>${result.resumen.totalcaja}</b></span>
                
                {/* Mostrar premiados si existen */}
                {result.ganadores && result.ganadores.length > 0 && (() => {
                  const premiosTotal = result.ganadores.reduce((acc, g) => acc + (Number(g.Premio) || 0), 0);
                  const comisionPremiados = premiosTotal * 0.01;
                  const totalPremiados = premiosTotal + comisionPremiados;
                  
                  return (
                    <>
                      <span>Premiados ({result.ganadores.length}): <b>-${premiosTotal.toFixed(2)}</b></span>
                      <span>Comisión premiados: <b>-${comisionPremiados.toFixed(2)}</b></span>
                      <span>Total premiados: <b>-${totalPremiados.toFixed(2)}</b></span>
                    </>
                  );
                })()}
                
                {/* Calcular total a pagar */}
                {(() => {
                  const canceladosTotal = result.cancelados && result.cancelados.length > 0 
                    ? result.cancelados.reduce((acc, c) => acc + (Number(c.Costo) || 0), 0) 
                    : 0;
                  const ventaNeta = result.resumen.venta;
                  const corteCaja = ventaNeta - result.resumen.comision;
                  
                  let pagadosTotal = 0;
                  if (result.ganadores && result.ganadores.length > 0) {
                    const premiosTotal = result.ganadores.reduce((acc, g) => acc + (Number(g.Premio) || 0), 0);
                    const comisionPremiados = premiosTotal * 0.01;
                    pagadosTotal = premiosTotal + comisionPremiados;
                  }
                  
                  const totalPagar = corteCaja - pagadosTotal;
                  return <span className="mt-4 text-xl font-bold">TOTAL A PAGAR: <b>${totalPagar.toFixed(2)}</b></span>;
                })()}
                
                <button
                  className="mt-4 bg-red-700 text-white px-4 py-2 rounded font-bold flex items-center gap-2 hover:bg-red-800"
                  onClick={() =>generatePDFBoxCutWeek({
                      userData,
                      weekLabel: weeks.find(w => w.start === selectedWeek.start)?.label || "Semana",
                      weekRange: `${selectedWeek.start} a ${selectedWeek.end}`,
                      resumen: result.resumen,
                      dias: result.dias,
                      cancelados: result.cancelados,
                      ganadores: result.ganadores,
                      bancos: result.bancos,
                    },"share")}
                >
                  <FaPrint /> Compartir corte de caja
                </button>
                <button
                  className="mt-4 bg-red-700 text-white px-4 py-2 rounded font-bold flex items-center gap-2 hover:bg-red-800"
                  onClick={() =>generatePDFBoxCutWeek({
                      userData,
                      weekLabel: weeks.find(w => w.start === selectedWeek.start)?.label || "Semana",
                      weekRange: `${selectedWeek.start} a ${selectedWeek.end}`,
                      resumen: result.resumen,
                      dias: result.dias,
                      cancelados: result.cancelados,
                      ganadores: result.ganadores,
                      bancos: result.bancos,
                    },"download")}
                >
                  <FaPrint /> Descargar corte de caja
                </button>
              </div>
            )}
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
export default BoxCutLotery;