import jsPDF from 'jspdf';
import Swal from 'sweetalert2';

const generatePDF = async (data, fecha) => {
    // Crear un nuevo documento PDF
    var doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, 297]
    });

    // URL de la imagen
    const imageURL = '/noSencillo.jpg'; // Reemplaza con la URL de tu imagen

    // Agregar la imagen al PDF
    doc.addImage(imageURL, 'JPEG', 0, 0, 80, 30); // Ajusta las coordenadas y el tamaño según sea necesario

    // Agregar contenido al PDF
    doc.text(`Factura de boleto N${data.Idsorteo}`, 10, 40);
    doc.text(`$ ${data.Costo}`, 10, 50);
    doc.text(`Número de boleto: ${data.Boleto}`, 10, 60);
    doc.text(`Sorteo: ${fecha}`, 10, 70);
    doc.text(`Comprador: ${data.comprador}`, 10, 80);
    doc.text(`Venta: ${data.Fecha}`, 10, 90);

    // Dividir el texto en varias líneas para que se ajuste al tamaño de 80mm
    var text = doc.splitTextToSize(`los premios se pueden recoger solo presentando este boleto`, 70);
    doc.text(text, 10, 100);

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
        allowOutsideClick: false,
        confirmButtonText: 'Imprimir o Compartir',
    });

    if (result.isConfirmed) {
        // Si el usuario elige imprimir, abrir URL en una nueva pestaña
        window.open(url);
    }

}

export default generatePDF;