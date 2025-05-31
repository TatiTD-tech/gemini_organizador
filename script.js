document.addEventListener('DOMContentLoaded', () => {
  const checkboxes = document.querySelectorAll('.task-checkbox');
  const progressBar = document.getElementById('progress-bar-fill');
  const progressPercent = document.getElementById('progress-percentage');
  const progressMessage = document.getElementById('progress-message');
  const dateDisplay = document.getElementById('current-date');

  function updateDate() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.textContent = today.toLocaleDateString('pt-BR', options);
  }

  function updateProgress() {
    const total = checkboxes.length;
    const done = [...checkboxes].filter(cb => cb.checked).length;
    const percent = total ? Math.round((done / total) * 100) : 0;
    progressBar.style.width = `${percent}%`;
    progressPercent.textContent = `${percent}%`;

    if (percent === 0) {
      progressMessage.textContent = 'Comece seu dia marcando suas tarefas!';
    } else if (percent < 25) {
      progressMessage.textContent = `Você completou ${percent}% das tarefas do dia. Continue assim!`;
    } else if (percent < 50) {
      progressMessage.textContent = `Bom trabalho! Você já completou ${percent}% das tarefas.`;
    } else if (percent < 75) {
      progressMessage.textContent = `Ótimo progresso! ${percent}% das tarefas concluídas.`;
    } else if (percent < 100) {
      progressMessage.textContent = `Quase lá! Você já completou ${percent}% das tarefas.`;
    } else {
      progressMessage.textContent = `Parabéns! Você completou todas as tarefas do dia! 🎉`;
    }
  }

  function resetJournal() {
    if (!confirm('Tem certeza que deseja reiniciar todas as tarefas?')) return;
    checkboxes.forEach(cb => cb.checked = false);
    document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
    localStorage.removeItem('bulletJournalState');
    updateProgress();
    alert('Tudo reiniciado para um novo dia!');
  }

  function saveState() {
    const checkboxState = {};
    checkboxes.forEach(cb => checkboxState[cb.id] = cb.checked);
    const ratings = {};
    ['food', 'sleep', 'water', 'mood'].forEach(key => {
      const selected = document.querySelector(`input[name="${key}-rating"]:checked`);
      ratings[key] = selected ? selected.value : null;
    });
    const state = {
      date: new Date().toISOString().split('T')[0],
      checkboxes: checkboxState,
      ratings
    };
    localStorage.setItem('bulletJournalState', JSON.stringify(state));
    alert('Progresso salvo com sucesso!');
  }

  function loadState() {
    const savedState = localStorage.getItem('bulletJournalState');
    if (!savedState) return;
    const state = JSON.parse(savedState);
    const today = new Date().toISOString().split('T')[0];
    if (state.date !== today) return;
    for (const id in state.checkboxes) {
      const cb = document.getElementById(id);
      if (cb) cb.checked = state.checkboxes[id];
    }
    for (const key in state.ratings) {
      if (state.ratings[key]) {
        const radio = document.getElementById(`${key}-${state.ratings[key]}`);
        if (radio) radio.checked = true;
      }
    }
    updateProgress();
  }

  function openModal() {
    document.getElementById('export-modal').style.display = 'block';
  }

  function closeModal() {
    document.getElementById('export-modal').style.display = 'none';
  }

  function exportToGoogleSheets() {
    const sheetId = document.getElementById('sheet-id').value;
    const appScriptUrl = document.getElementById('app-script-url').value;
    if (!appScriptUrl) {
      alert('Por favor, forneça a URL do App Script para exportar os dados.');
      return;
    }
    const today = new Date().toLocaleDateString('pt-BR');
    const taskData = {};
    checkboxes.forEach(cb => {
      const taskLabel = cb.nextElementSibling.querySelector('.task-text')?.textContent || '';
      taskData[cb.id] = { name: taskLabel, completed: cb.checked };
    });
    const ratings = {};
    ['food', 'sleep', 'water', 'mood'].forEach(item => {
      const selected = document.querySelector(`input[name="${item}-rating"]:checked`);
      ratings[item] = selected ? parseInt(selected.value) : 0;
    });
    const data = { date: today, tasks: taskData, ratings, sheetId };
    const exportBtn = document.getElementById('confirm-export');
    exportBtn.textContent = 'Enviando...';
    exportBtn.disabled = true;

    fetch(appScriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(() => {
      alert('Dados enviados com sucesso para a planilha!');
      closeModal();
    })
    .catch(() => alert('Ocorreu um erro ao enviar os dados.'))
    .finally(() => {
      exportBtn.textContent = 'Confirmar Exportação';
      exportBtn.disabled = false;
    });
  }

  document.getElementById('save-button')?.addEventListener('click', saveState);
  document.getElementById('reset-button')?.addEventListener('click', resetJournal);
  document.getElementById('export-button')?.addEventListener('click', openModal);
  document.querySelector('.close-modal')?.addEventListener('click', closeModal);
  document.getElementById('cancel-export')?.addEventListener('click', closeModal);
  document.getElementById('confirm-export')?.addEventListener('click', exportToGoogleSheets);
  checkboxes.forEach(cb => cb.addEventListener('change', updateProgress));

  updateDate();
  loadState();
});