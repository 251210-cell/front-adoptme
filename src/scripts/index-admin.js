let todasLasMascotas = [];

document.addEventListener('DOMContentLoaded', () => {
    // 1. Seguridad y Carga de Perfil
    const nombre = localStorage.getItem("nombreUsuario") || "Admin";
    document.getElementById("adminNombreHeader").textContent = nombre;
    document.getElementById("adminAvatar").src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=FF6600&color=fff`;

    // 2. CONEXIÓN A LA VISTA DE AGREGAR [Lo que faltaba]
    document.getElementById('btnAgregarMascota')?.addEventListener('click', () => {
        window.location.href = 'agregarmascota.html'; // Te manda a tu vista dedicada
    });

    // 3. Buscador
    document.getElementById('buscadorMascotas')?.addEventListener('input', aplicarFiltrosYBusqueda);

    // 4. Delegación de clic para Editar
    document.querySelector('.pets-grid').addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-editar');
        if (btn) {
            const petName = btn.closest('.pet-card').querySelector('h3').innerText.split(',')[0].trim();
            abrirModalEditar(petName);
        }
    });

    // 5. Guardar Edición con Alerta
    document.getElementById('formEditarMascota').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Aquí iría tu lógica de fetch para actualizar...

        Swal.fire({
            title: '¡Actualizado!',
            text: 'La información se guardó correctamente.',
            icon: 'success',
            confirmButtonColor: '#FF6600',
            timer: 1500,
            showConfirmButton: false
    
        });

        cerrarModal();
        obtenerMascotas();
    });

    obtenerMascotas();
});

// --- FUNCIONES DE DATOS (Intactas como las pasaste) ---

async function obtenerMascotas() {
    try {
        const res = await fetch('http://18.206.62.120:3000/api/mascotas');
        todasLasMascotas = await res.json();
        aplicarFiltrosYBusqueda();
    } catch (e) { console.error("Error API"); }
}

function aplicarFiltrosYBusqueda() {
    const texto = document.getElementById('buscadorMascotas').value.toLowerCase();
    const btnActivo = document.querySelector('.filter-btn.active');
    const filtroEstado = btnActivo ? btnActivo.innerText.trim() : "Todos";

    const filtrados = todasLasMascotas.filter(m => {
        const coincideNombre = m.nombre.toLowerCase().includes(texto);
        let coincideEstado = (filtroEstado === "Todos") || 
                             (filtroEstado === "Disponibles" && m.estado === "Disponible") ||
                             (filtroEstado === "Adoptados" && m.estado === "Adoptado") ||
                             (filtroEstado === "Pendientes" && m.estado === "Pendiente");
        return coincideNombre && coincideEstado;
    });
    renderizarGrid(filtrados);
}

function renderizarGrid(lista) {
    const grid = document.querySelector('.pets-grid');
    grid.innerHTML = lista.map(m => `
        <div class="pet-card">
            <div class="card-image">
                <span class="badge ${m.estado.toLowerCase()}">${m.estado}</span>
                <img src="${m.imagen}" alt="${m.nombre}">
            </div>
            <div class="card-info">
                <h3>${m.nombre}, <span>${m.edad}</span></h3>
                <p class="breed">${m.raza}</p>
                <button class="btn-editar">Editar <i class="fas fa-pen"></i></button>
            </div>
        </div>
    `).join('');
}

// --- MODAL Y SESIÓN ---

window.abrirModalEditar = function(nombre) {
    const m = todasLasMascotas.find(mascota => mascota.nombre === nombre);
    if (!m) return;

    document.getElementById('editNombreTitulo').innerText = `${m.nombre}, ${m.edad}`;
    document.getElementById('editRazaSubtitulo').innerText = m.raza;
    document.getElementById('editImagenPreview').src = m.imagen;
    document.getElementById('editBadge').innerText = m.estado.toUpperCase();
    document.getElementById('editEdad').value = m.edad;
    document.getElementById('editDescripcion').value = m.descripcion || "";
    
    document.getElementById('modalEditar').classList.remove('hidden');
};

window.cerrarModal = () => document.getElementById('modalEditar').classList.add('hidden');

window.toggleMenuAdmin = () => {
    const menu = document.getElementById("dropdown-menu-admin");
    menu.style.display = (menu.style.display === "flex") ? "none" : "flex";
};

window.cerrarSesionAdmin = () => {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Tendrás que volver a iniciar sesión.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#FF6600',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.clear();
            window.location.href = "../../index.html";
        }
    });
};

window.filtrarEstado = (estado) => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.innerText.trim() === estado));
    aplicarFiltrosYBusqueda();
};