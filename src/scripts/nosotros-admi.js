let contadorMiembros = 0;

document.addEventListener('DOMContentLoaded', () => {
    // 1. SEGURIDAD (usamos las mismas llaves que login.js)
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

    // 2. CARGAR DATOS EXISTENTES
    cargarDatos();

    // 3. MANEJAR ENVÍO DEL FORMULARIO
    const form = document.getElementById('formNosotros');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            guardarDatos();
        });
    }

    // 4. CARGAR MIEMBROS EXISTENTES
    cargarMiembrosEquipo();

    // 5. CERRAR EL MENÚ SI SE HACE CLIC AFUERA
    document.addEventListener('click', function (event) {
        const menu = document.getElementById('hamburgerDropdown');
        const btn = document.querySelector('.hamburger-btn');
        if (menu && btn && !btn.contains(event.target) && !menu.contains(event.target)) {
            menu.classList.add('hidden');
        }
    });
});

// ==========================================
// LÓGICA DEL MENÚ HAMBURGUESA Y SECCIONES
// ==========================================

function toggleHamburgerMenu() {
    const menu = document.getElementById('hamburgerDropdown');
    menu.classList.toggle('hidden');
}

function cambiarSeccion(seccionId, tituloSeccion) {
    document.querySelectorAll('.form-section').forEach(seccion => {
        seccion.classList.add('hidden-section');
    });
    document.getElementById(seccionId).classList.remove('hidden-section');
    document.getElementById('seccionActivaTitulo').textContent = tituloSeccion;
    document.getElementById('hamburgerDropdown').classList.add('hidden');
}

// ==========================================

const API_NOSOTROS = 'http://18.206.62.120:3000/api/nosotros';

async function cargarDatos() {
    // Intenta traer datos reales del backend; si falla, usa localStorage como respaldo
    let datos = {};
    try {
        const res = await fetch(API_NOSOTROS);
        if (res.ok) {
            datos = await res.json();
            // Guardamos un cache local para lectura rápida en la vista cliente
            localStorage.setItem('datosNosotros', JSON.stringify(datos));
        }
    } catch (e) {
        console.warn('No se pudo cargar /api/nosotros, usando cache local:', e);
    }
    if (!datos || Object.keys(datos).length === 0) {
        datos = JSON.parse(localStorage.getItem('datosNosotros') || '{}');
    }

    const valoresPorDefecto = {
        tituloPrincipal: datos.tituloPrincipal || 'Nosotros',
        subtitulo: datos.subtitulo || 'Fundación Adopt-Me',
        parrafo1: datos.parrafo1 || 'La Fundación Adopt-Me es una organización sin fines de lucro...',
        parrafo2: datos.parrafo2 || 'Desde 2013 creemos en las segundas oportunidades...',
        imagenIntro: datos.imagenIntro || '',
        tituloObjetivo: datos.tituloObjetivo || 'Nuestro Objetivo',
        objetivo1: datos.objetivo1 || 'En Adopt-Me, nuestro objetivo principal es...',
        objetivo2: datos.objetivo2 || 'Sabemos que muchos animales terminan...',
        objetivo3: datos.objetivo3 || 'Creemos que cada acción cuenta...',
        tituloEquipo: datos.tituloEquipo || 'Nuestro equipo'
    };

    document.getElementById('tituloPrincipal').value = valoresPorDefecto.tituloPrincipal;
    document.getElementById('subtitulo').value = valoresPorDefecto.subtitulo;
    document.getElementById('parrafo1').value = valoresPorDefecto.parrafo1;
    document.getElementById('parrafo2').value = valoresPorDefecto.parrafo2;
    document.getElementById('imagenIntroBase64').value = valoresPorDefecto.imagenIntro;

    if (valoresPorDefecto.imagenIntro) {
        document.getElementById('previewImagenIntro').innerHTML = `<img src="${valoresPorDefecto.imagenIntro}" alt="Preview">`;
        document.getElementById('nombreArchivoIntro').textContent = 'Imagen guardada';
    }

    document.getElementById('tituloObjetivo').value = valoresPorDefecto.tituloObjetivo;
    document.getElementById('objetivo1').value = valoresPorDefecto.objetivo1;
    document.getElementById('objetivo2').value = valoresPorDefecto.objetivo2;
    document.getElementById('objetivo3').value = valoresPorDefecto.objetivo3;

    document.getElementById('tituloEquipo').value = valoresPorDefecto.tituloEquipo;
}

