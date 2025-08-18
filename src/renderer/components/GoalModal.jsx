import React, { useState, useEffect } from 'react';
import { X, Target, Calendar, Flag } from 'lucide-react';

function GoalModal({ goal, type, focusAreas, parentGoals = [], onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    parent_id: null,
    priority: 'medium',
    success_criteria: '',
    target_date: '',
    focus_area_id: null,
    progress: 0
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || '',
        description: goal.description || '',
        parent_id: goal.parent_id || null,
        priority: goal.priority || 'medium',
        success_criteria: goal.success_criteria || '',
        target_date: goal.target_date ? goal.target_date.split('T')[0] : '',
        focus_area_id: goal.focus_area_id || null,
        progress: goal.progress || 0
      });
    }
  }, [goal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (formData.progress < 0 || formData.progress > 100) {
      newErrors.progress = 'Progress must be between 0 and 100';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const goalData = {
      ...formData,
      progress: Number(formData.progress),
      parent_id: formData.parent_id === '' ? null : Number(formData.parent_id),
      focus_area_id: formData.focus_area_id === '' ? null : Number(formData.focus_area_id)
    };

    onSave(goalData);
  };

  const getTypeTitle = () => {
    switch (type) {
      case 'annual': return 'Annual Goal';
      case 'monthly': return 'Monthly Goal';
      case 'weekly': return 'Weekly Goal';
      default: return 'Goal';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {goal ? `Edit ${getTypeTitle()}` : `Create ${getTypeTitle()}`}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div className="form-group">
              <label className="form-label">
                <Target className="w-4 h-4 inline mr-1" />
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`form-input ${errors.title ? 'border-red-500' : ''}`}
                placeholder="Enter goal title..."
                required
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-input form-textarea"
                placeholder="Describe your goal..."
                rows="3"
              />
            </div>

            {/* Parent Goal (for monthly and weekly goals) */}
            {type !== 'annual' && parentGoals.length > 0 && (
              <div className="form-group">
                <label className="form-label">Parent Goal</label>
                <select
                  name="parent_id"
                  value={formData.parent_id || ''}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">Select a parent goal</option>
                  {parentGoals.map((parentGoal) => (
                    <option key={parentGoal.id} value={parentGoal.id}>
                      {parentGoal.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Focus Area */}
            <div className="form-group">
              <label className="form-label">Focus Area</label>
              <select
                name="focus_area_id"
                value={formData.focus_area_id || ''}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="">Select a focus area</option>
                {focusAreas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Priority */}
              <div className="form-group">
                <label className="form-label">
                  <Flag className="w-4 h-4 inline mr-1" />
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Target Date */}
              <div className="form-group">
                <label className="form-label">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Target Date
                </label>
                <input
                  type="date"
                  name="target_date"
                  value={formData.target_date}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>

            {/* Success Criteria */}
            <div className="form-group">
              <label className="form-label">Success Criteria</label>
              <textarea
                name="success_criteria"
                value={formData.success_criteria}
                onChange={handleInputChange}
                className="form-input form-textarea"
                placeholder="How will you know this goal is achieved?"
                rows="2"
              />
            </div>

            {/* Progress */}
            <div className="form-group">
              <label className="form-label">
                Progress ({formData.progress}%)
              </label>
              <input
                type="range"
                name="progress"
                min="0"
                max="100"
                value={formData.progress}
                onChange={handleInputChange}
                className="w-full"
              />
              <div className="progress-bar mt-2">
                <div 
                  className="progress-fill" 
                  style={{ width: `${formData.progress}%` }}
                ></div>
              </div>
              {errors.progress && (
                <p className="text-red-500 text-sm mt-1">{errors.progress}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                {goal ? 'Update Goal' : 'Create Goal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default GoalModal;