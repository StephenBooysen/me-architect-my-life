// Main JavaScript functionality for Architect My Life

// Global app state
window.AppState = {
  currentTheme: 'light',
  sidebarVisible: true,
  aiChatVisible: true,
  currentUser: null,
  apiKey: null
};

// API Helper functions
class API {
  static async get(endpoint) {
    try {
      const response = await fetch(`${window.APP_CONFIG.apiBase}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API GET error:', error);
      throw error;
    }
  }

  static async post(endpoint, data = {}) {
    try {
      const response = await fetch(`${window.APP_CONFIG.apiBase}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API POST error:', error);
      throw error;
    }
  }

  static async put(endpoint, data = {}) {
    try {
      const response = await fetch(`${window.APP_CONFIG.apiBase}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API PUT error:', error);
      throw error;
    }
  }

  static async delete(endpoint) {
    try {
      const response = await fetch(`${window.APP_CONFIG.apiBase}${endpoint}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API DELETE error:', error);
      throw error;
    }
  }
}

// Theme Management
class ThemeManager {
  static init() {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.setTheme(savedTheme);
    
    // Set up theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        this.toggleTheme();
      });
    }
  }

  static setTheme(theme) {
    window.AppState.currentTheme = theme;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }

  static toggleTheme() {
    const newTheme = window.AppState.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
}

// Layout Management
class LayoutManager {
  static init() {
    // Load sidebar/AI chat visibility preferences
    const savedSidebarState = localStorage.getItem('sidebar-visible');
    const savedAiChatState = localStorage.getItem('ai-chat-visible');
    
    if (savedSidebarState !== null) {
      window.AppState.sidebarVisible = JSON.parse(savedSidebarState);
    }
    
    if (savedAiChatState !== null) {
      window.AppState.aiChatVisible = JSON.parse(savedAiChatState);
    }

    this.updateLayout();
    this.setupToggleButtons();
  }

  static updateLayout() {
    const appLayout = document.getElementById('app-layout');
    const sidebar = document.getElementById('sidebar');
    const aiChat = document.getElementById('ai-chat');

    if (appLayout) {
      appLayout.classList.toggle('sidebar-hidden', !window.AppState.sidebarVisible);
      appLayout.classList.toggle('ai-chat-hidden', !window.AppState.aiChatVisible);
    }

    // For mobile, add/remove show class
    if (window.innerWidth <= 768) {
      if (sidebar) {
        sidebar.classList.toggle('show', window.AppState.sidebarVisible);
      }
      if (aiChat) {
        aiChat.classList.toggle('show', window.AppState.aiChatVisible);
      }
    }
  }

  static setupToggleButtons() {
    const sidebarToggle = document.getElementById('toggle-sidebar');
    const aiChatToggle = document.getElementById('toggle-ai-chat');

    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        this.toggleSidebar();
      });
    }

    if (aiChatToggle) {
      aiChatToggle.addEventListener('click', () => {
        this.toggleAiChat();
      });
    }
  }

  static toggleSidebar() {
    window.AppState.sidebarVisible = !window.AppState.sidebarVisible;
    localStorage.setItem('sidebar-visible', JSON.stringify(window.AppState.sidebarVisible));
    this.updateLayout();
  }

  static toggleAiChat() {
    window.AppState.aiChatVisible = !window.AppState.aiChatVisible;
    localStorage.setItem('ai-chat-visible', JSON.stringify(window.AppState.aiChatVisible));
    this.updateLayout();
  }
}

