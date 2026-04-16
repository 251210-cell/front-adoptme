document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar sesión
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("userRol");

    if (!token || rol !== "admin") {
        window.location.href = "../../index.html";
        return;
    }

    // 2. Cargar datos
    const nombreGuardado = localStorage.getItem('nombreUsuario') || 'Admin';
    const correoGuardado = localStorage.getItem('correoUsuario') || 'admin@adoptme.com';

    if (document.getElementById('perfilNombre')) document.getElementById('perfilNombre').value = nombreGuardado;
    if (document.getElementById('perfilCorreo')) document.getElementById('perfilCorreo').value = correoGuardado;
    if (document.getElementById('perfilNombreDisplay')) document.getElementById('perfilNombreDisplay').textContent = nombreGuardado;
    
    const avatarImg = document.getElementById('perfilAvatarImg');
    if (avatarImg) {
        avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreGuardado)}&background=FF6600&color=fff&size=150`;
    }

    // 3. Guardar cambios
    const form = document.getElementById('formPerfilAdmin');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const nuevoNombre = document.getElementById('perfilNombre').value.trim();
            localStorage.setItem('nombreUsuario', nuevoNombre);
            
            Swal.fire({
                icon: 'success',
                title: 'Perfil Actualizado',
                showConfirmButton: false,
                timer: 1500
            }).then(() => location.reload());
        });
    }
});