// Component-specific JavaScript functionality

// Simple Markdown Parser
class MarkdownParser {
  static parse(markdown) {
    if (!markdown) return '';
    
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      // Bold and Italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      // Blockquotes
      .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
      // Lists
      .replace(/^\* (.*$)/gm, '<li>$1</li>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      // Line breaks
      .replace(/\n/g, '<br>');
    
    // Wrap consecutive <li> elements in <ul>
    html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
    html = html.replace(/<\/ul><br><ul>/g, '');
    
    return html;
  }
}

// Dashboard Component
class DashboardComponent {
  static async init() {
    if (window.APP_CONFIG.currentPage !== 'dashboard') return;
    
    await this.loadDashboardData();
  }

  static async loadDashboardData() {
    try {
      const loadingState = document.getElementById('loading-state');
      const dashboardContent = document.getElementById('dashboard-content');
      
      if (loadingState) loadingState.classList.remove('hidden');
      if (dashboardContent) dashboardContent.classList.add('hidden');

      // Get today's date
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // Load all dashboard data in parallel
      const [goals, habits, wisdom, morningNote] = await Promise.all([
        API.get('/goals'),
        API.get('/habits'),
        API.get('/wisdom'),
        API.get(`/morning-notes?date=${todayStr}`)
      ]);

      // Process data
      const dashboardData = {
        todaysFocus: goals.filter(g => g.type === 'weekly').slice(0, 3),
        goalProgress: goals.filter(g => g.type === 'annual').slice(0, 4),
        habitStreaks: habits.slice(0, 5),
        dailyWisdom: wisdom.length > 0 ? wisdom[Math.floor(Math.random() * wisdom.length)] : null,
        morningNote: morningNote
      };

      // Render dashboard sections
      this.renderTodaysFocus(dashboardData.todaysFocus);
      this.renderHabits(dashboardData.habitStreaks, todayStr);
      this.renderGoalProgress(dashboardData.goalProgress);
      this.renderDailyWisdom(dashboardData.dailyWisdom);
      this.renderMoodSummary();
      this.renderSummaryStats(dashboardData);

      if (loadingState) loadingState.classList.add('hidden');
      if (dashboardContent) dashboardContent.classList.remove('hidden');
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Utils.showNotification('Error loading dashboard data', 'error');
    }
  }

  static renderTodaysFocus(goals) {
    const container = document.getElementById('todays-focus');
    const noGoalsContainer = document.getElementById('no-focus-goals');
    
    if (goals.length === 0) {
      if (container) container.classList.add('hidden');
      if (noGoalsContainer) noGoalsContainer.classList.remove('hidden');
      return;
    }

    if (noGoalsContainer) noGoalsContainer.classList.add('hidden');
    if (container) container.classList.remove('hidden');

    if (container) {
      container.innerHTML = goals.map(goal => `
        <div class="card border border-border">
          <div class="card-content p-4">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h4 class="font-semibold text-foreground mb-2">${goal.title}</h4>
                <div class="flex items-center">
                  <div class="progress-bar flex-1 mr-3">
                    <div class="progress-fill" style="width: ${goal.progress || 0}%"></div>
                  </div>
                  <span class="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                    ${goal.progress || 0}%
                  </span>
                </div>
              </div>
              <svg class="w-5 h-5 text-muted-foreground ml-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  static async renderHabits(habits, todayStr) {
    const container = document.getElementById('habits-list');
    const noHabitsContainer = document.getElementById('no-habits');
    const progressContainer = document.getElementById('habits-progress');
    const completionPercentage = document.getElementById('completion-percentage');

    if (habits.length === 0) {
      if (container) container.classList.add('hidden');
      if (noHabitsContainer) noHabitsContainer.classList.remove('hidden');
      if (progressContainer) progressContainer.textContent = '0/0';
      if (completionPercentage) completionPercentage.textContent = '0%';
      return;
    }

    if (noHabitsContainer) noHabitsContainer.classList.add('hidden');
    if (container) container.classList.remove('hidden');

    // Get today's habit logs
    let habitsWithCompletion = [];
    try {
      for (const habit of habits) {
        const logs = await API.get(`/habit-logs?habit_id=${habit.id}&start_date=${todayStr}&end_date=${todayStr}`);
        const todayLog = logs.find(log => log.date === todayStr);
        habitsWithCompletion.push({
          ...habit,
          completedToday: todayLog?.completed || false,
          streak: Math.floor(Math.random() * 15) + 1 // Mock streak for now
        });
      }
    } catch (error) {
      console.error('Error loading habit logs:', error);
      habitsWithCompletion = habits.map(habit => ({
        ...habit,
        completedToday: false,
        streak: 0
      }));
    }

    const completedCount = habitsWithCompletion.filter(h => h.completedToday).length;
    const totalCount = habitsWithCompletion.length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    if (progressContainer) progressContainer.textContent = `${completedCount}/${totalCount}`;
    if (completionPercentage) completionPercentage.textContent = `${percentage}%`;

    if (container) {
      container.innerHTML = habitsWithCompletion.map(habit => `
        <div class="card cursor-pointer transition-all ${habit.completedToday ? 'bg-primary/10 border-primary/20' : 'hover:bg-muted/50'}" 
             onclick="toggleHabit(${habit.id}, '${todayStr}')">
          <div class="card-content p-4">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-semibold text-foreground">${habit.name}</h4>
                <div class="flex items-center mt-1">
                  <svg class="w-4 h-4 text-warning mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>
                  </svg>
                  <span class="text-sm text-muted-foreground">${habit.streak} day streak</span>
                </div>
              </div>
              <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                habit.completedToday 
                  ? 'bg-primary border-primary' 
                  : 'border-muted-foreground/30'
              }">
                ${habit.completedToday ? `
                  <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  static renderGoalProgress(goals) {
    const container = document.getElementById('goal-progress');
    const noGoalsContainer = document.getElementById('no-goals');
    
    if (goals.length === 0) {
      if (container) container.classList.add('hidden');
      if (noGoalsContainer) noGoalsContainer.classList.remove('hidden');
      return;
    }

    if (noGoalsContainer) noGoalsContainer.classList.add('hidden');
    if (container) container.classList.remove('hidden');

    if (container) {
      container.innerHTML = goals.map(goal => `
        <div class="card border border-border">
          <div class="card-content p-4">
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-medium text-foreground">${goal.title}</h4>
              <span class="text-sm text-muted-foreground">${goal.progress || 0}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${goal.progress || 0}%"></div>
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  static renderDailyWisdom(wisdom) {
    const container = document.getElementById('daily-wisdom');
    const noWisdomContainer = document.getElementById('no-wisdom');
    
    if (!wisdom) {
      if (container) container.classList.add('hidden');
      if (noWisdomContainer) noWisdomContainer.classList.remove('hidden');
      return;
    }

    if (noWisdomContainer) noWisdomContainer.classList.add('hidden');
    if (container) container.classList.remove('hidden');

    if (container) {
      container.innerHTML = `
        <div class="card bg-muted/50">
          <div class="card-content p-4">
            <div class="text-base line-height-1.6 mb-4 font-style-italic">
              ${wisdom.content}
            </div>
            <div class="flex items-center">
              <svg class="w-4 h-4 text-primary mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
              </svg>
              <cite class="text-sm text-muted-foreground font-medium">
                ${wisdom.author || 'Unknown'}
              </cite>
            </div>
          </div>
        </div>
      `;
    }
  }

  static renderMoodSummary() {
    const container = document.getElementById('mood-summary');
    if (!container) return;

    // Generate last 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date,
        dateStr: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        rating: Math.floor(Math.random() * 6) // Mock data: 0-5
      });
    }

    const moodEmojis = {
      0: '❓',
      1: '😡',
      2: '😞',
      3: '😐',
      4: '😊',
      5: '🤩'
    };

    container.innerHTML = days.map(day => `
      <div class="text-center">
        <div class="text-sm text-muted-foreground">${day.dayName}</div>
        <div class="text-2xl mt-2">${moodEmojis[day.rating]}</div>
      </div>
    `).join('');
  }

  static renderSummaryStats(data) {
    const focusCount = document.getElementById('focus-count');
    const habitsDone = document.getElementById('habits-done');
    const activeGoals = document.getElementById('active-goals');
    const dayOfMonth = document.getElementById('day-of-month');

    const completedHabits = data.habitStreaks.filter(h => h.completedToday).length;

    if (focusCount) focusCount.textContent = data.todaysFocus.length;
    if (habitsDone) habitsDone.textContent = completedHabits;
    if (activeGoals) activeGoals.textContent = data.goalProgress.length;
    if (dayOfMonth) dayOfMonth.textContent = new Date().getDate();
  }
}

// Habit toggle function (global for onclick handlers)
window.toggleHabit = async function(habitId, date) {
  try {
    // Get current habit log
    const logs = await API.get(`/habit-logs?habit_id=${habitId}&start_date=${date}&end_date=${date}`);
    const currentLog = logs.find(log => log.date === date);
    const newCompleted = !currentLog?.completed;

    // Update habit log
    await API.post('/habit-logs', {
      habit_id: habitId,
      date: date,
      completed: newCompleted
    });

    // Reload dashboard data
    DashboardComponent.loadDashboardData();
    Utils.showNotification(
      newCompleted ? 'Habit completed!' : 'Habit unmarked', 
      newCompleted ? 'success' : 'info'
    );
  } catch (error) {
    console.error('Error toggling habit:', error);
    Utils.showNotification('Error updating habit', 'error');
  }
};

// Global function to load dashboard data (called from template)
window.loadDashboardData = function() {
  DashboardComponent.loadDashboardData();
};

// AI Chat Component
class AIChatComponent {
  static initialized = false;

  static init() {
    // Prevent duplicate initialization
    if (this.initialized) return;
    this.initialized = true;

    const aiChatForm = document.getElementById('ai-chat-form');
    const aiChatInput = document.getElementById('ai-chat-input');
    const clearChatBtn = document.getElementById('clear-chat');

    if (aiChatForm) {
      aiChatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = aiChatInput.value.trim();
        if (message) {
          await this.sendMessage(message);
          aiChatInput.value = '';
        }
      });
    }

    if (clearChatBtn) {
      clearChatBtn.addEventListener('click', () => {
        this.clearChat();
      });
    }

