'use client'
import { useRouter } from "next/navigation";
import { FaHome } from "react-icons/fa";
import AlertMenu from "../alerts/menu/AlertMenu";
import { selectDate } from "../alerts/menu/Alerts";
import TickectBuyEspecial from "../ticketBuyEspecial/TickectBuyEspecial";
import { useState } from "react";
const TypeDraw = () => {
    const currentHour = new Date().getHours();
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(null);

    if (currentHour >= 20 || currentHour < 1) {
        return <AlertMenu />;
    }


    const handleTickectBuy = () => {
        router.push('/tickectBuy')
    }
    const goToMenu = () => {
        router.push('/menu')
    }
    const handleTicketBuySerial = () => {
        fetch('/api/ticketBuy', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(async data => {
                const selectedPrize = await selectDate(data.result);
                localStorage.setItem('TickectEspecial', JSON.stringify(selectedPrize));

                setSelectedDate(selectedPrize);
                if (selectedPrize) {
                    // Redirigir al usuario a la ruta ticketBuyEspecial con la fecha seleccionada
                    // Aquí se asume que quieres pasar la fecha seleccionada como un parámetro de consulta
                    router.push(`/ticketBuyEspecial`);
                } else {
                    // Manejar el caso en que el usuario cancela la selección (si es necesario)
                    console.log('Selección de fecha cancelada');
                }
            })
    }


    return (
        <div className="relative flex flex-col w-full max-w-sm mx-auto">
            <div className="text-white text-2xl text-center  ">Tipo de sorteo</div>
            <div className="w-full mt-5 px-8 space-y-3">
                <button className="rounded h-10 w-full bg-red-700 text-white" onClick={handleTickectBuy}>Hoy</button>
                <button className="rounded h-10 w-full bg-red-700 text-white" onClick={handleTicketBuySerial}>Especial</button>
            </div>
            <button
                onClick={goToMenu}
                className="fixed bottom-4 right-4 bg-red-700 text-white p-2 rounded-full"
            >
                <FaHome />
            </button>

        </div>


    );
}
export default TypeDraw;