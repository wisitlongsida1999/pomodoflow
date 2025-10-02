// ===== POMODORO FLOW - MAIN APPLICATION =====

class PomodoFlow {
  constructor() {
    // App state
    this.state = {
      currentMode: 'work', // 'work', 'short-break', 'long-break'
      timeRemaining: 25 * 60, // seconds
      isRunning: false,
      isPaused: false,
      currentTask: null,
      pomodoroCount: 0,
      completedPomodoros: 0,
      tasks: [],
      settings: {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        longBreakInterval: 4,
        enableNotifications: true,
        enableSounds: true,
        soundVolume: 50,
        autoStartBreaks: false,
        autoStartPomodoros: false
      },
      stats: {
        todayPomodoros: 0,
        weekPomodoros: 0,
        todayFocusTime: 0,
        tasksCompleted: 0,
        weeklyData: [0, 0, 0, 0, 0, 0, 0] // Mon-Sun
      }
    };

    // Timer interval
    this.timerInterval = null;
    
    // Audio contexts
    this.audioContext = null;
    this.tickSound = null;
    this.alarmSound = null;

    // Initialize the app
    this.init();
  }

  // ===== INITIALIZATION =====
  init() {
    this.loadDataFromStorage();
    this.initializeElements();
    this.bindEvents();
    this.updateDisplay();
    this.requestNotificationPermission();
    this.initializeAudio();
    
    // Update daily stats
    this.updateDailyStats();
    
    // Auto-save every 30 seconds
    setInterval(() => this.saveDataToStorage(), 30000);
  }

