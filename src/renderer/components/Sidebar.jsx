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
    <div className="sidebar">
      {/* Logo/Brand */}
      <div className="sidebar-header">
        <div className="flex items-center">
          <div className="bg-primary-light rounded-lg" style={{
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px'
          }}>
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary">Architect</h1>
            <p className="text-sm text-text-secondary">My Life</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navigation.map((item) => (
          <div key={item.name}>
            <NavLink
              to={item.href}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <item.icon />
              {item.name}
            </NavLink>
            
            {/* Sub-navigation */}
            {item.children && (
              <div className="space-y-1">
                {item.children.map((child) => (
                  <NavLink
                    key={child.name}
                    to={child.href}
                    className={({ isActive }) =>
                      `nav-subitem ${isActive ? 'active' : ''}`
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
      <div className="sidebar-footer">
        <div className="text-sm text-text-secondary">
          <p className="font-medium mb-1">Version 1.0.0</p>
          <p className="flex items-center text-xs">
            <span>Made with</span>
            <span className="text-red-500 mx-1">♥</span>
            <span>for personal growth</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;