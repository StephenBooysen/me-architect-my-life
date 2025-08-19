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
} from "lucide-react";
import { format } from "date-fns";
import GoalForm from "../../components/GoalForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../lib/utils";

function AnnualGoals() {
  const db = useDatabase();
  const [goals, setGoals] = useState([]);
  const [focusAreas, setFocusAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  useEffect(() => {
    loadGoals();
    loadFocusAreas();
  }, []);

  const loadGoals = async () => {
    try {
      const annualGoals = await db.getGoals("annual");
      setGoals(annualGoals);
    } catch (error) {
      console.error("Error loading annual goals:", error);
    } finally {
      setLoading(false);
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
        await db.createGoal({ ...goalData, type: "annual" });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  // Show form view when creating or editing
  if (showForm) {
    return (
      <GoalForm
        goal={editingGoal}
        type="annual"
        focusAreas={focusAreas}
        onSave={handleSaveGoal}
        onCancel={handleCancelForm}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="welcome-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="welcome-title">Annual Goals 🎯</h1>
              <p className="welcome-subtitle">
                Set and track your yearly objectives
              </p>
            </div>
            <Button onClick={handleCreateGoal}>
              <Plus className="w-4 h-4 mr-2" />
              New Annual Goal
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
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Goals</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {goals.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-md mr-3">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Completed</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {goals.filter((g) => g.progress === 100).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="bg-red-100 dark:bg-red-900 p-2 rounded-md mr-3">
                <Flag className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                  High Priority
                </p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {goals.filter((g) => g.priority === "high").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-md mr-3">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">This Year</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {new Date().getFullYear()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.length > 0 ? (
          goals.map((goal) => (
            <Card key={goal.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {goal.title}
                      </h3>
                      <Badge variant={goal.priority === 'high' ? 'destructive' : goal.priority === 'medium' ? 'secondary' : 'default'}>
                        {goal.priority}
                      </Badge>
                    </div>

                    {goal.description && (
                      <p className="text-muted-foreground mb-3">{goal.description}</p>
                    )}

                    <div className="flex items-center space-x-6 mb-3">
                      {goal.focus_area_id && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Target className="w-4 h-4 mr-1" />
                          {getFocusAreaName(goal.focus_area_id)}
                        </div>
                      )}

                      {goal.target_date && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-1" />
                          Target:{" "}
                          {format(new Date(goal.target_date), "MMM dd, yyyy")}
                        </div>
                      )}
                    </div>

                    {goal.success_criteria && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-foreground mb-1">
                          Success Criteria:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {goal.success_criteria}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                          <span>Progress</span>
                          <span>{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditGoal(goal)}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Annual Goals Yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Start by creating your first annual goal to track your yearly
                progress.
              </p>
              <Button onClick={handleCreateGoal}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Annual Goal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  );
}

export default AnnualGoals;
