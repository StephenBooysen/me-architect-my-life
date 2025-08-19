import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, Bell, User } from "lucide-react";
import { useSearch } from "../hooks/useSearch";
import SearchDropdown from "./SearchDropdown";

function Header() {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, searchResults, isSearching } = useSearch();
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="main-header">
      <div className="flex items-center justify-between w-full">
        {/* Left side - Date and search */}
        <div className="flex items-center space-x-6 flex-1" style={{ marginRight: "10px" }}>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Today</h2>
            <p className="text-sm text-text-secondary">{currentDate}</p>
          </div>

          <div className="relative flex-1" ref={searchRef}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  navigate('/search', { state: { query: searchQuery, results: searchResults } });
                  setShowDropdown(false);
                  searchRef.current?.blur();
                }
                if (e.key === 'Escape') {
                  setShowDropdown(false);
                  searchRef.current?.blur();
                }
              }}
              placeholder="Search anything..."
              className="input"
              style={{ width: "100%", height: "40px" }}
            />
            {showDropdown && (searchQuery.length >= 2 || isSearching) && (
              <div ref={dropdownRef}>
                <SearchDropdown
                  results={searchResults}
                  isSearching={isSearching}
                  searchQuery={searchQuery}
                  onSelect={() => {
                    setShowDropdown(false);
                    searchRef.current?.blur();
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right side - Actions and theme toggle */}
        <div className="flex items-center space-x-3">
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
      </div>
    </header>
  );
}

export default Header;