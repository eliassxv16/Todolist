document.addEventListener('DOMContentLoaded', () => {
    // ========== DOM Elements ==========
    const taskInput = document.getElementById('entrada-tarea');
    const categorySelect = document.getElementById('selector-categoria');
    const prioritySelect = document.getElementById('selector-prioridad');
    const dueDateInput = document.getElementById('entrada-fecha-vencimiento');
    const addBtn = document.getElementById('btn-agregar');
    const taskList = document.getElementById('lista-tareas');
    const darkToggle = document.getElementById('alternador-oscuro');
    const filterBtns = document.querySelectorAll('.btn-filtro');
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search');
    const tagsInput = document.getElementById('tags-input');
    const sortSelector = document.getElementById('sort-selector');

    // Buttons
    const statsToggle = document.getElementById('stats-toggle');
    const calendarToggle = document.getElementById('calendar-toggle');
    const settingsToggle = document.getElementById('settings-toggle');
    const exportJsonBtn = document.getElementById('export-json');
    const exportCsvBtn = document.getElementById('export-csv');
    const importTasksBtn = document.getElementById('import-tasks');
    const clearCompletedBtn = document.getElementById('clear-completed');

    // Modals
    const calendarModal = document.getElementById('calendar-modal');
    const settingsModal = document.getElementById('settings-modal');
    const taskDetailModal = document.getElementById('task-detail-modal');
    const shareModal = document.getElementById('share-modal');

    // Stats
    const statsDashboard = document.getElementById('stats-dashboard');

    // Pomodoro
    const pomodoroPanel = document.getElementById('pomodoro-panel');
    const timerDisplay = document.getElementById('timer-display');
    const timerStart = document.getElementById('timer-start');
    const timerPause = document.getElementById('timer-pause');
    const timerReset = document.getElementById('timer-reset');
    const sessionCount = document.getElementById('session-count');

    // ========== State ==========
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'todo';
    let isFilterChange = false;
    let searchQuery = '';
    let currentSort = 'manual';
    let allTags = JSON.parse(localStorage.getItem('allTags')) || [];
    let settings = JSON.parse(localStorage.getItem('settings')) || {
        notifications: false,
        notificationTiming: 30,
        sounds: true,
        confetti: true
    };
    let stats = JSON.parse(localStorage.getItem('stats')) || {
        completedToday: 0,
        completedThisWeek: 0,
        totalCompleted: 0,
        streak: 0,
        lastCompletionDate: null
    };
    let pomodoroState = {
        minutes: 25,
        seconds: 0,
        isRunning: false,
        isBreak: false,
        sessions: 0,
        interval: null
    };
    let currentTaskForDetail = null;
    let sortableInstance = null;

    // ========== Data Migration ==========
    function migrateTaskData() {
        let migrated = false;
        tasks = tasks.map(task => {
            if (!task.priority) {
                task.priority = 'medium';
                task.tags = task.tags || [];
                task.subtasks = task.subtasks || [];
                task.notes = task.notes || '';
                task.recurring = task.recurring || { enabled: false, frequency: 'daily' };
                task.pomodoroTime = task.pomodoroTime || 0;
                task.createdAt = task.createdAt || task.id;
                task.completedAt = task.completedAt || null;
                migrated = true;
            }
            return task;
        });
        if (migrated) {
            saveTasks();
        }
    }
    migrateTaskData();

    // ========== Dark Mode ==========
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark');
        document.documentElement.classList.add('dark');
        darkToggle.textContent = '☀️';
    }

    darkToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        document.documentElement.classList.toggle('dark');
        const isDarkMode = document.body.classList.contains('dark');
        darkToggle.textContent = isDarkMode ? '☀️' : '🌙';
        localStorage.setItem('darkMode', isDarkMode);
    });

    // ========== Search ==========
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderTasks();
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        renderTasks();
    });

    // ========== Filters ==========
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('activo'));
            btn.classList.add('activo');
            currentFilter = btn.dataset.filter;
            isFilterChange = true;
            renderTasks();
            isFilterChange = false;
        });
    });

    // ========== Sort ==========
    sortSelector.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderTasks();
    });

    // ========== Add Task ==========
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') return;

        const tags = tagsInput.value.split(',').map(t => t.trim()).filter(t => t);

        // Update all tags
        tags.forEach(tag => {
            if (!allTags.includes(tag)) {
                allTags.push(tag);
            }
        });
        localStorage.setItem('allTags', JSON.stringify(allTags));

        const recurringEnabled = document.getElementById('recurring-enabled')?.checked || false;
        const recurringFreq = document.getElementById('recurring-frequency')?.value || 'daily';

        const newTask = {
            id: Date.now(),
            text: taskText,
            category: categorySelect.value,
            priority: prioritySelect.value,
            dueDate: dueDateInput.value || null,
            completed: false,
            tags: tags,
            subtasks: [],
            notes: '',
            recurring: {
                enabled: recurringEnabled,
                frequency: recurringFreq
            },
            pomodoroTime: 0,
            createdAt: Date.now(),
            completedAt: null
        };

        tasks.unshift(newTask);
        saveTasks();
        renderTasks();

        // Clear inputs
        taskInput.value = '';
        tagsInput.value = '';
        dueDateInput.value = '';

        // Celebration animation
        if (settings.confetti) {
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.6 }
            });
        }
    }

    // ========== Save Tasks ==========
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // ========== Render Tasks ==========
    function renderTasks() {
        if (isFilterChange) {
            taskList.classList.add('fade-out');
            setTimeout(() => {
                renderTasksInternal();
                taskList.classList.remove('fade-out');
            }, 150);
        } else {
            renderTasksInternal();
        }
    }

    function renderTasksInternal() {
        taskList.innerHTML = '';

        let filteredTasks = tasks.filter(task => {
            // Filter logic
            let passFilter = true;
            if (currentFilter === 'pendiente') passFilter = !task.completed;
            else if (currentFilter === 'completado') passFilter = task.completed;
            else if (currentFilter === 'urgente') passFilter = task.category === 'urgente';
            else if (currentFilter === 'high') passFilter = task.priority === 'high';

            // Search logic
            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase();
                const matchText = task.text.toLowerCase().includes(searchLower);
                const matchNotes = task.notes?.toLowerCase().includes(searchLower);
                const matchTags = task.tags?.some(tag => tag.toLowerCase().includes(searchLower));
                passFilter = passFilter && (matchText || matchNotes || matchTags);
            }

            return passFilter;
        });

        // Sort logic
        if (currentSort === 'date') {
            filteredTasks.sort((a, b) => {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            });
        } else if (currentSort === 'priority') {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            filteredTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        } else if (currentSort === 'category') {
            filteredTasks.sort((a, b) => a.category.localeCompare(b.category));
        } else if (currentSort === 'created') {
            filteredTasks.sort((a, b) => b.createdAt - a.createdAt);
        }

        // Move completed to end
        filteredTasks.sort((a, b) => {
            if (a.completed && !b.completed) return 1;
            if (!a.completed && b.completed) return -1;
            return 0;
        });

        filteredTasks.forEach(task => {
            const li = createTaskElement(task);
            taskList.appendChild(li);
            setTimeout(() => li.classList.add('fade-in'), 0);
        });

        // Initialize drag and drop
        if (currentSort === 'manual') {
            initDragAndDrop();
        }
    }

    function createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `elemento-tarea ${task.completed ? 'completado' : ''} priority-${task.priority}`;
        li.dataset.id = task.id;

        // Main content container
        const mainContent = document.createElement('div');
        mainContent.className = 'task-main-content';

        // Category badge
        const categoryBadge = document.createElement('span');
        categoryBadge.className = `insignia-categoria categoria-${task.category}`;
        categoryBadge.textContent = task.category.charAt(0).toUpperCase() + task.category.slice(1);

        // Due date
        const dueDateSpan = document.createElement('span');
        dueDateSpan.className = 'fecha-vencimiento';
        if (task.dueDate) {
            const due = new Date(task.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (due < today && !task.completed) {
                dueDateSpan.classList.add('vencida');
            }
            dueDateSpan.textContent = due.toLocaleDateString();
        } else {
            dueDateSpan.textContent = 'Sin Fecha';
        }

        // Task text
        const taskText = document.createElement('span');
        taskText.className = 'texto-tarea';
        taskText.textContent = task.text;

        // Edit input
        const editInput = document.createElement('input');
        editInput.className = 'entrada-edicion';
        editInput.type = 'text';
        editInput.value = task.text;
        editInput.style.display = 'none';

        // Tags
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'task-tags';
        task.tags?.forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.className = 'task-tag';
            tagSpan.textContent = tag;
            tagsContainer.appendChild(tagSpan);
        });

        // Recurring indicator
        if (task.recurring?.enabled) {
            const recurringSpan = document.createElement('span');
            recurringSpan.className = 'recurring-indicator';
            recurringSpan.textContent = '🔄';
            recurringSpan.title = `Recurrente: ${task.recurring.frequency}`;
            mainContent.appendChild(recurringSpan);
        }

        // Subtasks indicator
        if (task.subtasks?.length > 0) {
            const completedSubtasks = task.subtasks.filter(st => st.completed).length;
            const subtaskSpan = document.createElement('span');
            subtaskSpan.className = 'subtask-indicator';
            subtaskSpan.textContent = `📋 ${completedSubtasks}/${task.subtasks.length}`;
            mainContent.appendChild(subtaskSpan);
        }

        mainContent.appendChild(categoryBadge);
        mainContent.appendChild(dueDateSpan);
        mainContent.appendChild(taskText);
        mainContent.appendChild(editInput);
        mainContent.appendChild(tagsContainer);

        // Buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'task-buttons';

        // Complete button
        const doneBtn = document.createElement('button');
        doneBtn.className = 'btn-tarea';
        doneBtn.innerHTML = task.completed ? '↻' : '✓';
        doneBtn.title = task.completed ? 'Desmarcar' : 'Completar';
        doneBtn.addEventListener('click', () => toggleComplete(task.id));

        // Detail button
        const detailBtn = document.createElement('button');
        detailBtn.className = 'btn-tarea';
        detailBtn.innerHTML = '📝';
        detailBtn.title = 'Detalles';
        detailBtn.addEventListener('click', () => openTaskDetail(task.id));

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'btn-tarea btn-editar';
        editBtn.innerHTML = '✏️';
        editBtn.title = 'Editar';
        editBtn.addEventListener('click', () => enterEditMode(li, task));

        // Save button
        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn-tarea btn-guardar';
        saveBtn.innerHTML = '💾';
        saveBtn.title = 'Guardar';
        saveBtn.style.display = 'none';
        saveBtn.addEventListener('click', () => saveEdit(task.id, editInput.value));

        // Share button
        const shareBtn = document.createElement('button');
        shareBtn.className = 'btn-tarea';
        shareBtn.innerHTML = '🔗';
        shareBtn.title = 'Compartir';
        shareBtn.addEventListener('click', () => shareTask(task.id));

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-tarea';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = 'Eliminar';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        buttonsContainer.appendChild(doneBtn);
        buttonsContainer.appendChild(detailBtn);
        buttonsContainer.appendChild(editBtn);
        buttonsContainer.appendChild(saveBtn);
        buttonsContainer.appendChild(shareBtn);
        buttonsContainer.appendChild(deleteBtn);

        li.appendChild(mainContent);
        li.appendChild(buttonsContainer);

        editInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveEdit(task.id, editInput.value);
        });

        return li;
    }

    // ========== Task Actions ==========
    function toggleComplete(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;

            if (task.completed) {
                task.completedAt = Date.now();
                updateStats(true);

                // Celebration
                if (settings.confetti) {
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                }

                // Handle recurring tasks
                if (task.recurring?.enabled) {
                    createRecurringTask(task);
                }
            } else {
                task.completedAt = null;
                updateStats(false);
            }

            saveTasks();
            renderTasks();
        }
    }

    function createRecurringTask(originalTask) {
        const newDueDate = calculateNextDueDate(originalTask.dueDate, originalTask.recurring.frequency);

        const newTask = {
            ...originalTask,
            id: Date.now(),
            completed: false,
            dueDate: newDueDate,
            completedAt: null,
            createdAt: Date.now(),
            subtasks: originalTask.subtasks.map(st => ({ ...st, completed: false }))
        };

        tasks.unshift(newTask);
        saveTasks();
    }

    function calculateNextDueDate(currentDate, frequency) {
        if (!currentDate) return null;

        const date = new Date(currentDate);
        switch (frequency) {
            case 'daily':
                date.setDate(date.getDate() + 1);
                break;
            case 'weekly':
                date.setDate(date.getDate() + 7);
                break;
            case 'monthly':
                date.setMonth(date.getMonth() + 1);
                break;
        }
        return date.toISOString().split('T')[0];
    }

    function enterEditMode(li, task) {
        li.classList.add('modo-edicion');
        const editInput = li.querySelector('.entrada-edicion');
        editInput.focus();
    }

    function saveEdit(id, newText) {
        if (newText.trim() === '') return;
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.text = newText.trim();
            saveTasks();
            renderTasks();
        }
    }

    function deleteTask(id) {
        if (confirm('¿Estás seguro de eliminar esta tarea?')) {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks();
            updateStatsDashboard();
        }
    }

    function shareTask(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            const shareData = {
                text: task.text,
                category: task.category,
                priority: task.priority,
                dueDate: task.dueDate,
                tags: task.tags
            };

            const shareLink = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(shareData))}`;
            document.getElementById('share-link-input').value = shareLink;
            shareModal.classList.remove('hidden');
        }
    }

    // ========== Task Detail Modal ==========
    function openTaskDetail(id) {
        currentTaskForDetail = tasks.find(t => t.id === id);
        if (!currentTaskForDetail) return;

        // Load notes
        document.getElementById('task-notes').value = currentTaskForDetail.notes || '';

        // Load subtasks
        renderSubtasks();

        taskDetailModal.classList.remove('hidden');
    }

    function renderSubtasks() {
        const subtasksList = document.getElementById('subtasks-list');
        subtasksList.innerHTML = '';

        currentTaskForDetail.subtasks?.forEach((subtask, index) => {
            const subtaskDiv = document.createElement('div');
            subtaskDiv.className = `subtask-item ${subtask.completed ? 'completed' : ''}`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = subtask.completed;
            checkbox.addEventListener('change', () => {
                currentTaskForDetail.subtasks[index].completed = checkbox.checked;
                updateSubtaskProgress();
                saveTasks();
                renderSubtasks();
            });

            const text = document.createElement('span');
            text.className = 'subtask-text';
            text.textContent = subtask.text;

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-tarea';
            deleteBtn.innerHTML = '✕';
            deleteBtn.addEventListener('click', () => {
                currentTaskForDetail.subtasks.splice(index, 1);
                saveTasks();
                renderSubtasks();
            });

            subtaskDiv.appendChild(checkbox);
            subtaskDiv.appendChild(text);
            subtaskDiv.appendChild(deleteBtn);
            subtasksList.appendChild(subtaskDiv);
        });

        updateSubtaskProgress();
    }

    function updateSubtaskProgress() {
        const total = currentTaskForDetail.subtasks?.length || 0;
        const completed = currentTaskForDetail.subtasks?.filter(st => st.completed).length || 0;
        const percentage = total > 0 ? (completed / total) * 100 : 0;

        document.getElementById('subtask-progress-fill').style.width = `${percentage}%`;
        document.getElementById('subtask-progress-text').textContent = `${Math.round(percentage)}% (${completed}/${total})`;

        // Auto-complete parent task if all subtasks done
        if (total > 0 && completed === total && !currentTaskForDetail.completed) {
            currentTaskForDetail.completed = true;
            saveTasks();
            renderTasks();
        }
    }

    document.getElementById('add-subtask')?.addEventListener('click', () => {
        const input = document.getElementById('subtask-input');
        const text = input.value.trim();
        if (text) {
            if (!currentTaskForDetail.subtasks) currentTaskForDetail.subtasks = [];
            currentTaskForDetail.subtasks.push({
                id: Date.now(),
                text: text,
                completed: false
            });
            input.value = '';
            saveTasks();
            renderSubtasks();
        }
    });

    document.getElementById('save-task-details')?.addEventListener('click', () => {
        currentTaskForDetail.notes = document.getElementById('task-notes').value;
        saveTasks();
        renderTasks();
        taskDetailModal.classList.add('hidden');
    });

    // ========== Statistics ==========
    function updateStats(completed) {
        const today = new Date().toDateString();

        if (completed) {
            stats.totalCompleted++;

            // Check if today
            if (stats.lastCompletionDate === today) {
                stats.completedToday++;
            } else {
                stats.completedToday = 1;

                // Update streak
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                if (stats.lastCompletionDate === yesterday.toDateString()) {
                    stats.streak++;
                } else {
                    stats.streak = 1;
                }
            }

            stats.lastCompletionDate = today;

            // Week calculation
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            stats.completedThisWeek = tasks.filter(t =>
                t.completed && t.completedAt && new Date(t.completedAt) > weekAgo
            ).length;
        }

        localStorage.setItem('stats', JSON.stringify(stats));
        updateStatsDashboard();
    }

    function updateStatsDashboard() {
        document.getElementById('stat-today').textContent = stats.completedToday;
        document.getElementById('stat-week').textContent = stats.completedThisWeek;
        document.getElementById('stat-total').textContent = stats.totalCompleted;
        document.getElementById('stat-streak').textContent = `🔥 ${stats.streak}`;
    }

    statsToggle?.addEventListener('click', () => {
        statsDashboard.classList.toggle('hidden');
        updateStatsDashboard();
    });

    // ========== Pomodoro Timer ==========
    function updateTimerDisplay() {
        const mins = String(pomodoroState.minutes).padStart(2, '0');
        const secs = String(pomodoroState.seconds).padStart(2, '0');
        timerDisplay.textContent = `${mins}:${secs}`;
    }

    timerStart?.addEventListener('click', () => {
        if (!pomodoroState.isRunning) {
            pomodoroState.isRunning = true;
            timerStart.classList.add('hidden');
            timerPause.classList.remove('hidden');

            pomodoroState.interval = setInterval(() => {
                if (pomodoroState.seconds === 0) {
                    if (pomodoroState.minutes === 0) {
                        // Timer complete
                        clearInterval(pomodoroState.interval);
                        pomodoroState.isRunning = false;
                        timerStart.classList.remove('hidden');
                        timerPause.classList.add('hidden');

                        if (!pomodoroState.isBreak) {
                            pomodoroState.sessions++;
                            sessionCount.textContent = `Sesiones: ${pomodoroState.sessions}`;
                            alert('¡Pomodoro completado! Toma un descanso de 5 minutos.');
                            pomodoroState.minutes = 5;
                            pomodoroState.isBreak = true;
                        } else {
                            alert('¡Descanso terminado! Listo para otro Pomodoro.');
                            pomodoroState.minutes = 25;
                            pomodoroState.isBreak = false;
                        }
                        updateTimerDisplay();
                        return;
                    }
                    pomodoroState.minutes--;
                    pomodoroState.seconds = 59;
                } else {
                    pomodoroState.seconds--;
                }
                updateTimerDisplay();
            }, 1000);
        }
    });

    timerPause?.addEventListener('click', () => {
        clearInterval(pomodoroState.interval);
        pomodoroState.isRunning = false;
        timerStart.classList.remove('hidden');
        timerPause.classList.add('hidden');
    });

    timerReset?.addEventListener('click', () => {
        clearInterval(pomodoroState.interval);
        pomodoroState.isRunning = false;
        pomodoroState.minutes = 25;
        pomodoroState.seconds = 0;
        pomodoroState.isBreak = false;
        timerStart.classList.remove('hidden');
        timerPause.classList.add('hidden');
        updateTimerDisplay();
    });

    // ========== Drag and Drop ==========
    function initDragAndDrop() {
        if (sortableInstance) {
            sortableInstance.destroy();
        }

        sortableInstance = Sortable.create(taskList, {
            animation: 150,
            ghostClass: 'dragging',
            onEnd: function (evt) {
                const movedTask = tasks.splice(evt.oldIndex, 1)[0];
                tasks.splice(evt.newIndex, 0, movedTask);
                saveTasks();
            }
        });
    }

    // ========== Export/Import ==========
    exportJsonBtn?.addEventListener('click', () => {
        const dataStr = JSON.stringify(tasks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tasks-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });

    exportCsvBtn?.addEventListener('click', () => {
        // UTF-8 BOM para que Excel reconozca los acentos
        const BOM = '\uFEFF';
        let csv = BOM + 'Tarea;Categoría;Prioridad;Fecha;Completada;Etiquetas\n';
        tasks.forEach(task => {
            csv += `"${task.text}";"${task.category}";"${task.priority}";"${task.dueDate || ''}";"${task.completed}";"${task.tags?.join('|') || ''}"\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tasks-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });

    importTasksBtn?.addEventListener('click', () => {
        document.getElementById('file-input').click();
    });

    document.getElementById('file-input')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedTasks = JSON.parse(event.target.result);
                    if (confirm(`¿Importar ${importedTasks.length} tareas? Esto se agregará a las tareas existentes.`)) {
                        tasks = [...tasks, ...importedTasks];
                        saveTasks();
                        renderTasks();
                        alert('Tareas importadas exitosamente!');
                    }
                } catch (error) {
                    alert('Error al importar archivo. Asegúrate de que sea un archivo JSON válido.');
                }
            };
            reader.readAsText(file);
        }
    });

    clearCompletedBtn?.addEventListener('click', () => {
        if (confirm('¿Eliminar todas las tareas completadas?')) {
            tasks = tasks.filter(t => !t.completed);
            saveTasks();
            renderTasks();
        }
    });

    // ========== Calendar ==========
    let currentCalendarDate = new Date();

    calendarToggle?.addEventListener('click', () => {
        calendarModal.classList.remove('hidden');
        renderCalendar();
    });

    function renderCalendar() {
        const year = currentCalendarDate.getFullYear();
        const month = currentCalendarDate.getMonth();

        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        document.getElementById('current-month').textContent = `${monthNames[month]} ${year}`;

        const calendarGrid = document.getElementById('calendar-grid');
        calendarGrid.innerHTML = '';

        // Day headers
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        dayNames.forEach(day => {
            const header = document.createElement('div');
            header.className = 'calendar-day-header';
            header.textContent = day;
            calendarGrid.appendChild(header);
        });

        // Get first day of month
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Empty cells
        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement('div');
            calendarGrid.appendChild(empty);
        }

        // Days
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar-day';

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const tasksOnDay = tasks.filter(t => t.dueDate === dateStr);

            if (tasksOnDay.length > 0) {
                dayDiv.classList.add('has-tasks');
            }

            if (today.getDate() === day && today.getMonth() === month && today.getFullYear() === year) {
                dayDiv.classList.add('today');
            }

            dayDiv.innerHTML = `
                <div>${day}</div>
                ${tasksOnDay.length > 0 ? `<div class="task-count">${tasksOnDay.length} tareas</div>` : ''}
            `;

            dayDiv.addEventListener('click', () => {
                dueDateInput.value = dateStr;
                calendarModal.classList.add('hidden');
            });

            calendarGrid.appendChild(dayDiv);
        }
    }

    document.getElementById('prev-month')?.addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('next-month')?.addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderCalendar();
    });

    // ========== Settings ==========
    settingsToggle?.addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
        loadSettings();
    });

    function loadSettings() {
        document.getElementById('enable-notifications').checked = settings.notifications;
        document.getElementById('notification-timing').value = settings.notificationTiming;
        document.getElementById('enable-sounds').checked = settings.sounds;
        document.getElementById('enable-confetti').checked = settings.confetti;
    }

    document.getElementById('enable-notifications')?.addEventListener('change', (e) => {
        settings.notifications = e.target.checked;
        if (settings.notifications) {
            requestNotificationPermission();
        }
        localStorage.setItem('settings', JSON.stringify(settings));
    });

    document.getElementById('notification-timing')?.addEventListener('change', (e) => {
        settings.notificationTiming = parseInt(e.target.value);
        localStorage.setItem('settings', JSON.stringify(settings));
    });

    document.getElementById('enable-sounds')?.addEventListener('change', (e) => {
        settings.sounds = e.target.checked;
        localStorage.setItem('settings', JSON.stringify(settings));
    });

    document.getElementById('enable-confetti')?.addEventListener('change', (e) => {
        settings.confetti = e.target.checked;
        localStorage.setItem('settings', JSON.stringify(settings));
    });

    function requestNotificationPermission() {
        if ('Notification' in window) {
            Notification.requestPermission();
        }
    }

    // Check for due tasks
    setInterval(() => {
        if (settings.notifications && Notification.permission === 'granted') {
            const now = new Date();
            tasks.forEach(task => {
                if (!task.completed && task.dueDate) {
                    const dueDate = new Date(task.dueDate);
                    const diffMinutes = (dueDate - now) / (1000 * 60);

                    if (diffMinutes > 0 && diffMinutes <= settings.notificationTiming) {
                        new Notification('Tarea próxima a vencer', {
                            body: task.text,
                            icon: '📝'
                        });
                    }
                }
            });
        }
    }, 60000); // Check every minute

    document.getElementById('backup-data')?.addEventListener('click', () => {
        const backup = {
            tasks,
            stats,
            settings,
            allTags,
            version: '1.0'
        };
        const dataStr = JSON.stringify(backup, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `todo-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    });

    document.getElementById('restore-data')?.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const backup = JSON.parse(event.target.result);
                    if (confirm('¿Restaurar datos? Esto sobrescribirá todos los datos actuales.')) {
                        tasks = backup.tasks || [];
                        stats = backup.stats || stats;
                        settings = backup.settings || settings;
                        allTags = backup.allTags || [];

                        saveTasks();
                        localStorage.setItem('stats', JSON.stringify(stats));
                        localStorage.setItem('settings', JSON.stringify(settings));
                        localStorage.setItem('allTags', JSON.stringify(allTags));

                        renderTasks();
                        updateStatsDashboard();
                        alert('Datos restaurados exitosamente!');
                    }
                } catch (error) {
                    alert('Error al restaurar datos.');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    });

    // ========== Modal Close Handlers ==========
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').classList.add('hidden');
        });
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });

    // ========== Copy Share Link ==========
    document.getElementById('copy-link')?.addEventListener('click', () => {
        const input = document.getElementById('share-link-input');
        input.select();
        document.execCommand('copy');
        alert('Enlace copiado al portapapeles!');
    });

    // ========== Initial Render ==========
    renderTasks();
    updateStatsDashboard();
    updateTimerDisplay();
});
