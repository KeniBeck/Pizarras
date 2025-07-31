import jsPDF from "jspdf";
import "jspdf-autotable";

const generatePDFBoxCutDay = async ({ userData, dia, data }) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [80, 300] });
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  let y = 10;
  doc.text("Ejemplo ticket de venta", 10, y);
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
  doc.dashedLine(5, y, 75, y, [2, 2]);
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
  const pagados = data?.ganadores?.length || 0;
  const pagadosTotal = data?.ganadores?.reduce((acc, g) => acc + (g.Premio || 0), 0);
  doc.text(`${pagados} Pagados`, 10, y);
  doc.text(`$${pagadosTotal}`.padStart(8), 60, y, { align: 'right' });
  y += 5;
  doc.text(`- Comision`, 10, y);
  doc.text(`$${pagados ? (pagadosTotal * 0.01).toFixed(2) : '0.00'}`.padStart(8), 60, y, { align: 'right' });
  y += 5;
  // Cancelados
  const cancelados = data?.cancelados?.length || 0;
  const canceladosTotal = data?.cancelados?.reduce((acc, c) => acc + (c.Costo || 0), 0);
  doc.text(`${cancelados} Cancelados`, 10, y);
  doc.text(`$${canceladosTotal}`.padStart(8), 60, y, { align: 'right' });
  y += 5;
  // Total
  let total = (data?.venta || 0) - (data?.comision || 0) + pagadosTotal - (pagadosTotal * 0.01) - canceladosTotal;
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL:`, 10, y);
  doc.text(`$${total.toFixed(2)}`.padStart(8), 60, y, { align: 'right' });
  y += 8;
  doc.setLineWidth(0.5);
  doc.setDrawColor(0);
  doc.dashedLine(5, y, 75, y, [2, 2]);
  doc.autoPrint();
  const blob = doc.output("blob");
  if (blob) {
    const url = URL.createObjectURL(blob);
    window.open(url);
  }
};

export default generatePDFBoxCutDay;
