import { PiNumberSquareOneFill } from "react-icons/pi";
import { PiNumberSquareTwoFill } from "react-icons/pi";
import { BsCalendarDateFill } from "react-icons/bs";
import { useEffect, useState } from "react";
import generatePDF from "./pdf";
import { ErrorPrizes, loading, ErrorTope, ValidateBox, prizesSeries } from "../alerts/menu/Alerts";
import { useRouter } from "next/navigation";
import { FaHome } from "react-icons/fa";
import generatePDFSerie from "./pdfSerie";
import AlertMenu from "../alerts/menu/AlertMenu";
import Swal from "sweetalert2";
import { TbSquarePlus } from "react-icons/tb";
import TicketPreviewModal from "./TicketPreviewModal";
import VailidationEstatus from "@/hook/validationEstatus";

const TicketBuy = () => {
    const [prizes, setPrizes] = useState(null);
    const [topePermitido, setTopePermitido] = useState(0);
    const [ticketNumber, setTicketNumber] = useState("");
    const [foundTope, setFoundTope] = useState(null);
    const [prizebox, setPrizebox] = useState("");
    const [name, setName] = useState("");
    const [prizeboxError, setPrizeboxError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const router = useRouter();
    const [cantidad, setCantidad] = useState(0);
    const [tickets, setTickets] = useState([]);
    const [numberTop, setNumberTop] = useState(0);

    useEffect(() => {
        Promise.all([
            fetch('/api/ticketBuy')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => setPrizes(data.result[0])),
        ])
            .catch(error => console.error('Error:', error));
    }, []);
    const currentHour = new Date().getHours();

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
    const handleTicketNumberChange = async (e) => {
        let value = e.target.value;
        if (!/^[0-9]*$/.test(value)) {
            value = value.slice(0, -1);
        }
        setTicketNumber(value);

        // Asegúrate de que el valor tenga una longitud de 3 caracteres
        value = value.padStart(3, '0');

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ticketNumber: value })
        };

        try {
            const response = await fetch('/api/topes', options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (Array.isArray(data.tope)) {
                const matchingTope = data.tope.find(tope => tope.Numero === Number(value));

                if (matchingTope) {
                    console.log("Tope encontrado: ", matchingTope.Tope);
                    setFoundTope(matchingTope.Tope); // Guarda el tope encontrado en el estado
                    setCantidad(matchingTope.Cantidad);
                    setNumberTop(matchingTope.Numero);
                } else {
                    console.log("No se encontró un tope para este número de boleto");
                    setFoundTope(null); // Si no se encuentra un tope, establece el estado a null
                }
            } else {
                console.log("La respuesta de la API no contiene un array de topes");
                setFoundTope(null);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const handleBlur = async (e) => {
        let value = e.target.value;
        // Asegúrate de que el valor sea un número y tenga una longitud de 3 caracteres
        value = value.padStart(3, '0');
        setTicketNumber(value);

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ticketNumber: value })
        };

        try {
            const response = await fetch('/api/topes', options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (Array.isArray(data.tope)) {
                const matchingTope = data.tope.find(tope => tope.Numero === Number(value));

                if (matchingTope) {
                    console.log("Tope encontrado: ", matchingTope.Tope);
                    setFoundTope(matchingTope.Tope); // Guarda el tope encontrado en el estado
                    setCantidad(matchingTope.Cantidad);
                } else {
                    console.log("No se encontró un tope para este número de boleto");
                    setFoundTope(null); // Si no se encuentra un tope, establece el estado a null
                }
            } else {
                console.log("La respuesta de la API no contiene un array de topes");
                setFoundTope(null);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const userData = JSON.parse(localStorage.getItem('userData'));
    const idVendedor = userData.Idvendedor;
    const idSorteo = prizes.Idsorteo
    const fecha = new Date(new Date(prizes.Fecha).getTime() + new Date().getTimezoneOffset() * 60000).toLocaleDateString();
    const Validate = () => {
        if (foundTope == 0) {
            if (cantidad >= foundTope) {
                Swal.fire(`No se pueden vender más boletos de este número`);
                setTicketNumber("");
                setPrizebox("");
                return false;
            }
        }

        if (prizeboxError) {
            ErrorPrizes();
            setPrizebox("");
            return false;
        }
        return true;
    }

    const enviarDatosNormal = async () => {
        VailidationEstatus();
        if (tickets.length === 0 && (!prizebox || !name)) {
            ValidateBox();
            return;
        }
        if (tickets.length > 0) {
            setShowPreview(true);
        }
        if (!Validate()) {
            return;
        }

        if (!addTicketToList()) {
            return;
        }

        setShowPreview(true);
    };

    const confirmVenta = async () => {
        VailidationEstatus();
        setIsLoading(true);

        const ticketData = [];

        for (const ticket of tickets) {
            const data = {
                prizebox: ticket.price,
                name: ticket.name,
                ticketNumber: ticket.number,
                idVendedor,
                idSorteo,
                topePermitido: foundTope - ticket.price,
                fecha: prizes.Fecha,
                primerPremio: prizes.Primerpremio,
                segundoPremio: prizes.Segundopremio
            };

            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            };

            await fetch("/api/sell", options)
                .then(res => res.json())
                .then(data => {
                    ticketData.push(data[0][0]);
                });
        }

        setIsLoading(false);
        setTickets([]); // Limpiar los boletos acumulados
        setTicketNumber('');
        setPrizebox('');
        setName('');

        generatePDF(ticketData, fecha);
        setShowPreview(false);
    };
    const enviarDatosSerie = async () => {
        if (!prizebox || !name) {
            ValidateBox();
            return
        }
        if (!Validate()) {
            return;
        }
        setIsLoading(true);

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
                prizebox: prizebox / 10, // Cada boleto en la serie cuesta 10
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
        setTicketNumber("");
        setPrizebox("");
        setName("");
    };

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

    const addTicketToList = () => {
        VailidationEstatus();
        if (!Validate()) {
            return false;
        }
        const boletosConMismoTope = tickets.filter(ticket => parseInt(ticket.number) === numberTop);


        // Calcular la cantidad acumulada de boletos en la lista
        const totalAcumulado = boletosConMismoTope.reduce((acc, ticket) => acc + parseInt(ticket.price), 0);
        // Validar la cantidad acumulada con el tope permitido
        if (foundTope) {
            const nuevaCantidad = totalAcumulado + cantidad + parseInt(prizebox);
            if (nuevaCantidad > foundTope) {
                Swal.fire(`La cantidad permitida es ${foundTope - cantidad - totalAcumulado}`);
                setPrizebox("");
                return false;
            }
        }
        if (foundTope == 0) {
            ErrorTope();
            setTicketNumber("");
            return false;
        }

        // Agregar el boleto actual a la lista de boletos acumulados
        if (ticketNumber && prizebox && name) {
            setTickets(prevTickets => [...prevTickets, { number: ticketNumber, price: prizebox, name }]);
            setTicketNumber('');
            setPrizebox('');
            return true;
        }

    };

    const handlePlusTicket = () => {
        if (addTicketToList()) {
            console.log(tickets)
        }
    }
    const handleDeleteTicket = (index) => {
        setTickets(prevTickets => prevTickets.filter((_, i) => i !== index));
    };

    return (
        <div className="relative min-h-screen">
            <div className="max-w-sm mx-auto w-full bg-[rgb(38,38,38)]">
                <div className="text-xl text-white flex justify-center items-center pb-4 pt-6 ">Boletos</div>
                <div className="w-full flex justify-center items-center flex-col space-y-1  relative">
                    <label className="text-white text-lg flex justify-center items-center gap-6 realative pr-8 ">
                        <BsCalendarDateFill className="inline-block h-6 w-6 mr-1 text-red-600 " /> Sorteo:{fecha}</label>
                    <label className="text-white text-lg flex justify-center items-center ml-4 relative">
                        <PiNumberSquareOneFill className="text-red-600 inline-block h-6 w-6 mr-1 absolute right-[160px]" />Premio:{prizes.Primerpremio}
                    </label>
                    <label className="text-white text-lg flex justify-center items-center realative">
                        <PiNumberSquareTwoFill className="inline-block h-6 w-6 mr-1 text-red-600 absolute left-[80px]" /> Premio:{prizes.Segundopremio}
                    </label>
                </div>

                {foundTope !== null ? (
                    <div className="text-xl text-red-500 text-center pt-6">
                        Tope permitido: {foundTope - cantidad}
                    </div>
                ) : (
                    <div className="text-xl text-red-500 text-center pt-6"></div>
                )}

                <div className="flex mx-8 flex-col space-y-3 pt-6">
                    <div className="flex flex-row gap-12">
                        <div className="text-white flex justify-center items-center text-2xl">Boleto</div>
                        <input
                            className="bg-neutral-300 border rounded w-[150px] outline-none h-[40px] pl-10"
                            value={ticketNumber}
                            onChange={handleTicketNumberChange}
                            onBlur={handleBlur}
                            maxLength={3}
                        />
                        <button
                            onClick={handlePlusTicket}
                            className="absolute right-6 bg-green-700 text-white flex justify-center items-center rounded-lg h-[40px] w-[40px] text-4xl"
                        >
                            <TbSquarePlus />
                        </button>
                    </div>
                    <div className="flex flex-row gap-12">
                        <div className="text-white flex justify-center items-center text-2xl">Precio</div>
                        <input
                            className="bg-neutral-300 border rounded w-[150px] outline-none h-[40px] pl-10"
                            value={prizebox}
                            onChange={(event) => {
                                const value = event.target.value;
                                if (!/^[0-9]*$/.test(value)) {
                                    event.target.value = value.slice(0, -1);
                                }
                                handlePrizeboxChange(event);
                            }}
                            maxLength={4}
                        />
                    </div>
                    <div className="flex flex-row gap-8">
                        <div className="text-white flex justify-center items-center text-2xl">Nombre</div>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-neutral-300 border rounded w-[150px] outline-none h-[40px] pl-10"
                        />
                    </div>
                </div>

                <div className="flex justify-center items-center flex-col space-y-2 pt-4 px-8">
                    <button
                        onClick={enviarDatosNormal}
                        className="w-full rounded-lg bg-red-700 text-white h-[60px] text-xl"
                    >
                        Normal
                    </button>
                    <button
                        onClick={enviarDatosSerie}
                        className="w-full rounded-lg bg-red-700 text-white h-[60px] text-xl"
                    >
                        Serie
                    </button>
                </div>

                <div className="flex justify-center items-center flex-col pt-2 px-8">
                    <button
                        onClick={() => router.push('/viewTickects')}
                        className="w-full rounded-lg bg-red-700 text-white h-[60px] text-xl"
                    >
                        Revisar Boletos
                    </button>
                </div>
            </div>
            <button
                onClick={goToMenu}
                className="fixed bottom-4 right-4 bg-red-700 text-white flex justify-center items-center rounded-full w-[60px] h-[60px] text-3xl"
            >
                <FaHome />
            </button>

            {showPreview && (
                <TicketPreviewModal
                    tickets={tickets}
                    onClose={() => setShowPreview(false)}
                    onConfirm={confirmVenta}
                    onDelete={handleDeleteTicket}
                />
            )}
        </div>
    );
};

export default TicketBuy;