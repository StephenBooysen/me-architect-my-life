import React, { useState, useEffect } from "react";
import { useDatabase } from "../contexts/UnifiedDatabaseContext";
import {
  Target,
  CheckSquare,
  Calendar,
  TrendingUp,
  Quote,
  Plus,
  ChevronRight,
  Star,
  Zap,
  Smile,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { cn } from "../lib/utils";

function Dashboard() {
  const db = useDatabase();
  const [dashboardData, setDashboardData] = useState({
    todaysFocus: [],
    goalProgress: [],
    habitStreaks: [],
    dailyWisdom: null,
    recentReflections: [],
    morningNote: null,
    moodSummary: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get current week's goals
      const weeklyGoals = await db.getGoals("weekly");
      const currentWeekGoals = weeklyGoals.slice(0, 3);

      // Get annual goals progress
      const annualGoals = await db.getGoals("annual");

      // Get active habits
      const habits = await db.getHabits();
      const today = format(new Date(), "yyyy-MM-dd");

      // Get habit logs for today
      const habitStreaks = await Promise.all(
        habits.slice(0, 5).map(async (habit) => {
          const logs = await db.getHabitLogs(habit.id, today, today);
          const todayLog = logs.find((log) => log.date === today);
          return {
            ...habit,
            completedToday: todayLog?.completed || false,
            streak: Math.floor(Math.random() * 15) + 1, // Mock streak for demo
          };
        })
      );

      // Get random wisdom quote
      const allWisdom = await db.getWisdom();
      const randomWisdom =
        allWisdom.length > 0
          ? allWisdom[Math.floor(Math.random() * allWisdom.length)]
          : {
              content: "The journey of a thousand miles begins with one step.",
              author: "Lao Tzu",
            };

      // Get recent morning note
      const morningNote = await db.getMorningNote(today);

      // Get mood summary for the last 7 days
      const moods = await db.getMoodsForMonth(format(new Date(), 'yyyy-MM'));
      const moodSummary = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const mood = moods.find(m => m.date === dateStr);
        moodSummary.push({ date: dateStr, rating: mood ? mood.rating : 0 });
      }

      setDashboardData({
        todaysFocus: currentWeekGoals,
        goalProgress: annualGoals.slice(0, 4),
        habitStreaks: habitStreaks,
        dailyWisdom: randomWisdom,
        morningNote: morningNote,
        moodSummary: moodSummary,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleHabit = async (habit) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const newCompleted = !habit.completedToday;

    try {
      await db.logHabit(habit.id, today, newCompleted);
      loadDashboardData(); // Refresh data
    } catch (error) {
      console.error("Error toggling habit:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  const completedHabits = dashboardData.habitStreaks.filter(
    (h) => h.completedToday
  ).length;
  const totalHabits = dashboardData.habitStreaks.length;
  const completionPercentage =
    totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="welcome-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="welcome-title">
                Good Morning! 🌟
              </h1>
              <p className="welcome-subtitle">
                Ready to architect another amazing day?
              </p>
            </div>
            <Card className="bg-background shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  {completionPercentage}%
                </div>
                <div className="text-sm text-muted-foreground">Today's Progress</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="dashboard-grid">
        {/* Today's Focus */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-primary/20 p-2 rounded-md mr-3">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Today's Focus</CardTitle>
              </div>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Goal
              </Button>
            </div>
          </CardHeader>
          <CardContent>

            {dashboardData.todaysFocus.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.todaysFocus.map((goal) => (
                  <Card key={goal.id} className="border border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-2">
                            {goal.title}
                          </h4>
                          <div className="flex items-center">
                            <Progress value={goal.progress || 0} className="flex-1 mr-3" />
                            <Badge variant="default">
                              {goal.progress || 0}%
                            </Badge>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground ml-3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No goals set for this week yet.
                </p>
                <Button>
                  Set Weekly Goals
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mood Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-md mr-3">
                <Smile className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>This Week's Mood</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {dashboardData.moodSummary.map((mood) => (
                <div key={mood.date} className="text-center">
                  <div className="text-sm text-muted-foreground">{format(new Date(mood.date), 'E')}</div>
                  <div className="text-2xl mt-2">
                    {mood.rating === 1 && '😡'}
                    {mood.rating === 2 && '😞'}
                    {mood.rating === 3 && '😐'}
                    {mood.rating === 4 && '😊'}
                    {mood.rating === 5 && '🤩'}
                    {mood.rating === 0 && '❓'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Habits Tracker */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-md mr-3">
                  <CheckSquare className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle>Today's Habits</CardTitle>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground font-medium">
                  {completedHabits}/{totalHabits}
                </span>
                <Button variant="secondary" size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>

            {dashboardData.habitStreaks.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.habitStreaks.map((habit) => (
                  <Card 
                    key={habit.id} 
                    className={cn(
                      "cursor-pointer transition-all",
                      habit.completedToday ? "bg-primary/10 border-primary/20" : "hover:bg-muted/50"
                    )}
                    onClick={() => toggleHabit(habit)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {habit.name}
                          </h4>
                          <div className="flex items-center mt-1">
                            <Zap className="w-4 h-4 text-orange-500 mr-1" />
                            <span className="text-sm text-muted-foreground">
                              {habit.streak} day streak
                            </span>
                          </div>
                        </div>
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                            habit.completedToday
                              ? "bg-primary border-primary"
                              : "border-muted-foreground/30"
                          )}
                        >
                          {habit.completedToday && (
                            <CheckSquare className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckSquare className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No habits tracked yet.</p>
                <Button>
                  Add Your First Habit
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Goal Progress Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <div className="bg-primary/20 p-2 rounded-md mr-3">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Goal Progress</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {dashboardData.goalProgress.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.goalProgress.map((goal) => (
                  <Card key={goal.id} className="border border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">{goal.title}</h4>
                        <span className="text-sm text-muted-foreground">
                          {goal.progress || 0}%
                        </span>
                      </div>
                      <Progress value={goal.progress || 0} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No annual goals set yet.</p>
                <Button>
                  Set Annual Goals
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Wisdom */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-md mr-3">
                <Quote className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle>Daily Inspiration</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {dashboardData.dailyWisdom ? (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="prose prose-lg prose-invert max-w-none">
                    <ReactMarkdown>{dashboardData.dailyWisdom.content}</ReactMarkdown>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-primary mr-2" />
                    <cite className="text-sm text-muted-foreground font-medium">
                      {dashboardData.dailyWisdom.author || "Unknown"}
                    </cite>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12">
                <Quote className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No wisdom quotes yet.</p>
                <Button>
                  Add Inspiration
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <div className="bg-primary/20 p-2 rounded-md mr-3">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Today's Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="stats-grid">
              <Card className="bg-primary/10 border-primary/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {dashboardData.todaysFocus.length}
                  </div>
                  <div className="text-sm text-primary">Focus Goals</div>
                </CardContent>
              </Card>
              <Card className="bg-orange-100 dark:bg-orange-900 border-orange-200 dark:border-orange-800">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                    {completedHabits}
                  </div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">Habits Done</div>
                </CardContent>
              </Card>
              <Card className="bg-primary/10 border-primary/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {dashboardData.goalProgress.length}
                  </div>
                  <div className="text-sm text-primary">Active Goals</div>
                </CardContent>
              </Card>
              <Card className="bg-muted/50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {format(new Date(), "d")}
                  </div>
                  <div className="text-sm text-muted-foreground">Day of Month</div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
