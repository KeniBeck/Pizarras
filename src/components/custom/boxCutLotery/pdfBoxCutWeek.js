import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const generatePDFBoxCutWeek = async ({ userData, weekLabel, weekRange, resumen, dias, cancelados, ganadores, bancos }, mode = "download") => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [80, 400] });
  let y = 10;

  // Título principal
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Trebol de la suerte", 40, y, { align: "center" });
  y += 8;

  // Fecha de impresión (actual)
  const fechaImpresion = new Date();
  const fechaImpresionStr = fechaImpresion.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + fechaImpresion.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Fecha de impresión: ${fechaImpresionStr}`, 40, y, { align: "center" });
  y += 6;

  // Línea punteada
  doc.setLineDash([2, 2], 0);
  doc.line(8, y, 72, y);
  doc.setLineDash([]);
  y += 8;

  // Título de liquidación
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Liquidacion", 40, y, { align: "center" });
  y += 8;

  // Fecha de corte (rango de semana seleccionada)
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Fecha del corte: ${weekRange}`, 40, y, { align: "center" });
  y += 6;

  // Usuario
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Usuario: ${userData?.Nombre || "-"}`, 40, y, { align: "center" });
  y += 8;

  // --- Grupo: Ventas ---
  doc.setFontSize(10);
  doc.setFont("courier", "normal");
  const labelX = 10;
  const valueX = 65;

  doc.text(`Boletos vendidos`, labelX, y);
  doc.text(`${resumen.boletosvendidos || 0}`, valueX, y, { align: "right" });
  y += 5;
  doc.text(`Especiales`, labelX, y);
  doc.text(`${resumen.especiales || 0}`, valueX, y, { align: "right" });
  y += 8;

  // --- Grupo: Cancelados ---
  let canceladosTotal = 0;
  let canceladosCount = 0;
  if (cancelados && cancelados.length > 0) {
    canceladosTotal = cancelados.reduce((acc, c) => acc + (Number(c.Costo) || 0), 0);
    canceladosCount = cancelados.length;
    doc.text(`${canceladosCount} Cancelados`, labelX, y);
    doc.text(`-$${canceladosTotal}`, valueX, y, { align: "right" });
    y += 8;
  }

  // --- Grupo: Venta neta y comisión ---
  let venta = resumen.venta || 0;
  let ventaNeta = venta;
  doc.text(`Venta neta`, labelX, y);
  doc.text(`$${ventaNeta}`, valueX, y, { align: "right" });
  y += 5;

  let comision = ventaNeta * 0.20;
  doc.text(`- Comisión`, labelX, y);
  doc.text(`-$${comision.toFixed(2)}`, valueX, y, { align: "right" });
  y += 5;

  let corteCaja = ventaNeta - comision;
  doc.text(`Corte de caja`, labelX, y);
  doc.text(`$${corteCaja.toFixed(2)}`, valueX, y, { align: "right" });
  y += 10;

  // --- Grupo: Ganadores ---
  let pagadosTotal = 0;
  let pagados = 0;
  if (ganadores && ganadores.length > 0) {
    pagadosTotal = ganadores.reduce((acc, g) => acc + (Number(g.Premio) || 0), 0);
    pagados = ganadores.length;
    doc.text(`${pagados} Premiados`, labelX, y);
    doc.text(`-$${pagadosTotal}`, valueX, y, { align: "right" });
    y += 5;
    let comisionPremiados = pagadosTotal * 0.01;
    doc.text(`- Com. premiados`, labelX, y);
    doc.text(`-$${comisionPremiados.toFixed(2)}`, valueX, y, { align: "right" });
    y += 10;
    pagadosTotal += comisionPremiados;
  }

  // --- Grupo: Total ---
  let totalPagar = corteCaja - pagadosTotal;
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL A PAGAR:`, labelX, y);
  doc.text(`$${totalPagar.toFixed(2)}`, valueX, y, { align: "right" });
  y += 8;

  // Línea punteada
  doc.setLineDash([2, 2], 0);
  doc.line(8, y, 72, y);
  doc.setLineDash([]);
  y += 10;

  // Agregar la tabla de información bancaria
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Cuentas para pago", 40, y, { align: "center" });
  y += 6;

  // Preparar los datos de bancos para la tabla
  const bancosData = bancos && bancos.length > 0 
    ? bancos.map(banco => [banco.Banco, banco.Cuenta, ` ${userData?.Idvendedor || "-"}`])
    : [["Sin información bancaria", "-", "-"]];

  // Crear tabla de banco
  const bancosTable = autoTable(doc, {
    startY: y,
    head: [["Banco", "Cuenta", "Concepto"]],
    body: bancosData,
    theme: "striped",
    headStyles: { fillColor: [169, 169, 169], textColor: [0, 0, 0] },
    margin: { left: 8, right: 8 },
    styles: { fontSize: 8 },
  });

  // si necesitas finalY:
  // y = doc.autoTable?.previous?.finalY || (bancosTable.finalY || y) + 5;

  doc.autoPrint();
  const blob = doc.output("blob");
  const file = new File([blob], "corte_caja_semana.pdf", { type: "application/pdf" });

  if (mode === "share" && navigator.share) {
    try {
      await navigator.share({
        title: "Corte de caja semanal",
        text: "Aquí está el corte de caja de la semana.",
        files: [file],
      });
      console.log("Compartido exitosamente");
    } catch (err) {
      console.error("Error al compartir:", err);
      const url = URL.createObjectURL(blob);
      window.open(url);
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    }
  } else {
    //descarga directa
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "corte_caja_semana.pdf";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
};

export default generatePDFBoxCutWeek;
