import React, { useState, useEffect } from "react";
import { useDatabase } from "../contexts/UnifiedDatabaseContext";
import {
  Calendar,
  Target,
  Check,
  ChevronDown,
  ChevronUp,
  Star,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";

function FocusAreas() {
  const db = useDatabase();
  const [focusAreas, setFocusAreas] = useState([]);
  const [goals, setGoals] = useState([]);
  const [monthlySelections, setMonthlySelections] = useState({});
  const [expandedMonth, setExpandedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  const months = [
    { name: "January", short: "Jan", number: 1 },
    { name: "February", short: "Feb", number: 2 },
    { name: "March", short: "Mar", number: 3 },
    { name: "April", short: "Apr", number: 4 },
    { name: "May", short: "May", number: 5 },
    { name: "June", short: "Jun", number: 6 },
    { name: "July", short: "Jul", number: 7 },
    { name: "August", short: "Aug", number: 8 },
    { name: "September", short: "Sep", number: 9 },
    { name: "October", short: "Oct", number: 10 },
    { name: "November", short: "Nov", number: 11 },
    { name: "December", short: "Dec", number: 12 },
  ];

  useEffect(() => {
    loadData();
  }, [selectedYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load focus areas
      const areasData = await db.getFocusAreas();
      setFocusAreas(areasData);

      // Load all goals
      const goalsData = await db.getGoals();
      setGoals(goalsData);

      // Load monthly focus area selections
      await loadMonthlySelections();
    } catch (error) {
      console.error("Error loading focus areas data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlySelections = async () => {
    try {
      // Load saved monthly focus selections and goal assignments
      const selections = {};
      
      // Get all monthly focus assignments for the year
      const monthlyAssignments = await db.getMonthlyFocusAreas(selectedYear);
      
      // Process each assignment
      for (const assignment of monthlyAssignments) {
        // Get monthly goals assigned to this focus area and month
        const assignedGoals = await db.getMonthlyGoals(selectedYear, assignment.month);
        
        selections[assignment.month] = {
          focusAreaId: assignment.focus_area_id,
          assignedGoals: assignedGoals.map(g => g.id)
        };
      }
      
      setMonthlySelections(selections);
    } catch (error) {
      console.error("Error loading monthly selections:", error);
      setMonthlySelections({});
    }
  };

  const handleFocusAreaChange = async (monthNumber, focusAreaId) => {
    try {
      // Use the convenience method from the database context
      await db.setMonthlyFocusArea(selectedYear, monthNumber, focusAreaId);

      // Update local state
      setMonthlySelections(prev => ({
        ...prev,
        [monthNumber]: {
          focusAreaId: focusAreaId || null,
          assignedGoals: []
        }
      }));
    } catch (error) {
      console.error("Error updating focus area selection:", error);
    }
  };

  const handleGoalToggle = async (monthNumber, goalId, isSelected) => {
    try {
      const selection = monthlySelections[monthNumber];
      
      if (isSelected) {
        // Assign goal to this month and focus area
        await db.updateGoal(goalId, {
          target_year: selectedYear,
          target_month: monthNumber,
          focus_area_id: selection.focusAreaId
        });
      } else {
        // Remove goal assignment
        await db.updateGoal(goalId, {
          target_year: null,
          target_month: null,
          focus_area_id: null
        });
      }

      // Update local state
      setMonthlySelections(prev => ({
        ...prev,
        [monthNumber]: {
          ...prev[monthNumber],
          assignedGoals: isSelected 
            ? [...(prev[monthNumber]?.assignedGoals || []), goalId]
            : (prev[monthNumber]?.assignedGoals || []).filter(id => id !== goalId)
        }
      }));
    } catch (error) {
      console.error("Error toggling goal assignment:", error);
    }
  };

  const getGoalsForFocusArea = (focusAreaId) => {
    return goals.filter(goal => 
      goal.type === 'monthly' && 
      (goal.focus_area_id === focusAreaId || !goal.focus_area_id)
    );
  };

  const getFocusAreaName = (focusAreaId) => {
    const area = focusAreas.find(a => a.id === focusAreaId);
    return area ? area.name : "";
  };

  const getMonthProgress = (monthNumber) => {
    const selection = monthlySelections[monthNumber];
    if (!selection || !selection.assignedGoals.length) return 0;
    
    const monthGoals = goals.filter(g => selection.assignedGoals.includes(g.id));
    const totalProgress = monthGoals.reduce((sum, goal) => sum + (goal.progress || 0), 0);
    return Math.round(totalProgress / monthGoals.length);
  };

  const toggleMonthExpansion = (monthNumber) => {
    setExpandedMonth(expandedMonth === monthNumber ? null : monthNumber);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <Card className="welcome-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="welcome-title">Focus Areas 🎯</h1>
              <p className="welcome-subtitle">
                Plan your year by assigning focus areas and goals to each month
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-primary" />
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="form-input py-2 px-3 pr-10 min-w-[100px]"
                >
                  {[2024, 2025, 2026, 2027].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Year Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-md mr-3">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Focus Areas</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {focusAreas.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-md mr-3">
                <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Assigned Months</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  {Object.keys(monthlySelections).filter(m => monthlySelections[m].focusAreaId).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-md mr-3">
                <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Goals Assigned</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {Object.values(monthlySelections).reduce((sum, sel) => sum + (sel.assignedGoals?.length || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-md mr-3">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Avg Progress</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {Math.round(months.reduce((sum, m) => sum + getMonthProgress(m.number), 0) / 12)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Grid - 3 columns, 4 rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {months.map((month) => {
          const selection = monthlySelections[month.number] || {};
          const progress = getMonthProgress(month.number);
          const isExpanded = expandedMonth === month.number;
          const availableGoals = selection.focusAreaId ? getGoalsForFocusArea(selection.focusAreaId) : [];

          return (
            <Card key={month.number} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {/* Month Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {month.name} {selectedYear}
                    </h3>
                    {selection.focusAreaId && (
                      <p className="text-sm text-primary font-medium">
                        {getFocusAreaName(selection.focusAreaId)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {progress}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {selection.assignedGoals?.length || 0} goals
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Focus Area Selector */}
                <div className="mb-4">
                  <label className="form-label block mb-3">Focus Area</label>
                  <select
                    value={selection.focusAreaId || ""}
                    onChange={(e) => handleFocusAreaChange(month.number, e.target.value ? parseInt(e.target.value) : null)}
                    className="form-input w-full"
                  >
                    <option value="">Select focus area</option>
                    {focusAreas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Goals Section */}
                {selection.focusAreaId && availableGoals.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="form-label mb-0">Goals for this Month</label>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleMonthExpansion(month.number)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    
                    <div className={`space-y-2 ${!isExpanded ? 'max-h-32 overflow-hidden' : ''}`}>
                      {availableGoals.slice(0, isExpanded ? undefined : 3).map((goal) => {
                        const isSelected = selection.assignedGoals?.includes(goal.id) || false;
                        return (
                          <label key={goal.id} className="flex items-start space-x-3 cursor-pointer p-2 hover:bg-muted/50 rounded">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleGoalToggle(month.number, goal.id, e.target.checked)}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {goal.title}
                              </p>
                              {goal.description && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {goal.description}
                                </p>
                              )}
                              <div className="flex items-center mt-1">
                                <div className="w-16 mr-2">
                                  <Progress value={goal.progress || 0} className="h-1" />
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {goal.progress || 0}%
                                </span>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                      
                      {!isExpanded && availableGoals.length > 3 && (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          +{availableGoals.length - 3} more goals
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {selection.focusAreaId && availableGoals.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No goals available</p>
                    <p className="text-xs">Create goals for this focus area</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default FocusAreas;