async function cargarMiembrosEquipo() {
    // Preferimos datos del backend; localStorage es respaldo
    let datos = {};
    try {
        const res = await fetch(API_NOSOTROS);
        if (res.ok) datos = await res.json();
    } catch (e) { /* noop */ }
    if (!datos || Object.keys(datos).length === 0) {
        datos = JSON.parse(localStorage.getItem('datosNosotros') || '{}');
    }
    const miembros = datos.miembrosEquipo || [];
    const container = document.getElementById('miembrosEquipo');
    container.innerHTML = '';

    if (miembros.length === 0) {
        crearTarjetaMiembro('', '', '');
    } else {
        miembros.forEach((miembro, index) => {
            crearTarjetaMiembro(miembro.nombre || '', miembro.rol || '', miembro.imagen || '', index);
        });
    }
}

function agregarMiembro() { crearTarjetaMiembro('', '', ''); }

function crearTarjetaMiembro(nombre = '', rol = '', imagen = '', indice = null) {
    const container = document.getElementById('miembrosEquipo');
    const id = indice !== null ? indice : contadorMiembros++;

    const memberCard = document.createElement('div');
    memberCard.className = 'member-card';
    memberCard.setAttribute('data-indice', id);

    const previewHTML = imagen ? `<img src="${imagen}" alt="Preview">` : '';
    const nombreArchivo = imagen ? 'Imagen guardada' : '';

    memberCard.innerHTML = `
        <div class="member-card-header">
            <h3><i class="fas fa-user"></i> Miembro del Equipo</h3>
            <button type="button" class="btn-remove-member" onclick="eliminarMiembro(${id})">
                <i class="fas fa-trash"></i> Eliminar
            </button>
        </div>
        <div class="member-fields">
            <div class="form-group">
                <label><i class="fas fa-user"></i> Nombre Completo</label>
                <input type="text" class="member-nombre" placeholder="Ej: Juan Pérez" value="${nombre}">
            </div>
            <div class="form-group">
                <label><i class="fas fa-briefcase"></i> Rol/Cargo</label>
                <input type="text" class="member-rol" placeholder="Ej: Directiva" value="${rol}">
            </div>
            <div class="form-group full-width">
                <label><i class="fas fa-image"></i> Imagen (Avatar PNG)</label>
                <div class="file-input-wrapper">
                    <input type="file" class="member-imagen-file file-input-hidden" accept="image/png" onchange="previewImagenMiembro(this, ${id})" id="fileMiembro${id}">
                    <label for="fileMiembro${id}" class="file-input-label">
                        <i class="fas fa-camera"></i>
                        <span class="file-input-text">Subir Foto</span>
                        <span class="file-input-name" id="nombreArchivoMiembro${id}">${nombreArchivo}</span>
                    </label>
                </div>
                <div class="member-imagen-preview" id="previewMiembro${id}">${previewHTML}</div>
                <input type="hidden" class="member-imagen-base64" value="${imagen}">
            </div>
        </div>
    `;
    container.appendChild(memberCard);
}

function eliminarMiembro(indice) {
    Swal.fire({
        title: '¿Eliminar miembro?',
        text: "Esta acción quitará a esta persona del equipo.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            const memberCard = document.querySelector(`.member-card[data-indice="${indice}"]`);
            if (memberCard) {
                memberCard.remove();
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminado',
                    text: 'El miembro fue removido.',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        }
    });
}

async function subirImagenABackend(file, callback) {
    if (!file) { callback(''); return; }

    const formData = new FormData();
    formData.append('image', file);

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
}

function previewImagen(input, previewId) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        if (file.type !== 'image/png') {
            Swal.fire({ icon: 'warning', title: 'Formato inválido', text: 'Por favor selecciona un archivo PNG.', confirmButtonColor: '#FF6600' });
            return;
        }
        document.getElementById('nombreArchivoIntro').textContent = file.name + " (Subiendo...)";
        subirImagenABackend(file, function (url) {
            document.getElementById('nombreArchivoIntro').textContent = file.name;
            document.getElementById('imagenIntroBase64').value = url;
            document.getElementById(previewId).innerHTML = `<img src="${url}">`;
        });
    }
}

