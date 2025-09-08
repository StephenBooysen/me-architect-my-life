// Feelings Page Component - used on the feelings page

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

// Global functions for feelings page
window.loadFeelingsData = function() {
  FeelingsComponent.loadFeelingsData();
};

window.setupFeelingsPage = function() {
  FeelingsComponent.setupFeelingsPage();
};

// Export for use in other files
window.FeelingsComponent = FeelingsComponent;