    this.updateChatStatus();
  }

  static async sendMessage(message) {
    const messagesContainer = document.getElementById('ai-chat-messages');
    if (!messagesContainer) return;

    // Add user message
    this.addMessage(message, 'user');

    try {
      // Check if API key is configured
      const apiKey = localStorage.getItem('claude-api-key');
      if (!apiKey) {
        this.addMessage('Please configure your Claude API key in settings to use the AI chat feature.', 'ai');
        return;
      }

      // Send to API
      const response = await API.post('/claude', {
        messages: [{ role: 'user', content: message }],
        system: "You are a helpful AI assistant specializing in personal development, goal setting, and productivity. You're integrated into the 'Architect My Life' application to help users achieve their goals.",
        apiKey: apiKey
      });

      if (response.content && response.content[0] && response.content[0].text) {
        this.addMessage(response.content[0].text, 'ai');
      } else {
        this.addMessage('Sorry, I had trouble processing your request. Please try again.', 'ai');
      }
    } catch (error) {
      console.error('AI Chat error:', error);
      this.addMessage('Sorry, there was an error processing your request. Please check your API key and try again.', 'ai');
    }
  }

  static addMessage(content, type) {
    const messagesContainer = document.getElementById('ai-chat-messages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.innerHTML = `
      <div class="message-content">
        <p>${content}</p>
      </div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  static clearChat() {
    const messagesContainer = document.getElementById('ai-chat-messages');
    if (messagesContainer) {
      messagesContainer.innerHTML = `
        <div class="ai-message welcome-message">
          <div class="message-content">
            <p>Hello! I'm here to help you with your goals, habits, and personal development journey. What would you like to work on today?</p>
          </div>
        </div>
      `;
    }
  }

  static updateChatStatus() {
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.status-text');
    const apiKey = localStorage.getItem('claude-api-key');

    if (statusIndicator && statusText) {
      if (apiKey) {
        statusIndicator.classList.remove('offline');
        statusIndicator.classList.add('online');
        statusText.textContent = 'AI Assistant Ready';
      } else {
        statusIndicator.classList.remove('online');
        statusIndicator.classList.add('offline');
        statusText.textContent = 'Configure API key in settings';
      }
    }
  }
}

// This initialization block was moved to the main initialization section at the end of the file

// Goals Page Component
class GoalsComponent {
  static currentType = 'annual';
  static currentGoals = [];
  static focusAreas = [];

  static async init() {
    if (window.APP_CONFIG.currentPage !== 'goals') return;
    
    await this.loadFocusAreasData();
    await this.loadGoalsData();
    this.setupGoalsPage();
  }

  static async loadFocusAreasData() {
    try {
      this.focusAreas = await API.get('/focus-areas');
    } catch (error) {
      console.error('Error loading focus areas:', error);
      this.focusAreas = [];
    }
  }

  static async loadGoalsData(type = 'annual') {
    try {
      const loadingState = document.getElementById('loading-state');
      const goalsContent = document.getElementById('goals-content');
      
      if (loadingState) loadingState.classList.remove('hidden');
      if (goalsContent) goalsContent.classList.add('hidden');

      // Get goals of specific type
      const goals = await API.get(`/goals?type=${type}`);
      
      this.currentType = type;
      this.currentGoals = goals;
      this.renderGoals(goals);
      
      if (loadingState) loadingState.classList.add('hidden');
      if (goalsContent) goalsContent.classList.remove('hidden');
      
    } catch (error) {
      console.error('Error loading goals:', error);
      Utils.showNotification('Error loading goals', 'error');
    }
  }

  static setupGoalsPage() {
    // Tab switching
    const tabs = document.querySelectorAll('.goal-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const type = tab.dataset.type;
        this.loadGoalsData(type);
        // Hide inline form when switching tabs
        this.hideInlineForm();
      });
    });

    // Add goal button
    const addGoalBtn = document.getElementById('add-goal-btn');
    const createFirstGoal = document.getElementById('create-first-goal');
    
    if (addGoalBtn) {
      addGoalBtn.addEventListener('click', () => this.showInlineForm());
    }
    
    if (createFirstGoal) {
      createFirstGoal.addEventListener('click', () => this.showInlineForm());
    }

    // Inline form controls
    const cancelAddGoal = document.getElementById('cancel-add-goal');
    const cancelInlineGoal = document.getElementById('cancel-inline-goal');
    const inlineGoalForm = document.getElementById('inline-goal-form');
    
    if (cancelAddGoal) {
      cancelAddGoal.addEventListener('click', () => this.hideInlineForm());
    }
    
    if (cancelInlineGoal) {
      cancelInlineGoal.addEventListener('click', () => this.hideInlineForm());
    }
    
    if (inlineGoalForm) {
      inlineGoalForm.addEventListener('submit', (e) => this.saveInlineGoal(e));
    }
  }

  static async renderGoals(goals) {
    const goalsList = document.getElementById('goals-list');
    const noGoalsMessage = document.getElementById('no-goals');
    
    if (goals.length === 0) {
      if (goalsList) goalsList.classList.add('hidden');
      if (noGoalsMessage) noGoalsMessage.classList.remove('hidden');
      return;
    }
    
    if (noGoalsMessage) noGoalsMessage.classList.add('hidden');
    if (goalsList) goalsList.classList.remove('hidden');

    if (goalsList) {
      goalsList.innerHTML = goals.map(goal => `
        <div class="goal-item" id="goal-${goal.id}">
          <!-- Display View -->
          <div class="goal-display" id="goal-display-${goal.id}">
            <div class="goal-header">
              <div class="flex-1">
                <h3 class="goal-title">${goal.title}</h3>
                ${goal.description ? `<p class="goal-description">${goal.description}</p>` : ''}
                ${goal.type === 'monthly' && goal.parent_id ? `
                  <div class="annual-goal-link mt-2">
                    <span class="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded flex items-center gap-1 inline-flex">
                      <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                      </svg>
                      <span id="parent-goal-${goal.parent_id}">Loading annual goal...</span>
                    </span>
                  </div>
                ` : ''}
              </div>
              <div class="goal-actions">
                <button class="btn btn-sm btn-outline" onclick="GoalsComponent.editGoal(${goal.id})" title="Edit Goal">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="m18.5 2.5 3 3L12 15l-4 1 1-4z"/>
                  </svg>
                  <span class="sr-only">Edit Goal</span>
                </button>
                <button class="btn btn-sm btn-destructive" onclick="GoalsComponent.deleteGoal(${goal.id})" title="Delete Goal">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c0-1 1-2 2-2v2"/>
                  </svg>
                  <span class="sr-only">Delete Goal</span>
                </button>
              </div>
            </div>
            
            <div class="goal-progress">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <svg class="icon text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <path d="m9 11 3 3L22 4"/>
                  </svg>
                  <span class="text-sm text-muted-foreground">Progress</span>
                </div>
                <span class="text-sm font-medium">${goal.progress || 0}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${goal.progress || 0}%"></div>
              </div>
              <div class="flex items-center gap-2 mt-2">
                <input type="range" class="flex-1" min="0" max="100" value="${goal.progress || 0}" 
                       onchange="GoalsComponent.updateGoalProgress(${goal.id}, this.value)" title="Update Progress">
                <button class="btn btn-xs btn-outline" onclick="GoalsComponent.updateGoalProgress(${goal.id}, 100)" title="Mark Complete">
                  <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                </button>
              </div>
            </div>
            
            ${goal.priority ? `
              <div class="mt-4">
                <span class="text-xs px-2 py-1 rounded flex items-center gap-1 inline-flex ${
                  goal.priority === 'high' ? 'bg-error text-error-foreground' :
                  goal.priority === 'medium' ? 'bg-warning text-warning-foreground' :
                  'bg-muted text-muted-foreground'
                }">
                  <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    ${
                      goal.priority === 'high' ? '<path d="M12 2L2 22h20L12 2z"/><path d="M12 8v4M12 16h.01"/>' :
                      goal.priority === 'medium' ? '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>' :
                      '<path d="M12 2L2 22h20L12 2z"/><path d="M12 8v4M12 16h.01"/>'
                    }
                  </svg>
                  ${goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)} Priority
                </span>
              </div>
            ` : ''}
            
            ${goal.target_date ? `
              <div class="mt-2 flex items-center gap-1">
                <svg class="icon-sm text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                  <line x1="16" x2="16" y1="2" y2="6"/>
                  <line x1="8" x2="8" y1="2" y2="6"/>
                  <line x1="3" x2="21" y1="10" y2="10"/>
                </svg>
                <span class="text-xs text-muted-foreground">Target: ${new Date(goal.target_date).toLocaleDateString()}</span>
              </div>
            ` : ''}
          </div>

          <!-- Inline Edit Form -->
          <div class="goal-edit-form hidden" id="goal-edit-${goal.id}">
            <form onsubmit="GoalsComponent.saveGoal(event, ${goal.id})">
              <div class="form-group mb-4">
                <label class="form-label">Title</label>
                <input type="text" class="form-input" name="title" value="${goal.title.replace(/"/g, '&quot;')}" required>
              </div>
              
              <div class="form-group mb-4">
                <label class="form-label">Description</label>
                <textarea class="form-textarea" name="description">${goal.description || ''}</textarea>
              </div>
              
              <!-- Time-based dropdowns based on goal type -->
              ${goal.type === 'annual' ? `
                <div class="form-group mb-4">
                  <label class="form-label">Target Year</label>
                  <select class="form-select" name="target_year">
                    ${(() => {
                      const currentYear = new Date().getFullYear();
                      let options = '';
                      for (let year = currentYear - 1; year <= currentYear + 5; year++) {
                        const selected = (goal.target_year || currentYear) === year ? 'selected' : '';
                        options += `<option value="${year}" ${selected}>${year}</option>`;
                      }
                      return options;
                    })()}
                  </select>
                </div>
              ` : ''}
              
              ${goal.type === 'monthly' ? `
                <div class="form-group mb-4">
                  <label class="form-label">Annual Goal</label>
                  <select class="form-select" name="parent_id">
                    <option value="">Select Annual Goal (Optional)</option>
                    ${(() => {
                      let options = '';
                      // We'll need to populate this dynamically when the edit form is shown
                      // This will be populated by the editGoal function
                      return options;
                    })()}
                  </select>
                </div>
                
                <div class="flex gap-4 mb-4">
                  <div class="form-group flex-1">
                    <label class="form-label">Target Year</label>
                    <select class="form-select" name="target_year">
                      ${(() => {
                        const currentYear = new Date().getFullYear();
                        let options = '';
                        for (let year = currentYear - 1; year <= currentYear + 2; year++) {
                          const selected = (goal.target_year || currentYear) === year ? 'selected' : '';
                          options += `<option value="${year}" ${selected}>${year}</option>`;
                        }
                        return options;
                      })()}
                    </select>
                  </div>
                  
                  <div class="form-group flex-1">
                    <label class="form-label">Target Month</label>
                    <select class="form-select" name="target_month">
                      ${(() => {
                        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                                       'July', 'August', 'September', 'October', 'November', 'December'];
                        const currentMonth = goal.target_month || new Date().getMonth() + 1;
                        let options = '';
                        months.forEach((month, index) => {
                          const value = index + 1;
                          const selected = currentMonth === value ? 'selected' : '';
                          options += `<option value="${value}" ${selected}>${month}</option>`;
                        });
                        return options;
                      })()}
                    </select>
                  </div>
                </div>
                
                <div class="form-group mb-4">
                  <label class="form-label">Focus Area</label>
                  <select class="form-select" name="focus_area_id">
                    <option value="">Select a focus area (optional)</option>
                    ${(() => {
                      let options = '';
                      GoalsComponent.focusAreas.forEach(area => {
                        const selected = (goal.focus_area_id || '') == area.id ? 'selected' : '';
                        options += `<option value="${area.id}" ${selected}>${area.name}</option>`;
                      });
                      return options;
                    })()}
                  </select>
                </div>
              ` : ''}
              
              ${goal.type === 'weekly' ? `
                <div class="flex gap-4 mb-4">
                  <div class="form-group flex-1">
                    <label class="form-label">Target Year</label>
                    <select class="form-select" name="target_year">
                      ${(() => {
                        const currentYear = new Date().getFullYear();
                        let options = '';
                        for (let year = currentYear - 1; year <= currentYear + 1; year++) {
                          const selected = (goal.target_year || currentYear) === year ? 'selected' : '';
                          options += `<option value="${year}" ${selected}>${year}</option>`;
                        }
                        return options;
                      })()}
                    </select>
                  </div>
                  
                  <div class="form-group flex-1">
                    <label class="form-label">Target Month</label>
                    <select class="form-select" name="target_month">
                      ${(() => {
                        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                                       'July', 'August', 'September', 'October', 'November', 'December'];
                        const currentMonth = goal.target_month || new Date().getMonth() + 1;
                        let options = '';
                        months.forEach((month, index) => {
                          const value = index + 1;
                          const selected = currentMonth === value ? 'selected' : '';
                          options += `<option value="${value}" ${selected}>${month}</option>`;
                        });
                        return options;
                      })()}
                    </select>
                  </div>
                  
                  <div class="form-group flex-1">
                    <label class="form-label">Target Week</label>
                    <select class="form-select" name="target_week">
                      ${(() => {
                        let options = '';
                        for (let week = 1; week <= 53; week++) {
                          const selected = (goal.target_week || Math.ceil(new Date().getDate() / 7)) === week ? 'selected' : '';
                          options += `<option value="${week}" ${selected}>Week ${week}</option>`;
                        }
                        return options;
                      })()}
                    </select>
                  </div>
                </div>
              ` : ''}
              
              <div class="flex gap-4 mb-4">
                <div class="form-group flex-1">
                  <label class="form-label">Priority</label>
                  <select class="form-select" name="priority">
                    <option value="low" ${goal.priority === 'low' ? 'selected' : ''}>Low</option>
                    <option value="medium" ${goal.priority === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="high" ${goal.priority === 'high' ? 'selected' : ''}>High</option>
                  </select>
                </div>
                
                <div class="form-group flex-1">
                  <label class="form-label">Target Date</label>
                  <input type="date" class="form-input" name="target_date" value="${goal.target_date || ''}">
                </div>
              </div>
              
              <div class="form-group mb-4">
                <label class="form-label">Success Criteria</label>
                <textarea class="form-textarea" name="success_criteria">${goal.success_criteria || ''}</textarea>
              </div>
              
              <div class="flex gap-2">
                <button type="submit" class="btn btn-primary">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17,21 17,13 7,13 7,21"/>
                    <polyline points="7,3 7,8 15,8"/>
                  </svg>
                  Save Changes
                </button>
                <button type="button" onclick="GoalsComponent.cancelEdit(${goal.id})" class="btn btn-secondary">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      `).join('');
      
      // Populate parent goal names for monthly goals
      await this.populateParentGoalNames(goals);
    }
  }

  static showGoalModal(goalId = null) {
    const modal = document.getElementById('goal-modal');
    const modalTitle = document.getElementById('modal-title');
    const goalTypeSelect = document.getElementById('goal-type');
    
    if (modal) {
      modal.classList.remove('hidden');
    }
    
    if (modalTitle) {
      modalTitle.textContent = goalId ? 'Edit Goal' : 'Add New Goal';
    }
    
    // Set default type to current tab
    if (goalTypeSelect) {
      goalTypeSelect.value = this.currentType;
    }
    
    if (goalId) {
      // Load goal data for editing
      this.loadGoalForEditing(goalId);
    } else {
      // Reset form for new goal
      document.getElementById('goal-form').reset();
      if (goalTypeSelect) {
        goalTypeSelect.value = this.currentType;
      }
    }
  }

  static hideGoalModal() {
    const modal = document.getElementById('goal-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  static async showInlineForm() {
    const inlineForm = document.getElementById('add-goal-form');
    const formTitle = document.getElementById('form-title');
    
    if (inlineForm) {
      inlineForm.classList.remove('hidden');
    }
    
    const goalType = this.getCurrentGoalType();
    if (formTitle) {
      formTitle.textContent = `Add New ${goalType} Goal`;
    }

    // Clear form
    this.clearInlineForm();
    
    // Add dynamic fields based on goal type
    await this.populateInlineDynamicFields();
    
    // Focus on title input
    const titleInput = document.getElementById('inline-goal-title');
    if (titleInput) {
      titleInput.focus();
    }
  }

  static hideInlineForm() {
    const inlineForm = document.getElementById('add-goal-form');
    if (inlineForm) {
      inlineForm.classList.add('hidden');
    }
    this.clearInlineForm();
  }

  static clearInlineForm() {
    const form = document.getElementById('inline-goal-form');
    if (form) {
      form.reset();
      // Set priority to medium as default
      const prioritySelect = document.getElementById('inline-goal-priority');
      if (prioritySelect) {
        prioritySelect.value = 'medium';
      }
    }
    
    // Clear dynamic fields
    const dynamicFields = document.getElementById('inline-goal-dynamic-fields');
    if (dynamicFields) {
      dynamicFields.innerHTML = '';
    }
  }
  
  static async populateInlineDynamicFields() {
    const activeTab = document.querySelector('.goal-tab.active');
    const goalType = activeTab ? activeTab.dataset.type : 'annual';
    const dynamicFields = document.getElementById('inline-goal-dynamic-fields');
    
    if (!dynamicFields) return;
    
    // Clear previous dynamic fields
    dynamicFields.innerHTML = '';
    
    if (goalType === 'monthly') {
      // Get annual goals for the dropdown
      let annualGoals = [];
      try {
        annualGoals = await API.get('/goals?type=annual');
      } catch (error) {
        console.error('Error fetching annual goals:', error);
        annualGoals = [];
      }
      
      // Create annual goal dropdown
      const annualGoalField = document.createElement('div');
      annualGoalField.className = 'form-group mb-4';
      annualGoalField.innerHTML = `
        <label class="form-label">Annual Goal</label>
        <select id="inline-goal-parent-id" class="form-select" name="parent_id">
          <option value="">Select Annual Goal (Optional)</option>
          ${annualGoals.map(goal => 
            `<option value="${goal.id}">${goal.title}</option>`
          ).join('')}
        </select>
      `;
      
      dynamicFields.appendChild(annualGoalField);
    }
  }

  static getCurrentGoalType() {
    const activeTab = document.querySelector('.goal-tab.active');
    if (activeTab) {
      const type = activeTab.dataset.type;
      return type.charAt(0).toUpperCase() + type.slice(1);
    }
    return 'Annual';
  }

  static async saveInlineGoal(e) {
    e.preventDefault();
    
    try {
      const activeTab = document.querySelector('.goal-tab.active');
      const goalType = activeTab ? activeTab.dataset.type : 'annual';
      
      const formData = {
        type: goalType,
        title: document.getElementById('inline-goal-title').value,
        description: document.getElementById('inline-goal-description').value,
        priority: document.getElementById('inline-goal-priority').value,
        success_criteria: document.getElementById('inline-goal-success-criteria').value,
        target_date: document.getElementById('inline-goal-target-date').value,
        target_year: new Date().getFullYear(),
        target_month: null,
        parent_id: null
      };

      // Set appropriate time targets and parent_id based on goal type
      if (goalType === 'monthly') {
        formData.target_month = new Date().getMonth() + 1;
        // Get parent_id from the dynamic field
        const parentIdSelect = document.getElementById('inline-goal-parent-id');
        if (parentIdSelect && parentIdSelect.value) {
          formData.parent_id = parseInt(parentIdSelect.value);
        }
      }

      await API.post('/goals', formData);
      
      this.hideInlineForm();
      this.loadGoalsData(goalType);
      Utils.showNotification('Goal added successfully!', 'success');
      
    } catch (error) {
      console.error('Error saving goal:', error);
      Utils.showNotification('Error saving goal', 'error');
    }
  }

  static async saveGoal(e) {
    e.preventDefault();
    
    try {
      const formData = {
        type: document.getElementById('goal-type').value,
        title: document.getElementById('goal-title').value,
        description: document.getElementById('goal-description').value,
        priority: document.getElementById('goal-priority').value,
        success_criteria: document.getElementById('goal-success-criteria').value,
        target_date: document.getElementById('goal-target-date').value,
        target_year: new Date().getFullYear()
      };

      // Set target month/week based on type
      if (formData.type === 'monthly') {
        formData.target_month = new Date().getMonth() + 1;
      } else if (formData.type === 'weekly') {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        formData.target_week = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
      }

      await API.post('/goals', formData);
      
      this.hideGoalModal();
      this.loadGoalsData(this.currentType);
      Utils.showNotification('Goal saved successfully!', 'success');
      
    } catch (error) {
      console.error('Error saving goal:', error);
      Utils.showNotification('Error saving goal', 'error');
    }
  }

  static async loadGoalForEditing(goalId) {
    try {
      const goals = await API.get(`/goals`);
      const goal = goals.find(g => g.id === goalId);
      
      if (goal) {
        document.getElementById('goal-type').value = goal.type;
        document.getElementById('goal-title').value = goal.title || '';
        document.getElementById('goal-description').value = goal.description || '';
        document.getElementById('goal-priority').value = goal.priority || 'medium';
        document.getElementById('goal-success-criteria').value = goal.success_criteria || '';
        document.getElementById('goal-target-date').value = goal.target_date || '';
      }
    } catch (error) {
      console.error('Error loading goal for editing:', error);
    }
  }

  // Inline editing methods
  static async editGoal(goalId) {
    const displayDiv = document.getElementById(`goal-display-${goalId}`);
    const editDiv = document.getElementById(`goal-edit-${goalId}`);
    
    if (displayDiv && editDiv) {
      displayDiv.classList.add('hidden');
      editDiv.classList.remove('hidden');
      
      // Populate annual goal dropdown if this is a monthly goal
      const goal = this.currentGoals.find(g => g.id === goalId);
      if (goal && goal.type === 'monthly') {
        await this.populateAnnualGoalDropdown(goalId, goal.parent_id);
      }
    }
  }

  static async populateAnnualGoalDropdown(goalId, currentParentId = null) {
    try {
      // Get annual goals
      const annualGoals = await API.get('/goals?type=annual');
      
      // Find the dropdown in the edit form
      const editDiv = document.getElementById(`goal-edit-${goalId}`);
      const dropdown = editDiv ? editDiv.querySelector('select[name="parent_id"]') : null;
      
      if (dropdown) {
        // Clear existing options except the first one
        dropdown.innerHTML = '<option value="">Select Annual Goal (Optional)</option>';
        
        // Add annual goal options
        annualGoals.forEach(annualGoal => {
          const option = document.createElement('option');
          option.value = annualGoal.id;
          option.textContent = annualGoal.title;
          option.selected = (currentParentId && currentParentId == annualGoal.id);
          dropdown.appendChild(option);
        });
      }
    } catch (error) {
      console.error('Error populating annual goal dropdown:', error);
    }
  }

  static async populateParentGoalNames(goals) {
    try {
      // Get all unique parent IDs from monthly goals
      const parentIds = [...new Set(goals
        .filter(goal => goal.type === 'monthly' && goal.parent_id)
        .map(goal => goal.parent_id))];
      
      if (parentIds.length === 0) return;
      
      // Fetch annual goals
      const annualGoals = await API.get('/goals?type=annual');
      
      // Create a lookup map
      const annualGoalsMap = {};
      annualGoals.forEach(goal => {
        annualGoalsMap[goal.id] = goal.title;
      });
      
      // Update the DOM elements
      parentIds.forEach(parentId => {
        const element = document.getElementById(`parent-goal-${parentId}`);
        if (element && annualGoalsMap[parentId]) {
          element.textContent = annualGoalsMap[parentId];
        }
      });
    } catch (error) {
      console.error('Error populating parent goal names:', error);
      // Update any loading elements to show error
      const loadingElements = document.querySelectorAll('[id^="parent-goal-"]');
      loadingElements.forEach(element => {
        if (element.textContent === 'Loading annual goal...') {
          element.textContent = 'Unable to load';
        }
      });
    }
  }

  static cancelEdit(goalId) {
    const displayDiv = document.getElementById(`goal-display-${goalId}`);
    const editDiv = document.getElementById(`goal-edit-${goalId}`);
    
    if (displayDiv && editDiv) {
      displayDiv.classList.remove('hidden');
      editDiv.classList.add('hidden');
    }
  }

  static async saveGoal(e, goalId) {
    e.preventDefault();
    
    try {
      const form = e.target;
      const formData = new FormData(form);
      
      // Extract form data using names
      const goalData = {
        title: formData.get('title'),
        description: formData.get('description'),
        priority: formData.get('priority'),
        target_date: formData.get('target_date'),
        success_criteria: formData.get('success_criteria'),
      };

      // Add time-based fields if they exist
      if (formData.get('target_year')) {
        goalData.target_year = parseInt(formData.get('target_year'));
      }
      
      if (formData.get('target_month')) {
        goalData.target_month = parseInt(formData.get('target_month'));
      }
      
      if (formData.get('target_week')) {
        goalData.target_week = parseInt(formData.get('target_week'));
      }

      // Add focus area if selected
      if (formData.get('focus_area_id')) {
        goalData.focus_area_id = parseInt(formData.get('focus_area_id'));
      }
      
      // Add parent_id if selected (for monthly goals linking to annual goals)
      if (formData.get('parent_id')) {
        goalData.parent_id = parseInt(formData.get('parent_id'));
      }

      await API.put(`/goals/${goalId}`, goalData);
      
      // Return to display view and refresh the current tab
      this.cancelEdit(goalId);
      await this.loadGoalsData(this.currentType);
      
      Utils.showNotification('Goal updated successfully!', 'success');
      
    } catch (error) {
      console.error('Error updating goal:', error);
      Utils.showNotification('Error updating goal', 'error');
    }
  }

  static async updateGoalProgress(goalId, progress) {
    try {
      await API.put(`/goals/${goalId}/progress`, { progress: parseInt(progress) });
      
      // Refresh the current goals view
      await this.loadGoalsData(this.currentType);
      
      Utils.showNotification(`Goal progress updated to ${progress}%`, 'success');
      
    } catch (error) {
      console.error('Error updating goal progress:', error);
      Utils.showNotification('Error updating progress', 'error');
    }
  }

  static async deleteGoal(goalId) {
    if (confirm('Are you sure you want to delete this goal?')) {
      try {
        await API.delete(`/goals/${goalId}`);
        
        // Refresh the current goals view
        await this.loadGoalsData(this.currentType);
        
        Utils.showNotification('Goal deleted successfully', 'success');
        
      } catch (error) {
        console.error('Error deleting goal:', error);
        Utils.showNotification('Error deleting goal', 'error');
      }
    }
  }
}

