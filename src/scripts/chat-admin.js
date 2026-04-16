document.addEventListener('DOMContentLoaded', () => {
    let activeChat = null; // Guardará el objeto de la solicitud seleccionada

    const listContainer = document.getElementById('listaConversaciones');
    const msgArea = document.getElementById('messagesArea');
    const chatHeader = document.getElementById('chatHeaderContainer');
    const inputArea = document.getElementById('inputAreaContainer');

    // 1. Cargar solicitudes reales
    async function cargarSolicitudes() {
        try {
            const res = await fetch('http://18.206.62.120:3000/api/solicitudes');
            const data = await res.json();
            renderList(data);
        } catch (e) { console.error("Error cargando solicitudes"); }
    }

    function renderList(lista) {
        listContainer.innerHTML = "";
        lista.forEach(s => {
            const div = document.createElement('div');
            div.className = `list-item ${activeChat?.id === s.id ? 'selected' : ''}`;
            div.onclick = () => seleccionarSolicitud(s);
            div.innerHTML = `
                <div class="item-content">
                    <span class="item-name">${s.nombre_usuario}</span>
                    <span class="pet-label">Mascota: ${s.nombre_mascota}</span>
                    <span class="mini-badge">${s.estado}</span>
                </div>
            `;
            listContainer.appendChild(div);
        });
    }

    function seleccionarSolicitud(solicitud) {
        activeChat = solicitud;
        chatHeader.style.display = 'flex';
        inputArea.style.display = 'block';
        document.getElementById('header-name').innerText = solicitud.nombre_usuario;
        document.getElementById('header-pet').innerText = solicitud.nombre_mascota;
        renderList([]); // Refrescar selección visual
        cargarMensajes(solicitud.usuario_id);
    }

    // 2. Función para APROBAR o RECHAZAR
    window.actualizarEstadoSolicitud = async (nuevoEstado) => {
        if (!activeChat) return;

        const animalEstado = nuevoEstado === 'Aprobada' ? 'Adoptado' : 'Disponible';

        const result = await Swal.fire({
            title: `¿Confirmas marcar como ${nuevoEstado}?`,
            text: `La mascota pasará a estar "${animalEstado}"`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#FF6600',
            confirmButtonText: 'Sí, confirmar'
        });

        if (result.isConfirmed) {
            try {
                // LLAMADA A LA API: Actualiza Solicitud Y Mascota al mismo tiempo
                await fetch(`http://18.206.62.120:3000/api/solicitudes/${activeChat.id}`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ 
                        estado_solicitud: nuevoEstado,
                        estado_mascota: animalEstado,
                        mascota_id: activeChat.mascota_id
                    })
                });

                Swal.fire('¡Hecho!', `Estado actualizado a ${nuevoEstado}`, 'success');
                cargarSolicitudes(); // Recargar lista
                cerrarChatActual();
            } catch (e) {
                Swal.fire('Error', 'No se pudo actualizar', 'error');
            }
        }
    };

    window.cerrarChatActual = () => {
        activeChat = null;
        chatHeader.style.display = 'none';
        inputArea.style.display = 'none';
        msgArea.innerHTML = '<div class="empty-state"><h3>Selecciona una solicitud</h3></div>';
    };

    cargarSolicitudes();
});