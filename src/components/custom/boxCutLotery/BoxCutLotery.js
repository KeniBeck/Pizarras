"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaHome, FaPrint } from "react-icons/fa";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import "jspdf-autotable";
import generatePDFBoxCutWeek from "./pdfBoxCutWeek";
import generatePDFBoxCutDay from "./pdfBoxCutDay";

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
  const now = new Date();
  const day = now.getDay();
  // Lunes = 1, Domingo = 0
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  // Formato YYYY-MM-DD
  const toISO = (d) => d.toISOString().split("T")[0];
  return {
    monday: toISO(monday),
    sunday: toISO(sunday),
  };
}

// Utilidades para fechas
function getLastNDays(n) {
  const days = [];
  // Use Mexico timezone for consistent date handling
  const nowMX = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
  
  // Format the date manually for consistency
  const year = nowMX.getFullYear();
  const month = String(nowMX.getMonth() + 1).padStart(2, '0');
  const day = String(nowMX.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;
  
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(nowMX);
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
  
  // Obtener la fecha actual en la zona horaria de México
  const nowMX = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
  const dayOfWeek = nowMX.getDay(); // 0-6 (0 es domingo)
  
  // Calcular días para llegar al lunes más reciente (día inicial de la semana)
  // Si hoy es lunes (1), diff = 0
  // Si hoy es domingo (0), diff = -6 (retroceder 6 días)
  // Para cualquier otro día (2-6), diff = 1 - dayOfWeek (retroceder los días necesarios)
  const diffToMonday = dayOfWeek === 1 ? 0 : dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  // Obtener el lunes de la semana actual
  const currentWeekStart = new Date(nowMX);
  currentWeekStart.setDate(nowMX.getDate() + diffToMonday);
  currentWeekStart.setHours(0, 0, 0, 0);
  
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
    
    weeks.push({
      start: startFormatted,
      end: endFormatted,
      label: `Semana ${i === 0 ? 'actual' : i === 1 ? 'pasada' : 'antepasada'}`
    });
  }
  
  return weeks;
}

function formatDayMonth(fechaStr) {
  // Si ya viene formateada como "dd-mmm", la devolvemos tal cual
  if (typeof fechaStr === 'string' && fechaStr.match(/^\d{2}-[a-z]{3}$/)) {
    return fechaStr;
  }
  
  // Si es una cadena pero no está en el formato correcto, la convertimos a Date
  const fecha = typeof fechaStr === 'string' ? new Date(fechaStr) : fechaStr;
  
  // Formatear día y mes según el requisito (formato "26-jul")
  const day = fecha.getDate().toString().padStart(2, '0');
  
  // Obtener abreviatura del mes en español
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const mes = meses[fecha.getMonth()];
  
  return `${day}-${mes}`;
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
      handleConsultar();
    }
    // eslint-disable-next-line
  }, [userData]);

  const handleConsultar = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/boxCutLotery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Idvendedor: userData.Idvendedor,
          sucursal: userData.sucursal,
          fechaInicio: monday,
          fechaFin: sunday,
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

  const goToMenu = () => {
    router.push("/menu");
    localStorage.removeItem("loggedAdmin");
  };
  // Cards de días (últimos 8 días)
  // No need to transform dates here since getLastNDays already returns dates in Mexico timezone
  const days = getLastNDays(8);
  // Cards de semanas (actual, pasada, antepasada)
  const weeks = getLastNWeeks(3);

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
      // Calcular el índice de la semana seleccionada (0 = actual, 1 = pasada, 2 = antepasada)
      const selectedWeekIndex = weeks.findIndex(w => w.start === start && w.end === end);
      
      // Calcular fechas reales para la consulta API basadas en el índice de semana
      const nowMX = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
      const dayOfWeek = nowMX.getDay();
      const diffToMonday = dayOfWeek === 1 ? 0 : dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      
      // Obtener el lunes de la semana actual
      const currentWeekStart = new Date(nowMX);
      currentWeekStart.setDate(nowMX.getDate() + diffToMonday);
      currentWeekStart.setHours(0, 0, 0, 0);
      
      // Ajustar a la semana correcta basado en el índice
      const weekStart = new Date(currentWeekStart);
      weekStart.setDate(currentWeekStart.getDate() - (7 * selectedWeekIndex));
      
      // Calcular el fin de semana (domingo)
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      // Convertir a formato YYYY-MM-DD
      const fechaInicio = weekStart.toISOString().split('T')[0];
      const fechaFin = weekEnd.toISOString().split('T')[0];
      
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
                    <span>Comisión: <b>${result.dias[0].comision}</b></span>
                    <span>Total caja: <b>${result.dias[0].totalcaja}</b></span>
                    <button
                      className="mt-4 bg-red-700 text-white px-4 py-2 rounded font-bold flex items-center gap-2 hover:bg-red-800"
                      onClick={() => generatePDFBoxCutDay({
                        userData,
                        dia: formatDayMonth(selectedDay),
                        data: {
                          ...result.dias[0],
                          cancelados: result.cancelados,
                          ganadores: result.ganadores
                        }
                      })}
                    >
                      <FaPrint /> Imprimir corte de caja
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
                <span>Comisión: <b>${result.resumen.comision}</b></span>
                <span>Total caja: <b>${result.resumen.totalcaja}</b></span>
                <button
                  className="mt-4 bg-red-700 text-white px-4 py-2 rounded font-bold flex items-center gap-2 hover:bg-red-800"
                  onClick={() => generatePDFBoxCutWeek({
                    userData,
                    weekLabel: weeks.find(w => w.start === selectedWeek.start)?.label || 'Semana',
                    weekRange: `${selectedWeek.start} a ${selectedWeek.end}`,
                    resumen: result.resumen,
                    dias: result.dias,
                    cancelados: result.cancelados,
                    ganadores: result.ganadores,
                    bancos: result.bancos
                  })}
                >
                  <FaPrint /> Imprimir corte de caja
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