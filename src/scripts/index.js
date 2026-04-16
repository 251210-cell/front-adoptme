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
        
        // MODIFICACIÓN: Ya no filtramos por "Adoptado", mostramos todos
        grid.innerHTML = mascotas.map(m => {
            const estadoClase = m.estado ? m.estado.toLowerCase() : 'disponible';
            const esAdoptado = m.estado === 'Adoptado';

            return `
            <div class="pet-card ${esAdoptado ? 'pet-card-adoptado' : ''}">
                <div class="card-image" style="position: relative;">
                    <img src="${m.imagen}" alt="${m.nombre}" 
                         style="${esAdoptado ? 'filter: grayscale(100%); opacity: 0.6;' : ''}"
                         onerror="this.src='https://via.placeholder.com/300x200?text=AdoptMe'">
                    <span class="status-badge ${estadoClase}">${m.estado}</span>
                </div>
                <div class="card-info">
                    <h3>${m.nombre}, <span>${m.edad}</span></h3>
                    <p class="breed">${m.raza}</p>
                    
                    ${esAdoptado 
                        ? `<button class="btn-conocer" style="background: #7f8c8d; cursor: not-allowed;" onclick="Swal.fire('Final Feliz', 'Este pequeño ya encontró un hogar.', 'success')">
                               ¡Adoptado! <i class="fas fa-check-circle"></i>
                           </button>`
                        : `<button class="btn-conocer" onclick='window.abrirModalPerfil(${JSON.stringify(m).replace(/'/g, "&apos;")})'>
                               Conóceme <i class="fas fa-heart"></i>
                           </button>`
                    }
                </div>
            </div>
        `}).join('');
    } catch (error) {
        console.error("Error API:", error);
    }
}

// FUNCIONES GLOBALES PARA EL MODAL
window.abrirModalPerfil = (mascota) => {
    localStorage.setItem('mascotaSeleccionadaId', mascota.id);
    localStorage.setItem('mascotaSeleccionadaNombre', mascota.nombre);
    localStorage.setItem('mascotaSeleccionadaFoto', mascota.imagen);

    document.getElementById('modal-foto').src = mascota.imagen;
    document.getElementById('modal-nombre-completo').innerHTML = `${mascota.nombre}, <span>${mascota.edad}</span>`;
    document.getElementById('modal-raza').innerText = mascota.raza;
    document.getElementById('modal-edad-detalle').innerText = mascota.edad;
    document.getElementById('modal-condicion').innerText = mascota.condicion_especial || "Sin condiciones especiales";
    document.getElementById('modal-descripcion').innerText = mascota.descripcion || "Esperando por un hogar.";

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