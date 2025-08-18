import React, { useState, useEffect } from 'react';
import { useDatabase } from '../contexts/UnifiedDatabaseContext';
import { Target, CheckSquare, Calendar, TrendingUp, Quote, Plus, ChevronRight, Star, Zap } from 'lucide-react';
import { format } from 'date-fns';

function Dashboard() {
  const db = useDatabase();
  const [dashboardData, setDashboardData] = useState({
    todaysFocus: [],
    goalProgress: [],
    habitStreaks: [],
    dailyWisdom: null,
    recentReflections: [],
    morningNote: null
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
      const currentWeekGoals = weeklyGoals.slice(0, 3);
      
      // Get annual goals progress
      const annualGoals = await db.getGoals('annual');
      
      // Get active habits
      const habits = await db.getHabits();
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Get habit logs for today
      const habitStreaks = await Promise.all(
        habits.slice(0, 5).map(async (habit) => {
          const logs = await db.getHabitLogs(habit.id, today, today);
          const todayLog = logs.find(log => log.date === today);
          return {
            ...habit,
            completedToday: todayLog?.completed || false,
            streak: Math.floor(Math.random() * 15) + 1 // Mock streak for demo
          };
        })
      );

      // Get random wisdom quote
      const allWisdom = await db.getWisdom();
      const randomWisdom = allWisdom.length > 0 ? 
        allWisdom[Math.floor(Math.random() * allWisdom.length)] : 
        { content: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" };

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

  const completedHabits = dashboardData.habitStreaks.filter(h => h.completedToday).length;
  const totalHabits = dashboardData.habitStreaks.length;
  const completionPercentage = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flat-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Good Morning! 🌟</h1>
            <p className="text-gray-600">Ready to architect another amazing day?</p>
          </div>
          <div className="flat-surface" style={{ padding: '24px', textAlign: 'center' }}>
            <div className="text-3xl font-bold text-primary mb-1">{completionPercentage}%</div>
            <div className="text-sm text-gray-500">Today's Progress</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Today's Focus */}
        <div className="flat-card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Target className="w-6 h-6 text-primary mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">Today's Focus</h3>
            </div>
            <button className="flat-button flat-button-secondary">
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </button>
          </div>
          
          {dashboardData.todaysFocus.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.todaysFocus.map((goal) => (
                <div key={goal.id} className="flat-surface p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-2">{goal.title}</h4>
                      <div className="flex items-center">
                        <div className="progress-bar flex-1 mr-3">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${goal.progress || 0}%` }}
                          ></div>
                        </div>
                        <span className="badge badge-primary">{goal.progress || 0}%</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 ml-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No goals set for this week yet.</p>
              <button className="flat-button flat-button-primary">Set Weekly Goals</button>
            </div>
          )}
        </div>

        {/* Habits Tracker */}
        <div className="flat-card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <CheckSquare className="w-6 h-6 text-primary mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">Today's Habits</h3>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">{completedHabits}/{totalHabits}</span>
              <button className="flat-button" style={{ padding: '8px' }}>
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {dashboardData.habitStreaks.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.habitStreaks.map((habit) => (
                <div 
                  key={habit.id}
                  className={`flat-surface p-4 cursor-pointer transition-all ${
                    habit.completedToday 
                      ? 'bg-primary-light' 
                      : ''
                  }`}
                  onClick={() => toggleHabit(habit)}
                  style={{
                    background: habit.completedToday ? 'var(--primary-light)' : 'var(--white)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800">{habit.name}</h4>
                      <div className="flex items-center mt-1">
                        <Zap className="w-4 h-4 text-orange-500 mr-1" />
                        <span className="text-sm text-gray-600">{habit.streak} day streak</span>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      habit.completedToday 
                        ? 'bg-primary border-primary' 
                        : 'border-gray-300'
                    }`}>
                      {habit.completedToday && <CheckSquare className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No habits tracked yet.</p>
              <button className="flat-button flat-button-primary">Add Your First Habit</button>
            </div>
          )}
        </div>

        {/* Goal Progress Overview */}
        <div className="flat-card">
          <div className="flex items-center mb-6">
            <TrendingUp className="w-6 h-6 text-primary mr-3" />
            <h3 className="text-xl font-semibold text-gray-800">Goal Progress</h3>
          </div>
          
          {dashboardData.goalProgress.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.goalProgress.map((goal) => (
                <div key={goal.id} className="flat-surface p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{goal.title}</h4>
                    <span className="text-sm text-gray-600">{goal.progress || 0}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${goal.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No annual goals set yet.</p>
              <button className="flat-button flat-button-primary">Set Annual Goals</button>
            </div>
          )}
        </div>

        {/* Daily Wisdom */}
        <div className="flat-card">
          <div className="flex items-center mb-6">
            <Quote className="w-6 h-6 text-primary mr-3" />
            <h3 className="text-xl font-semibold text-gray-800">Daily Inspiration</h3>
          </div>
          
          {dashboardData.dailyWisdom ? (
            <div className="flat-surface p-4" style={{ background: 'var(--gray-50)' }}>
              <blockquote className="text-gray-700 italic mb-3 text-lg leading-relaxed">
                "{dashboardData.dailyWisdom.content}"
              </blockquote>
              <div className="flex items-center">
                <Star className="w-4 h-4 text-primary mr-2" />
                <cite className="text-sm text-gray-600 font-medium">
                  {dashboardData.dailyWisdom.author || 'Unknown'}
                </cite>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Quote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No wisdom quotes yet.</p>
              <button className="flat-button flat-button-primary">Add Inspiration</button>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="flat-card">
          <div className="flex items-center mb-6">
            <Calendar className="w-6 h-6 text-primary mr-3" />
            <h3 className="text-xl font-semibold text-gray-800">Today's Summary</h3>
          </div>
          
          <div className="stats-grid">
            <div className="flat-surface p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">{dashboardData.todaysFocus.length}</div>
              <div className="text-sm text-gray-500">Focus Goals</div>
            </div>
            <div className="flat-surface p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">{completedHabits}</div>
              <div className="text-sm text-gray-500">Habits Done</div>
            </div>
            <div className="flat-surface p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">{dashboardData.goalProgress.length}</div>
              <div className="text-sm text-gray-500">Active Goals</div>
            </div>
            <div className="flat-surface p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">{format(new Date(), 'd')}</div>
              <div className="text-sm text-gray-500">Day of Month</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;