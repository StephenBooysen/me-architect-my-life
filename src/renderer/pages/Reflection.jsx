import React, { useState, useEffect, useCallback } from "react";
import { useDatabase } from "../contexts/UnifiedDatabaseContext";
import { format, subDays, addDays, isSameDay, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Save, Edit3, Sun, Moon } from "lucide-react";
import ReactMarkdown from "react-markdown";

function Reflection() {
  const db = useDatabase();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("morning"); // "morning" or "evening"
  const [morningReflections, setMorningReflections] = useState({});
  const [eveningReflections, setEveningReflections] = useState({});
  const [currentMorningContent, setCurrentMorningContent] = useState("");
  const [currentEveningContent, setCurrentEveningContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Generate dates for display (previous 2 days + today)
  const displayDates = [
    subDays(currentDate, 2),
    subDays(currentDate, 1),
    currentDate,
  ];

  // Load reflections for the display dates
  const loadReflections = useCallback(async (shouldUpdateCurrentContent = true) => {
    setLoading(true);
    try {
      const morningData = {};
      const eveningData = {};

      for (const date of displayDates) {
        const dateStr = format(date, "yyyy-MM-dd");
        
        // Load morning reflection
        const morningNote = await db.getMorningNote(dateStr);
        if (morningNote) {
          morningData[dateStr] = morningNote;
        }

        // Load evening reflection
        const eveningReflection = await db.getEveningReflection(dateStr);
        if (eveningReflection) {
          eveningData[dateStr] = eveningReflection;
        }
      }

      setMorningReflections(morningData);
      setEveningReflections(eveningData);

      // Only set current content when initially loading or when date changes
      if (shouldUpdateCurrentContent) {
        const todayStr = format(currentDate, "yyyy-MM-dd");
        setCurrentMorningContent(morningData[todayStr]?.intention || "");
        setCurrentEveningContent(eveningData[todayStr]?.what_went_well || "");
      }
    } catch (error) {
      console.error("Error loading reflections:", error);
    } finally {
      setLoading(false);
    }
  }, [currentDate, db]);

  useEffect(() => {
    loadReflections(true);
  }, [currentDate, db]);

  const navigateDate = (direction) => {
    if (direction === "prev") {
      setCurrentDate(subDays(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const saveReflection = async () => {
    setSaving(true);
    try {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      
      if (activeTab === "morning") {
        await db.saveMorningNote({
          date: dateStr,
          intention: currentMorningContent,
          priorities: "",
          mood: 5,
          energy: 5,
          gratitude: "",
          challenges: "",
        });
      } else {
        await db.saveEveningReflection({
          date: dateStr,
          what_went_well: currentEveningContent,
          what_could_improve: "",
          lessons_learned: "",
          tomorrow_priority: "",
          gratitude: "",
          day_rating: 5,
          accomplishments: "",
        });
      }

      // Reload reflections to update the display (without overwriting current content)
      await loadReflections(false);
    } catch (error) {
      console.error("Error saving reflection:", error);
    } finally {
      setSaving(false);
    }
  };

  const formatReflectionContent = (reflection, type) => {
    if (type === "morning") {
      return `# Morning Reflection - ${format(parseISO(reflection.date), "MMMM d, yyyy")}

${reflection.intention || "No reflection yet..."}`;
    } else {
      return `# Evening Reflection - ${format(parseISO(reflection.date), "MMMM d, yyyy")}

${reflection.what_went_well || "No reflection yet..."}`;
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Reflections</h1>
          <p className="text-gray-600">Capture your thoughts and insights</p>
        </div>
        
        {/* Date Navigation */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateDate("prev")}
            className="btn"
            title="Previous day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="text-lg font-semibold text-gray-900">
            {format(currentDate, "MMMM d, yyyy")}
          </div>
          
          <button
            onClick={() => navigateDate("next")}
            className="btn"
            title="Next day"
            disabled={isSameDay(currentDate, new Date())}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex space-x-2 w-64">
        <button
          onClick={() => setActiveTab("morning")}
          className={`flex-1 flex items-center justify-center ${
            activeTab === "morning"
              ? "btn btn-primary"
              : "btn"
          }`}
        >
          <Sun className="w-4 h-4 mr-2" />
          Morning
        </button>
        <button
          onClick={() => setActiveTab("evening")}
          className={`flex-1 flex items-center justify-center ${
            activeTab === "evening"
              ? "btn btn-primary"
              : "btn"
          }`}
        >
          <Moon className="w-4 h-4 mr-2" />
          Evening
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col space-y-6">
        {/* Previous Days Display */}
        <div className="">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Previous {activeTab === "morning" ? "Morning" : "Evening"} Reflections
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {displayDates.slice(0, -1).map((date) => {
              const dateStr = format(date, "yyyy-MM-dd");
              const reflection = activeTab === "morning" 
                ? morningReflections[dateStr]
                : eveningReflections[dateStr];

              return (
                <div key={dateStr} className="card">
                  <div className="card-body">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-md font-semibold text-gray-900">
                        {format(date, "EEEE, MMM d")}
                      </h3>
                      {activeTab === "morning" ? (
                        <Sun className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <Moon className="w-4 h-4 text-purple-500" />
                      )}
                    </div>
                    
                    <div className="prose prose-sm max-w-none text-sm">
                      {reflection ? (
                        <div className="text-gray-700 line-clamp-6">
                          {(activeTab === "morning" ? reflection.intention : reflection.what_went_well) || "No reflection recorded"}
                        </div>
                      ) : (
                        <p className="text-gray-400 italic text-sm">
                          No reflection recorded
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Editor for Today */}
        <div className="flex-1">
          <div className="card h-full">
            <div className="card-body h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Edit3 className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Today's {activeTab === "morning" ? "Morning" : "Evening"} Reflection
                  </h3>
                  <span className="text-sm text-gray-500">({format(currentDate, "MMMM d, yyyy")})</span>
                </div>
                
                <button
                  onClick={saveReflection}
                  disabled={saving}
                  className="green-button flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
              
              <div className="flex-1">
                <textarea
                  value={activeTab === "morning" ? currentMorningContent : currentEveningContent}
                  onChange={(e) => {
                    if (activeTab === "morning") {
                      setCurrentMorningContent(e.target.value);
                    } else {
                      setCurrentEveningContent(e.target.value);
                    }
                  }}
                  placeholder={`Write your ${activeTab} reflection here...\n\nYou can use markdown formatting:\n**Bold text**\n*Italic text*\n## Headings\n- Lists\n\nTell me about your thoughts, feelings, insights, and experiences from today.`}
                  className="w-full h-full resize-none p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm leading-relaxed"
                  style={{ minHeight: "400px" }}
                />
              </div>
              
              <div className="mt-4 text-sm text-gray-500 flex justify-between items-center">
                <div>
                  <p>💡 Tip: Use markdown formatting for better organization</p>
                  <p>**Bold**, *italic*, ## Headings, - Lists</p>
                </div>
                <div className="text-xs text-gray-400">
                  {(activeTab === "morning" ? currentMorningContent : currentEveningContent).length} characters
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reflection;
