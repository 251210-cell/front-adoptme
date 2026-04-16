document.addEventListener('DOMContentLoaded', () => {
    let activeChat = null; 
    const API_BASE = 'http://18.206.62.120:3000/api';
    const listContainer = document.getElementById('listaConversaciones');
    const msgArea = document.getElementById('messagesArea');

    async function cargarSolicitudes() {
        try {
            const res = await fetch(`${API_BASE}/solicitudes`);
            const data = await res.json();
            
            // Sumamos ambos estados como "Pendientes" para el admin
            const pendientes = data.filter(s => s.estado === 'Pendiente' || s.estado === 'En Revisión').length;
            const aprobados = data.filter(s => s.estado === 'Aprobada').length;
            
            document.getElementById('count-pendientes').innerText = pendientes;
            document.getElementById('count-aprobados').innerText = aprobados;

            renderList(data);
        } catch (e) { 
            console.error("Error al cargar lista", e); 
        }
    }

    function renderList(lista) {
        listContainer.innerHTML = "";
        lista.forEach(s => {
            const div = document.createElement('div');
            div.className = `list-item ${activeChat?.id === s.id ? 'selected' : ''}`;
            
            // Estética de los badges
            let badgeClass = 'badge-revision'; 
            if(s.estado === 'Aprobada') badgeClass = 'badge-aprobada';
            if(s.estado === 'Rechazada') badgeClass = 'badge-rechazada';

            div.onclick = () => seleccionarSolicitud(s);
            div.innerHTML = `
                <div class="item-name"><b>${s.usuario?.nombre_completo || 'Usuario'}</b></div>
                <div class="pet-label">Mascota: ${s.mascota?.nombre}</div>
                <span class="mini-badge ${badgeClass}">${s.estado}</span>
            `;
            listContainer.appendChild(div);
        });
    }

    // Aquí irían tus funciones de seleccionarSolicitud y enviarMensaje que ya tienes...
    cargarSolicitudes();
});