// Global functions for onclick handlers (now using inline editing)
window.editGoal = function(goalId) {
  GoalsComponent.editGoal(goalId);
};

window.deleteGoal = function(goalId) {
  GoalsComponent.deleteGoal(goalId);
};

window.updateGoalProgress = function(goalId, progress) {
  GoalsComponent.updateGoalProgress(goalId, progress);
};

// Global functions called from templates
window.loadGoalsData = function(type = 'annual') {
  GoalsComponent.loadGoalsData(type);
};

window.setupGoalsPage = function() {
  GoalsComponent.setupGoalsPage();
};

// Focus Areas Page Component
class FocusAreasComponent {
  static async init() {
    if (window.APP_CONFIG.currentPage !== 'focus-areas') return;
    
    await this.loadFocusAreasData();
  }

  static async loadFocusAreasData() {
    try {
      const loadingState = document.getElementById('loading-state');
      const content = document.getElementById('focus-areas-content');
      
      if (loadingState) loadingState.classList.remove('hidden');
      if (content) content.classList.add('hidden');

      const focusAreas = await API.get('/focus-areas');
      
      this.renderFocusAreas(focusAreas);
      
      if (loadingState) loadingState.classList.add('hidden');
      if (content) content.classList.remove('hidden');
    } catch (error) {
      console.error('Error loading focus areas:', error);
      Utils.showNotification('Error loading focus areas', 'error');
    }
  }

