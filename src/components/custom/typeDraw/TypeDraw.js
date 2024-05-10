const TypeDraw = () =>{

    return(
        <div className="flex flex-col w-full max-w-sm mx-auto">
        <div className="text-white text-2xl text-center  ">Tipo de sorteo</div>
        <div className="w-full mt-5 px-8 space-y-3">
            <button className="rounded h-10 w-full bg-red-700 text-white">Hoy</button>
            <button className="rounded h-10 w-full bg-red-700 text-white">Especial</button>
        </div>
        </div>
    
    );
}
export default TypeDraw;