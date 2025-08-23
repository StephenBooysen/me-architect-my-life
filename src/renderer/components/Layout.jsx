import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import AIChat from "./AIChat";
import { useDatabase } from "../contexts/UnifiedDatabaseContext";
import { PanelLeftOpen, PanelLeftClose, PanelRightOpen, PanelRightClose } from "lucide-react";

function Layout({ children }) {
  const [currentPage, setCurrentPage] = useState('');
  const [pageData, setPageData] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [aiChatVisible, setAiChatVisible] = useState(true);
  const location = useLocation();
  const db = useDatabase();

  // Load visibility preferences from localStorage on mount
  useEffect(() => {
    const savedSidebarState = localStorage.getItem('sidebar-visible');
    const savedAiChatState = localStorage.getItem('ai-chat-visible');
    
    if (savedSidebarState !== null) {
      setSidebarVisible(JSON.parse(savedSidebarState));
    }
    
    if (savedAiChatState !== null) {
      setAiChatVisible(JSON.parse(savedAiChatState));
    }
  }, []);

  // Save visibility preferences to localStorage
  const toggleSidebar = () => {
    const newState = !sidebarVisible;
    setSidebarVisible(newState);
    localStorage.setItem('sidebar-visible', JSON.stringify(newState));
  };

  const toggleAiChat = () => {
    const newState = !aiChatVisible;
    setAiChatVisible(newState);
    localStorage.setItem('ai-chat-visible', JSON.stringify(newState));
  };

  // Track page changes
  useEffect(() => {
    const path = location.pathname;
    let pageName = '';
    
    if (path.includes('/goals')) {
      pageName = 'goals';
    } else if (path.includes('/habits')) {
      pageName = 'habits';
    } else if (path.includes('/reflection')) {
      pageName = 'reflection';
    } else if (path.includes('/wisdom')) {
      pageName = 'wisdom';
    } else if (path.includes('/focus-areas')) {
      pageName = 'focus-areas';
    } else if (path.includes('/dashboard')) {
      pageName = 'dashboard';
    } else {
      pageName = 'dashboard'; // default
    }
    
    setCurrentPage(pageName);
    loadPageData(pageName);
  }, [location.pathname]);

  // Load relevant data for the current page
  const loadPageData = async (pageName) => {
    try {
      let data = {};
      
      switch (pageName) {
        case 'goals':
          const [annualGoals, monthlyGoals, weeklyGoals] = await Promise.all([
            db.getGoals('annual'),
            db.getGoals('monthly'), 
            db.getGoals('weekly')
          ]);
          data = {
            annual: annualGoals || [],
            monthly: monthlyGoals || [],
            weekly: weeklyGoals || [],
            totalGoals: (annualGoals?.length || 0) + (monthlyGoals?.length || 0) + (weeklyGoals?.length || 0),
            completedGoals: [
              ...(annualGoals || []).filter(g => g.progress === 100),
              ...(monthlyGoals || []).filter(g => g.progress === 100),
              ...(weeklyGoals || []).filter(g => g.progress === 100)
            ],
            avgProgress: calculateAverageProgress([...(annualGoals || []), ...(monthlyGoals || []), ...(weeklyGoals || [])])
          };
          break;
          
        case 'habits':
          const habits = await db.getHabits();
          const habitLogs = [];
          
          // Get recent habit logs for analysis
          if (habits) {
            for (const habit of habits.slice(0, 5)) { // Limit to avoid too much data
              const logs = await db.getHabitLogs(
                habit.id,
                new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
                new Date().toISOString().split('T')[0]
              );
              habitLogs.push({ habit: habit.name, logs: logs || [] });
            }
          }
          
          data = {
            habits: habits || [],
            recentLogs: habitLogs,
            totalHabits: habits?.length || 0,
            activeHabits: habits?.filter(h => h.is_active)?.length || 0
          };
          break;
          
        case 'reflection':
          const today = new Date().toISOString().split('T')[0];
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          
          const [morningNote, eveningReflection] = await Promise.all([
            db.getMorningNote(today),
            db.getEveningReflection(today)
          ]);
          
          data = {
            todayMorning: morningNote,
            todayEvening: eveningReflection,
            currentDate: today,
            hasReflections: !!(morningNote || eveningReflection)
          };
          break;
          
        case 'wisdom':
          const wisdom = await db.getWisdom(null, 20); // Recent 20 entries
          data = {
            wisdomEntries: wisdom || [],
            totalWisdom: wisdom?.length || 0,
            favorites: wisdom?.filter(w => w.is_favorite) || [],
            categories: [...new Set((wisdom || []).map(w => w.category).filter(Boolean))]
          };
          break;
          
        case 'focus-areas':
          const focusAreas = await db.getFocusAreas();
          const currentYear = new Date().getFullYear();
          const monthlyFocus = await db.getMonthlyFocusAreas(currentYear);
          
          data = {
            focusAreas: focusAreas || [],
            monthlyAssignments: monthlyFocus || [],
            currentYear,
            assignedMonths: monthlyFocus?.length || 0
          };
          break;
          
        case 'dashboard':
          // Aggregate data from all areas
          const [dashGoals, dashHabits, dashWisdom, dashFocusAreas] = await Promise.all([
            db.getGoals(),
            db.getHabits(),
            db.getWisdom(null, 5),
            db.getFocusAreas()
          ]);
          
          data = {
            summary: {
              totalGoals: dashGoals?.length || 0,
              activeHabits: dashHabits?.filter(h => h.is_active)?.length || 0,
              wisdomCount: dashWisdom?.length || 0,
              focusAreasCount: dashFocusAreas?.length || 0
            },
            recentActivity: {
              goals: dashGoals?.slice(0, 3) || [],
              habits: dashHabits?.slice(0, 3) || [],
              wisdom: dashWisdom || []
            }
          };
          break;
          
        default:
          data = { page: pageName };
      }
      
      setPageData(data);
    } catch (error) {
      console.error('Error loading page data for AI analysis:', error);
      setPageData({ error: error.message, page: pageName });
    }
  };

  const calculateAverageProgress = (goals) => {
    if (!goals || goals.length === 0) return 0;
    const totalProgress = goals.reduce((sum, goal) => sum + (goal.progress || 0), 0);
    return Math.round(totalProgress / goals.length);
  };


  return (
    <div className={`app-layout ${!sidebarVisible ? 'sidebar-hidden' : ''} ${!aiChatVisible ? 'ai-chat-hidden' : ''}`}>
      {/* Sidebar Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="toggle-btn sidebar-toggle"
        title={sidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
      >
        {sidebarVisible ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
      </button>
      
      {/* AI Chat Toggle Button */}
      <button
        onClick={toggleAiChat}
        className="toggle-btn ai-chat-toggle"
        title={aiChatVisible ? 'Hide AI chat' : 'Show AI chat'}
      >
        {aiChatVisible ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
      </button>

      {sidebarVisible && <Sidebar />}
      
      <div className="main-container">
        <Header />
        <main className="main-content">{children}</main>
      </div>
      
      {aiChatVisible && (
        <AIChat 
          currentPage={currentPage}
          pageData={pageData}
        />
      )}
    </div>
  );
}

export default Layout;
