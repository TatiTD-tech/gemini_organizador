<script>
        // Configurar a data atual
        function updateDate() {
            const dateElement = document.getElementById('current-date');
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const today = new Date();
            dateElement.textContent = today.toLocaleDateString('pt-BR', options);
        }
        updateDate();

        // Atualizar barra de progresso
        function updateProgressBar() {
            const checkboxes = document.querySelectorAll('.task-checkbox');
            const totalTasks = checkboxes.length;
            let completedTasks = 0;
            
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    completedTasks++;
                }
            });
            
            const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            
            document.getElementById('progress-bar-fill').style.width = `${progressPercentage}%`;
            document.getElementById('progress-percentage').textContent = `${progressPercentage}%`;
            
            // Atualizar mensagem de progresso
            const progressMessage = document.getElementById('progress-message');
            if (progressPercentage === 0) {
                progressMessage.textContent = `Comece seu dia marcando suas tarefas!`;
            } else if (progressPercentage < 25) {
                progressMessage.textContent = `Você completou ${progressPercentage}% das tarefas do dia. Continue assim!`;
            } else if (progressPercentage < 50) {
                progressMessage.textContent = `Bom trabalho! Você já completou ${progressPercentage}% das tarefas.`;
            } else if (progressPercentage < 75) {
                progressMessage.textContent = `Ótimo progresso! ${progressPercentage}% das tarefas concluídas.`;
            } else if (progressPercentage < 100) {
                progressMessage.textContent = `Quase lá! Você já completou ${progressPercentage}% das tarefas.`;
            } else {
                progressMessage.textContent = `Parabéns! Você completou todas as tarefas do dia! 🎉`;
            }
        }

        // Salvar estado no localStorage
        function saveState() {
            const checkboxes = document.querySelectorAll('.task-checkbox');
            const checkboxState = {};
            
            checkboxes.forEach(checkbox => {
                checkboxState[checkbox.id] = checkbox.checked;
            });
            
            const ratings = {};
            ['food', 'sleep', 'water', 'mood'].forEach(item => {
                const selected = document.querySelector(`input[name="${item}-rating"]:checked`);
                ratings[item] = selected ? selected.value : null;
            });
            
            const state = {
                date: new Date().toISOString().split('T')[0],
                checkboxes: checkboxState,
                ratings: ratings
            };
            
            localStorage.setItem('bulletJournalState', JSON.stringify(state));
            
            // Mostrar confirmação
            alert('Progresso salvo com sucesso!');
        }

        // Carregar estado do localStorage
        function loadState() {
            const savedState = localStorage.getItem('bulletJournalState');
            if (savedState) {
                const state = JSON.parse(savedState);
                const today = new Date().toISOString().split('T')[0];
                
                // Só carrega se for do mesmo dia
                if (state.date === today) {
                    // Restaurar checkboxes
                    Object.keys(state.checkboxes).forEach(id => {
                        const checkbox = document.getElementById(id);
                        if (checkbox) {
                            checkbox.checked = state.checkboxes[id];
                        }
                    });
                    
                    // Restaurar ratings
                    Object.keys(state.ratings).forEach(item => {
                        if (state.ratings[item]) {
                            const radio = document.getElementById(`${item}-${state.ratings[item]}`);
                            if (radio) {
                                radio.checked = true;
                            }
                        }
                    });
                    
                    // Atualizar barra de progresso
                    updateProgressBar();
                }
            }
        }

        // Reiniciar tudo
        function resetAll() {
            if (confirm('Tem certeza que deseja reiniciar todas as tarefas?')) {
                // Limpar checkboxes
                document.querySelectorAll('.task-checkbox').forEach(checkbox => {
                    checkbox.checked = false;
                });
                
                // Limpar ratings
                document.querySelectorAll('input[type="radio"]').forEach(radio => {
                    radio.checked = false;
                });
                
                // Limpar localStorage
                localStorage.removeItem('bulletJournalState');
                
                // Atualizar barra de progresso
                updateProgressBar();
                
                alert('Tudo reiniciado para um novo dia!');
            }
        }

        // Funções para o modal de exportação
        function openExportModal() {
            document.getElementById('export-modal').style.display = 'block';
        }

        function closeExportModal() {
            document.getElementById('export-modal').style.display = 'none';
        }

        // Exportar dados para Google Sheets
        function exportToGoogleSheets() {
            const sheetId = document.getElementById('sheet-id').value;
            const appScriptUrl = document.getElementById('app-script-url').value;
            
            if (!appScriptUrl) {
                alert('Por favor, forneça a URL do App Script para exportar os dados.');
                return;
            }
            
            // Coletar dados para exportação
            const today = new Date().toLocaleDateString('pt-BR');
            const checkboxes = document.querySelectorAll('.task-checkbox');
            const taskData = {};
            
            checkboxes.forEach(checkbox => {
                const taskId = checkbox.id;
                const taskLabel = checkbox.nextElementSibling.querySelector('.task-text').textContent;
                taskData[taskId] = {
                    name: taskLabel,
                    completed: checkbox.checked
                };
            });
            
            const ratings = {};
            ['food', 'sleep', 'water', 'mood'].forEach(item => {
                const selected = document.querySelector(`input[name="${item}-rating"]:checked`);
                ratings[item] = selected ? parseInt(selected.value) : 0;
            });
            
            // Preparar dados para envio
            const data = {
                date: today,
                tasks: taskData,
                ratings: ratings,
                sheetId: sheetId
            };
            
            // Mostrar indicador de carregamento
            const exportButton = document.getElementById('confirm-export');
            const originalText = exportButton.textContent;
            exportButton.textContent = 'Enviando...';
            exportButton.disabled = true;
            
            // Enviar dados para o App Script
            fetch(appScriptUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(() => {
                alert('Dados enviados com sucesso para a planilha!');
                closeExportModal();
                
                // Restaurar botão
                exportButton.textContent = originalText;
                exportButton.disabled = false;
            })
            .catch(error => {
                console.error('Erro ao enviar dados:', error);
                alert('Ocorreu um erro ao enviar os dados. Por favor, tente novamente.');
                
                // Restaurar botão
                exportButton.textContent = originalText;
                exportButton.disabled = false;
            });
        }

        // Event listeners
        document.getElementById('save-button').addEventListener('click', saveState);
        document.getElementById('reset-button').addEventListener('click', resetAll);
        document.getElementById('export-button').addEventListener('click', openExportModal);
        document.querySelector('.close-modal').addEventListener('click', closeExportModal);
        document.getElementById('cancel-export').addEventListener('click', closeExportModal);
        document.getElementById('confirm-export').addEventListener('click', exportToGoogleSheets);
        
        // Adicionar event listeners para checkboxes para atualizar a barra de progresso
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', updateProgressBar);
        });
        
        // Carregar estado ao iniciar
        document.addEventListener('DOMContentLoaded', loadState);
    </script>