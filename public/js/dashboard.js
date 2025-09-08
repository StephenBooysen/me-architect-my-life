// Dashboard Component - used on the dashboard page

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

// Export for use in other files
window.DashboardComponent = DashboardComponent;