document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = 'http://18.206.62.120:3000/api';
    
    // Usamos el ID exacto que tienes en el HTML
    const formularioAdopcion = document.getElementById('adoptionForm');

    if (formularioAdopcion) {
        formularioAdopcion.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("Enviando formulario..."); // Para que veas en consola que el botón ya funciona

            // 1. Obtenemos el ID de la mascota que guardó el index.js
            const idMascota = localStorage.getItem('mascotaSeleccionadaId') || 1; 

            // 2. Capturamos los datos usando getElementById (como está en tu HTML)
            const datos = {
                id_usuario: 1, // ID temporal, ajusta según tu sesión
                id_mascota: parseInt(idMascota),
                nombre_completo: document.getElementById('nombre').value,
                edad_usuario: parseInt(document.getElementById('edad').value),
                ocupacion: document.getElementById('ocupacion').value,
                motivo_adopcion: document.getElementById('motivo').value,
                // Captura del radio button
                tiene_mascotas_actuales: document.querySelector('input[name="mascotas"]:checked')?.value === 'si' ? 'Si' : 'No',
                permiso_casero: document.getElementById('renta').value || 'N/A',
                espacio_suficiente: document.getElementById('espacio').value || 'N/A',
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
                        timer: 1500,
                        showConfirmButton: false
                    });

                    // 3. REDIRECCIÓN: Usamos el nombre exacto de tu archivo sin guion
                    window.location.href = './solicitudenviada.html'; 

                } else {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Error en el servidor');
                }
            } catch (err) {
                console.error("Error detallado:", err);
                Swal.fire('Error', 'No se pudo guardar la solicitud. Verifica la conexión con el servidor.', 'error');
            }
        });
    } else {
        console.error("No se encontró el formulario 'adoptionForm' en el HTML");
    }
});