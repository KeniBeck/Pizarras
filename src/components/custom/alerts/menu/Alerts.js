"use client";
import Swal from "sweetalert2";
import generatePDFBoxCut from "../../boxCut/pdfBoxCut";


export const ErrorPrizes = () => {
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: "El numero debe ser multiplo de 10",
  });
};
export const ErrorTope = () => {
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: "Error en el tope de boletos",
  });
};
export const loading = (pathname) => {
  Swal.fire({
    title: "Cargando",
    html: "Por favor espere",
    timerProgressBar: true,
    didOpen: () => {
      Swal.showLoading();
      if (pathname === "/menu") {
        Swal.close();
      }
    },
  });
};
export const error = () => {
  Swal.fire({
    position: "top-center",
    title: "Error",
    text: "SORTEO CERRADO",
    icon: "error",
    showConfirmButton: false,
    timer: 2500,
  });
};
export const ValidateBox = () => {
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: "Campo vacio o incorrecto",
  });
};
export const prizesSeries = () => {
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: "El valor debe ser mayor para poder generar la serie ",
  });
};
export const selectDate = async (dates) => {
  const { value: selectedDate } = await Swal.fire({
    title: "Selecciona una fecha",
    input: "select",
    inputOptions: dates.reduce((options, date) => {
      let formattedDate = new Date(date.Fecha).toISOString().split("T")[0];
      options[formattedDate] = formattedDate;
      return options;
    }, {}),
    inputPlaceholder: "Selecciona una fecha",
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    allowOutsideClick: false,
    allowEscapeKey: false,
  });

  if (selectedDate) {
    return dates.find(
      (date) =>
        new Date(date.Fecha).toISOString().split("T")[0] === selectedDate
    );
  }
};
export const deleteTicket = async (ticket) => {
  const { value: action } = await Swal.fire({
    title: "¿Estás seguro de que deseas eliminar este boleto?",
    showDenyButton: true,
    confirmButtonText: `Eliminar`,
    denyButtonText: `Cancelar`,
    allowOutsideClick: false,
    allowEscapeKey: false,
  });
  if (action) {
    const response = await fetch("/api/viewTickects", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ticket),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }
};

export const printBoxCut = async (userData) => {
  const fetchData = async () => {
    try {
      const response = await fetch("/api/boxCut", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error);
      return null;
    }
  };
 
  const { value: action } = await Swal.fire({
    title: "¿Deseas hacer un corte de caja?",
    showDenyButton: true,
    confirmButtonText: `Corte de caja`,
    denyButtonText: `Cancelar`,
    allowOutsideClick: false,
    allowEscapeKey: false,
  });

  if (action) {
    const boxCut = await fetchData();
    if ( boxCut.boletosEspeciales === undefined && boxCut.boletosNormales === undefined) {
       Swal.fire({ title: "Corte de caja realizado", icon: "error" });
        return;
    }
    if (boxCut) {
      console.log("boxCut", boxCut);
      generatePDFBoxCut(boxCut); // Asume que generatePDF es la función que imprime el corte de caja
    } else {
      Swal.fire({ title: "Error al obtener los datos", icon: "error" });
    }
  }
};
export const Especial = () => {
  Swal.fire({
    icon: "warning",
    title: "¡Boleto repetido !",
    text: "Boleto especial repetido",
  });
};
