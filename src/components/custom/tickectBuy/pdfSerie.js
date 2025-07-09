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
    const leyenda1Height = leyenda1Text.length * 3.5; // Aproximadamente 3.5mm por línea con font size 8
    
    // Calculamos altura total estimada + margen inferior
    const lastTextPosition = 125; // Última posición actual de texto
    const totalHeight = lastTextPosition + leyenda1Height + 10; // +10mm de margen inferior
    
    // Limitar la altura máxima a un valor razonable
    const finalHeight = Math.min(totalHeight, 297);

    // Crear un nuevo documento PDF con la altura calculada
    var doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, finalHeight]
    });

    doc.setFontSize(8);

    // URL de la imagen
    const imageURL = '/noSencillo.jpg';
    let totalCosto = data.map(item => item.Costo).reduce((acc, costo) => acc + costo, 0);

    // Agregar la imagen al PDF
    doc.addImage(imageURL, 'JPEG', 10, 10, 60, 30);

    // Agregar contenido al PDF
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 0, 0);
    doc.text(data[0].leyenda2, 5, 45);
    doc.setTextColor(0, 0, 0);
    doc.text(`Factura de boleto `, 5, 55);
    const textoAncho = doc.getTextWidth("Factura de boleto ");
    doc.setTextColor(255, 0, 0);
    doc.text(`N${data[0].Idsorteo}`, 5 + textoAncho, 55);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`Costo: $ ${totalCosto}`, 5, 65);
    doc.text(`Serie de boletos:`, 5, 75);
    let boletos = data.map(item => item.Boleto?.toString().padStart(3, '0')).join('-');
    doc.text(boletos, 5, 85);
    doc.text(`Sorteo: ${fechaSorteoFormateada}`, 5, 95);
    doc.text(`Comprador: ${data[0].comprador}`, 5, 105);
    doc.text(`Venta: ${data[0].Fecha_venta}`, 5, 115);
    doc.setFont('helvetica', 'bold');
    var text = doc.splitTextToSize(`${data[0].leyenda1}`, 70);
    doc.text(text, 5, 125);

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