  initializeElements() {
    // Timer elements
    this.timeDisplay = document.getElementById('timeDisplay');
    this.timeLabel = document.getElementById('timeLabel');
    this.progressBar = document.getElementById('progressBar');
    this.currentTaskName = document.getElementById('currentTaskName');
    this.pomodoroCountDisplay = document.getElementById('pomodoroCount');

    // Mode buttons
    this.modeButtons = document.querySelectorAll('.mode-btn');
    
    // Control buttons
    this.startPauseBtn = document.getElementById('startPauseBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.skipBtn = document.getElementById('skipBtn');

    // Task elements
    this.taskInput = document.getElementById('taskInput');
    this.pomodoroEstimate = document.getElementById('pomodoroEstimate');
    this.addTaskBtn = document.getElementById('addTaskBtn');
    this.tasksList = document.getElementById('tasksList');
    this.emptyState = document.getElementById('emptyState');

    // Header controls
    this.themeToggle = document.getElementById('themeToggle');
    this.settingsBtn = document.getElementById('settingsBtn');
    this.statsBtn = document.getElementById('statsBtn');

    // Modals
    this.settingsModal = document.getElementById('settingsModal');
    this.statsModal = document.getElementById('statsModal');
    
    // Notification
    this.notification = document.getElementById('notification');
  }

  bindEvents() {
    // Mode buttons
    this.modeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.switchMode(e.target.closest('.mode-btn').dataset.mode));
    });

    // Timer controls
    this.startPauseBtn.addEventListener('click', () => this.toggleTimer());
    this.resetBtn.addEventListener('click', () => this.resetTimer());
    this.skipBtn.addEventListener('click', () => this.skipTimer());

    // Task management
    this.addTaskBtn.addEventListener('click', () => this.addTask());
    this.taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTask();
    });

    // Estimate controls
    document.getElementById('increaseEstimate').addEventListener('click', () => this.adjustEstimate(1));
    document.getElementById('decreaseEstimate').addEventListener('click', () => this.adjustEstimate(-1));

    // Header controls
    this.themeToggle.addEventListener('click', () => this.toggleTheme());
    this.settingsBtn.addEventListener('click', () => this.openSettings());
    this.statsBtn.addEventListener('click', () => this.openStats());

    // Task actions
    document.getElementById('clearCompletedBtn').addEventListener('click', () => this.clearCompletedTasks());
    document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAllTasks());

    // Modal controls
    this.bindModalEvents();

    // Settings events
    this.bindSettingsEvents();

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

    // Prevent app from sleeping during timer
    this.bindVisibilityEvents();
  }

  bindModalEvents() {
    // Settings modal
    document.getElementById('closeSettingsBtn').addEventListener('click', () => this.closeModal('settingsModal'));
    document.getElementById('saveSettingsBtn').addEventListener('click', () => this.saveSettings());
    document.getElementById('resetSettingsBtn').addEventListener('click', () => this.resetSettings());

    // Stats modal
    document.getElementById('closeStatsBtn').addEventListener('click', () => this.closeModal('statsModal'));

    // Close modals on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal(modal.id);
      });
    });
  }

  bindSettingsEvents() {
    // Volume slider
    const volumeSlider = document.getElementById('soundVolume');
    const volumeDisplay = document.querySelector('.volume-display');
    
    volumeSlider.addEventListener('input', (e) => {
      volumeDisplay.textContent = `${e.target.value}%`;
    });

    // Timer duration changes
    ['workDuration', 'shortBreakDuration', 'longBreakDuration'].forEach(id => {
      document.getElementById(id).addEventListener('change', () => {
        if (!this.isRunning) {
          this.updateTimerFromSettings();
        }
      });
    });
  }

  bindVisibilityEvents() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.isRunning) {
        // Store timestamp when page becomes hidden
        this.hiddenTimestamp = Date.now();
      } else if (!document.hidden && this.hiddenTimestamp && this.isRunning) {
        // Calculate time elapsed while hidden and adjust timer
        const elapsedTime = Math.floor((Date.now() - this.hiddenTimestamp) / 1000);
        this.timeRemaining = Math.max(0, this.timeRemaining - elapsedTime);
        this.hiddenTimestamp = null;
        
        if (this.timeRemaining <= 0) {
          this.completeTimer();
        } else {
          this.updateDisplay();
        }
      }
    });
  }

  // ===== TIMER FUNCTIONALITY =====
  switchMode(mode) {
    if (this.isRunning) {
      this.showNotification('⏸️', 'Please pause the timer before switching modes');
      return;
    }

    this.state.currentMode = mode;
    this.updateModeButtons();
    this.updateTimerFromSettings();
    this.updateDisplay();
  }

  updateModeButtons() {
    this.modeButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === this.state.currentMode);
    });
  }

  updateTimerFromSettings() {
    const durations = {
      'work': this.state.settings.workDuration,
      'short-break': this.state.settings.shortBreakDuration,
      'long-break': this.state.settings.longBreakDuration
    };

    this.state.timeRemaining = durations[this.state.currentMode] * 60;
    this.updateDisplay();
  }

  toggleTimer() {
    if (this.state.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    // Select a task if none is selected and tasks exist
    if (!this.state.currentTask && this.state.tasks.length > 0) {
      const incompleteTasks = this.state.tasks.filter(task => !task.completed);
      if (incompleteTasks.length > 0) {
        this.selectTask(incompleteTasks[0].id);
      }
    }

    this.state.isRunning = true;
    this.state.isPaused = false;
    
    this.startPauseBtn.innerHTML = `
      <span class="btn-icon">⏸️</span>
      <span class="btn-text">Pause</span>
    `;

    this.updateTimeLabel();
    this.startTimerInterval();
    this.playTickSound();
    
    // Show notification
    const modeText = this.getModeText();
    this.showNotification('▶️', `${modeText} started!`);
  }

  pauseTimer() {
    this.state.isRunning = false;
    this.state.isPaused = true;
    
    this.startPauseBtn.innerHTML = `
      <span class="btn-icon">▶️</span>
      <span class="btn-text">Start</span>
    `;

    this.clearTimerInterval();
    this.stopTickSound();
    this.updateTimeLabel();
    
    this.showNotification('⏸️', 'Timer paused');
  }

  resetTimer() {
    this.clearTimerInterval();
    this.state.isRunning = false;
    this.state.isPaused = false;
    
    this.startPauseBtn.innerHTML = `
      <span class="btn-icon">▶️</span>
      <span class="btn-text">Start</span>
    `;

    this.updateTimerFromSettings();
    this.stopTickSound();
    this.updateDisplay();
    
    this.showNotification('🔄', 'Timer reset');
  }

  skipTimer() {
    if (this.state.isRunning || this.state.isPaused) {
      this.completeTimer();
      this.showNotification('⏭️', 'Timer skipped');
    }
  }

  startTimerInterval() {
    this.timerInterval = setInterval(() => {
      this.state.timeRemaining--;
      
      if (this.state.timeRemaining <= 0) {
        this.completeTimer();
      } else {
        this.updateDisplay();
      }
    }, 1000);
  }

  clearTimerInterval() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  completeTimer() {
    this.clearTimerInterval();
    this.state.isRunning = false;
    this.state.isPaused = false;
    
    this.startPauseBtn.innerHTML = `
      <span class="btn-icon">▶️</span>
      <span class="btn-text">Start</span>
    `;

    this.stopTickSound();
    this.playAlarmSound();

    if (this.state.currentMode === 'work') {
      this.handleWorkCompletion();
    } else {
      this.handleBreakCompletion();
    }

    this.updateStats();
    this.saveDataToStorage();
  }

  handleWorkCompletion() {
    this.state.completedPomodoros++;
    
    // Update current task
    if (this.state.currentTask) {
      const task = this.state.tasks.find(t => t.id === this.state.currentTask);
      if (task) {
        task.completedPomodoros++;
        task.lastWorkedOn = new Date().toISOString();
        
        // Check if task is completed
        if (task.completedPomodoros >= task.estimatedPomodoros) {
          task.completed = true;
          task.completedAt = new Date().toISOString();
          this.state.stats.tasksCompleted++;
          this.showNotification('🎉', `Task "${task.title}" completed!`);
        }
      }
    }

    // Send notification
    this.sendNotification('🍅 Work Session Complete!', 'Great job! Time for a break.');
    this.showNotification('🍅', 'Work session completed!');

    // Auto-start break if enabled
    const isLongBreak = this.state.completedPomodoros % this.state.settings.longBreakInterval === 0;
    const nextMode = isLongBreak ? 'long-break' : 'short-break';
    
    this.switchMode(nextMode);
    
    if (this.state.settings.autoStartBreaks) {
      setTimeout(() => this.startTimer(), 2000);
    }
  }

  handleBreakCompletion() {
    this.sendNotification('☕ Break Complete!', 'Ready to get back to work?');
    this.showNotification('☕', 'Break completed!');

    // Switch back to work mode
    this.switchMode('work');
    
    if (this.state.settings.autoStartPomodoros) {
      setTimeout(() => this.startTimer(), 2000);
    }
  }

  // ===== TASK MANAGEMENT =====
  addTask() {
    const title = this.taskInput.value.trim();
    const estimate = parseInt(this.pomodoroEstimate.value);
    
    if (!title) {
      this.showNotification('⚠️', 'Please enter a task title');
      return;
    }

    const task = {
      id: Date.now().toString(),
      title,
      estimatedPomodoros: estimate,
      completedPomodoros: 0,
      completed: false,
      createdAt: new Date().toISOString(),
      lastWorkedOn: null,
      completedAt: null
    };

    this.state.tasks.unshift(task);
    this.taskInput.value = '';
    this.pomodoroEstimate.value = 1;
    
    this.renderTasks();
    this.saveDataToStorage();
    
    this.showNotification('➕', 'Task added successfully');
  }

  selectTask(taskId) {
    this.state.currentTask = taskId;
    this.updateCurrentTaskDisplay();
    this.renderTasks();
  }

  toggleTaskCompletion(taskId) {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      if (task.completed) {
        task.completedAt = new Date().toISOString();
        this.state.stats.tasksCompleted++;
      } else {
        task.completedAt = null;
        this.state.stats.tasksCompleted--;
      }
      
      this.renderTasks();
      this.saveDataToStorage();
    }
  }

  deleteTask(taskId) {
    if (this.state.currentTask === taskId) {
      this.state.currentTask = null;
    }
    
    this.state.tasks = this.state.tasks.filter(t => t.id !== taskId);
    this.renderTasks();
    this.updateCurrentTaskDisplay();
    this.saveDataToStorage();
    
    this.showNotification('🗑️', 'Task deleted');
  }

  editTask(taskId) {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const newTitle = prompt('Edit task title:', task.title);
    if (newTitle && newTitle.trim()) {
      task.title = newTitle.trim();
      this.renderTasks();
      this.updateCurrentTaskDisplay();
      this.saveDataToStorage();
    }
  }

  adjustEstimate(delta) {
    const input = this.pomodoroEstimate;
    const currentValue = parseInt(input.value);
    const newValue = Math.max(1, Math.min(20, currentValue + delta));
    input.value = newValue;
  }

  clearCompletedTasks() {
    const completedCount = this.state.tasks.filter(t => t.completed).length;
    if (completedCount === 0) {
      this.showNotification('ℹ️', 'No completed tasks to clear');
      return;
    }

    if (confirm(`Clear ${completedCount} completed task(s)?`)) {
      this.state.tasks = this.state.tasks.filter(t => !t.completed);
      this.renderTasks();
      this.saveDataToStorage();
      this.showNotification('🗑️', `${completedCount} completed tasks cleared`);
    }
  }

  clearAllTasks() {
    if (this.state.tasks.length === 0) {
      this.showNotification('ℹ️', 'No tasks to clear');
      return;
    }

    if (confirm('Clear all tasks? This cannot be undone.')) {
      this.state.tasks = [];
      this.state.currentTask = null;
      this.renderTasks();
      this.updateCurrentTaskDisplay();
      this.saveDataToStorage();
      this.showNotification('🗑️', 'All tasks cleared');
    }
  }

  renderTasks() {
    if (this.state.tasks.length === 0) {
      this.tasksList.style.display = 'none';
      this.emptyState.style.display = 'block';
      return;
    }

    this.tasksList.style.display = 'block';
    this.emptyState.style.display = 'none';

    this.tasksList.innerHTML = this.state.tasks.map(task => `
      <div class="task-item ${task.id === this.state.currentTask ? 'active' : ''} ${task.completed ? 'completed' : ''}" 
           data-task-id="${task.id}">
        <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
             onclick="app.toggleTaskCompletion('${task.id}')"></div>
        <div class="task-content" onclick="app.selectTask('${task.id}')">
          <div class="task-title">${this.escapeHtml(task.title)}</div>
          <div class="task-meta">
            <span>🍅 ${task.completedPomodoros}/${task.estimatedPomodoros}</span>
            ${task.lastWorkedOn ? `<span>Last: ${this.formatRelativeTime(task.lastWorkedOn)}</span>` : ''}
          </div>
        </div>
        <div class="task-actions">
          <button class="task-action-btn" onclick="app.editTask('${task.id}')" title="Edit">✏️</button>
          <button class="task-action-btn delete" onclick="app.deleteTask('${task.id}')" title="Delete">🗑️</button>
        </div>
      </div>
    `).join('');
  }

  // ===== SETTINGS =====
  openSettings() {
    this.populateSettings();
    this.openModal('settingsModal');
  }

  populateSettings() {
    document.getElementById('workDuration').value = this.state.settings.workDuration;
    document.getElementById('shortBreakDuration').value = this.state.settings.shortBreakDuration;
    document.getElementById('longBreakDuration').value = this.state.settings.longBreakDuration;
    document.getElementById('longBreakInterval').value = this.state.settings.longBreakInterval;
    document.getElementById('enableNotifications').checked = this.state.settings.enableNotifications;
    document.getElementById('enableSounds').checked = this.state.settings.enableSounds;
    document.getElementById('soundVolume').value = this.state.settings.soundVolume;
    document.getElementById('autoStartBreaks').checked = this.state.settings.autoStartBreaks;
    document.getElementById('autoStartPomodoros').checked = this.state.settings.autoStartPomodoros;
    
    document.querySelector('.volume-display').textContent = `${this.state.settings.soundVolume}%`;
  }

  saveSettings() {
    this.state.settings = {
      workDuration: parseInt(document.getElementById('workDuration').value),
      shortBreakDuration: parseInt(document.getElementById('shortBreakDuration').value),
      longBreakDuration: parseInt(document.getElementById('longBreakDuration').value),
      longBreakInterval: parseInt(document.getElementById('longBreakInterval').value),
      enableNotifications: document.getElementById('enableNotifications').checked,
      enableSounds: document.getElementById('enableSounds').checked,
      soundVolume: parseInt(document.getElementById('soundVolume').value),
      autoStartBreaks: document.getElementById('autoStartBreaks').checked,
      autoStartPomodoros: document.getElementById('autoStartPomodoros').checked
    };

    if (!this.state.isRunning) {
      this.updateTimerFromSettings();
    }

    this.saveDataToStorage();
    this.closeModal('settingsModal');
    this.showNotification('💾', 'Settings saved');
  }

  resetSettings() {
    if (confirm('Reset all settings to defaults?')) {
      this.state.settings = {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        longBreakInterval: 4,
        enableNotifications: true,
        enableSounds: true,
        soundVolume: 50,
        autoStartBreaks: false,
        autoStartPomodoros: false
      };

      this.populateSettings();
      this.showNotification('🔄', 'Settings reset to defaults');
    }
  }

  // ===== STATISTICS =====
  openStats() {
    this.updateStatsDisplay();
    this.openModal('statsModal');
    this.renderWeeklyChart();
  }

  updateStats() {
    if (this.state.currentMode === 'work') {
      this.state.stats.todayPomodoros++;
      this.state.stats.weekPomodoros++;
      this.state.stats.todayFocusTime += this.state.settings.workDuration;
      
      // Update weekly data (current day)
      const today = new Date().getDay();
      const mondayIndex = today === 0 ? 6 : today - 1; // Convert Sunday=0 to Monday=0
      this.state.stats.weeklyData[mondayIndex]++;
    }
  }

  updateStatsDisplay() {
    document.getElementById('todayPomodoros').textContent = this.state.stats.todayPomodoros;
    document.getElementById('weekPomodoros').textContent = this.state.stats.weekPomodoros;
    document.getElementById('todayFocusTime').textContent = this.formatTime(this.state.stats.todayFocusTime * 60);
    document.getElementById('tasksCompleted').textContent = this.state.stats.tasksCompleted;
  }

  renderWeeklyChart() {
    const canvas = document.getElementById('weeklyChart');
    const ctx = canvas.getContext('2d');
    const data = this.state.stats.weeklyData;
    const max = Math.max(...data, 1);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Chart dimensions
    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    const barWidth = chartWidth / 7;
    
    // Draw bars
    data.forEach((value, index) => {
      const barHeight = (value / max) * chartHeight;
      const x = padding + index * barWidth;
      const y = padding + chartHeight - barHeight;
      
      // Bar
      ctx.fillStyle = value > 0 ? '#6366f1' : '#e2e8f0';
      ctx.fillRect(x + 5, y, barWidth - 10, barHeight);
      
      // Label
      ctx.fillStyle = '#64748b';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
      ctx.fillText(days[index], x + barWidth / 2, canvas.height - 10);
      
      // Value
      if (value > 0) {
        ctx.fillStyle = '#1e293b';
        ctx.fillText(value.toString(), x + barWidth / 2, y - 5);
      }
    });
  }

  updateDailyStats() {
    const today = new Date().toDateString();
    const lastUpdate = localStorage.getItem('pomodoflow_last_update');
    
    if (lastUpdate !== today) {
      // New day - reset daily stats
      this.state.stats.todayPomodoros = 0;
      this.state.stats.todayFocusTime = 0;
      
      // Reset weekly stats if it's Monday
      const dayOfWeek = new Date().getDay();
      if (dayOfWeek === 1) { // Monday
        this.state.stats.weekPomodoros = 0;
        this.state.stats.weeklyData = [0, 0, 0, 0, 0, 0, 0];
      }
      
      localStorage.setItem('pomodoflow_last_update', today);
      this.saveDataToStorage();
    }
  }

  // ===== THEME =====
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('pomodoflow_theme', newTheme);
    
    // Update theme toggle icon
    this.themeToggle.querySelector('.icon').textContent = newTheme === 'dark' ? '☀️' : '🌙';
    
    this.showNotification('🎨', `${newTheme === 'dark' ? 'Dark' : 'Light'} theme activated`);
  }

  // ===== NOTIFICATIONS & AUDIO =====
  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  sendNotification(title, body) {
    if (!this.state.settings.enableNotifications) return;
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: 'assets/icons/icon-192x192.png',
        badge: 'assets/icons/icon-192x192.png'
      });
    }
  }

  showNotification(icon, text) {
    const notification = this.notification;
    const iconEl = notification.querySelector('.notification-icon');
    const textEl = notification.querySelector('.notification-text');
    
    iconEl.textContent = icon;
    textEl.textContent = text;
    
    notification.classList.add('show');
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }

  initializeAudio() {
    // Initialize audio context on first user interaction
    document.addEventListener('click', () => {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.createSounds();
      }
    }, { once: true });
  }

  createSounds() {
    // Create simple beep sounds using oscillators
    this.createTickSound();
    this.createAlarmSound();
  }

  createTickSound() {
    // Create a subtle tick sound
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1 * (this.state.settings.soundVolume / 100), this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  createAlarmSound() {
    if (!this.state.settings.enableSounds) return;
    
    // Create a pleasant alarm sound
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3 * (this.state.settings.soundVolume / 100), this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);
      }, i * 600);
    }
  }

  playTickSound() {
    // Play tick sound every minute during work sessions
    if (this.state.currentMode === 'work' && this.state.settings.enableSounds) {
      this.tickInterval = setInterval(() => {
        if (this.audioContext && this.state.isRunning) {
          this.createTickSound();
        }
      }, 60000);
    }
  }

  stopTickSound() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  playAlarmSound() {
    if (this.audioContext && this.state.settings.enableSounds) {
      this.createAlarmSound();
    }
  }

  // ===== KEYBOARD SHORTCUTS =====
  handleKeyboardShortcuts(e) {
    // Don't trigger shortcuts when typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        this.toggleTimer();
        break;
      case 'Digit1':
        e.preventDefault();
        this.switchMode('work');
        break;
      case 'Digit2':
        e.preventDefault();
        this.switchMode('short-break');
        break;
      case 'Digit3':
        e.preventDefault();
        this.switchMode('long-break');
        break;
      case 'KeyT':
        if (!e.ctrlKey) {
          e.preventDefault();
          this.taskInput.focus();
        }
        break;
      case 'KeyR':
        e.preventDefault();
        this.openStats();
        break;
      case 'KeyS':
        e.preventDefault();
        this.openSettings();
        break;
    }
  }

  // ===== DISPLAY UPDATES =====
  updateDisplay() {
    this.updateTimeDisplay();
    this.updateProgressBar();
    this.updateCurrentTaskDisplay();
    this.renderTasks();
  }

  updateTimeDisplay() {
    this.timeDisplay.textContent = this.formatTime(this.state.timeRemaining);
    this.updateTimeLabel();
  }

  updateTimeLabel() {
    let label = '';
    
    if (this.state.isRunning) {
      label = `${this.getModeText()} in progress...`;
    } else if (this.state.isPaused) {
      label = `${this.getModeText()} paused`;
    } else {
      label = `Ready for ${this.getModeText().toLowerCase()}`;
    }
    
    this.timeLabel.textContent = label;
  }

  updateProgressBar() {
    const totalDuration = this.getTotalDuration();
    const progress = ((totalDuration - this.state.timeRemaining) / totalDuration) * 100;
    const circumference = 283; // 2 * π * 45
    const offset = circumference - (progress / 100) * circumference;
    
    this.progressBar.style.strokeDashoffset = offset;
  }

  updateCurrentTaskDisplay() {
    if (this.state.currentTask) {
      const task = this.state.tasks.find(t => t.id === this.state.currentTask);
      if (task) {
        this.currentTaskName.textContent = task.title;
        this.pomodoroCountDisplay.textContent = `${task.completedPomodoros} / ${task.estimatedPomodoros}`;
        return;
      }
    }
    
    this.currentTaskName.textContent = 'Select a task to start';
    this.pomodoroCountDisplay.textContent = '0 / 0';
  }

  // ===== MODAL MANAGEMENT =====
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ===== DATA PERSISTENCE =====
  saveDataToStorage() {
    try {
      const dataToSave = {
        state: this.state,
        version: '1.0.0',
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem('pomodoflow_data', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Failed to save data:', error);
      this.showNotification('⚠️', 'Failed to save data');
    }
  }

  loadDataFromStorage() {
    try {
      const saved = localStorage.getItem('pomodoflow_data');
      const theme = localStorage.getItem('pomodoflow_theme');
      
      if (saved) {
        const data = JSON.parse(saved);
        if (data.state) {
          // Merge saved state with defaults to handle new features
          this.state = { ...this.state, ...data.state };
          
          // Ensure settings object has all properties
          this.state.settings = { ...this.state.settings, ...data.state.settings };
          this.state.stats = { ...this.state.stats, ...data.state.stats };
        }
      }
      
      // Apply saved theme
      if (theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (this.themeToggle) {
          this.themeToggle.querySelector('.icon').textContent = theme === 'dark' ? '☀️' : '🌙';
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      this.showNotification('⚠️', 'Failed to load saved data');
    }
  }

  // ===== UTILITY METHODS =====
  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  getModeText() {
    const modeTexts = {
      'work': 'Focus Session',
      'short-break': 'Short Break',
      'long-break': 'Long Break'
    };
    return modeTexts[this.state.currentMode] || 'Focus Session';
  }

  getTotalDuration() {
    const durations = {
      'work': this.state.settings.workDuration,
      'short-break': this.state.settings.shortBreakDuration,
      'long-break': this.state.settings.longBreakDuration
    };
    return durations[this.state.currentMode] * 60;
  }

  // ===== PWA SUPPORT =====
  initServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js')
        .then(registration => {
          console.log('SW registered:', registration);
        })
        .catch(error => {
          console.log('SW registration failed:', error);
        });
    }
  }

  // ===== FOCUS MODE =====
  toggleFocusMode() {
    const focusMode = document.querySelector('.focus-mode');
    if (!focusMode) {
      this.createFocusMode();
    } else {
      focusMode.classList.toggle('active');
    }
  }

  createFocusMode() {
    const focusMode = document.createElement('div');
    focusMode.className = 'focus-mode';
    focusMode.innerHTML = `
      <div class="focus-timer">
        <div class="time-digits" id="focusTimeDisplay">25:00</div>
        <div class="time-label" id="focusTimeLabel">Ready to focus</div>
        <div class="focus-controls">
          <button onclick="app.toggleTimer()">Start/Pause</button>
          <button onclick="app.toggleFocusMode()">Exit Focus</button>
        </div>
      </div>
    `;
    document.body.appendChild(focusMode);
    
    // Update focus mode display when timer updates
    this.updateFocusDisplay = () => {
      if (focusMode.classList.contains('active')) {
        document.getElementById('focusTimeDisplay').textContent = this.formatTime(this.state.timeRemaining);
        document.getElementById('focusTimeLabel').textContent = this.timeLabel.textContent;
      }
    };
  }

  // ===== EXPORT/IMPORT =====
  exportData() {
    const dataToExport = {
      tasks: this.state.tasks,
      stats: this.state.stats,
      settings: this.state.settings,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pomodoflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    this.showNotification('💾', 'Data exported successfully');
  }

  importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        if (confirm('Import data? This will overwrite your current data.')) {
          if (importedData.tasks) this.state.tasks = importedData.tasks;
          if (importedData.stats) this.state.stats = { ...this.state.stats, ...importedData.stats };
          if (importedData.settings) this.state.settings = { ...this.state.settings, ...importedData.settings };
          
          this.updateDisplay();
          this.saveDataToStorage();
          this.showNotification('📥', 'Data imported successfully');
        }
      } catch (error) {
        this.showNotification('❌', 'Failed to import data');
      }
    };
    reader.readAsText(file);
  }
}

// ===== INITIALIZE APPLICATION =====
let app;

document.addEventListener('DOMContentLoaded', () => {
  app = new PomodoFlow();
});

// ===== SERVICE WORKER REGISTRATION =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(registration => console.log('SW registered'))
      .catch(error => console.log('SW registration failed'));
  });
}

// ===== PREVENT CONTEXT MENU ON LONG PRESS (MOBILE) =====
document.addEventListener('contextmenu', (e) => {
  if (e.target.closest('.btn-primary, .btn-secondary, .mode-btn')) {
    e.preventDefault();
  }
});

// ===== HANDLE VISIBILITY CHANGE FOR BETTER MOBILE EXPERIENCE =====
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && app && app.state.isRunning) {
    // Update display when returning to the app
    app.updateDisplay();
  }
});
