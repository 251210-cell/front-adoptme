document.addEventListener('DOMContentLoaded', () => {
    
    // Verificar sesión (Opcional, pero recomendado)
    const isLogged = localStorage.getItem('usuarioLogueado');
    if (isLogged !== 'true') {
        alert("Inicia sesión para agendar una visita.");
        window.location.href = '/src/views/login.html';
        return;
    }

    const daysContainer = document.getElementById('calendarDays');
    const summaryDate = document.getElementById('summaryDate');
    const summaryTime = document.getElementById('summaryTime');
    
    // 1. Renderizar Días
    for(let i = 1; i <= 28; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        dayDiv.textContent = i;
        
        dayDiv.addEventListener('click', () => {
            document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
            dayDiv.classList.add('selected');
            
            // Actualizar resumen
            const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
            const diaSemana = diasSemana[(i - 1) % 7];
            summaryDate.textContent = `${diaSemana}, ${i} de febrero de 2026`;
        });

        // Preseleccionar día 12
        if(i === 12) dayDiv.click();
        
        daysContainer.appendChild(dayDiv);
    }

    // 2. Horarios
    const timeBtns = document.querySelectorAll('.time-btn');
    timeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            timeBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            summaryTime.textContent = btn.textContent;
        });
    });
    // Preseleccionar 04:00 PM
    const defaultTime = Array.from(timeBtns).find(b => b.textContent.includes('04:00 PM'));
    if(defaultTime) defaultTime.click();

    // 3. Confirmar
    document.getElementById('btnConfirmar').addEventListener('click', () => {
        alert("¡Visita Agendada Correctamente!\n\nRevisa la sección 'Mis Visitas' para ver el estado.");
        window.location.href = '/src/views/mis-visitas.html'; // Redirige a la lista de visitas
    });
});
