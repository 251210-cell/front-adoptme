const BASE_URL = "http://18.206.62.120:3000/api";

export const callApi = async (endpoint, method = 'GET', data = null) => {
    try {
        const token = localStorage.getItem('token');
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            }
        };

        if (data) options.body = JSON.stringify(data);

        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            if (result.details && result.details.length > 0) {
                const errorMsg = result.details.map(d => d.message).join(', ');
                throw new Error(errorMsg);
            }
            if (result.error) throw new Error(result.error);
            throw new Error(`Error ${response.status}: Ups, algo salió mal`);
        }
        
        return result;
    } catch (error) {
        throw error;
    }
};

// Funciones de Usuario
export const loginUser = (data) => callApi('/usuarios/login', 'POST', data);
export const registerUser = (data) => callApi('/usuarios', 'POST', data);

// Función de Solicitudes (LA QUE FALTABA)
export const enviarSolicitudAdopcion = (data) => callApi('/solicitudes', 'POST', data);
