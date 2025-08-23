import React, { useState, useEffect, useCallback } from "react";
import { useDatabase } from "../contexts/UnifiedDatabaseContext";
import { format, subDays, addDays, isSameDay, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Save, Edit3, Sun, Moon, Calendar, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

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
      <Card className="welcome-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="welcome-title">Daily Reflections 📝</h1>
              <p className="welcome-subtitle">Capture your thoughts and insights</p>
            </div>
            
            {/* Date Navigation */}
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateDate("prev")}
                title="Previous day"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-primary" />
                <div className="text-lg font-semibold text-foreground">
                  {format(currentDate, "MMMM d, yyyy")}
                </div>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateDate("next")}
                title="Next day"
                disabled={isSameDay(currentDate, new Date())}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-md mr-3">
                <Sun className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Morning</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {morningReflections[format(currentDate, "yyyy-MM-dd")] ? '✓' : '−'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-md mr-3">
                <Moon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Evening</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {eveningReflections[format(currentDate, "yyyy-MM-dd")] ? '✓' : '−'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-md mr-3">
                <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Total Days</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {new Set([...Object.keys(morningReflections), ...Object.keys(eveningReflections)]).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-md mr-3">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Current Day</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {format(currentDate, "d")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Selector */}
      <div className="flex space-x-2 w-80">
        <Button
          variant={activeTab === "morning" ? "default" : "outline"}
          onClick={() => setActiveTab("morning")}
          className="flex-1"
        >
          <Sun className="w-4 h-4 mr-2" />
          Morning
        </Button>
        <Button
          variant={activeTab === "evening" ? "default" : "outline"}
          onClick={() => setActiveTab("evening")}
          className="flex-1"
        >
          <Moon className="w-4 h-4 mr-2" />
          Evening
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col space-y-6">
        {/* Previous Days Display */}
        <div className="">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Previous {activeTab === "morning" ? "Morning" : "Evening"} Reflections
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {displayDates.slice(0, -1).map((date) => {
              const dateStr = format(date, "yyyy-MM-dd");
              const reflection = activeTab === "morning" 
                ? morningReflections[dateStr]
                : eveningReflections[dateStr];

              return (
                <Card key={dateStr}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-md font-semibold text-foreground">
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
                        <div className="text-foreground line-clamp-6">
                          {(activeTab === "morning" ? reflection.intention : reflection.what_went_well) || "No reflection recorded"}
                        </div>
                      ) : (
                        <p className="text-muted-foreground italic text-sm">
                          No reflection recorded
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Editor for Today */}
        <div className="flex-1">
          <Card className="h-full">
            <CardContent className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Edit3 className="w-5 h-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Today's {activeTab === "morning" ? "Morning" : "Evening"} Reflection
                  </h3>
                  <span className="text-sm text-muted-foreground">({format(currentDate, "MMMM d, yyyy")})</span>
                </div>
                
                <Button
                  onClick={saveReflection}
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save"}
                </Button>
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
                  className="w-full h-full resize-none form-input font-mono text-sm leading-relaxed"
                  style={{ minHeight: "400px" }}
                />
              </div>
              
              <div className="mt-4 text-sm text-muted-foreground flex justify-between items-center">
                <div>
                  <p>💡 Tip: Use markdown formatting for better organization</p>
                  <p>**Bold**, *italic*, ## Headings, - Lists</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {(activeTab === "morning" ? currentMorningContent : currentEveningContent).length} characters
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Reflection;
