import jsPDF from 'jspdf';
import Swal from 'sweetalert2';

const generatePDFSerie = async (data, fecha) => {

    // Mostrar ventana de carga
    Swal.showLoading();
    // Verificar si la longitud de data es igual a 10
    if (data.length !== 10) {
        // Si no es igual a 10, cerrar la ventana de carga y salir de la función
        return;
    }

    // Crear un nuevo documento PDF
    var doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, 297]
    });

    doc.setFontSize(8); // Ajustar el tamaño de la fuente

    // URL de la imagen
    const imageURL = '/noSencillo.jpg'; // Reemplaza con la URL de tu imagen
    let totalCosto = 0;
    if (totalCosto === 0) {
        for (let i = 0; i < 10; i++) {
            totalCosto += data[i].Costo;
        }
    }

    // Agregar la imagen al PDF
    doc.addImage(imageURL, 'JPEG', 10, 10, 60, 30);

    // Agregar contenidoc al PDF
    doc.text(`Factura de boleto N${data[0].Idsorteo}`, 10, 45);
    doc.text(`$ ${totalCosto}`, 10, 55);
    doc.text(`Serie de boletos:`, 10, 65);
    let boletos = data.map(item => item.Boleto.toString().padStart(3, '0')).join('-');
    doc.text(boletos, 10, 75);
    doc.text(`Sorteo: ${fecha}`, 10, 85);
    doc.text(` Compardor: ${data[0].comprador}`, 10, 95);
    doc.text(`Venta: ${data[0].Fecha}`, 10, 105);
    var text = doc.splitTextToSize(`los premios se pueden recoger solo presentando este boleto`, 70);
    doc.text(text, 10, 115);
    // Abrir el diálogo de impresión cuando el usuario abra el PDF
    doc.autoPrint();

    // Obtener una representación de datos del documento
    var blob = doc.output('blob');

    // Crear una URL para los datos
    var url = URL.createObjectURL(blob);

    const result = await Swal.fire({
        title: 'Compra exitosa',
        icon: 'success',
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: 'Imprimir o Compartir',
    });

    // Si el usuario elige imprimir, abrir la URL en una nueva pestaña
    if (result.isConfirmed) {
        window.open(url);

    }
    window.location.reload();
}

export default generatePDFSerie;