import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Target, 
  Focus, 
  CheckSquare, 
  BookOpen, 
  Brain, 
  MessageCircle,
  Settings,
  Calendar,
  TrendingUp
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Goals',
    href: '/goals',
    icon: Target,
    children: [
      { name: 'Annual Goals', href: '/goals/annual' },
      { name: 'Monthly Goals', href: '/goals/monthly' },
      { name: 'Weekly Goals', href: '/goals/weekly' },
    ]
  },
  {
    name: 'Focus Areas',
    href: '/focus-areas',
    icon: Focus,
  },
  {
    name: 'Habits',
    href: '/habits',
    icon: CheckSquare,
  },
  {
    name: 'Reflection',
    href: '/reflection',
    icon: BookOpen,
    children: [
      { name: 'Morning Notes', href: '/reflection/morning' },
      { name: 'Evening Reflection', href: '/reflection/evening' },
    ]
  },
  {
    name: 'Wisdom Library',
    href: '/wisdom',
    icon: Brain,
  },
  {
    name: 'AI Guide',
    href: '/ai-guide',
    icon: MessageCircle,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    children: [
      { name: 'Templates', href: '/settings/templates' },
      { name: 'Preferences', href: '/settings/preferences' },
      { name: 'Data Management', href: '/settings/data' },
      { name: 'AI Settings', href: '/settings/ai' },
    ]
  }
];

function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <TrendingUp className="w-8 h-8 text-blue-600" />
          <div className="ml-3">
            <h1 className="text-lg font-bold text-gray-900">Architect My Life</h1>
            <p className="text-xs text-gray-500">Goal & Habit Tracker</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => (
          <div key={item.name}>
            <NavLink
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </NavLink>
            
            {/* Sub-navigation */}
            {item.children && (
              <div className="ml-8 mt-1 space-y-1">
                {item.children.map((child) => (
                  <NavLink
                    key={child.name}
                    to={child.href}
                    className={({ isActive }) =>
                      `block px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200 ${
                        isActive
                          ? 'text-blue-700 bg-blue-50'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`
                    }
                  >
                    {child.name}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <p>Version 1.0.0</p>
          <p>Made with ❤️ for personal growth</p>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;