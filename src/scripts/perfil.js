document.addEventListener('DOMContentLoaded', async () => {
    // 1. LEER LOS DATOS DEL LOGIN
    const userId = localStorage.getItem('usuarioId'); 
    const token = localStorage.getItem('token');

    // Si no hay ID, mandamos al login
    if (!userId) {
        Swal.fire({
            icon: 'warning',
            title: 'Sesión expirada',
            text: 'Por favor, inicia sesión para gestionar tu perfil.',
            confirmButtonText: 'Ir al Login'
        }).then(() => {
            window.location.href = 'login.html'; 
        });
        return;
    }

    // USAMOS TU IP DE AWS
    const BASE_URL = 'http://18.206.62.120:3000';
    const API_URL = `${BASE_URL}/api/usuarios/${userId}`;

    const mapaCampos = {
        "nombre": "nombre_usuario",
        "descripcion": "biografia",
        "correo": "email",
        "telefono": "telefono",
        "direccion": "direccion",
        "ciudad": "ciudad",
        "vivienda": "tipo_vivienda",
        "experiencia": "experiencia_mascotas"
    };

    const idsHtml = Object.keys(mapaCampos);
    const btnEditar = document.getElementById("btnEditar");
    const btnGuardar = document.getElementById("btnGuardar");

    // === CARGAR DATOS ===
    async function cargarDatos() {
        try {
            console.log("Intentando conectar a:", API_URL);
            const response = await fetch(API_URL);
            
            if (!response.ok) throw new Error("Error en la respuesta del servidor");
            
            const user = await response.json();

            idsHtml.forEach(id => {
                const dbCol = mapaCampos[id];
                const display = document.getElementById(id + "Texto");
                if (display && user[dbCol]) {
                    display.textContent = user[dbCol];
                }
            });

            // Foto de perfil
            const imgElement = document.querySelector('.avatar-container img');
            if (user.foto_perfil) {
                imgElement.src = user.foto_perfil;
            } else {
                imgElement.src = `https://ui-avatars.com/api/?name=${user.nombre_usuario || 'User'}&background=random`;
            }

        } catch (error) {
            console.error("Error cargando perfil:", error);
            Swal.fire('Error', 'No se pudo conectar con el servidor en ' + BASE_URL, 'error');
        }
    }

    cargarDatos();

    // === MODO EDICIÓN ===
    btnEditar.addEventListener("click", () => {
        idsHtml.forEach(id => {
            const texto = document.getElementById(id + "Texto");
            const input = document.getElementById(id + "Input");
            if (texto && input) {
                input.value = texto.textContent.trim();
                texto.style.display = "none";
                input.style.display = "block";
            }
        });
        btnEditar.style.display = "none";
        btnGuardar.style.display = "inline-block";
    });

    // === GUARDAR (PUT) ===
    btnGuardar.addEventListener("click", async () => {
        const payload = {};
        idsHtml.forEach(id => {
            const input = document.getElementById(id + "Input");
            if (input) {
                const valor = input.value.trim();
                // Solo mandamos el dato si el usuario escribió algo
                if (valor !== "") {
                    payload[mapaCampos[id]] = valor;
                }
            }
        });
    
        try {
            const response = await fetch(API_URL, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
    
            if (response.ok) {
                // ... lógica para ocultar inputs y mostrar textos ...
                Swal.fire({ icon: 'success', title: '¡Perfil actualizado!', timer: 1500, showConfirmButton: false });
            } else {
                const err = await response.json();
                Swal.fire('Error', err.error || 'No se pudo actualizar', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Fallo de conexión con AWS', 'error');
        }
    });
});

