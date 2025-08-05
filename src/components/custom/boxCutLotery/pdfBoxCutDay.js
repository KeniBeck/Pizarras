import jsPDF from "jspdf";
import "jspdf-autotable";
import { FaPrint } from "react-icons/fa";

const generatePDFBoxCutDay = async ({ userData, dia, data }) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [80, 300] });
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  let y = 10;
  y += 8;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Trebol de la suerte", 20, y);
  y += 6;
  doc.setFontSize(8);

  // Solo muestra la fecha (sin texto "Fecha de impresión")
  const fechaImpresion = new Date();
  const fechaImpresionStr = fechaImpresion.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + fechaImpresion.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  doc.text(`${fechaImpresionStr}`, 10, y);
  y += 4;

  // Muestra el texto antes de la fecha seleccionada
  doc.text("Fecha del día de venta seleccionado:", 10, y);
  y += 4;
  doc.text(`${dia}`, 10, y);
  y += 6;

  doc.setLineWidth(0.5);
  doc.setDrawColor(0);
  doc.setLineDash([2, 2], 0);
  doc.line(5, y, 75, y);
  doc.setLineDash([]);
  y += 8; // Más espacio después de la línea punteada

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  // Centrar "Reporte de ventas"
  doc.text("Reporte de ventas", 40, y, { align: 'center' });
  y += 10; // Más espacio después del título

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  // Centrar usuario
  doc.text(`Usuario: ${userData?.Nombre || "-"}`, 40, y, { align: 'center' });
  y += 8; // Más espacio antes de ventas

  doc.setFontSize(10);
  doc.setFont("courier", "normal");

  // --- Grupo: Ventas ---
  const labelX = 10;
  const valueX = 65; // Más separado del texto, antes era 60

  doc.text(`Boletos vendidos`, labelX, y);
  doc.text(`${data?.boletosvendidos || 0}`, valueX, y, { align: 'right' });
  y += 5;
  doc.text(`Especiales`, labelX, y);
  doc.text(`${data?.especiales || 0}`, valueX, y, { align: 'right' });
  y += 8; // Más espacio antes de cancelados

  // --- Grupo: Cancelados ---
  let venta = data?.venta || 0;
  let canceladosTotal = 0;
  if (data?.cancelados && data.cancelados.length > 0) {
    canceladosTotal = data.cancelados.reduce((acc, c) => acc + (c.Costo || 0), 0);
    const cancelados = data.cancelados.length;
    doc.text(`${cancelados} Cancelados`, labelX, y);
    doc.text(`-$${canceladosTotal}`, valueX, y, { align: 'right' });
    y += 8; // Más espacio antes de venta neta
  }

  // --- Grupo: Venta neta y comisión ---
  let ventaNeta = venta;
  doc.text(`Venta neta`, labelX, y);
  doc.text(`$${ventaNeta}`, valueX, y, { align: 'right' });
  y += 5;

  let comision = ventaNeta * 0.20;
  doc.text(`- Comisión`, labelX, y);
  doc.text(`-$${comision.toFixed(2)}`, valueX, y, { align: 'right' });
  y += 5;

  let corteCaja = ventaNeta - comision;
  doc.text(`Corte de caja`, labelX, y);
  doc.text(`$${corteCaja.toFixed(2)}`, valueX, y, { align: 'right' });
  y += 10; // Más espacio antes de ganadores

  // --- Grupo: Ganadores ---
  let pagadosTotal = 0;
  let pagados = 0;
  if (data?.ganadores && data.ganadores.length > 0) {
    pagadosTotal = data.ganadores.reduce((acc, g) => acc + (g.Premio || 0), 0);
    pagados = data.ganadores.length;
    doc.text(`${pagados} Premiados`, labelX, y);
    doc.text(`-$${pagadosTotal}`, valueX, y, { align: 'right' });
    y += 5;
    let comisionPremiados = pagadosTotal * 0.01;
    doc.text(`- Com. premiados`, labelX, y);
    doc.text(`-$${comisionPremiados.toFixed(2)}`, valueX, y, { align: 'right' });
    y += 10; // Más espacio antes del total
    pagadosTotal += comisionPremiados;
  }

  // --- Grupo: Total ---
  let totalPagar = corteCaja - pagadosTotal;
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL A PAGAR:`, labelX, y);
  doc.text(`$${totalPagar.toFixed(2)}`, valueX, y, { align: 'right' });
  y += 8;

  doc.setLineWidth(0.5);
  doc.setDrawColor(0);
  doc.setLineDash([2, 2], 0);
  doc.line(5, y, 75, y);
  doc.setLineDash([]);
  doc.autoPrint();
  const blob = doc.output("blob");
  if (blob) {
    const url = URL.createObjectURL(blob);
    window.open(url);
  }
};

export default generatePDFBoxCutDay;

<button
  className="mt-4 bg-red-700 text-white px-4 py-2 rounded font-bold flex items-center gap-2"
  onClick={() => generatePDFBoxCutDay({
    userData,
    dia: formatDayMonth(selectedDay),
    data: {
      ...result.dias[0],
      cancelados: result.cancelados,
      ganadores: result.ganadores,
    }
  })}
>
  <FaPrint /> Imprimir corte de caja
</button>
