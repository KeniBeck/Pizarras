'use client'

const RouteProtected = ({ children }) => {

    let logged = false;
    if (typeof window !== 'undefined') {
        logged = sessionStorage.getItem('logged') === 'true';
    }

    if (!logged && typeof window !== 'undefined') { // Verifica si estás en el lado del cliente
        window.location.href = '/';
        return null;
    }
    return children;
};

export default RouteProtected;