
let contadorMiembros = 0;
const API_NOSOTROS = 'http://18.206.62.120:3000/api/nosotros';

document.addEventListener('DOMContentLoaded', () => {
    // 1. SEGURIDAD
    const token = localStorage.getItem('token');
    const nombreLS = localStorage.getItem('nombreUsuario');
    const rol = localStorage.getItem('userRol');
    const isLogged = (!!token && token !== 'undefined') || !!nombreLS;

    if (!isLogged || rol !== 'admin') {
        Swal.fire({
            icon: 'error',
            title: 'Acceso denegado',
            text: 'Esta área es solo para administradores.',
            confirmButtonColor: '#FF6600'
        }).then(() => {
            window.location.href = '../../index.html';
        });
        return;
    }

    // 2. CARGAR DATOS
    cargarDatos();
    cargarMiembrosEquipo();

    // 3. EVENTOS
    const form = document.getElementById('formNosotros');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            guardarDatos();
        });
    }

    // Cerrar menú hamburguesa
    document.addEventListener('click', function (event) {
        const menu = document.getElementById('hamburgerDropdown');
        const btn = document.querySelector('.hamburger-btn');
        if (menu && btn && !btn.contains(event.target) && !menu.contains(event.target)) {
            menu.classList.add('hidden');
        }
    });
});

// ==========================================
// FUNCIONES DE CARGA Y UI
// ==========================================

async function cargarDatos() {
    let datos = {};
    try {
        const res = await fetch(API_NOSOTROS);
        if (res.ok) {
            datos = await res.json();
            localStorage.setItem('datosNosotros', JSON.stringify(datos));
        }
    } catch (e) {
        console.warn('Usando cache local:', e);
    }
    
    if (!datos || Object.keys(datos).length === 0) {
        datos = JSON.parse(localStorage.getItem('datosNosotros') || '{}');
    }

    // Llenar inputs
    document.getElementById('tituloPrincipal').value = datos.tituloPrincipal || '';
    document.getElementById('subtitulo').value = datos.subtitulo || '';
    document.getElementById('parrafo1').value = datos.parrafo1 || '';
    document.getElementById('parrafo2').value = datos.parrafo2 || '';
    document.getElementById('imagenIntroBase64').value = datos.imagenIntro || '';

    if (datos.imagenIntro) {
        document.getElementById('previewImagenIntro').innerHTML = `<img src="${datos.imagenIntro}" alt="Preview">`;
    }

    document.getElementById('tituloObjetivo').value = datos.tituloObjetivo || '';
    document.getElementById('objetivo1').value = datos.objetivo1 || '';
    document.getElementById('objetivo2').value = datos.objetivo2 || '';
    document.getElementById('objetivo3').value = datos.objetivo3 || '';
    document.getElementById('tituloEquipo').value = datos.tituloEquipo || '';
}

async function cargarMiembrosEquipo() {
    let datos = JSON.parse(localStorage.getItem('datosNosotros') || '{}');
    try {
        const res = await fetch(API_NOSOTROS);
        if (res.ok) datos = await res.json();
    } catch (e) {}

    const miembros = datos.miembrosEquipo || [];
    const container = document.getElementById('miembrosEquipo');
    container.innerHTML = '';

    if (miembros.length === 0) {
        crearTarjetaMiembro();
    } else {
        miembros.forEach((m, i) => crearTarjetaMiembro(m.nombre, m.rol, m.imagen, i));
    }
}

function crearTarjetaMiembro(nombre = '', rol = '', imagen = '', indice = null) {
    const container = document.getElementById('miembrosEquipo');
    const id = indice !== null ? indice : contadorMiembros++;

    const memberCard = document.createElement('div');
    memberCard.className = 'member-card';
    memberCard.setAttribute('data-indice', id);

    memberCard.innerHTML = `
        <div class="member-card-header">
            <h3><i class="fas fa-user"></i> Miembro</h3>
            <button type="button" class="btn-remove-member" onclick="eliminarMiembro(${id})">Eliminar</button>
        </div>
        <input type="text" class="member-nombre" placeholder="Nombre" value="${nombre}">
        <input type="text" class="member-rol" placeholder="Rol" value="${rol}">
        <input type="file" onchange="previewImagenMiembro(this, ${id})">
        <input type="hidden" class="member-imagen-base64" value="${imagen}">
        <div id="previewMiembro${id}">${imagen ? `<img src="${imagen}">` : ''}</div>
    `;
    container.appendChild(memberCard);
}

// ==========================================
// LÓGICA DE IMÁGENES Y GUARDADO
// ==========================================

async function subirImagenABackend(file, callback) {
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);

    try {
        const res = await fetch('http://18.206.62.120:3000/api/upload', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        callback(data.url);
    } catch (e) {
        console.error("Error subiendo imagen:", e);
    }
}

function previewImagenMiembro(input, id) {
    if (input.files && input.files[0]) {
        subirImagenABackend(input.files[0], (url) => {
            const card = input.closest('.member-card');
            card.querySelector('.member-imagen-base64').value = url;
            document.getElementById(`previewMiembro${id}`).innerHTML = `<img src="${url}">`;
        });
    }
}

async function guardarDatos() {
    const datos = {
        tituloPrincipal: document.getElementById('tituloPrincipal').value,
        subtitulo: document.getElementById('subtitulo').value,
        parrafo1: document.getElementById('parrafo1').value,
        parrafo2: document.getElementById('parrafo2').value,
        imagenIntro: document.getElementById('imagenIntroBase64').value,
        tituloObjetivo: document.getElementById('tituloObjetivo').value,
        objetivo1: document.getElementById('objetivo1').value,
        objetivo2: document.getElementById('objetivo2').value,
        objetivo3: document.getElementById('objetivo3').value,
        tituloEquipo: document.getElementById('tituloEquipo').value,
        miembrosEquipo: []
    };

    document.querySelectorAll('.member-card').forEach(card => {
        const nombre = card.querySelector('.member-nombre').value;
        const rol = card.querySelector('.member-rol').value;
        const imagen = card.querySelector('.member-imagen-base64').value;
        if (nombre && rol) datos.miembrosEquipo.push({ nombre, rol, imagen });
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
        if (res.ok) Swal.fire('¡Guardado!', 'Los datos se actualizaron.', 'success');
    } catch (e) {
        Swal.fire('Error', 'No se pudo conectar al servidor', 'error');
    }
}

// Auxiliares de UI
function toggleHamburgerMenu() { document.getElementById('hamburgerDropdown').classList.toggle('hidden'); }
function eliminarMiembro(id) { document.querySelector(`.member-card[data-indice="${id}"]`).remove(); }