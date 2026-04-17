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

        if (!lista.length) {
            listContainer.innerHTML = `
                <div class="list-empty">
                    <i class="far fa-folder-open"></i>
                    <p>No hay solicitudes aún</p>
                </div>
            `;
            return;
        }

        lista.forEach(s => {
            const div = document.createElement('div');
            div.className = `list-item ${activeChat?.id === s.id ? 'active' : ''}`;

            const nombre = s.usuario?.nombre_usuario || 'Usuario';
            const iniciales = nombre.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
            const visualEstado = (s.estado === 'En Revisión') ? 'Pendiente' : s.estado;
            const badgeClass = s.estado === 'Aprobada' ? 'badge-aprobada' : (s.estado === 'Rechazada' ? 'badge-rechazada' : 'badge-pendiente');
            const fecha = s.fecha_solicitud
                ? new Date(s.fecha_solicitud).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
                : '';

            div.onclick = () => seleccionarSolicitud(s);
            div.innerHTML = `
                <div class="list-avatar">${iniciales}</div>
                <div class="list-main">
                    <div class="list-top-row">
                        <span class="item-name">${nombre}</span>
                        ${fecha ? `<span class="list-date">${fecha}</span>` : ''}
                    </div>
                    <div class="pet-label"><i class="fas fa-paw"></i> <span>${s.mascota?.nombre || '---'}</span></div>
                    <span class="mini-badge ${badgeClass}">${visualEstado}</span>
                </div>
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

    // --- VISTA A: SOLICITUD (EVALUACIÓN) ---
    async function renderExpediente(solicitud) {
        // Traemos la info completa del usuario para enriquecer la vista
        let usuarioCompleto = solicitud.usuario || {};
        try {
            if (solicitud.id_usuario) {
                const uRes = await fetch(`${API_BASE}/usuarios/${solicitud.id_usuario}`);
                if (uRes.ok) {
                    const u = await uRes.json();
                    usuarioCompleto = { ...usuarioCompleto, ...u };
                }
            }
        } catch (e) { /* noop */ }

        const nombreUsuario = usuarioCompleto.nombre_usuario || usuarioCompleto.nombre || 'Usuario';
        const emailUsuario = usuarioCompleto.email || '---';
        const telefonoUsuario = usuarioCompleto.telefono || '---';
        const ciudadUsuario = usuarioCompleto.ciudad || usuarioCompleto.direccion || '---';
        const viviendaUsuario = usuarioCompleto.tipo_vivienda || '---';
        const experienciaUsuario = usuarioCompleto.experiencia_mascotas || '---';

        // DEBUG: imprimir lo que devuelve la API para detectar diferencias de nombre de campo
        console.log('[chat-admin] solicitud recibida de la API:', solicitud);
        console.log('[chat-admin] usuario enriquecido:', usuarioCompleto);

        // Datos específicos de la solicitud (EXACTAMENTE lo que el usuario envió).
        // Leemos MÚLTIPLES variantes de nombre de campo por si el backend guarda
        // con otra convención distinta a la que envía el front.
        const norm = (v) => {
            if (v === null || v === undefined) return '---';
            const s = String(v).trim();
            if (s === '' || s.toLowerCase() === 'n/a' || s.toLowerCase() === 'undefined' || s.toLowerCase() === 'nan') return '---';
            return s;
        };
        const pick = (...vals) => {
            for (const v of vals) {
                const n = norm(v);
                if (n !== '---') return n;
            }
            return '---';
        };

        const edad = pick(solicitud.edad_usuario, solicitud.edad, solicitud.edad_adoptante);
        const ocupacion = pick(solicitud.ocupacion, solicitud.profesion, solicitud.trabajo);
        const tieneMascotas = pick(solicitud.tiene_mascotas_actuales, solicitud.tiene_mascotas, solicitud.mascotas_actuales, solicitud.otras_mascotas);
        const espacio = pick(solicitud.espacio_suficiente, solicitud.espacio, solicitud.espacio_hogar);
        const permisoCasero = pick(solicitud.permiso_casero, solicitud.permiso_arrendador, solicitud.permiso_renta);
        const motivo = pick(solicitud.motivo_adopcion, solicitud.motivo, solicitud.razon_adopcion, solicitud.razon);

        const avatarUrl = usuarioCompleto.foto_perfil
            || `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreUsuario)}&background=FF6600&color=fff&rounded=true&size=128`;

        msgArea.innerHTML = `
            <div class="detalle-card animate__animated animate__fadeIn">
                <div class="detalle-header">
                    <div class="solicitud-user-info">
                        <img src="${avatarUrl}" class="solicitud-avatar" alt="avatar">
                        <div>
                            <h2>Solicitud de ${nombreUsuario}</h2>
                            <p class="sub-fecha"><i class="far fa-calendar-alt"></i> ${new Date(solicitud.fecha_solicitud).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <span class="status-pill status-${String(solicitud.estado).toLowerCase().replace(/\s/g, '-')}">${solicitud.estado}</span>
                </div>

                <div class="detalle-body">
                    <h4 class="section-heading">Datos del solicitante</h4>
                    <div class="info-grid">
                        <div class="info-item"><span class="info-label">Correo</span><span class="info-value">${emailUsuario}</span></div>
                        <div class="info-item"><span class="info-label">Teléfono</span><span class="info-value">${telefonoUsuario}</span></div>
                        <div class="info-item"><span class="info-label">Ciudad</span><span class="info-value">${ciudadUsuario}</span></div>
                        <div class="info-item"><span class="info-label">Tipo de vivienda</span><span class="info-value">${viviendaUsuario}</span></div>
                    </div>

                    <h4 class="section-heading">Información de la solicitud</h4>
                    <div class="info-grid">
                        <div class="info-item"><span class="info-label">Edad</span><span class="info-value">${edad} ${edad !== '---' ? 'años' : ''}</span></div>
                        <div class="info-item"><span class="info-label">Ocupación</span><span class="info-value">${ocupacion}</span></div>
                        <div class="info-item"><span class="info-label">¿Otras mascotas?</span><span class="info-value">${tieneMascotas}</span></div>
                        <div class="info-item"><span class="info-label">Espacio suficiente</span><span class="info-value">${espacio}</span></div>
                        <div class="info-item"><span class="info-label">Permiso del casero</span><span class="info-value">${permisoCasero}</span></div>
                        <div class="info-item"><span class="info-label">Experiencia con mascotas</span><span class="info-value">${experienciaUsuario}</span></div>
                    </div>

                    <div class="info-block highlight">
                        <h4><i class="fas fa-heart"></i> Motivo de adopción</h4>
                        <p>${motivo === '---' ? 'Sin motivo especificado' : `"${motivo}"`}</p>
                    </div>

                    <div class="pet-banner">
                        <i class="fas fa-paw"></i> Interesado en: <strong>${solicitud.mascota?.nombre || '---'}</strong>
                    </div>

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

    // Envía un mensaje automático del admin al usuario anunciando el cambio de estado
    async function enviarMensajeAutomatico(idUsuario, idMascota, estado, nombreMascota) {
        const plantillas = {
            'Aprobada': `¡Felicidades! 🎉 Tu solicitud de adopción para ${nombreMascota || 'esta mascota'} ha sido APROBADA. Pronto te contactaremos para coordinar los siguientes pasos. ¿Tienes alguna pregunta?`,
            'Rechazada': `Hola, hemos revisado tu solicitud para ${nombreMascota || 'esta mascota'} y lamentablemente no podemos aprobarla en este momento. Si deseas conocer los motivos o postularte por otra mascota, estoy aquí para conversar.`
        };
        const contenido = plantillas[estado];
        if (!contenido) return;

        try {
            await fetch(`${API_BASE}/mensajes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_remitente: ID_ADMIN_LOGUEADO,
                    id_destinatario: idUsuario,
                    id_mascota: idMascota,
                    contenido
                })
            });
        } catch (e) { console.warn('No se pudo enviar el mensaje automático:', e); }
    }

    window.actualizarEstado = async (id, nuevoEstado, idMascota, idUsuario) => {
        const result = await Swal.fire({
            title: `¿Confirmar ${nuevoEstado}?`,
            text: `Se cambiará el estado, se enviará un mensaje al usuario y se abrirá el chat de seguimiento.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#FF6600',
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        try {
            // 1. Actualizar el estado de la solicitud
            const res = await fetch(`${API_BASE}/solicitudes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    estado: nuevoEstado,
                    id_mascota: idMascota,
                    id_usuario: idUsuario,
                    id_admin_actual: ID_ADMIN_LOGUEADO
                })
            });

            if (!res.ok) {
                const errText = await res.text();
                console.error('Error PUT solicitud:', res.status, errText);
                return Swal.fire('Error', 'No se pudo actualizar el estado.', 'error');
            }

            // 2. Enviar mensaje automático del admin al usuario
            const nombreMascota = activeChat?.mascota?.nombre || '';
            await enviarMensajeAutomatico(idUsuario, idMascota, nuevoEstado, nombreMascota);

            await Swal.fire({
                title: '¡Listo!',
                text: `Solicitud ${nuevoEstado} y mensaje enviado al usuario.`,
                icon: 'success',
                confirmButtonColor: '#FF6600',
                timer: 2000,
                showConfirmButton: false
            });

            // 3. Refrescar lista y cambiar a la vista de chat para continuar conversación
            await cargarSolicitudes();
            activeChat.estado = nuevoEstado;
            renderChatActivo(activeChat);
        } catch (error) {
            console.error("Error al actualizar estado:", error);
            Swal.fire('Error', 'No se pudo completar la operación.', 'error');
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