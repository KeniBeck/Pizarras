import jsPDF from "jspdf";
import Swal from "sweetalert2";

export const generarPDFTotalVenta = async (total, ventas) => {
  try {
    // Calcular altura dinámica
    const baseHeight = 60; 
    const itemHeight = 12; // Volví a la altura original
    const itemsHeight = ventas.length * itemHeight;
    const totalHeight = baseHeight + itemsHeight + 40; 
    const finalHeight = Math.max(totalHeight, 120);

    // Crear doc
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, finalHeight],
    });

    // Logo
    const imageURL = "/noSencillo.jpg";
    doc.addImage(imageURL, "JPEG", 10, 2, 60, 20);

    // Titulo
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Reporte Total de Ventas", 5, 30);

    // Fecha de generacion
    const fecha = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generado: ${fecha}`, 5, 38);

    // Linea divisoria
    doc.setDrawColor(0);
    doc.line(5, 42, 75, 42);

    // Listar ventas
    let y = 50;
    ventas.forEach((v, i) => {
      // Determinar el tipo con su descripción
      let tipoDescripcion = "";
      switch(v.tipo) {
        case "boleto":
          tipoDescripcion = "Normal";
          break;
        case "serie":
          tipoDescripcion = "Serie";
          break;
        case "especial":
          tipoDescripcion = "Especial";
          break;
        case "premio":
          tipoDescripcion = "Premio";
          break;
        default:
          tipoDescripcion = v.tipo;
      }

      // Tipo y número/descripción en la MISMA línea con mejor espaciado
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(`${tipoDescripcion}:`, 5, y);

      doc.setFont("helvetica", "normal");
      doc.text(`${v.descripcion || v.numero}`, 20, y); // Más espacio entre tipo y número

      // Cantidad y subtotal en la misma línea a la derecha
      doc.text(`Cant: ${v.cantidad} - $${v.subtotal < 0 ? `-${Math.abs(v.subtotal)}` : v.subtotal}`, 45, y);

      y += 7; // Menos espacio entre líneas
    });

    // Linea antes del total
    doc.line(5, y, 75, y);
    y += 8;

    // Total
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    
    // Color del total basado en si es positivo o negativo
    if (total < 0) {
      doc.setTextColor(200, 0, 0);
    } else {
      doc.setTextColor(0, 150, 0);
    }
    
    doc.text(`TOTAL: $${total}`, 5, y);
    doc.text(`${total < 0 ? "(-)" : "(+)"}`, 65, y);
    doc.setTextColor(0, 0, 0); // Reset color

    // Descargar y compartir
    doc.autoPrint();

    var blob = doc.output("blob");
    const fileName = `Total_Ventas_${fecha}.pdf`;
    const file = new File([blob], fileName, { type: "application/pdf" });
    var url = URL.createObjectURL(blob);

    const result = await Swal.fire({
      title: "PDF generado",
      icon: "success",
      showDenyButton: true,
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonText: "Compartir",
      denyButtonText: "Descargar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      // Compartir
      if (navigator.share) {
        navigator
          .share({
            title: "Total de Ventas",
            text: "Aquí está tu reporte total de ventas.",
            files: [file],
          })
          .catch(() => window.open(url));
      } else {
        window.open(url);
      }
    } else if(result.isDenied){
      // Descargar
      doc.save(fileName)
    }

    setTimeout(() => URL.revokeObjectURL(url), 30000);
  } catch (error) {
    console.error("Error al generar PDF total:", error);
    Swal.fire("Error", "Hubo un problema al generar el PDF", "error");
  }
};