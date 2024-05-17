import jsPDF from 'jspdf';
import Swal from 'sweetalert2';

const generatePDF = async (data, fecha) => {
    // Crear un nuevo documento PDF
    var doc = new jsPDF();

    // Agregar contenido al PDF
    doc.text('Factura de boleto', 10, 10);
    doc.text(`$ ${data.Costo}`, 10, 20);
    doc.text(`Número de boleto: ${data.Boleto}`, 10, 30);
    doc.text(`Sorteo: ${fecha}`, 10, 40);
    doc.text(` ${data.comprador}`, 10, 50);
    doc.text(`Venta: ${data.Fecha}`, 10, 60);
    doc.text(`los premios se pueden recoger solo presentando este boleto`, 10, 70);

    // Abrir el diálogo de impresión cuando el usuario abra el PDF
    doc.autoPrint();

    // Obtener una representación de datos del documento
    var blob = doc.output('blob');

    // Crear una URL para los datos
    var url = URL.createObjectURL(blob);

    // Mostrar una alerta con opciones para imprimir o compartir por WhatsApp
    const result = await Swal.fire({
        title: '¿Qué quieres hacer?',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Imprimir',
        denyButtonText: 'Compartir por WhatsApp',
    });

    if (result.isConfirmed) {
        // Si el usuario elige imprimir, abrir la URL en una nueva pestaña
        window.open(url);
    } else if (result.isDenied) {
        // Si el usuario elige compartir por WhatsApp, abrir WhatsApp con la URL del PDF
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent('Aquí está el PDF: ' + url)}`);
    }
}

export default generatePDF;