  static renderFocusAreas(focusAreas) {
    const grid = document.getElementById('focus-areas-grid');
    const noFocusAreas = document.getElementById('no-focus-areas');
    
    if (focusAreas.length === 0) {
      if (grid) grid.classList.add('hidden');
      if (noFocusAreas) noFocusAreas.classList.remove('hidden');
      return;
    }
    
    if (noFocusAreas) noFocusAreas.classList.add('hidden');
    if (grid) grid.classList.remove('hidden');
    
    if (grid) {
      grid.innerHTML = focusAreas.map(area => `
        <div class="focus-card">
          <div class="focus-icon">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
            </svg>
          </div>
          <h3 class="focus-name">${area.name}</h3>
          <p class="focus-description">${area.category}</p>
          <div class="mt-4">
            <span class="text-xs px-2 py-1 rounded ${area.is_active ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}">
              ${area.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      `).join('');
    }
  }
}

// Habits Page Component
class HabitsComponent {
  static currentView = 'week';
  static currentWeekOffset = 0;

  static async init() {
    if (window.APP_CONFIG.currentPage !== 'habits') return;
    
    this.setupHabitsPage();
    await this.loadHabitsData();
  }

  static async loadHabitsData() {
    try {
      const loadingState = document.getElementById('loading-state');
      const habitsContent = document.getElementById('habits-content');
      
      if (loadingState) loadingState.classList.remove('hidden');
      if (habitsContent) habitsContent.classList.add('hidden');

      // Fetch habits data
      const habits = await API.get('/habits');
      
      // Render based on current view
      if (this.currentView === 'week') {
        await this.renderWeeklyView(habits);
      } else {
        this.renderHabitsManagement(habits);
      }

      if (loadingState) loadingState.classList.add('hidden');
      if (habitsContent) habitsContent.classList.remove('hidden');
      
    } catch (error) {
      console.error('Error loading habits:', error);
      Utils.showNotification('Error loading habits', 'error');
    }
  }

