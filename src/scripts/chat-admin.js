document.addEventListener('DOMContentLoaded', () => {
    let activeChat = null; 
    const API_BASE = 'http://18.206.62.120:3000/api';
    const listContainer = document.getElementById('listaConversaciones');
    const msgArea = document.getElementById('messagesArea');

    async function cargarSolicitudes() {
        try {
            const res = await fetch(`${API_BASE}/solicitudes`);
            if (!res.ok) throw new Error('Error en el servidor');
            const data = await res.json();
            
            document.getElementById('count-pendientes').innerText = data.filter(s => s.estado === 'Pendiente' || s.estado === 'En Revisión').length;
            document.getElementById('count-aprobados').innerText = data.filter(s => s.estado === 'Aprobada').length;

            renderList(data);
        } catch (e) { 
            console.error("Fallo al cargar:", e);
            listContainer.innerHTML = '<p style="color:red; padding:10px;">Error al conectar.</p>';
        }
    }

    function renderList(lista) {
        listContainer.innerHTML = "";
        lista.forEach(s => {
            const div = document.createElement('div');
            // Clase active para resaltar el seleccionado
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

    function seleccionarSolicitud(solicitud) {
        activeChat = solicitud;
        renderList([]); // Esto es solo para refrescar visualmente la clase 'active' rápidamente
        cargarSolicitudes(); 

        msgArea.innerHTML = `
            <div class="detalle-card">
                <div class="detalle-header">
                    <h2>Solicitud de ${solicitud.usuario?.nombre_usuario || 'Usuario'}</h2>
                    <span class="status-pill">${solicitud.estado}</span>
                </div>
                <div class="detalle-body">
                    <p><strong>Mascota:</strong> ${solicitud.mascota?.nombre || '---'}</p>
                    <p><strong>Email:</strong> ${solicitud.usuario?.email || 'No disponible'}</p>
                    <div class="acciones-container">
                        <button class="btn-action btn-aprobar" onclick="actualizarEstado(${solicitud.id}, 'Aprobada', ${solicitud.id_mascota})">
                            <i class="fas fa-check"></i> Aprobar Adopción
                        </button>
                        <button class="btn-action btn-rechazar" onclick="actualizarEstado(${solicitud.id}, 'Rechazada', ${solicitud.id_mascota})">
                            <i class="fas fa-times"></i> Rechazar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // FUNCIÓN CON ALERTA BONITA (SweetAlert2)
    window.actualizarEstado = async (id, nuevoEstado, idMascota) => {
        const result = await Swal.fire({
            title: `¿Confirmar ${nuevoEstado}?`,
            text: `La mascota pasará a estado ${nuevoEstado === 'Aprobada' ? 'Adoptado' : 'Disponible'}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: nuevoEstado === 'Aprobada' ? '#28a745' : '#d33',
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`${API_BASE}/solicitudes/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ estado: nuevoEstado, id_mascota: idMascota })
                });

                if (res.ok) {
                    Swal.fire('¡Actualizado!', `La solicitud ha sido ${nuevoEstado}.`, 'success');
                    cargarSolicitudes();
                    msgArea.innerHTML = '<div class="empty-state">Selecciona una solicitud para gestionar.</div>';
                }
            } catch (error) {
                Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
            }
        }
    };

    cargarSolicitudes();
});