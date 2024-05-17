import jsPDF from 'jspdf';
import Swal from 'sweetalert2';

const generatePDF = async (data, fecha) => {
    // Crear un nuevo documento PDF
    var doc = new jsPDF();
    console.log(data);

    // Agregar contenido al PDF
    doc.text(`Factura de boleto N${data.Idsorteo}`, 10, 10);
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

    // Mostrar una alerta con opción para imprimir
    const result = await Swal.fire({
        title: 'Compra exitosa',
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'Imprimir o Compartir',
    });

    if (result.isConfirmed) {
        // Si el usuario elige imprimir, abrir la URL en una nueva pestaña
        window.open(url);
    }

}

export default generatePDF;