'use client'
import { IoTicketSharp } from "react-icons/io5";
import { ImStatsDots } from "react-icons/im";
import { FaCashRegister } from "react-icons/fa";
import { GiStarStruck } from "react-icons/gi";
import { RiLogoutBoxFill } from "react-icons/ri";
import useSession from "@/hook/useSession";
import { useRouter } from 'next/navigation'
import AlertMenu from "../alerts/menu/AlertMenu";



const ViewMenu = () => {
    const { getUserData } = useSession();
    const router = useRouter();
    let userData = getUserData();

    let accessBlocked = false;


    if (typeof window !== 'undefined') {
        userData = JSON.parse(localStorage.getItem('userData'));

        const currentHour = new Date().getHours();
        if (currentHour >= 18 || currentHour < 8) {
            accessBlocked = true;
        }
    }



    const handleTypeDraw = () => {
        if (!accessBlocked)
            router.push('/typeDraw')
    }


    return (
        <div>
            {accessBlocked ? (
                <div>
                    <AlertMenu />
                </div>
            ) : (
                <div className="w-full bg-[rgb(38,38,38)]">

                    <div className=" w-full flex justify-center items-center text-xl text-white p-10">Pizarras</div>
                    <div className="w-full flex justify-center items-center  flex-col space-y-1 pb-8">
                        {userData ? (
                            <>
                                <label className="text-white">Vendedor: {userData.Nombre}</label>
                                <label className="text-white">Sucursal: {userData.sucursal}</label>
                            </>
                        ) : (
                            // Maneja el caso en que no hay datos de usuario
                            <p className="text-white">Loading...</p>
                        )}
                    </div>
                    <div className="w-full flex flex-col space-y-10 pt-6 px-10 ">
                        <div className="relative">
                            <button className="w-full rounded-lg bg-red-700 text-white h-9 relative" onClick={handleTypeDraw}>
                                Boletos
                                <IoTicketSharp className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4" />
                            </button>
                        </div>
                        <div className="relative">
                            <button className="w-full rounded-lg bg-red-700 text-white h-9 relative">
                                Ventas del dia
                                <ImStatsDots className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4" />
                            </button>
                        </div>
                        <div className="relative">
                            <button className="w-full rounded-lg bg-red-700 text-white h-9 relative" >
                                Corte de caja
                                <FaCashRegister className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4" />
                            </button>
                        </div>
                        <div className="relative">
                            <button className="w-full rounded-lg bg-red-700 text-white h-9 relative">
                                Boletos premiados
                                <GiStarStruck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4" />
                            </button>
                        </div>
                        <div className="relative">
                            <button className="w-full rounded-lg bg-red-700 text-white h-9 relative">
                                Cerrar sección
                                <RiLogoutBoxFill className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4" />
                            </button>
                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}
export default ViewMenu;