// Eliminamos la importación problemática y lo hacemos directo
document.addEventListener('DOMContentLoaded', async () => {
    
    const totalCountElem = document.getElementById('total-count');
    if (totalCountElem) totalCountElem.innerText = "...";

    try {
        // 1. PEDIR DATOS REALES DIRECTAMENTE A TU API
        const res = await fetch('http://18.206.62.120:3000/api/mascotas');
        const mascotas = await res.json();

        // 2. PROCESAR DATOS
        const total = mascotas.length;
        const adoptados = mascotas.filter(m => m.estado === 'Adoptado').length;
        const pendientes = mascotas.filter(m => m.estado === 'Pendiente').length;
        const disponibles = mascotas.filter(m => m.estado === 'Disponible').length;

        // 3. CALCULAR PORCENTAJES
        let pctAdoptados = 0, pctPendientes = 0, pctDisponibles = 0;

        if (total > 0) {
            pctAdoptados = Math.round((adoptados / total) * 100);
            pctPendientes = Math.round((pendientes / total) * 100);
            // Aseguramos que sume 100% exacto
            pctDisponibles = Math.max(0, 100 - pctAdoptados - pctPendientes);
        }

        // 4. ACTUALIZAR TARJETAS SUPERIORES
        document.getElementById('total-count').innerText = total;
        document.getElementById('adopted-count').innerText = adoptados;
        document.getElementById('adopted-pct').innerText = `${pctAdoptados}% del total`;
        document.getElementById('pending-count').innerText = pendientes;
        document.getElementById('pending-pct').innerText = `${pctPendientes}% del total`;
        document.getElementById('available-count').innerText = disponibles;
        document.getElementById('available-pct').innerText = `${pctDisponibles}% del total`;

        // 5. ACTUALIZAR CAJAS DE DETALLE (DERECHA)
        document.getElementById('det-adopt-num').innerText = adoptados;
        document.getElementById('det-adopt-pct').innerText = `${pctAdoptados}%`;
        document.getElementById('det-pend-num').innerText = pendientes;
        document.getElementById('det-pend-pct').innerText = `${pctPendientes}%`;
        document.getElementById('det-avail-num').innerText = disponibles;
        document.getElementById('det-avail-pct').innerText = `${pctDisponibles}%`;

        // 6. ACTUALIZAR ETIQUETAS DEL GRÁFICO (CENTRO)
        document.getElementById('lbl-blue').innerText = `${pctAdoptados}%`;
        document.getElementById('lbl-yellow').innerText = `${pctPendientes}%`;
        document.getElementById('lbl-green').innerText = `${pctDisponibles}%`;

        // 7. ACTUALIZAR EL GRÁFICO (CONIC GRADIENT)
        const chart = document.getElementById('adoptionPieChart');
        if (chart) {
            // Calculamos los puntos de parada para el degradado
            const stop1 = pctAdoptados;
            const stop2 = pctAdoptados + pctPendientes;
            
            // Azul (Adoptados), Amarillo (Pendientes), Verde (Disponibles)
            chart.style.background = `conic-gradient(
                #2F80ED 0% ${stop1}%, 
                #F2C94C ${stop1}% ${stop2}%, 
                #27AE60 ${stop2}% 100%
            )`;
        }

    } catch (error) {
        console.error("Error al cargar estadísticas:", error);
    }
});