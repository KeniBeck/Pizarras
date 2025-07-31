import jsPDF from "jspdf";
import "jspdf-autotable";

const generatePDFBoxCutWeek = async ({ userData, weekLabel, weekRange, resumen, dias, cancelados, ganadores, bancoInfo }) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [80, 400] });
  const printDate = new Date();
  const printDateStr = printDate.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  let y = 10;
  y += 8;
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(userData?.empresa || "Trebol de la suerte", 40, y, { align: "center" });
  y += 6;
  doc.setFontSize(9);
  doc.text(`Fecha de impresion`, 40, y, { align: "center" });
  y += 4;
  doc.setLineDash([2, 2], 0);
  doc.line(8, y, 72, y);
  y += 4;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Liquidacion", 40, y, { align: "center" });
  doc.setFontSize(8);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.text(`Fecha del corte: ${weekRange}`, 10, y);
  y += 4;
  doc.text(`Usuario: ${userData?.id || userData?.Nombre || "-"}`, 10, y);
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.text("Venta semanal", 10, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  // Venta semanal fields
  doc.text(`Boletos vendidos`, 12, y);
  doc.text(`${resumen.boletosvendidos || 0}`.padStart(6, ' '), 60, y, { align: "right" });
  y += 5;
  doc.text(`Especiales`, 12, y);
  doc.text(`${resumen.especiales || 0}`.padStart(6, ' '), 60, y, { align: "right" });
  y += 5;
  doc.text(`Subtotal`, 12, y);
  doc.text(`$${resumen.venta || 0}`, 60, y, { align: "right" });
  y += 5;
  doc.text(`- Comision`, 12, y);
  doc.text(`$${resumen.comision || 0}`, 60, y, { align: "right" });
  y += 6;

  // Solo mostrar pagados si existen
  if (resumen.pagados && resumen.pagados > 0) {
    doc.text(`${resumen.pagados} Pagados`, 12, y);
    doc.text(`$${resumen.totalentregado || 0}`, 60, y, { align: "right" });
    y += 5;
    doc.text(`- Comision`, 12, y);
    doc.text(`$${resumen.comisionpagados || 0}`, 60, y, { align: "right" });
    y += 5;
  }

  // Solo mostrar cancelados si existen
  if (resumen.cancelados && resumen.cancelados > 0) {
    doc.text(`${resumen.cancelados} Cancelados`, 12, y);
    doc.text(`$${resumen.totalcancelados || 0}`, 60, y, { align: "right" });
    y += 8;
  } else {
    y += 8;
  }

  doc.setFont("helvetica", "bold");
  doc.text(`A PAGAR:`, 12, y);
  doc.text(`$${resumen.apagar || 0}`, 60, y, { align: "right" });
  y += 6;
  doc.setLineDash([2, 2], 0);
  doc.line(8, y, 72, y);
  y += 5;

  doc.setFontSize(8);
  doc.text("NOMBRE Y FIRMA DEL DEPOSITANTE", 40, y, { align: "center" });
  doc.autoPrint();
  const blob = doc.output("blob");
  if (blob) {
    const url = URL.createObjectURL(blob);
    window.open(url);
  }
};

export default generatePDFBoxCutWeek;
