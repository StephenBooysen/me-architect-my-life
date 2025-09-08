// Wisdom Page Component - used on the wisdom page

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
                  ${item.is_favorite ? 'Unfav' : 'Fav'}
                </button>
                <button class="btn btn-sm btn-outline" onclick="WisdomComponent.editWisdomInPlace(${item.id})" title="Edit Wisdom">
                  Edit
                </button>
                <button class="btn btn-sm btn-destructive" onclick="WisdomComponent.deleteWisdom(${item.id})" title="Delete Wisdom">
                  Delete
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
                      <span class="text-xs font-bold">B</span>
                    </button>
                    <button type="button" class="toolbar-btn" data-action="italic" title="Italic">
                      <span class="text-xs italic">I</span>
                    </button>
                    <div class="w-px h-6 bg-gray-300 mx-1"></div>
                    <button type="button" class="toolbar-btn" data-action="quote" title="Quote">
                      <span class="text-xs">"</span>
                    </button>
                    <button type="button" class="toolbar-btn" data-action="link" title="Link">
                      <span class="text-xs">Link</span>
                    </button>
                    <div class="w-px h-6 bg-gray-300 mx-1"></div>
                    <button type="button" class="toolbar-btn" id="preview-toggle-${item.id}" title="Preview">
                      <span class="text-xs">Preview</span>
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
                  Save Changes
                </button>
                <button type="button" onclick="WisdomComponent.cancelEditInPlace(${item.id})" class="btn btn-secondary">
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
    
    // Create first wisdom card
    const createFirstWisdomCard = document.getElementById('create-first-wisdom-card');
    if (createFirstWisdomCard) {
      createFirstWisdomCard.addEventListener('click', () => {
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
window.loadWisdomData = function() {
  WisdomComponent.loadWisdomData();
};

window.setupWisdomPage = function() {
  WisdomComponent.setupWisdomPage();
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

// Export for use in other files
window.WisdomComponent = WisdomComponent;