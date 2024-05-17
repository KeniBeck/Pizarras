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
        text: 'Este boleto a llegado a su tope permitido',
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
