import React, { useState, useEffect, useCallback } from "react";
import { useDatabase } from "../contexts/UnifiedDatabaseContext";
import { format, parseISO } from "date-fns";
import { Sun, Moon, Plus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

function Reflection() {
  const db = useDatabase();
  const [allReflections, setAllReflections] = useState([]);
  const [selectedReflection, setSelectedReflection] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newMorningNote, setNewMorningNote] = useState("");
  const [newEveningReflection, setNewEveningReflection] = useState("");
  const [todaysMorning, setTodaysMorning] = useState(null);
  const [todaysEvening, setTodaysEvening] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [reflectionType, setReflectionType] = useState("morning");

  // Load reflections for the display dates
  const loadReflections = useCallback(async () => {
    setLoading(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const morningNotes = await db.getAllMorningNotes();
      const eveningNotes = await db.getAllEveningReflections();

      const combinedReflections = [
        ...morningNotes.map(n => ({ ...n, type: 'morning' })),
        ...eveningNotes.map(n => ({ ...n, type: 'evening' }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      setAllReflections(combinedReflections);

      // Load today's existing reflections
      const todayMorning = await db.getMorningNote(today);
      const todayEvening = await db.getEveningReflection(today);
      
      setTodaysMorning(todayMorning);
      setTodaysEvening(todayEvening);
      
      if (todayMorning) {
        setNewMorningNote(todayMorning.intention || "");
      }
      if (todayEvening) {
        setNewEveningReflection(todayEvening.what_went_well || "");
      }

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
    // Auto-detect time of day
    const currentHour = new Date().getHours();
    setReflectionType(currentHour < 17 ? "morning" : "evening");
  }, [loadReflections]);

  const handleAddReflection = () => {
    const currentHour = new Date().getHours();
    const autoType = currentHour < 17 ? "morning" : "evening";
    setReflectionType(autoType);
    setShowAddForm(true);
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

  const handleSaveMorningNote = async () => {
    setSaving(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const morningNote = {
        date: today,
        intention: newMorningNote,
      };

      await db.saveMorningNote(morningNote);
      await loadReflections();
      setShowAddForm(false);
    } catch (error) {
      console.error("Error saving morning note:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEveningReflection = async () => {
    setSaving(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const eveningReflection = {
        date: today,
        what_went_well: newEveningReflection,
      };

      await db.saveEveningReflection(eveningReflection);
      await loadReflections();
      setShowAddForm(false);
    } catch (error) {
      console.error("Error saving evening reflection:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNewReflection = async () => {
    if (reflectionType === "morning") {
      await handleSaveMorningNote();
    } else {
      await handleSaveEveningReflection();
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
            <Button onClick={handleAddReflection} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add {reflectionType === "morning" ? "Morning" : "Evening"} Reflection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Reflection Form */}
      {showAddForm && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              {reflectionType === "morning" ? (
                <Sun className="w-5 h-5 text-orange-500 mr-2" />
              ) : (
                <Moon className="w-5 h-5 text-blue-500 mr-2" />
              )}
              <h3 className="font-semibold">
                {reflectionType === "morning" ? "Morning Reflection" : "Evening Reflection"}
              </h3>
            </div>
            <textarea
              value={reflectionType === "morning" ? newMorningNote : newEveningReflection}
              onChange={(e) => reflectionType === "morning" ? setNewMorningNote(e.target.value) : setNewEveningReflection(e.target.value)}
              placeholder={reflectionType === "morning" ? "What are your intentions for today?" : "What went well today?"}
              className="w-full h-32 resize-none form-input text-sm mb-4"
            />
            <div className="flex gap-2">
              <Button onClick={handleSaveNewReflection} disabled={saving}>
                {saving ? 'Saving...' : `Save ${reflectionType === "morning" ? "Morning Note" : "Evening Reflection"}`}
              </Button>
              <Button variant="secondary" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-3 gap-4">
        {/* Reflections List */}
        <div className="col-span-1 overflow-y-auto">
          <Card>
            <CardContent className="p-2">
              {allReflections.map(reflection => (
                <div
                  key={`${reflection.type}-${reflection.id}`}
                  className={`p-3 cursor-pointer rounded-lg mb-2 ${selectedReflection?.id === reflection.id && selectedReflection?.type === reflection.type ? 'bg-muted' : 'hover:bg-muted/50'}`}
                  onClick={() => setSelectedReflection(reflection)}
                >
                  <p className="font-semibold">{format(new Date(reflection.date), "MMMM d, yyyy")}</p>
                  <p className="text-sm text-muted-foreground flex items-center">
                    {reflection.type === 'morning' ? (
                      <Sun className="w-4 h-4 mr-1 text-orange-500" />
                    ) : (
                      <Moon className="w-4 h-4 mr-1 text-blue-500" />
                    )}
                    {reflection.type === 'morning' ? 'Morning' : 'Evening'}
                  </p>
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
