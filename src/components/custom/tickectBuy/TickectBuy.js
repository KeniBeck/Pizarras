'use client'
import { PiNumberSquareOneFill } from "react-icons/pi";
import { PiNumberSquareTwoFill } from "react-icons/pi";
import { BsCalendarDateFill } from "react-icons/bs";
import { useEffect, useState } from "react";
import useSession from "@/hook/useSession";




const TicketBuy = ({ selectedDate }) => {
    const [prizes, setPrizes] = useState(null);
    const [topePermitido, setTopePermitido] = useState(0);
    const [ticketNumber, setTicketNumber] = useState("");
    const [foundTope, setFoundTope] = useState(null);
    const { getUserData } = useSession();
    let userData = getUserData();
    const date = selectedDate;
    if (typeof window !== 'undefined') {
        userData = JSON.parse(localStorage.getItem('userData'));
    }

    useEffect(() => {
        fetch(`/api/ticketBuy`, {
            method: 'POST', // Cambia el método a PUT
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ date: date }), // Envia la fecha como cuerpo de la petición
        })
            .then(response => response.json())
            .then(data => setPrizes(data[0]))
            .catch(error => console.error('Error:', error));

        // Fetch the tope permitido from your API
        fetch(`/api/topes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ date: date }),
        })
            .then(response => response.json())
            .then(data => setTopePermitido(data))
            .catch(error => console.error('Error:', error));

    }, [selectedDate])

    if (!prizes || !topePermitido) {
        return <div className=" text-white w-full h-screen items-center bg-center bg-no-repeat bg-[rgb(38,38,38)] flex-col">
            Loading...
        </div>
    }
    const [year, month, day] = userData.requestTime.split('T')[0].split('-');

    const handleTicketNumberChange = (e) => {
        let value = e.target.value;
        setTicketNumber(value);
        const matchingTope = topePermitido.find(tope => tope.Numero === Number(value));
        if (matchingTope) {
            console.log("Tope encontrado: ", matchingTope.Tope);
            setFoundTope(matchingTope.Tope); // Guarda el tope encontrado en el estado
        } else {
            console.log("No se encontró un tope para este número de boleto");
            setFoundTope(null); // Si no se encuentra un tope, establece el estado a null
        }
    };
    const handleBlur = (e) => {
        let value = e.target.value;
        // Asegúrate de que el valor sea un número y tenga una longitud de 3 caracteres
        value = value.padStart(3, '0');
        setTicketNumber(value);
    };

    return (
        <div className="max-w-sm mx-auto w-full bg-[rgb(38,38,38)]">
            <div className="text-2xl text-white flex justify-center items-center pb-4 pt-6 ">Boletos</div>
            <div className="w-full flex justify-center items-center flex-col space-y-1  relative">
                <label className="text-white text-lg flex justify-center items-center realative pr-8 ">
                    <BsCalendarDateFill className="inline-block h-6 w-6 mr-1 text-red-600 " /> Sorteo:{(`${month}-${day}`)}</label>
                <label className="text-white text-lg flex justify-center items-center relative">
                    <PiNumberSquareOneFill className="text-red-600 inline-block h-6 w-6 mr-1" />Premio:{prizes.Primerpremio}
                </label>
                <label className="text-white text-lg flex justify-center items-center  realative">
                    <PiNumberSquareTwoFill className="inline-block h-6 w-6 mr-1 text-red-600" /> Premio:{prizes.Segundopremio}
                </label>
            </div>
            {foundTope ? (
                <div className="text-xl text-red-500 text-center pt-6">
                    Tope permitido: {foundTope}
                </div>
            ) : (
                <div className="text-xl text-red-500 text-center pt-6">
                    No se encontró un tope para este número de boleto
                </div>
            )}

            <div className="flex justify-center items-center flex-col space-y-3 pt-6">
                <div className="flex flex-row gap-12">
                    <div className="text-white flex justify-center items-center text-lg">Boleto</div>
                    <input
                        value={ticketNumber}
                        onChange={handleTicketNumberChange}
                        onBlur={handleBlur}
                        maxLength={3}
                        className="bg-neutral-300 border rounded w-[110px] outline-none h-9 pl-10"
                    />
                </div>
                <div className="flex flex-row gap-12">
                    <div className="text-white flex justify-center items-center text-lg">Precio</div>
                    <input className="bg-neutral-300 border rounded w-[110px] outline-none h-9 pl-10  "
                        maxLength={4}
                    />
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