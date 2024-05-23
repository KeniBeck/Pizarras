'use client'
import { useRouter } from "next/navigation";
import { FaHome } from "react-icons/fa";
const TypeDraw = () => {

    const router = useRouter();

    const handleTickectBuy = () => {
        router.push('/tickectBuy')
    }
    const goToMenu = () => {
        router.push('/menu')
    }
    const handleTicketBuySerial = () => {
        router.push('/ticketBuyEspecial')
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