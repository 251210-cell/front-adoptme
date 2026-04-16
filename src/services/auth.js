/**
 * Servicio de autenticación para Adopt-Me
 * Maneja la sesión del usuario usando localStorage
 */

const AuthService = {
    // Claves para localStorage
    KEYS: {
        USUARIO_LOGUEADO: 'usuarioLogueado',
        NOMBRE_USUARIO: 'nombreUsuario',
        ROL_USUARIO: 'rolUsuario'
    },

    /**
     * Verifica si el usuario está logueado
     */
    isLogged() {
        return localStorage.getItem(this.KEYS.USUARIO_LOGUEADO) === 'true';
    },

    /**
     * Obtiene el rol del usuario actual
     */
    getRol() {
        return localStorage.getItem(this.KEYS.ROL_USUARIO);
    },

    /**
     * Obtiene el nombre del usuario
     */
    getNombre() {
        return localStorage.getItem(this.KEYS.NOMBRE_USUARIO) || 'Amigo';
    },

    /**
     * Verifica si es admin
     */
    isAdmin() {
        return this.isLogged() && this.getRol() === 'admin';
    },

    /**
     * Inicia sesión
     */
    login(nombre, rol) {
        localStorage.setItem(this.KEYS.USUARIO_LOGUEADO, 'true');
        localStorage.setItem(this.KEYS.NOMBRE_USUARIO, nombre);
        localStorage.setItem(this.KEYS.ROL_USUARIO, rol);
    },

    /**
     * Cierra sesión
     */
    logout() {
        localStorage.removeItem(this.KEYS.USUARIO_LOGUEADO);
        localStorage.removeItem(this.KEYS.NOMBRE_USUARIO);
        localStorage.removeItem(this.KEYS.ROL_USUARIO);
    },

    /**
     * Redirige según el rol del usuario
     */
    redirectByRol() {
        if (this.isAdmin()) {
            window.location.href = '../views/index-admin.html';
        }
    },

    /**
     * Valida sesión para páginas protegidas
     */
    requireAuth(redirectTo = '../views/login.html') {
        if (!this.isLogged()) {
            alert("🔒 Debes iniciar sesión para acceder a esta sección.");
            window.location.href = redirectTo;
            return false;
        }
        return true;
    }
};

// Exportar para uso global
window.AuthService = AuthService;
