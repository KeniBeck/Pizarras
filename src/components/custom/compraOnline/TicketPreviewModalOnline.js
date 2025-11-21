import React, { useState, useEffect } from "react";

const TicketPreviewModalOnline = ({ tickets, onClose, onConfirm, onDelete }) => {
  const [telefono, setTelefono] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [bancos, setBancos] = useState([]);
  const [bancoSeleccionado, setBancoSeleccionado] = useState(null);

  useEffect(() => {
    // Cargar bancos desde API
    fetch("/api/bancos")
      .then((res) => res.json())
      .then((data) => setBancos(data.bancos || []))
      .catch((err) => console.error("Error cargando bancos:", err));
  }, []);

  const handleConfirm = () => {
    if (!telefono || !metodoPago) {
      alert("⚠️ Por favor ingresa tu número de teléfono y selecciona un método de pago");
      return;
    }

    if (metodoPago === "Banco" && !bancoSeleccionado) {
      alert("⚠️ Debes seleccionar un banco para continuar con la transferencia");
      return;
    }

    onConfirm({ telefono, metodoPago, bancoSeleccionado });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Resumen de Compra</h2>

        {/* Lista de boletos */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2 text-gray-700">Boletos Seleccionados:</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {tickets.map((ticket, index) => (
              <div key={index} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex-1">
                  <div className="font-semibold">#{ticket.numero}</div>
                  <div className="text-sm text-gray-600">Precio: ${ticket.precio}</div>
                  <div className="text-sm text-gray-600">Nombre: {ticket.comprador}</div>
                </div>
                <button
                  onClick={() => onDelete(index)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-200 text-sm"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Teléfono */}
        <div className="mb-4">
          <label className="block font-semibold mb-2 text-gray-700">Número de Teléfono</label>
          <input
            type="text"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
            placeholder="Ej: 3001234567"
          />
        </div>

        {/* Método de pago */}
        <div className="mb-4">
          <label className="block font-semibold mb-2 text-gray-700">Método de Pago</label>
          <select
            value={metodoPago}
            onChange={(e) => {
              setMetodoPago(e.target.value);
              if (e.target.value !== "Banco") {
                setBancoSeleccionado(null);
              }
            }}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
          >
            <option value="">-- Selecciona --</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Banco">Transferencia Bancaria</option>
          </select>
        </div>

        {/* Selección de banco */}
        {metodoPago === "Banco" && (
          <div className="mb-4">
            <label className="block font-semibold mb-2 text-gray-700">Selecciona un Banco</label>
            <select
              value={bancoSeleccionado ? bancoSeleccionado.IdBanco : ""}
              onChange={(e) => {
                const banco = bancos.find(
                  (b) => b.IdBanco === parseInt(e.target.value)
                );
                setBancoSeleccionado(banco || null);
              }}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Selecciona un banco --</option>
              {bancos.map((b) => (
                <option key={b.IdBanco} value={b.IdBanco}>
                  {b.Banco} - {b.Cuenta}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Información del banco seleccionado */}
        {bancoSeleccionado && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Información del Banco:</h4>
            <p className="text-sm text-blue-700"><strong>Banco:</strong> {bancoSeleccionado.Banco}</p>
            <p className="text-sm text-blue-700"><strong>Cuenta:</strong> {bancoSeleccionado.Cuenta}</p>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-200 font-semibold"
          >
            Confirmar Compra
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketPreviewModalOnline;