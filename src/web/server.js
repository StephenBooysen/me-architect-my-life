const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

class WebDatabase {
  constructor() {
    this.db = null;
  }

  async init() {
    // Use a web-specific database path in the project directory
    const dbPath = path.join(__dirname, '../../web-database.db');
    
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database (web mode)');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async createTables() {
    const tables = [
      // Goals table
      `CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('annual', 'monthly', 'weekly')),
        title TEXT NOT NULL,
        description TEXT,
        parent_id INTEGER,
        progress REAL DEFAULT 0 CHECK(progress >= 0 AND progress <= 100),
        priority TEXT DEFAULT 'medium' CHECK(priority IN ('high', 'medium', 'low')),
        success_criteria TEXT,
        target_date TEXT,
        focus_area_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES goals (id),
        FOREIGN KEY (focus_area_id) REFERENCES focus_areas (id)
      )`,

      // Goal notes table
      `CREATE TABLE IF NOT EXISTS goal_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        goal_id INTEGER NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('general', 'what_worked', 'what_didnt_work')),
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (goal_id) REFERENCES goals (id) ON DELETE CASCADE
      )`,

      // Focus areas table
      `CREATE TABLE IF NOT EXISTS focus_areas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        month TEXT,
        theme TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Habits table
      `CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        frequency TEXT DEFAULT 'daily' CHECK(frequency IN ('daily', 'weekdays', 'weekends', 'custom')),
        custom_days TEXT,
        target_streak INTEGER DEFAULT 30,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Habit logs table
      `CREATE TABLE IF NOT EXISTS habit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        habit_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        completed BOOLEAN DEFAULT 0,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE,
        UNIQUE(habit_id, date)
      )`,

      // Morning notes table
      `CREATE TABLE IF NOT EXISTS morning_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL UNIQUE,
        priorities TEXT,
        mood INTEGER CHECK(mood >= 1 AND mood <= 10),
        energy INTEGER CHECK(energy >= 1 AND energy <= 10),
        gratitude TEXT,
        challenges TEXT,
        intention TEXT,
        template_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (template_id) REFERENCES templates (id)
      )`,

      // Evening reflection table
      `CREATE TABLE IF NOT EXISTS evening_reflections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL UNIQUE,
        what_went_well TEXT,
        what_could_improve TEXT,
        lessons_learned TEXT,
        tomorrow_priority TEXT,
        gratitude TEXT,
        day_rating INTEGER CHECK(day_rating >= 1 AND day_rating <= 10),
        accomplishments TEXT,
        template_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (template_id) REFERENCES templates (id)
      )`,

      // Wisdom library table
      `CREATE TABLE IF NOT EXISTS wisdom (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        author TEXT,
        source TEXT,
        tags TEXT,
        category TEXT,
        personal_notes TEXT,
        is_favorite BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Templates table
      `CREATE TABLE IF NOT EXISTS templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('morning', 'evening')),
        questions TEXT NOT NULL,
        is_default BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // AI chat history table
      `CREATE TABLE IF NOT EXISTS ai_chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
        message TEXT NOT NULL,
        context TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const table of tables) {
      await this.run(table);
    }

    // Insert default data
    await this.insertDefaultData();
  }

  async insertDefaultData() {
    const defaultFocusAreas = [
      'Health & Fitness',
      'Wealth & Career',
      'Spiritual & Mindfulness',
      'Family & Relationships',
      'Friends & Social',
      'Personal Development',
      'Hobbies & Recreation'
    ];

    for (const area of defaultFocusAreas) {
      await this.run(
        'INSERT OR IGNORE INTO focus_areas (name, category) VALUES (?, ?)',
        [area, area.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')]
      );
    }

    // Insert default templates
    const defaultMorningTemplate = {
      name: 'Default Morning Template',
      type: 'morning',
      questions: JSON.stringify([
        'What are my top 3 priorities today?',
        'How do I want to feel today?',
        'What am I grateful for?',
        'What challenges might I face?',
        'My intention for today is...'
      ]),
      is_default: 1
    };

    const defaultEveningTemplate = {
      name: 'Default Evening Template',
      type: 'evening',
      questions: JSON.stringify([
        'What went well today?',
        'What could have been better?',
        'What did I learn?',
        'Tomorrow\'s top priority is...',
        'I\'m grateful for...'
      ]),
      is_default: 1
    };

    await this.run(
      'INSERT OR IGNORE INTO templates (name, type, questions, is_default) VALUES (?, ?, ?, ?)',
      [defaultMorningTemplate.name, defaultMorningTemplate.type, defaultMorningTemplate.questions, defaultMorningTemplate.is_default]
    );

    await this.run(
      'INSERT OR IGNORE INTO templates (name, type, questions, is_default) VALUES (?, ?, ?, ?)',
      [defaultEveningTemplate.name, defaultEveningTemplate.type, defaultEveningTemplate.questions, defaultEveningTemplate.is_default]
    );
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../../dist-renderer')));

// Database instance
const database = new WebDatabase();

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Web server running' });
});

// Goals API
app.get('/api/goals', async (req, res) => {
  try {
    const { type, parent_id } = req.query;
    let sql = 'SELECT * FROM goals';
    let params = [];
    let conditions = [];
    
    if (type) {
      conditions.push('type = ?');
      params.push(type);
    }
    
    if (parent_id !== undefined) {
      if (parent_id === 'null' || parent_id === '') {
        conditions.push('parent_id IS NULL');
      } else {
        conditions.push('parent_id = ?');
        params.push(parent_id);
      }
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const goals = await database.all(sql, params);
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get goal with its children
app.get('/api/goals/:id/with-children', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the goal
    const goal = await database.get('SELECT * FROM goals WHERE id = ?', [id]);
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    // Get children
    const children = await database.all('SELECT * FROM goals WHERE parent_id = ? ORDER BY created_at DESC', [id]);
    
    res.json({ ...goal, children });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get goal hierarchy (parent chain)
app.get('/api/goals/:id/hierarchy', async (req, res) => {
  try {
    const { id } = req.params;
    const hierarchy = [];
    let currentId = id;
    
    while (currentId) {
      const goal = await database.get('SELECT * FROM goals WHERE id = ?', [currentId]);
      if (!goal) break;
      
      hierarchy.unshift(goal);
      currentId = goal.parent_id;
    }
    
    res.json(hierarchy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update goal progress (also updates parent progress automatically)
app.put('/api/goals/:id/progress', async (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;
    
    // Update the goal's progress
    await database.run('UPDATE goals SET progress = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [progress, id]);
    
    // Get the updated goal
    const goal = await database.get('SELECT * FROM goals WHERE id = ?', [id]);
    
    // If this goal has a parent, update parent's progress based on children
    if (goal && goal.parent_id) {
      const siblings = await database.all('SELECT progress FROM goals WHERE parent_id = ?', [goal.parent_id]);
      const avgProgress = siblings.reduce((sum, sibling) => sum + (sibling.progress || 0), 0) / siblings.length;
      
      await database.run('UPDATE goals SET progress = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [Math.round(avgProgress), goal.parent_id]);
      
      // Continue up the chain
      const parent = await database.get('SELECT * FROM goals WHERE id = ?', [goal.parent_id]);
      if (parent && parent.parent_id) {
        const parentSiblings = await database.all('SELECT progress FROM goals WHERE parent_id = ?', [parent.parent_id]);
        const parentAvgProgress = parentSiblings.reduce((sum, sibling) => sum + (sibling.progress || 0), 0) / parentSiblings.length;
        
        await database.run('UPDATE goals SET progress = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [Math.round(parentAvgProgress), parent.parent_id]);
      }
    }
    
    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/goals', async (req, res) => {
  try {
    const { type, title, description, parent_id, priority, success_criteria, target_date, focus_area_id } = req.body;
    const result = await database.run(
      'INSERT INTO goals (type, title, description, parent_id, priority, success_criteria, target_date, focus_area_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [type, title, description, parent_id, priority, success_criteria, target_date, focus_area_id]
    );
    res.json({ id: result.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/goals/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { title, description, progress, priority, success_criteria, target_date, focus_area_id } = req.body;
    await database.run(
      'UPDATE goals SET title = ?, description = ?, progress = ?, priority = ?, success_criteria = ?, target_date = ?, focus_area_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, description, progress, priority, success_criteria, target_date, focus_area_id, id]
    );
    res.json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/goals/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await database.run('DELETE FROM goals WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Focus Areas API
app.get('/api/focus-areas', async (req, res) => {
  try {
    const focusAreas = await database.all('SELECT * FROM focus_areas WHERE is_active = 1');
    res.json(focusAreas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Habits API
app.get('/api/habits', async (req, res) => {
  try {
    const habits = await database.all('SELECT * FROM habits WHERE is_active = 1');
    res.json(habits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/habits', async (req, res) => {
  try {
    const { name, description, category, frequency, custom_days, target_streak } = req.body;
    const result = await database.run(
      'INSERT INTO habits (name, description, category, frequency, custom_days, target_streak) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, category, frequency, custom_days, target_streak]
    );
    res.json({ id: result.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Habit logs API
app.get('/api/habit-logs', async (req, res) => {
  try {
    const { date, habit_id } = req.query;
    let sql = 'SELECT hl.*, h.name as habit_name FROM habit_logs hl JOIN habits h ON hl.habit_id = h.id';
    let params = [];
    
    if (date) {
      sql += ' WHERE hl.date = ?';
      params.push(date);
    }
    
    if (habit_id) {
      sql += params.length > 0 ? ' AND hl.habit_id = ?' : ' WHERE hl.habit_id = ?';
      params.push(habit_id);
    }
    
    const logs = await database.all(sql, params);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/habit-logs', async (req, res) => {
  try {
    const { habit_id, date, completed, notes } = req.body;
    const result = await database.run(
      'INSERT OR REPLACE INTO habit_logs (habit_id, date, completed, notes) VALUES (?, ?, ?, ?)',
      [habit_id, date, completed ? 1 : 0, notes]
    );
    res.json({ id: result.id, habit_id, date, completed, notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Wisdom API
app.get('/api/wisdom', async (req, res) => {
  try {
    const wisdom = await database.all('SELECT * FROM wisdom ORDER BY created_at DESC');
    res.json(wisdom);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Morning notes API
app.get('/api/morning-notes', async (req, res) => {
  try {
    const { date } = req.query;
    let sql = 'SELECT * FROM morning_notes';
    let params = [];
    
    if (date) {
      sql += ' WHERE date = ?';
      params.push(date);
    } else {
      sql += ' ORDER BY date DESC';
    }
    
    const notes = await database.all(sql, params);
    res.json(date ? (notes[0] || null) : notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/morning-notes', async (req, res) => {
  try {
    const { date, priorities, mood, energy, gratitude, challenges, intention, template_id } = req.body;
    const result = await database.run(
      'INSERT OR REPLACE INTO morning_notes (date, priorities, mood, energy, gratitude, challenges, intention, template_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [date, priorities, mood, energy, gratitude, challenges, intention, template_id]
    );
    res.json({ id: result.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Evening reflections API
app.get('/api/evening-reflections', async (req, res) => {
  try {
    const { date } = req.query;
    let sql = 'SELECT * FROM evening_reflections';
    let params = [];
    
    if (date) {
      sql += ' WHERE date = ?';
      params.push(date);
    } else {
      sql += ' ORDER BY date DESC';
    }
    
    const reflections = await database.all(sql, params);
    res.json(date ? (reflections[0] || null) : reflections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/evening-reflections', async (req, res) => {
  try {
    const { date, what_went_well, what_could_improve, lessons_learned, tomorrow_priority, gratitude, day_rating, accomplishments, template_id } = req.body;
    const result = await database.run(
      'INSERT OR REPLACE INTO evening_reflections (date, what_went_well, what_could_improve, lessons_learned, tomorrow_priority, gratitude, day_rating, accomplishments, template_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [date, what_went_well, what_could_improve, lessons_learned, tomorrow_priority, gratitude, day_rating, accomplishments, template_id]
    );
    res.json({ id: result.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist-renderer/index.html'));
});

// Initialize database and start server
async function startServer() {
  try {
    await database.init();
    app.listen(port, () => {
      console.log(`Web server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();