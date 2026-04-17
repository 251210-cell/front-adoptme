document.addEventListener('DOMContentLoaded', () => {
    let activeChat = null; 
    const API_BASE = 'http://18.206.62.120:3000/api';
    const listContainer = document.getElementById('listaConversaciones');
    const msgArea = document.getElementById('messagesArea');

    // ID del administrador (Asegúrate de que coincida con tu BD, normalmente es 1)
    const ID_ADMIN_LOGUEADO = 1; 

    // --- CARGA INICIAL ---
    async function cargarSolicitudes() {
        try {
            const res = await fetch(`${API_BASE}/solicitudes`);
            if (!res.ok) throw new Error('Error en el servidor');
            const data = await res.json();
            
            // Actualizar contadores en la parte superior
            if (document.getElementById('count-pendientes')) {
                document.getElementById('count-pendientes').innerText = data.filter(s => s.estado === 'Pendiente' || s.estado === 'En Revisión').length;
            }
            if (document.getElementById('count-aprobados')) {
                document.getElementById('count-aprobados').innerText = data.filter(s => s.estado === 'Aprobada').length;
            }

            renderList(data);
        } catch (e) { 
            console.error("Fallo al cargar solicitudes:", e);
        }
    }

    // --- RENDERIZADO DE LISTA IZQUIERDA ---
    function renderList(lista) {
        listContainer.innerHTML = "";
        lista.forEach(s => {
            const div = document.createElement('div');
            div.className = `list-item ${activeChat?.id === s.id ? 'active' : ''}`;
            
            const visualEstado = (s.estado === 'En Revisión') ? 'Pendiente' : s.estado;
            let badgeClass = s.estado === 'Aprobada' ? 'badge-aprobada' : (s.estado === 'Rechazada' ? 'badge-rechazada' : 'badge-revision');

            div.onclick = () => seleccionarSolicitud(s);
            div.innerHTML = `
                <div class="item-name"><b>${s.usuario?.nombre_usuario || 'Usuario'}</b></div>
                <div class="pet-label">Mascota: ${s.mascota?.nombre || '---'}</div>
                <span class="mini-badge ${badgeClass}">${visualEstado}</span>
            `;
            listContainer.appendChild(div);
        });
    }

    // --- LÓGICA DE NAVEGACIÓN (CAMBIO DE VISTAS) ---
    function seleccionarSolicitud(solicitud) {
        activeChat = solicitud;
        
        // Marcar como activo en la lista
        const items = document.querySelectorAll('.list-item');
        items.forEach(item => item.classList.remove('active'));
        
        // Si está pendiente: Ver Expediente. Si no: Ver Chat.
        if (solicitud.estado === 'Pendiente' || solicitud.estado === 'En Revisión') {
            renderExpediente(solicitud);
        } else {
            renderChatActivo(solicitud);
        }
    }

    // --- VISTA A: EXPEDIENTE (EVALUACIÓN) ---
    function renderExpediente(solicitud) {
        msgArea.innerHTML = `
            <div class="detalle-card animate__animated animate__fadeIn">
                <div class="detalle-header">
                    <div>
                        <h2>Expediente de ${solicitud.usuario?.nombre_usuario}</h2>
                        <p class="sub-fecha">Fecha: ${new Date(solicitud.fecha_solicitud).toLocaleDateString()}</p>
                    </div>
                    <span class="status-pill status-pendiente">${solicitud.estado}</span>
                </div>

                <div class="detalle-body">
                  

<div class="info-grid">
    <div class="info-item"><strong>Edad:</strong> ${solicitud.edad_usuario || '---'} años</div>
    <div class="info-item"><strong>Ocupación:</strong> ${solicitud.ocupacion || '---'}</div>
    <div class="info-item"><strong>Mascotas:</strong> ${solicitud.tiene_mascotas_actuales || '---'}</div>
    <div class="info-item"><strong>Espacio:</strong> ${solicitud.espacio_suficiente || '---'}</div>
</div>

<div class="info-block highlight">
    <h4>Motivo de adopción:</h4>
    <p>"${solicitud.motivo_adopcion || 'Sin motivo'}"</p>
</div>
                    <div class="pet-banner">
                        <i class="fas fa-paw"></i> Interesado en: <strong>${solicitud.mascota?.nombre}</strong>
                    </div>
                    <hr>
                   
                    <div class="acciones-container">
                        <button class="btn-action btn-rechazar" onclick="actualizarEstado(${solicitud.id}, 'Rechazada', ${solicitud.id_mascota}, ${solicitud.id_usuario})">
                            <i class="fas fa-times"></i> Rechazar
                        </button>
                        <button class="btn-action btn-aprobar" onclick="actualizarEstado(${solicitud.id}, 'Aprobada', ${solicitud.id_mascota}, ${solicitud.id_usuario})">
                            <i class="fas fa-check"></i> Aprobar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // --- VISTA B: CHAT MODERNO (SEGUIMIENTO) ---
    async function renderChatActivo(solicitud) {
        const avatarUrl = 'https://www.w3schools.com/howto/img_avatar.png';
        const estadoClass = solicitud.estado === 'Aprobada' ? 'status-aprobada' : 'status-rechazada';

        msgArea.innerHTML = `
            <div class="modern-chat-container animate__animated animate__fadeIn">
                <div class="modern-chat-header">
                    <div class="user-info-messages">
                        <img src="${avatarUrl}" class="header-avatar">
                        <div class="header-text-details">
                            <h3>${solicitud.usuario?.nombre_usuario}</h3>
                            <p class="header-subtext">${solicitud.usuario?.email || 'Adoptante'}</p>
                            <p class="header-pet-reference">Sobre: <span class="pet-name-highlight">${solicitud.mascota?.nombre}</span></p>
                        </div>
                    </div>
                    <span class="modern-status-badge ${estadoClass}">${solicitud.estado}</span>
                </div>

                <div id="modernChatBox" class="modern-chat-messages-area">
                    <p class="chat-loading">Cargando conversación...</p>
                </div>
<div class="modern-chat-input-bar">
    <div class="input-wrapper-modern">
        <input type="text" id="modernAdminInput" placeholder="Escribe tu respuesta...">
        <button class="modern-send-btn">
            <i class="fas fa-paper-plane"></i>
        </button>
    </div>
</div>
        `;

        // Evento Enter para el input
        document.getElementById('modernAdminInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') enviarMsgModerno(solicitud.id_usuario, solicitud.id_mascota);
        });

        cargarMensajesModernos(solicitud.id_usuario);
    }

    // --- FUNCIONES DE BASE DE DATOS ---

    window.cargarMensajesModernos = async (usuarioId) => {
        try {
            const res = await fetch(`${API_BASE}/mensajes/${usuarioId}`);
            const mensajes = await res.json();
            const box = document.getElementById('modernChatBox');
            if (!box) return;

            box.innerHTML = mensajes.map(m => {
                const esAdmin = m.id_remitente === ID_ADMIN_LOGUEADO;
                const claseMsg = esAdmin ? 'message-sent' : 'message-received';
                const hora = new Date(m.fecha_envio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return `
                    <div class="modern-message-row ${claseMsg}">
                        <div class="modern-bubble">
                            ${m.contenido}
                            <span class="message-time">${hora}</span>
                        </div>
                    </div>
                `;
            }).join('');
            box.scrollTop = box.scrollHeight;
        } catch (e) { console.error("Error al cargar mensajes"); }
    };

    window.enviarMsgModerno = async (idDestino, idMascota) => {
        const input = document.getElementById('modernAdminInput');
        const contenido = input.value.trim();
        if (!contenido) return;

        try {
            const res = await fetch(`${API_BASE}/mensajes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_remitente: ID_ADMIN_LOGUEADO,
                    id_destinatario: idDestino,
                    id_mascota: idMascota,
                    contenido: contenido
                })
            });
            if (res.ok) {
                input.value = "";
                cargarMensajesModernos(idDestino);
            }
        } catch (e) { console.error("Error al enviar"); }
    };

    window.actualizarEstado = async (id, nuevoEstado, idMascota, idUsuario) => {
        const mensajeInput = document.getElementById('mensajeResolucion')?.value;
        const result = await Swal.fire({
            title: `¿Confirmar ${nuevoEstado}?`,
            text: `Se cambiará el estado y se abrirá el chat de seguimiento.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, confirmar'
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`${API_BASE}/solicitudes/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        estado: nuevoEstado, 
                        id_mascota: idMascota,
                        id_usuario: idUsuario,
                        mensaje_admin: mensajeInput,
                        id_admin_actual: ID_ADMIN_LOGUEADO
                    })
                });

                if (res.ok) {
                    await Swal.fire('Éxito', `Solicitud ${nuevoEstado}`, 'success');
                    await cargarSolicitudes();
                    // Forzar el cambio a la vista de chat
                    activeChat.estado = nuevoEstado;
                    renderChatActivo(activeChat);
                }
            } catch (error) { console.error("Error al actualizar estado"); }
        }
    };

    // Polling cada 3 seg
    setInterval(() => {
        if (activeChat && activeChat.estado !== 'Pendiente') {
            cargarMensajesModernos(activeChat.id_usuario);
        }
    }, 3000);

    cargarSolicitudes();
});