import jsPDF from 'jspdf';
import Swal from 'sweetalert2';

const generatePDF = async (tickets, fecha) => {
    //traer leyenda
    let leyenda = await fetch('/api/leyenda')
        .then((res) => res.json())
        .catch((error) => console.log(error));



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
    doc.setFont('helvetica', 'bold');
    doc.text(`Factura de boletos`, 10, 40);

    // Mostrar detalles del comprador, sorteo y venta una sola vez
    const firstTicket = tickets[0];
    doc.setFont('helvetica', 'normal');
    doc.text(`Comprador: ${firstTicket.comprador}`, 10, 50);
    doc.text(`Sorteo: ${fecha}`, 10, 60);
    doc.text(`Venta: ${firstTicket.Fecha}`, 10, 70);

    let yPosition = 80; // Posición inicial en el eje Y para los boletos

    tickets.forEach((data, index) => {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 0, 0);
        doc.text(`N${data.Idsorteo}`, 10, yPosition);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.text(`Costo $ ${data.Costo}`, 10, yPosition + 10);
        doc.text(`Número de boleto: ${data.Boleto}`, 10, yPosition + 20);

        yPosition += 30; // Incrementar la posición Y para el siguiente boleto
    });

    // Dividir el texto en varias líneas para que se ajuste al tamaño de 80mm
    doc.setFont('helvetica', 'bold');
    var text = doc.splitTextToSize(`${leyenda.leyenda1}`, 70);
    doc.text(text, 10, yPosition);

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
    window.location.reload();
};

export default generatePDF;