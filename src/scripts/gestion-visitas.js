document.addEventListener('DOMContentLoaded', () => {
    
    // Simulación de Base de Datos
    let visitas = [
        {
            id: 1,
            usuario: "Juanita Pérez",
            email: "juanita@example.com",
            avatar: "https://ui-avatars.com/api/?name=Juanita+Perez&background=FFE0B2&color=E65100",
            perro: "Max",
            fotoPerro: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=100&q=80",
            fecha: "07/02/2026",
            hora: "10:00 AM",
            lugar: "Refugio Patitas Felices",
            notas: "Traigo a mi familia, tenemos dos niños pequeños.",
            estado: "pendiente",
            respuesta: ""
        },
        {
            id: 2,
            usuario: "Carlos Rodríguez",
            email: "carlos@example.com",
            avatar: "https://ui-avatars.com/api/?name=Carlos+R&background=E1F5FE&color=0277BD",
            perro: "Bella",
            fotoPerro: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=100&q=80",
            fecha: "09/02/2026",
            hora: "03:00 PM",
            lugar: "Refugio Amigos Caninos",
            notas: "Primera visita a un refugio.",
            estado: "aprobada",
            respuesta: "Confirmada. Te esperamos en la recepción."
        },
        {
            id: 3,
            usuario: "María González",
            email: "maria@example.com",
            avatar: "https://ui-avatars.com/api/?name=Maria+G&background=FCE4EC&color=C2185B",
            perro: "Luna",
            fotoPerro: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=100&q=80",
            fecha: "04/02/2026",
            hora: "11:00 AM",
            lugar: "Refugio Patitas Felices",
            notas: "",
            estado: "rechazada",
            respuesta: "Lo sentimos, ese horario ya está ocupado. ¿Podrías el 06/02?"
        },
        {
            id: 4,
            usuario: "Pedro Martínez",
            email: "pedro@example.com",
            avatar: "https://ui-avatars.com/api/?name=Pedro+M&background=E8F5E9&color=2E7D32",
            perro: "Rocky",
            fotoPerro: "https://images.unsplash.com/photo-1563889958749-6bb6c1284eb3?auto=format&fit=crop&w=100&q=80",
            fecha: "11/02/2026",
            hora: "02:00 PM",
            lugar: "Refugio Amigos Caninos",
            notas: "Tengo experiencia con perros grandes.",
            estado: "pendiente",
            respuesta: ""
        },
        {
            id: 5,
            usuario: "Juanita Pérez",
            email: "juanita@example.com",
            avatar: "https://ui-avatars.com/api/?name=Juanita+Perez&background=FFE0B2&color=E65100",
            perro: "Coco",
            fotoPerro: "https://images.unsplash.com/photo-1612536050381-7110fd254803?auto=format&fit=crop&w=100&q=80",
            fecha: "14/02/2026",
            hora: "09:00 AM",
            lugar: "Refugio Hogar Perruno",
            notas: "Soy la misma persona que agendó para Max.",
            estado: "pendiente",
            respuesta: ""
        }
    ];

    window.filtrar = (filtro) => {
        // Actualizar botones visualmente
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if(btn.innerText.toLowerCase().includes(filtro === 'all' ? 'todas' : filtro)) {
                btn.classList.add('active');
            }
        });
        renderizar(filtro);
    };

    function renderizar(filtro) {
        const container = document.getElementById('visitsContainer');
        container.innerHTML = "";

        const filtradas = visitas.filter(v => filtro === 'all' || v.estado === filtro);

        if(filtradas.length === 0) {
            container.innerHTML = "<p style='text-align:center; color:#999; margin-top:20px;'>No hay solicitudes en esta categoría.</p>";
            return;
        }

        filtradas.forEach(visit => {
            // Determinar clases y textos según estado
            let badgeClass = '', badgeText = '';
            let actionHTML = '';

            if (visit.estado === 'pendiente') {
                badgeClass = 'st-pendiente'; badgeText = 'Pendiente';
                actionHTML = `
                    <div class="vc-actions">
                        <button class="btn-action btn-approve" onclick="cambiarEstado(${visit.id}, 'aprobada')">
                            <i class="fas fa-check"></i> Aprobar
                        </button>
                        <button class="btn-action btn-reject" onclick="cambiarEstado(${visit.id}, 'rechazada')">
                            <i class="fas fa-times"></i> Rechazar
                        </button>
                    </div>`;
            } else if (visit.estado === 'aprobada') {
                badgeClass = 'st-aprobada'; badgeText = 'Aprobada';
                actionHTML = `
                    <div class="response-box rb-green">
                        <i class="fas fa-comment-check"></i> <strong>Tu respuesta:</strong> ${visit.respuesta || 'Confirmada. Te esperamos.'}
                    </div>`;
            } else {
                badgeClass = 'st-rechazada'; badgeText = 'Rechazada';
                actionHTML = `
                    <div class="response-box rb-red">
                        <i class="fas fa-comment-times"></i> <strong>Tu respuesta:</strong> ${visit.respuesta || 'Lo sentimos, no es posible en este horario.'}
                    </div>`;
            }

            const html = `
                <div class="visit-card">
                    <div class="vc-header">
                        <div class="user-info">
                            <img src="${visit.avatar}" class="user-avatar">
                            <div class="user-text">
                                <h3>${visit.usuario}</h3>
                                <p>${visit.email}</p>
                                <p class="visit-target">Quiere visitar a: <strong>${visit.perro}</strong></p>
                            </div>
                            <img src="${visit.fotoPerro}" style="width:40px; height:40px; border-radius:6px; object-fit:cover; margin-left:10px;">
                        </div>
                        <span class="status-badge ${badgeClass}">${badgeText}</span>
                    </div>

                    <div class="vc-details">
                        <div class="vc-item"><i class="far fa-calendar-alt"></i> ${visit.fecha}</div>
                        <div class="vc-item"><i class="far fa-clock"></i> ${visit.hora}</div>
                        <div class="vc-item"><i class="fas fa-map-marker-alt"></i> ${visit.lugar}</div>
                    </div>

                    <div class="vc-notes">
                        <strong>Notas del usuario:</strong> ${visit.notas || "Sin notas adicionales."}
                    </div>

                    ${actionHTML}
                </div>
            `;
            container.innerHTML += html;
        });
    }

    // Función Global para los botones
    window.cambiarEstado = (id, nuevoEstado) => {
        const visit = visitas.find(v => v.id === id);
        if (visit) {
            visit.estado = nuevoEstado;
            // Simular mensaje de respuesta automática
            if (nuevoEstado === 'aprobada') visit.respuesta = "Confirmada. Te esperamos en la recepción.";
            if (nuevoEstado === 'rechazada') visit.respuesta = "Lo sentimos, el horario ya no está disponible.";
            
            // Re-renderizar para ver el cambio inmediato
            // Buscamos qué filtro está activo para mantener la vista
            const filtroActivoBtn = document.querySelector('.filter-btn.active');
            let filtroActual = 'all';
            if(filtroActivoBtn.innerText.includes('Pendientes')) filtroActual = 'pendiente';
            
            renderizar(filtroActual);
        }
    };

    // Inicializar
    renderizar('all');
});
