const ViewMenu = ()  =>{

    return(
    <div>
    
    <div className=" w-full flex justify-center items-center text-xl text-white p-10">Pizarras</div>
    <div className="w-full flex  flex-col space-y-1 pb-8">
        <label className="text-white">Vendedor:(Vendedor)</label>
        <label className="text-white">Sucursal: (Sucursal)</label>

    </div>
    <div className="w-full flex flex-col space-y-10 pt-6">
        <button className="rounded-lg bg-red-700 text-white h-9">Boletos</button>
        <button className="rounded-lg bg-red-700 text-white h-9">Ventas del dia</button>
        <button className="rounded-lg bg-red-700 text-white h-9">Corte de caja</button>
        <button className="rounded-lg bg-red-700 text-white h-9">Boletos premiados</button>
        <button className="rounded-lg bg-red-700 text-white h-9">Cerrar sección</button>
    
    </div>

    </div>
    );
}
export default ViewMenu;