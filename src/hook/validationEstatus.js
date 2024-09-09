const VailidationEstatus = async () => {
    if (typeof window !== 'undefined') {
        try {
            // Obtener userData desde localStorage
            const userData = localStorage.getItem('userData');
            if (!userData) {
                throw new Error('No se encontró userData en localStorage');
            }

            const parsedUserData = JSON.parse(userData);
            const userId = parsedUserData.Idvendedor;

            // Realizar la solicitud POST a la API para obtener la información del usuario
            const response = await fetch('/api/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) {
                throw new Error('Error en la solicitud a la API');
            }

            const userApiData = await response.json();

            // Verificar el estado del usuario
            if (userApiData.Estatus === 'alta') {
                localStorage.setItem('logged', true);
            } else {
                localStorage.setItem('logged', false);
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Error al obtener la información del usuario:', error);
            localStorage.setItem('logged', false);
            window.location.href = '/';
        }
    }
};

export default VailidationEstatus;