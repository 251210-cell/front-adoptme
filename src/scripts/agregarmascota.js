document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formRegistroMascota');
    const fileInput = document.getElementById('fileInput');
    let archivo = null;

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            archivo = e.target.files[0];
            if (archivo) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const box = document.getElementById('uploadBox');
                    box.innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`;
                };
                reader.readAsDataURL(archivo);
            }
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('nombre', document.getElementById('nombreMascota').value);
        formData.append('raza', document.getElementById('razaMascota').value);
        formData.append('edad', document.getElementById('edadMascota').value);
        formData.append('refugio', document.getElementById('refugioMascota').value);
        formData.append('descripcion', document.getElementById('detallesMascota').value);
        formData.append('tamano', document.querySelector('input[name="tamano"]:checked')?.value);
        formData.append('estado_salud', document.querySelector('input[name="salud"]:checked')?.value);
        formData.append('condicion_especial', document.querySelector('input[name="condicion_especial"]:checked')?.value);
        formData.append('especie', 'Perro');
        formData.append('estado_adopcion', 'Disponible');
        if (archivo) formData.append('imagen', archivo);

        Swal.fire({ title: 'Guardando...', didOpen: () => Swal.showLoading() });

        try {
            const res = await fetch('http://18.206.62.120:3000/api/mascotas', { method: 'POST', body: formData });
            if (res.ok) {
                Swal.fire('¡Éxito!', 'Mascota agregada', 'success').then(() => window.location.href = 'index-admin.html');
            }
        } catch (err) { Swal.fire('Error', 'No hay conexión con AWS', 'error'); }
    });
});