  static async renderWeeklyView(habits) {
    const weekView = document.getElementById('week-view');
    const habitsView = document.getElementById('habits-view');
    const weeklyGrid = document.getElementById('habits-weekly-grid');
    const noHabitsWeek = document.getElementById('no-habits-week');
    
    if (!weekView || !habitsView || !weeklyGrid) return;

    // Show week view, hide habits view
    weekView.classList.remove('hidden');
    habitsView.classList.add('hidden');

    if (habits.length === 0) {
      weeklyGrid.classList.add('hidden');
      if (noHabitsWeek) noHabitsWeek.classList.remove('hidden');
      return;
    }

    if (noHabitsWeek) noHabitsWeek.classList.add('hidden');
    weeklyGrid.classList.remove('hidden');

    // Generate week dates
    const weekDates = this.getWeekDates(this.currentWeekOffset);
    
    // Update week title
    const weekTitle = document.getElementById('week-title');
    if (weekTitle) {
      if (this.currentWeekOffset === 0) {
        weekTitle.textContent = 'This Week';
      } else if (this.currentWeekOffset === -1) {
        weekTitle.textContent = 'Last Week';
      } else {
        const startDate = weekDates[0];
        weekTitle.textContent = `Week of ${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      }
    }

    // Get habit logs for the week
    const startDate = weekDates[0].toISOString().split('T')[0];
    const endDate = weekDates[6].toISOString().split('T')[0];
    
    let habitLogsData = {};
    try {
      for (const habit of habits) {
        const logs = await API.get(`/habit-logs?habit_id=${habit.id}&start_date=${startDate}&end_date=${endDate}`);
        habitLogsData[habit.id] = logs;
      }
    } catch (error) {
      console.error('Error loading habit logs:', error);
      habitLogsData = {};
    }

    // Render weekly grid
    weeklyGrid.innerHTML = `
      <table class="w-full">
        <thead>
          <tr class="border-b border-border">
            <th class="text-left py-3 px-4 font-medium text-muted-foreground">Habit</th>
            ${weekDates.map(date => `
              <th class="text-center py-3 px-2 font-medium text-muted-foreground min-w-[60px]">
                <div class="text-xs">${date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div class="text-sm">${date.getDate()}</div>
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          ${habits.map(habit => {
            const habitLogs = habitLogsData[habit.id] || [];
            return `
              <tr class="border-b border-border hover:bg-muted/50">
                <td class="py-3 px-4">
                  <div class="font-medium text-foreground">${habit.name}</div>
                  ${habit.description ? `<div class="text-xs text-muted-foreground">${habit.description}</div>` : ''}
                </td>
                ${weekDates.map((date, dayIndex) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const log = habitLogs.find(log => log.date === dateStr);
                  const isCompleted = log?.completed || false;
                  const isToday = dateStr === new Date().toISOString().split('T')[0];
                  const isFuture = date > new Date();
                  const isPast = date < new Date() && !isToday;
                  
                  return `
                    <td class="py-3 px-2 text-center">
                      <div class="habit-checkbox-container ${isToday ? 'today-highlight' : ''}">
                        <input 
                          type="checkbox" 
                          id="habit-${habit.id}-${dateStr}"
                          class="habit-checkbox ${isToday ? 'today-checkbox' : isPast ? 'past-checkbox' : 'future-checkbox'}"
                          ${isCompleted ? 'checked' : ''}
                          ${!isToday ? 'disabled' : ''}
                          data-habit-id="${habit.id}"
                          data-date="${dateStr}"
                          onchange="HabitsComponent.handleCheckboxChange(this)"
                          title="${habit.name} - ${date.toLocaleDateString()}"
                        />
                      </div>
                    </td>
                  `;
                }).join('')}
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;

    // Update week stats
    this.updateWeekStats(habits, habitLogsData, weekDates);

    // Load last week's summary if viewing current week
    if (this.currentWeekOffset === 0) {
      await this.loadLastWeekSummary(habits);
    } else {
      // Hide last week summary for other weeks
      const lastWeekSummary = document.getElementById('last-week-summary');
      if (lastWeekSummary) lastWeekSummary.classList.add('hidden');
    }
  }

  static renderHabitsManagement(habits) {
    const weekView = document.getElementById('week-view');
    const habitsView = document.getElementById('habits-view');
    const habitsGrid = document.getElementById('habits-grid');
    const noHabits = document.getElementById('no-habits');
    
    if (!weekView || !habitsView || !habitsGrid || !noHabits) return;

    // Show habits view, hide week view
    weekView.classList.add('hidden');
    habitsView.classList.remove('hidden');

    if (habits.length === 0) {
      habitsGrid.classList.add('hidden');
      noHabits.classList.remove('hidden');
      return;
    }

    habitsGrid.classList.remove('hidden');
    noHabits.classList.add('hidden');

    habitsGrid.innerHTML = habits.map(habit => `
      <div class="habit-card" data-habit-id="${habit.id}">
        <div class="habit-header">
          <div>
            <h3 class="habit-title">${habit.name}</h3>
            ${habit.description ? `<p class="habit-description">${habit.description}</p>` : ''}
          </div>
          <div class="habit-actions">
            <button class="btn-icon edit-habit" data-habit-id="${habit.id}" title="Edit Habit">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="m18.5 2.5 4 4L21 7l-4-4-3.5 3.5v4h4L21 7"/>
              </svg>
            </button>
            <button class="btn-icon delete-habit" data-habit-id="${habit.id}" title="Delete Habit">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="habit-stats">
          <div class="habit-stat">
            <span class="stat-label">Streak</span>
            <span class="stat-value">${habit.current_streak || 0} days</span>
          </div>
          <div class="habit-stat">
            <span class="stat-label">Target</span>
            <span class="stat-value">${habit.target_streak || 30} days</span>
          </div>
          <div class="habit-stat">
            <span class="stat-label">Category</span>
            <span class="stat-value">${habit.category || 'General'}</span>
          </div>
        </div>

        <div class="habit-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${Math.min((habit.current_streak || 0) / (habit.target_streak || 30) * 100, 100)}%"></div>
          </div>
          <span class="progress-text">${Math.min((habit.current_streak || 0) / (habit.target_streak || 30) * 100, 100).toFixed(0)}%</span>
        </div>

        <div class="habit-footer">
          <button class="btn btn-sm btn-success complete-habit" data-habit-id="${habit.id}">
            Mark Complete Today
          </button>
        </div>
      </div>
    `).join('');
  }

  static setupHabitsPage() {
    // Set up tab switching
    const weekTab = document.getElementById('week-tab');
    const habitsTab = document.getElementById('habits-tab');
    
    if (weekTab) {
      weekTab.addEventListener('click', () => this.switchToView('week'));
    }
    
    if (habitsTab) {
      habitsTab.addEventListener('click', () => this.switchToView('habits'));
    }

    // Set up week navigation
    const prevWeekBtn = document.getElementById('prev-week');
    const nextWeekBtn = document.getElementById('next-week');
    
    if (prevWeekBtn) {
      prevWeekBtn.addEventListener('click', () => this.navigateWeek(-1));
    }
    
    if (nextWeekBtn) {
      nextWeekBtn.addEventListener('click', () => this.navigateWeek(1));
    }

    // Switch to habits tab button
    const switchToHabitsBtn = document.getElementById('switch-to-habits');
    if (switchToHabitsBtn) {
      switchToHabitsBtn.addEventListener('click', () => this.switchToView('habits'));
    }

    // Add event listeners for habit management
    this.setupEventListeners();
  }

  static switchToView(view) {
    this.currentView = view;
    
    // Update tab active states
    const weekTab = document.getElementById('week-tab');
    const habitsTab = document.getElementById('habits-tab');
    
    if (weekTab && habitsTab) {
      weekTab.classList.toggle('active', view === 'week');
      habitsTab.classList.toggle('active', view === 'habits');
    }
    
    // Reload data for new view
    this.loadHabitsData();
  }

  static navigateWeek(direction) {
    this.currentWeekOffset += direction;
    this.loadHabitsData();
  }

  static getWeekDates(weekOffset = 0) {
    const now = new Date();
    const currentDay = now.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Make Monday the start of week
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset + (weekOffset * 7));
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push(date);
    }
    
    return weekDates;
  }

  static updateWeekStats(habits, habitLogsData, weekDates) {
    const weekStats = document.getElementById('week-stats');
    if (!weekStats) return;

    let totalPossible = 0;
    let totalCompleted = 0;

    habits.forEach(habit => {
      const logs = habitLogsData[habit.id] || [];
      weekDates.forEach(date => {
        const dateStr = date.toISOString().split('T')[0];
        if (date <= new Date()) { // Only count past and current dates
          totalPossible++;
          const log = logs.find(l => l.date === dateStr);
          if (log?.completed) {
            totalCompleted++;
          }
        }
      });
    });

    const percentage = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
    weekStats.textContent = `${totalCompleted}/${totalPossible} completed (${percentage}%)`;
  }

  static async loadLastWeekSummary(habits) {
    const lastWeekHabits = document.getElementById('last-week-habits');
    const lastWeekSummary = document.getElementById('last-week-summary');
    
    if (!lastWeekHabits || !lastWeekSummary) return;

    try {
      // Get last week's dates
      const lastWeekDates = this.getWeekDates(-1);
      const startDate = lastWeekDates[0].toISOString().split('T')[0];
      const endDate = lastWeekDates[6].toISOString().split('T')[0];

      // Get last week's habit logs
      let lastWeekLogsData = {};
      for (const habit of habits) {
        const logs = await API.get(`/habit-logs?habit_id=${habit.id}&start_date=${startDate}&end_date=${endDate}`);
        lastWeekLogsData[habit.id] = logs;
      }

      // Calculate completion rates for last week
      const habitSummaries = habits.map(habit => {
        const logs = lastWeekLogsData[habit.id] || [];
        const completedDays = logs.filter(log => log.completed).length;
        const totalDays = 7;
        const percentage = Math.round((completedDays / totalDays) * 100);
        
        return {
          ...habit,
          completedDays,
          totalDays,
          percentage
        };
      });

      lastWeekHabits.innerHTML = habitSummaries.map(habit => `
        <div class="flex items-center justify-between py-2 px-3 bg-muted/30 rounded">
          <div>
            <div class="font-medium text-sm">${habit.name}</div>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs text-muted-foreground">${habit.completedDays}/${habit.totalDays}</span>
            <div class="w-16 bg-muted rounded-full h-2">
              <div class="bg-primary h-2 rounded-full transition-all" style="width: ${habit.percentage}%"></div>
            </div>
            <span class="text-xs font-medium ${habit.percentage >= 80 ? 'text-green-600' : habit.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}">
              ${habit.percentage}%
            </span>
          </div>
        </div>
      `).join('');

      lastWeekSummary.classList.remove('hidden');
      
    } catch (error) {
      console.error('Error loading last week summary:', error);
      lastWeekSummary.classList.add('hidden');
    }
  }

  static async handleCheckboxChange(checkboxElement) {
    // Only process changes for today's checkboxes
    if (!checkboxElement.classList.contains('today-checkbox')) {
      return;
    }

    const habitId = parseInt(checkboxElement.dataset.habitId);
    const date = checkboxElement.dataset.date;
    const isCompleted = checkboxElement.checked;

    try {
      // Update habit log
      await API.post('/habit-logs', {
        habit_id: habitId,
        date: date,
        completed: isCompleted
      });

      // Reload data to update stats
      await this.loadHabitsData();

      Utils.showNotification(
        isCompleted ? 'Habit completed!' : 'Habit unmarked',
        isCompleted ? 'success' : 'info'
      );
    } catch (error) {
      console.error('Error updating habit log:', error);
      Utils.showNotification('Error updating habit', 'error');
      
      // Revert checkbox state on error
      checkboxElement.checked = !isCompleted;
    }
  }

  static async toggleHabitLog(habitId, date, buttonElement) {
    try {
      // Get current habit log for this date
      const logs = await API.get(`/habit-logs?habit_id=${habitId}&start_date=${date}&end_date=${date}`);
      const currentLog = logs.find(log => log.date === date);
      const newCompleted = !currentLog?.completed;

      // Update habit log
      await API.post('/habit-logs', {
        habit_id: habitId,
        date: date,
        completed: newCompleted
      });

      // Update button appearance
      if (newCompleted) {
        buttonElement.classList.remove('border-muted-foreground/30', 'hover:border-primary/50');
        buttonElement.classList.add('bg-primary', 'border-primary');
        buttonElement.innerHTML = `
          <svg class="w-4 h-4 text-white mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
        `;
      } else {
        buttonElement.classList.remove('bg-primary', 'border-primary');
        buttonElement.classList.add('border-muted-foreground/30', 'hover:border-primary/50');
        buttonElement.innerHTML = '';
      }

      // Reload data to update stats
      await this.loadHabitsData();

      Utils.showNotification(
        newCompleted ? 'Habit completed!' : 'Habit unmarked',
        newCompleted ? 'success' : 'info'
      );
    } catch (error) {
      console.error('Error toggling habit log:', error);
      Utils.showNotification('Error updating habit', 'error');
    }
  }

  static setupEventListeners() {
    const addHabitBtn = document.getElementById('add-habit-btn');
    const createFirstHabit = document.getElementById('create-first-habit');
    const habitModal = document.getElementById('habit-modal');
    const closeModal = document.getElementById('close-modal');
    const cancelHabit = document.getElementById('cancel-habit');
    const habitForm = document.getElementById('habit-form');

    // Add habit button
    if (addHabitBtn) {
      addHabitBtn.addEventListener('click', () => this.openHabitModal());
    }
    
    if (createFirstHabit) {
      createFirstHabit.addEventListener('click', () => this.openHabitModal());
    }

    // Close modal
    if (closeModal) {
      closeModal.addEventListener('click', () => this.closeHabitModal());
    }
    
    if (cancelHabit) {
      cancelHabit.addEventListener('click', () => this.closeHabitModal());
    }

    // Form submission
    if (habitForm) {
      habitForm.addEventListener('submit', (e) => this.handleHabitSubmit(e));
    }

    // Click outside modal to close
    if (habitModal) {
      habitModal.addEventListener('click', (e) => {
        if (e.target === habitModal || e.target.classList.contains('modal-overlay')) {
          this.closeHabitModal();
        }
      });
    }

    // Delegate event listeners for habit cards
    document.addEventListener('click', (e) => {
      if (e.target.closest('.edit-habit')) {
        const habitId = e.target.closest('.edit-habit').dataset.habitId;
        this.editHabit(habitId);
      } else if (e.target.closest('.delete-habit')) {
        const habitId = e.target.closest('.delete-habit').dataset.habitId;
        this.deleteHabit(habitId);
      } else if (e.target.closest('.complete-habit')) {
        const habitId = e.target.closest('.complete-habit').dataset.habitId;
        this.completeHabit(habitId);
      }
    });
  }

  static openHabitModal(habit = null) {
    const modal = document.getElementById('habit-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('habit-form');
    
    if (!modal || !modalTitle || !form) return;

    // Reset form
    form.reset();
    
    if (habit) {
      modalTitle.textContent = 'Edit Habit';
      document.getElementById('habit-name').value = habit.name || '';
      document.getElementById('habit-description').value = habit.description || '';
      document.getElementById('habit-category').value = habit.category || '';
      document.getElementById('habit-frequency').value = habit.frequency || 'daily';
      document.getElementById('habit-target-streak').value = habit.target_streak || 30;
      form.dataset.habitId = habit.id;
    } else {
      modalTitle.textContent = 'Add New Habit';
      delete form.dataset.habitId;
    }

    modal.classList.remove('hidden');
  }

  static closeHabitModal() {
    const modal = document.getElementById('habit-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  static async handleHabitSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const habitId = form.dataset.habitId;
    
    const habitData = {
      name: document.getElementById('habit-name').value,
      description: document.getElementById('habit-description').value,
      category: document.getElementById('habit-category').value,
      frequency: document.getElementById('habit-frequency').value,
      target_streak: parseInt(document.getElementById('habit-target-streak').value)
    };

    try {
      if (habitId) {
        await API.put(`/habits/${habitId}`, habitData);
        Utils.showNotification('Habit updated successfully');
      } else {
        await API.post('/habits', habitData);
        Utils.showNotification('Habit created successfully');
      }
      
      this.closeHabitModal();
      await this.loadHabitsData();
    } catch (error) {
      console.error('Error saving habit:', error);
      Utils.showNotification('Error saving habit', 'error');
    }
  }

  static async editHabit(habitId) {
    try {
      const habit = await API.get(`/habits/${habitId}`);
      this.openHabitModal(habit);
    } catch (error) {
      console.error('Error loading habit:', error);
      Utils.showNotification('Error loading habit', 'error');
    }
  }

  static async deleteHabit(habitId) {
    if (!confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
      return;
    }

    try {
      await API.delete(`/habits/${habitId}`);
      Utils.showNotification('Habit deleted successfully');
      await this.loadHabitsData();
    } catch (error) {
      console.error('Error deleting habit:', error);
      Utils.showNotification('Error deleting habit', 'error');
    }
  }

  static async completeHabit(habitId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      await API.post('/habit-logs', {
        habit_id: habitId,
        date: today,
        completed: true
      });
      Utils.showNotification('Habit marked as complete for today!');
      await this.loadHabitsData();
    } catch (error) {
      console.error('Error completing habit:', error);
      Utils.showNotification('Error completing habit', 'error');
    }
  }
}

// Feelings Page Component
class FeelingsComponent {
  static currentYear = new Date().getFullYear();
  static currentMonth = new Date().getMonth();

  static async init() {
    if (window.APP_CONFIG.currentPage !== 'feelings') return;
    
    this.setupFeelingsPage();
    await this.loadFeelingsData();
  }

  static setupFeelingsPage() {
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    if (prevMonthBtn) {
      prevMonthBtn.addEventListener('click', () => this.navigateMonth(-1));
    }
    
    if (nextMonthBtn) {
      nextMonthBtn.addEventListener('click', () => this.navigateMonth(1));
    }
  }

  static navigateMonth(direction) {
    this.currentMonth += direction;
    
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear -= 1;
    } else if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear += 1;
    }
    
    this.loadFeelingsData();
  }

