'use client'
import { PiNumberSquareOneFill } from "react-icons/pi";
import { PiNumberSquareTwoFill } from "react-icons/pi";
import { BsCalendarDateFill } from "react-icons/bs";
import { useEffect, useState } from "react";
import generatePDF from "../tickectBuy/pdf";
import { ErrorPrizes, loading, ErrorTope, ValidateBox, prizesSeries, success, selectDate } from "../alerts/menu/Alerts";
import { useRouter } from "next/navigation";
import { FaHome } from "react-icons/fa";
import generatePDFSerie from "../tickectBuy/pdfSerie";

const TickectBuyEspecial = ({ selectedDate }) => {
    const [prizes, setPrizes] = useState(selectedDate);
    const [topePermitido, setTopePermitido] = useState(0);
    const [ticketNumber, setTicketNumber] = useState("");
    const [foundTope, setFoundTope] = useState(null);
    const [prizebox, setPrizebox] = useState("");
    const [name, setName] = useState("");
    const [prizeboxError, setPrizeboxError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [dates, setDates] = useState([]);
    const router = useRouter();
    useEffect(() => {
        Promise.all([
            fetch('/api/ticketBuy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then(response => response.json())
                .then(async data => {
                    const selectedPrize = await selectDate(data.result);
                    setPrizes(selectedPrize);
                }),

            fetch(`/api/topes`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => setTopePermitido(data.tope))
        ])
            .catch(error => console.error('Error:', error));
    }, []);
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
    const userData = JSON.parse(localStorage.getItem('userData'));
    const idVendedor = userData.Idvendedor;
    const idSorteo = prizes.Idsorteo
    const fecha = new Date(new Date(prizes.Fecha).getTime() + new Date().getTimezoneOffset() * 60000).toLocaleDateString();


    const enviarDatosNormal = async () => {
        if (!prizebox || !name || ticketNumber == 0) {
            ValidateBox();
            return;
        }
        if (foundTope && prizebox > foundTope) {
            ErrorTope();
            setPrizebox("");
            return;
        }

        if (prizeboxError) {
            ErrorPrizes();
            setPrizebox("");
            return;
        }
        if (foundTope == 0) {
            ErrorTope();
            setTicketNumber("");
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
            idVendedor,
            idSorteo,
            topePermitido: foundTope - prizebox,
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
                generatePDF(data[0][0], fecha);


            }).finally(() => {
                setIsLoading(false);

            });
    }
    const enviarDatosSerie = async () => {
        if (!prizebox || !name || ticketNumber == 0) {
            ValidateBox();
            return;
        }
        if (prizebox < 100) {
            prizesSeries()
            setPrizebox("");
            return;
        }
        if (foundTope && prizebox > foundTope) {
            ErrorTope();
            return;
        }

        if (prizeboxError) {
            ErrorPrizes();
            setPrizebox("");
            return;
        }
        if (foundTope == 0) {
            ErrorTope();
            return;
        }
        setIsLoading(true);
        setTicketNumber("");
        setPrizebox("");
        setName("");

        // Calcula la cantidad de boletos en la serie

        const numTickets = 10;

        // Genera los números de boleto en serie
        const ticketNumbers = Array.from({ length: numTickets }, (_, i) => {
            let ticket = (Number(ticketNumber) + 100 * i);
            if (ticket >= 1000) {
                ticket = ticket - 1000;
            }
            return ticket.toString().padStart(3, '0');
        });


        // Envía cada boleto al servidor
        for (const ticketNumber of ticketNumbers) {
            const data = {
                prizebox, // Cada boleto en la serie cuesta 10
                name,
                ticketNumber,
                idVendedor,
                idSorteo,
                topePermitido: foundTope - prizebox,
                fecha: prizes.Fecha,
                primerPremio: prizes.Primerpremio,
                segundoPremio: prizes.Segundopremio
            };

            const options = {
                method: 'PUT',
                header: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }
            await fetch("/api/sell", options)
                .then(res => res.json())
                .then(data => {
                    generatePDFSerie(data[0], fecha);
                });
        }


        setIsLoading(false);

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

    return (
        <div className="relative min-h-screen">
            <div className="max-w-sm mx-auto w-full bg-[rgb(38,38,38)]">
                <div className="text-2xl text-white flex justify-center items-center pb-4 pt-6 ">Boletos</div>
                <div className="w-full flex justify-center items-center flex-col space-y-1  relative">
                    <label className="text-white text-lg flex justify-center items-center realative pr-8 ">
                        <BsCalendarDateFill className="inline-block h-6 w-6 mr-1 text-red-600 " /> Sorteo:{fecha}</label>
                    <label className="text-white text-lg flex justify-center items-center relative">
                        <PiNumberSquareOneFill className="text-red-600 inline-block h-6 w-6 mr-1" />Premio:{prizes.Primerpremio}
                    </label>
                    <label className="text-white text-lg flex justify-center items-center  realative">
                        <PiNumberSquareTwoFill className="inline-block h-6 w-6 mr-1 text-red-600" /> Premio:{prizes.Segundopremio}
                    </label>
                </div>

                {foundTope !== null ? (
                    <div className="text-xl text-red-500 text-center pt-6">
                        Tope permitido: {foundTope}
                    </div>
                ) : (
                    <div className="text-xl text-red-500 text-center pt-6">

                    </div>
                )}

                <div className="flex justify-center items-center flex-col space-y-3 pt-6">
                    <div className="flex flex-row gap-12">
                        <div className="text-white flex justify-center items-center text-lg">Boleto</div>
                        <input
                            className="bg-neutral-300 border rounded w-[110px] outline-none h-9 pl-10"
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
                        <div className="text-white flex justify-center items-center text-lg">Precio</div>
                        <input className="bg-neutral-300 border rounded w-[110px] outline-none h-9 pl-10  "
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
                        <div className="text-white flex justify-center items-center text-lg">Nombre</div>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-neutral-300 border rounded w-[110px] outline-none h-9 pl-5  " />
                    </div>

                </div>

                <div className="flex justify-center items-center flex-col space-y-3 pt-8 px-8 ">

                    <button
                        onClick={enviarDatosNormal}
                        className="w-full rounded-lg bg-red-700 text-white h-9"
                    >Normal</button>
                    <button
                        onClick={enviarDatosSerie}
                        className="w-full rounded-lg bg-red-700 text-white h-9">Serie</button>
                </div>

                <div className="flex justify-center items-center flex-col space-y-2 pt-6 px-8">

                    <button
                        onClick={() => router.push('/viewTickets')}
                        className="w-full rounded-lg bg-red-700 text-white h-9">Revisar Boletos</button>
                </div>
            </div >
            <button
                onClick={goToMenu}
                className="fixed bottom-4 right-4 bg-red-700 text-white p-2 rounded-full"
            >
                <FaHome />
            </button>
        </div>
    );
}
export default TickectBuyEspecial;