import jsPDF from 'jspdf';
const generatePDF = (data, fecha) => {
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

    // Guardar el PDF
    doc.save('Factura.pdf');
}
export default generatePDF;