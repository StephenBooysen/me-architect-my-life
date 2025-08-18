import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Bell, Search, Plus } from 'lucide-react';

function Header() {
  const { isDark, toggleTheme } = useTheme();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Date and search */}
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-sm font-medium text-gray-900">Today</h2>
            <p className="text-xs text-gray-500">{currentDate}</p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search goals, habits, notes..."
              className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right side - Actions and theme toggle */}
        <div className="flex items-center space-x-3">
          {/* Quick add button */}
          <button className="btn btn-primary btn-sm">
            <Plus className="w-4 h-4 mr-1" />
            Quick Add
          </button>

          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Profile/Avatar */}
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">SB</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;