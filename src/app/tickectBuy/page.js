'use client'
import { useState } from "react";
import Swal from "sweetalert2";
import TicketBuy from "@/components/custom/tickectBuy/TickectBuy";
import RouteProtected from "@/middleware/RouteProtected";

const BuyTicket = () => {
  // const [showTicketBuy, setShowTicketBuy] = useState(false);

  // const handleDateChange = async () => {
  //   const { value: date } = await Swal.fire({
  //     title: "Selecione la fecha del sorteo:",
  //     input: "date",
  //     didOpen: () => {
  //       const today = (new Date()).toISOString();
  //       Swal.getInput().min = today.split("T")[0];
  //     }
  //   });

  //   if (date) {
  //     console.log(date);
  //     setShowTicketBuy(true);
  //   } else {
  //     Swal.fire({
  //       title: '¡Atención!',
  //       text: 'Por favor, selecciona una fecha.',
  //       icon: 'warning',
  //       confirmButtonText: 'Aceptar'
  //     });
  //   }
  // };


  return (
    <RouteProtected>
      <>

        <div className="w-full h-screen bg-[rgb(38,38,38)]">
          <TicketBuy />
        </div>


      </>
    </RouteProtected>
  );
}

export default BuyTicket;