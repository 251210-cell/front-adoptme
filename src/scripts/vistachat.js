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
        const userId = localStorage.getItem('userId'); // Asegúrate de guardar esto al hacer login
        
        if (text === "" || !userId) return;

        try {
            const res = await fetch('http://18.206.62.120:3000/api/mensajes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario_id: userId,
                    mensaje: text,
                    remitente: 'usuario'
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
        msgDiv.className = `message ${type}`;
        msgDiv.innerHTML = `<div class="bubble">${text}</div>`;
        msgArea.appendChild(msgDiv);
        msgArea.scrollTop = msgArea.scrollHeight;
    }

    // 3. Cargar mensajes automáticamente (Polling)
    async function cargarMensajes() {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        try {
            const res = await fetch(`http://18.206.62.120:3000/api/mensajes/${userId}`);
            const mensajes = await res.json();
            
            msgArea.innerHTML = '<p class="chat-intro">¿En qué te puedo ayudar?</p>';
            mensajes.forEach(m => {
                renderMsg(m.mensaje, m.remitente === 'usuario' ? 'sent' : 'received');
            });
        } catch (err) {
            console.log("Error cargando mensajes");
        }
    }

    if (btnSend) btnSend.addEventListener('click', enviarMensaje);
    input?.addEventListener('keypress', (e) => { if (e.key === 'Enter') enviarMensaje(); });

    // Revisar mensajes nuevos cada 3 segundos
    setInterval(cargarMensajes, 3000);
    cargarMensajes();
});