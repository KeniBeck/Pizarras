import jsPDF from 'jspdf';
import Swal from 'sweetalert2';
import 'jspdf-autotable';

const generatePDFBoxCut = async (data) => {


    // Crear un nuevo documento PDF
    var doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, 600]
    });

    // Agregar contenido al PDF
    doc.setFontSize(10); // Ajustar el tamaño de la fuente

    // Agregar el encabezado "Corte de caja"
    var title = 'Corte de caja';
    var titleWidth = doc.getStringUnitWidth(title) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    var titleX = (doc.internal.pageSize.width - titleWidth) / 2;
    doc.text(title, titleX, 10);

    // Agregar la fecha y hora actual
    let now = new Date();
    let formattedNow = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
    var dateWidth = doc.getStringUnitWidth(formattedNow) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    var dateX = (doc.internal.pageSize.width - dateWidth) / 2;
    doc.text(formattedNow, dateX, 15);

    let y = 20;

    if (data.boletosEspeciales && data.boletosEspeciales.length > 0) {
        let fechasSorteo = [...new Set(data.boletosEspeciales.map(boleto => boleto.FechaSorteo.split('T')[0]))];
        let fechasTexto = fechasSorteo.join(', ');
        // Agregar el nombre del vendedor al texto del sorteo especial
        doc.text('Sorteo especial: ' + fechasTexto + ' Vendedor: ' + data.boletosEspeciales[0].nombreVendedor, 5, y + 3);
        y += 5;

        let boletosEspeciales = data.boletosEspeciales.map(boleto => [boleto.Boleto, boleto.comprador, boleto.Costo, boleto.Fecha]);
        doc.autoTable({
            startY: y,
            head: [['Boleto', 'Comprador', 'Costo', 'Fecha']],
            body: boletosEspeciales,
            styles: { fontSize: 8, cellWidth: 'wrap' }, // Ajustar el tamaño de la fuente y el ancho de la celda
            columnStyles: { 0: { cellWidth: 'auto' } }, // Ajustar el ancho de la primera columna
            margin: { left: 5 }
        });

        y = doc.autoTable.previous.finalY + 5; // Actualizar la posición y para la siguiente tabla
    }
    // Verificar si necesitamos agregar una nueva página
    if (y > 280) {
        doc.addPage();
        y = 20;
    }
    if (data.boletosNormales && data.boletosNormales.length > 0) {
        let fecha = data.boletosNormales[0].FechaSorteo.split('T')[0];
        // Agregar el nombre del vendedor al texto del sorteo normal
        doc.text('Sorteo normal: ' + fecha + ' Vendedor: ' + data.boletosNormales[0].nombreVendedor, 5, y + 3);

        y += 5;
        let boletosNormales = data.boletosNormales.map(boleto => [boleto.Boleto, boleto.comprador, boleto.Costo, boleto.Fecha]);
        doc.autoTable({
            startY: y,
            head: [['Boleto', 'Comprador', 'Costo', 'Fecha']],
            body: boletosNormales,
            styles: { fontSize: 8, cellWidth: 'wrap' }, // Ajustar el tamaño de la fuente y el ancho de la celda
            columnStyles: { 0: { cellWidth: 'auto' } }, // Ajustar el ancho de la primera columna
            margin: { left: 5 }
        });
        y = doc.autoTable.previous.finalY + 5; // Actualizar la posición y para el total de boletos vendidos
    }
    // Agregar el total de boletos vendidos
    let totalBoletosVendidos = data.boletosEspeciales.length + data.boletosNormales.length;
    let totalVentas = data.boletosEspeciales.reduce((total, boleto) => total + boleto.Costo, 0) +
        data.boletosNormales.reduce((total, boleto) => total + boleto.Costo, 0);
    // Agregar la deuda del vendedor
    let deuda = 0;
    if (data.boletosEspeciales.length > 0) {
        deuda = data.boletosEspeciales[0].deuda;
    } else if (data.boletosNormales.length > 0) {
        deuda = data.boletosNormales[0].deuda;
    }
    let caja = totalVentas - totalVentas * 0.10;
    doc.text('Total de boletos vendidos: ' + totalBoletosVendidos, 30, y);
    doc.text('Porcentaje de comision: 10% ', 30, y + 4);
    doc.text('Venta: ' + totalVentas, 60, y + 10);
    doc.text('Comision: ' + totalVentas * 0.10, 56, y + 14);
    doc.text('Caja:' + caja, 62.4, y + 18);
    doc.text('Adeudo pendiente vendedor:' + deuda, 16, y + 30);
    doc.setFont("helvetica", "bold");
    doc.text('No incluido en el corte de caja', 16, y + 35);
    doc.setFont("helvetica");
    // Abrir el diálogo de impresión cuando el usuario abra el PDF
    doc.autoPrint();

    // Obtener una representación de datos del documento
    var blob = doc.output('blob');

    // Crear una URL para los datos
    var url = URL.createObjectURL(blob);

    // Mostrar una alerta con opción para imprimir
    const result = await Swal.fire({
        title: 'Corte de caja exitoso',
        icon: 'success',
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: 'Imprimir o Compartir',
    });

    if (result.isConfirmed) {
        // Si el usuario elige imprimir, abrir en una nueva pestaña
        window.open(url);
    }
    window.location.reload();
}

export default generatePDFBoxCut;