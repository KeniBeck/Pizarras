'use client'
import Swal from "sweetalert2";
import { PiNumberSquareOneFill } from "react-icons/pi";
import { PiNumberSquareTwoFill } from "react-icons/pi";
import { BsCalendarDateFill } from "react-icons/bs";
import { useEffect, useState } from "react";




const TicketBuy = () => {
    const [prizes, setPrizes] = useState(null);
    const [topePermitido, setTopePermitido] = useState(0);
    const handleTicketNumberChange = async (event) => {
        const ticketNumber = event.target.value;

        // Fetch the tope permitido for this ticket number from your API
        fetch(`/api/topes/${ticketNumber}`)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                // Update the tope permitido state
                setTopePermitido(data.tope);
            })
            .catch(error => console.error('Error:', error));
    };

    useEffect(() => {
        fetch('/api/ticketBuy')
            .then(response => response.json())
            .then(data => setPrizes(data.result[0]))
            .catch(error => console.error('Error:', error));

    }, []);


    if (!prizes) {
        return <div className=" text-white w-full h-screen items-center bg-center bg-no-repeat bg-[rgb(38,38,38)] flex-col">
            Loading...
        </div>
    }
    return (
        <div className="max-w-sm mx-auto w-full bg-[rgb(38,38,38)]">
            <div className="text-2xl text-white flex justify-center items-center pb-4 pt-6 ">Boletos</div>
            <div className="w-full flex justify-center items-center flex-col space-y-1  relative">
                <label className="text-white text-lg flex justify-center items-center realative pr-8 ">
                    <BsCalendarDateFill className="inline-block h-6 w-6 mr-1 text-red-600 " /> Sorteo:{new Date(prizes.Fecha).toLocaleDateString()}</label>
                <label className="text-white text-lg flex justify-center items-center relative">
                    <PiNumberSquareOneFill className="text-red-600 inline-block h-6 w-6 mr-1" />Premio:{prizes.Primerpremio}
                </label>
                <label className="text-white text-lg flex justify-center items-center  realative">
                    <PiNumberSquareTwoFill className="inline-block h-6 w-6 mr-1 text-red-600" /> Premio:{prizes.Segundopremio}
                </label>
            </div>

            <div className="text-xl text-red-500 text-center pt-6">
                Tope: permitido: {topePermitido}
            </div>

            <div className="flex justify-center items-center flex-col space-y-3 pt-6">
                <div className="flex flex-row gap-12">
                    <div className="text-white flex justify-center items-center text-lg">Boleto</div>
                    <input
                        className="bg-neutral-300 border rounded w-[110px] outline-none h-9 pl-10"
                        onChange={handleTicketNumberChange}
                    />
                </div>
                <div className="flex flex-row gap-12">
                    <div className="text-white flex justify-center items-center text-lg">Precio</div>
                    <input className="bg-neutral-300 border rounded w-[110px] outline-none h-9 pl-10  " />
                </div>
                <div className="flex flex-row gap-8">
                    <div className="text-white flex justify-center items-center text-lg">Nombre</div>
                    <input className="bg-neutral-300 border rounded w-[110px] outline-none h-9 pl-5  " />
                </div>

            </div>

            <div className="flex justify-center items-center flex-col space-y-3 pt-8 px-8 ">

                <button className="w-full rounded-lg bg-red-700 text-white h-9">Normal</button>
                <button className="w-full rounded-lg bg-red-700 text-white h-9">Serie</button>
            </div>

            <div className="flex justify-center items-center flex-col space-y-2 pt-6 px-8">

                <button className="w-full rounded-lg bg-red-700 text-white h-9">Revisar Boletos</button>
            </div>


        </div>
    );
}
export default TicketBuy;