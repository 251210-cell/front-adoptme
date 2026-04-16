document.addEventListener('DOMContentLoaded', () => {

    const campos = [
        "nombre",
        "descripcion",
        "correo",
        "telefono",
        "direccion",
        "ciudad",
        "vivienda",
        "experiencia"
    ];

    // Cargar datos guardados
    campos.forEach(campo => {
        const texto = document.getElementById(campo + "Texto");
        const input = document.getElementById(campo + "Input");

        const guardado = localStorage.getItem(campo + "Usuario");

        if (guardado && texto) {
            texto.textContent = guardado;
        }
    });

    const btnEditar = document.getElementById("btnEditar");
    const btnGuardar = document.getElementById("btnGuardar");

    // EDITAR
    btnEditar.addEventListener("click", () => {

        campos.forEach(campo => {
            const texto = document.getElementById(campo + "Texto");
            const input = document.getElementById(campo + "Input");

            if (texto && input) {
                input.value = texto.textContent;

                texto.style.display = "none";
                input.style.display = "block";
            }
        });

        btnEditar.style.display = "none";
        btnGuardar.style.display = "inline-block";
    });

    // GUARDAR
    btnGuardar.addEventListener("click", () => {

        campos.forEach(campo => {
            const texto = document.getElementById(campo + "Texto");
            const input = document.getElementById(campo + "Input");

            if (texto && input) {
                const valor = input.value.trim();

                localStorage.setItem(campo + "Usuario", valor);
                texto.textContent = valor;

                texto.style.display = "block";
                input.style.display = "none";
            }
        });

        btnEditar.style.display = "inline-block";
        btnGuardar.style.display = "none";

        // ==================================================
        // NUEVA ALERTA ANIMADA CON SWEETALERT
        // ==================================================
        Swal.fire({
            icon: 'success',
            title: '¡Perfil actualizado!',
            text: 'Tus datos se han guardado correctamente.',
            showConfirmButton: false,
            timer: 1500
        });
        
        // Actualizar el correo del header si es que se cambió
        const correoGuardado = localStorage.getItem("correoUsuario");
        const correoHeader = document.getElementById("correoHeader");
        if(correoGuardado && correoHeader) {
            correoHeader.textContent = correoGuardado;
        }
    });

});