'use client'

const RouteProtectedWinner = ({ children }) => {
    // Verificar si estamos en el navegador y si el usuario pertenece a la sucursal Loteria
    let isLoteriaUser = false;
    
    if (typeof window !== 'undefined') {
        try {
            // Obtener los datos del usuario del localStorage
            const userData = JSON.parse(localStorage.getItem('userData'));
            
            // Verificar si el usuario pertenece a la sucursal Loteria
            isLoteriaUser = userData && userData.sucursal === "Loteria";
          
        } catch (error) {
            console.error("Error al verificar los datos del usuario:", error);
        }
    }

    // Si no es usuario de Loteria, redirigir al menú
    if (!isLoteriaUser && typeof window !== 'undefined') {
        console.log("Acceso denegado: Usuario no pertenece a sucursal Loteria");
        window.location.href = '/menu';
        return null;
    }
    
    // Si es usuario de Loteria, permitir acceso
    return children;
};

export default RouteProtectedWinner;