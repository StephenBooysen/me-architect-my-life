// Goals Page Component - used on the goals page

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

    // Modal form controls
    const modalForm = document.getElementById('goal-form');
    const closeModal = document.getElementById('close-modal');
    const cancelGoal = document.getElementById('cancel-goal');
    
    if (modalForm) {
      modalForm.addEventListener('submit', (e) => this.saveModalGoal(e));
    }
    
    if (closeModal) {
      closeModal.addEventListener('click', () => this.hideGoalModal());
    }
    
    if (cancelGoal) {
      cancelGoal.addEventListener('click', () => this.hideGoalModal());
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
                ${goal.type === 'weekly' && goal.parent_id ? `
                  <div class="monthly-goal-link mt-2">
                    <span class="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded flex items-center gap-1 inline-flex">
                      <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                      </svg>
                      <span id="parent-goal-${goal.parent_id}">Loading monthly goal...</span>
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
                <div class="form-group mb-4">
                  <label class="form-label">Monthly Goal</label>
                  <select class="form-select" name="parent_id">
                    <option value="">Select Monthly Goal (Optional)</option>
                  </select>
                </div>
                
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
    } else if (goalType === 'weekly') {
      // Get monthly goals for the dropdown
      let monthlyGoals = [];
      try {
        monthlyGoals = await API.get('/goals?type=monthly');
      } catch (error) {
        console.error('Error fetching monthly goals:', error);
        monthlyGoals = [];
      }
      
      // Create monthly goal dropdown
      const monthlyGoalField = document.createElement('div');
      monthlyGoalField.className = 'form-group mb-4';
      monthlyGoalField.innerHTML = `
        <label class="form-label">Monthly Goal</label>
        <select id="inline-goal-parent-id" class="form-select" name="parent_id">
          <option value="">Select Monthly Goal (Optional)</option>
          ${monthlyGoals.map(goal => 
            `<option value="${goal.id}">${goal.title}</option>`
          ).join('')}
        </select>
      `;
      
      dynamicFields.appendChild(monthlyGoalField);
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
      } else if (goalType === 'weekly') {
        formData.target_month = new Date().getMonth() + 1;
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        formData.target_week = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
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

  static async saveModalGoal(e) {
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
      
      // Populate parent goal dropdown based on goal type
      const goal = this.currentGoals.find(g => g.id === goalId);
      if (goal && goal.type === 'monthly') {
        await this.populateAnnualGoalDropdown(goalId, goal.parent_id);
      } else if (goal && goal.type === 'weekly') {
        await this.populateMonthlyGoalDropdown(goalId, goal.parent_id);
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

  static async populateMonthlyGoalDropdown(goalId, currentParentId = null) {
    try {
      // Get monthly goals
      const monthlyGoals = await API.get('/goals?type=monthly');
      
      // Find the dropdown in the edit form
      const editDiv = document.getElementById(`goal-edit-${goalId}`);
      const dropdown = editDiv ? editDiv.querySelector('select[name="parent_id"]') : null;
      
      if (dropdown) {
        // Clear existing options except the first one
        dropdown.innerHTML = '<option value="">Select Monthly Goal (Optional)</option>';
        
        // Add monthly goal options
        monthlyGoals.forEach(monthlyGoal => {
          const option = document.createElement('option');
          option.value = monthlyGoal.id;
          option.textContent = monthlyGoal.title;
          option.selected = (currentParentId && currentParentId == monthlyGoal.id);
          dropdown.appendChild(option);
        });
      }
    } catch (error) {
      console.error('Error populating monthly goal dropdown:', error);
    }
  }

  static async populateParentGoalNames(goals) {
    try {
      // Get all unique parent IDs from monthly and weekly goals
      const monthlyParentIds = [...new Set(goals
        .filter(goal => goal.type === 'monthly' && goal.parent_id)
        .map(goal => goal.parent_id))];
      
      const weeklyParentIds = [...new Set(goals
        .filter(goal => goal.type === 'weekly' && goal.parent_id)
        .map(goal => goal.parent_id))];
      
      // Fetch annual goals for monthly goals
      if (monthlyParentIds.length > 0) {
        const annualGoals = await API.get('/goals?type=annual');
        const annualGoalsMap = {};
        annualGoals.forEach(goal => {
          annualGoalsMap[goal.id] = goal.title;
        });
        
        // Update the DOM elements for monthly goals
        monthlyParentIds.forEach(parentId => {
          const element = document.getElementById(`parent-goal-${parentId}`);
          if (element && annualGoalsMap[parentId]) {
            element.textContent = annualGoalsMap[parentId];
          }
        });
      }
      
      // Fetch monthly goals for weekly goals
      if (weeklyParentIds.length > 0) {
        const monthlyGoals = await API.get('/goals?type=monthly');
        const monthlyGoalsMap = {};
        monthlyGoals.forEach(goal => {
          monthlyGoalsMap[goal.id] = goal.title;
        });
        
        // Update the DOM elements for weekly goals
        weeklyParentIds.forEach(parentId => {
          const element = document.getElementById(`parent-goal-${parentId}`);
          if (element && monthlyGoalsMap[parentId]) {
            element.textContent = monthlyGoalsMap[parentId];
          }
        });
      }
    } catch (error) {
      console.error('Error populating parent goal names:', error);
      // Update any loading elements to show error
      const loadingElements = document.querySelectorAll('[id^="parent-goal-"]');
      loadingElements.forEach(element => {
        if (element.textContent.includes('Loading')) {
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

// Export for use in other files
window.GoalsComponent = GoalsComponent;