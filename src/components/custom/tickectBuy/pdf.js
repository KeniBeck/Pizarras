import jsPDF from "jspdf";
import Swal from "sweetalert2";

const generatePDF = async (tickets, fecha) => {
  // Crear un nuevo documento PDF
  var doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 297],
  });

  // URL de la imagen
  const imageURL = "/noSencillo.jpg"; // Reemplaza con la URL de tu imagen

  // Agregar la imagen al PDF
  doc.addImage(imageURL, "JPEG", 0, 0, 80, 30); // Ajusta las coordenadas y el tamaño según sea necesario

  // Agregar contenido al PDF
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255,0,0);
  doc.setFontSize(10);
  let leyenda = tickets[0].leyenda2;
  var leyendaText = doc.splitTextToSize(`${leyenda}`, 70);
  doc.text(leyendaText, 5, 35); // Ajustar la coordenada x a 5 para pegarlo más al borde
  doc.setTextColor(0,0,0);
  doc.setFontSize(16);
// Ajustar el tamaño de la fuente a 10
  doc.text(`Factura de boletos`, 5, 45); // Ajustar la coordenada x a 5 para pegarlo más al borde

  // Mostrar detalles del comprador, sorteo y venta una sola vez
  const firstTicket = tickets[0];
  doc.setFont("helvetica", "normal");
  doc.text(`Comprador: ${firstTicket.comprador}`, 5, 55); // Ajustar la coordenada x a 5 para pegarlo más al borde
  doc.text(`Sorteo: ${fecha}`, 5, 65); // Ajustar la coordenada x a 5 para pegarlo más al borde
  doc.text(`Venta: ${firstTicket.Fecha_venta}`, 5, 75); // Ajustar la coordenada x a 5 para pegarlo más al borde

  let yPosition = 85; // Posición inicial en el eje Y para los boletos

  tickets.forEach((data, index) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 0, 0);
    doc.text(`N${data.Idsorteo}`, 5, yPosition); // Ajustar la coordenada x a 5 para pegarlo más al borde
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`Costo $ ${data.Costo}`, 5, yPosition + 10); // Ajustar la coordenada x a 5 para pegarlo más al borde
    doc.text(`Número de boleto: ${data.Boleto}`, 5, yPosition + 20); // Ajustar la coordenada x a 5 para pegarlo más al borde

    yPosition += 30; // Incrementar la posición Y para el siguiente boleto
  });

  // Dividir el texto en varias líneas para que se ajuste al tamaño de 80mm
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  let leyendaFinal = tickets[0].leyenda1;
  var text = doc.splitTextToSize(`${leyendaFinal}`, 70);
  doc.text(text, 5, yPosition); // Ajustar la coordenada x a 5 para pegarlo más al borde

  // Obtener una representación de datos del documento
  var blob = doc.output("blob");
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

  // // Crear un archivo a partir del blob
  // const file = new File([blob], "factura_boletos.pdf", {
  //   type: "application/pdf",
  // });

  // // Mostrar una alerta con opciones para compartir o cancelar
  // const result = await Swal.fire({
  //   title: "Operacion exitosa",
  //   icon: "success",
  //   showCancelButton: true,
  //   allowOutsideClick: false,
  //   confirmButtonText: "Compartir",
  //   cancelButtonText: "Cancelar",
  // });

  // if (result.isConfirmed) {
  //   if (navigator.share) {
  //     navigator
  //       .share({
  //         title: "Factura de boletos",
  //         text: "Hola, aquí tienes tu boleto, Suerte!.",
  //         files: [file],
  //       })
  //       .then(() => {
  //         console.log("Compartido exitosamente");
  //         window.location.reload(); // Recargar la página después de compartir
  //       })
  //       .catch((error) => {
  //         console.error("Error al compartir:", error);
  //         window.location.reload(); // Recargar la página si hay un error al compartir
  //       });
  //   } else {
  //     Swal.fire({
  //       title: "Error",
  //       text: "La funcionalidad de compartir no está disponible en este dispositivo.",
  //       icon: "error",
  //     }).then(() => {
  //       window.location.reload(); // Recargar la página después de mostrar el error
  //     });
  //   }
  // } else {
  //   window.location.reload(); // Recargar la página si se cancela o se hace clic fuera de la ventana
  // }
};

export default generatePDF;