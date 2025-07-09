import jsPDF from "jspdf";
import Swal from "sweetalert2";

const generateWinnerPDF  = async (boleto, folio) => {
  // Crear un nuevo documento PDF con tamaño ajustado

  const formatDate = (dateString) => {
    const regex = /(\d{4})-(\d{2})-(\d{2})/;
    const match = dateString.match(regex);
    if (match) {
      const year = match[1];
      const month = match[2];
      const day = match[3];
      return `${day}/${month}/${year}`;
    }
    return dateString; // Retorna la cadena original si no coincide con el formato
  };

  var doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 140], // Reducir altura para evitar espacio en blanco excesivo
  });

  // URL de la imagen
  const imageURL = "/noSencillo.jpg";

  // Agregar la imagen al PDF
  doc.addImage(imageURL, "JPEG", 0, 0, 80, 30);

  // Agregar contenido al PDF
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 0, 0);
  doc.setFontSize(9); // Reducir tamaño para mejor ajuste
  let leyenda = "¡FELICIDADES POR TU BOLETO GANADOR!";
  var leyendaText = doc.splitTextToSize(leyenda, 70);
  doc.text(leyendaText, 5, 35);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14); // Reducir tamaño para mejor ajuste
  doc.text(`Comprobante de Pago`, 5, 45);

  // Mostrar detalles del boleto premiado
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Folio: ${folio || 'N/A'}`, 5, 55);
  doc.text(`Boleto: ${boleto.Boleto || 'N/A'}`, 5, 65);
  doc.text(`Cliente: ${boleto.Cliente || 'N/A'}`, 5, 75);
  
  // Formatear el premio como moneda
  const premio = boleto.Premio ? `$${boleto.Premio.toLocaleString('es-MX')}` : 'N/A';
  doc.text(`Premio: ${premio}`, 5, 85);
  
  // Formatear las fechas
  const fechaSorteo = boleto.Fecha_sorteo ?  formatDate(boleto.Fecha_sorteo) : 'N/A';
const Fecha_pago = boleto.Fecha_pago ? formatDate(boleto.Fecha_pago) : 'N/A';
  doc.text(`Fecha sorteo: ${fechaSorteo}`, 5, 95);
  doc.text(`Fecha pago: ${Fecha_pago}`, 5, 105);
  doc.text(`Vendedor: ${boleto.Vendedor || 'N/A'}`, 5, 113);

  // Agregar leyenda final
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9); // Reducir tamaño para mejor ajuste
  let leyendaFinal = "¡GRACIAS POR SU PREFERENCIA! EL TREBOL DE LA SUERTE.";
  var text = doc.splitTextToSize(leyendaFinal, 70);
  doc.text(text, 5, 120);

  // Imprimir automáticamente
  doc.autoPrint();
  
  // Obtener una representación de datos del documento y abrir en nueva ventana
  var blob = doc.output("blob");

  const file = new File([blob], "factura_boletos.pdf", {
    type: "application/pdf",
  });

  var url = URL.createObjectURL(blob);
  // window.open(url);

   // Mostrar una alerta con opciones para compartir o cancelar
  const result = await Swal.fire({
    title: "Operacion exitosa",
    icon: "success",
    showCancelButton: true,
    allowOutsideClick: false,
    confirmButtonText: "Compartir",
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) {
    if (navigator.share) {
      navigator
        .share({
          title: "Factura de boletos",
          text: "Hola, aquí tienes tu boleto, Suerte!.",
          files: [file],
        })
        .then(() => {
          console.log("Compartido exitosamente");
          window.location.reload(); // Recargar la página después de compartir
        })
        .catch((error) => {
          console.error("Error al compartir:", error);
          window.location.reload(); // Recargar la página si hay un error al compartir
        });
    } else {
      Swal.fire({
        title: "Error",
        text: "La funcionalidad de compartir no está disponible en este dispositivo.",
        icon: "error",
      })
      window.open(url); // Abrir la URL en una nueva ventana
    }
  } 
};

export default generateWinnerPDF;