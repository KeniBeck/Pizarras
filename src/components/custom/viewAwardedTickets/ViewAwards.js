'use client'
import { FaHome } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AlertMenu from "../alerts/menu/AlertMenu";
const ViewAwards = () => {
    const [awards, setAwards] = useState([]);
    const [search, setSearch] = useState('');
    const router = useRouter();
    const fetchData = async () => {
        try {


            const response = await fetch('/api/viewAwards', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setAwards(data);
            // setTotalTickets(data.length);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const filteredTickets = Array.isArray(awards) ? awards.filter(awards => String(awards.idpremiados).includes(search)) : [];

    const goToMenu = () => {
        router.push('/menu');
    }
    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    const currentHour = new Date().getHours();

    if (currentHour >= 18 || currentHour < 1) {
        return <AlertMenu />;
    }
    return (
        <div>
            <div className="flex justify-center items-center p-3">
                <p className="text-white text-xl">Boletos premiados</p>
            </div>
            <form className="max-w-md mx-auto">
                <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                        </svg>
                    </div>
                    <input type="search" id="default-search" className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search Tickets..." required onChange={handleSearch} />
                </div>
            </form>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Boleto</th>
                            <th scope="col" className="px-6 py-3">Premio #1</th>
                            <th scope="col" className="px-6 py-3">Premio #2</th>
                            <th scope="col" className="px-6 py-3">Fecha Sorteo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTickets.length > 0 && filteredTickets.map((awards, index) => (
                            <tr key={index} className={`${index !== 0 ? 'border-t' : ''} bg-white dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600`}>
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{awards.idpremiados}</th>
                                <td className="px-6 py-4">{awards.primerlugar}</td>
                                <td className="px-6 py-4">{awards.segundolugar}</td>
                                <td className="px-6 py-4">
                                    {new Date(awards.fechasorteo).toLocaleDateString("es-ES", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </td>
                                <td className=" py-4 text-right">
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
export default ViewAwards;