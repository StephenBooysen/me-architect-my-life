import React, { createContext, useContext, useCallback } from 'react';

const DatabaseContext = createContext();

export function DatabaseProvider({ children }) {
  // Database operations
  const runQuery = useCallback(async (sql, params = []) => {
    try {
      return await window.electronAPI.database.run(sql, params);
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }, []);

  const getRecord = useCallback(async (sql, params = []) => {
    try {
      return await window.electronAPI.database.get(sql, params);
    } catch (error) {
      console.error('Database get error:', error);
      throw error;
    }
  }, []);

  const getAllRecords = useCallback(async (sql, params = []) => {
    try {
      return await window.electronAPI.database.all(sql, params);
    } catch (error) {
      console.error('Database all error:', error);
      throw error;
    }
  }, []);

  // Goals operations
  const createGoal = useCallback(async (goalData) => {
    const { type, title, description, parent_id, priority, success_criteria, target_date, focus_area_id } = goalData;
    return await runQuery(
      `INSERT INTO goals (type, title, description, parent_id, priority, success_criteria, target_date, focus_area_id, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [type, title, description, parent_id, priority, success_criteria, target_date, focus_area_id]
    );
  }, [runQuery]);

  const updateGoal = useCallback(async (id, updates) => {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    return await runQuery(
      `UPDATE goals SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id]
    );
  }, [runQuery]);

  const getGoals = useCallback(async (type = null) => {
    if (type) {
      return await getAllRecords('SELECT * FROM goals WHERE type = ? ORDER BY created_at DESC', [type]);
    }
    return await getAllRecords('SELECT * FROM goals ORDER BY created_at DESC');
  }, [getAllRecords]);

  const getGoalById = useCallback(async (id) => {
    return await getRecord('SELECT * FROM goals WHERE id = ?', [id]);
  }, [getRecord]);

  const deleteGoal = useCallback(async (id) => {
    return await runQuery('DELETE FROM goals WHERE id = ?', [id]);
  }, [runQuery]);

  // Goal notes operations
  const addGoalNote = useCallback(async (goal_id, type, content) => {
    return await runQuery(
      'INSERT INTO goal_notes (goal_id, type, content) VALUES (?, ?, ?)',
      [goal_id, type, content]
    );
  }, [runQuery]);

  const getGoalNotes = useCallback(async (goal_id) => {
    return await getAllRecords(
      'SELECT * FROM goal_notes WHERE goal_id = ? ORDER BY created_at DESC',
      [goal_id]
    );
  }, [getAllRecords]);

  // Focus areas operations
  const getFocusAreas = useCallback(async () => {
    return await getAllRecords('SELECT * FROM focus_areas ORDER BY name');
  }, [getAllRecords]);

  const createFocusArea = useCallback(async (name, category, month, theme) => {
    return await runQuery(
      'INSERT INTO focus_areas (name, category, month, theme) VALUES (?, ?, ?, ?)',
      [name, category, month, theme]
    );
  }, [runQuery]);

  const updateFocusArea = useCallback(async (id, updates) => {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    return await runQuery(
      `UPDATE focus_areas SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
  }, [runQuery]);

  // Habits operations
  const createHabit = useCallback(async (habitData) => {
    const { name, description, category, frequency, custom_days, target_streak } = habitData;
    return await runQuery(
      'INSERT INTO habits (name, description, category, frequency, custom_days, target_streak) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, category, frequency, custom_days, target_streak]
    );
  }, [runQuery]);

  const getHabits = useCallback(async () => {
    return await getAllRecords('SELECT * FROM habits WHERE is_active = 1 ORDER BY name');
  }, [getAllRecords]);

  const updateHabit = useCallback(async (id, updates) => {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    return await runQuery(
      `UPDATE habits SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
  }, [runQuery]);

  const logHabit = useCallback(async (habit_id, date, completed, notes = '') => {
    return await runQuery(
      'INSERT OR REPLACE INTO habit_logs (habit_id, date, completed, notes) VALUES (?, ?, ?, ?)',
      [habit_id, date, completed ? 1 : 0, notes]
    );
  }, [runQuery]);

  const getHabitLogs = useCallback(async (habit_id, startDate, endDate) => {
    return await getAllRecords(
      'SELECT * FROM habit_logs WHERE habit_id = ? AND date BETWEEN ? AND ? ORDER BY date DESC',
      [habit_id, startDate, endDate]
    );
  }, [getAllRecords]);

  // Reflection operations
  const saveMorningNote = useCallback(async (noteData) => {
    const { date, priorities, mood, energy, gratitude, challenges, intention, template_id } = noteData;
    return await runQuery(
      'INSERT OR REPLACE INTO morning_notes (date, priorities, mood, energy, gratitude, challenges, intention, template_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [date, priorities, mood, energy, gratitude, challenges, intention, template_id]
    );
  }, [runQuery]);

  const getMorningNote = useCallback(async (date) => {
    return await getRecord('SELECT * FROM morning_notes WHERE date = ?', [date]);
  }, [getRecord]);

  const saveEveningReflection = useCallback(async (reflectionData) => {
    const { date, what_went_well, what_could_improve, lessons_learned, tomorrow_priority, gratitude, day_rating, accomplishments, template_id } = reflectionData;
    return await runQuery(
      'INSERT OR REPLACE INTO evening_reflections (date, what_went_well, what_could_improve, lessons_learned, tomorrow_priority, gratitude, day_rating, accomplishments, template_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [date, what_went_well, what_could_improve, lessons_learned, tomorrow_priority, gratitude, day_rating, accomplishments, template_id]
    );
  }, [runQuery]);

  const getEveningReflection = useCallback(async (date) => {
    return await getRecord('SELECT * FROM evening_reflections WHERE date = ?', [date]);
  }, [getRecord]);

  // Wisdom operations
  const addWisdom = useCallback(async (wisdomData) => {
    const { content, author, source, tags, category, personal_notes } = wisdomData;
    return await runQuery(
      'INSERT INTO wisdom (content, author, source, tags, category, personal_notes) VALUES (?, ?, ?, ?, ?, ?)',
      [content, author, source, tags, category, personal_notes]
    );
  }, [runQuery]);

  const getWisdom = useCallback(async (category = null, limit = null) => {
    let sql = 'SELECT * FROM wisdom ORDER BY created_at DESC';
    let params = [];
    
    if (category) {
      sql = 'SELECT * FROM wisdom WHERE category = ? ORDER BY created_at DESC';
      params = [category];
    }
    
    if (limit) {
      sql += ' LIMIT ?';
      params.push(limit);
    }
    
    return await getAllRecords(sql, params);
  }, [getAllRecords]);

  const toggleWisdomFavorite = useCallback(async (id, is_favorite) => {
    return await runQuery(
      'UPDATE wisdom SET is_favorite = ? WHERE id = ?',
      [is_favorite ? 1 : 0, id]
    );
  }, [runQuery]);

  // Templates operations
  const getTemplates = useCallback(async (type = null) => {
    if (type) {
      return await getAllRecords('SELECT * FROM templates WHERE type = ? ORDER BY name', [type]);
    }
    return await getAllRecords('SELECT * FROM templates ORDER BY type, name');
  }, [getAllRecords]);

  const createTemplate = useCallback(async (name, type, questions, is_default = false) => {
    return await runQuery(
      'INSERT INTO templates (name, type, questions, is_default) VALUES (?, ?, ?, ?)',
      [name, type, JSON.stringify(questions), is_default ? 1 : 0]
    );
  }, [runQuery]);

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
    createTemplate
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
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}