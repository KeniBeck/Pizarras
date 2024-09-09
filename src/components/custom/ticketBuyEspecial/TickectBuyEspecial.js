'use client'
import { PiNumberSquareOneFill } from "react-icons/pi";
import { PiNumberSquareTwoFill } from "react-icons/pi";
import { BsCalendarDateFill } from "react-icons/bs";
import { useEffect, useState } from "react";
import generatePDF from "../tickectBuy/pdf";
import { ErrorPrizes, loading, ErrorTope, ValidateBox, success, selectDate, Especial } from "../alerts/menu/Alerts";
import { useRouter } from "next/navigation";
import { FaHome } from "react-icons/fa";
import EspecialPreviewModal from "./EspecialPreviewModal";

import AlertMenu from "../alerts/menu/AlertMenu";
import { set } from "react-hook-form";
import VailidationEstatus from "@/hook/validationEstatus";

const TickectBuyEspecial = ({ selectedDate }) => {
    const [prizes, setPrizes] = useState(selectedDate)
    const [ticketNumber, setTicketNumber] = useState("");
    const [foundTope, setFoundTope] = useState(null);
    const [prizebox, setPrizebox] = useState("");
    const [name, setName] = useState("");
    const [prizeboxError, setPrizeboxError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [boletos, setBoletos] = useState([]);
    const router = useRouter();
    const [previewModal, setPreviewModal] = useState(false);


    useEffect(() => {
        const ticket = localStorage.getItem('TickectEspecial');
        setPrizes(JSON.parse(ticket));

        const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, };

        fetch('/api/ticketBuy', options)
            .then(res => res.json())
            .then(data => {
                setBoletos(data.result);
            });


    }, []);

    const currentHour = new Date().getHours();
    // currentHour >= 20 || currentHour < 0

    // if (currentHour >= 20 || currentHour < 0) {
    //     return <AlertMenu />;
    // }

    if (!prizes) {
        return (<div className="flex justify-center items-center min-h-screen">
            <div className="relative w-32 h-32">
                <div className="absolute top-0 left-0 animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-500"></div>
                <div className="absolute top-0 left-0 flex items-center justify-center h-32 w-32">
                    <span className="text-white text-sm">Cargando...</span>
                </div>
            </div>
        </div>);
    }

    const handleTicketNumberChange = (e) => {
        let value = e.target.value;
        setTicketNumber(value);


        const ticket = boletos.find((ticket) => ticket.Boleto === Number(value));

        if (ticket && ticket.fecha_sorteo === prizes.Fecha) {
            console.log('numero en la base de datos', ticket.Boleto)
            setFoundTope(true);

        } else {
            console.log('numero no en base ')
            setFoundTope(null);
        }

    };
    const handleBlur = (e) => {
        let value = e.target.value;
        // Asegúrate de que el valor sea un número y tenga una longitud de 3 caracteres
        value = value.padStart(3, '0');
        setTicketNumber(value);
    };
    const userData = JSON.parse(localStorage.getItem('userData'));
    const idVendedor = userData.Idvendedor;
    const idSorteo = prizes.Idsorteo
    const fecha = new Date(new Date(prizes.Fecha).getTime() + new Date().getTimezoneOffset() * 60000).toLocaleDateString();


    const enviarDatosNormal = async () => {
        VailidationEstatus()


        if (!prizebox || !name) {
            ValidateBox();
            return;
        }
        if (foundTope !== null) {
            Especial()
            return;
        }


        if (prizeboxError) {
            ErrorPrizes();
            setPrizebox("");
            return;
        }

        setIsLoading(true);
        setTicketNumber("");
        setPrizebox("");
        setName("");
        const data = {
            prizebox,
            name,
            ticketNumber,
            topePermitido: null,
            idVendedor,
            idSorteo,
            fecha: prizes.Fecha,
            primerPremio: prizes.Primerpremio,
            segundoPremio: prizes.Segundopremio
        };

        const options = {
            method: 'POST',
            header: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }
        await fetch("/api/sell", options)
            .then(res => res.json())
            .then(data => {
                generatePDF([data[0][0]], fecha);


            }).finally(() => {
                setIsLoading(false);

            });
    }

    const handlePrizeboxChange = (e) => {
        let value = e.target.value;
        setPrizebox(value);
        // Verifica si el valor es un múltiplo de 10
        if (value % 10 !== 0) {
            setPrizeboxError("El precio debe ser un múltiplo de 10");
        } else {
            setPrizeboxError(null);
        }
    };
    if (isLoading) {
        loading();
    }
    const goToMenu = () => {
        router.push('/menu');
    }
    const hanlePreviewModal = () => {
        VailidationEstatus()
        setPreviewModal(true);

    }


    return (
        <div className="relative min-h-screen">
            <div className="max-w-sm mx-auto w-full bg-[rgb(38,38,38)]">
                <div className="text-2xl text-white flex justify-center items-center pb-4 pt-6 ">Boletos</div>
                <div className="w-full flex justify-center items-center flex-col space-y-1  relative">
                    <label className="text-white text-xl flex justify-center items-center realative pr-8 ">
                        <BsCalendarDateFill className="inline-block h-6 w-6 mr-1 text-red-600 " /> Sorteo:{fecha}</label>
                    <label className="text-white text-xl flex justify-center items-center relative">
                        <PiNumberSquareOneFill className="text-red-600 inline-block h-6 w-6 mr-1" />Premio:{prizes.Primerpremio}
                    </label>
                    <label className="text-white text-xl flex justify-center items-center  realative">
                        <PiNumberSquareTwoFill className="inline-block h-6 w-6 mr-1 text-red-600" /> Premio:{prizes.Segundopremio}
                    </label>
                </div>

                {foundTope !== null ? (
                    <div className="text-xl text-red-500 text-center pt-6">
                        Boleto no disponible
                    </div>
                ) : (
                    <div className="text-xl text-green-500 text-center pt-6">
                        Boleto disponible
                    </div>
                )}

                <div className="flex justify-center items-center flex-col space-y-3 pt-6">
                    <div className="flex flex-row gap-12">
                        <div className="text-white flex justify-center items-center text-xl">Boleto</div>
                        <input
                            className="bg-neutral-300 border rounded w-[140px] outline-none h-9 pl-10"
                            value={ticketNumber}
                            onChange={handleTicketNumberChange}
                            onBlur={handleBlur}
                            maxLength={3}
                            onKeyPress={(event) => {
                                if (!/[0-9]/.test(event.key)) {
                                    event.preventDefault();
                                }
                            }}

                        />
                    </div>
                    <div className="flex flex-row gap-12">
                        <div className="text-white flex justify-center items-center text-xl">Precio</div>
                        <input className="bg-neutral-300 border rounded w-[140px] outline-none h-9 pl-10  "
                            value={prizebox}
                            onChange={handlePrizeboxChange}
                            maxLength={4}
                            onKeyPress={(event) => {
                                if (!/[0-9]/.test(event.key)) {
                                    event.preventDefault();
                                }
                            }}
                        />
                    </div>
                    <div className="flex flex-row gap-8">
                        <div className="text-white flex justify-center items-center text-xl">Nombre</div>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-neutral-300 border rounded w-[140px] outline-none h-9 pl-5  " />
                    </div>

                </div>

                <div className="flex flex-col gap-3 pt-3">

                    <div className="flex justify-center items-center flex-col  px-8 ">

                        <button
                            onClick={enviarDatosNormal}
                            className="w-full rounded-lg bg-red-700 text-white h-[56px] text-xl"
                        >Normal</button>
                    </div>

                    <div className="flex justify-center items-center flex-col px-8">

                        <button
                            onClick={() => router.push('/viewTickects')}
                            className="w-full rounded-lg bg-red-700 text-white h-[56px] text-xl">Revisar Boletos</button>
                    </div>
                    <div className="flex justify-center items-center flex-col px-8">
                        <button
                            onClick={hanlePreviewModal}
                            className="w-full rounded-lg bg-red-700 text-white h-[56px] text-xl"

                        >
                            Boletos disponibles
                        </button>
                    </div>
                </div>
            </div >
            <button
                onClick={goToMenu}
                className="fixed bottom-4 right-4 bg-red-700 text-3xl text-white flex justify-center items-center h-[56px] w-[56px] rounded-full"
            >
                <FaHome />
            </button>

            {previewModal && (
                <EspecialPreviewModal
                    tickets={boletos}
                    onClose={() => setPreviewModal(false)}

                />
            )}
        </div>
    );
}
export default TickectBuyEspecial;
