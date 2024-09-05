'use client'

const RouteProtectedAdmin = ({ children }) => {

    let logged = false;
    if (typeof window !== 'undefined') {
        logged = localStorage.getItem('loggedAdmin') === 'true';
    }

    if (!logged && typeof window !== 'undefined') { // Verifica si estás en el lado del cliente
        window.location.href = '/menu';
        return null;
    }
    return children;
};

export default RouteProtectedAdmin;