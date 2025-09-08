class GoalsWidget {
  static async init() {
    if (window.APP_CONFIG.currentPage !== 'dashboard') return;

    await this.loadGoals();
  }

  static async loadGoals() {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const week = this.getWeekNumber(now);

      const [annualGoals, monthlyGoals, weeklyGoals] = await Promise.all([
        API.get(`/goals?type=annual&target_year=${year}`),
        API.get(`/goals?type=monthly&target_year=${year}&target_month=${month}`),
        API.get(`/goals?type=weekly&target_year=${year}&target_week=${week}`),
      ]);

      this.renderGoals('annual-goals-widget', annualGoals, 'annual');
      this.renderGoals('monthly-goals-widget', monthlyGoals, 'monthly', annualGoals);
      this.renderGoals('weekly-goals-widget', weeklyGoals, 'weekly', annualGoals);
    } catch (error) {
      console.error('Error loading goals for widget:', error);
    }
  }

  static renderGoals(containerId, goals, goalType, fallbackGoals = []) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (goals.length === 0) {
      // Check if we should show fallback goals or a no goals message
      if (goalType !== 'annual' && fallbackGoals && fallbackGoals.length > 0) {
        // Show annual goals as fallback for monthly/weekly with a note
        container.innerHTML = `
          <div class="mb-3">
            <p class="text-sm text-muted-foreground mb-2">
              No ${goalType} goals yet. Here are your annual goals:
            </p>
            ${fallbackGoals.slice(0, 2).map(goal => this.getGoalHtml(goal, true)).join('')}
          </div>
        `;
      } else if (fallbackGoals && fallbackGoals.length === 0) {
        // No goals at all - show friendly message
        container.innerHTML = `
          <div class="text-center py-6">
            <p class="text-sm font-medium text-foreground mb-1">No goals yet</p>
            <p class="text-xs text-muted-foreground mb-3">Ready to start your journey?</p>
            <br/><br/><br/>
            <a href="/goals" class="btn btn-sm btn-primary">
              Create Goal
            </a>
          </div>
        `;
      } else {
        // Default no goals message
        container.innerHTML = '<p class="text-muted-foreground">No goals found for this period.</p>';
      }
      return;
    }

    container.innerHTML = goals.map(goal => this.getGoalHtml(goal)).join('');
  }

  static getGoalHtml(goal, isFallback = false) {
    const progressColor = goal.progress >= 75 ? 'bg-green-500' : goal.progress >= 50 ? 'bg-blue-500' : goal.progress >= 25 ? 'bg-yellow-500' : 'bg-gray-300';
    
    return `
      <div class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${isFallback ? 'opacity-75' : ''}" style="width: calc(33.333% - 1rem); min-width: 280px;" id="widget-goal-${goal.id}">
        <div class="p-6">
          <!-- Goal Header -->
          <div class="mb-4">
            <h3 class="goal-title">
              ${goal.title}${isFallback ? ' <span class="text-xs text-gray-500 font-normal">(Annual)</span>' : ''}
            </h3>
            ${goal.description ? `<p class="goal-description">${goal.description}</p>` : ''}
          </div>
          
          <!-- Progress Section -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">Progress</span>
              <span class="text-sm font-bold text-gray-900">${goal.progress || 0}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div class="h-2.5 rounded-full ${progressColor} transition-all duration-300" style="width: ${goal.progress || 0}%"></div>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-100" style="padding-top:10px">
            <div class="flex items-center space-x-2">
              <input type="range" min="0" max="100" value="${goal.progress || 0}" 
                     onchange="GoalsWidget.updateProgress(${goal.id}, this.value)" 
                     class="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                     title="Update Progress">
            </div>
            <button class="btn btn-xs btn-outline" onclick="GoalsWidget.markAsDone(${goal.id})" title="Mark Complete">
              ✓
            </button>
          </div>
        </div>
      </div>
    `;
  }

  static async updateProgress(goalId, progress) {
    try {
      await API.put(`/goals/${goalId}/progress`, { progress });
      const goalElement = document.getElementById(`widget-goal-${goalId}`);
      if (goalElement) {
        // Update progress bar
        const progressBar = goalElement.querySelector('.h-2\\.5');
        if (progressBar) {
          progressBar.style.width = `${progress}%`;
          // Update progress bar color
          const progressColor = progress >= 75 ? 'bg-green-500' : progress >= 50 ? 'bg-blue-500' : progress >= 25 ? 'bg-yellow-500' : 'bg-gray-300';
          progressBar.className = `h-2.5 rounded-full ${progressColor} transition-all duration-300`;
        }
        
        // Update percentage text
        const progressText = goalElement.querySelector('.text-sm.font-bold');
        if (progressText) {
          progressText.textContent = `${progress}%`;
        }
        
        // Update range input
        const rangeInput = goalElement.querySelector('input[type="range"]');
        if (rangeInput) {
          rangeInput.value = progress;
        }
      }
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  }

  static async markAsDone(goalId) {
    await this.updateProgress(goalId, 100);
  }

  static getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
  }
}

window.GoalsWidget = GoalsWidget;
