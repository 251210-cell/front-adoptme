import { loginUser } from '../services/api.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const correoValue = document.getElementById('email').value.trim();
            const contrasenaValue = document.getElementById('password').value;

            try {
                const response = await loginUser({ email: correoValue, contrasena: contrasenaValue });
                
                // VALIDACIÓN DE DOMINIO (@adopt-me.com)
                let rolFinal = response.usuario.rol;
                if (correoValue.toLowerCase().endsWith('@adopt-me.com')) {
                    rolFinal = 'admin';
                }

                localStorage.setItem('token', response.token);
                localStorage.setItem('userRol', rolFinal);
                localStorage.setItem('nombreUsuario', response.usuario.nombre_usuario || response.usuario.nombre);
                
                // --- ESTA ES LA NUEVA LÍNEA QUE DEBES AGREGAR ---
                // Usamos response.usuario.id porque así suele venir de la DB
                localStorage.setItem('usuarioId', response.usuario.id); 

                Swal.fire({
                    title: '¡Bienvenido!',
                    text: `Hola, ${response.usuario.nombre_usuario || response.usuario.nombre}`,
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    // REDIRECCIÓN SEGÚN ROL
                    if (rolFinal === 'admin') {
                        window.location.href = 'index-admin.html';
                    } else {
                        window.location.href = '../../index.html';
                    }
                });
            } catch (error) {
                Swal.fire('Error', 'Credenciales incorrectas', 'error');
            }
        });
    }
});