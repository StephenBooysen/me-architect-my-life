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

      this.renderGoals('annual-goals-widget', annualGoals);
      this.renderGoals('monthly-goals-widget', monthlyGoals);
      this.renderGoals('weekly-goals-widget', weeklyGoals);
    } catch (error) {
      console.error('Error loading goals for widget:', error);
    }
  }

  static renderGoals(containerId, goals) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (goals.length === 0) {
      container.innerHTML = '<p class="text-muted-foreground">No goals found for this period.</p>';
      return;
    }

    container.innerHTML = goals.map(goal => this.getGoalHtml(goal)).join('');
  }

  static getGoalHtml(goal) {
    return `
      <div class="goal-item" id="widget-goal-${goal.id}">
        <div class="goal-title">${goal.title}</div>
        <div class="goal-progress-container">
          <div class="goal-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${goal.progress || 0}%"></div>
            </div>
            <span class="progress-value">${goal.progress || 0}%</span>
          </div>
          <input type="range" min="0" max="100" value="${goal.progress || 0}" onchange="GoalsWidget.updateProgress(${goal.id}, this.value)" title="Update Progress" style="opacity: 0;">
        </div>
        <div class="goal-actions">
          <button class="btn btn-sm btn-outline" onclick="GoalsWidget.markAsDone(${goal.id})">Done</button>
        </div>
      </div>
    `;
  }

  static async updateProgress(goalId, progress) {
    try {
      await API.put(`/goals/${goalId}/progress`, { progress });
      const goalElement = document.getElementById(`widget-goal-${goalId}`);
      if (goalElement) {
        goalElement.querySelector('.progress-fill').style.width = `${progress}%`;
        goalElement.querySelector('.progress-value').textContent = `${progress}%`;
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
