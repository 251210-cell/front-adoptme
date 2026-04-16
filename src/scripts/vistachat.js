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

    // 2. Enviar Mensaje a la BD
    async function enviarMensaje() {
        const text = input.value.trim();
        // Usamos los nombres de variables que guardaste en el login/solicitud
        const userId = localStorage.getItem('usuarioId'); 
        const mascotaId = localStorage.getItem('mascotaSeleccionadaId');
        
        // El destinatario del usuario siempre es el Admin (ID 1 por defecto usualmente)
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
            }
        } catch (err) {
            console.error("Error al enviar:", err);
        }
    }

    function renderMsg(text, type) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type}`; // 'sent' o 'received'
        msgDiv.innerHTML = `<div class="bubble">${text}</div>`;
        msgArea.appendChild(msgDiv);
        msgArea.scrollTop = msgArea.scrollHeight;
    }

    // 3. Cargar mensajes (Polling cada 3 segundos)
    async function cargarMensajes() {
        const userId = localStorage.getItem('usuarioId');
        if (!userId) return;

        try {
            // Buscamos los mensajes donde el usuario sea remitente O destinatario
            const res = await fetch(`http://18.206.62.120:3000/api/mensajes/${userId}`);
            const mensajes = await res.json();
            
            msgArea.innerHTML = '<p class="chat-intro">Historial de conversación</p>';
            
            mensajes.forEach(m => {
                // Si el remitente es el usuario, es 'sent' (derecha)
                // Si el remitente NO es el usuario, es 'received' (izquierda)
                const tipo = (m.id_remitente == userId) ? 'sent' : 'received';
                renderMsg(m.contenido, tipo);
            });
        } catch (err) {
            console.error("Error cargando mensajes:", err);
        }
    }

    if (btnSend) btnSend.addEventListener('click', enviarMensaje);
    input?.addEventListener('keypress', (e) => { if (e.key === 'Enter') enviarMensaje(); });

    // Actualización automática cada 3 segundos
    setInterval(cargarMensajes, 3000);
    cargarMensajes();
});