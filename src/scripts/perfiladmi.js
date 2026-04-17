document.addEventListener('DOMContentLoaded', async () => {
    const API_BASE = 'http://18.206.62.120:3000/api';
    const idAdmin = localStorage.getItem('usuarioId'); 
    const token = localStorage.getItem('token');

    // 1. Función para actualizar la UI (Input, Texto y Avatar)
    const actualizarInterfaz = (nombre) => {
        const display = document.getElementById('perfilNombreDisplay');
        const avatar = document.getElementById('perfilAvatarImg');
        if (display) display.textContent = nombre;
        if (avatar) {
            avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=FF6600&color=fff&size=150`;
        }
    };

    // 2. Cargar datos desde AWS
    async function cargarDatos() {
        if (!idAdmin) return;
        try {
            const res = await fetch(`${API_BASE}/usuarios/${idAdmin}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const admin = await res.json();
                document.getElementById('perfilNombre').value = admin.nombre_usuario || '';
                document.getElementById('perfilCorreo').value = admin.email || '';
                // AGREGADO: Cargar el teléfono desde la BD
                if(document.getElementById('perfilTelefono')) {
                    document.getElementById('perfilTelefono').value = admin.telefono || '';
                }
                actualizarInterfaz(admin.nombre_usuario || 'Admin');
            }
        } catch (err) { console.error("Error al conectar con AWS:", err); }
    }

    await cargarDatos();

    // 3. Guardar cambios en la Base de Datos
    const form = document.getElementById('formPerfilAdmin');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Capturamos AMBOS valores
            const nuevoNombre = document.getElementById('perfilNombre').value.trim();
            const nuevoTelefono = document.getElementById('perfilTelefono').value.trim();

            try {
                const res = await fetch(`${API_BASE}/usuarios/${idAdmin}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    // MANDAMOS AMBOS al Backend
                    body: JSON.stringify({ 
                        nombre_usuario: nuevoNombre,
                        telefono: nuevoTelefono 
                    })
                });

                if (res.ok) {
                    localStorage.setItem('nombreUsuario', nuevoNombre);
                    
                    await Swal.fire({
                        icon: 'success',
                        title: '¡Perfil Actualizado!',
                        text: 'Los datos han sido actualizados.',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    location.reload();
                } else {
                    const errorData = await res.json();
                    Swal.fire('Error', errorData.error || 'No se pudo actualizar.', 'error');
                }
            } catch (err) {
                Swal.fire('Error', 'Fallo de red al conectar con AWS.', 'error');
            }
        });
    }
});