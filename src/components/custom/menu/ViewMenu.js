'use client'
import { IoTicketSharp } from "react-icons/io5";
import { ImStatsDots } from "react-icons/im";
import { FaCashRegister } from "react-icons/fa";
import { GiStarStruck } from "react-icons/gi";
import { RiLogoutBoxFill } from "react-icons/ri";


const ViewMenu = ()  =>{

    return(
 <div className="w-full bg-[rgb(38,38,38)]">
    
    <div className=" w-full flex justify-center items-center text-xl text-white p-10">Pizarras</div>
    <div className="w-full flex justify-center items-center  flex-col space-y-1 pb-8">
        <label className="text-white">Vendedor:(Vendedor)</label>
        <label className="text-white">Sucursal: (Sucursal)</label>

    </div>
    <div className="w-full flex flex-col space-y-10 pt-6 px-10 ">
        <div className="relative">
        <button className="w-full rounded-lg bg-red-700 text-white h-9 relative">
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
        <button className="w-full rounded-lg bg-red-700 text-white h-9 relative">
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
    );
}
export default ViewMenu;