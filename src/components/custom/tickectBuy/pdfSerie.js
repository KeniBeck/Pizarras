import jsPDF from 'jspdf';
import Swal from 'sweetalert2';

const formatDate = (dateString) => {
    const [day, month, year] = dateString.split(/[\/\-]/);
    return `${year}-${month}-${day}`;
};

const generatePDFSerie = async (data, fecha) => {
    const fechaSorteoFormateada = formatDate(fecha);

    // Mostrar ventana de carga
    Swal.showLoading();

    // Primero calculamos el espacio que ocupará la leyenda1 al final
    const tempDoc = new jsPDF();
    var leyenda1Text = tempDoc.splitTextToSize(`${data[0].leyenda1}`, 70);
    const leyenda1Height = leyenda1Text.length * 4; // Subido a 4mm por línea para fuente más grande

    // Calculamos altura total estimada + margen inferior
    const lastTextPosition = 130; // Ajustado para más espacio
    const totalHeight = lastTextPosition + leyenda1Height + 10;
    const finalHeight = Math.min(totalHeight, 297);

    // Crear un nuevo documento PDF con la altura calculada
    var doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, finalHeight]
    });

    doc.setFontSize(10); // Subido de 8 a 10

    // URL de la imagen
    const imageURL = '/noSencillo.jpg';
    let totalCosto = data.map(item => item.Costo).reduce((acc, costo) => acc + costo, 0);

    // Agregar la imagen al PDF
    doc.addImage(imageURL, 'JPEG', 10, 10, 60, 30);

    // Leyenda2 (con salto de línea robusto)
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 0, 0);
    doc.setFontSize(11);

    // Limpia espacios dobles y caracteres invisibles
    let leyenda2Clean = String(data[0].leyenda2 || "")
        .replace(/\s+/g, ' ')
        .replace(/\u00A0/g, ' ')
        .trim();

    // Si la línea es muy larga, inserta un espacio cada 30 caracteres para forzar corte
    leyenda2Clean = leyenda2Clean.replace(/(.{30})/g, '$1 ');

    const leyenda2Lines = doc.splitTextToSize(leyenda2Clean, 60); // Usa 60mm de ancho real
    let leyenda2StartY = 44; // <-- Más separado de la imagen (antes 42)
    doc.text(leyenda2Lines, 5, leyenda2StartY);

    let leyenda2Y = leyenda2StartY + (leyenda2Lines.length * 5);

    // Título y folio en líneas separadas
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13); // Antes 12
    doc.text(`Factura de boleto`, 5, 55);

    doc.setTextColor(255, 0, 0);
    doc.setFontSize(13); // Antes 12
    doc.text(`N${data[0].Idsorteo}`, 5, 65); // Folio en línea aparte

    // Datos principales
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11); // Antes 10
    doc.text(`Costo: $ ${totalCosto}`, 5, 75);
    doc.text(`Serie de boletos:`, 5, 85);

    // Serie de boletos: salto de línea cada 6 boletos
    let boletosArr = data.map(item => item.Boleto?.toString().padStart(3, '0'));
    let boletosLines = [];
    for (let i = 0; i < boletosArr.length; i += 6) {
        boletosLines.push(boletosArr.slice(i, i + 6).join('-'));
    }
    let serieY = 95;
    boletosLines.forEach((linea, idx) => {
        doc.text(linea, 5, serieY + (idx * 7)); // Antes 6, subido para más espacio con fuente más grande
    });

    let nextY = serieY + (boletosLines.length * 7); // Antes 6

    // Agregar más espacio entre la serie y el sorteo
    nextY += 5; // Aumenta el espacio, puedes ajustar el valor si quieres más o menos

    doc.text(`Sorteo: ${fechaSorteoFormateada}`, 5, nextY);
    doc.text(`Comprador: ${data[0].comprador}`, 5, nextY + 11);
    doc.text(`Venta: ${data[0].Fecha_venta}`, 5, nextY + 22); // Antes 20

    // Leyenda1 al final
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11); // Antes 10
    var text = doc.splitTextToSize(`${data[0].leyenda1}`, 70);
    doc.text(text, 5, nextY + 30); // Antes 30

    // Resto del código sin cambios
    doc.autoPrint();
    var blob = doc.output('blob');
    const file = new File([blob], 'factura_boletos.pdf', { type: 'application/pdf' });

    const result = await Swal.fire({
        title: 'Compra exitosa',
        icon: 'success',
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: 'Compartir',
    });

    if (result.isConfirmed) {
        if (navigator.share) {
            navigator.share({
                title: 'Factura de boletos',
                text: 'Hola, aquí tienes tu boleto, Suerte!.',
                files: [file],
            }).then(() => {
                console.log('Compartido exitosamente');
            }).catch((error) => {
                console.error('Error al compartir:', error);
                const url = URL.createObjectURL(blob);
                window.open(url);
                setTimeout(() => URL.revokeObjectURL(url), 30000);
            });
        } else {
            const url = URL.createObjectURL(blob);
            window.open(url);
            setTimeout(() => URL.revokeObjectURL(url), 30000);
        }
    }
}

export default generatePDFSerie;