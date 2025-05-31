document.addEventListener('DOMContentLoaded', () => {
  const checkboxes = document.querySelectorAll('.task-checkbox');
  const progressBar = document.getElementById('progress-bar-fill');
  const progressPercent = document.getElementById('progress-percentage');
  const progressMessage = document.getElementById('progress-message');
  const dateDisplay = document.getElementById('current-date');

  const updateDate = () => {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.textContent = today.toLocaleDateString('pt-BR', options);
  };

  const updateProgress = () => {
    const total = checkboxes.length;
    const done = [...checkboxes].filter(cb => cb.checked).length;
    const percent = total ? Math.round((done / total) * 100) : 0;
    progressBar.style.width = `${percent}%`;
    progressPercent.textContent = `${percent}%`;
    progressMessage.textContent =
      percent === 0 ? 'Comece seu dia marcando suas tarefas!' :
      percent < 100 ? `Você completou ${percent}% das tarefas.` :
      'Parabéns! Você completou todas as tarefas! 🎉';
  };

  const saveState = () => {
    const state = {};
    checkboxes.forEach(cb => state[cb.id] = cb.checked);
    localStorage.setItem('taskState', JSON.stringify(state));
  };

  const loadState = () => {
    const saved = JSON.parse(localStorage.getItem('taskState')) || {};
    checkboxes.forEach(cb => {
      cb.checked = saved[cb.id] || false;
    });
    updateProgress();
  };

  const resetTasks = () => {
    checkboxes.forEach(cb => cb.checked = false);
    localStorage.removeItem('taskState');
    updateProgress();
  };

  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      updateProgress();
      saveState();
    });
  });

  document.getElementById('reset-button').addEventListener('click', resetTasks);
  document.getElementById('save-button').addEventListener('click', saveState);

  updateDate();
  loadState();

  // Modal de exportação
  const exportModal = document.getElementById('export-modal');
  const exportButton = document.getElementById('export-button');
  const cancelExport = document.getElementById('cancel-export');
  const confirmExport = document.getElementById('confirm-export');
  const closeModal = document.querySelector('.close-modal');

  exportButton.addEventListener('click', () => exportModal.style.display = 'block');
  cancelExport.addEventListener('click', () => exportModal.style.display = 'none');
  closeModal.addEventListener('click', () => exportModal.style.display = 'none');
  window.addEventListener('click', e => {
    if (e.target == exportModal) exportModal.style.display = 'none';
  });

  confirmExport.addEventListener('click', () => {
    const sheetId = document.getElementById('sheet-id').value.trim();
    const scriptUrl = document.getElementById('app-script-url').value.trim();
    if (!scriptUrl) {
      alert('Informe a URL do App Script.');
      return;
    }

    const tasks = {};
    checkboxes.forEach(cb => {
      tasks[cb.id] = {
        name: cb.nextElementSibling.querySelector('.task-text').innerText,
        completed: cb.checked
      };
    });

    const ratings = {};
    ['food', 'sleep', 'water', 'mood'].forEach(type => {
      const selected = document.querySelector(`input[name="${type}-rating"]:checked`);
      ratings[type] = selected ? parseInt(selected.value) : 0;
    });

    const payload = {
      sheetId,
      date: new Date().toLocaleDateString('pt-BR'),
      tasks,
      ratings
    };

    fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      if (data.result === 'success') {
        alert('Exportação concluída com sucesso!');
        exportModal.style.display = 'none';
      } else {
        alert('Erro ao exportar: ' + data.message);
      }
    })
    .catch(err => {
      alert('Erro na requisição: ' + err);
    });
  });
});
