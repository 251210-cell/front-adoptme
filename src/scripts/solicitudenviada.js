document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtenemos los datos de la mascota seleccionada
    const nombre = localStorage.getItem('mascotaSeleccionadaNombre') || 'tu nuevo amigo';
    const foto = localStorage.getItem('mascotaSeleccionadaFoto');
    const id = localStorage.getItem('mascotaSeleccionadaId');

    // 2. Referencias a los nuevos IDs del HTML
    const txtNombreExito = document.getElementById('exito-nombre-perro');
    const imgPerroExito = document.getElementById('exito-foto-perro');
    const txtNombreBoton = document.getElementById('nombre-boton-volver');
    const btnVolverPerfil = document.getElementById('btn-volver-perfil');

    // 3. Llenamos la información
    if (txtNombreExito) txtNombreExito.textContent = nombre;
    if (txtNombreBoton) txtNombreBoton.textContent = nombre;
    if (imgPerroExito && foto) {
        imgPerroExito.src = foto;
    } else if (imgPerroExito) {
        // Imagen por defecto si no hay foto
        imgPerroExito.src = 'https://via.placeholder.com/240?text=AdoptMe';
    }

    // 4. Lógica para el botón "Ver el perfil de..."
    if (btnVolverPerfil && id) {
        btnVolverPerfil.addEventListener('click', (e) => {
            e.preventDefault();
            // Redirigimos al index y le pasamos el ID para que abra el modal grande
            window.location.href = `../../index.html?abrirPerfil=${id}`;
        });
    }
});