  static async loadFeelingsData() {
    try {
      const loadingState = document.getElementById('loading-state');
      const feelingsContent = document.getElementById('feelings-content');
      
      if (loadingState) loadingState.classList.remove('hidden');
      if (feelingsContent) feelingsContent.classList.add('hidden');

      // Format month for API call (YYYY-MM)
      const monthStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}`;
      
      // Fetch moods data for current month
      const moods = await API.get(`/moods?month=${monthStr}`);
      
      // Create moods map for quick lookup
      const moodsMap = {};
      moods.forEach(mood => {
        moodsMap[mood.date] = mood.rating;
      });

      // Update month/year title
      this.updateMonthTitle();
      
      // Generate calendar
      this.generateCalendar(moodsMap);

      if (loadingState) loadingState.classList.add('hidden');
      if (feelingsContent) feelingsContent.classList.remove('hidden');
      
    } catch (error) {
      console.error('Error loading feelings data:', error);
      Utils.showNotification('Error loading feelings data', 'error');
    }
  }

  static updateMonthTitle() {
    const monthYearElement = document.getElementById('month-year');
    if (monthYearElement) {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      monthYearElement.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
    }
  }

  static generateCalendar(moodsMap) {
    const calendarBody = document.getElementById('calendar-body');
    if (!calendarBody) return;

    // Get first day of month and number of days
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const today = new Date();
    const isCurrentMonth = this.currentYear === today.getFullYear() && this.currentMonth === today.getMonth();
    const todayDate = today.getDate();

    let html = '';
    let currentDate = new Date(startDate);

    // Generate 6 weeks of calendar
    for (let week = 0; week < 6; week++) {
      html += '<div class="calendar-week">';
      
      for (let day = 0; day < 7; day++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayOfMonth = currentDate.getDate();
        const isCurrentMonthDay = currentDate.getMonth() === this.currentMonth;
        const isToday = isCurrentMonth && isCurrentMonthDay && dayOfMonth === todayDate;
        const isPast = currentDate < today && !isToday;
        const isFuture = currentDate > today;
        
        const mood = moodsMap[dateStr] || null;

        html += `
          <div class="calendar-day ${isCurrentMonthDay ? 'current-month' : 'other-month'} ${isToday ? 'today' : ''}">
            <div class="day-number">${dayOfMonth}</div>
            <div class="mood-indicators">
              ${this.generateMoodIcons(dateStr, mood, isToday, isPast, isFuture, isCurrentMonthDay)}
            </div>
          </div>
        `;
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      html += '</div>';
    }

    calendarBody.innerHTML = html;
  }

  static generateMoodIcons(dateStr, selectedMood, isToday, isPast, isFuture, isCurrentMonth) {
    const moods = [
      { value: 1, emoji: '😡', label: 'Crap' },
      { value: 2, emoji: '😞', label: 'Bad' },
      { value: 3, emoji: '😐', label: 'Neutral' },
      { value: 4, emoji: '🙂', label: 'Good' },
      { value: 5, emoji: '😍', label: 'Awesome' }
    ];

    return moods.map(mood => {
      const isSelected = selectedMood === mood.value;
      const isClickable = isCurrentMonth && (isToday || isPast);
      
      return `
        <div class="mood-icon ${isSelected ? 'selected' : ''} ${isClickable ? 'clickable' : 'disabled'}" 
             data-mood="${mood.value}" 
             data-date="${dateStr}"
             ${isClickable ? `onclick="FeelingsComponent.selectMood('${dateStr}', ${mood.value})"` : ''}
             title="${mood.label}">
          ${mood.emoji}
        </div>
      `;
    }).join('');
  }

  static async selectMood(date, rating) {
    try {
      await API.post('/moods', {
        date: date,
        rating: rating
      });

      // Reload the calendar to show updated mood
      await this.loadFeelingsData();

      const moodLabels = {1: 'Crap', 2: 'Bad', 3: 'Neutral', 4: 'Good', 5: 'Awesome'};
      Utils.showNotification(`Mood set to ${moodLabels[rating]}!`, 'success');

    } catch (error) {
      console.error('Error saving mood:', error);
      Utils.showNotification('Error saving mood', 'error');
    }
  }
}

// Wisdom Page Component
class WisdomComponent {
  static currentWisdomId = null;
  static isEditMode = false;

  static async init() {
    if (window.APP_CONFIG.currentPage !== 'wisdom') return;
    
    await this.loadWisdomData();
    this.setupWisdomPage();
    this.setupMarkdownEditor();
  }

  static async loadWisdomData() {
    try {
      const loadingState = document.getElementById('loading-state');
      const content = document.getElementById('wisdom-content');
      
      if (loadingState) loadingState.classList.remove('hidden');
      if (content) content.classList.add('hidden');

      const wisdom = await API.get('/wisdom');
      
      this.renderWisdom(wisdom);
      
      if (loadingState) loadingState.classList.add('hidden');
      if (content) content.classList.remove('hidden');
    } catch (error) {
      console.error('Error loading wisdom:', error);
      Utils.showNotification('Error loading wisdom', 'error');
    }
  }

  static renderWisdom(wisdom) {
    const wisdomGrid = document.getElementById('wisdom-grid');
    const noWisdom = document.getElementById('no-wisdom');
    
    // Update stats
    this.updateStats(wisdom);
    
    if (wisdom.length === 0) {
      if (wisdomGrid) wisdomGrid.classList.add('hidden');
      if (noWisdom) noWisdom.classList.remove('hidden');
      return;
    }
    
    if (noWisdom) noWisdom.classList.add('hidden');
    if (wisdomGrid) wisdomGrid.classList.remove('hidden');
    
    if (wisdomGrid) {
      wisdomGrid.innerHTML = wisdom.map(item => `
        <div class="wisdom-item bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow" id="wisdom-${item.id}">
          <!-- Display View -->
          <div class="wisdom-display" id="wisdom-display-${item.id}">
            <!-- Header -->
            <div class="flex items-start justify-end mb-4">
              <div class="flex items-center gap-1">
                <button class="btn btn-sm ${item.is_favorite ? 'btn-warning' : 'btn-outline'}" onclick="WisdomComponent.toggleFavorite(${item.id})" title="${item.is_favorite ? 'Remove from favorites' : 'Add to favorites'}">
                  <svg class="icon" viewBox="0 0 24 24" fill="${item.is_favorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  <span class="sr-only">${item.is_favorite ? 'Remove from favorites' : 'Add to favorites'}</span>
                </button>
                <button class="btn btn-sm btn-outline" onclick="WisdomComponent.editWisdomInPlace(${item.id})" title="Edit Wisdom">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  <span class="sr-only">Edit Wisdom</span>
                </button>
                <button class="btn btn-sm btn-destructive" onclick="WisdomComponent.deleteWisdom(${item.id})" title="Delete Wisdom">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3,6 5,6 21,6"/>
                    <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                  </svg>
                  <span class="sr-only">Delete Wisdom</span>
                </button>
              </div>
            </div>

            <!-- Content -->
            <div class="wisdom-content text-gray-700 mb-4 leading-relaxed markdown-content">
              ${MarkdownParser.parse(item.content)}
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
              <div class="flex items-center gap-2">
                ${item.author ? `<span class="text-sm text-gray-600">— ${item.author}</span>` : ''}
              </div>
              <div class="flex items-center gap-2">
                ${item.category ? `<span class="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">${item.category}</span>` : ''}
                ${item.tags ? item.tags.split(',').map(tag => `<span class="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">${tag.trim()}</span>`).join('') : ''}
              </div>
            </div>

            <!-- Additional info -->
            ${item.source ? `<div class="text-xs text-gray-500 mt-2">${item.source}</div>` : ''}
            ${item.created_at ? `<div class="text-xs text-gray-400 mt-2">Added ${this.formatDate(item.created_at)}</div>` : ''}
          </div>

          <!-- Edit View -->
          <div class="wisdom-edit hidden" id="wisdom-edit-${item.id}">
            <form onsubmit="WisdomComponent.saveWisdomInPlace(event, ${item.id})">
              <!-- Markdown Editor -->
              <div class="mb-4">
                <label class="form-label mb-2 block">Content</label>
                <div class="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                  <!-- Toolbar -->
                  <div class="border-b border-gray-200 bg-gray-50 px-3 py-2 flex items-center gap-1">
                    <button type="button" class="toolbar-btn" data-action="bold" title="Bold">
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
                        <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
                      </svg>
                    </button>
                    <button type="button" class="toolbar-btn" data-action="italic" title="Italic">
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="19" y1="4" x2="10" y2="4"/>
                        <line x1="14" y1="20" x2="5" y2="20"/>
                        <line x1="15" y1="4" x2="9" y2="20"/>
                      </svg>
                    </button>
                    <div class="w-px h-6 bg-gray-300 mx-1"></div>
                    <button type="button" class="toolbar-btn" data-action="quote" title="Quote">
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
                        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
                      </svg>
                    </button>
                    <button type="button" class="toolbar-btn" data-action="link" title="Link">
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                      </svg>
                    </button>
                    <div class="w-px h-6 bg-gray-300 mx-1"></div>
                    <button type="button" class="toolbar-btn" id="preview-toggle-${item.id}" title="Preview">
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                  </div>
                  
                  <!-- Editor/Preview Area -->
                  <textarea 
                    class="w-full p-4 border-none resize-none focus:outline-none" 
                    rows="8" 
                    name="content" 
                    id="wisdom-content-${item.id}"
                    placeholder="Enter your wisdom..."
                  >${item.content || ''}</textarea>
                  <div class="hidden p-4 prose max-w-none" id="wisdom-preview-${item.id}"></div>
                </div>
              </div>

              <!-- Other Fields -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="form-label">Author</label>
                  <input type="text" name="author" class="form-input" value="${item.author || ''}" placeholder="Author name">
                </div>
                <div>
                  <label class="form-label">Category</label>
                  <input type="text" name="category" class="form-input" value="${item.category || ''}" placeholder="Category">
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="form-label">Tags</label>
                  <input type="text" name="tags" class="form-input" value="${item.tags || ''}" placeholder="Comma-separated tags">
                </div>
                <div>
                  <label class="form-label">Source</label>
                  <input type="text" name="source" class="form-input" value="${item.source || ''}" placeholder="Source">
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-2">
                <button type="submit" class="btn btn-primary">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17,21 17,13 7,13 7,21"/>
                    <polyline points="7,3 7,8 15,8"/>
                  </svg>
                  Save Changes
                </button>
                <button type="button" onclick="WisdomComponent.cancelEditInPlace(${item.id})" class="btn btn-secondary">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      `).join('');
      
      // Set up markdown editor functionality for each item
      wisdom.forEach(item => {
        this.setupMarkdownEditorForItem(item.id);
      });
    }
  }

  static updateStats(wisdom) {
    // Update total items
    const totalItems = document.getElementById('total-items');
    if (totalItems) totalItems.textContent = wisdom.length;

    // Update favorites count
    const favoriteCount = document.getElementById('favorite-count');
    const favorites = wisdom.filter(item => item.is_favorite).length;
    if (favoriteCount) favoriteCount.textContent = favorites;

    // Update categories count
    const categoryCount = document.getElementById('category-count');
    const uniqueCategories = [...new Set(wisdom.filter(item => item.category).map(item => item.category))];
    if (categoryCount) categoryCount.textContent = uniqueCategories.length;

    // Update authors count
    const authorCount = document.getElementById('author-count');
    const uniqueAuthors = [...new Set(wisdom.filter(item => item.author).map(item => item.author))];
    if (authorCount) authorCount.textContent = uniqueAuthors.length;
  }

  static formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  static setupWisdomPage() {
    // Add wisdom button
    const addWisdomBtn = document.getElementById('add-wisdom-btn');
    if (addWisdomBtn) {
      addWisdomBtn.addEventListener('click', () => {
        this.openWisdomForm();
      });
    }

    // Create first wisdom button
    const createFirstWisdom = document.getElementById('create-first-wisdom');
    if (createFirstWisdom) {
      createFirstWisdom.addEventListener('click', () => {
        this.openWisdomForm();
      });
    }

    // Cancel button
    const cancelWisdom = document.getElementById('cancel-wisdom');
    if (cancelWisdom) {
      cancelWisdom.addEventListener('click', () => {
        this.closeWisdomForm();
      });
    }

    // Save button
    const saveWisdom = document.getElementById('save-wisdom');
    if (saveWisdom) {
      saveWisdom.addEventListener('click', (e) => {
        e.preventDefault();
        this.saveWisdom();
      });
    }

    // Form submission
    const wisdomForm = document.getElementById('wisdom-form');
    if (wisdomForm) {
      wisdomForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveWisdom();
      });
    }

    // Character counter for notes
    const notesField = document.getElementById('wisdom-notes');
    const charCount = document.getElementById('notes-char-count');
    if (notesField && charCount) {
      notesField.addEventListener('input', () => {
        charCount.textContent = `${notesField.value.length} characters`;
      });
    }
  }

  static setupMarkdownEditor() {
    // Toolbar buttons
    const toolbarButtons = document.querySelectorAll('.toolbar-btn');
    toolbarButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const action = btn.dataset.action;
        if (action) {
          this.handleToolbarAction(action);
        }
      });
    });

    // Preview toggle button
    const previewToggle = document.getElementById('preview-toggle');
    const wisdomContent = document.getElementById('wisdom-content');
    const markdownPreview = document.getElementById('markdown-preview');
    let isPreviewMode = false;

    if (previewToggle && wisdomContent && markdownPreview) {
      previewToggle.addEventListener('click', () => {
        isPreviewMode = !isPreviewMode;
        
        if (isPreviewMode) {
          // Switch to preview
          wisdomContent.classList.add('hidden');
          markdownPreview.classList.remove('hidden');
          markdownPreview.innerHTML = MarkdownParser.parse(wisdomContent.value);
          previewToggle.classList.add('bg-blue-100', 'text-blue-600');
        } else {
          // Switch to edit
          wisdomContent.classList.remove('hidden');
          markdownPreview.classList.add('hidden');
          previewToggle.classList.remove('bg-blue-100', 'text-blue-600');
          wisdomContent.focus();
        }
      });
    }

    // Fullscreen toggle
    const fullscreenToggle = document.getElementById('fullscreen-toggle');
    const editorContainer = document.querySelector('.bg-white.border.border-gray-300.rounded-lg.overflow-hidden.shadow-sm');
    let isFullscreen = false;

    if (fullscreenToggle && editorContainer) {
      fullscreenToggle.addEventListener('click', () => {
        isFullscreen = !isFullscreen;
        
        if (isFullscreen) {
          editorContainer.classList.add('fixed', 'inset-4', 'z-50', 'shadow-2xl');
          // Increase editor height in fullscreen
          if (wisdomContent) wisdomContent.style.height = 'calc(100vh - 200px)';
          if (markdownPreview) markdownPreview.style.height = 'calc(100vh - 200px)';
          fullscreenToggle.classList.add('bg-blue-100', 'text-blue-600');
        } else {
          editorContainer.classList.remove('fixed', 'inset-4', 'z-50', 'shadow-2xl');
          // Reset editor height
          if (wisdomContent) wisdomContent.style.height = '320px';
          if (markdownPreview) markdownPreview.style.height = '320px';
          fullscreenToggle.classList.remove('bg-blue-100', 'text-blue-600');
        }
      });

      // ESC key to exit fullscreen
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isFullscreen) {
          fullscreenToggle.click();
        }
      });
    }

    // Add CSS classes for toolbar buttons
    const style = document.createElement('style');
    style.textContent = `
      .toolbar-btn {
        padding: 8px;
        border: none;
        background: none;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }
      .toolbar-btn:hover {
        background-color: #f3f4f6;
      }
      .toolbar-btn.bg-blue-100 {
        background-color: #dbeafe !important;
      }
      .toolbar-btn.text-blue-600 {
        color: #2563eb !important;
      }
    `;
    document.head.appendChild(style);
  }

  static handleToolbarAction(action) {
    const textarea = document.getElementById('wisdom-content');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);

    let newText = '';
    let newCursorPos = start;

    switch (action) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`;
        newCursorPos = start + 2;
        break;
      case 'italic':
        newText = `*${selectedText || 'italic text'}*`;
        newCursorPos = start + 1;
        break;
      case 'underline':
        newText = `<u>${selectedText || 'underlined text'}</u>`;
        newCursorPos = start + 3;
        break;
      case 'unordered-list':
        newText = `- ${selectedText || 'list item'}`;
        newCursorPos = start + 2;
        break;
      case 'ordered-list':
        newText = `1. ${selectedText || 'list item'}`;
        newCursorPos = start + 3;
        break;
      case 'quote':
        newText = `> ${selectedText || 'quote text'}`;
        newCursorPos = start + 2;
        break;
      case 'code':
        if (selectedText.includes('\n')) {
          // Multi-line code block
          newText = `\`\`\`\n${selectedText || 'code block'}\n\`\`\``;
          newCursorPos = start + 4;
        } else {
          // Inline code
          newText = `\`${selectedText || 'code'}\``;
          newCursorPos = start + 1;
        }
        break;
      case 'link':
        const url = selectedText.startsWith('http') ? selectedText : 'https://example.com';
        const linkText = selectedText.startsWith('http') ? 'link text' : selectedText || 'link text';
        newText = `[${linkText}](${url})`;
        newCursorPos = start + 1;
        break;
      case 'image':
        const imageUrl = selectedText.startsWith('http') ? selectedText : 'https://example.com/image.jpg';
        const altText = selectedText.startsWith('http') ? 'alt text' : selectedText || 'alt text';
        newText = `![${altText}](${imageUrl})`;
        newCursorPos = start + 2;
        break;
    }

