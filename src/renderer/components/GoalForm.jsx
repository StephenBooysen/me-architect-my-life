import React, { useState, useEffect } from "react";
import { ArrowLeft, Target, Calendar, Flag, Save, X } from "lucide-react";

function GoalForm({
  goal,
  type,
  focusAreas,
  parentGoals = [],
  onSave,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    parent_id: null,
    priority: "medium",
    success_criteria: "",
    target_date: "",
    focus_area_id: null,
    progress: 0,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || "",
        description: goal.description || "",
        parent_id: goal.parent_id || null,
        priority: goal.priority || "medium",
        success_criteria: goal.success_criteria || "",
        target_date: goal.target_date ? goal.target_date.split("T")[0] : "",
        focus_area_id: goal.focus_area_id || null,
        progress: goal.progress || 0,
      });
    }
  }, [goal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (formData.progress < 0 || formData.progress > 100) {
      newErrors.progress = "Progress must be between 0 and 100";
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
      parent_id: formData.parent_id === "" ? null : Number(formData.parent_id),
      focus_area_id:
        formData.focus_area_id === "" ? null : Number(formData.focus_area_id),
    };

    onSave(goalData);
  };

  const getTypeTitle = () => {
    switch (type) {
      case "annual":
        return "Annual Goal";
      case "monthly":
        return "Monthly Goal";
      case "weekly":
        return "Weekly Goal";
      default:
        return "Goal";
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="welcome-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onCancel}
              className="mr-4 p-2 text-primary-dark hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="welcome-title">
                {goal ? `Edit ${getTypeTitle()}` : `Create ${getTypeTitle()}`}
              </h1>
              <p className="welcome-subtitle">
                {goal 
                  ? "Update your goal details" 
                  : type === "monthly"
                  ? "Break down your annual goals into monthly milestones"
                  : type === "weekly"
                  ? "Plan your week with actionable goals"
                  : "Set up a new goal to track your progress"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="form-group">
              <label className="form-label">
                <Target className="w-4 h-4 inline mr-2" />
                Goal Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`form-input ${errors.title ? "border-red-500" : ""}`}
                placeholder="Enter a clear, specific goal title..."
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
                placeholder="Describe your goal in detail. What do you want to achieve and why is it important?"
                rows="4"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Focus Area */}
              <div className="form-group">
                <label className="form-label">Focus Area</label>
                <select
                  name="focus_area_id"
                  value={formData.focus_area_id || ""}
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
                <p className="text-sm text-gray-500 mt-1">
                  Choose the life area this goal belongs to
                </p>
              </div>

              {/* Priority */}
              <div className="form-group">
                <label className="form-label">
                  <Flag className="w-4 h-4 inline mr-2" />
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Set the importance level for this goal
                </p>
              </div>

              {/* Current Progress Display */}
              <div className="form-group">
                <label className="form-label">
                  Current Status
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-2">
                      {formData.progress}%
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${formData.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Current completion status
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Target Date */}
              <div className="form-group">
                <label className="form-label">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Target Date
                </label>
                <input
                  type="date"
                  name="target_date"
                  value={formData.target_date}
                  onChange={handleInputChange}
                  className="form-input"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {type === "monthly" 
                    ? "Set a target month for completion" 
                    : type === "weekly" 
                    ? "Set a target week for completion"
                    : "Set a target completion date to help track your progress"}
                </p>
              </div>

              {/* Parent Goal (for monthly and weekly goals) */}
              {type !== "annual" && (
                <div className="form-group">
                  <label className="form-label">
                    {type === "monthly" ? "Link to Annual Goal (Optional)" : "Link to Monthly Goal (Optional)"}
                  </label>
                  <select
                    name="parent_id"
                    value={formData.parent_id || ""}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="">
                      {parentGoals.length > 0 
                        ? `Select a ${type === "monthly" ? "annual" : "monthly"} goal` 
                        : `No ${type === "monthly" ? "annual" : "monthly"} goals available`}
                    </option>
                    {parentGoals.map((parentGoal) => (
                      <option key={parentGoal.id} value={parentGoal.id}>
                        {parentGoal.title}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    {type === "monthly" 
                      ? "Link this monthly goal to an annual goal to track progress toward your yearly objectives"
                      : "Link this weekly goal to a monthly goal to break down larger objectives into actionable steps"}
                  </p>
                </div>
              )}
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Success Criteria */}
              <div className="form-group">
                <label className="form-label">Success Criteria</label>
                <textarea
                  name="success_criteria"
                  value={formData.success_criteria}
                  onChange={handleInputChange}
                  className="form-input form-textarea"
                  placeholder="How will you know when this goal is achieved? Be specific about measurable outcomes."
                  rows="4"
                />
              </div>

              {/* Progress */}
              <div className="form-group">
                <label className="form-label">
                  Current Progress ({formData.progress}%)
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
                <p className="text-sm text-gray-500 mt-1">
                  Set your current progress towards achieving this goal
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-secondary flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button type="submit" className="green-button flex items-center">
                <Save className="w-4 h-4 mr-2" />
                {goal ? "Update Goal" : "Create Goal"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default GoalForm;