document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('chatInput');
    const btnSend = document.getElementById('chatSendBtn');
    const msgArea = document.getElementById('messages-area');
    const btnClose = document.getElementById('btnCloseWidget');

    // 1. Cerrar Widget
    if (btnClose) {
        btnClose.addEventListener('click', () => {
            const widget = window.parent.document.getElementById('chat-widget-container');
            if (widget) widget.style.display = 'none';
        });
    }

    // 2. Enviar Mensaje
    async function enviarMensaje() {
        const text = input.value.trim();
        const userId = localStorage.getItem('usuarioId');
        const mascotaId = localStorage.getItem('mascotaSeleccionadaId');
        const adminId = 1;

        if (text === "" || !userId) return;

        try {
            const res = await fetch('http://18.206.62.120:3000/api/mensajes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_remitente: userId,
                    id_destinatario: adminId,
                    id_mascota: mascotaId,
                    contenido: text
                })
            });

            if (res.ok) {
                renderMsg(text, 'sent');
                input.value = "";
            } else if (res.status === 429) {
                console.warn("Rate limit al enviar. Espera unos segundos.");
            }
        } catch (err) {
            console.error("Error al enviar:", err);
        }
    }

    function renderMsg(text, type) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type}`;
        msgDiv.innerHTML = `<div class="bubble">${text}</div>`;
        msgArea.appendChild(msgDiv);
        msgArea.scrollTop = msgArea.scrollHeight;
    }

    // 3. Cargar mensajes (una sola vez, sin polling)
    async function cargarMensajes() {
        const userId = localStorage.getItem('usuarioId');
        if (!userId) return;

        try {
            const res = await fetch(`http://18.206.62.120:3000/api/mensajes/${userId}`);

            if (!res.ok) {
                console.warn("Respuesta no OK:", res.status);
                return;
            }

            const contentType = res.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                const textoError = await res.text();
                console.warn("Respuesta no-JSON:", textoError.slice(0, 100));
                return;
            }

            const mensajes = await res.json();

            msgArea.innerHTML = '<p class="chat-intro">Historial de conversación</p>';
            mensajes.forEach(m => {
                const tipo = (m.id_remitente == userId) ? 'sent' : 'received';
                renderMsg(m.contenido, tipo);
            });
        } catch (err) {
            console.error("Error cargando mensajes:", err);
        }
    }

    if (btnSend) btnSend.addEventListener('click', enviarMensaje);
    input?.addEventListener('keypress', (e) => { if (e.key === 'Enter') enviarMensaje(); });

    // Carga inicial de mensajes
    cargarMensajes();
});
