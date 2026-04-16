document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Verificar Sesión y Rol
    const isLogged = localStorage.getItem('usuarioLogueado');
    const rol = localStorage.getItem('rolUsuario');

    if (isLogged !== 'true') {
        alert("Debes iniciar sesión para ver tus visitas.");
        window.location.href = '/src/views/login.html';
        return;
    }

    // 2. Configurar Header (Igual que en nosotros.js)
    const botonesInvitado = document.getElementById('botones-invitado');
    const panelUsuario = document.getElementById('panel-usuario');
    const nombreDisplay = document.getElementById('nombre-display');
    const linkPerfil = document.querySelector('.profile-link-wrapper'); 
    const logoContainer = document.querySelector('.logo-container'); 
    const btnEstadisticas = document.getElementById('btn-estadisticas');

    if (isLogged === 'true') {
        if(botonesInvitado) botonesInvitado.style.display = 'none';
        if(panelUsuario) panelUsuario.style.display = 'flex';
        
        const nombreUser = localStorage.getItem('nombreUsuario') || 'Usuario';
        if(nombreDisplay) nombreDisplay.textContent = nombreUser;

        // --- LÓGICA DE ADMIN ---
        if (rol === 'admin') {
            // Redirecciones
            if(logoContainer) logoContainer.href = '/src/views/index-admin.html';
            if(linkPerfil) linkPerfil.href = '/src/views/index-admin.html';

            // Cambiar enlaces del menú
            const linkMensajes = document.querySelector('a[href="vistachat.html"]');
            if (linkMensajes) linkMensajes.href = '/src/views/chat-admin.html';

            // Si está en admin, el botón "Mis Visitas" debería llevar a Gestión
            // Aunque esta página es SOLO para ver visitas propias, ajustamos el enlace por consistencia
            const linkVisitas = document.querySelector('a[href="mis-visitas.html"]');
            if (linkVisitas) {
                linkVisitas.href = '/src/views/gestion-visitas.html';
                linkVisitas.innerHTML = '<i class="far fa-calendar-check"></i> Visitas'; 
            }

            // Mostrar botón estadísticas
            if (btnEstadisticas) btnEstadisticas.style.display = 'flex';

        } else {
            // Usuario Normal
            if(linkPerfil) linkPerfil.href = '/src/views/perfil.html';
        }
    }

    // 3. Renderizar Lista
    renderVisits('all');
});

// Datos Simulados
const visitasData = [
    {
        id: 1,
        perro: "Max",
        img: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=100&q=80",
        refugio: "Refugio Patitas Felices",
        fecha: "sábado, 7 de febrero de 2026",
        hora: "10:00 AM",
        notas: "Traigo a mi familia",
        status: "approved",
        respuesta: "Confirmada. Te esperamos en el área de visitas."
    },
    {
        id: 2,
        perro: "Bella",
        img: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=100&q=80",
        refugio: "Refugio Amigos Caninos",
        fecha: "lunes, 9 de febrero de 2026",
        hora: "03:00 PM",
        notas: "",
        status: "pending",
        respuesta: ""
    },
    {
        id: 3,
        perro: "Luna",
        img: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=100&q=80",
        refugio: "Refugio Patitas Felices",
        fecha: "miércoles, 4 de febrero de 2026",
        hora: "11:00 AM",
        notas: "Primera vez visitando un refugio",
        status: "rejected",
        respuesta: "Lo sentimos, ese horario no está disponible. ¿Podrías venir el 06/02 a las 11:00 AM?"
    }
];

function filtrarVisitas(filtro) {
    document.querySelectorAll('.v-tab').forEach(t => t.classList.remove('active'));
    const btn = Array.from(document.querySelectorAll('.v-tab')).find(b => 
        (filtro === 'all' && b.innerText.includes('Todas')) ||
        (filtro === 'pending' && b.innerText.includes('Pendientes')) ||
        (filtro === 'approved' && b.innerText.includes('Aprobadas')) ||
        (filtro === 'rejected' && b.innerText.includes('Rechazadas'))
    );
    if(btn) btn.classList.add('active');

    renderVisits(filtro);
}

function renderVisits(filter) {
    const list = document.getElementById('visitsList');
    list.innerHTML = "";

    const filtradas = visitasData.filter(v => filter === 'all' || v.status === filter);

    if(filtradas.length === 0) {
        list.innerHTML = "<div style='text-align:center; padding:40px; color:#888;'>No tienes visitas en esta categoría.</div>";
        return;
    }

    filtradas.forEach(v => {
        let badge = '', actions = '', response = '';

        if(v.status === 'approved') {
            badge = `<span class="status-badge status-approved"><i class="fas fa-check-circle"></i> Aprobada</span>`;
            response = `<div class="response-box resp-success"><i class="far fa-comment-dots"></i> <div><strong>Respuesta:</strong> ${v.respuesta}</div></div>`;
            actions = `<button class="btn-action btn-green">Ver Detalles</button>`;
        } else if(v.status === 'pending') {
            badge = `<span class="status-badge status-pending"><i class="far fa-clock"></i> Pendiente</span>`;
            actions = `<button class="btn-action btn-red-outline">Cancelar Solicitud</button>`;
        } else if(v.status === 'rejected') {
            badge = `<span class="status-badge status-rejected"><i class="fas fa-times-circle"></i> Rechazada</span>`;
            response = `<div class="response-box resp-error"><i class="far fa-comment-dots"></i> <div><strong>Respuesta:</strong> ${v.respuesta}</div></div>`;
            actions = `<button class="btn-action btn-orange">Reagendar Cita</button>`;
        }

        const notas = v.notas ? `<div class="vc-notes"><strong>Tus notas:</strong> ${v.notas}</div>` : '';

        const card = `
            <div class="visit-card">
                <div class="vc-header">
                    <div class="dog-info">
                        <img src="${v.img}" class="dog-thumb">
                        <div class="dog-text">
                            <h3>${v.perro}</h3>
                            <p><i class="fas fa-map-marker-alt"></i> ${v.refugio}</p>
                        </div>
                    </div>
                    ${badge}
                </div>
                <div class="vc-details">
                    <span><i class="far fa-calendar-alt"></i> ${v.fecha}</span>
                    <span><i class="far fa-clock"></i> ${v.hora}</span>
                </div>
                ${notas}
                ${response}
                <div class="vc-actions">${actions}</div>
            </div>
        `;
        list.innerHTML += card;
    });
}

function cerrarSesion() {
    if(confirm("¿Cerrar sesión?")) {
        localStorage.removeItem('usuarioLogueado');
        localStorage.removeItem('nombreUsuario');
        localStorage.removeItem('rolUsuario');
        window.location.href = '/index.html';
    }
}
