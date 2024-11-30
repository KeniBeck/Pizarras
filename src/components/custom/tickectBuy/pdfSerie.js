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

    // Crear un nuevo documento PDF
    var doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, 297]
    });

    doc.setFontSize(8); // Ajustar el tamaño de la fuente

    // URL de la imagen
    const imageURL = '/noSencillo.jpg'; // Reemplaza con la URL de tu imagen
    let totalCosto = data.map(item => item.Costo).reduce((acc, costo) => acc + costo, 0);

    // Agregar la imagen al PDF
    doc.addImage(imageURL, 'JPEG', 10, 10, 60, 30);

    // Agregar contenido al PDF
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 0, 0);
    doc.text(data[0].leyenda2, 5, 45); // Ajustar la posición de la leyenda2 más abajo
    doc.setTextColor(0, 0, 0);
    doc.text(`Factura de boleto `, 5, 55); // Ajustar la posición del título
    const textoAncho = doc.getTextWidth("Factura de boleto ");
    doc.setTextColor(255, 0, 0);
    doc.text(`N${data[0].Idsorteo}`, 5 + textoAncho, 55); // Ajustar la posición del número de sorteo
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`Costo: $ ${totalCosto}`, 5, 65); // Ajustar la posición del costo
    doc.text(`Serie de boletos:`, 5, 75); // Ajustar la posición de la serie de boletos
    let boletos = data.map(item => item.Boleto?.toString().padStart(3, '0')).join('-');
    doc.text(boletos, 5, 85); // Ajustar la posición de los boletos
    doc.text(`Sorteo: ${fechaSorteoFormateada}`, 5, 95); // Ajustar la posición de la fecha del sorteo
    doc.text(`Comprador: ${data[0].comprador}`, 5, 105); // Ajustar la posición del comprador
    doc.text(`Venta: ${data[0].Fecha_venta}`, 5, 115); // Ajustar la posición de la fecha de venta
    doc.setFont('helvetica', 'bold');
    var text = doc.splitTextToSize(`${data[0].leyenda1}`, 70);
    doc.text(text, 5, 125); // Ajustar la posición de la leyenda1

    // Abrir el diálogo de impresión cuando el usuario abra el PDF
    doc.autoPrint();

    // Obtener una representación de datos del documento
    var blob = doc.output('blob');
  
    const file = new File([blob], 'factura_boletos.pdf', { type: 'application/pdf' });
  
    const result = await Swal.fire({
        title: 'Compra exitosa',
        icon: 'success',
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: 'Compartir',
    });

    // Si el usuario elige imprimir, abrir la URL en una nueva pestaña
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
            });
        } else {
            Swal.fire({
                title: 'Error',
                text: 'La funcionalidad de compartir no está disponible en este dispositivo.',
                icon: 'error',
            });
        }
    }
}

export default generatePDFSerie;