import jsPDF from 'jspdf';
import Swal from 'sweetalert2';

export const generatePDF = (data, fecha) => {
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

    // Generar el PDF como un blob
    const pdfBlob = doc.output('blob');
    console.log(pdfBlob)

    // Crear una URL de objeto que represente el PDF
    const pdfUrl = URL.createObjectURL(pdfBlob);
    console.log(pdfUrl, 'dddddddd')
    // Devolver la URL del PDF
    return pdfUrl;
}

export const shareOrPrintAlert = (pdfUrl) => {
    Swal.fire({
        title: '¿Deseas imprimir o compartir el PDF?',
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonText: 'Compartir en WhatsApp',
        cancelButtonText: 'Imprimir',
        preConfirm: (result) => {
            if (result) {
                // Genera el enlace de WhatsApp con el PDF
                let whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent('Aquí está el PDF: ' + pdfUrl)}`;
                // Abre el enlace en una nueva pestaña
                window.open(whatsappUrl, '_blank');
            } else {
                // Abre el PDF en una nueva ventana y luego imprime esa ventana
                const printWindow = window.open(pdfUrl);
                printWindow.onload = function () {
                    printWindow.print();
                }
            }
        }
    });
}

