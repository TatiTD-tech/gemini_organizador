
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

    function updateCompletion() {
        const total = checkboxes.length;
        const done = [...checkboxes].filter(cb => cb.checked).length;
        const percent = total === 0 ? 0 : Math.round((done / total) * 100);
        completionValue.textContent = `${percent}%`;
    }

    checkboxes.forEach(cb => cb.addEventListener('change', updateCompletion));

    metricSelects.forEach(select => {
        select.addEventListener('change', () => {
            const val = select.value;
            select.style.backgroundColor =
                val === "bom" ? "#a7c957" :
                val === "mais ou menos" ? "#f2e94e" :
                val === "ruim" ? "#e2786a" : "#3B3B55";
        });
    });

    saveButton.addEventListener('click', () => {
        const tasks = {};
        checkboxes.forEach(cb => {
            const label = cb.nextElementSibling.textContent.trim();
            tasks[label] = cb.checked;
        });

        const data = {
            date: new Date().toLocaleDateString('pt-BR'),
            completionPercentage: completionValue.textContent,
            tasks: tasks,
            water: metricSelects[0].value,
            food: metricSelects[1].value,
            sleep: metricSelects[2].value,
            mood: metricSelects[3].value,
        };

        fetch('https://script.google.com/macros/s/AKfycbzdqJkAF2_5ciH-z_GvusUJoVMxWiIYfat6OcmVpiYFoykjuNR4WOTFUj0-9Y7-QFyLQQ/exec', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(() => {
            saveMessage.textContent = 'Dados enviados 🌙';
        })
        .catch(() => {
            saveMessage.textContent = 'Erro ao enviar os dados!';
        });
    });

    updateCompletion();
});
