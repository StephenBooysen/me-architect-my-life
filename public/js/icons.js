// Flaticon Icons System for Architect My Life
// Using flaticon CSS classes and Unicode icons

class IconManager {
  // Flaticon icon mappings
  static icons = {
    // Navigation icons
    dashboard: 'fi fi-rr-home',
    goals: 'fi fi-rr-target',
    'focus-areas': 'fi fi-rr-crosshairs',
    habits: 'fi fi-rr-apps',
    reflection: 'fi fi-rr-journal',
    wisdom: 'fi fi-rr-lightbulb',
    'ai-guide': 'fi fi-rr-brain',
    settings: 'fi fi-rr-settings',
    
    // Header icons
    'toggle-sidebar': 'fi fi-rr-menu-burger',
    'toggle-ai-chat': 'fi fi-rr-comment',
    search: 'fi fi-rr-search',
    'theme-light': 'fi fi-rr-sun',
    'theme-dark': 'fi fi-rr-moon',
    notifications: 'fi fi-rr-bell',
    
    // Action icons
    'add': 'fi fi-rr-plus',
    'edit': 'fi fi-rr-edit',
    'delete': 'fi fi-rr-trash',
    'save': 'fi fi-rr-disk',
    'cancel': 'fi fi-rr-cross-circle',
    'send': 'fi fi-rr-paper-plane',
    'close': 'fi fi-rr-cross',
    'check': 'fi fi-rr-check',
    'info': 'fi fi-rr-info',
    'warning': 'fi fi-rr-exclamation',
    'error': 'fi fi-rr-cross-circle',
    'success': 'fi fi-rr-check-circle',
    
    // Calendar and time
    'calendar': 'fi fi-rr-calendar',
    'clock': 'fi fi-rr-clock',
    'date': 'fi fi-rr-calendar-day',
    
    // Progress and stats
    'progress': 'fi fi-rr-chart-line-up',
    'stats': 'fi fi-rr-stats',
    'trending': 'fi fi-rr-trending-up',
    
    // User and profile
    'user': 'fi fi-rr-user',
    'profile': 'fi fi-rr-user-circle',
    
    // Files and documents
    'file': 'fi fi-rr-document',
    'folder': 'fi fi-rr-folder',
    'export': 'fi fi-rr-download',
    'import': 'fi fi-rr-upload',
    
    // Social and communication
    'share': 'fi fi-rr-share',
    'heart': 'fi fi-rr-heart',
    'star': 'fi fi-rr-star',
    'bookmark': 'fi fi-rr-bookmark',
    
    // Arrow and navigation
    'arrow-left': 'fi fi-rr-arrow-left',
    'arrow-right': 'fi fi-rr-arrow-right',
    'arrow-up': 'fi fi-rr-arrow-up',
    'arrow-down': 'fi fi-rr-arrow-down',
    'chevron-left': 'fi fi-rr-angle-left',
    'chevron-right': 'fi fi-rr-angle-right',
    'chevron-up': 'fi fi-rr-angle-up',
    'chevron-down': 'fi fi-rr-angle-down',
    
    // Health and wellness
    'fitness': 'fi fi-rr-dumbbell',
    'meditation': 'fi fi-rr-om',
    'health': 'fi fi-rr-medical-cross',
    
    // Business and career
    'briefcase': 'fi fi-rr-briefcase',
    'money': 'fi fi-rr-dollar',
    'chart': 'fi fi-rr-chart-histogram',
    
    // Education and learning
    'book': 'fi fi-rr-book',
    'graduation': 'fi fi-rr-graduation-cap',
    'learning': 'fi fi-rr-lightbulb-head',
    
    // Social and relationships
    'family': 'fi fi-rr-family',
    'friends': 'fi fi-rr-users',
    'social': 'fi fi-rr-social-network',
    
    // Hobbies and recreation
    'game': 'fi fi-rr-gamepad',
    'music': 'fi fi-rr-music',
    'art': 'fi fi-rr-palette',
    'travel': 'fi fi-rr-plane',
    'camera': 'fi fi-rr-camera',
    
    // Miscellaneous
    'lock': 'fi fi-rr-lock',
    'unlock': 'fi fi-rr-unlock',
    'visible': 'fi fi-rr-eye',
    'hidden': 'fi fi-rr-eye-crossed',
    'filter': 'fi fi-rr-filter',
    'sort': 'fi fi-rr-sort',
    'refresh': 'fi fi-rr-refresh'
  };

