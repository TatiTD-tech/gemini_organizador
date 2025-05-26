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

        fetch('https://script.google.com/macros/s/AKfycbwqEa4iLv8FoJGJIyjRBThwEpXVtMV04eOM0ONF32jHPTwm8Fk-cqnrzN0jLGSaAACbOw/exec', {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        saveMessage.textContent = 'Dados enviados \uD83C\uDF19';

        setTimeout(() => {
            alert("\uD83D\uDEA8 ALERTA DE GL\u00d3RIA: Voc\u00ea n\u00e3o arrumou a cama, mas seu GitHub t\u00e1 arrumad\u00edssimo.");
        }, 400);
    });

    updateCompletion();
});
