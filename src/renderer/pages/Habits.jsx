import React, { useState, useEffect, useCallback } from "react";
import { useDatabase } from "../contexts/UnifiedDatabaseContext";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks } from "date-fns";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus, Target, TrendingUp, Calendar, CheckCircle } from "lucide-react";

function Habits() {
  const { getHabits, createHabit, getHabitLogs, logHabit } = useDatabase();
  const [habits, setHabits] = useState([]);
  const [newHabitName, setNewHabitName] = useState("");
  const [habitLogs, setHabitLogs] = useState({});
  const [lastWeekLogs, setLastWeekLogs] = useState({});

  const today = new Date();
  const weekStartsOn = 1; // Monday
  const currentWeek = eachDayOfInterval({
    start: startOfWeek(today, { weekStartsOn }),
    end: endOfWeek(today, { weekStartsOn }),
  });
  const lastWeek = eachDayOfInterval({
    start: startOfWeek(subWeeks(today, 1), { weekStartsOn }),
    end: endOfWeek(subWeeks(today, 1), { weekStartsOn }),
  });

  const fetchHabitsAndLogs = useCallback(async () => {
    const activeHabits = await getHabits();
    setHabits(activeHabits);

    const logs = {};
    const lastWeekLogsData = {};

    for (const habit of activeHabits) {
      const currentWeekLogs = await getHabitLogs(
        habit.id,
        format(currentWeek[0], "yyyy-MM-dd"),
        format(currentWeek[6], "yyyy-MM-dd")
      );
      logs[habit.id] = currentWeekLogs.reduce((acc, log) => {
        acc[log.date] = log.completed;
        return acc;
      }, {});

      const lastWeekLogsResult = await getHabitLogs(
        habit.id,
        format(lastWeek[0], "yyyy-MM-dd"),
        format(lastWeek[6], "yyyy-MM-dd")
      );
      lastWeekLogsData[habit.id] = lastWeekLogsResult.reduce((acc, log) => {
        acc[log.date] = log.completed;
        return acc;
      }, {});
    }
    setHabitLogs(logs);
    setLastWeekLogs(lastWeekLogsData);
  }, [getHabits, getHabitLogs, currentWeek, lastWeek]);

  useEffect(() => {
    fetchHabitsAndLogs();
  }, [fetchHabitsAndLogs]);

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (newHabitName.trim()) {
      await createHabit({ name: newHabitName });
      setNewHabitName("");
      fetchHabitsAndLogs();
    }
  };

  const handleLogHabit = async (habitId, date, completed) => {
    await logHabit(habitId, format(date, "yyyy-MM-dd"), completed);
    fetchHabitsAndLogs();
  };

  const getHabitSuccessRate = (habitId) => {
    const logs = lastWeekLogs[habitId] || {};
    const completedCount = Object.values(logs).filter(Boolean).length;
    return completedCount;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="welcome-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="welcome-title">Habits 🏆</h1>
              <p className="welcome-subtitle">
                Build and track daily habits
              </p>
            </div>
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
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Habits</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {habits.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-md mr-3">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Today Complete</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {habits.filter(h => habitLogs[h.id]?.[format(today, "yyyy-MM-dd")]).length}
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
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Avg Last Week</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {habits.length > 0 ? Math.round(habits.reduce((sum, h) => sum + getHabitSuccessRate(h.id), 0) / habits.length) : 0}/7
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-md mr-3">
                <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">This Week</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {format(today, "'W'w")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Habit */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Add New Habit</h2>
          <form onSubmit={handleAddHabit} className="flex gap-2">
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="Enter a new habit..."
              className="form-input flex-1"
            />
            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" />
              Add Habit
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* This Week's Habits */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">This Week's Habits</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Habit</th>
                  {currentWeek.map((day) => (
                    <th key={day} className="text-center py-3 px-2 font-medium text-muted-foreground min-w-[60px]">
                      <div className="text-sm">
                        {format(day, "EEE")}
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        {format(day, "d")}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {habits.map((habit, index) => (
                  <tr key={habit.id} className={`border-b border-border hover:bg-muted/50 ${index % 2 === 0 ? 'bg-muted/20' : ''}`}>
                    <td className="py-4 px-4 font-medium text-foreground">{habit.name}</td>
                    {currentWeek.map((day) => (
                      <td key={day} className="text-center py-4 px-2">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded border-2 border-primary text-primary focus:ring-primary focus:ring-2 focus:ring-offset-2"
                          checked={
                            habitLogs[habit.id]?.[format(day, "yyyy-MM-dd")] ||
                            false
                          }
                          onChange={(e) =>
                            handleLogHabit(habit.id, day, e.target.checked)
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Last Week's Summary */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Last Week's Summary</h2>
          {habits.length > 0 ? (
            <div className="space-y-3">
              {habits.map((habit) => {
                const successRate = getHabitSuccessRate(habit.id);
                const percentage = Math.round((successRate / 7) * 100);
                return (
                  <div
                    key={habit.id}
                    className="flex justify-between items-center p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-medium text-foreground">{habit.name}</span>
                    <div className="flex items-center space-x-3">
                      <div className={`text-sm px-2 py-1 rounded-full ${
                        percentage >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                        percentage >= 50 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {percentage}%
                      </div>
                      <span className="font-bold text-foreground">
                        {successRate} / 7
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-16 h-16 mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium mb-2">No habits yet</p>
              <p className="text-sm">Add your first habit to start tracking your progress</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Habits;