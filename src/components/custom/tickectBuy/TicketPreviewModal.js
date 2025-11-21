// TicketPreviewModal.js
import React from 'react';

const TicketPreviewModal = ({ tickets, onClose, onConfirm, onDelete }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Boletos Acumulados</h2>
                <ul className="mb-4">
                    {tickets.map((ticket, index) => (
                        <li key={index} className="mb-2 flex justify-between items-center">
                            <div>
                                <div>Boleto: {ticket.numero}</div>
                                <div>Precio: {ticket.precio}</div>
                                <div>Nombre: {ticket.comprador}</div>
                            </div>
                            <button
                                onClick={() => onDelete(index)}
                                className="bg-red-500 text-white px-2 py-1 rounded"
                            >
                                Eliminar
                            </button>
                        </li>
                    ))}
                </ul>
                <div className="flex justify-end space-x-4">
                    <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">Cancelar</button>
                    <button onClick={onConfirm} className="bg-red-700 text-white px-4 py-2 rounded">Confirmar</button>
                </div>
            </div>
        </div>
    );
};

export default TicketPreviewModal;