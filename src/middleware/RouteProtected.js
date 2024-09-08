'use client'
import VailidationEstatus from "@/hook/validationEstatus";

const RouteProtected = ({ children }) => {
    VailidationEstatus();

    let logged = false;
    if (typeof window !== 'undefined') {
        logged = localStorage.getItem('logged') === 'true';
    }

    if (!logged && typeof window !== 'undefined') { // Verifica si estás en el lado del cliente
        window.location.href = '/';
        return null;
    }
    return children;
};

export default RouteProtected;