import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import FocusAreas from './pages/FocusAreas';
import Habits from './pages/Habits';
import Reflection from './pages/Reflection';
import Wisdom from './pages/Wisdom';
import AIGuide from './pages/AIGuide';
import Settings from './pages/Settings';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize app
    const initApp = async () => {
      try {
        // Perform any initialization tasks
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
        setIsLoading(false);
      } catch (error) {
        console.error('App initialization error:', error);
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading Architect My Life...</h2>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <DatabaseProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/goals/*" element={<Goals />} />
            <Route path="/focus-areas" element={<FocusAreas />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/reflection/*" element={<Reflection />} />
            <Route path="/wisdom" element={<Wisdom />} />
            <Route path="/ai-guide" element={<AIGuide />} />
            <Route path="/settings/*" element={<Settings />} />
          </Routes>
        </Layout>
      </DatabaseProvider>
    </ThemeProvider>
  );
}

export default App;