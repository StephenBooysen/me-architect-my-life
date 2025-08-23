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
  const [allReflections, setAllReflections] = useState([]);
  const [selectedReflection, setSelectedReflection] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Generate dates for display (previous 2 days + today)
  const displayDates = [
    subDays(currentDate, 2),
    subDays(currentDate, 1),
    currentDate,
  ];

  // Load reflections for the display dates
  const loadReflections = useCallback(async () => {
    setLoading(true);
    try {
      const morningNotes = await db.getAllMorningNotes();
      const eveningNotes = await db.getAllEveningReflections();

      const combinedReflections = [
        ...morningNotes.map(n => ({ ...n, type: 'morning' })),
        ...eveningNotes.map(n => ({ ...n, type: 'evening' }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      setAllReflections(combinedReflections);

      if (combinedReflections.length > 0) {
        setSelectedReflection(combinedReflections[0]);
      }

    } catch (error) {
      console.error("Error loading reflections:", error);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    loadReflections();
  }, [loadReflections]);

  const navigateDate = (direction) => {
    if (direction === "prev") {
      setCurrentDate(subDays(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const handleStartEditing = () => {
    if (!selectedReflection) return;
    setEditedContent(selectedReflection.type === 'morning' ? selectedReflection.intention : selectedReflection.what_went_well);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setEditedContent("");
  };

  const handleSaveReflection = async () => {
    if (!selectedReflection) return;

    setSaving(true);
    try {
      const updatedReflection = {
        ...selectedReflection,
        intention: selectedReflection.type === 'morning' ? editedContent : selectedReflection.intention,
        what_went_well: selectedReflection.type === 'evening' ? editedContent : selectedReflection.what_went_well,
      };

      if (selectedReflection.type === 'morning') {
        await db.saveMorningNote(updatedReflection);
      } else {
        await db.saveEveningReflection(updatedReflection);
      }

      await loadReflections();
      setIsEditing(false);
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
          </div>
        </CardContent>
      </Card>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-3 gap-4">
        {/* Reflections List */}
        <div className="col-span-1 overflow-y-auto">
          <Card>
            <CardContent className="p-2">
              {allReflections.map(reflection => (
                <div
                  key={`${reflection.type}-${reflection.id}`}
                  className={`p-2 cursor-pointer rounded-lg ${selectedReflection?.id === reflection.id && selectedReflection?.type === reflection.type ? 'bg-muted' : 'hover:bg-muted/50'}`}
                  onClick={() => setSelectedReflection(reflection)}
                >
                  <p className="font-semibold">{format(new Date(reflection.date), "MMMM d, yyyy")}</p>
                  <p className="text-sm text-muted-foreground">{reflection.type === 'morning' ? 'Morning' : 'Evening'}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Viewer/Editor */}
        <div className="col-span-2">
          <Card className="h-full">
            <CardContent className="p-6 h-full flex flex-col">
              {selectedReflection && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold">{format(new Date(selectedReflection.date), "MMMM d, yyyy")} - {selectedReflection.type === 'morning' ? 'Morning' : 'Evening'}</h2>
                    </div>
                    <div>
                      {isEditing ? (
                        <div className="flex space-x-2">
                          <Button onClick={handleSaveReflection} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
                          <Button variant="ghost" onClick={handleCancelEditing}>Cancel</Button>
                        </div>
                      ) : (
                        <Button onClick={handleStartEditing}>Edit</Button>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 prose max-w-none">
                    {isEditing ? (
                      <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full h-full resize-none form-input font-mono text-sm leading-relaxed"
                        style={{ minHeight: "400px" }}
                      />
                    ) : (
                      <ReactMarkdown>{selectedReflection.type === 'morning' ? selectedReflection.intention : selectedReflection.what_went_well}</ReactMarkdown>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Reflection;
