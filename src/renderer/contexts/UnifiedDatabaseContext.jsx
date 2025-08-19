import React, { createContext, useContext, useCallback } from "react";

const DatabaseContext = createContext();

// Helper function to make API calls (for web mode)
const apiCall = async (endpoint, method = "GET", data = null) => {
  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  // API calls will be proxied by Vite in development mode
  const response = await fetch(`/api${endpoint}`, config);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `API call failed: ${response.statusText}. Response: ${text}`
    );
  }

  return await response.json();
};

export function DatabaseProvider({ children }) {
  // Detect if we're running in Electron or web mode
  const isElectron = typeof window !== "undefined" && window.electronAPI;

  // Core database operations
  const runQuery = useCallback(
    async (sql, params = []) => {
      try {
        if (isElectron) {
          return await window.electronAPI.database.run(sql, params);
        } else {
          // In web mode, direct SQL queries are not supported
          console.warn(
            "Direct SQL queries not supported in web mode. Use specific database methods instead."
          );
          throw new Error("Direct SQL queries not supported in web mode");
        }
      } catch (error) {
        console.error("Database query error:", error);
        throw error;
      }
    },
    [isElectron]
  );

  const getRecord = useCallback(
    async (sql, params = []) => {
      try {
        if (isElectron) {
          return await window.electronAPI.database.get(sql, params);
        } else {
          console.warn(
            "Direct SQL queries not supported in web mode. Use specific database methods instead."
          );
          throw new Error("Direct SQL queries not supported in web mode");
        }
      } catch (error) {
        console.error("Database get error:", error);
        throw error;
      }
    },
    [isElectron]
  );

  const getAllRecords = useCallback(
    async (sql, params = []) => {
      try {
        if (isElectron) {
          return await window.electronAPI.database.all(sql, params);
        } else {
          console.warn(
            "Direct SQL queries not supported in web mode. Use specific database methods instead."
          );
          throw new Error("Direct SQL queries not supported in web mode");
        }
      } catch (error) {
        console.error("Database all error:", error);
        throw error;
      }
    },
    [isElectron]
  );

  // Goals operations
  const createGoal = useCallback(
    async (goalData) => {
      if (isElectron) {
        const {
          type,
          title,
          description,
          parent_id,
          priority,
          success_criteria,
          target_date,
          focus_area_id,
        } = goalData;
        return await runQuery(
          `INSERT INTO goals (type, title, description, parent_id, priority, success_criteria, target_date, focus_area_id, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [
            type,
            title,
            description,
            parent_id,
            priority,
            success_criteria,
            target_date,
            focus_area_id,
          ]
        );
      } else {
        return await apiCall("/goals", "POST", goalData);
      }
    },
    [isElectron, runQuery]
  );

  const updateGoal = useCallback(
    async (id, updates) => {
      if (isElectron) {
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map((field) => `${field} = ?`).join(", ");

        return await runQuery(
          `UPDATE goals SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [...values, id]
        );
      } else {
        return await apiCall(`/goals/${id}`, "PUT", updates);
      }
    },
    [isElectron, runQuery]
  );

  const getGoals = useCallback(
    async (type = null, parentId = null) => {
      if (isElectron) {
        let sql = "SELECT * FROM goals";
        let params = [];
        let conditions = [];

        if (type) {
          conditions.push("type = ?");
          params.push(type);
        }

        if (parentId !== null) {
          if (parentId === "null" || parentId === "") {
            conditions.push("parent_id IS NULL");
          } else {
            conditions.push("parent_id = ?");
            params.push(parentId);
          }
        }

        if (conditions.length > 0) {
          sql += " WHERE " + conditions.join(" AND ");
        }

        sql += " ORDER BY created_at DESC";

        return await getAllRecords(sql, params);
      } else {
        let endpoint = "/goals";
        const params = new URLSearchParams();

        if (type) params.append("type", type);
        if (parentId !== null) params.append("parent_id", parentId || "");

        if (params.toString()) {
          endpoint += `?${params.toString()}`;
        }

        return await apiCall(endpoint);
      }
    },
    [isElectron, getAllRecords]
  );

  const getGoalById = useCallback(
    async (id) => {
      if (isElectron) {
        return await getRecord("SELECT * FROM goals WHERE id = ?", [id]);
      } else {
        const goals = await apiCall(`/goals?id=${id}`);
        return goals.length > 0 ? goals[0] : null;
      }
    },
    [isElectron, getRecord]
  );

  const deleteGoal = useCallback(
    async (id) => {
      if (isElectron) {
        return await runQuery("DELETE FROM goals WHERE id = ?", [id]);
      } else {
        return await apiCall(`/goals/${id}`, "DELETE");
      }
    },
    [isElectron, runQuery]
  );

  const getGoalWithChildren = useCallback(
    async (id) => {
      if (isElectron) {
        const goal = await getRecord("SELECT * FROM goals WHERE id = ?", [id]);
        if (!goal) return null;

        const children = await getAllRecords(
          "SELECT * FROM goals WHERE parent_id = ? ORDER BY created_at DESC",
          [id]
        );
        return { ...goal, children };
      } else {
        return await apiCall(`/goals/${id}/with-children`);
      }
    },
    [isElectron, getRecord, getAllRecords]
  );

  const getGoalHierarchy = useCallback(
    async (id) => {
      if (isElectron) {
        const hierarchy = [];
        let currentId = id;

        while (currentId) {
          const goal = await getRecord("SELECT * FROM goals WHERE id = ?", [
            currentId,
          ]);
          if (!goal) break;

          hierarchy.unshift(goal);
          currentId = goal.parent_id;
        }

        return hierarchy;
      } else {
        return await apiCall(`/goals/${id}/hierarchy`);
      }
    },
    [isElectron, getRecord]
  );

  const updateGoalProgress = useCallback(
    async (id, progress) => {
      if (isElectron) {
        // Update the goal's progress
        await runQuery(
          "UPDATE goals SET progress = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          [progress, id]
        );

        // Get the updated goal
        const goal = await getRecord("SELECT * FROM goals WHERE id = ?", [id]);

        // If this goal has a parent, update parent's progress based on children
        if (goal && goal.parent_id) {
          const siblings = await getAllRecords(
            "SELECT progress FROM goals WHERE parent_id = ?",
            [goal.parent_id]
          );
          const avgProgress =
            siblings.reduce(
              (sum, sibling) => sum + (sibling.progress || 0),
              0
            ) / siblings.length;

          await runQuery(
            "UPDATE goals SET progress = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [Math.round(avgProgress), goal.parent_id]
          );

          // Continue up the chain
          const parent = await getRecord("SELECT * FROM goals WHERE id = ?", [
            goal.parent_id,
          ]);
          if (parent && parent.parent_id) {
            const parentSiblings = await getAllRecords(
              "SELECT progress FROM goals WHERE parent_id = ?",
              [parent.parent_id]
            );
            const parentAvgProgress =
              parentSiblings.reduce(
                (sum, sibling) => sum + (sibling.progress || 0),
                0
              ) / parentSiblings.length;

            await runQuery(
              "UPDATE goals SET progress = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
              [Math.round(parentAvgProgress), parent.parent_id]
            );
          }
        }

        return { success: true, progress };
      } else {
        return await apiCall(`/goals/${id}/progress`, "PUT", { progress });
      }
    },
    [isElectron, runQuery, getRecord, getAllRecords]
  );

  // Goal notes operations
  const addGoalNote = useCallback(
    async (goal_id, type, content) => {
      if (isElectron) {
        return await runQuery(
          "INSERT INTO goal_notes (goal_id, type, content) VALUES (?, ?, ?)",
          [goal_id, type, content]
        );
      } else {
        console.warn("Goal notes not yet implemented in web mode");
        return {
          success: false,
          message: "Goal notes not yet implemented in web mode",
        };
      }
    },
    [isElectron, runQuery]
  );

  const getGoalNotes = useCallback(
    async (goal_id) => {
      if (isElectron) {
        return await getAllRecords(
          "SELECT * FROM goal_notes WHERE goal_id = ? ORDER BY created_at DESC",
          [goal_id]
        );
      } else {
        console.warn("Goal notes not yet implemented in web mode");
        return [];
      }
    },
    [isElectron, getAllRecords]
  );

  // Focus areas operations
  const getFocusAreas = useCallback(async () => {
    if (isElectron) {
      return await getAllRecords("SELECT * FROM focus_areas ORDER BY name");
    } else {
      return await apiCall("/focus-areas");
    }
  }, [isElectron, getAllRecords]);

  // Monthly focus assignments
  const setMonthlyFocusArea = useCallback(
    async (year, month, focusAreaId) => {
      if (isElectron) {
        if (focusAreaId) {
          return await runQuery(
            "INSERT OR REPLACE INTO monthly_focus_assignments (year, month, focus_area_id) VALUES (?, ?, ?)",
            [year, month, focusAreaId]
          );
        } else {
          return await runQuery(
            "DELETE FROM monthly_focus_assignments WHERE year = ? AND month = ?",
            [year, month]
          );
        }
      } else {
        return await apiCall("/monthly-focus", "POST", {
          year,
          month,
          focus_area_id: focusAreaId
        });
      }
    },
    [isElectron, runQuery]
  );

  const getMonthlyFocusAreas = useCallback(
    async (year) => {
      if (isElectron) {
        return await getAllRecords(
          `SELECT mfa.year, mfa.month, mfa.focus_area_id, fa.name as focus_area_name
           FROM monthly_focus_assignments mfa
           JOIN focus_areas fa ON mfa.focus_area_id = fa.id
           WHERE mfa.year = ?
           ORDER BY mfa.month`,
          [year]
        );
      } else {
        return await apiCall(`/monthly-focus?year=${year}`);
      }
    },
    [isElectron, getAllRecords]
  );

  const getMonthlyGoals = useCallback(
    async (year, month) => {
      if (isElectron) {
        return await getAllRecords(
          "SELECT * FROM goals WHERE target_year = ? AND target_month = ? ORDER BY created_at DESC",
          [year, month]
        );
      } else {
        return await apiCall(`/goals?target_year=${year}&target_month=${month}`);
      }
    },
    [isElectron, getAllRecords]
  );

  const createFocusArea = useCallback(
    async (name, category, month, theme) => {
      if (isElectron) {
        return await runQuery(
          "INSERT INTO focus_areas (name, category, month, theme) VALUES (?, ?, ?, ?)",
          [name, category, month, theme]
        );
      } else {
        return await apiCall("/focus-areas", "POST", {
          name,
          category,
          month,
          theme,
        });
      }
    },
    [isElectron, runQuery]
  );

  const updateFocusArea = useCallback(
    async (id, updates) => {
      if (isElectron) {
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map((field) => `${field} = ?`).join(", ");

        return await runQuery(
          `UPDATE focus_areas SET ${setClause} WHERE id = ?`,
          [...values, id]
        );
      } else {
        return await apiCall(`/focus-areas/${id}`, "PUT", updates);
      }
    },
    [isElectron, runQuery]
  );

  // Habits operations
  const createHabit = useCallback(
    async (habitData) => {
      if (isElectron) {
        const {
          name,
          description,
          category,
          frequency,
          custom_days,
          target_streak,
        } = habitData;
        return await runQuery(
          "INSERT INTO habits (name, description, category, frequency, custom_days, target_streak) VALUES (?, ?, ?, ?, ?, ?)",
          [name, description, category, frequency, custom_days, target_streak]
        );
      } else {
        return await apiCall("/habits", "POST", habitData);
      }
    },
    [isElectron, runQuery]
  );

  const getHabits = useCallback(async () => {
    if (isElectron) {
      return await getAllRecords(
        "SELECT * FROM habits WHERE is_active = 1 ORDER BY name"
      );
    } else {
      return await apiCall("/habits");
    }
  }, [isElectron, getAllRecords]);

  const updateHabit = useCallback(
    async (id, updates) => {
      if (isElectron) {
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map((field) => `${field} = ?`).join(", ");

        return await runQuery(`UPDATE habits SET ${setClause} WHERE id = ?`, [
          ...values,
          id,
        ]);
      } else {
        return await apiCall(`/habits/${id}`, "PUT", updates);
      }
    },
    [isElectron, runQuery]
  );

  const logHabit = useCallback(
    async (habit_id, date, completed, notes = "") => {
      if (isElectron) {
        return await runQuery(
          "INSERT OR REPLACE INTO habit_logs (habit_id, date, completed, notes) VALUES (?, ?, ?, ?)",
          [habit_id, date, completed ? 1 : 0, notes]
        );
      } else {
        return await apiCall("/habit-logs", "POST", {
          habit_id,
          date,
          completed,
          notes,
        });
      }
    },
    [isElectron, runQuery]
  );

  const getHabitLogs = useCallback(
    async (habit_id, startDate, endDate) => {
      if (isElectron) {
        return await getAllRecords(
          "SELECT * FROM habit_logs WHERE habit_id = ? AND date BETWEEN ? AND ? ORDER BY date DESC",
          [habit_id, startDate, endDate]
        );
      } else {
        const endpoint = `/habit-logs?habit_id=${habit_id}&start_date=${startDate}&end_date=${endDate}`;
        return await apiCall(endpoint);
      }
    },
    [isElectron, getAllRecords]
  );

  // Reflection operations
  const saveMorningNote = useCallback(
    async (noteData) => {
      if (isElectron) {
        const {
          date,
          priorities,
          mood,
          energy,
          gratitude,
          challenges,
          intention,
          template_id,
        } = noteData;
        return await runQuery(
          "INSERT OR REPLACE INTO morning_notes (date, priorities, mood, energy, gratitude, challenges, intention, template_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [
            date,
            priorities,
            mood,
            energy,
            gratitude,
            challenges,
            intention,
            template_id,
          ]
        );
      } else {
        return await apiCall("/morning-notes", "POST", noteData);
      }
    },
    [isElectron, runQuery]
  );

  const getMorningNote = useCallback(
    async (date) => {
      if (isElectron) {
        return await getRecord("SELECT * FROM morning_notes WHERE date = ?", [
          date,
        ]);
      } else {
        return await apiCall(`/morning-notes?date=${date}`);
      }
    },
    [isElectron, getRecord]
  );

  const saveEveningReflection = useCallback(
    async (reflectionData) => {
      if (isElectron) {
        const {
          date,
          what_went_well,
          what_could_improve,
          lessons_learned,
          tomorrow_priority,
          gratitude,
          day_rating,
          accomplishments,
          template_id,
        } = reflectionData;
        return await runQuery(
          "INSERT OR REPLACE INTO evening_reflections (date, what_went_well, what_could_improve, lessons_learned, tomorrow_priority, gratitude, day_rating, accomplishments, template_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            date,
            what_went_well,
            what_could_improve,
            lessons_learned,
            tomorrow_priority,
            gratitude,
            day_rating,
            accomplishments,
            template_id,
          ]
        );
      } else {
        return await apiCall("/evening-reflections", "POST", reflectionData);
      }
    },
    [isElectron, runQuery]
  );

  const getEveningReflection = useCallback(
    async (date) => {
      if (isElectron) {
        return await getRecord(
          "SELECT * FROM evening_reflections WHERE date = ?",
          [date]
        );
      } else {
        return await apiCall(`/evening-reflections?date=${date}`);
      }
    },
    [isElectron, getRecord]
  );

  const getAllMorningNotes = useCallback(
    async () => {
      if (isElectron) {
        return await getAllRecords("SELECT * FROM morning_notes ORDER BY date DESC");
      } else {
        return await apiCall("/morning-notes");
      }
    },
    [isElectron, getAllRecords]
  );

  const getAllEveningReflections = useCallback(
    async () => {
      if (isElectron) {
        return await getAllRecords("SELECT * FROM evening_reflections ORDER BY date DESC");
      } else {
        return await apiCall("/evening-reflections");
      }
    },
    [isElectron, getAllRecords]
  );

  // Wisdom operations
  const addWisdom = useCallback(
    async (wisdomData) => {
      if (isElectron) {
        const { content, author, source, tags, category, personal_notes } =
          wisdomData;
        return await runQuery(
          "INSERT INTO wisdom (content, author, source, tags, category, personal_notes) VALUES (?, ?, ?, ?, ?, ?)",
          [content, author, source, tags, category, personal_notes]
        );
      } else {
        return await apiCall("/wisdom", "POST", wisdomData);
      }
    },
    [isElectron, runQuery]
  );

  const getWisdom = useCallback(
    async (category = null, limit = null) => {
      if (isElectron) {
        let sql = "SELECT * FROM wisdom ORDER BY created_at DESC";
        let params = [];

        if (category) {
          sql =
            "SELECT * FROM wisdom WHERE category = ? ORDER BY created_at DESC";
          params = [category];
        }

        if (limit) {
          sql += " LIMIT ?";
          params.push(limit);
        }

        return await getAllRecords(sql, params);
      } else {
        let endpoint = "/wisdom";
        const params = new URLSearchParams();

        if (category) params.append("category", category);
        if (limit) params.append("limit", limit);

        if (params.toString()) {
          endpoint += `?${params.toString()}`;
        }

        return await apiCall(endpoint);
      }
    },
    [isElectron, getAllRecords]
  );

  const toggleWisdomFavorite = useCallback(
    async (id, is_favorite) => {
      if (isElectron) {
        return await runQuery(
          "UPDATE wisdom SET is_favorite = ? WHERE id = ?",
          [is_favorite ? 1 : 0, id]
        );
      } else {
        return await apiCall(`/wisdom/${id}`, "PUT", { is_favorite });
      }
    },
    [isElectron, runQuery]
  );

  // Templates operations
  const getTemplates = useCallback(
    async (type = null) => {
      if (isElectron) {
        if (type) {
          return await getAllRecords(
            "SELECT * FROM templates WHERE type = ? ORDER BY name",
            [type]
          );
        }
        return await getAllRecords(
          "SELECT * FROM templates ORDER BY type, name"
        );
      } else {
        const endpoint = type ? `/templates?type=${type}` : "/templates";
        return await apiCall(endpoint);
      }
    },
    [isElectron, getAllRecords]
  );

  const createTemplate = useCallback(
    async (name, type, questions, is_default = false) => {
      if (isElectron) {
        return await runQuery(
          "INSERT INTO templates (name, type, questions, is_default) VALUES (?, ?, ?, ?)",
          [name, type, JSON.stringify(questions), is_default ? 1 : 0]
        );
      } else {
        return await apiCall("/templates", "POST", {
          name,
          type,
          questions,
          is_default,
        });
      }
    },
    [isElectron, runQuery]
  );

  // AI Chat operations
  const saveAIChat = useCallback(
    async (session_id, role, message, context = null) => {
      if (isElectron) {
        return await runQuery(
          "INSERT INTO ai_chats (session_id, role, message, context) VALUES (?, ?, ?, ?)",
          [session_id, role, message, context]
        );
      } else {
        return await apiCall("/ai-chats", "POST", {
          session_id,
          role,
          message,
          context,
        });
      }
    },
    [isElectron, runQuery]
  );

  const getAIChats = useCallback(
    async (session_id = null, limit = 50) => {
      if (isElectron) {
        let sql = "SELECT * FROM ai_chats";
        let params = [];
        
        if (session_id) {
          sql += " WHERE session_id = ?";
          params.push(session_id);
        }
        
        sql += " ORDER BY created_at ASC LIMIT ?";
        params.push(limit);
        
        return await getAllRecords(sql, params);
      } else {
        let endpoint = "/ai-chats";
        const params = new URLSearchParams();
        
        if (session_id) params.append("session_id", session_id);
        if (limit) params.append("limit", limit);
        
        if (params.toString()) {
          endpoint += `?${params.toString()}`;
        }
        
        return await apiCall(endpoint);
      }
    },
    [isElectron, getAllRecords]
  );

  const clearAIChats = useCallback(
    async (session_id = null) => {
      if (isElectron) {
        if (session_id) {
          return await runQuery("DELETE FROM ai_chats WHERE session_id = ?", [session_id]);
        } else {
          return await runQuery("DELETE FROM ai_chats");
        }
      } else {
        let endpoint = "/ai-chats";
        if (session_id) {
          endpoint += `?session_id=${session_id}`;
        }
        return await apiCall(endpoint, "DELETE");
      }
    },
    [isElectron, runQuery]
  );

  const value = {
    // Core database operations
    runQuery,
    getRecord,
    getAllRecords,

    // Goals
    createGoal,
    updateGoal,
    getGoals,
    getGoalById,
    deleteGoal,
    addGoalNote,
    getGoalNotes,
    getGoalWithChildren,
    getGoalHierarchy,
    updateGoalProgress,
    getMonthlyGoals,

    // Focus Areas
    getFocusAreas,
    createFocusArea,
    updateFocusArea,
    setMonthlyFocusArea,
    getMonthlyFocusAreas,

    // Habits
    createHabit,
    getHabits,
    updateHabit,
    logHabit,
    getHabitLogs,

    // Reflection
    saveMorningNote,
    getMorningNote,
    saveEveningReflection,
    getEveningReflection,
    getAllMorningNotes,
    getAllEveningReflections,

    // Wisdom
    addWisdom,
    getWisdom,
    toggleWisdomFavorite,

    // Templates
    getTemplates,
    createTemplate,

    // AI Chat
    saveAIChat,
    getAIChats,
    clearAIChats,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
}
