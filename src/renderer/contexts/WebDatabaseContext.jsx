import React, { createContext, useContext, useCallback } from "react";

const DatabaseContext = createContext();

// Helper function to make API calls
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

  const response = await fetch(`/api${endpoint}`, config);

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return await response.json();
};

export function DatabaseProvider({ children }) {
  // Core database operations (simulated for web mode)
  const runQuery = useCallback(async (sql, params = []) => {
    // This is a simplified implementation for web mode
    // In practice, you'd need to map SQL queries to specific API endpoints
    console.warn(
      "Direct SQL queries not supported in web mode. Use specific database methods instead."
    );
    throw new Error("Direct SQL queries not supported in web mode");
  }, []);

  const getRecord = useCallback(async (sql, params = []) => {
    console.warn(
      "Direct SQL queries not supported in web mode. Use specific database methods instead."
    );
    throw new Error("Direct SQL queries not supported in web mode");
  }, []);

  const getAllRecords = useCallback(async (sql, params = []) => {
    console.warn(
      "Direct SQL queries not supported in web mode. Use specific database methods instead."
    );
    throw new Error("Direct SQL queries not supported in web mode");
  }, []);

  // Goals operations
  const createGoal = useCallback(async (goalData) => {
    return await apiCall("/goals", "POST", goalData);
  }, []);

  const updateGoal = useCallback(async (id, updates) => {
    return await apiCall(`/goals/${id}`, "PUT", updates);
  }, []);

  const getGoals = useCallback(async (type = null) => {
    const endpoint = type ? `/goals?type=${type}` : "/goals";
    return await apiCall(endpoint);
  }, []);

  const getGoalById = useCallback(async (id) => {
    const goals = await apiCall(`/goals?id=${id}`);
    return goals.length > 0 ? goals[0] : null;
  }, []);

  const deleteGoal = useCallback(async (id) => {
    return await apiCall(`/goals/${id}`, "DELETE");
  }, []);

  // Goal notes operations (simplified for web mode)
  const addGoalNote = useCallback(async (goal_id, type, content) => {
    console.warn("Goal notes not yet implemented in web mode");
    return {
      success: false,
      message: "Goal notes not yet implemented in web mode",
    };
  }, []);

  const getGoalNotes = useCallback(async (goal_id) => {
    console.warn("Goal notes not yet implemented in web mode");
    return [];
  }, []);

  // Focus areas operations
  const getFocusAreas = useCallback(async () => {
    return await apiCall("/focus-areas");
  }, []);

  const createFocusArea = useCallback(async (name, category, month, theme) => {
    return await apiCall("/focus-areas", "POST", {
      name,
      category,
      month,
      theme,
    });
  }, []);

  const updateFocusArea = useCallback(async (id, updates) => {
    return await apiCall(`/focus-areas/${id}`, "PUT", updates);
  }, []);

  // Habits operations
  const createHabit = useCallback(async (habitData) => {
    return await apiCall("/habits", "POST", habitData);
  }, []);

  const getHabits = useCallback(async () => {
    return await apiCall("/habits");
  }, []);

  const updateHabit = useCallback(async (id, updates) => {
    return await apiCall(`/habits/${id}`, "PUT", updates);
  }, []);

  const logHabit = useCallback(
    async (habit_id, date, completed, notes = "") => {
      return await apiCall("/habit-logs", "POST", {
        habit_id,
        date,
        completed,
        notes,
      });
    },
    []
  );

  const getHabitLogs = useCallback(async (habit_id, startDate, endDate) => {
    const endpoint = `/habit-logs?habit_id=${habit_id}&start_date=${startDate}&end_date=${endDate}`;
    return await apiCall(endpoint);
  }, []);

  // Reflection operations
  const saveMorningNote = useCallback(async (noteData) => {
    return await apiCall("/morning-notes", "POST", noteData);
  }, []);

  const getMorningNote = useCallback(async (date) => {
    return await apiCall(`/morning-notes?date=${date}`);
  }, []);

  const saveEveningReflection = useCallback(async (reflectionData) => {
    return await apiCall("/evening-reflections", "POST", reflectionData);
  }, []);

  const getEveningReflection = useCallback(async (date) => {
    return await apiCall(`/evening-reflections?date=${date}`);
  }, []);

  // Wisdom operations
  const addWisdom = useCallback(async (wisdomData) => {
    return await apiCall("/wisdom", "POST", wisdomData);
  }, []);

  const getWisdom = useCallback(async (category = null, limit = null) => {
    let endpoint = "/wisdom";
    const params = new URLSearchParams();

    if (category) params.append("category", category);
    if (limit) params.append("limit", limit);

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return await apiCall(endpoint);
  }, []);

  const toggleWisdomFavorite = useCallback(async (id, is_favorite) => {
    return await apiCall(`/wisdom/${id}`, "PUT", { is_favorite });
  }, []);

  // Templates operations
  const getTemplates = useCallback(async (type = null) => {
    const endpoint = type ? `/templates?type=${type}` : "/templates";
    return await apiCall(endpoint);
  }, []);

  const createTemplate = useCallback(
    async (name, type, questions, is_default = false) => {
      return await apiCall("/templates", "POST", {
        name,
        type,
        questions,
        is_default,
      });
    },
    []
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

    // Focus Areas
    getFocusAreas,
    createFocusArea,
    updateFocusArea,

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

    // Wisdom
    addWisdom,
    getWisdom,
    toggleWisdomFavorite,

    // Templates
    getTemplates,
    createTemplate,
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
