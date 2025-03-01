"use client";
import useSession from "@/hook/useSession";
import { useEffect, useState } from "react";
import generatePDF from "../tickectBuy/pdf";
import { FaHome } from "react-icons/fa";
import { useRouter } from "next/navigation";
import updateInfo from "../validation/updateInfo";

const ViewTickets = () => {
  const { getUserData } = useSession();
  const [userData, setUserData] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [totalTickets, setTotalTickets] = useState(0);
  const [total, setTotal] = useState(0);
  const router = useRouter();
  let idVendedor = null;


  const fetchData = async () => {
    try {
      const userData = getUserData();
      setUserData(userData);
      idVendedor= userData.idVendedor;

      const response = await fetch("/api/viewTickects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTickets(data);
      setTotalTickets(data.length);
      const total = data.reduce((acc, ticket) => acc + ticket.Costo, 0);
      setTotal(total);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const localUserData = JSON.parse(localStorage.getItem("userData"));
      setUserData(localUserData);
    }
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };


  const filteredTickets = Array.isArray(tickets)
    ? tickets.filter((ticket) => String(ticket.Boleto).includes(search))
    : [];

  const handlePrint = (ticket) => {
    const tickets = [];
    tickets.push(ticket); 
    console.log("tickets", tickets);    
    let fechaSinHora = tickets[0].Fecha;
    if (isNaN(new Date(fechaSinHora).getTime())) {
      console.error("Invalid date:", fechaSinHora);
    } else {
      console.log("fechaSinHora", fechaSinHora);
      generatePDF(tickets, fechaSinHora);
    }
  };

 const goToMenu = () => {
        updateInfo(userData.Idvendedor).then(() => {
            router.push('/menu')
        });
    }

  return (
    <div>
      <div className="flex flex-col justify-center items-center p-3">
        <p className="text-white text-xl">
          Total de boletos vendidos: {totalTickets}
        </p>
        <p className="text-white text-xl">
          Venta total : ${total}
        </p>
      </div>
      <form className="max-w-md mx-auto">
        <label
          htmlFor="default-search"
          className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
        >
          Search
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="search"
            id="default-search"
            className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search Tickets..."
            required
            onChange={handleSearch}
          />
        </div>
      </form>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Boleto
              </th>
              <th scope="col" className="px-6 py-3">
                Precio
              </th>
              <th scope="col" className="px-6 py-3">
                Nombre
              </th>
              <th scope="col" className="px-6 py-3">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket, index) => (
              <tr
                key={index}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  {ticket.Boleto}
                </th>
                <td className="px-6 py-4">{ticket.Costo}</td>
                <td className="px-6 py-4">{ticket.comprador}</td>
                <td className="px-6 py-4 ">
                  <button
                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                    onClick={() => handlePrint(ticket)}
                  >
                    Imprimir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={goToMenu}
        className="fixed bottom-4 right-4 bg-red-700 text-white flex justify-center items-center p-2 rounded-full h-[40px] w-[40px]"
      >
        <FaHome />
      </button>
    </div>
  );
};

export default ViewTickets;
