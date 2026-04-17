const API_BASE = 'http://18.206.62.120:3000/api';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch(`${API_BASE}/nosotros`);
        if (!res.ok) throw new Error("No se pudo obtener la información");
        
        const datos = await res.json();
        
        // --- 1. SECCIÓN INTRODUCCIÓN ---
        document.getElementById('display-titulo').textContent = datos.tituloPrincipal || 'Nosotros';
        document.getElementById('display-subtitulo').textContent = datos.subtitulo || '';
        document.getElementById('display-parrafo1').textContent = datos.parrafo1 || '';
        document.getElementById('display-parrafo2').textContent = datos.parrafo2 || '';
        
        if (datos.imagenIntro) {
            document.getElementById('display-imagen-intro').src = datos.imagenIntro;
        }

        // --- 2. SECCIÓN OBJETIVOS ---
        document.getElementById('display-titulo-obj').textContent = datos.tituloObjetivo || 'Objetivo';
        document.getElementById('display-obj1').textContent = datos.objetivo1 || '';
        document.getElementById('display-obj2').textContent = datos.objetivo2 || '';
        document.getElementById('display-obj3').textContent = datos.objetivo3 || '';

        // --- 3. SECCIÓN EQUIPO ---
        document.getElementById('display-titulo-equipo').textContent = datos.tituloEquipo || 'Nuestro Equipo';
        
        const containerEquipo = document.getElementById('container-miembros');
        containerEquipo.innerHTML = ''; // Limpiar placeholders

        if (datos.miembrosEquipo && datos.miembrosEquipo.length > 0) {
            datos.miembrosEquipo.forEach(miembro => {
                const card = `
                    <div class="team-card">
                        <div class="team-img">
                            <img src="${miembro.imagen || '../assets/default-user.png'}" alt="${miembro.nombre}">
                        </div>
                        <h3>${miembro.nombre}</h3>
                        <p>${miembro.rol}</p>
                    </div>
                `;
                containerEquipo.innerHTML += card;
            });
        }

    } catch (err) {
        console.error("Error cargando la página de nosotros:", err);
    }
});