document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = 'http://18.206.62.120:3000/api';
    const formularioAdopcion = document.getElementById('adoptionForm');

    if (formularioAdopcion) {
        formularioAdopcion.addEventListener('submit', async (e) => {
            e.preventDefault(); // Detenemos la recarga para que el código trabaje
            
            const idUsuario = localStorage.getItem('usuarioId') || 1;
            const idMascota = localStorage.getItem('mascotaSeleccionadaId') || 1; 

            // 1. Validación de una sola solicitud
            try {
                const checkRes = await fetch(`${API_BASE}/solicitudes/usuario/${idUsuario}`);
                if (checkRes.ok) {
                    const solicitudesPrevias = await checkRes.json();
                    if (solicitudesPrevias.length > 0) {
                        return Swal.fire('Atención', 'Ya tienes una solicitud activa. No puedes enviar otra.', 'warning');
                    }
                }
            } catch (err) { 
                console.log("Error validando historial, procediendo..."); 
            }

            // 2. Captura de datos con los nombres EXACTOS de tu Base de Datos
            const datos = {
                id_usuario: parseInt(idUsuario), 
                id_mascota: parseInt(idMascota),
                edad_usuario: parseInt(document.getElementById('edad').value), 
                ocupacion: document.getElementById('ocupacion').value,
                motivo_adopcion: document.getElementById('motivo').value,
                tiene_mascotas_actuales: document.querySelector('input[name="mascotas"]:checked')?.value === 'si' ? 'Si' : 'No',
                permiso_casero: document.getElementById('renta').value || 'N/A',
                espacio_suficiente: document.getElementById('espacio').value || 'N/A',
                estado: 'Pendiente'
            };

            // 3. Envío único de la solicitud
            try {
                const res = await fetch(`${API_BASE}/solicitudes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datos)
                });

                if (res.ok) {
                    await Swal.fire({ 
                        title: '¡Enviado!', 
                        text: 'Tu solicitud se registró correctamente',
                        icon: 'success', 
                        timer: 2000, 
                        showConfirmButton: false 
                    });
                    window.location.href = './solicitudenviada.html'; 
                } else {
                    const errorData = await res.json();
                    Swal.fire('Error', errorData.message || 'Error al guardar en la BD', 'error');
                }
            } catch (err) {
                Swal.fire('Error', 'No se pudo conectar con el servidor.', 'error');
            }
        });
    }
});