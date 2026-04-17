let contadorMiembros = 0;
const API_NOSOTROS = 'http://18.206.62.120:3000/api/nosotros';

document.addEventListener('DOMContentLoaded', () => {
    // 1. SEGURIDAD
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('userRol');

    if (!token || rol !== 'admin') {
        window.location.href = '../../index.html';
        return;
    }

    // 2. CARGAR DATOS
    cargarDatos();
    cargarMiembrosEquipo();

    // 3. EVENTO GUARDAR
    const form = document.getElementById('formNosotros');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            guardarDatos();
        });
    }

    // Cerrar menú hamburguesa al hacer clic fuera
    document.addEventListener('click', (e) => {
        const menu = document.getElementById('hamburgerDropdown');
        const btn = document.querySelector('.hamburger-btn');
        if (menu && btn && !btn.contains(e.target) && !menu.contains(e.target)) {
            menu.classList.add('hidden');
        }
    });
});

// ==========================================
// FUNCIONES DE CARGA
// ==========================================

async function cargarDatos() {
    try {
        const res = await fetch(API_NOSOTROS);
        let datos = {};
        
        if (res.ok) {
            datos = await res.json();
            localStorage.setItem('datosNosotros', JSON.stringify(datos));
        } else {
            datos = JSON.parse(localStorage.getItem('datosNosotros') || '{}');
        }

        // Llenar campos de texto principales
        document.getElementById('tituloPrincipal').value = datos.tituloPrincipal || '';
        document.getElementById('subtitulo').value = datos.subtitulo || '';
        document.getElementById('parrafo1').value = datos.parrafo1 || '';
        document.getElementById('parrafo2').value = datos.parrafo2 || '';
        
        // Objetivos
        document.getElementById('tituloObjetivo').value = datos.tituloObjetivo || '';
        document.getElementById('objetivo1').value = datos.objetivo1 || '';
        document.getElementById('objetivo2').value = datos.objetivo2 || '';
        document.getElementById('objetivo3').value = datos.objetivo3 || '';
        
        document.getElementById('tituloEquipo').value = datos.tituloEquipo || '';
        
    } catch (e) {
        console.warn('Error en carga:', e);
    }
}

async function cargarMiembrosEquipo() {
    try {
        const res = await fetch(API_NOSOTROS);
        let datos = res.ok ? await res.json() : JSON.parse(localStorage.getItem('datosNosotros') || '{}');
        const miembros = datos.miembrosEquipo || [];
        
        const container = document.getElementById('miembrosEquipo');
        container.innerHTML = '';

        if (miembros.length === 0) {
            crearTarjetaMiembro();
        } else {
            miembros.forEach((m, i) => crearTarjetaMiembro(m.nombre, m.rol, i));
        }
    } catch (e) {
        console.error('Error al cargar equipo:', e);
    }
}

function crearTarjetaMiembro(nombre = '', rol = '', indice = null) {
    const container = document.getElementById('miembrosEquipo');
    const id = indice !== null ? indice : contadorMiembros++;

    const memberCard = document.createElement('div');
    memberCard.className = 'member-card';
    memberCard.setAttribute('data-indice', id);

    // SOLO CAMPOS DE TEXTO
    memberCard.innerHTML = `
        <div class="member-card-header">
            <h3><i class="fas fa-user"></i> Miembro del Equipo</h3>
            <button type="button" class="btn-remove-member" onclick="eliminarMiembro(${id})">
                <i class="fas fa-trash"></i> Eliminar
            </button>
        </div>
        <div class="member-fields">
            <div class="form-group">
                <label>Nombre Completo</label>
                <input type="text" class="member-nombre" placeholder="Nombre" value="${nombre}">
            </div>
            <div class="form-group">
                <label>Cargo</label>
                <input type="text" class="member-rol" placeholder="Ej: Veterinario" value="${rol}">
            </div>
        </div>
    `;
    container.appendChild(memberCard);
}

// ==========================================
// GUARDAR CAMBIOS
// ==========================================

async function guardarDatos() {
    const datos = {
        tituloPrincipal: document.getElementById('tituloPrincipal').value.trim(),
        subtitulo: document.getElementById('subtitulo').value.trim(),
        parrafo1: document.getElementById('parrafo1').value.trim(),
        parrafo2: document.getElementById('parrafo2').value.trim(),
        tituloObjetivo: document.getElementById('tituloObjetivo').value.trim(),
        objetivo1: document.getElementById('objetivo1').value.trim(),
        objetivo2: document.getElementById('objetivo2').value.trim(),
        objetivo3: document.getElementById('objetivo3').value.trim(),
        tituloEquipo: document.getElementById('tituloEquipo').value.trim(),
        miembrosEquipo: []
    };

    // Recoger solo textos de los miembros
    document.querySelectorAll('.member-card').forEach(card => {
        const nombre = card.querySelector('.member-nombre').value.trim();
        const rol = card.querySelector('.member-rol').value.trim();
        if (nombre && rol) {
            datos.miembrosEquipo.push({ nombre, rol });
        }
    });

    try {
        const res = await fetch(API_NOSOTROS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(datos)
        });

        if (res.ok) {
            localStorage.setItem('datosNosotros', JSON.stringify(datos));
            Swal.fire('¡Éxito!', 'Los textos se actualizaron correctamente.', 'success');
        } else {
            Swal.fire('Error', 'No se pudo guardar la información.', 'error');
        }
    } catch (e) {
        Swal.fire('Error', 'Fallo de conexión con el servidor.', 'error');
    }
}

// Funciones Globales para botones
window.agregarMiembro = function() { crearTarjetaMiembro(); }
window.eliminarMiembro = function(id) { 
    const card = document.querySelector(`.member-card[data-indice="${id}"]`);
    if(card) card.remove(); 
}
window.toggleHamburgerMenu = function() { 
    document.getElementById('hamburgerDropdown').classList.toggle('hidden'); 
}