function previewImagenMiembro(input, id) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        if (file.type !== 'image/png') {
            Swal.fire({ icon: 'warning', title: 'Formato inválido', text: 'Por favor selecciona un archivo PNG.', confirmButtonColor: '#FF6600' });
            return;
        }
        document.getElementById(`nombreArchivoMiembro${id}`).textContent = file.name + " (Subiendo...)";
        subirImagenABackend(file, function (url) {
            document.getElementById(`nombreArchivoMiembro${id}`).textContent = file.name;
            const card = input.closest('.member-card');
            card.querySelector('.member-imagen-base64').value = url;
            document.getElementById(`previewMiembro${id}`).innerHTML = `<img src="${url}">`;
        });
    }
}

async function guardarDatos() {
    const imagenIntroBase64 = document.getElementById('imagenIntroBase64').value;

    const datos = {
        tituloPrincipal: document.getElementById('tituloPrincipal').value.trim(),
        subtitulo: document.getElementById('subtitulo').value.trim(),
        parrafo1: document.getElementById('parrafo1').value.trim(),
        parrafo2: document.getElementById('parrafo2').value.trim(),
        imagenIntro: imagenIntroBase64,
        tituloObjetivo: document.getElementById('tituloObjetivo').value.trim(),
        objetivo1: document.getElementById('objetivo1').value.trim(),
        objetivo2: document.getElementById('objetivo2').value.trim(),
        objetivo3: document.getElementById('objetivo3').value.trim(),
        tituloEquipo: document.getElementById('tituloEquipo').value.trim(),
        miembrosEquipo: []
    };

    document.querySelectorAll('.member-card').forEach(card => {
        const nombre = card.querySelector('.member-nombre').value.trim();
        const rol = card.querySelector('.member-rol').value.trim();
        const imagen = card.querySelector('.member-imagen-base64').value.trim();
        if (nombre && rol) datos.miembrosEquipo.push({ nombre, rol, imagen });
    });

    // Guardado local (cache rápido para la vista cliente y respaldo si la API cae)
    localStorage.setItem('datosNosotros', JSON.stringify(datos));

    // Guardado real en backend (POST /api/nosotros requiere auth)
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(API_NOSOTROS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify(datos)
        });

        if (res.ok) {
            Swal.fire({
                icon: 'success',
                title: '¡Datos guardados!',
                text: 'Los cambios se han actualizado en el servidor y serán visibles para todos los usuarios.',
                confirmButtonColor: '#FF6600'
            });
        } else {
            const err = await res.json().catch(() => ({}));
            Swal.fire({
                icon: 'warning',
                title: 'Guardado parcial',
                text: `Los cambios se guardaron localmente, pero el servidor respondió ${res.status}. ${err.error || ''}`,
                confirmButtonColor: '#FF6600'
            });
        }
    } catch (e) {
        Swal.fire({
            icon: 'warning',
            title: 'Sin conexión al servidor',
            text: 'Los cambios se guardaron localmente pero no se pudieron sincronizar.',
            confirmButtonColor: '#FF6600'
        });
    }
}

function verVistaPrevia() {
    const tituloPrincipal = document.getElementById('tituloPrincipal').value || 'Nosotros';
    const parrafo1 = document.getElementById('parrafo1').value;
    const html = `<div class="preview-intro-section"><h1>${tituloPrincipal}</h1><p>${parrafo1}</p></div>`;
    document.getElementById('contenidoPreview').innerHTML = html;
    document.getElementById('modalVistaPrevia').classList.remove('hidden');
}

function cerrarVistaPrevia() { document.getElementById('modalVistaPrevia').classList.add('hidden'); }

function cancelarEdicion() {
    Swal.fire({
        title: '¿Cancelar edición?',
        text: "Se perderán las modificaciones no guardadas.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#FF6600',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'Volver'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = 'index-admin.html';
        }
    });
}
