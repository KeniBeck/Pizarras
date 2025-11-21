'use client'
import { useEffect,useState } from "react";
import { useTotalVenta } from "@/context/TotalVentasContext";
import { generarPDFTotalVenta } from "../pdf/pdfTotalVenta";
import useSession from "@/hook/useSession";
import { usePathname } from "next/navigation";
import ModalPortal from "./ModalPortal";

export default function TotalVentasModal(){
    const {ventas,total,resetVentas} = useTotalVenta();
    const [open, setOpen] = useState(false);
    const { getUserData } = useSession();
    const user = getUserData();
    const pathname = usePathname();

    useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [open]);

    const rutasOcultas = [
      "/OnlineHome",
      "/CompraOnline",
      "/CompraOnlineEspecial",
      "/ResultadosOnline"
    ];

    const ocultar = rutasOcultas.some(ruta => pathname.startsWith(ruta));

    if(ocultar) return null;

    if (!user || pathname === "/") return null;

    //Con esta funcion vamos a cerrar el modal de total venta
    const handleImprimir = async () => {
      setOpen(false);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      generarPDFTotalVenta(total, ventas);
    };
    
    return (
    <div>
      <button 
        onClick={() => setOpen(true)} 
        className="fixed bottom-28 right-5 text-gray px-4 py-2 rounded shadow-lg z-[50]" 
        style={{backgroundColor: "#ffde59",}}
      >
        Ver Total
      </button>

      {open && (
        <ModalPortal>
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999]">
          <div className="bg-white p-4 rounded-lg w-96 shadow-lg relative z-[10000]">
            <h2 className="text-lg font-bold mb-2">Detalle de Ventas</h2>
            <div className="max-h-60 overflow-y-auto text-sm">
              {ventas.length > 0 ? (
                ventas.map((v, i) => (
                  <div key={i} className="border-b py-1 flex justify-between">
                    <span>
                      {v.tipo === "boleto" && "Boleto normal 🎟️"}
                      {v.tipo === "serie" && "serie 📦"}
                      {v.tipo === "especial" && "Boleto especial⭐"}
                      {v.tipo === "premio" && "Premio 💸"}
                      {" "}
                      <strong>{v.descripcion || v.numero}</strong>
                    </span>
                    <span>
                      Cant: {v.cantidad} — ${v.subtotal < 0 ? `-${Math.abs(v.subtotal)}` : v.subtotal}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No hay movimientos aún</p>
              )}
            </div>
            <div className="mt-3 text-right">
              <p className="font-bold">
                TOTAL:{" "}
                <span className={total < 0 ? "text-red-600" : "text-green-600"}>
                  ${total}
                </span>
              </p>
            </div>
            <div className="flex justify-between mt-3">
                <button 
                    onClick={handleImprimir}
                    className="px-3 py-1 bg-green-500 text-white rounded">
                    Imprimir
                </button>
                <button 
                    onClick={resetVentas} 
                    className="px-3 py-1 bg-yellow-500 text-white rounded">
                    Limpiar
                </button>
                <button 
                    onClick={() => setOpen(false)} 
                    className="px-3 py-1 bg-gray-300 rounded">
                    Cerrar
                </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
    
  );
}