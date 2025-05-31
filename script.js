document.addEventListener('DOMContentLoaded', () => {
  const dateDisplay = document.getElementById('current-date');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const progressPercent = document.getElementById('progress-percentage');
  const progressMessage = document.getElementById('progress-message');
  const resetButton = document.getElementById('reset-button');
  const saveButton = document.getElementById('save-button');
  const exportButton = document.getElementById('export-button');
  const modal = document.getElementById('export-modal');
  const closeModal = document.querySelector('.close-modal');
  const cancelExport = document.getElementById('cancel-export');

  function updateDate() {
    const now = new Date();
    const formatted = now.toLocaleDateString('pt-BR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    dateDisplay.textContent = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  function calculateProgress() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const total = checkboxes.length;
    const checked = [...checkboxes].filter(cb => cb.checked).length;
    const percent = total === 0 ? 0 : Math.round((checked / total) * 100);
    progressBarFill.style.width = percent + '%';
    progressPercent.textContent = percent + '%';
    progressMessage.textContent =
      percent === 100 ? 'Parabéns! Você completou todas as tarefas!' : 'Continue avançando!';
  }

  function resetJournal() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
    calculateProgress();
    localStorage.clear();
  }

  function saveState() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const data = {};
    checkboxes.forEach(cb => data[cb.id] = cb.checked);
    localStorage.setItem('journalData', JSON.stringify(data));
    alert('Progresso salvo!');
  }

  function loadState() {
    const saved = JSON.parse(localStorage.getItem('journalData')) || {};
    for (let id in saved) {
      const cb = document.getElementById(id);
      if (cb) cb.checked = saved[id];
    }
    calculateProgress();
  }

  // Eventos
  resetButton?.addEventListener('click', resetJournal);
  saveButton?.addEventListener('click', saveState);
  exportButton?.addEventListener('click', () => modal.style.display = 'block');
  closeModal?.addEventListener('click', () => modal.style.display = 'none');
  cancelExport?.addEventListener('click', () => modal.style.display = 'none');

  document.addEventListener('change', e => {
    if (e.target.matches('input[type="checkbox"]')) calculateProgress();
  });

  // Inicialização
  updateDate();
  loadState();
});
