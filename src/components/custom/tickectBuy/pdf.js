import jsPDF from "jspdf";
import Swal from "sweetalert2";

const generatePDF = async (tickets, fecha, esCopia = false) => {
  try {
    console.log("📄 Iniciando generación de PDF con datos:", tickets);

    // Verificacion critica de datos
    if (!tickets || tickets.length === 0) {
      throw new Error("No hay datos de boletos para generar el PDF");
    }

    const firstTicket = tickets[0];

    if (!firstTicket || !firstTicket.comprador) {
      console.error("❌ Datos faltantes en boleto:", firstTicket);
      throw new Error("Datos incompletos en el boleto - falta comprador");
    }

    // PASO 1: Pre-calcular altura de leyendas para determinar tamaño de PDF
    let leyenda2 = firstTicket.leyenda2 || "";
    let leyenda1 = firstTicket.leyenda1 || "";

    const leyenda2FontSize = leyenda2.length > 300 ? 7 : leyenda2.length > 200 ? 8 : leyenda2.length > 100 ? 9 : 10;
    const leyenda1FontSize = leyenda1.length > 300 ? 7 : leyenda1.length > 200 ? 8 : leyenda1.length > 100 ? 9 : 10;

    // Calcular altura aproximada de leyendas
    const tempDoc = new jsPDF({ unit: "mm", format: "a4" });
    tempDoc.setFontSize(leyenda2FontSize);
    const leyenda2Lines = tempDoc.splitTextToSize(leyenda2, 70).length;
    const leyenda2Height = leyenda2Lines * (leyenda2FontSize * 0.4);
    tempDoc.setFontSize(leyenda1FontSize);
    const leyenda1Lines = tempDoc.splitTextToSize(leyenda1, 70).length;
    const leyenda1Height = leyenda1Lines * (leyenda1FontSize * 0.4);

    // Calcular altura real necesaria
    const baseHeight = 85;
    const ticketHeight = 36;
    const ticketsHeight = tickets.length * ticketHeight;
    const leyenda1Extra = leyenda1Height + 10;
    const leyenda2Extra = Math.max(0, leyenda2Height - 15);
    const totalHeight = baseHeight + ticketsHeight + leyenda1Extra + leyenda2Extra + 30;
    const finalDocHeight = Math.max(totalHeight, 120);

    // PASO 2: Crear documento con altura calculada
    var doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, finalDocHeight],
    });

    // URL de la imagen
    const imageURL = "/noSencillo.jpg";
    doc.addImage(imageURL, "JPEG", 10, 0, 60, 20);

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
    doc.setFontSize(16);
    
    // Aqui verificamos si la factura es una copia o no
    if (esCopia) {
      doc.text(`Factura de boletos (Copia)`, 5, nextY);
    } else {
      doc.text(`Factura de boletos`, 5, nextY);
    }
    nextY += 12;

    // Mostrar detalles del comprador con ajustes
    doc.setFont("helvetica", "normal");

    // Ajustar tamaño para textos largos
    const compradorText = firstTicket.comprador || "";
    const compradorSize = compradorText.length > 20 ? 11 : 12;
    doc.setFontSize(compradorSize);
    doc.text(`Comprador: ${compradorText}`, 5, nextY);
    nextY += 12;

    doc.setFontSize(12);
    doc.text(`Sorteo: ${fecha || ""}`, 5, nextY);
    nextY += 12;

    // Formatear fecha
    let fechaVenta = firstTicket.Fecha_venta || "";
    if (fechaVenta && fechaVenta.includes("T")) {
      const date = new Date(fechaVenta);
      fechaVenta = date.toLocaleDateString();
    }
    doc.text(`Venta: ${fechaVenta}`, 5, nextY);
    nextY += 12;

    // Posición inicial para boletos
    let yPosition = nextY;

    // Lista de boletos
    tickets.forEach((data, index) => {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 0, 0);
      doc.setFontSize(14);
      doc.text(`N${data.Idsorteo || ""}`, 5, yPosition);

      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(`Costo $ ${data.Costo || ""}`, 5, yPosition + 12);

      // Salto de línea extra antes del número de boleto
      let boletoFormatted = data.Boleto === 0 ? "000" : data.Boleto?.toString().padStart(3, "0") || "";
      const boletoSize = boletoFormatted.length > 15 ? 11 : 12;
      doc.setFontSize(boletoSize);
      doc.text(`Número de boleto: ${boletoFormatted}`, 5, yPosition + 24);

      if (data.qr_code) {
        const qrImage = data.qr_code;
        const qrX = 25;
        const qrY = yPosition + 30;
        const qrSize = 25;
        doc.addImage(qrImage, "PNG", qrX, qrY, qrSize, qrSize);
        yPosition = qrY + qrSize + 10;
      } else {
        yPosition += 36;
      }
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

    // Generar blob y URL
    var blob = doc.output("blob");
    const fileName = `Factura_Boletos_${firstTicket.comprador || "cliente"}.pdf`;
    const file = new File([blob], fileName, { type: "application/pdf" });
    var url = URL.createObjectURL(blob);

    // Esperar un poco y cerrar el loading
    await new Promise(resolve => setTimeout(resolve, 100));

    const result = await Swal.fire({
      title: "Operación exitosa",
      icon: "success",
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonText: "Compartir",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      if (navigator.share && navigator.canShare) {
        try {
          await navigator.share({
            title: "Factura de boletos",
            text: "Hola, aquí tienes tu boleto, ¡Suerte! 🍀",
            files: [file],
          });
        } catch (error) {
          window.open(url);
        }
      } else {
        window.open(url);
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