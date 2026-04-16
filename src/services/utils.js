/**
 * Utilidades generales para Adopt-Me
 */

const Utils = {
    /**
     * Muestra un modal por su ID
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'flex';
    },

    /**
     * Oculta un modal por su ID
     */
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'none';
    },

    /**
     * Cierra todos los modales al hacer clic fuera
     */
    closeModalOnClickOutside(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
    },

    /**
     * toggleMenu: Alternar menú desplegable
     */
    toggleMenu(menuId) {
        const menu = document.getElementById(menuId);
        if (menu) menu.classList.toggle('active');
    },

    /**
     * Cerrar menú al hacer clic fuera
     */
    closeMenuOnClickOutside(menuId, triggerElement) {
        document.addEventListener('click', (e) => {
            const menu = document.getElementById(menuId);
            const trigger = triggerElement;
            if (menu && trigger && !menu.contains(e.target) && !trigger.contains(e.target)) {
                menu.classList.remove('active');
            }
        });
    },

    /**
     * Redirigir a una página
     */
    redirect(page) {
        window.location.href = page;
    },

    /**
     * Mostrar alerta
     */
    alert(message) {
        window.alert(message);
    }
};

// Exportar para uso global
window.Utils = Utils;
