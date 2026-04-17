document.addEventListener('DOMContentLoaded', async () => {
    const API_BASE = 'http://18.206.62.120:3000/api';
    
    // Obtenemos los datos de sesión
    const idAdmin = localStorage.getItem('usuarioId'); 
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem("userRol");

    // Protección de ruta
    if (!token || rol !== "admin") {
        window.location.href = "../../index.html";
        return;
    }

    // 1. Cargar Datos desde la Base de Datos al entrar
    async function cargarDatosDesdeBD() {
        try {
            const res = await fetch(`${API_BASE}/usuarios/${idAdmin}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!res.ok) throw new Error("Error al obtener datos");
            
            const admin = await res.json();

            // Llenamos el formulario con lo que diga la BD
            document.getElementById('perfilNombre').value = admin.nombre_usuario;
            document.getElementById('perfilCorreo').value = admin.email;
            document.getElementById('perfilNombreDisplay').textContent = admin.nombre_usuario;
            
            // Actualizar avatar
            const avatarImg = document.getElementById('perfilAvatarImg');
            if (avatarImg) {
                avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.nombre_usuario)}&background=FF6600&color=fff&size=150`;
            }
        } catch (err) {
            console.error("Error cargando perfil:", err);
            // Si falla la API, usamos lo que haya en localStorage como respaldo
            document.getElementById('perfilNombre').value = localStorage.getItem('nombreUsuario') || 'Admin';
        }
    }

    await cargarDatosDesdeBD();

    // 2. Guardar Cambios en la Base de Datos
    const form = document.getElementById('formPerfilAdmin');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nuevoNombre = document.getElementById('perfilNombre').value.trim();

            try {
                const res = await fetch(`${API_BASE}/usuarios/${idAdmin}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // Importante para la seguridad
                    },
                    body: JSON.stringify({
                        nombre_usuario: nuevoNombre
                    })
                });

                if (res.ok) {
                    // Actualizamos también el localStorage para que el header cambie sin cerrar sesión
                    localStorage.setItem('nombreUsuario', nuevoNombre);
                    
                    await Swal.fire({
                        icon: 'success',
                        title: '¡Actualizado en la BD!',
                        text: 'Tus cambios se guardaron en el servidor de AWS.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    location.reload();
                } else {
                    Swal.fire('Error', 'No se pudo actualizar en el servidor', 'error');
                }
            } catch (err) {
                Swal.fire('Error', 'Fallo de conexión con AWS', 'error');
            }
        });
    }
});