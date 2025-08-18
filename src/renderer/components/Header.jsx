import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import { Sun, Moon, Bell, Search, Plus, User } from "lucide-react";

function Header() {
  const { isDark, toggleTheme } = useTheme();
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="main-header">
      {/* Left side - Date and search */}
      <div className="flex items-center space-x-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Today</h2>
          <p className="text-sm text-text-secondary">{currentDate}</p>
        </div>

        <div className="relative" style={{ width: "320px" }}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search anything..."
            className="input pl-10"
            style={{ width: "100%" }}
          />
        </div>
      </div>

      {/* Right side - Actions and theme toggle */}
      <div className="flex items-center space-x-3">
        {/* Quick add button */}
        <button className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Quick Add
        </button>

        {/* Notifications */}
        <button className="btn" style={{ padding: "10px" }}>
          <Bell className="w-5 h-5" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="btn"
          style={{ padding: "10px" }}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Profile/Avatar */}
        <div
          className="bg-primary-light rounded-full"
          style={{
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <User className="w-5 h-5 text-primary" />
        </div>
      </div>
    </header>
  );
}

export default Header;