  /**
   * Create an icon element
   * @param {string} iconName - The icon name from the icons mapping
   * @param {string} className - Additional CSS classes
   * @returns {HTMLElement} - The icon element
   */
  static createIcon(iconName, className = '') {
    const iconClass = this.icons[iconName];
    if (!iconClass) {
      console.warn(`Icon '${iconName}' not found. Using default icon.`);
      return this.createIcon('info', className);
    }

    const icon = document.createElement('i');
    icon.className = `${iconClass} ${className}`.trim();
    return icon;
  }

  /**
   * Create an icon string for innerHTML
   * @param {string} iconName - The icon name from the icons mapping
   * @param {string} className - Additional CSS classes
   * @returns {string} - The icon HTML string
   */
  static getIconHTML(iconName, className = '') {
    const iconClass = this.icons[iconName];
    if (!iconClass) {
      console.warn(`Icon '${iconName}' not found. Using default icon.`);
      return this.getIconHTML('info', className);
    }

    return `<i class="${iconClass} ${className}".trim()></i>`;
  }

  /**
   * Replace all SVG icons with flaticons in a container
   * @param {HTMLElement} container - The container to search for icons
   */
  static replaceIconsInContainer(container = document) {
    // Map of SVG viewBox to icon names for automatic replacement
    const svgToIconMap = {
      'nav-icon': {
        // Dashboard - home icon path
        'm3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z': 'dashboard',
        // Goals - target/circle icon
        'circle cx="12" cy="12" r="10"': 'goals',
        // Focus areas - crosshair icon
        'circle cx="12" cy="12" r="3"': 'focus-areas',
        // Habits - apps/grid icon
        'M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z': 'habits',
        // Reflection - journal/book icon
        'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20': 'reflection',
        // Wisdom - lightbulb icon
        'M12 2a3 3 0 0 0-3 3c0 1.5-1.5 3-3 3s-3-1.5-3-3a3 3 0 0 0-3 3c0 4 8 6 9 6s9-2 9-6a3 3 0 0 0-3-3c-1.5 0-3-1.5-3-3a3 3 0 0 0-3-3z': 'wisdom',
        // Settings - gear icon
        'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z': 'settings'
      },
      'icon': {
        // Header icons
        'rect width="3" height="14" x="3" y="5" rx="2"': 'toggle-sidebar',
        'circle cx="11" cy="11" r="8"': 'search',
        'circle cx="12" cy="12" r="5"': 'theme-light',
        'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z': 'theme-dark',
        'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9': 'notifications',
        'rect width="3" height="14" x="18" y="5" rx="2"': 'toggle-ai-chat'
      }
    };

    const svgElements = container.querySelectorAll('svg');
    svgElements.forEach(svg => {
      const className = svg.className.baseVal || svg.className;
      const pathElements = svg.querySelectorAll('path, circle, rect, polyline');
      
      let iconName = null;
      
      // Try to match SVG content to determine icon type
      for (let path of pathElements) {
        const d = path.getAttribute('d') || path.outerHTML;
        
        if (svgToIconMap[className]) {
          for (let [pathKey, mappedIcon] of Object.entries(svgToIconMap[className])) {
            if (d.includes(pathKey)) {
              iconName = mappedIcon;
              break;
            }
          }
        }
        
        if (iconName) break;
      }

      if (iconName) {
        const iconElement = this.createIcon(iconName, className);
        svg.parentNode.replaceChild(iconElement, svg);
      }
    });
  }

  /**
   * Initialize the icon system
   */
  static init() {
    // Load Flaticon CSS if not already loaded
    const existingLink = document.querySelector('link[href*="flaticon"]');
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn-uicons.flaticon.com/2.6.0/uicons-regular-rounded/css/uicons-regular-rounded.css';
      document.head.appendChild(link);

      // Wait for CSS to load then replace icons
      link.onload = () => {
        this.replaceIconsInContainer();
      };
    } else {
      // CSS already loaded, replace icons immediately
      this.replaceIconsInContainer();
    }
  }

  /**
   * Get icon class for a given icon name
   * @param {string} iconName - The icon name
   * @returns {string} - The CSS class for the icon
   */
  static getIconClass(iconName) {
    return this.icons[iconName] || this.icons['info'];
  }
}

// Export for global use
window.IconManager = IconManager;

// Initialize icons when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    IconManager.init();
  });
} else {
  IconManager.init();
}