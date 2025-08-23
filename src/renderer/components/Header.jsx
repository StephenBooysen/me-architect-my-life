import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, Bell, User, PanelLeftOpen, PanelLeftClose, PanelRightOpen, PanelRightClose } from "lucide-react";
import { useSearch } from "../hooks/useSearch";
import SearchDropdown from "./SearchDropdown";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "../lib/utils";

function Header({ sidebarVisible, onToggleSidebar, aiChatVisible, onToggleAiChat }) {
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
        {/* Left side - Sidebar toggle, Date and search */}
        <div className="flex items-center space-x-6 flex-1 mr-4">
          {/* Sidebar Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            title={sidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
          >
            {sidebarVisible ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </Button>

          <div>
            <h2 className="text-lg font-semibold text-foreground">Today</h2>
            <p className="text-sm text-muted-foreground">{currentDate}</p>
          </div>

          <div className="relative flex-1 max-w-md" ref={searchRef}>
            <Input
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
              className="h-10"
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
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>

          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {/* Profile/Avatar */}
          <div className="bg-primary/20 rounded-full w-10 h-10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>

          {/* AI Chat Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleAiChat}
            title={aiChatVisible ? 'Hide AI chat' : 'Show AI chat'}
          >
            {aiChatVisible ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Header;