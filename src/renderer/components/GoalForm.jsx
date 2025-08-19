import React, { useState, useEffect } from "react";
import { ArrowLeft, Target, Calendar, Flag, Save, X, ChevronDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { cn } from "../lib/utils";

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
    target_year: new Date().getFullYear(),
    target_month: null,
    target_week: null,
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
        target_year: goal.target_year || new Date().getFullYear(),
        target_month: goal.target_month || null,
        target_week: goal.target_week || null,
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
      target_year: Number(formData.target_year),
      target_month: formData.target_month ? Number(formData.target_month) : null,
      target_week: formData.target_week ? Number(formData.target_week) : null,
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
    <div className="space-y-6">
      {/* Header */}
      <Card className="welcome-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={onCancel}
                className="mr-4"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
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
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label className="flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Goal Title *
              </Label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={cn(errors.title && "border-destructive")}
                placeholder="Enter a clear, specific goal title..."
                required
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your goal in detail. What do you want to achieve and why is it important?"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Focus Area */}
              <div className="space-y-2">
                <Label>Focus Area</Label>
                <div className="relative">
                  <select
                    name="focus_area_id"
                    value={formData.focus_area_id || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent appearance-none pr-8"
                  >
                    <option value="">Select a focus area</option>
                    {focusAreas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Choose the life area this goal belongs to
                </p>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Flag className="w-4 h-4 mr-2" />
                  Priority
                </Label>
                <div className="relative">
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent appearance-none pr-8"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Set the importance level for this goal
                </p>
              </div>

              {/* Current Progress Display */}
              <div className="space-y-2">
                <Label>
                  Current Status
                </Label>
                <Card className="p-4 bg-muted/50">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground mb-2">
                      {formData.progress}%
                    </div>
                    <Progress value={formData.progress} className="h-2 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Current completion status
                    </p>
                  </div>
                </Card>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Target Year (for Annual Goals) */}
              {type === "annual" && (
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Target Year
                  </Label>
                  <div className="relative">
                    <select
                      name="target_year"
                      value={formData.target_year}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent appearance-none pr-8"
                    >
                      {[2024, 2025, 2026, 2027, 2028].map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Choose the year you want to achieve this annual goal
                  </p>
                </div>
              )}

              {/* Target Month (for Monthly Goals) */}
              {type === "monthly" && (
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Target Month & Year
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <select
                        name="target_month"
                        value={formData.target_month || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent appearance-none pr-8"
                      >
                        <option value="">Select Month</option>
                        {[
                          "January", "February", "March", "April",
                          "May", "June", "July", "August",
                          "September", "October", "November", "December"
                        ].map((month, index) => (
                          <option key={index + 1} value={index + 1}>{month}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                    <div className="relative">
                      <select
                        name="target_year"
                        value={formData.target_year}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent appearance-none pr-8"
                      >
                        {[2024, 2025, 2026, 2027, 2028].map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Choose the specific month and year for this goal
                  </p>
                </div>
              )}

              {/* Target Week (for Weekly Goals) */}
              {type === "weekly" && (
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Target Week
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="relative">
                      <select
                        name="target_week"
                        value={formData.target_week || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent appearance-none pr-8"
                      >
                        <option value="">Week</option>
                        {Array.from({ length: 5 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>Week {i + 1}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                    <div className="relative">
                      <select
                        name="target_month"
                        value={formData.target_month || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent appearance-none pr-8"
                      >
                        <option value="">Month</option>
                        {[
                          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                        ].map((month, index) => (
                          <option key={index + 1} value={index + 1}>{month}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                    <div className="relative">
                      <select
                        name="target_year"
                        value={formData.target_year}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent appearance-none pr-8"
                      >
                        {[2024, 2025, 2026, 2027].map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Choose the specific week, month, and year for this goal
                  </p>
                </div>
              )}

              {/* Traditional Target Date (fallback) */}
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Target Date (Optional)
                </Label>
                <Input
                  type="date"
                  name="target_date"
                  value={formData.target_date}
                  onChange={handleInputChange}
                />
                <p className="text-sm text-muted-foreground">
                  Optional specific completion date
                </p>
              </div>

              {/* Parent Goal (for monthly and weekly goals) */}
              {type !== "annual" && (
                <div className="space-y-2">
                  <Label>
                    {type === "monthly" ? "Link to Annual Goal (Optional)" : "Link to Monthly Goal (Optional)"}
                  </Label>
                  <div className="relative">
                    <select
                      name="parent_id"
                      value={formData.parent_id || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent appearance-none pr-8"
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
                    <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {type === "monthly" 
                      ? "Link this monthly goal to an annual goal to track progress toward your yearly objectives"
                      : "Link this weekly goal to a monthly goal to break down larger objectives into actionable steps"}
                  </p>
                </div>
              )}
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Success Criteria */}
              <div className="space-y-2">
                <Label>Success Criteria</Label>
                <Textarea
                  name="success_criteria"
                  value={formData.success_criteria}
                  onChange={handleInputChange}
                  placeholder="How will you know when this goal is achieved? Be specific about measurable outcomes."
                  rows={4}
                />
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <Label>
                  Current Progress ({formData.progress}%)
                </Label>
                <input
                  type="range"
                  name="progress"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={handleInputChange}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer slider-thumb"
                />
                <Progress value={formData.progress} className="h-2 mt-2" />
                {errors.progress && (
                  <p className="text-sm text-destructive">{errors.progress}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Set your current progress towards achieving this goal
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                {goal ? "Update Goal" : "Create Goal"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default GoalForm;