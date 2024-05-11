import { PiNumberSquareOneFill } from "react-icons/pi";
import { PiNumberSquareTwoFill } from "react-icons/pi";
import { BsCalendarDateFill } from "react-icons/bs";



const TicketBuy = () =>{

    return(
     <div className="max-w-sm mx-auto w-full bg-[rgb(38,38,38)]">
        <div className="text-2xl text-white flex justify-center items-center pb-4 pt-6 ">Boletos</div>
         <div className="w-full flex justify-center items-center flex-col space-y-1  relative">
            <label className="text-white text-lg flex justify-center items-center realative pr-8 ">
                <BsCalendarDateFill className="inline-block h-6 w-6 mr-1 text-red-600 " /> Sorteo: ( Fecha )</label>
            <label className="text-white text-lg flex justify-center items-center relative">
                <PiNumberSquareOneFill className="text-red-600 inline-block h-6 w-6 mr-1" />Premio: ( Cantidad 1)
            </label>
            <label className="text-white text-lg flex justify-center items-center  realative">
                <PiNumberSquareTwoFill className="inline-block h-6 w-6 mr-1 text-red-600" /> Premio: (Cantidad 2)
            </label>
        </div>
        
        <div className="text-xl text-red-500 text-center pt-6 ">Tope: permitido: (tope)</div>

        <div className="flex justify-center items-center flex-col space-y-3 pt-6">
            <div className="flex flex-row gap-12">
                <div className="text-white flex justify-center items-center text-lg">Boleto</div>
                <input className="bg-neutral-300 border rounded w-[110px] outline-none h-9 pl-10  "/>
            </div>
            <div className="flex flex-row gap-12">
                <div className="text-white flex justify-center items-center text-lg">Precio</div>
                <input className="bg-neutral-300 border rounded w-[110px] outline-none h-9 pl-10  "/>
            </div>
            <div className="flex flex-row gap-8">
                <div className="text-white flex justify-center items-center text-lg">Nombre</div>
                <input className="bg-neutral-300 border rounded w-[110px] outline-none h-9 pl-5  "/>
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