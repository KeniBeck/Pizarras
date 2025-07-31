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
  const fechaImpresion = new Date();
  const fechaImpresionStr = fechaImpresion.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + fechaImpresion.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  doc.text(`Fecha de impresión: ${fechaImpresionStr}`, 10, y);
  y += 4;
  doc.text(`Fecha seleccionada: ${dia}`, 10, y);
  y += 6;
  doc.setLineWidth(0.5);
  doc.setDrawColor(0);
  doc.setLineDash([2, 2], 0);
  doc.line(5, y, 75, y);
  doc.setLineDash([]);
  y += 3;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Reporte de ventas", 10, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Fecha del dia de venta seleccionado`, 10, y);
  y += 4;
  doc.text(`Usuario: ${userData?.Nombre || "-"}`, 10, y);
  y += 6;
  doc.setFontSize(10);
  doc.setFont("courier", "normal");
  // Totales
  doc.text(`Boletos vendidos`, 10, y);
  doc.text(`${data?.boletosvendidos || 0}`.padStart(8), 60, y, { align: 'right' });
  y += 5;
  doc.text(`Especiales`, 10, y);
  doc.text(`${data?.especiales || 0}`.padStart(8), 60, y, { align: 'right' });
  y += 5;
  doc.text(`Subtotal`, 10, y);
  doc.text(`$${data?.venta || 0}`.padStart(8), 60, y, { align: 'right' });
  y += 5;
  doc.text(`- Comision`, 10, y);
  doc.text(`$${data?.comision || 0}`.padStart(8), 60, y, { align: 'right' });
  y += 5;
  // Ganadores
  let pagadosTotal = 0;
  if (data?.ganadores && data.ganadores.length > 0) {
    pagadosTotal = data.ganadores.reduce((acc, g) => acc + (g.Premio || 0), 0);
    const pagados = data.ganadores.length;
    doc.text(`${pagados} Pagados`, 10, y);
    doc.text(`$${pagadosTotal}`.padStart(8), 60, y, { align: 'right' });
    y += 5;
    doc.text(`- Comision`, 10, y);
    doc.text(`$${pagados ? (pagadosTotal * 0.01).toFixed(2) : '0.00'}`.padStart(8), 60, y, { align: 'right' });
    y += 5;
  }

  // Cancelados
  let canceladosTotal = 0;
  if (data?.cancelados && data.cancelados.length > 0) {
    canceladosTotal = data.cancelados.reduce((acc, c) => acc + (c.Costo || 0), 0);
    const cancelados = data.cancelados.length;
    doc.text(`${cancelados} Cancelados`, 10, y);
    doc.text(`$${canceladosTotal}`.padStart(8), 60, y, { align: 'right' });
    y += 5;
  }
  // Total
  let total = (data?.venta || 0) - (data?.comision || 0) + pagadosTotal - (pagadosTotal * 0.01) - canceladosTotal;
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL:`, 10, y);
  doc.text(`$${total.toFixed(2)}`.padStart(8), 60, y, { align: 'right' });
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
    dia: selectedDay, // <-- aquí el valor sin formatear
    data: {
      ...result.dias[0],
      cancelados: result.cancelados?.filter(c => c.Fecha_venta?.split('T')[0] === selectedDay),
      ganadores: result.ganadores?.filter(g => g.Fecha_venta?.split('T')[0] === selectedDay)
    }
  })}
>
  <FaPrint /> Imprimir corte de caja
</button>
