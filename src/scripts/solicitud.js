import { enviarSolicitudAdopcion } from '../services/api.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CONFIGURAR CABECERA (NOMBRE Y AVATAR) ---
    const nombre = localStorage.getItem('nombreUsuario') || 'Usuario'; 
    const nDisplay = document.getElementById('nombre-display');
    const avatarImg = document.getElementById('user-avatar-img');

    if (nDisplay) nDisplay.innerText = nombre;
    if (avatarImg) {
        avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=FF6600&color=fff&rounded=true&bold=true`;
    }

    // --- 2. ENVÍO DE FORMULARIO ---
    const form = document.getElementById('adoptionForm');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Obtenemos los IDs del localStorage
            const usuarioId = localStorage.getItem('usuarioId');
            const mascotaId = localStorage.getItem('mascotaSeleccionadaId');

            // Validación de seguridad
            if (!usuarioId || !mascotaId) {
                Swal.fire({
                    title: 'Sesión Incompleta',
                    text: 'Inicia sesión y selecciona una mascota antes de enviar.',
                    icon: 'warning',
                    confirmButtonColor: '#FF6600'
                });
                return;
            }

            // Construimos el objeto con los nombres exactos de tu tabla
            const datos = {
                id_usuario: parseInt(usuarioId),
                id_mascota: parseInt(mascotaId),
                ocupacion: document.getElementById('ocupacion').value,
                edad_usuario: parseInt(document.getElementById('edad').value),
                motivo_adopcion: document.getElementById('motivo').value,
                tiene_mascotas_actuales: document.querySelector('input[name="mascotas"]:checked')?.value === 'si' ? 'Si' : 'No',
                permiso_casero: document.getElementById('renta').value,
                espacio_suficiente: document.getElementById('espacio').value
            };

            try {
                // A. Guardamos la solicitud en la base de datos
                await enviarSolicitudAdopcion(datos);

                // B. ACTUALIZAR ESTADO DE LA MASCOTA A "PENDIENTE"
                // Esto es lo que hace que en el index ya no aparezca como disponible para otros
                await fetch(`http://18.206.62.120:3000/api/mascotas/${mascotaId}/estado`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ estado: 'Pendiente' })
                });

                // --- REDIRECCIÓN AL ÉXITO ---
                Swal.fire({
                    title: '¡Solicitud Enviada!',
                    text: 'Tu solicitud ha sido enviada y la mascota ahora está en proceso de revisión.',
                    icon: 'success',
                    confirmButtonColor: '#FF6600'
                }).then(() => {
                    // Redirigimos a la vista de éxito que diseñamos
                    window.location.href = 'solicitudenviada.html';
                });

            } catch (error) {
                console.error("Error al enviar:", error);
                Swal.fire({
                    title: 'Error de Servidor',
                    text: 'No pudimos procesar tu solicitud: ' + error.message,
                    icon: 'error',
                    confirmButtonColor: '#d33'
                });
            }
        });
    }
});