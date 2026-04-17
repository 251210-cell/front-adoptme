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

    // --- 2. LÓGICA DEL DROPDOWN ---
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
    window.cerrarSesionAdmin = () => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Tendrás que volver a iniciar sesión.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#FF6600',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, salir',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.clear();
                window.location.href = "../../index.html";
            }
        });
    };

    // --- 4. GLOBITO DE CHAT ---
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

        // Override local: si el usuario ya envió una solicitud por esta mascota,
        // la mostramos como "Pendiente" aunque la API siga diciendo "Disponible".
        let pendientesLocales = JSON.parse(localStorage.getItem('mascotasPendientes') || '[]');
        mascotas.forEach(m => {
            if (pendientesLocales.includes(parseInt(m.id)) && m.estado === 'Disponible') {
                m.estado = 'Pendiente';
            }
        });
        // Limpiamos del respaldo las mascotas que la API ya reporta fuera de "Disponible"
        pendientesLocales = pendientesLocales.filter(id => {
            const mascota = mascotas.find(x => parseInt(x.id) === parseInt(id));
            return mascota && mascota.estado === 'Pendiente';
        });
        localStorage.setItem('mascotasPendientes', JSON.stringify(pendientesLocales));

        // Renderizamos con el color original
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

        // --- Abrir perfil automáticamente si viene ?abrirPerfil=ID en la URL ---
        const params = new URLSearchParams(window.location.search);
        const idAbrir = params.get('abrirPerfil');
        if (idAbrir) {
            const mascotaEncontrada = mascotas.find(m => String(m.id) === String(idAbrir));
            if (mascotaEncontrada) {
                window.abrirModalPerfil(mascotaEncontrada);
            }
            // Limpiamos el query param de la URL para que no se vuelva a disparar
            const urlLimpia = window.location.pathname;
            window.history.replaceState({}, document.title, urlLimpia);
        }
    } catch (error) {
        console.error("Error API:", error);
    }
}

// --- 5. FUNCIONES GLOBALES PARA EL MODAL (CORREGIDO) ---
window.abrirModalPerfil = (mascota) => {
    localStorage.setItem('mascotaSeleccionadaId', mascota.id);
    localStorage.setItem('mascotaSeleccionadaNombre', mascota.nombre);
    localStorage.setItem('mascotaSeleccionadaFoto', mascota.imagen);

    const modalImg = document.getElementById('modal-foto');
    if (modalImg) modalImg.src = mascota.imagen;

    document.getElementById('modal-nombre-completo').innerHTML = `${mascota.nombre}, <span>${mascota.edad}</span>`;
    document.getElementById('modal-raza').innerText = mascota.raza;
    document.getElementById('modal-edad-detalle').innerText = mascota.edad;
    document.getElementById('modal-condicion').innerText = mascota.condicion_especial || "Sin condiciones especiales";
    document.getElementById('modal-descripcion').innerText = mascota.descripcion || "Esperando por un hogar.";

    // Refugio dinámico (coherente con lo guardado en agregarmascota)
    const refugioEl = document.getElementById('modal-refugio');
    if (refugioEl) {
        refugioEl.innerText = mascota.refugio || 'Refugio Patitas Felices';
    }

    if (document.getElementById('modal-nombre-bio')) {
        document.getElementById('modal-nombre-bio').innerText = mascota.nombre;
    }

    // --- CORRECCIÓN DINÁMICA DEL BADGE (Color y Texto) ---
    const badgeEstado = document.getElementById('modal-estado-badge');
    if (badgeEstado) {
        const estadoActual = mascota.estado || 'Disponible';
        badgeEstado.innerText = estadoActual;

        // Reset de estilos
        badgeEstado.style.backgroundColor = '';
        badgeEstado.style.background = '';
        badgeEstado.style.color = '#ffffff';
        badgeEstado.style.textShadow = '';
        badgeEstado.style.boxShadow = '';
        badgeEstado.style.animation = '';

        const lowerEstado = estadoActual.toLowerCase();

        if (lowerEstado === 'adoptado') {
            badgeEstado.style.backgroundColor = '#007bff';
        } else if (lowerEstado === 'pendiente') {
            badgeEstado.style.background = 'linear-gradient(135deg, #FFEA00, #FFC400)';
            badgeEstado.style.color = '#ffffff';
            badgeEstado.style.textShadow = '0 1px 2px rgba(0,0,0,0.25)';
        } else {
            badgeEstado.style.backgroundColor = '#2ECC71';
        }
    }

    // --- CORRECCIÓN DEL FOOTER (Botón o Mensaje) ---
    const footerVert = document.querySelector('.footer-vert');
    const estadoBotones = mascota.estado ? mascota.estado.toLowerCase() : 'disponible';

    if (footerVert) {
        if (estadoBotones === 'disponible') {
            footerVert.innerHTML = `
                <button class="btn-adopt-vert" onclick="window.irAFuncionSolicitud()">
                    Quiero Adoptarlo <i class="fas fa-paw"></i>
                </button>
            `;
        } else if (estadoBotones === 'adoptado') {
            footerVert.innerHTML = `
                <div style="background: #e3f2fd; color: #1565c0; padding: 18px; border-radius: 12px; text-align: center; border: 2px dashed #64b5f6; font-weight: bold; width: 100%; font-family: 'Poppins', sans-serif;">
                    <i class="fas fa-home"></i> ¡Ya estoy con mi nueva familia recibiendo mucho amor! ❤️
                </div>
            `;
        } else {
            // Caso Pendiente
            footerVert.innerHTML = `
                <div style="background: #fff3e0; color: #e65100; padding: 18px; border-radius: 12px; text-align: center; border: 2px dashed #ffb74d; font-weight: bold; width: 100%; font-family: 'Poppins', sans-serif;">
                    <i class="fas fa-clock"></i> ¡Estamos revisando solicitudes para mi adopción! 🐾
                </div>
            `;
        }
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