document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar Sesión (mismas llaves que login.js: token + userRol + nombreUsuario)
    //    Aceptamos como "logueado" si existe CUALQUIERA de las señales de sesión,
    //    para tolerar el caso en que response.token venga undefined pero el resto sí.
    const tokenLS = localStorage.getItem('token');
    const nombreLS = localStorage.getItem('nombreUsuario');
    const idLS = localStorage.getItem('usuarioId');
    const isLogged = !!(tokenLS && tokenLS !== 'undefined') || !!nombreLS || !!idLS;
    const rol = localStorage.getItem('userRol');

    console.log('[nosotros] session check', { token: tokenLS, nombre: nombreLS, id: idLS, isLogged });
    
    // Elementos del DOM
    const botonesInvitado = document.getElementById('botones-invitado');
    const panelUsuario = document.getElementById('panel-usuario');
    const nombreDisplay = document.getElementById('nombre-display');
    const linkPerfil = document.querySelector('.profile-link-wrapper'); 
    const logoContainer = document.querySelector('.logo-container'); 
    
    // El botón oculto de estadísticas
    const btnEstadisticas = document.getElementById('btn-estadisticas');

    if (isLogged) {
        // --- ESTÁ LOGUEADO ---
        if(botonesInvitado) botonesInvitado.style.display = 'none';
        if(panelUsuario) panelUsuario.style.display = 'flex';
        
        // Recuperar nombre
        const nombreUser = localStorage.getItem('nombreUsuario') || 'Usuario';
        if(nombreDisplay) nombreDisplay.textContent = nombreUser;

        // Avatar (el HTML usa clase, no id)
        const avatarImg = document.getElementById('user-avatar-img')
            || document.querySelector('#panel-usuario .avatar-img');
        if (avatarImg) {
            avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreUser)}&background=FF6600&color=fff&rounded=true`;
        }

        // --- LÓGICA DE ADMIN ---
        if (rol === 'admin') {
            // 1. Redirecciones Admin
            if(logoContainer) logoContainer.href = '/src/views/index-admin.html';
            if(linkPerfil) linkPerfil.href = '/src/views/index-admin.html';

            // 2. Cambiar enlaces del menú
            const linkMensajes = document.querySelector('a[href="vistachat.html"]');
            if (linkMensajes) linkMensajes.href = '/src/views/chat-admin.html';

            // 3. MOSTRAR BOTÓN DE ESTADÍSTICAS (Solo Admin)
            if (btnEstadisticas) {
                btnEstadisticas.style.display = 'flex';
            }

        } else {
            // Usuario Normal
            if(linkPerfil) linkPerfil.href = '/src/views/perfil.html';
        }

    } else {
        // --- NO ESTÁ LOGUEADO ---
        if(botonesInvitado) botonesInvitado.style.display = 'flex';
        if(panelUsuario) panelUsuario.style.display = 'none';
    }

    // --- Renderizado de contenido editado por el admin ---
    renderDatosNosotros();
});

function setText(id, valor) {
    const el = document.getElementById(id);
    if (el && valor) el.textContent = valor;
}

async function renderDatosNosotros() {
    // Traemos los datos del backend (GET /api/nosotros es público)
    let datos = {};
    try {
        const res = await fetch('http://18.206.62.120:3000/api/nosotros');
        if (res.ok) datos = await res.json();
    } catch (e) { console.warn('No se pudo cargar /api/nosotros:', e); }

    // Respaldo: si la API falla, usamos lo cacheado por el admin
    if (!datos || Object.keys(datos).length === 0) {
        datos = JSON.parse(localStorage.getItem('datosNosotros') || '{}');
    }

    // Intro
    setText('ns-titulo-principal', datos.tituloPrincipal);
    setText('ns-subtitulo', datos.subtitulo);
    setText('ns-parrafo1', datos.parrafo1);
    setText('ns-parrafo2', datos.parrafo2);

    // Imagen de intro (si el admin la subió)
    const imgIntro = document.getElementById('ns-imagen-intro');
    if (imgIntro && datos.imagenIntro) {
        imgIntro.src = datos.imagenIntro;
    }

    // Objetivo
    setText('ns-titulo-objetivo', datos.tituloObjetivo);
    setText('ns-objetivo1', datos.objetivo1);
    setText('ns-objetivo2', datos.objetivo2);
    setText('ns-objetivo3', datos.objetivo3);

    // Equipo
    setText('ns-titulo-equipo', datos.tituloEquipo);

    const grid = document.getElementById('ns-team-grid');
    if (grid && Array.isArray(datos.miembrosEquipo) && datos.miembrosEquipo.length > 0) {
        grid.innerHTML = datos.miembrosEquipo.map(m => {
            const nombre = m.nombre || 'Nombre Apellido';
            const rol = m.rol || 'Rol';
            const avatarInner = m.imagen
                ? `<img src="${m.imagen}" alt="${nombre}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
                : '';
            return `
                <div class="team-card">
                    <div class="avatar-placeholder">${avatarInner}</div>
                    <h4>${nombre}</h4>
                    <span class="role">${rol}</span>
                </div>
            `;
        }).join('');
    }
}

// Exponemos al window para que los onclick="" del HTML las encuentren
// (el script se carga como type="module", así que no están en el scope global por defecto).
window.toggleMenu = function() {
    const menu = document.getElementById("dropdown-menu");
    if (menu) menu.classList.toggle("active");
};

window.cerrarSesion = function() {
    if (confirm("¿Cerrar sesión?")) {
        localStorage.clear();
        window.location.href = '/index.html';
    }
};

// Cerrar el dropdown si se hace clic fuera
document.addEventListener("click", function(event) {
    const profile = document.querySelector(".user-profile");
    const menu = document.getElementById("dropdown-menu");
    if (profile && menu && !profile.contains(event.target)) {
        menu.classList.remove("active");
    }
});
