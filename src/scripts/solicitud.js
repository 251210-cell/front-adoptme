// El backend expone PATCH /api/mascotas/:id/estado con body { estado }
// (ver backend-adoptme/routes/mascotasRoutes.js:33).
async function actualizarEstadoMascota(idMascota, nuevoEstado) {
    const API_BASE = 'http://18.206.62.120:3000/api';
    try {
        const res = await fetch(`${API_BASE}/mascotas/${idMascota}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        if (res.ok) return true;
        const errText = await res.text();
        console.warn('[estado-mascota] Falló:', res.status, errText);
    } catch (e) {
        console.warn('[estado-mascota] Error de red:', e);
    }
    return false;
}

async function verificarEstadoUsuario() {
    const idUsuario = localStorage.getItem('userId');
    const res = await fetch(`http://18.206.62.120:3000/api/solicitudes/usuario/${idUsuario}`);
    const solicitudes = await res.json();

    const yaAdopto = solicitudes.some(s => s.estado === 'Aprobada');
    
    if (yaAdopto) {
        document.getElementById('adoptionForm').innerHTML = `
            <div class="alert-info">
                <h2>¡Ya eres adoptante!</h2>
                <p>Nuestra política actual permite una adopción por cuenta de usuario.</p>
            </div>
        `;
    }
}
document.addEventListener('DOMContentLoaded', async () => {
    const API_BASE = 'http://18.206.62.120:3000/api';
    const formularioAdopcion = document.getElementById('adoptionForm');

    // --- 0. CARGAR INFORMACIÓN DEL USUARIO EN HEADER Y FORMULARIO ---
    const idUsuarioLS = localStorage.getItem('usuarioId');
    const nombreLS = localStorage.getItem('nombreUsuario') || 'Usuario';

    const nombreDisplay = document.getElementById('nombre-display');
    const avatarImg = document.getElementById('user-avatar-img');
    const inputNombre = document.getElementById('nombre');

    if (nombreDisplay) nombreDisplay.innerText = nombreLS;
    if (avatarImg) {
        avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreLS)}&background=FF6600&color=fff&rounded=true`;
    }

    // Pre-llenamos con el nombre del localStorage por si la API falla
    if (inputNombre) inputNombre.value = nombreLS;

    // Intentamos traer la info completa del usuario desde la API
    if (idUsuarioLS) {
        try {
            const resUser = await fetch(`${API_BASE}/usuarios/${idUsuarioLS}`);
            if (resUser.ok) {
                const user = await resUser.json();

                if (inputNombre && (user.nombre_usuario || user.nombre)) {
                    inputNombre.value = user.nombre_usuario || user.nombre;
                }

                // Edad / ocupación NO se prellenan: son campos específicos de esta
                // solicitud (no del perfil) y deben ser escritos por el usuario aquí.

                if (nombreDisplay && (user.nombre_usuario || user.nombre)) {
                    nombreDisplay.innerText = user.nombre_usuario || user.nombre;
                }
            }
        } catch (err) {
            console.log("No se pudo cargar info del usuario desde la API:", err);
        }
    }

    if (formularioAdopcion) {
        formularioAdopcion.addEventListener('submit', async (e) => {
            e.preventDefault();

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

            // 2. Captura y validación de datos
            const edadRaw = document.getElementById('edad').value.trim();
            const vEdad = edadRaw ? parseInt(edadRaw, 10) : null;
            const vOcupacion = document.getElementById('ocupacion').value.trim();
            const vMotivo = document.getElementById('motivo').value.trim();
            const vMascotas = document.querySelector('input[name="mascotas"]:checked')?.value === 'si' ? 'Si' : 'No';
            const vRenta = document.getElementById('renta').value.trim() || 'N/A';
            const vEspacio = document.getElementById('espacio').value.trim() || 'N/A';

            // Validación cliente antes de enviar — para evitar que el backend
            // reciba NaN/"" y los guarde como null.
            if (!vEdad || Number.isNaN(vEdad)) {
                return Swal.fire('Atención', 'Ingresa una edad válida.', 'warning');
            }
            if (!vOcupacion) {
                return Swal.fire('Atención', 'Ingresa tu ocupación.', 'warning');
            }
            if (!vMotivo) {
                return Swal.fire('Atención', 'Cuéntanos por qué deseas adoptar.', 'warning');
            }

            // Payload con los nombres EXACTOS que la API usa en su respuesta.
            const datos = {
                id_usuario: parseInt(idUsuario),
                id_mascota: parseInt(idMascota),
                edad_usuario: vEdad,
                ocupacion: vOcupacion,
                motivo_adopcion: vMotivo,
                tiene_mascotas_actuales: vMascotas,
                permiso_casero: vRenta,
                espacio_suficiente: vEspacio,
                estado: 'Pendiente'
            };

            console.log('[solicitud] Enviando al backend:', datos);

            // 3. Envío de la solicitud
            try {
                const res = await fetch(`${API_BASE}/solicitudes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datos)
                });

                // Log de la respuesta para diagnosticar qué campos realmente guardó
                const cloneForLog = res.clone();
                try {
                    const dataRes = await cloneForLog.json();
                    console.log('[solicitud] Respuesta del backend:', dataRes);
                } catch (_) { /* noop */ }

                if (res.ok) {
                    // 4. Actualizamos el estado de la mascota a "Pendiente".
                    //    El PUT parcial da 400 (el endpoint valida el objeto completo),
                    //    así que traemos la mascota actual, cambiamos sólo el estado
                    //    y reenviamos. Intentamos varias estrategias en orden.
                    await actualizarEstadoMascota(idMascota, 'Pendiente');

                    // 5. Respaldo en localStorage: marcamos esta mascota como pendiente
                    //    para que la UI la muestre así aunque la API aún no refleje el cambio.
                    try {
                        const pendientes = JSON.parse(localStorage.getItem('mascotasPendientes') || '[]');
                        if (!pendientes.includes(parseInt(idMascota))) {
                            pendientes.push(parseInt(idMascota));
                            localStorage.setItem('mascotasPendientes', JSON.stringify(pendientes));
                        }
                    } catch (errLS) { /* noop */ }

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
                    Swal.fire('Error', errorData.message || 'Usted ya a adoptado,intrnte luego', 'error');
                }
            } catch (err) {
                Swal.fire('Error', 'No se pudo conectar con el servidor.', 'error');
            }
        });
    }
});
