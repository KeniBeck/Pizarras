const updateInfo = async (userId) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
    };
  

    try {
        const response = await fetch("/api/user", options);
        const data = await response.json();

        // Actualizar la información en localStorage
        localStorage.setItem('userData', JSON.stringify(data));

    } catch (error) {
        console.error('Error al actualizar la información:', error);
    }
};

export default updateInfo;