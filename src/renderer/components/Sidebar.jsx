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
import { cn } from "../lib/utils";

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
      <div className="flex flex-col space-y-1.5 p-6">
        <div className="flex items-center">
          <div className="bg-gradient-to-br from-primary to-primary/80 w-12 h-12 flex items-center justify-center mr-3 rounded-lg shadow-md">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Architect</h1>
            <p className="text-sm text-muted-foreground">My Life</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3">
        {navigation.map((item) => (
          <div key={item.name}>
            <NavLink
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "nav-item",
                  isActive && "active"
                )
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>

            {/* Sub-navigation */}
            {item.children && (
              <div className="space-y-1 ml-8">
                {item.children.map((child) => (
                  <NavLink
                    key={child.name}
                    to={child.href}
                    className={({ isActive }) =>
                      cn(
                        "nav-subitem",
                        isActive && "active"
                      )
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
      <div className="p-4 border-t">
        <div className="text-sm text-muted-foreground">
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