    textarea.value = beforeText + newText + afterText;
    textarea.focus();
    
    if (selectedText) {
      textarea.setSelectionRange(newCursorPos, newCursorPos + selectedText.length);
    } else {
      const placeholder = newText.match(/\*\*(.*?)\*\*|\*(.*?)\*|`(.*?)`|\[(.*?)\]|\!\[(.*?)\]/);
      if (placeholder) {
        const placeholderText = placeholder[1] || placeholder[2] || placeholder[3] || placeholder[4] || placeholder[5];
        const placeholderStart = beforeText.length + newText.indexOf(placeholderText);
        textarea.setSelectionRange(placeholderStart, placeholderStart + placeholderText.length);
      }
    }
  }

  static openWisdomForm(wisdomId = null) {
    const wisdomListView = document.querySelector('.bg-gray-50:not(#wisdom-form-page)');
    const formPage = document.getElementById('wisdom-form-page');
    const formTitle = document.getElementById('form-page-title');
    
    this.currentWisdomId = wisdomId;
    this.isEditMode = !!wisdomId;

    if (formTitle) {
      formTitle.textContent = this.isEditMode ? 'Edit Wisdom ✨' : 'Add New Wisdom ✨';
    }

    // Hide wisdom list and show form
    if (wisdomListView) wisdomListView.classList.add('hidden');
    if (formPage) formPage.classList.remove('hidden');

    if (this.isEditMode && wisdomId) {
      this.populateForm(wisdomId);
    } else {
      this.clearForm();
    }

    // Focus on content textarea
    setTimeout(() => {
      const contentTextarea = document.getElementById('wisdom-content');
      if (contentTextarea) contentTextarea.focus();
    }, 100);
  }

  static closeWisdomForm() {
    const wisdomListView = document.querySelector('.bg-gray-50:not(#wisdom-form-page)');
    const formPage = document.getElementById('wisdom-form-page');
    
    // Show wisdom list and hide form
    if (formPage) formPage.classList.add('hidden');
    if (wisdomListView) wisdomListView.classList.remove('hidden');
    
    this.clearForm();
    this.currentWisdomId = null;
    this.isEditMode = false;
  }

  static clearForm() {
    const form = document.getElementById('wisdom-form');
    if (form) {
      form.reset();
    }
    
    // Reset character counter
    const charCount = document.getElementById('notes-char-count');
    if (charCount) {
      charCount.textContent = '0 characters';
    }
    
    // Reset preview
    const wisdomContent = document.getElementById('wisdom-content');
    const markdownPreview = document.getElementById('markdown-preview');
    
    if (wisdomContent && markdownPreview) {
      wisdomContent.classList.remove('hidden');
      markdownPreview.classList.add('hidden');
    }
  }

  static async populateForm(wisdomId) {
    try {
      const wisdom = await API.get('/wisdom');
      const item = wisdom.find(w => w.id === wisdomId);
      
      if (item) {
        const contentField = document.getElementById('wisdom-content');
        const authorField = document.getElementById('wisdom-author');
        const categoryField = document.getElementById('wisdom-category');
        const tagsField = document.getElementById('wisdom-tags');
        const sourceField = document.getElementById('wisdom-source');
        const notesField = document.getElementById('wisdom-notes');
        const charCount = document.getElementById('notes-char-count');

        if (contentField) contentField.value = item.content || '';
        if (authorField) authorField.value = item.author || '';
        if (categoryField) categoryField.value = item.category || '';
        if (tagsField) tagsField.value = item.tags || '';
        if (sourceField) sourceField.value = item.source || '';
        if (notesField) {
          notesField.value = item.notes || '';
          // Update character counter
          if (charCount) {
            charCount.textContent = `${notesField.value.length} characters`;
          }
        }
      }
    } catch (error) {
      console.error('Error loading wisdom for edit:', error);
      Utils.showNotification('Error loading wisdom for editing', 'error');
    }
  }

  static async saveWisdom() {
    try {
      const formData = {
        content: document.getElementById('wisdom-content').value.trim(),
        author: document.getElementById('wisdom-author').value.trim(),
        category: document.getElementById('wisdom-category').value.trim(),
        tags: document.getElementById('wisdom-tags').value.trim(),
        source: document.getElementById('wisdom-source').value.trim(),
        notes: document.getElementById('wisdom-notes').value.trim()
      };

      if (!formData.content) {
        Utils.showNotification('Please enter some wisdom content', 'error');
        return;
      }

      if (this.isEditMode && this.currentWisdomId) {
        await API.put(`/wisdom/${this.currentWisdomId}`, formData);
        Utils.showNotification('Wisdom updated successfully! 🎉', 'success');
      } else {
        await API.post('/wisdom', formData);
        Utils.showNotification('Wisdom created successfully! ✨', 'success');
      }

      this.closeWisdomForm();
      await this.loadWisdomData();
    } catch (error) {
      console.error('Error saving wisdom:', error);
      Utils.showNotification('Error saving wisdom', 'error');
    }
  }

  static editWisdomInPlace(wisdomId) {
    const displayDiv = document.getElementById(`wisdom-display-${wisdomId}`);
    const editDiv = document.getElementById(`wisdom-edit-${wisdomId}`);
    
    if (displayDiv && editDiv) {
      displayDiv.classList.add('hidden');
      editDiv.classList.remove('hidden');
      
      // Focus on the content textarea
      const textarea = document.getElementById(`wisdom-content-${wisdomId}`);
      if (textarea) {
        textarea.focus();
      }
    }
  }

  static cancelEditInPlace(wisdomId) {
    const displayDiv = document.getElementById(`wisdom-display-${wisdomId}`);
    const editDiv = document.getElementById(`wisdom-edit-${wisdomId}`);
    
    if (displayDiv && editDiv) {
      displayDiv.classList.remove('hidden');
      editDiv.classList.add('hidden');
    }
  }

  static async saveWisdomInPlace(event, wisdomId) {
    event.preventDefault();
    
    try {
      const form = event.target;
      const formData = new FormData(form);
      
      const wisdomData = {
        content: formData.get('content').trim(),
        author: formData.get('author').trim(),
        category: formData.get('category').trim(),
        tags: formData.get('tags').trim(),
        source: formData.get('source').trim()
      };

      if (!wisdomData.content) {
        Utils.showNotification('Please enter some wisdom content', 'error');
        return;
      }

      await API.put(`/wisdom/${wisdomId}`, wisdomData);
      
      // Return to display view and refresh the data
      this.cancelEditInPlace(wisdomId);
      await this.loadWisdomData();
      
      Utils.showNotification('Wisdom updated successfully! 🎉', 'success');
      
    } catch (error) {
      console.error('Error updating wisdom:', error);
      Utils.showNotification('Error updating wisdom', 'error');
    }
  }

  static setupMarkdownEditorForItem(wisdomId) {
    const textarea = document.getElementById(`wisdom-content-${wisdomId}`);
    const previewDiv = document.getElementById(`wisdom-preview-${wisdomId}`);
    const previewToggle = document.getElementById(`preview-toggle-${wisdomId}`);
    
    if (!textarea || !previewDiv || !previewToggle) return;

    let isPreviewMode = false;

    // Preview toggle functionality
    previewToggle.addEventListener('click', (e) => {
      e.preventDefault();
      isPreviewMode = !isPreviewMode;
      
      if (isPreviewMode) {
        // Switch to preview
        textarea.classList.add('hidden');
        previewDiv.classList.remove('hidden');
        previewDiv.innerHTML = MarkdownParser.parse(textarea.value);
        previewToggle.classList.add('bg-blue-100', 'text-blue-600');
      } else {
        // Switch to edit
        textarea.classList.remove('hidden');
        previewDiv.classList.add('hidden');
        previewToggle.classList.remove('bg-blue-100', 'text-blue-600');
        textarea.focus();
      }
    });

    // Toolbar functionality
    const editDiv = document.getElementById(`wisdom-edit-${wisdomId}`);
    if (editDiv) {
      const toolbarButtons = editDiv.querySelectorAll('.toolbar-btn[data-action]');
      toolbarButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const action = btn.dataset.action;
          if (action) {
            this.handleToolbarActionForItem(action, textarea);
          }
        });
      });
    }
  }

  static handleToolbarActionForItem(action, textarea) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);

    let newText = '';
    let newCursorPos = start;

    switch (action) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`;
        newCursorPos = start + 2;
        break;
      case 'italic':
        newText = `*${selectedText || 'italic text'}*`;
        newCursorPos = start + 1;
        break;
      case 'quote':
        newText = `> ${selectedText || 'quote text'}`;
        newCursorPos = start + 2;
        break;
      case 'link':
        const url = selectedText.startsWith('http') ? selectedText : 'https://example.com';
        const linkText = selectedText.startsWith('http') ? 'link text' : selectedText || 'link text';
        newText = `[${linkText}](${url})`;
        newCursorPos = start + 1;
        break;
    }

    textarea.value = beforeText + newText + afterText;
    textarea.focus();
    
    if (selectedText) {
      textarea.setSelectionRange(newCursorPos, newCursorPos + selectedText.length);
    } else {
      const placeholder = newText.match(/\*\*(.*?)\*\*|\*(.*?)\*|\[(.*?)\]/);
      if (placeholder) {
        const placeholderText = placeholder[1] || placeholder[2] || placeholder[3];
        const placeholderStart = beforeText.length + newText.indexOf(placeholderText);
        textarea.setSelectionRange(placeholderStart, placeholderStart + placeholderText.length);
      }
    }
  }

  static async editWisdom(wisdomId) {
    this.openWisdomForm(wisdomId);
  }

  static async toggleFavorite(wisdomId) {
    try {
      const wisdom = await API.get('/wisdom');
      const item = wisdom.find(w => w.id === wisdomId);
      const newFavoriteStatus = !item.is_favorite;
      
      await API.put(`/wisdom/${wisdomId}`, { is_favorite: newFavoriteStatus });
      await this.loadWisdomData();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Utils.showNotification('Error updating favorite', 'error');
    }
  }

  static async deleteWisdom(wisdomId) {
    if (confirm('Are you sure you want to delete this wisdom entry?')) {
      try {
        await API.delete(`/wisdom/${wisdomId}`);
        Utils.showNotification('Wisdom deleted successfully', 'success');
        await this.loadWisdomData();
      } catch (error) {
        console.error('Error deleting wisdom:', error);
        Utils.showNotification('Error deleting wisdom', 'error');
      }
    }
  }
}

// Global functions for page templates
window.loadFocusAreasData = function() {
  FocusAreasComponent.loadFocusAreasData();
};

window.loadWisdomData = function() {
  WisdomComponent.loadWisdomData();
};

window.setupWisdomPage = function() {
  WisdomComponent.setupWisdomPage();
};

window.loadHabitsData = function() {
  HabitsComponent.loadHabitsData();
};

window.setupHabitsPage = function() {
  HabitsComponent.setupHabitsPage();
};

// Global function for handling checkbox changes from weekly view
window.handleCheckboxChange = function(checkboxElement) {
  HabitsComponent.handleCheckboxChange(checkboxElement);
};

// Global function for toggling habit logs from weekly view (legacy support)
window.toggleHabitLog = function(habitId, date, buttonElement) {
  HabitsComponent.toggleHabitLog(habitId, date, buttonElement);
};

// Global wisdom functions
window.toggleWisdomFavorite = async function(wisdomId) {
  try {
    const wisdom = await API.get('/wisdom');
    const item = wisdom.find(w => w.id === wisdomId);
    const newFavoriteStatus = !item.is_favorite;
    
    await API.put(`/wisdom/${wisdomId}`, { is_favorite: newFavoriteStatus });
    WisdomComponent.loadWisdomData();
    Utils.showNotification(
      newFavoriteStatus ? 'Added to favorites' : 'Removed from favorites', 
      'success'
    );
  } catch (error) {
    console.error('Error toggling favorite:', error);
    Utils.showNotification('Error updating favorite', 'error');
  }
};

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  DashboardComponent.init();
  GoalsComponent.init();
  FocusAreasComponent.init();
  HabitsComponent.init();
  FeelingsComponent.init();
  WisdomComponent.init();
  AIChatComponent.init();
});

// Export for use in other files
window.DashboardComponent = DashboardComponent;
window.GoalsComponent = GoalsComponent;
window.FocusAreasComponent = FocusAreasComponent;
window.HabitsComponent = HabitsComponent;
window.FeelingsComponent = FeelingsComponent;
window.WisdomComponent = WisdomComponent;
window.AIChatComponent = AIChatComponent;

// Global functions for feelings page
window.loadFeelingsData = function() {
  FeelingsComponent.loadFeelingsData();
};

window.setupFeelingsPage = function() {
  FeelingsComponent.setupFeelingsPage();
};