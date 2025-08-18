import React, { useState, useEffect } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { Target, CheckSquare, Calendar, TrendingUp, Quote, Plus, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

function Dashboard() {
  const db = useDatabase();
  const [dashboardData, setDashboardData] = useState({
    todaysFocus: [],
    goalProgress: [],
    habitStreaks: [],
    dailyWisdom: null,
    recentReflections: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get current week's goals
      const weeklyGoals = await db.getGoals('weekly');
      const currentWeekGoals = weeklyGoals.slice(0, 3); // Top 3 for today's focus
      
      // Get annual goals progress
      const annualGoals = await db.getGoals('annual');
      
      // Get active habits
      const habits = await db.getHabits();
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Get habit logs for today to calculate streaks
      const habitStreaks = await Promise.all(
        habits.slice(0, 5).map(async (habit) => {
          const logs = await db.getHabitLogs(habit.id, today, today);
          const todayLog = logs.find(log => log.date === today);
          return {
            ...habit,
            completedToday: todayLog?.completed || false,
            streak: 0 // This would need more complex calculation for real streaks
          };
        })
      );

      // Get random wisdom quote
      const allWisdom = await db.getWisdom();
      const randomWisdom = allWisdom.length > 0 
        ? allWisdom[Math.floor(Math.random() * allWisdom.length)]
        : null;

      // Get recent morning note
      const morningNote = await db.getMorningNote(today);

      setDashboardData({
        todaysFocus: currentWeekGoals,
        goalProgress: annualGoals.slice(0, 4),
        habitStreaks: habitStreaks,
        dailyWisdom: randomWisdom,
        morningNote: morningNote
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleHabit = async (habit) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const newCompleted = !habit.completedToday;
    
    try {
      await db.logHabit(habit.id, today, newCompleted);
      loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Good Morning! 👋</h1>
        <p className="text-blue-100">Ready to architect another amazing day?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Focus */}
        <div className="lg:col-span-2 space-y-6">
          {/* Focus Widget */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Target className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="card-title">Today's Focus</h3>
                </div>
                <button className="btn btn-secondary btn-sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Goal
                </button>
              </div>
            </div>
            <div className="card-body">
              {dashboardData.todaysFocus.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.todaysFocus.map((goal) => (
                    <div key={goal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{goal.title}</h4>
                        <div className="flex items-center mt-1">
                          <div className="progress-bar w-32 mr-3">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${goal.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500">{goal.progress}%</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No goals set for this week yet.</p>
                  <button className="btn btn-primary mt-3">Set Weekly Goals</button>
                </div>
              )}
            </div>
          </div>

          {/* Habits Tracker */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckSquare className="w-5 h-5 text-green-600 mr-2" />
                  <h3 className="card-title">Today's Habits</h3>
                </div>
                <button className="btn btn-secondary btn-sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Habit
                </button>
              </div>
            </div>
            <div className="card-body">
              {dashboardData.habitStreaks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {dashboardData.habitStreaks.map((habit) => (
                    <div 
                      key={habit.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        habit.completedToday 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      onClick={() => toggleHabit(habit)}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">{habit.name}</h4>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          habit.completedToday 
                            ? 'border-green-500 bg-green-500' 
                            : 'border-gray-300'
                        }`}>
                          {habit.completedToday && (
                            <CheckSquare className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Streak: {habit.streak} days
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No habits tracked yet.</p>
                  <button className="btn btn-primary mt-3">Create Your First Habit</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Daily Wisdom */}
          {dashboardData.dailyWisdom && (
            <div className="card">
              <div className="card-header">
                <div className="flex items-center">
                  <Quote className="w-5 h-5 text-purple-600 mr-2" />
                  <h3 className="card-title">Daily Wisdom</h3>
                </div>
              </div>
              <div className="card-body">
                <blockquote className="text-gray-700 italic mb-3">
                  "{dashboardData.dailyWisdom.content}"
                </blockquote>
                {dashboardData.dailyWisdom.author && (
                  <p className="text-sm text-gray-500">
                    — {dashboardData.dailyWisdom.author}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Goal Progress Summary */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="card-title">Goal Progress</h3>
              </div>
            </div>
            <div className="card-body">
              {dashboardData.goalProgress.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.goalProgress.map((goal) => (
                    <div key={goal.id}>
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {goal.title}
                        </h4>
                        <span className="text-sm text-gray-500">{goal.progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm">No annual goals set yet.</p>
                  <button className="btn btn-primary btn-sm mt-2">Set Goals</button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Quick Actions</h3>
            </div>
            <div className="card-body">
              <div className="space-y-2">
                <button className="w-full btn btn-secondary text-left">
                  <Calendar className="w-4 h-4 mr-2" />
                  Morning Notes
                </button>
                <button className="w-full btn btn-secondary text-left">
                  <Target className="w-4 h-4 mr-2" />
                  Weekly Review
                </button>
                <button className="w-full btn btn-secondary text-left">
                  <Quote className="w-4 h-4 mr-2" />
                  Add Wisdom
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;