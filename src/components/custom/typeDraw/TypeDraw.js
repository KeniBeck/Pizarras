const TypeDraw = () =>{

    return(
        <div className="flex flex-col">
        <div className="text-white text-2xl text-center  ">Tipo de sorteo</div>
        <div className="w-[260px] mt-5">
            <button className="rounded h-9 w-full bg-red-700 text-white">Hoy</button>\
            <button className="rounded h-9 w-full bg-red-700 text-white">Especial</button>
        </div>
        </div>
    
    );
}
export default TypeDraw;