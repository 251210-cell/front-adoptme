document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GESTIÓN DE SESIÓN Y LOGIN ---
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('userRol');
    const nombre = localStorage.getItem('nombreUsuario') || 'Usuario';

    // Redirección si es admin
    if (token && rol === 'admin') {
        window.location.href = 'src/views/index-admin.html';
        return;
    }

    const bInvitado = document.getElementById('botones-invitado');
    const pUsuario = document.getElementById('panel-usuario');
    const nDisplay = document.getElementById('nombre-display');
    const avatarImg = document.getElementById('user-avatar-img');

    if (token) {
        if (bInvitado) bInvitado.style.display = 'none';
        if (pUsuario) pUsuario.style.display = 'flex';
        if (nDisplay) nDisplay.innerText = nombre;
        if (avatarImg) {
            avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=FF6600&color=fff&rounded=true`;
        }
    }

    // --- 2. LÓGICA DEL DROPDOWN (SUBMENÚ DE USUARIO) ---
    const userTrigger = document.getElementById('userTrigger');
    const userMenu = document.getElementById('dropdown-menu-user');

    if (userTrigger && userMenu) {
        userTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenu.classList.toggle('active');
        });

        document.addEventListener('click', () => {
            if (userMenu.classList.contains('active')) {
                userMenu.classList.remove('active');
            }
        });
    }

    // --- 3. BOTÓN CERRAR SESIÓN ---
    const btnCerrar = document.getElementById('btnCerrarSesion');
    if (btnCerrar) {
        btnCerrar.addEventListener('click', (e) => {
            e.preventDefault();
            Swal.fire({
                title: '¿Quieres cerrar sesión?',
                text: "Tendrás que volver a ingresar para adoptar.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#FF6600',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, salir',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.clear();
                    window.location.reload();
                }
            });
        });
    }

    // --- 4. LÓGICA DEL GLOBITO DE CHAT ---
    const chatBtn = document.getElementById('chat-bubble-btn');
    const chatWidget = document.getElementById('chat-widget-container');

    if (chatBtn && chatWidget) {
        chatBtn.addEventListener('click', () => {
            chatWidget.style.display = (chatWidget.style.display === 'none' || chatWidget.style.display === '') ? 'block' : 'none';
        });
    }

    cargarMascotas();
});

async function cargarMascotas() {
    const grid = document.querySelector('.pets-grid');
    if (!grid) return;

    try {
        const response = await fetch('http://18.206.62.120:3000/api/mascotas');
        const mascotas = await response.json();
        
        // Renderizamos TODAS las mascotas (con su color original)
        grid.innerHTML = mascotas.map(m => {
            const estadoClase = m.estado ? m.estado.toLowerCase() : 'disponible';
            return `
            <div class="pet-card">
                <div class="card-image" style="position: relative;">
                    <img src="${m.imagen}" alt="${m.nombre}" onerror="this.src='https://via.placeholder.com/300x200?text=AdoptMe'">
                    <span class="status-badge ${estadoClase}">${m.estado}</span>
                </div>
                <div class="card-info">
                    <h3>${m.nombre}, <span>${m.edad}</span></h3>
                    <p class="breed">${m.raza}</p>
                    <button class="btn-conocer" onclick='window.abrirModalPerfil(${JSON.stringify(m).replace(/'/g, "&apos;")})'>
                        Conóceme <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        `}).join('');
    } catch (error) {
        console.error("Error API:", error);
    }
}

// --- 5. FUNCIONES GLOBALES PARA EL MODAL (CORREGIDAS) ---
window.abrirModalPerfil = (mascota) => {
    localStorage.setItem('mascotaSeleccionadaId', mascota.id);
    localStorage.setItem('mascotaSeleccionadaNombre', mascota.nombre);
    localStorage.setItem('mascotaSeleccionadaFoto', mascota.imagen);

    // Llenar datos básicos
    const modalImg = document.getElementById('modal-foto');
    if (modalImg) modalImg.src = mascota.imagen;

    document.getElementById('modal-nombre-completo').innerHTML = `${mascota.nombre}, <span>${mascota.edad}</span>`;
    document.getElementById('modal-raza').innerText = mascota.raza;
    document.getElementById('modal-edad-detalle').innerText = mascota.edad;
    document.getElementById('modal-condicion').innerText = mascota.condicion_especial || "Sin condiciones especiales";
    document.getElementById('modal-descripcion').innerText = mascota.descripcion || "Esperando por un hogar.";

    // LÓGICA DE CONTROL DEL BOTÓN DE ADOPCIÓN
    const btnSolicitar = document.querySelector('.btn-solicitar');
    let mensajeTierno = document.getElementById('mensaje-tierno-modal');

    // Si no existe el contenedor del mensaje, lo creamos
    if (!mensajeTierno) {
        mensajeTierno = document.createElement('div');
        mensajeTierno.id = 'mensaje-tierno-modal';
        if (btnSolicitar && btnSolicitar.parentNode) {
            btnSolicitar.parentNode.insertBefore(mensajeTierno, btnSolicitar);
        }
    }

    if (mascota.estado === 'Adoptado') {
        // Bloqueo para adoptados
        if (btnSolicitar) btnSolicitar.style.display = 'none';
        mensajeTierno.style.display = 'block';
        mensajeTierno.innerHTML = `
            <div style="background: #f0f8ff; color: #1e88e5; padding: 15px; border-radius: 12px; text-align: center; border: 2px dashed #1e88e5; font-weight: bold; width: 100%; margin-top: 10px;">
                <i class="fas fa-home"></i> ¡Ya estoy con mi nueva familia recibiendo mucho amor! ❤️
            </div>
        `;
    } else {
        // Habilitado para disponibles/pendientes
        if (btnSolicitar) btnSolicitar.style.display = 'block';
        mensajeTierno.style.display = 'none';
    }

    document.getElementById('modal-perfil-container').style.display = 'flex';
};

window.cerrarModal = () => {
    document.getElementById('modal-perfil-container').style.display = 'none';
};

window.irAFuncionSolicitud = () => {
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = 'src/views/solicitud.html';
    } else {
        Swal.fire({
            title: '¡Inicia Sesión!',
            text: 'Necesitas una cuenta para iniciar el proceso de adopción.',
            icon: 'info',
            confirmButtonColor: '#FF6600'
        }).then(() => {
            window.location.href = 'src/views/login.html';
        });
    }
};