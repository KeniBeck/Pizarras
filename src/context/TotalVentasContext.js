"use client";
import { createContext, useContext, useState } from "react";

const TotalVentaContext = createContext(); //Creamos el contexto de esta manera

//Aqui se crea un provider que es el que va a envolver la app
export const TotalVentaProvider = ({children}) => {  
    const [ventas, setVentas] = useState([]); //Aqui va a estar la lista de boletos
    const [total, setTotal] = useState(0);

    //Creamos funciones de utilidad
    const addVenta = (boleto) => {
    const subtotalNum = Number(boleto.subtotal) || 0;
    setVentas((prev) => [...prev, boleto]);
    setTotal((prev) => prev + subtotalNum);
    };

    const resetVentas = () => {
        setVentas([]);
        setTotal(0);
    };

    return (
        <TotalVentaContext.Provider value={{ventas,total,addVenta,resetVentas}}>
            {children}
        </TotalVentaContext.Provider>
    );
};

//Creamos un hook personalizado para usar el contecto mas facil
export const useTotalVenta = () => {
    return useContext(TotalVentaContext)
}