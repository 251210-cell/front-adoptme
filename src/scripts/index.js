document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GESTIÓN DE SESIÓN Y LOGIN ---
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('userRol');
    const nombre = localStorage.getItem('nombreUsuario') || 'Usuario';

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

    // Dropdown Usuario
    const trigger = document.getElementById('userTrigger');
    const menu = document.getElementById('dropdown-menu-user');
    if (trigger && menu) {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('active');
        });
    }

    // Cerrar Sesión
    document.getElementById('btnCerrarSesion')?.addEventListener('click', (e) => {
        e.preventDefault();
        Swal.fire({
            title: '¿Quieres salir?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#FF6600',
            confirmButtonText: 'Sí, salir'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.clear();
                window.location.reload();
            }
        });
    });

    // --- 2. LÓGICA DEL GLOBITO DE CHAT (NUEVO) ---
    const chatBtn = document.getElementById('chat-bubble-btn');
    const chatWidget = document.getElementById('chat-widget-container');

    if (chatBtn && chatWidget) {
        chatBtn.addEventListener('click', () => {
            if (chatWidget.style.display === 'none' || chatWidget.style.display === '') {
                chatWidget.style.display = 'block';
            } else {
                chatWidget.style.display = 'none';
            }
        });
    }

    // --- 3. CARGAR MASCOTAS ---
    cargarMascotas();

    // Reabrir modal desde URL
    const params = new URLSearchParams(window.location.search);
    const idAabrir = params.get('abrirPerfil');
    if (idAabrir) {
        setTimeout(() => {
            fetch(`http://18.206.62.120:3000/api/mascotas/${idAabrir}`)
                .then(res => res.json())
                .then(m => { if(m) window.abrirModalPerfil(m); });
        }, 800);
    }
});

async function cargarMascotas() {
    const grid = document.querySelector('.pets-grid');
    if (!grid) return;

    try {
        const response = await fetch('http://18.206.62.120:3000/api/mascotas');
        const mascotas = await response.json();
        const disponibles = mascotas.filter(m => m.estado === 'Disponible');

        grid.innerHTML = disponibles.map(m => `
            <div class="pet-card">
                <div class="card-image">
                    <img src="${m.imagen}" alt="${m.nombre}" onerror="this.src='https://via.placeholder.com/300x200?text=AdoptMe'">
                </div>
                <div class="card-info">
                    <h3>${m.nombre}, <span>${m.edad}</span></h3>
                    <p class="breed">${m.raza}</p>
                    <button class="btn-conocer" onclick='window.abrirModalPerfil(${JSON.stringify(m).replace(/'/g, "&apos;")})'>
                        Conóceme <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error("Error API:", error);
    }
}

// FUNCIONES GLOBALES (MODAL)
window.abrirModalPerfil = (mascota) => {
    localStorage.setItem('mascotaSeleccionadaId', mascota.id);
    localStorage.setItem('mascotaSeleccionadaNombre', mascota.nombre);
    localStorage.setItem('mascotaSeleccionadaFoto', mascota.imagen);

    document.getElementById('modal-foto').src = mascota.imagen;
    document.getElementById('modal-nombre-completo').innerHTML = `${mascota.nombre}, <span>${mascota.edad}</span>`;
    document.getElementById('modal-nombre-bio').innerText = mascota.nombre;
    document.getElementById('modal-raza').innerText = mascota.raza;
    document.getElementById('modal-edad-detalle').innerText = mascota.edad;
    document.getElementById('modal-condicion').innerText = mascota.condicion_especial || "Sin discapacidades";
    document.getElementById('modal-descripcion').innerText = mascota.descripcion || "Un compañero increíble esperando por ti.";

    document.getElementById('modal-perfil-container').style.display = 'flex';
};

window.cerrarModal = () => {
    document.getElementById('modal-perfil-container').style.display = 'none';
};

window.irAFuncionSolicitud = () => {
    if (localStorage.getItem('token')) {
        window.location.href = 'src/views/solicitud.html';
    } else {
        Swal.fire({
            title: '¡Inicia Sesión!',
            text: 'Necesitas una cuenta para adoptar.',
            icon: 'info',
            confirmButtonColor: '#FF6600'
        }).then(() => window.location.href = 'src/views/login.html');
    }
};