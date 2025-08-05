'use client'
import { IoTicketSharp } from "react-icons/io5";
import { ImStatsDots } from "react-icons/im";
import { FaCashRegister, FaHome } from "react-icons/fa";
import { RiLogoutBoxFill } from "react-icons/ri";
import useSession from "@/hook/useSession";
import { useRouter } from 'next/navigation'
import AlertMenu from "../alerts/menu/AlertMenu";
import { useEffect, useState } from "react";
import { FaClover } from "react-icons/fa6";
import { GiPodiumWinner } from "react-icons/gi";


const ViewMenu = () => {
    let mensaje = null;
    const router = useRouter();
    let userData = null;

    const { logout } = useSession();
    const [cerrarSession, setCerrarSession] = useState(false);

    const session = () => {
        setCerrarSession(true);
    };

    if (cerrarSession) {
        logout();
        window.location.href = '/';
    }

    let accessBlocked = false;

    if (typeof window !== 'undefined') {
        userData = JSON.parse(localStorage.getItem('userData'));
        mensaje = userData.mensaje;
        const currentHour = new Date().getHours();
    }

    const handleTypeDraw = () => {
        if (!accessBlocked)
            router.push('/typeDraw')
    }

    const handleboxCut = async (userData) => {
        console.log("userData:", userData.sucursal);
        if (userData && userData.sucursal === "Loteria") {
            console.log("Accediendo a BoxCutLotery");
            router.push('boxCutLotery');
        } else {
            console.log("Acceso denegado a BoxCutLotery");
            router.push('/loginAdmin')
        }

    }

    const handleWinnerSraffle = () => {
        router.push('/winnerSraffle');
    }

    const handleWinnigTicket = () => {
        router.push('/winningTicket')
    }

    // Verificar si el usuario pertenece a la sucursal Loteria
    const isLoteriaUser = userData && userData.sucursal === "Loteria";

    return (
        <div className="relative min-h-screen">
            {accessBlocked ? (
                <div>
                    <AlertMenu />
                </div>
            ) : (
                <div className="w-full bg-[rgb(38,38,38)]">
                    <div className=" w-full flex justify-center items-center text-2xl  pt-6 pb-2">
                        <FaClover className="h-10 mr-2 text-green-700" />
                        <label className="text-[#FFF113]">El Trebol De La Suerte</label>
                    </div>
                    <div className="w-full flex justify-center items-center  flex-col space-y-1 pb-4">
                        {userData ? (
                            <>
                                <label className="text-white text-xl">Vendedor: {userData.Nombre}</label>
                                <label className="text-white text-xl">Sucursal: {userData.sucursal}</label>
                            </>
                        ) : (
                            // Maneja el caso en que no hay datos de usuario
                            <p className="text-white">Loading...</p>
                        )}
                    </div>
                    {mensaje && (
                        <div className="flex justify-center items-center px-8">
                            <div className="flex justify-center items-center text-lg text-white  bg-green-700 p-4 rounded-xl">
                                {mensaje}
                            </div>
                        </div>
                    )}

                    <div className="w-full flex flex-col space-y-6 pt-6 px-10 ">
                        <div className="relative">
                            <button className="w-full rounded-lg bg-red-700 text-white text-2xl  h-[66px] relative" onClick={handleTypeDraw}>
                                Boletos
                                <IoTicketSharp className="absolute left-3 top-1/2 transform -translate-y-1/2 h-10" />
                            </button>
                        </div>
                        {isLoteriaUser && (
                            <div className="relative">
                                <button
                                    onClick={() => handleWinnerSraffle()}
                                    className="w-full rounded-lg bg-red-700 text-white text-2xl  h-[66px] relative">
                                    Boletos premiados
                                    <ImStatsDots className="absolute left-3 top-1/2 transform -translate-y-1/2 h-10" />
                                </button>
                            </div>
                        )}
                        <div className="relative">
                            <button
                                onClick={() => handleboxCut(userData)}
                                className="w-full rounded-lg bg-red-700 text-white text-2xl  h-[66px] relative" >
                                Corte de caja
                                <FaCashRegister className="absolute left-3 top-1/2 transform -translate-y-1/2 h-10" />
                            </button>
                        </div>

                        {/* Mostrar botón de boletos ganadores solo si el usuario es de la sucursal Loteria */}
                        {isLoteriaUser && (
                            <div className="relative">
                                <button
                                    onClick={() => handleWinnigTicket(userData)}
                                    className="w-full rounded-lg bg-red-700 text-white text-2xl h-[66px] relative" >
                                    Boletos ganadores
                                    <GiPodiumWinner className="absolute left-3 top-1/2 transform -translate-y-1/2 h-10" />
                                </button>
                            </div>
                        )}

                        <div className="relative">
                            <button className="w-full rounded-lg bg-red-700 text-white text-2xl h-[66px] relative" onClick={session}>
                                Cerrar sesión
                                <RiLogoutBoxFill className="absolute left-3 top-1/2 transform -translate-y-1/2 h-10" />
                            </button>
                            <div>
                                {cerrarSession}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="fixed bottom-4 right-4 bg-green-700 flex items-center justify-center text-white h-[60px] w-[160px] rounded-full">
                <div className="flex flex-row">
                    {userData ? `Puntos: ${userData.Puntos}` : 'Cargando...'}
                </div>
            </div>
        </div>
    );
}

export default ViewMenu;