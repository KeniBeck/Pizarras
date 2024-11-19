import jsPDF from 'jspdf';
import Swal from 'sweetalert2';

const formatDate = (dateString) => {
    const [day, month, year] = dateString.split(/[\/\-]/);
    return `${year}-${month}-${day}`;
};

const generatePDFSerie = async (data, fecha) => {
    console.log(data,'pdf');
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

    // Agregar contenidoc al PDF
    doc.setFont('helvetica', 'bold');
    doc.text(`Factura de boleto `, 10, 45);
    const textoAncho = doc.getTextWidth("Factura de boleto ");
    doc.setTextColor(255, 0, 0);
    doc.text(`N${data[0].Idsorteo}`, 10 + textoAncho, 45);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`Costo: $ ${totalCosto}`, 10, 55);
    doc.text(`Serie de boletos:`, 10, 65);
    let boletos = data.map(item => item.Boleto?.toString().padStart(3, '0')).join('-');
    doc.text(boletos, 10, 75);
    doc.text(`Sorteo: ${fechaSorteoFormateada}`, 10, 85);
    doc.text(` Comprador: ${data[0].comprador}`, 10, 95);
    doc.text(`Venta: ${data[0].Fecha_venta}`, 10, 105);
    doc.setFont('helvetica', 'bold');
    var text = doc.splitTextToSize(`${data[0].leyenda}`, 70);
    doc.text(text, 10, 115);
    // Abrir el diálogo de impresión cuando el usuario abra el PDF
    doc.autoPrint();

    // Obtener una representación de datos del documento
    var blob = doc.output('blob');

    var url = URL.createObjectURL(blob);

    // Mostrar una alerta con opción para imprimir
    const result = await Swal.fire({
      title: "Corte de caja exitoso",
      icon: "success",
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonText: "Imprimir o Compartir",
    });
  
    if (result.isConfirmed) {
      // Si el usuario elige imprimir, abrir en una nueva pestaña
      window.open(url);
    }

    // const file = new File([blob], 'factura_boletos.pdf', { type: 'application/pdf' });
  

    // const result = await Swal.fire({
    //     title: 'Compra exitosa',
    //     icon: 'success',
    //     showCancelButton: true,
    //     allowOutsideClick: false,
    //     confirmButtonText: 'Compartir',
    // });

    // // Si el usuario elige imprimir, abrir la URL en una nueva pestaña
    // if (result.isConfirmed) {
    //     if (navigator.share) {
    //         navigator.share({
    //             title: 'Factura de boletos',
    //             text: 'Hola, aquí tienes tu boleto, Suerte!.',
    //             files: [file],
    //         }).then(() => {
    //             console.log('Compartido exitosamente');
    //         }).catch((error) => {
    //             console.error('Error al compartir:', error);
    //         });
    //     } else {
    //         Swal.fire({
    //             title: 'Error',
    //             text: 'La funcionalidad de compartir no está disponible en este dispositivo.',
    //             icon: 'error',
    //         });
    //     }

    // }

}

export default generatePDFSerie;