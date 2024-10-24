'use client'
import { useRouter } from "next/navigation";
import { FaHome } from "react-icons/fa";
import { selectDate } from "../alerts/menu/Alerts";
import { useState } from "react";
import updateInfo from "../validation/updateInfo";
import useSession from "@/hook/useSession";
const TypeDraw = () => {
    const { getUserData } = useSession();
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(null);
    const userData = getUserData();

    const handleTickectBuy = () => {
        router.push('/tickectBuy')
    }
    
 
    const goToMenu = () => {
        updateInfo(userData.Idvendedor).then(() => {
            router.push('/menu')
        });  
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
            <div className="text-white text-3xl text-center  ">Tipo de sorteo</div>
            <div className="w-full mt-5 px-8 space-y-3">
                <button className="rounded h-[56px] w-full bg-red-700 text-white text-xl" onClick={handleTickectBuy}>Hoy</button>
                <button className="rounded h-[56px] w-full bg-red-700 text-white text-xl" onClick={handleTicketBuySerial}>Especial</button>
            </div>
            <button
                onClick={goToMenu}
                className="fixed bottom-4 right-4 bg-red-700 text-white flex justify-center items-center rounded-full w-[70px] h-[70px] text-3xl"
            >
                <FaHome />
            </button>



        </div>


    );
}
export default TypeDraw;