import React, { useState, useEffect } from "react";
import { useDatabase } from "../contexts/UnifiedDatabaseContext";
import { format } from "date-fns";
import { Plus, Edit3, Save, X, Heart, BookOpen } from "lucide-react";

function Wisdom() {
  const db = useDatabase();
  const [wisdomItems, setWisdomItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null); // null, 'new', or item id
  const [editForm, setEditForm] = useState({
    content: '',
    author: '',
    source: '',
    tags: '',
    category: '',
    personal_notes: ''
  });
  const [saving, setSaving] = useState(false);

  // Load wisdom items
  const loadWisdom = async () => {
    setLoading(true);
    try {
      const items = await db.getWisdom();
      setWisdomItems(items || []);
    } catch (error) {
      console.error('Error loading wisdom:', error);
      setWisdomItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWisdom();
  }, []);

  // Start editing (new or existing item)
  const startEditing = (item = null) => {
    if (item) {
      setEditingItem(item.id);
      setEditForm({
        content: item.content || '',
        author: item.author || '',
        source: item.source || '',
        tags: item.tags || '',
        category: item.category || '',
        personal_notes: item.personal_notes || ''
      });
    } else {
      setEditingItem('new');
      setEditForm({
        content: '',
        author: '',
        source: '',
        tags: '',
        category: '',
        personal_notes: ''
      });
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingItem(null);
    setEditForm({
      content: '',
      author: '',
      source: '',
      tags: '',
      category: '',
      personal_notes: ''
    });
  };

  // Save wisdom
  const saveWisdom = async () => {
    if (!editForm.content.trim()) {
      alert('Please enter some wisdom content');
      return;
    }

    setSaving(true);
    try {
      if (editingItem === 'new') {
        await db.addWisdom(editForm);
      } else {
        // For editing existing items, we'd need an update method
        // For now, we'll add it as new since the database context doesn't have update wisdom
        await db.addWisdom(editForm);
      }
      
      await loadWisdom();
      cancelEditing();
    } catch (error) {
      console.error('Error saving wisdom:', error);
      alert('Error saving wisdom. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Toggle favorite
  const toggleFavorite = async (item) => {
    try {
      await db.toggleWisdomFavorite(item.id, !item.is_favorite);
      await loadWisdom();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // If editing, show the form
  if (editingItem) {
    return (
      <div className="space-y-6 h-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {editingItem === 'new' ? 'Add New Wisdom' : 'Edit Wisdom'}
            </h1>
            <p className="text-gray-600">Capture insights, quotes, and wisdom</p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={cancelEditing}
              className="btn btn-secondary flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            
            <button
              onClick={saveWisdom}
              disabled={saving}
              className="green-button flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Edit Form */}
        <div className="card h-full">
          <div className="card-body h-full flex flex-col space-y-6">
            {/* Main Content */}
            <div className="space-y-6">
              <div className="form-group">
                <label className="form-label">
                  Wisdom Content *
                </label>
                <textarea
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  placeholder="Enter your wisdom, quote, or insight here...\n\nYou can use markdown formatting:\n**Bold text**\n*Italic text*\n## Headings\n- Lists"
                  className="form-input form-textarea"
                  style={{ minHeight: '200px' }}
                  rows="8"
                />
              </div>

              {/* Metadata Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">
                    Author
                  </label>
                  <input
                    type="text"
                    value={editForm.author}
                    onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                    placeholder="Who said this?"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Source
                  </label>
                  <input
                    type="text"
                    value={editForm.source}
                    onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                    placeholder="Book, article, speech, etc."
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    placeholder="Life, Business, Philosophy, etc."
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={editForm.tags}
                    onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                    placeholder="motivation, success, growth (comma separated)"
                    className="form-input"
                  />
                </div>
              </div>
              
              {/* Personal Notes */}
              <div className="form-group">
                <label className="form-label">
                  Personal Notes
                </label>
                <textarea
                  value={editForm.personal_notes}
                  onChange={(e) => setEditForm({ ...editForm, personal_notes: e.target.value })}
                  placeholder="Why is this meaningful to you? How does it apply to your life?"
                  className="form-input form-textarea"
                  rows="4"
                />
              </div>
            </div>
            
            {/* Character Counter */}
            <div className="text-sm text-gray-500 text-right">
              {editForm.content.length} characters
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main wisdom library view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wisdom Library</h1>
          <p className="text-gray-600">
            Collect and organize inspirational quotes and wisdom
          </p>
        </div>
        
        <button
          onClick={() => startEditing()}
          className="green-button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Wisdom
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && wisdomItems.length === 0 && (
        <div className="card">
          <div className="card-body text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No wisdom captured yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start building your personal wisdom library by adding quotes, insights, and learnings.
            </p>
            <button
              onClick={() => startEditing()}
              className="btn btn-primary flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Wisdom
            </button>
          </div>
        </div>
      )}

      {/* Wisdom Grid */}
      {!loading && wisdomItems.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {wisdomItems.map((item) => (
            <div key={item.id} className="card hover:shadow-lg transition-shadow">
              <div className="card-body">
                {/* Content */}
                <div className="mb-4">
                  <blockquote className="text-gray-800 italic leading-relaxed text-lg">
                    "{item.content}"
                  </blockquote>
                </div>
                
                {/* Attribution */}
                {(item.author || item.source) && (
                  <div className="mb-4 text-sm text-gray-600">
                    {item.author && <span className="font-medium">— {item.author}</span>}
                    {item.author && item.source && <span>, </span>}
                    {item.source && <span className="italic">{item.source}</span>}
                  </div>
                )}
                
                {/* Category and Tags */}
                <div className="mb-4">
                  {item.category && (
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full mr-2">
                      {item.category}
                    </span>
                  )}
                  {item.tags && item.tags.split(',').map((tag, index) => (
                    <span key={index} className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full mr-1 mb-1">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
                
                {/* Personal Notes */}
                {item.personal_notes && (
                  <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium text-yellow-800">Personal note:</span> {item.personal_notes}
                    </p>
                  </div>
                )}
                
                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Added {format(new Date(item.created_at), 'MMM d, yyyy')}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleFavorite(item)}
                      className={`p-2 rounded-lg transition-colors ${
                        item.is_favorite 
                          ? 'text-red-500 hover:text-red-600 hover:bg-red-50' 
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                      }`}
                      title={item.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart className={`w-4 h-4 ${item.is_favorite ? 'fill-current' : ''}`} />
                    </button>
                    
                    <button
                      onClick={() => startEditing(item)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      title="Edit wisdom"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wisdom;
