'use client'
import Swal from "sweetalert2";
import generatePDF from "../../tickectBuy/pdf";
export const ErrorPrizes = () => {
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'El numero debe ser multiplo de 10',
    });
}
export const ErrorTope = () => {
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Error en el tope de boletos',
    });
}
export const loading = (pathname) => {
    Swal.fire({
        title: 'Cargando',
        html: 'Por favor espere',
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading()
            if (pathname === '/menu') {
                Swal.close();
            }
        },
    });
}
export const error = () => {
    Swal.fire({
        position: 'top-center',
        title: 'Error',
        text: 'SORTEO CERRADO',
        icon: 'error',
        showConfirmButton: false,
        timer: 2500
    })
}
export const ValidateBox = () => {
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Campo vacio o incorrecto',
    });
}
export const prizesSeries = () => {
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'El valor debe ser mayor para poder generar la serie ',
    });
}
export const selectDate = async (dates) => {
    const { value: selectedDate } = await Swal.fire({
        title: 'Selecciona una fecha',
        input: 'select',
        inputOptions: dates.reduce((options, date) => {
            let formattedDate = new Date(date.Fecha).toISOString().split('T')[0];
            options[formattedDate] = formattedDate;
            return options;
        }, {}),
        inputPlaceholder: 'Selecciona una fecha',
        showCancelButton: false,
        allowOutsideClick: false,
    });

    if (selectedDate) {
        return dates.find(date => new Date(date.Fecha).toISOString().split('T')[0] === selectedDate);
    }
};
