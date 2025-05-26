document.addEventListener('DOMContentLoaded', () => {
    const checkboxes = document.querySelectorAll('.task-item input[type="checkbox"]');
    const completionValue = document.getElementById('completion-value');
    const saveButton = document.getElementById('save-button');
    const saveMessage = document.getElementById('save-message');

    const metricSelects = [
        document.getElementById('water-select'),
        document.getElementById('food-select'),
        document.getElementById('sleep-select'),
        document.getElementById('mood-select'),
    ];

    // Atualiza a porcentagem com base nas tarefas marcadas
    function updateCompletion() {
        const total = checkboxes.length;
        const done = [...checkboxes].filter(cb => cb.checked).length;
        const percent = total === 0 ? 0 : Math.round((done / total) * 100);
        completionValue.textContent = `${percent}%`;
    }

    checkboxes.forEach(cb => cb.addEventListener('change', updateCompletion));

    // Altera a cor dos selects conforme o valor selecionado
    metricSelects.forEach(select => {
        select.addEventListener('change', () => {
            const val = select.value;
            select.style.backgroundColor =
                val === "bom" ? "#a7c957" :
                val === "mais ou menos" ? "#f2e94e" :
                val === "ruim" ? "#e2786a" : "#3B3B55";
        });
    });

    // Evento de clique no botão salvar
    saveButton.addEventListener('click', () => {
        const data = {
            date: new Date().toLocaleDateString(),
            completedTasks: [...checkboxes].filter(cb => cb.checked).length,
            totalTasks: checkboxes.length,
            percent: completionValue.textContent,
            water: metricSelects[0].value,
            food: metricSelects[1].value,
            sleep: metricSelects[2].value,
            mood: metricSelects[3].value,
        };

        // Aqui você coloca o seu endpoint real do Google Apps Script:
        fetch('https://SCRIPT-DO-GOOGLE-AQUI', {
            method: 'POST',
            mode: 'no-cors', // ignora resposta
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        saveMessage.textContent = 'Dados enviados 🌙';

        // 🌟 Alerta final, como prometido:
        setTimeout(() => {
            alert("🚨 ALERTA DE GLÓRIA: Você não arrumou a cama, mas seu GitHub tá arrumadíssimo.");
        }, 400);
    });

    updateCompletion(); // Inicializa com valor atual
});
