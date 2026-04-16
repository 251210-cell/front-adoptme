import { registerUser } from '../services/api.js';

document.addEventListener('DOMContentLoaded', () => {
    const registroForm = document.getElementById('registroForm');

    if (registroForm) {
        registroForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Captura de valores
            const nombreValue = document.getElementById('nombre').value.trim();
            const correoValue = document.getElementById('email').value.trim();
            const contrasenaValue = document.getElementById('password').value;
            const confirmarContrasena = document.getElementById('confirm_password').value;

            // Validaciones básicas en el frontend
            if (nombreValue.length < 3) {
                return Swal.fire('Atención', 'El nombre debe tener al menos 3 caracteres', 'warning');
            }

            if (contrasenaValue.length < 6) {
                return Swal.fire('Atención', 'La contraseña debe tener al menos 6 caracteres', 'warning');
            }

            if (contrasenaValue !== confirmarContrasena) {
                return Swal.fire('Atención', 'Las contraseñas no coinciden', 'warning');
            }

            try {
                // Enviamos con los nombres que espera el backend (nombre_usuario, email, contrasena)
                await registerUser({ 
                    nombre_usuario: nombreValue, 
                    email: correoValue, 
                    contrasena: contrasenaValue 
                });

                // Alerta de éxito con auto-redirección
                Swal.fire({
                    title: '¡Registro Exitoso!',
                    text: 'Redirigiendo al inicio de sesión...',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                }).then(() => {
                    window.location.href = 'login.html';
                });

            } catch (error) {
                // Si hay error (ej. email ya registrado), mostramos el mensaje del servidor
                Swal.fire('Error de registro', error.message, 'error');
            }
        });
    }
});