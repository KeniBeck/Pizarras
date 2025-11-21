import React from "react";

const EspecialBoletosDisponiblesModalOnline = ({ tickets, onClose }) => {
  const boletosVendidosNormal = tickets.boletosNormal || [];
  const boletosVendidosOnline = tickets.boletosOnline || [];
  
  // NORMALIZAR a números para comparar correctamente
  const todosBoletosVendidos = [
    ...boletosVendidosNormal.map(ticket => ticket.Boleto), // Ya son números
    ...boletosVendidosOnline.map(ticket => ticket.numero_boleto)
  ];

  const todosLosBoletos = Array.from({ length: 1000 }, (_, i) => i);
  const boletosDisponibles = todosLosBoletos.filter(
    (boleto) => !todosBoletosVendidos.includes(boleto)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[80vh] overflow-hidden">
        <h2 className="text-xl font-bold mb-4 text-purple-800">Boletos Especiales Disponibles</h2>

        <div className="mb-4 h-64 overflow-y-auto border border-gray-200 rounded-lg">
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <span className="text-sm text-gray-600">
              Mostrando {boletosDisponibles.length} de 1000 boletos disponibles
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 p-3">
            {boletosDisponibles.map((boleto, index) => (
              <div
                key={index}
                className="text-center p-2 bg-green-50 border border-green-200 rounded text-sm font-medium text-green-700"
              >
                {boleto.toString().padStart(3, "0")}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EspecialBoletosDisponiblesModalOnline;