// Search functionality
class SearchManager {
  static init() {
    const searchInput = document.getElementById('search-input');
    const searchDropdown = document.getElementById('search-dropdown');
    
    if (searchInput) {
      searchInput.addEventListener('input', this.debounce((e) => {
        this.performSearch(e.target.value);
      }, 300));

      searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim()) {
          this.showDropdown();
        }
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('#search-container')) {
          this.hideDropdown();
        }
      });
    }
  }

  static async performSearch(query) {
    if (!query.trim()) {
      this.hideDropdown();
      return;
    }

    try {
      // Implement search across different data types
      const [goals, habits, wisdom] = await Promise.all([
        API.get('/goals'),
        API.get('/habits'),
        API.get('/wisdom')
      ]);

      const results = [];
      
      // Search goals
      goals.forEach(goal => {
        if (goal.title.toLowerCase().includes(query.toLowerCase()) || 
            goal.description?.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            type: 'goal',
            title: goal.title,
            description: goal.description,
            url: `/goals?id=${goal.id}`
          });
        }
      });

      // Search habits
      habits.forEach(habit => {
        if (habit.name.toLowerCase().includes(query.toLowerCase()) ||
            habit.description?.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            type: 'habit',
            title: habit.name,
            description: habit.description,
            url: `/habits?id=${habit.id}`
          });
        }
      });

      // Search wisdom
      wisdom.forEach(w => {
        if (w.content.toLowerCase().includes(query.toLowerCase()) ||
            w.author?.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            type: 'wisdom',
            title: w.content.substring(0, 50) + '...',
            description: `By ${w.author || 'Unknown'}`,
            url: `/wisdom?id=${w.id}`
          });
        }
      });

      this.displaySearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    }
  }

  static displaySearchResults(results) {
    const searchResults = document.getElementById('search-results');
    if (!searchResults) return;

    if (results.length === 0) {
      searchResults.innerHTML = '<div class="p-4 text-muted-foreground text-center">No results found</div>';
    } else {
      searchResults.innerHTML = results.map(result => `
        <a href="${result.url}" class="block p-4 hover:bg-secondary transition-colors">
          <div class="flex items-center">
            <div class="w-8 h-8 rounded bg-primary/20 flex items-center justify-center mr-3">
              <span class="text-xs text-primary">${result.type[0].toUpperCase()}</span>
            </div>
            <div class="flex-1">
              <div class="font-medium text-sm">${result.title}</div>
              <div class="text-xs text-muted-foreground">${result.description}</div>
            </div>
          </div>
        </a>
      `).join('');
    }

    this.showDropdown();
  }

  static showDropdown() {
    const dropdown = document.getElementById('search-dropdown');
    if (dropdown) {
      dropdown.classList.add('show');
    }
  }

  static hideDropdown() {
    const dropdown = document.getElementById('search-dropdown');
    if (dropdown) {
      dropdown.classList.remove('show');
    }
  }

  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Utility functions
class Utils {
  static formatDate(date, format = 'long') {
    const options = {
      short: { month: 'short', day: 'numeric' },
      long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      numeric: { year: 'numeric', month: '2-digit', day: '2-digit' }
    };

    return new Date(date).toLocaleDateString('en-US', options[format] || options.long);
  }

  static showNotification(message, type = 'info', duration = 3000) {
    // Simple notification system
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;

    const colors = {
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };

    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);

    // Remove after duration
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, duration);
  }

  static async loadTemplate(templateName, data = {}) {
    // Helper to render templates client-side if needed
    try {
      const response = await fetch(`/templates/${templateName}.html`);
      const template = await response.text();
      
      // Simple template replacement
      return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key] || '';
      });
    } catch (error) {
      console.error('Template loading error:', error);
      return '';
    }
  }
}

// Progress bar component
class ProgressBar {
  static create(container, value = 0, max = 100) {
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    
    const progressFill = document.createElement('div');
    progressFill.className = 'progress-fill';
    progressFill.style.width = `${(value / max) * 100}%`;
    
    progressBar.appendChild(progressFill);
    container.appendChild(progressBar);
    
    return {
      update: (newValue) => {
        progressFill.style.width = `${(newValue / max) * 100}%`;
      }
    };
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Update current date in header
  const currentDateElement = document.getElementById('current-date');
  if (currentDateElement) {
    currentDateElement.textContent = Utils.formatDate(new Date());
  }

  // Initialize managers
  ThemeManager.init();
  LayoutManager.init();
  SearchManager.init();

  // Initialize page-specific components based on current page
  if (window.DashboardComponent) {
    DashboardComponent.init();
  }
  if (window.GoalsComponent) {
    GoalsComponent.init();
  }
  if (window.HabitsComponent) {
    HabitsComponent.init();
  }
  if (window.FeelingsComponent) {
    FeelingsComponent.init();
  }
  if (window.WisdomComponent) {
    WisdomComponent.init();
  }
  if (window.FocusAreasComponent) {
    FocusAreasComponent.init();
  }
  if (window.AIChatComponent) {
    AIChatComponent.init();
  }

  // Handle window resize for responsive behavior
  window.addEventListener('resize', () => {
    LayoutManager.updateLayout();
  });

  console.log('Architect My Life - Application initialized');
});

// Export for use in other files
window.API = API;
window.Utils = Utils;
window.ProgressBar = ProgressBar;