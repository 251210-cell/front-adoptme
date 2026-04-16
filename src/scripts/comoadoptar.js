document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar Sesión
    const isLogged = localStorage.getItem('usuarioLogueado');
    const rol = localStorage.getItem('rolUsuario'); 
    
    // Elementos
    const botonesInvitado = document.getElementById('botones-invitado');
    const panelUsuario = document.getElementById('panel-usuario');
    const nombreDisplay = document.getElementById('nombre-display');
    const linkPerfil = document.querySelector('.profile-link-wrapper'); 
    const logoContainer = document.querySelector('.logo-container'); 
    
    // Botón Estadísticas
    const btnEstadisticas = document.getElementById('btn-estadisticas');

    if (isLogged === 'true') {
        // --- LOGUEADO ---
        if(botonesInvitado) botonesInvitado.style.display = 'none';
        if(panelUsuario) panelUsuario.style.display = 'flex';
        
        // Recuperar nombre
        const nombreUser = localStorage.getItem('nombreUsuario') || 'Usuario';
        if(nombreDisplay) nombreDisplay.textContent = nombreUser;
        
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
function cerrarSesion() {
    localStorage.removeItem('usuarioLogueado');
    localStorage.removeItem('nombreUsuario');
    localStorage.removeItem('rolUsuario'); 
    window.location.reload();
}

function toggleMenu() {
    const menu = document.getElementById("dropdown-menu");
    menu.classList.toggle("active");
}
// Cerrar si se hace clic fuera
document.addEventListener("click", function(event) {
    const profile = document.querySelector(".user-profile");
    const menu = document.getElementById("dropdown-menu");

    if (!profile.contains(event.target)) {
        menu.classList.remove("active");
    }
});


function cerrarSesion() {
    if(confirm("¿Cerrar sesión?")) {
        localStorage.removeItem('usuarioLogueado');
        localStorage.removeItem('nombreUsuario');
        localStorage.removeItem('rolUsuario');
        window.location.href = '/index.html'; 
    }
}
