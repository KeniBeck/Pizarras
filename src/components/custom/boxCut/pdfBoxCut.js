import jsPDF from "jspdf";
import Swal from "sweetalert2";
import "jspdf-autotable";

const generatePDFBoxCut = async (data) => {
  // Crear un nuevo documento PDF
  var doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 600],
  });

  // Agregar contenido al PDF
  doc.setFontSize(10); // Ajustar el tamaño de la fuente

  // Agregar el encabezado "Corte de caja"
  var title = "Corte de caja";
  var titleWidth =
    (doc.getStringUnitWidth(title) * doc.internal.getFontSize()) /
    doc.internal.scaleFactor;
  var titleX = (doc.internal.pageSize.width - titleWidth) / 2;
  doc.text(title, titleX, 10);

  // Agregar la fecha y hora actual
  let now = new Date();
  let formattedNow = now.toLocaleDateString() + " " + now.toLocaleTimeString();
  var dateWidth =
    (doc.getStringUnitWidth(formattedNow) * doc.internal.getFontSize()) /
    doc.internal.scaleFactor;
  var dateX = (doc.internal.pageSize.width - dateWidth) / 2;
  doc.text(formattedNow, dateX, 15);

  let y = 20;

  // Verificar si hay boletos especiales
  if (data.boletosEspeciales && data.boletosEspeciales.length > 0) {
    let fechasSorteo = [
      ...new Set(
        data.boletosEspeciales.map((boleto) => boleto.FechaSorteo.split("T")[0])
      ),
    ];
    let fechasTexto = fechasSorteo.join(", ");
    // Agregar el nombre del vendedor al texto del sorteo especial
    doc.text(
      "Sorteo especial: " +
        fechasTexto +
        " Vendedor: " +
        data.boletosEspeciales[0].nombreVendedor,
      5,
      y + 3
    );
    y += 5;

    let boletosEspeciales = data.boletosEspeciales.map((boleto) => [
      boleto.Boleto,
      boleto.comprador,
      boleto.Costo,
      boleto.Fecha_venta,
    ]);
    doc.autoTable({
      startY: y,
      head: [["Boleto", "Comprador", "Costo", "Fecha"]],
      body: boletosEspeciales,
      styles: { fontSize: 8, cellWidth: "wrap" }, // Ajustar el tamaño de la fuente y el ancho de la celda
      columnStyles: { 0: { cellWidth: "auto" } }, // Ajustar el ancho de la primera columna
      margin: { left: 5 },
    });

    y = doc.autoTable.previous.finalY + 5; // Actualizar la posición y para la siguiente tabla
  }

  // Verificar si necesitamos agregar una nueva página
  if (y > 280) {
    doc.addPage();
    y = 20;
  }

  if (data.boletosNormales && data.boletosNormales.length > 0) {
    let fecha = data.boletosNormales[0].FechaSorteo.split("T")[0];
    // Agregar el nombre del vendedor al texto del sorteo normal
    doc.text("Sorteo normal: " + fecha, 5, y + 3);
    doc.text("Vendedor: " + data.boletosNormales[0].nombreVendedor, 5, y + 7);

    y += 10;
    let boletosNormales = data.boletosNormales.map((boleto) => [
      boleto.Boleto,
      boleto.comprador,
      boleto.Costo,
      boleto.Fecha_venta,
    ]);
    doc.autoTable({
      startY: y,
      head: [["Boleto", "Comprador", "Costo", "Fecha"]],
      body: boletosNormales,
      styles: { fontSize: 8, cellWidth: "wrap" }, // Ajustar el tamaño de la fuente y el ancho de la celda
      columnStyles: { 0: { cellWidth: "auto" } }, // Ajustar el ancho de la primera columna
      margin: { left: 5 },
    });
    y = doc.autoTable.previous.finalY + 5; // Actualizar la posición y para el total de boletos vendidos
  }

  // Verificar si necesitamos agregar una nueva página
  if (y > 280) {
    doc.addPage();
    y = 20;
  }

  // Agregar el total de boletos vendidos
  let totalBoletosVendidos =
    (data.boletosEspeciales ? data.boletosEspeciales.length : 0) +
    (data.boletosNormales ? data.boletosNormales.length : 0);
  let totalVentas =
    (data.boletosEspeciales
      ? data.boletosEspeciales.reduce((total, boleto) => total + boleto.Costo, 0)
      : 0) +
    (data.boletosNormales
      ? data.boletosNormales.reduce((total, boleto) => total + boleto.Costo, 0)
      : 0);

  // Calcular la comisión
  let comision = 0;
  if (data.boletosEspeciales && data.boletosEspeciales.length > 0) {
    comision = data.boletosEspeciales[0].comisiones / 100;
  } else if (data.boletosNormales && data.boletosNormales.length > 0) {
    comision = data.boletosNormales[0].comisiones / 100;
  }

  // Agregar la deuda del vendedor
  let deuda = 0;
  if (data.boletosEspeciales && data.boletosEspeciales.length > 0) {
    deuda = data.boletosEspeciales[0].deuda;
  } else if (data.boletosNormales && data.boletosNormales.length > 0) {
    deuda = data.boletosNormales[0].deuda;
  }
  if (deuda === null) {
    deuda = 0;
  }

  if (totalBoletosVendidos === 0) {
    Swal.fire({ title: "No hay boletos vendidos", icon: "error" });
    return;
  }

  let caja = totalVentas - totalVentas * comision;
  let puntosSumados = Math.floor(totalVentas / 100);

  doc.text("Total de boletos vendidos: " + totalBoletosVendidos, 5, y);
  doc.text("Porcentaje de comisión: " + comision * 100 + "%", 5, y + 5);
  doc.text("Puntos sumados: " + puntosSumados, 5, y + 10);
  doc.text("Venta: " + totalVentas, 5, y + 15);
  doc.text("Comisión: " + (totalVentas * comision).toFixed(2), 5, y + 20);
  doc.text("Caja: " + caja.toFixed(2), 5, y + 25);
  doc.text("Adeudo pendiente vendedor: " + deuda, 5, y + 30);
  doc.setFont("helvetica", "bold");
  doc.text("No incluido en el corte de caja", 5, y + 35);
  doc.setFont("helvetica");

  // Abrir el diálogo de impresión cuando el usuario abra el PDF
  doc.autoPrint();

  // Obtener una representación de datos del documento
  var blob = doc.output("blob");

  // Crear una URL para los datos
  var url = URL.createObjectURL(blob);

  // Mostrar una alerta con opción para imprimir
  const result = await Swal.fire({
    title: "Corte de caja exitoso",
    icon: "success",
    showCancelButton: true,
    allowOutsideClick: false,
    confirmButtonText: "Imprimir o Compartir",
  });

  if (result.isConfirmed) {
    // Si el usuario elige imprimir, abrir en una nueva pestaña
    window.open(url);
  }
  window.location.reload();
};

export default generatePDFBoxCut;