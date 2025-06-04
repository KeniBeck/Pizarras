import jsPDF from "jspdf";
import Swal from "sweetalert2";

const generatePDF = async (tickets, fecha) => {
  try {
    // PASO 1: Pre-calcular altura de leyendas para determinar tamaño de PDF
    let leyenda2 = tickets[0].leyenda2 || "";
    let leyenda1 = tickets[0].leyenda1 || "";
    
    // Ajustes para leyendas extremadamente largas
    const leyenda2FontSize = 
      leyenda2.length > 300 ? 5 :
      leyenda2.length > 200 ? 6 : 
      leyenda2.length > 100 ? 7 : 8;
      
    const leyenda1FontSize = 
      leyenda1.length > 300 ? 5 :
      leyenda1.length > 200 ? 6 : 
      leyenda1.length > 100 ? 7 : 8;
    
    // Calcular altura aproximada de leyendas
    const tempDoc = new jsPDF({unit: "mm", format: "a4"});
    
    tempDoc.setFontSize(leyenda2FontSize);
    const leyenda2Lines = tempDoc.splitTextToSize(leyenda2, 70).length;
    const leyenda2Height = leyenda2Lines * (leyenda2FontSize * 0.4);
    
    tempDoc.setFontSize(leyenda1FontSize);
    const leyenda1Lines = tempDoc.splitTextToSize(leyenda1, 70).length;
    const leyenda1Height = leyenda1Lines * (leyenda1FontSize * 0.4);
    
    // Calcular altura real necesaria
    const baseHeight = 85;
    const ticketHeight = 30;
    const extraHeight = Math.max(0, leyenda2Height - 15) + Math.max(0, leyenda1Height - 15);
    const totalHeight = baseHeight + (tickets.length * ticketHeight) + extraHeight + 30;
    const docHeight = Math.min(totalHeight, 400);
    
    // PASO 2: Crear documento con altura calculada
    var doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, docHeight],
    });

    // URL de la imagen
    const imageURL = "/noSencillo.jpg";
    doc.addImage(imageURL, "JPEG", 0, 0, 80, 30);
    
    // PASO 3: Manejar primera leyenda (leyenda2) con mejor control
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 0, 0);
    doc.setFontSize(leyenda2FontSize);
    
    // Dividir texto y preparar para cálculo de altura
    const leyenda2Text = doc.splitTextToSize(leyenda2 || "", 70);
    
    // Calcular la altura que ocupará esta leyenda
    const leyenda2ActualHeight = leyenda2Text.length * (leyenda2FontSize * 0.4);
    
    // Posicionar texto
    doc.text(leyenda2Text, 5, 35);
    
    // Calcular posición para el siguiente elemento
    let nextY = 35 + leyenda2ActualHeight + 5;

    // Resto del encabezado
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text(`Factura de boletos`, 5, nextY);
    nextY += 10;

    // Mostrar detalles del comprador con ajustes
    const firstTicket = tickets[0];
    doc.setFont("helvetica", "normal");
    
    // Ajustar tamaño para textos largos
    const compradorText = firstTicket.comprador || "";
    const compradorSize = compradorText.length > 20 ? 9 : 10;
    doc.setFontSize(compradorSize);
    doc.text(`Comprador: ${compradorText}`, 5, nextY);
    nextY += 10;
    
    doc.setFontSize(10);
    doc.text(`Sorteo: ${fecha || ""}`, 5, nextY);
    nextY += 10;
    
    // Formatear fecha
    let fechaVenta = firstTicket.Fecha_venta || "";
    if (fechaVenta && fechaVenta.includes("T")) {
      const date = new Date(fechaVenta);
      fechaVenta = date.toLocaleDateString();
    }
    doc.text(`Venta: ${fechaVenta}`, 5, nextY);
    nextY += 10;

    // Posición inicial para boletos
    let yPosition = nextY;

    // Lista de boletos
    tickets.forEach((data, index) => {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 0, 0);
      doc.text(`N${data.Idsorteo || ""}`, 5, yPosition);
      
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.text(`Costo $ ${data.Costo || ""}`, 5, yPosition + 10);
      if(data.Boleto === 0){
        data.Boleto = "000"
      }
      const boletoText = data.Boleto || "";
      const boletoSize = boletoText.length > 15 ? 9 : 10;
      doc.setFontSize(boletoSize);
      doc.text(`Número de boleto: ${boletoText}`, 5, yPosition + 20);
      doc.setFontSize(10);

      yPosition += 30;
    });

    // PASO 4: Manejar leyenda final (leyenda1) con mejor control
    doc.setFont("helvetica", "bold");
    doc.setFontSize(leyenda1FontSize);
    
    // Dividir texto para ajuste a anchura
    const leyenda1TextFinal = doc.splitTextToSize(leyenda1 || "", 70);
    
    // Calcular si necesitamos compactar el texto para leyendas muy largas
    if (leyenda1TextFinal.length > 8) {
      // Para leyendas extremadamente largas, render compacto
      for (let i = 0; i < leyenda1TextFinal.length; i++) {
        // Reducir espacio entre líneas para leyendas muy largas
        const lineHeight = leyenda1FontSize * 0.35; 
        doc.text(leyenda1TextFinal[i], 5, yPosition + (i * lineHeight));
      }
    } else {
      // Para leyendas normales, render estándar
      doc.text(leyenda1TextFinal, 5, yPosition);
    }

    // Imprimir automáticamente
    doc.autoPrint();
    
    // Resto del código igual...
    var blob = doc.output("blob");
    const fileName = `Factura_Boletos_${firstTicket.comprador || "cliente"}.pdf`;
    const file = new File([blob], fileName, { type: "application/pdf" });
    var url = URL.createObjectURL(blob);

    // Mostrar opciones
    const result = await Swal.fire({
      title: "Operación exitosa",
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
          })
          .catch((error) => {
            console.error("Error al compartir:", error);
            window.open(url);
          });
      } else {
        Swal.fire({
          title: "Información",
          text: "Se abrirá el PDF para su visualización e impresión",
          icon: "info",
          timer: 2000,
          timerProgressBar: true,
        }).then(() => {
          window.open(url);
        });
      }
    }

    setTimeout(() => URL.revokeObjectURL(url), 30000);
    
  } catch (error) {
    console.error("Error al generar el PDF:", error);
    Swal.fire({
      title: "Error",
      text: "Hubo un problema al generar el PDF. Por favor, intente nuevamente.",
      icon: "error",
    });
  }
};

export default generatePDF;