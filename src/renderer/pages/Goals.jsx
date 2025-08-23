import React, { useState, useEffect } from "react";
import { useDatabase } from "../contexts/UnifiedDatabaseContext";
import {
  Plus,
  Target,
  Calendar,
  Flag,
  Edit3,
  Trash2,
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List,
  ArrowLeft,
  Home,
} from "lucide-react";
import { format, startOfWeek, endOfWeek, getWeek, getYear } from "date-fns";
import GoalForm from "../components/GoalForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { cn } from "../lib/utils";

function Goals() {
  const db = useDatabase();
  const [goals, setGoals] = useState({ annual: [], monthly: [], weekly: [] });
  const [focusAreas, setFocusAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // View state
  const [viewMode, setViewMode] = useState("current"); // "current" or "annual"
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAnnualGoal, setSelectedAnnualGoal] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [drillDownMode, setDrillDownMode] = useState(null); // null, "monthly", "weekly"
  const [expandedAnnualGoals, setExpandedAnnualGoals] = useState(new Set());
  const [showAnnualForm, setShowAnnualForm] = useState(false);
  const [showMonthlyForm, setShowMonthlyForm] = useState(false);
  const [showWeeklyForm, setShowWeeklyForm] = useState(false);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formType, setFormType] = useState("monthly"); // "annual", "monthly", "weekly"

  const currentYear = getYear(currentDate);
  const currentMonth = currentDate.getMonth() + 1;
  const currentWeek = getWeek(currentDate);

  useEffect(() => {
    loadAllGoals();
    loadFocusAreas();
  }, [currentDate]);

  const loadAllGoals = async () => {
    try {
      setLoading(true);
      
      // Load annual goals
      const annualGoals = await db.getGoals("annual");
      
      // Load monthly goals for current year
      const monthlyGoals = await db.getMonthlyGoals(currentYear, currentMonth);
      
      // Load weekly goals for current month
      const weeklyGoals = await db.getGoals("weekly");
      // Filter weekly goals for current month
      const currentMonthWeekly = weeklyGoals.filter(goal => {
        return goal.target_year === currentYear && goal.target_month === currentMonth;
      });
      
      setGoals({
        annual: annualGoals,
        monthly: monthlyGoals,
        weekly: currentMonthWeekly
      });
    } catch (error) {
      console.error("Error loading goals:", error);
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

  const handleToggleComplete = async (goal) => {
    try {
      const newProgress = goal.progress >= 100 ? 0 : 100;
      await db.updateGoalProgress(goal.id, newProgress);
      loadAllGoals();
    } catch (error) {
      console.error("Error updating goal progress:", error);
    }
  };

  const handleCreateGoal = (type) => {
    setFormType(type);
    setEditingGoal(null);
    
    if (type === "annual") {
      setShowAnnualForm(true);
    } else if (type === "monthly") {
      setShowMonthlyForm(true);
    } else if (type === "weekly") {
      setShowWeeklyForm(true);
    }
  };

  const handleEditGoal = (goal, type) => {
    setFormType(type);
    setEditingGoal(goal);
    
    if (type === "annual") {
      setShowAnnualForm(true);
    } else if (type === "monthly") {
      setShowMonthlyForm(true);
    } else if (type === "weekly") {
      setShowWeeklyForm(true);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      try {
        await db.deleteGoal(goalId);
        loadAllGoals();
      } catch (error) {
        console.error("Error deleting goal:", error);
      }
    }
  };

  const handleSaveGoal = async (goalData) => {
    try {
      // Add appropriate target fields based on goal type
      const targetData = { ...goalData, type: formType };
      
      if (formType === "monthly") {
        targetData.target_year = currentYear;
        targetData.target_month = currentMonth;
      } else if (formType === "weekly") {
        targetData.target_year = currentYear;
        targetData.target_month = currentMonth;
        targetData.target_week = currentWeek;
      } else if (formType === "annual") {
        targetData.target_year = currentYear;
      }

      if (editingGoal) {
        await db.updateGoal(editingGoal.id, targetData);
      } else {
        await db.createGoal(targetData);
      }
      
      setShowForm(false);
      setShowAnnualForm(false);
      setShowMonthlyForm(false);
      setShowWeeklyForm(false);
      setEditingGoal(null);
      loadAllGoals();
    } catch (error) {
      console.error("Error saving goal:", error);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setShowAnnualForm(false);
    setShowMonthlyForm(false);
    setShowWeeklyForm(false);
    setEditingGoal(null);
  };

  const handleMonthChange = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleToggleAnnualGoal = (goalId) => {
    const newExpanded = new Set(expandedAnnualGoals);
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId);
    } else {
      newExpanded.add(goalId);
    }
    setExpandedAnnualGoals(newExpanded);
  };

  const handleDrillDownToMonthly = (annualGoal) => {
    setSelectedAnnualGoal(annualGoal);
    setDrillDownMode("monthly");
  };

  const handleDrillDownToWeekly = (month) => {
    setSelectedMonth(month);
    setDrillDownMode("weekly");
  };

  const handleBackToAnnual = () => {
    setSelectedAnnualGoal(null);
    setSelectedMonth(null);
    setDrillDownMode(null);
  };

  const handleBackToMonthly = () => {
    setSelectedMonth(null);
    setDrillDownMode("monthly");
  };

  const getMonthlyGoalsForAnnual = async (annualGoalId) => {
    try {
      // Get all monthly goals that have this annual goal as parent
      const allMonthly = await db.getGoals("monthly", annualGoalId);
      return allMonthly;
    } catch (error) {
      console.error("Error loading monthly goals for annual goal:", error);
      return [];
    }
  };

  const getWeeklyGoalsForMonth = async (year, month) => {
    try {
      // Get all weekly goals for specific year and month
      const allWeekly = await db.getGoals("weekly");
      return allWeekly.filter(goal => 
        goal.target_year === year && goal.target_month === month
      );
    } catch (error) {
      console.error("Error loading weekly goals for month:", error);
      return [];
    }
  };

  const GoalCard = ({ goal, type, isCurrentWeek = false }) => (
    <Card className={cn(
      "group hover:shadow-md transition-shadow",
      isCurrentWeek && "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20",
      goal.progress >= 100 && "opacity-75"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className={cn(
              "text-lg flex items-center gap-2",
              goal.progress >= 100 && "line-through text-gray-500"
            )}>
              <button
                onClick={() => handleToggleComplete(goal)}
                className="hover:scale-110 transition-transform"
              >
                {goal.progress >= 100 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400 hover:text-blue-500" />
                )}
              </button>
              {goal.title}
              {isCurrentWeek && (
                <Badge variant="outline" className="text-xs">Current Week</Badge>
              )}
            </CardTitle>
            {goal.description && (
              <CardDescription className="mt-1">{goal.description}</CardDescription>
            )}
          </div>
          
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditGoal(goal, type)}
              className="h-8 w-8 p-0"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteGoal(goal.id)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {goal.progress < 100 && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(goal.progress || 0)}%</span>
              </div>
              <Progress value={goal.progress || 0} className="h-2" />
            </div>
          )}
          
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            {goal.priority && (
              <div className="flex items-center gap-1">
                <Flag className="h-4 w-4" />
                <span className="capitalize">{goal.priority}</span>
              </div>
            )}
            {goal.target_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(goal.target_date), "MMM dd, yyyy")}</span>
              </div>
            )}
            {type === "weekly" && goal.target_week && (
              <Badge variant="outline">Week {goal.target_week}</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const AnnualGoalCard = ({ goal }) => {
    const isExpanded = expandedAnnualGoals.has(goal.id);
    const [monthlyGoals, setMonthlyGoals] = useState([]);
    const [loadingMonthly, setLoadingMonthly] = useState(false);

    useEffect(() => {
      if (isExpanded) {
        loadMonthlyGoals();
      }
    }, [isExpanded, goal.id]);

    const loadMonthlyGoals = async () => {
      setLoadingMonthly(true);
      try {
        const monthly = await getMonthlyGoalsForAnnual(goal.id);
        setMonthlyGoals(monthly);
      } catch (error) {
        console.error("Error loading monthly goals:", error);
      } finally {
        setLoadingMonthly(false);
      }
    };

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const monthlyProgress = Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const monthGoals = monthlyGoals.filter(g => g.target_month === month);
      const avgProgress = monthGoals.length > 0 
        ? monthGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / monthGoals.length
        : 0;
      return { month, name: monthNames[index], progress: avgProgress, goals: monthGoals };
    });

    return (
      <Card className="group hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className={cn(
                "text-xl flex items-center gap-3",
                goal.progress >= 100 && "line-through text-gray-500"
              )}>
                <button
                  onClick={() => handleToggleComplete(goal)}
                  className="hover:scale-110 transition-transform"
                >
                  {goal.progress >= 100 ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : (
                    <Circle className="h-6 w-6 text-gray-400 hover:text-blue-500" />
                  )}
                </button>
                {goal.title}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleAnnualGoal(goal.id)}
                  className="h-6 w-6 p-0"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CardTitle>
              {goal.description && (
                <CardDescription className="mt-2">{goal.description}</CardDescription>
              )}
            </div>
            
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDrillDownToMonthly(goal)}
                className="h-8 px-3 text-xs"
              >
                View Details
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditGoal(goal, "annual")}
                className="h-8 w-8 p-0"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteGoal(goal.id)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {goal.progress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Annual Progress</span>
                  <span>{Math.round(goal.progress || 0)}%</span>
                </div>
                <Progress value={goal.progress || 0} className="h-3" />
              </div>
            )}
            
            {isExpanded && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-sm mb-3">Monthly Breakdown</h4>
                {loadingMonthly ? (
                  <div className="text-center py-4">
                    <div className="spinner mb-2"></div>
                    <p className="text-sm text-gray-500">Loading monthly goals...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-6 gap-2">
                    {monthlyProgress.map(({ month, name, progress, goals }) => (
                      <button
                        key={month}
                        onClick={() => {
                          setSelectedMonth(month);
                          setDrillDownMode("monthly");
                        }}
                        className="p-2 text-center border rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="text-xs font-medium">{name}</div>
                        <div className="text-xs text-gray-500 mt-1">{goals.length} goals</div>
                        <div className="mt-1">
                          <Progress value={progress} className="h-1" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const MonthlyDrillDown = ({ annualGoal }) => {
    const [monthlyGoals, setMonthlyGoals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      loadMonthlyGoals();
    }, [annualGoal.id]);

    const loadMonthlyGoals = async () => {
      try {
        const monthly = await getMonthlyGoalsForAnnual(annualGoal.id);
        setMonthlyGoals(monthly);
      } catch (error) {
        console.error("Error loading monthly goals:", error);
      } finally {
        setLoading(false);
      }
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="spinner"></div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Monthly Goals for "{annualGoal.title}"</h3>
          <Button 
            onClick={() => {
              setFormType("monthly");
              setEditingGoal(null);
              setShowForm(true);
            }}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Monthly Goal
          </Button>
        </div>

        {monthlyGoals.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {monthlyGoals.map((goal) => (
              <Card key={goal.id} className="group hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <button
                          onClick={() => handleToggleComplete(goal)}
                          className="hover:scale-110 transition-transform"
                        >
                          {goal.progress >= 100 ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400 hover:text-blue-500" />
                          )}
                        </button>
                        {goal.title}
                        <Badge variant="outline">
                          {format(new Date(currentYear, goal.target_month - 1), "MMM")}
                        </Badge>
                      </CardTitle>
                      {goal.description && (
                        <CardDescription className="mt-1">{goal.description}</CardDescription>
                      )}
                    </div>
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDrillDownToWeekly(goal.target_month)}
                        className="h-8 px-3 text-xs"
                      >
                        Weeks
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditGoal(goal, "monthly")}
                        className="h-8 w-8 p-0"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {goal.progress < 100 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(goal.progress || 0)}%</span>
                      </div>
                      <Progress value={goal.progress || 0} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center text-gray-500">
            <p>No monthly goals for "{annualGoal.title}"</p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => {
                setFormType("monthly");
                setEditingGoal(null);
                setShowForm(true);
              }}
            >
              Create first monthly goal
            </Button>
          </Card>
        )}
      </div>
    );
  };

  const WeeklyDrillDown = ({ year, month }) => {
    const [weeklyGoals, setWeeklyGoals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      loadWeeklyGoals();
    }, [year, month]);

    const loadWeeklyGoals = async () => {
      try {
        const weekly = await getWeeklyGoalsForMonth(year, month);
        setWeeklyGoals(weekly);
      } catch (error) {
        console.error("Error loading weekly goals:", error);
      } finally {
        setLoading(false);
      }
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="spinner"></div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Weekly Goals for {format(new Date(year, month - 1), "MMMM yyyy")}
          </h3>
          <Button 
            onClick={() => {
              setFormType("weekly");
              setEditingGoal(null);
              setShowForm(true);
            }}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Weekly Goal
          </Button>
        </div>

        {weeklyGoals.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {weeklyGoals.map((goal) => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                type="weekly"
                isCurrentWeek={goal.target_week === currentWeek}
              />
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center text-gray-500">
            <p>No weekly goals for {format(new Date(year, month - 1), "MMMM yyyy")}</p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => {
                setFormType("weekly");
                setEditingGoal(null);
                setShowForm(true);
              }}
            >
              Create first weekly goal
            </Button>
          </Card>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p>Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Goals</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your annual, monthly, and weekly goals
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "current" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("current")}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Current Month
          </Button>
          <Button
            variant={viewMode === "annual" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("annual")}
            className="flex items-center gap-2"
          >
            <Target className="h-4 w-4" />
            Annual View
          </Button>
        </div>
      </div>

      {viewMode === "current" && (
        <>
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => handleMonthChange(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {format(currentDate, "MMMM yyyy")}
              </h2>
              <Button variant="outline" size="sm" onClick={() => handleMonthChange(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Monthly Goals Section or Form */}
          {!showMonthlyForm ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  Monthly Goals ({goals.monthly.length})
                </h3>
                <Button onClick={() => handleCreateGoal("monthly")} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Monthly Goal
                </Button>
              </div>
              
              {goals.monthly.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {goals.monthly.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} type="monthly" />
                  ))}
                </div>
              ) : (
                <Card className="p-6 text-center text-gray-500">
                  <p>No monthly goals for {format(currentDate, "MMMM yyyy")}</p>
                  <Button 
                    variant="outline" 
                    className="mt-2" 
                    onClick={() => handleCreateGoal("monthly")}
                  >
                    Create your first monthly goal
                  </Button>
                </Card>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelForm}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Monthly Goals
                </Button>
              </div>
              
              <Card className="p-6">
                <GoalForm
                  goal={editingGoal}
                  type={formType}
                  focusAreas={focusAreas}
                  parentGoals={goals.annual}
                  onSave={handleSaveGoal}
                  onCancel={handleCancelForm}
                />
              </Card>
            </div>
          )}

          {/* Weekly Goals Section or Form */}
          {!showWeeklyForm ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-500" />
                  Weekly Goals ({goals.weekly.length})
                </h3>
                <Button onClick={() => handleCreateGoal("weekly")} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Weekly Goal
                </Button>
              </div>
              
              {goals.weekly.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {goals.weekly.map((goal) => (
                    <GoalCard 
                      key={goal.id} 
                      goal={goal} 
                      type="weekly"
                      isCurrentWeek={goal.target_week === currentWeek}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-6 text-center text-gray-500">
                  <p>No weekly goals for {format(currentDate, "MMMM yyyy")}</p>
                  <Button 
                    variant="outline" 
                    className="mt-2" 
                    onClick={() => handleCreateGoal("weekly")}
                  >
                    Create your first weekly goal
                  </Button>
                </Card>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelForm}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Weekly Goals
                </Button>
              </div>
              
              <Card className="p-6">
                <GoalForm
                  goal={editingGoal}
                  type={formType}
                  focusAreas={focusAreas}
                  parentGoals={goals.monthly}
                  onSave={handleSaveGoal}
                  onCancel={handleCancelForm}
                />
              </Card>
            </div>
          )}
        </>
      )}

      {viewMode === "annual" && (
        <>
          {/* Breadcrumb Navigation */}
          {drillDownMode && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <button 
                onClick={handleBackToAnnual}
                className="hover:text-blue-500 flex items-center gap-1"
              >
                <Home className="h-4 w-4" />
                Annual Goals
              </button>
              {drillDownMode === "monthly" && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <span>{selectedAnnualGoal?.title}</span>
                </>
              )}
              {drillDownMode === "weekly" && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <button 
                    onClick={handleBackToMonthly}
                    className="hover:text-blue-500"
                  >
                    {selectedAnnualGoal?.title}
                  </button>
                  <ChevronRight className="h-4 w-4" />
                  <span>{format(new Date(currentYear, selectedMonth - 1), "MMMM yyyy")}</span>
                </>
              )}
            </div>
          )}

          {/* Annual Goals Overview or Form */}
          {!drillDownMode && !showAnnualForm && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  Annual Goals ({goals.annual.length})
                </h3>
                <Button onClick={() => handleCreateGoal("annual")} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Annual Goal
                </Button>
              </div>
              
              {goals.annual.length > 0 ? (
                <div className="space-y-4">
                  {goals.annual.map((goal) => (
                    <AnnualGoalCard key={goal.id} goal={goal} />
                  ))}
                </div>
              ) : (
                <Card className="p-6 text-center text-gray-500">
                  <p>No annual goals for {currentYear}</p>
                  <Button 
                    variant="outline" 
                    className="mt-2" 
                    onClick={() => handleCreateGoal("annual")}
                  >
                    Create your first annual goal
                  </Button>
                </Card>
              )}
            </div>
          )}

          {/* Inline Annual Goal Form */}
          {!drillDownMode && showAnnualForm && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelForm}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Annual Goals
                </Button>
              </div>
              
              <Card className="p-6">
                <GoalForm
                  goal={editingGoal}
                  type={formType}
                  focusAreas={focusAreas}
                  parentGoals={[]}
                  onSave={handleSaveGoal}
                  onCancel={handleCancelForm}
                />
              </Card>
            </div>
          )}

          {/* Monthly Goals Drill-down */}
          {drillDownMode === "monthly" && selectedAnnualGoal && (
            <MonthlyDrillDown annualGoal={selectedAnnualGoal} />
          )}

          {/* Weekly Goals Drill-down */}
          {drillDownMode === "weekly" && selectedMonth && (
            <WeeklyDrillDown year={currentYear} month={selectedMonth} />
          )}
        </>
      )}

    </div>
  );
}

export default Goals;