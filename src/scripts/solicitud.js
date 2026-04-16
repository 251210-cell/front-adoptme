document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = 'http://18.206.62.120:3000/api';
    const formularioAdopcion = document.querySelector('form');
    const listContainer = document.getElementById('listaConversaciones');

    // --- 1. FUNCIÓN PARA CARGAR (Solo si existe la lista de admin) ---
    async function cargarSolicitudes() {
        if (!listContainer) return; 
        try {
            const res = await fetch(`${API_BASE}/solicitudes`);
            const data = await res.json();
            // Aquí iría tu renderList(data) que ya tienes
        } catch (e) { console.error(e); }
    }

    // --- 2. LOGICA DE ENVÍO Y REDIRECCIÓN (Usuario) ---
    if (formularioAdopcion) {
        formularioAdopcion.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Obtenemos el ID de la mascota desde la URL
            const urlParams = new URLSearchParams(window.location.search);
            const idMascota = urlParams.get('id') || 1; 

            // Construimos los datos con los nombres EXACTOS de tu modelo de Sequelize
            const datos = {
                id_usuario: 1, // ID temporal, cámbialo por el del usuario logueado
                id_mascota: parseInt(idMascota),
                nombre_completo: formularioAdopcion.querySelector('[name="nombre"]')?.value,
                edad_usuario: parseInt(formularioAdopcion.querySelector('[name="edad"]')?.value),
                ocupacion: formularioAdopcion.querySelector('[name="ocupacion"]')?.value,
                motivo_adopcion: formularioAdopcion.querySelector('textarea')?.value,
                tiene_mascotas_actuales: formularioAdopcion.querySelector('input[name="mascotas"]:checked')?.value || 'No',
                // Mapeo manual para los campos de texto restantes según tu HTML
                permiso_casero: formularioAdopcion.querySelectorAll('input[type="text"]')[3]?.value || 'N/A',
                espacio_suficiente: formularioAdopcion.querySelectorAll('input[type="text"]')[4]?.value || 'N/A',
                estado: 'Pendiente'
            };

            try {
                const res = await fetch(`${API_BASE}/solicitudes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datos)
                });

                if (res.ok) {
                    await Swal.fire({
                        title: '¡Enviado!',
                        text: 'Tu solicitud se envió con éxito. Redirigiendo...',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });

                    // EXPLICACIÓN DE LA RUTA:
                    // Como estás en 'src/views/solicitud.html', 
                    // simplemente llamamos al archivo que está en la misma carpeta.
                    window.location.href = './solicitud-enviada.html'; 

                } else {
                    const errorData = await res.json();
                    throw new Error(errorData.error);
                }
            } catch (err) {
                console.error("Error al enviar:", err);
                Swal.fire('Error', 'El servidor no pudo guardar la solicitud. Revisa el Repositorio.', 'error');
            }
        });
    }

    cargarSolicitudes();
});