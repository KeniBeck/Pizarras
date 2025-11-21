import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const generatePDFSraffle = (winner) => {
  // Crear un nuevo documento PDF
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a7", // Formato pequeño como un boleto
  });

  // Configuración básica
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 5;
  let y = 10;

  // Título
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Trébol de la suerte", pageWidth / 2, y, { align: "center" });
  y += 5;

  // Línea separadora
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // Subtítulo
  doc.setFontSize(8);
  doc.text("Boletos ganadores", pageWidth / 2, y, { align: "center" });
  y += 4;

  // Número de sorteo (aumentado el tamaño)
  doc.setFontSize(9.5);  // Aumentado de 8 a 9.5
  doc.text(`Sorteo ${winner.Sorteo}`, pageWidth / 2, y, { align: "center" });
  y += 4;  // Aumentado el espacio

  // Formatear fecha con nombre del día
  let fechaSorteo = "N/A";
  if (winner.fechasorteo) {
    // Extraer componentes de fecha directamente del string para evitar ajustes de zona horaria
    const fechaStr = winner.fechasorteo;
    
    // Si la fecha viene en formato ISO (YYYY-MM-DDTHH:mm:ss...)
    if (typeof fechaStr === 'string') {
      let year, month, day;
      
      if (fechaStr.includes('T')) {
        const [datePart] = fechaStr.split('T');
        [year, month, day] = datePart.split('-').map(num => parseInt(num, 10));
      } 
      // Si la fecha viene en formato YYYY-MM-DD
      else if (fechaStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        [year, month, day] = fechaStr.split('-').map(num => parseInt(num, 10));
      }
      
      if (year && month && day) {
        // Crear fecha especificando que debe interpretarse como UTC
        const fecha = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
        
        // Incluir el nombre del día en español con primera letra mayúscula
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const nombreDia = diasSemana[fecha.getUTCDay()];
        
        // Formatear con día numérico y mes abreviado para que quepa mejor
        const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        const mes = meses[month - 1];
        
        // Formato más compacto para asegurar que se centra bien
        fechaSorteo = `${nombreDia} ${day}-${mes}-${year}`;
      }
    } else {
      // Si no es un string, intentar con el método anterior
      try {
        const fecha = new Date(winner.fechasorteo);
        if (!isNaN(fecha.getTime())) {
          // Añadir 12 horas para evitar problemas con zonas horarias
          fecha.setHours(12, 0, 0, 0);
          
          const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
          const nombreDia = diasSemana[fecha.getDay()];
          
          const dia = fecha.getDate();
          const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
          const mes = meses[fecha.getMonth()];
          const anio = fecha.getFullYear();
          
          fechaSorteo = `${nombreDia} ${dia}-${mes}-${anio}`;
        }
      } catch (e) {
        console.error("Error al formatear fecha:", e);
        fechaSorteo = "Fecha no disponible";
      }
    }
  }
  
  // Aumentar tamaño de letra para la fecha y asegurar centrado
  doc.setFontSize(8.5);
  doc.text(fechaSorteo, pageWidth / 2, y, { align: "center" });
  y += 7;

  // Tabla de resultados
  const table = autoTable(doc, {
    startY: y,
    head: [["POSICIÓN", "NÚMERO"]],
    body: [
      ["1", winner.primerlugar],
      ["2", winner.segundolugar],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [139, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      halign: "center",
      fontSize: 10,
      cellPadding: 2,
    },
    margin: { top: y, left: margin, right: margin },
  });
  
  y = (doc.autoTable?.previous?.finalY) || (table.finalY || y) + 5;

  // Tipo de sorteo
  let tipoSorteo = "Normal";
  if (winner.Tipo_sorteo === "domingo") {
    tipoSorteo = "Domingo";
  } else if (winner.Tipo_sorteo === "especial") {
    tipoSorteo = "Especial";
  }
  doc.setFontSize(7);
  doc.text(`Tipo: ${tipoSorteo}`, pageWidth / 2, y, { align: "center" });
  y += 4;

  // Nota al pie
  doc.setFontSize(6);
  doc.setFont("helvetica", "italic");
  doc.text("Resultados oficiales", pageWidth / 2, y, { align: "center" });

  // Guardar el PDF con un nombre específico
  doc.save(`Sorteo_${winner.Sorteo || "Resultados"}.pdf`);
};

export default generatePDFSraffle;