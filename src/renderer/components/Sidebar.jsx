import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Target,
  Focus,
  CheckSquare,
  BookOpen,
  Brain,
  Settings,
  TrendingUp,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Goals",
    href: "/goals",
    icon: Target,
    children: [
      { name: "Annual Goals", href: "/goals/annual" },
      { name: "Monthly Goals", href: "/goals/monthly" },
      { name: "Weekly Goals", href: "/goals/weekly" },
    ],
  },
  {
    name: "Focus Areas",
    href: "/focus-areas",
    icon: Focus,
  },
  {
    name: "Habits",
    href: "/habits",
    icon: CheckSquare,
  },
  {
    name: "Notes",
    href: "/reflection",
    icon: BookOpen,
  },
  {
    name: "Wisdom Library",
    href: "/wisdom",
    icon: Brain,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    children: [
      { name: "AI Settings", href: "/settings" },
    ],
  },
];

function Sidebar() {
  return (
    <div className="sidebar">
      {/* Logo/Brand */}
      <div className="sidebar-header">
        <div className="flex items-center">
          <div
            style={{
              background:
                "linear-gradient(135deg, var(--primary), var(--primary-hover))",
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "12px",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <TrendingUp className="w-6 h-6" style={{ color: "white" }} />
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
                `nav-item ${isActive ? "active" : ""}`
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
                      `nav-subitem ${isActive ? "active" : ""}`
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
