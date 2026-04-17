document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar Sesión (mismas llaves que login.js: token + userRol + nombreUsuario)
    //    Aceptamos como "logueado" si existe CUALQUIERA de las señales de sesión,
    //    para tolerar el caso en que response.token venga undefined pero el resto sí.
    const tokenLS = localStorage.getItem('token');
    const nombreLS = localStorage.getItem('nombreUsuario');
    const idLS = localStorage.getItem('usuarioId');
    const isLogged = !!(tokenLS && tokenLS !== 'undefined') || !!nombreLS || !!idLS;
    const rol = localStorage.getItem('userRol');

    console.log('[comoadoptar] session check', { token: tokenLS, nombre: nombreLS, id: idLS, isLogged });
    
    // Elementos
    const botonesInvitado = document.getElementById('botones-invitado');
    const panelUsuario = document.getElementById('panel-usuario');
    const nombreDisplay = document.getElementById('nombre-display');
    const linkPerfil = document.querySelector('.profile-link-wrapper'); 
    const logoContainer = document.querySelector('.logo-container'); 
    
    // Botón Estadísticas
    const btnEstadisticas = document.getElementById('btn-estadisticas');

    if (isLogged) {
        // --- LOGUEADO ---
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
        
        // --- LÓGICA ADMIN ---
        if (rol === 'admin') {
            // Redirecciones
            if(logoContainer) logoContainer.href = '/src/views/index-admin.html';
            if(linkPerfil) linkPerfil.href = '/src/views/index-admin.html';

            // Menu
            const linkMensajes = document.querySelector('a[href="vistachat.html"]');
            if (linkMensajes) linkMensajes.href = '/src/views/chat-admin.html';

            // MOSTRAR BOTÓN ESTADÍSTICAS
            if (btnEstadisticas) {
                btnEstadisticas.style.display = 'flex';
            }

        } else {
            // Usuario Normal
            if(linkPerfil) linkPerfil.href = '/src/views/perfil.html';
        }

    } else {
        // --- INVITADO ---
        if(botonesInvitado) botonesInvitado.style.display = 'flex';
        if(panelUsuario) panelUsuario.style.display = 'none';
    }
});
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
