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
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    days.push({
      date: dateStr,
      label: dateStr === todayStr ? "HOY" : diasSemana[d.getDay()],
    });
  }
  return days;
}

function getLastNWeeks(n) {
  // Devuelve array de {start, end, label}
  const weeks = [];
  const now = new Date();
  // Encuentra el lunes de la semana actual
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  let monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  for (let i = 0; i < n; i++) {
    const start = new Date(monday);
    start.setDate(monday.getDate() - 7 * i);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    weeks.push({
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
      label: `Semana ${i === 0 ? 'actual' : i === 1 ? 'pasada' : 'antepasada'}`
    });
  }
  return weeks.reverse();
}

function formatDayMonth(fechaStr) {
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
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
  const days = getLastNDays(8);
  // Cards de semanas (actual, pasada, antepasada)
  const weeks = getLastNWeeks(3);

  // Consulta por día
  const handleDayClick = async (date) => {
    setLoading(true);
    setSelectedDay(date);
    setSelectedWeek(null);
    try {
      const res = await fetch("/api/boxCutLotery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Idvendedor: userData.Idvendedor,
          sucursal: userData.sucursal,
          fechaInicio: date,
          fechaFin: date,
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
      const res = await fetch("/api/boxCutLotery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Idvendedor: userData.Idvendedor,
          sucursal: userData.sucursal,
          fechaInicio: start,
          fechaFin: end,
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
                <span className="text-xs">{formatDayMonth(w.start)} a {formatDayMonth(w.end)}</span>
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
                          cancelados: result.cancelados?.filter(c => c.Fecha_venta?.split('T')[0] === selectedDay),
                          ganadores: result.ganadores?.filter(g => g.Fecha_venta?.split('T')[0] === selectedDay)
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
                <span className="mb-2">{formatDayMonth(selectedWeek.start)} a {formatDayMonth(selectedWeek.end)}</span>
                <span>Boletos vendidos: <b>{result.resumen.boletosvendidos}</b></span>
                <span>Venta total: <b>${result.resumen.venta}</b></span>
                <span>Comisión: <b>${result.resumen.comision}</b></span>
                <span>Total caja: <b>${result.resumen.totalcaja}</b></span>
                <button
                  className="mt-4 bg-red-700 text-white px-4 py-2 rounded font-bold flex items-center gap-2 hover:bg-red-800"
                  onClick={() => generatePDFBoxCutWeek({
                    userData,
                    weekLabel: weeks.find(w => w.start === selectedWeek.start)?.label || 'Semana',
                    weekRange: `${formatDayMonth(selectedWeek.start)} a ${formatDayMonth(selectedWeek.end)}`,
                    resumen: result.resumen,
                    dias: result.dias,
                    cancelados: result.cancelados,
                    ganadores: result.ganadores
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