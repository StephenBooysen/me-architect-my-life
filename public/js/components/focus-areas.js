// Focus Areas Page Component - used on the focus areas page

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

// Global functions for page templates
window.loadFocusAreasData = function() {
  FocusAreasComponent.loadFocusAreasData();
};

// Export for use in other files
window.FocusAreasComponent = FocusAreasComponent;