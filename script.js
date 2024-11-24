document.addEventListener('DOMContentLoaded', () => {
    // Initialize tasks with some example data
    const defaultTasks = [
        {
            id: 1,
            title: "Work out",
            category: "personal",
            time: "8:00 am",
            date: new Date().toISOString(),
            completed: false
        },
        {
            id: 2,
            title: "Design team meeting",
            category: "work",
            time: "2:30 pm",
            date: new Date().toISOString(),
            completed: false
        },
        {
            id: 3,
            title: "Hand off the project",
            category: "freelance",
            time: "7:00 pm",
            date: new Date().toISOString(),
            completed: false
        },
        {
            id: 4,
            title: "Read 5 pages of \"sprint\"",
            category: "personal",
            time: "10:30 pm",
            date: new Date().toISOString(),
            completed: false
        }
    ];

    let tasks = JSON.parse(localStorage.getItem('tasks')) || defaultTasks;
    let currentCategory = 'all';
    let currentView = 'today';

    const taskList = document.getElementById('taskList');
    const searchInput = document.getElementById('searchInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const categoryBtns = document.querySelectorAll('.category-btn');
    const scheduledTasksBtn = document.getElementById('scheduledTasksBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    const taskView = document.getElementById('taskView');
    const notificationsToggle = document.getElementById('notificationsToggle');

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function formatTime(timeStr) {
        const [hours, minutes] = timeStr.split(':');
        const date = new Date();
        date.setHours(parseInt(hours));
        date.setMinutes(parseInt(minutes));
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).toLowerCase();
    }

    function renderTasks() {
        const filteredTasks = tasks.filter(task => {
            const matchesCategory = currentCategory === 'all' || task.category === currentCategory;
            const matchesSearch = task.title.toLowerCase().includes(searchInput.value.toLowerCase());
            const matchesView = currentView === 'today' 
                ? new Date(task.date).toDateString() === new Date().toDateString()
                : true;
            return matchesCategory && matchesSearch && matchesView;
        });

        if (currentView === 'scheduled') {
            // Group tasks by date
            const groupedTasks = filteredTasks.reduce((groups, task) => {
                const date = new Date(task.date).toDateString();
                if (!groups[date]) {
                    groups[date] = [];
                }
                groups[date].push(task);
                return groups;
            }, {});

            taskList.innerHTML = Object.entries(groupedTasks).map(([date, tasks]) => `
                <h3 class="date-header">${date}</h3>
                ${tasks.map(task => createTaskHTML(task)).join('')}
            `).join('');
        } else {
            taskList.innerHTML = filteredTasks.map(task => createTaskHTML(task)).join('');
        }

        // Add event listeners
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', toggleTaskCompletion);
        });

        document.querySelectorAll('.delete-task').forEach(button => {
            button.addEventListener('click', deleteTask);
        });
    }

    function createTaskHTML(task) {
        return `
            <div class="task-item">
                <div class="task-item-left">
                    <input type="checkbox" class="task-checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
                    <span class="task-title ${task.completed ? 'completed' : ''}">${task.title}</span>
                    <span class="task-category">${task.category}</span>
                </div>
                <div class="task-item-right">
                    <span class="task-time">${formatTime(task.time)}</span>
                    <button class="delete-task" data-id="${task.id}">×</button>
                </div>
            </div>
        `;
    }

    function toggleTaskCompletion(e) {
        const taskId = parseInt(e.target.dataset.id);
        tasks = tasks.map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        saveTasks();
        renderTasks();
    }

    function deleteTask(e) {
        const taskId = parseInt(e.target.dataset.id);
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
    }

    searchInput.addEventListener('input', renderTasks);

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            renderTasks();
        });
    });

    scheduledTasksBtn.addEventListener('click', () => {
        currentView = 'scheduled';
        document.querySelector('h1').textContent = 'Scheduled Tasks';
        document.querySelector('h2').textContent = 'All upcoming tasks';
        settingsPanel.classList.add('hidden');
        taskView.classList.remove('hidden');
        renderTasks();
    });

    settingsBtn.addEventListener('click', () => {
        settingsPanel.classList.remove('hidden');
        taskView.classList.add('hidden');
    });

    // Save notifications state
    notificationsToggle.addEventListener('change', (e) => {
        localStorage.setItem('notifications', e.target.checked);
    });

    // Load notifications state
    notificationsToggle.checked = localStorage.getItem('notifications') !== 'false';

    // Initial render
    renderTasks();
});