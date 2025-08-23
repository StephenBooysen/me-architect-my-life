import React, { useState, useEffect } from "react";
import { useDatabase } from "../contexts/UnifiedDatabaseContext";
import { format } from "date-fns";
import { Plus, Edit3, Save, X, Heart, BookOpen, Quote, Tag, User, Trash2 } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";

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
        await db.updateWisdom(editingItem, editForm);
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

  // Delete wisdom
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this wisdom?")) {
      try {
        await db.deleteWisdom(id);
        await loadWisdom();
      } catch (error) {
        console.error('Error deleting wisdom:', error);
      }
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
        <Card className="welcome-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="welcome-title">
                  {editingItem === 'new' ? 'Add New Wisdom ✨' : 'Edit Wisdom ✨'}
                </h1>
                <p className="welcome-subtitle">Capture insights, quotes, and wisdom</p>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={cancelEditing}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                
                <Button
                  onClick={saveWisdom}
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="h-full">
          <CardContent className="p-6 h-full flex flex-col space-y-6">
            {/* Main Content */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Quote className="w-4 h-4 mr-2" />
                  Wisdom Content *
                </Label>
                <Textarea
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  placeholder="Enter your wisdom, quote, or insight here...\n\nYou can use markdown formatting:\n**Bold text**\n*Italic text*\n## Headings\n- Lists"
                  rows="8"
                />
              </div>

              {/* Metadata Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Author
                  </Label>
                  <Input
                    type="text"
                    value={editForm.author}
                    onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                    placeholder="Who said this?"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Source
                  </Label>
                  <Input
                    type="text"
                    value={editForm.source}
                    onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                    placeholder="Book, article, speech, etc."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Tag className="w-4 h-4 mr-2" />
                    Category
                  </Label>
                  <Input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    placeholder="Life, Business, Philosophy, etc."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Tag className="w-4 h-4 mr-2" />
                    Tags
                  </Label>
                  <Input
                    type="text"
                    value={editForm.tags}
                    onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                    placeholder="motivation, success, growth (comma separated)"
                  />
                </div>
              </div>
              
              {/* Personal Notes */}
              <div className="space-y-2">
                <Label>Personal Notes</Label>
                <Textarea
                  value={editForm.personal_notes}
                  onChange={(e) => setEditForm({ ...editForm, personal_notes: e.target.value })}
                  placeholder="Why is this meaningful to you? How does it apply to your life?"
                  rows="4"
                />
              </div>
            </div>
            
            {/* Character Counter */}
            <div className="text-sm text-muted-foreground text-right">
              {editForm.content.length} characters
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main wisdom library view
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="welcome-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="welcome-title">Wisdom Library 📚</h1>
              <p className="welcome-subtitle">
                Collect and organize inspirational quotes and wisdom
              </p>
            </div>
            
            <Button onClick={() => startEditing()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Wisdom
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-md mr-3">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Items</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {wisdomItems.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="bg-red-100 dark:bg-red-900 p-2 rounded-md mr-3">
                <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">Favorites</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {wisdomItems.filter(item => item.is_favorite).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-md mr-3">
                <Tag className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Categories</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {new Set(wisdomItems.map(item => item.category).filter(Boolean)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-md mr-3">
                <User className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Authors</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {new Set(wisdomItems.map(item => item.author).filter(Boolean)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && wisdomItems.length === 0 && (
        <Card>
          <CardContent className="text-center py-16">
            <BookOpen className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No wisdom captured yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Start building your personal wisdom library by adding quotes, insights, and learnings.
            </p>
            <Button onClick={() => startEditing()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Wisdom
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Wisdom Grid */}
      {!loading && wisdomItems.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {wisdomItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {/* Content */}
                <div className="mb-4">
                  <div className="flex items-start">
                    <Quote className="w-6 h-6 text-muted-foreground/40 mr-3 mt-1 flex-shrink-0" />
                    <blockquote className="text-foreground italic leading-relaxed text-lg">
                      "{item.content}"
                    </blockquote>
                  </div>
                </div>
                
                {/* Attribution */}
                {(item.author || item.source) && (
                  <div className="mb-4 text-sm text-muted-foreground">
                    {item.author && <span className="font-medium">— {item.author}</span>}
                    {item.author && item.source && <span>, </span>}
                    {item.source && <span className="italic">{item.source}</span>}
                  </div>
                )}
                
                {/* Category and Tags */}
                <div className="mb-4">
                  {item.category && (
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs font-medium rounded-full mr-2">
                      {item.category}
                    </span>
                  )}
                  {item.tags && item.tags.split(',').map((tag, index) => (
                    <span key={index} className="inline-block px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full mr-1 mb-1">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
                
                {/* Personal Notes */}
                {item.personal_notes && (
                  <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/30 border-l-4 border-yellow-400 dark:border-yellow-600">
                    <p className="text-sm text-foreground">
                      <span className="font-medium text-yellow-800 dark:text-yellow-400">Personal note:</span> {item.personal_notes}
                    </p>
                  </div>
                )}
                
                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="text-xs text-muted-foreground">
                    Added {format(new Date(item.created_at), 'MMM d, yyyy')}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(item)}
                      className={item.is_favorite ? 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950' : 'hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950'}
                      title={item.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart className={`w-4 h-4 ${item.is_favorite ? 'fill-current' : ''}`} />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditing(item)}
                      title="Edit wisdom"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                      className="hover:text-destructive hover:bg-destructive/10"
                      title="Delete wisdom"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wisdom;