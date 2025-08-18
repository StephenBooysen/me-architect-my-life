import React, { useState, useEffect } from "react";
import { useDatabase } from "../../contexts/UnifiedDatabaseContext";
import {
  Plus,
  Target,
  Calendar,
  Flag,
  Edit3,
  Trash2,
  TrendingUp,
  Link,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import GoalForm from "../../components/GoalForm";

function MonthlyGoals() {
  const db = useDatabase();
  const [goals, setGoals] = useState([]);
  const [annualGoals, setAnnualGoals] = useState([]);
  const [focusAreas, setFocusAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  useEffect(() => {
    loadGoals();
    loadAnnualGoals();
    loadFocusAreas();
  }, []);

  const loadGoals = async () => {
    try {
      const monthlyGoals = await db.getGoals("monthly");
      setGoals(monthlyGoals);
    } catch (error) {
      console.error("Error loading monthly goals:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnnualGoals = async () => {
    try {
      const annualGoalsList = await db.getGoals("annual");
      setAnnualGoals(annualGoalsList);
    } catch (error) {
      console.error("Error loading annual goals:", error);
    }
  };

  const loadFocusAreas = async () => {
    try {
      const areas = await db.getFocusAreas();
      setFocusAreas(areas);
    } catch (error) {
      console.error("Error loading focus areas:", error);
    }
  };

  const handleCreateGoal = () => {
    setEditingGoal(null);
    setShowForm(true);
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingGoal(null);
  };

  const handleDeleteGoal = async (goalId) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      try {
        await db.deleteGoal(goalId);
        loadGoals();
      } catch (error) {
        console.error("Error deleting goal:", error);
      }
    }
  };

  const handleSaveGoal = async (goalData) => {
    try {
      if (editingGoal) {
        await db.updateGoal(editingGoal.id, goalData);
      } else {
        await db.createGoal({ ...goalData, type: "monthly" });
      }
      setShowForm(false);
      setEditingGoal(null);
      loadGoals();
    } catch (error) {
      console.error("Error saving goal:", error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-700 bg-red-100 border border-red-200";
      case "medium":
        return "text-orange-700 bg-orange-100 border border-orange-200";
      case "low":
        return "text-green-700 bg-green-100 border border-green-200";
      default:
        return "text-gray-700 bg-gray-100 border border-gray-200";
    }
  };

  const getFocusAreaName = (focusAreaId) => {
    const area = focusAreas.find((a) => a.id === focusAreaId);
    return area ? area.name : "No Focus Area";
  };

  const getParentGoalName = (parentId) => {
    const parentGoal = annualGoals.find((g) => g.id === parentId);
    return parentGoal ? parentGoal.title : null;
  };

  const getCurrentMonth = () => {
    const now = new Date();
    return format(now, "MMMM yyyy");
  };

  const getThisMonthGoals = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return goals.filter(goal => {
      if (!goal.target_date) return true;
      const targetDate = new Date(goal.target_date);
      return targetDate.getMonth() === currentMonth && targetDate.getFullYear() === currentYear;
    });
  };

  // Show form view when creating or editing
  if (showForm) {
    return (
      <GoalForm
        goal={editingGoal}
        type="monthly"
        focusAreas={focusAreas}
        parentGoals={annualGoals}
        onSave={handleSaveGoal}
        onCancel={handleCancelForm}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  const thisMonthGoals = getThisMonthGoals();
  const completedThisMonth = thisMonthGoals.filter(g => g.progress === 100).length;
  const highPriorityCount = goals.filter(g => g.priority === "high").length;
  const linkedGoalsCount = goals.filter(g => g.parent_id).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="welcome-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="welcome-title">Monthly Goals 📅</h1>
            <p className="welcome-subtitle">
              Break down your annual goals into monthly milestones for {getCurrentMonth()}
            </p>
          </div>
          <button onClick={handleCreateGoal} className="green-button">
            <Plus className="w-4 h-4 mr-2" />
            New Monthly Goal
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Goals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {goals.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {completedThisMonth}/{thisMonthGoals.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <Flag className="w-8 h-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  High Priority
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {highPriorityCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <Link className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Linked to Annual</p>
                <p className="text-2xl font-bold text-gray-900">
                  {linkedGoalsCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.length > 0 ? (
          goals.map((goal) => {
            const parentGoalName = getParentGoalName(goal.parent_id);
            return (
              <div
                key={goal.id}
                className="card hover:shadow-md transition-shadow"
              >
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {goal.title}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                            goal.priority
                          )}`}
                        >
                          {goal.priority}
                        </span>
                        {parentGoalName && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                            <Link className="w-3 h-3 inline mr-1" />
                            Linked
                          </span>
                        )}
                      </div>

                      {goal.description && (
                        <p className="text-gray-600 mb-3">{goal.description}</p>
                      )}

                      {/* Parent Goal Link */}
                      {parentGoalName && (
                        <div className="flex items-center mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                          <Link className="w-4 h-4 text-blue-600 mr-2" />
                          <span className="text-sm text-blue-700">
                            <strong>Annual Goal:</strong> {parentGoalName}
                          </span>
                          <ChevronRight className="w-4 h-4 text-blue-500 ml-auto" />
                        </div>
                      )}

                      <div className="flex items-center space-x-6 mb-3">
                        {goal.focus_area_id && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Target className="w-4 h-4 mr-1" />
                            {getFocusAreaName(goal.focus_area_id)}
                          </div>
                        )}

                        {goal.target_date && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            Target:{" "}
                            {format(new Date(goal.target_date), "MMM dd, yyyy")}
                          </div>
                        )}
                      </div>

                      {goal.success_criteria && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Success Criteria:
                          </p>
                          <p className="text-sm text-gray-600">
                            {goal.success_criteria}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{goal.progress}%</span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${goal.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <button
                        onClick={() => handleEditGoal(goal)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Monthly Goals Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start by creating your first monthly goal to break down your annual objectives into manageable steps.
            </p>
            <button onClick={handleCreateGoal} className="btn btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Monthly Goal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MonthlyGoals;
