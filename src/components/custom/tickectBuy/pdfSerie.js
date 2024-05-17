import jsPDF from 'jspdf';
import Swal from 'sweetalert2';

let alertShown = false;

const generatePDFSerie = async (data, fecha) => {
    // Crear un nuevo documento PDF
    var doc = new jsPDF();

    // Agregar contenido al PDF
    doc.text(`Factura de boleto N${data[0].Idsorteo}`, 10, 10);
    doc.text(`$ ${data[0].Costo}`, 10, 20);
    doc.text(`Serie de boletos:`, 10, 30);
    let boletos = data.map(item => item.Boleto.toString().padStart(3, '0')).join('-');
    doc.text(boletos, 10, 40);
    doc.text(`Sorteo: ${fecha}`, 10, 50);
    doc.text(` ${data[0].comprador}`, 10, 60);
    doc.text(`Venta: ${data[0].Fecha}`, 10, 70);
    doc.text(`los premios se pueden recoger solo presentando este boleto`, 10, 80);

    // Abrir el diálogo de impresión cuando el usuario abra el PDF
    doc.autoPrint();

    // Obtener una representación de datos del documento
    var blob = doc.output('blob');

    // Crear una URL para los datos
    var url = URL.createObjectURL(blob);

    // Mostrar una alerta con opción para imprimir solo si no se ha mostrado antes
    if (!alertShown) {
        const result = await Swal.fire({
            title: 'Compra exitosa',
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'Imprimir o Compartir',
        });

        // Si el usuario elige imprimir, abrir la URL en una nueva pestaña
        if (result.isConfirmed) {
            window.open(url);
        }

        // Marcar la alerta como mostrada
        alertShown = true;
    }
}

export default generatePDFSerie;