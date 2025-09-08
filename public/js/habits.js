// Habits Page Component - used on the habits page

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
                ${weekDates.map((date) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const log = habitLogs.find(log => log.date === dateStr);
                  const isCompleted = log?.completed || false;
                  const isToday = dateStr === new Date().toISOString().split('T')[0];
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

// Global functions for page templates
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

// Export for use in other files
window.HabitsComponent = HabitsComponent;