import jsPDF from 'jspdf';
import Swal from 'sweetalert2';

const formatDate = (dateString) => {
    const [day, month, year] = dateString.split(/[\/\-]/);
    return `${year}-${month}-${day}`;
};

const generatePDFSerie = async (data, fecha) => {
    // Verificar que hay datos validos
    if (!data || data.length === 0 || !data[0]) {
        console.error("❌ Datos inválidos para PDF serie:", data);
        await Swal.fire({
            title: "Error",
            text: "No hay datos válidos para generar el PDF de la serie",
            icon: "error",
        });
        return;
    }

    const fechaSorteoFormateada = formatDate(fecha);

    // VERIFICAR LEYENDAS
    const firstTicket = data[0];
    const leyenda1 = firstTicket.leyenda1 || "";
    const leyenda2 = firstTicket.leyenda2 || "";

    // Mostrar ventana de carga
    Swal.showLoading();

    // Primero calculamos el espacio que ocupará la leyenda1 al final
    const tempDoc = new jsPDF();
    var leyenda1Text = tempDoc.splitTextToSize(`${data[0].leyenda1}`, 70);
    const leyenda1Height = leyenda1Text.length * 4;

    // Calcular altura dinámica según cantidad de boletos
    const boletosHeight = data.length * 6; // Aumentado a 6mm por boleto (más espacio)
    const datosExtraHeight = 40;
    const totalHeight = 80 + boletosHeight + leyenda1Height + datosExtraHeight;
    const finalHeight = Math.min(totalHeight, 297);

    // Crear un nuevo documento PDF con la altura calculada
    var doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, finalHeight]
    });

    doc.setFontSize(10);

    // URL de la imagen
    const imageURL = '/noSencillo.jpg';
    let totalCosto = data.map(item => item.Costo).reduce((acc, costo) => acc + costo, 0);

    // Agregar la imagen al PDF
    doc.addImage(imageURL, 'JPEG', 10, 10, 60, 30);

    // Leyenda2
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 0, 0);
    doc.setFontSize(11);

    let leyenda2Clean = String(data[0].leyenda2 || "")
        .replace(/\s+/g, ' ')
        .replace(/\u00A0/g, ' ')
        .trim();

    leyenda2Clean = leyenda2Clean.replace(/(.{30})/g, '$1 ');
    const leyenda2Lines = doc.splitTextToSize(leyenda2Clean, 60);
    let leyenda2StartY = 44;
    doc.text(leyenda2Lines, 5, leyenda2StartY);

    let leyenda2Y = leyenda2StartY + (leyenda2Lines.length * 5);

    let posY = 55;
    // Título y folio en líneas separadas
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.text(`Factura de boleto`, 5, posY);

    // Costo
    posY += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Costo: $ ${totalCosto}`, 5, posY);

    // Encabezado
    posY += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`Serie de boletos:`, 5, posY);

    // Ahora ya podemos identificar el numero del boleto y el numero de serie de manera mas entendible
    data.forEach((boleto, index) => {
        const numero = boleto.Boleto?.toString().padStart(3, "0");
        const ns = `N${boleto.Idsorteo}`;
        posY += 6; 
        
        // Escribir "Numero: " en negro
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0); // Negro
        doc.text(`Número: ${numero} - `, 5, posY);
        
        // Calcular posición para "N/S:" 
        const numeroTextWidth = doc.getTextWidth(`Número: ${numero} - `);
        
        // Escribir "N/S:" en rojo
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 0, 0); // Rojo
        doc.text('N/S:', 5 + numeroTextWidth, posY);
        
        // Calcular posición para el número de serie
        const nsTextWidth = doc.getTextWidth('N/S:');
        
        // Escribir el número de serie en negro
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0); // Negro
        doc.text(` ${ns}`, 5 + numeroTextWidth + nsTextWidth, posY);
    });

    // Datos principales
    posY += 10;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // Asegurar negro
    doc.text(`Sorteo: ${fechaSorteoFormateada}`, 5, posY);

    posY += 6;
    doc.text(`Comprador: ${data[0].comprador}`, 5, posY);

    posY += 6;
    doc.text(`Venta: ${data[0].Fecha_venta}`, 5, posY);

    // Leyenda1 al final
    posY += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    var text = doc.splitTextToSize(`${data[0].leyenda1}`, 70);
    doc.text(text, 5, posY);

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