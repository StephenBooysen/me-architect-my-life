const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const { app } = require("electron");

class Database {
  constructor() {
    this.db = null;
  }

  async init() {
    const dbPath = path.join(app.getPath("userData"), "architect-my-life.db");

    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error("Error opening database:", err);
          reject(err);
        } else {
          console.log("Connected to SQLite database");
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
        target_year INTEGER,
        target_month INTEGER,
        target_week INTEGER,
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

      // Monthly focus assignments table
      `CREATE TABLE IF NOT EXISTS monthly_focus_assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        focus_area_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (focus_area_id) REFERENCES focus_areas (id),
        UNIQUE(year, month)
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
      )`,

      // Moods table
      `CREATE TABLE IF NOT EXISTS moods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL UNIQUE,
        rating INTEGER NOT NULL
      )`,
    ];

    for (const table of tables) {
      await this.run(table);
    }

    // Run migrations to add missing columns
    await this.runMigrations();

    // Insert default focus areas
    await this.insertDefaultData();
  }

  async runMigrations() {
    // Check if target_year column exists, if not add it
    try {
      await this.get("SELECT target_year FROM goals LIMIT 1");
    } catch (error) {
      // Column doesn't exist, add it
      if (error.message.includes("no such column: target_year")) {
        console.log("Adding target_year column to goals table");
        await this.run("ALTER TABLE goals ADD COLUMN target_year INTEGER");
      }
    }

    // Check if target_month column exists, if not add it
    try {
      await this.get("SELECT target_month FROM goals LIMIT 1");
    } catch (error) {
      // Column doesn't exist, add it
      if (error.message.includes("no such column: target_month")) {
        console.log("Adding target_month column to goals table");
        await this.run("ALTER TABLE goals ADD COLUMN target_month INTEGER");
      }
    }

    // Check if target_week column exists, if not add it
    try {
      await this.get("SELECT target_week FROM goals LIMIT 1");
    } catch (error) {
      // Column doesn't exist, add it
      if (error.message.includes("no such column: target_week")) {
        console.log("Adding target_week column to goals table");
        await this.run("ALTER TABLE goals ADD COLUMN target_week INTEGER");
      }
    }

    // Check if updated_at column exists in wisdom, if not add it
    try {
      await this.get("SELECT updated_at FROM wisdom LIMIT 1");
    } catch (error) {
      // Column doesn't exist, add it
      if (error.message.includes("no such column: updated_at")) {
        console.log("Adding updated_at column to wisdom table");
        await this.run("ALTER TABLE wisdom ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP");
      }
    }
  }

  async insertDefaultData() {
    const defaultFocusAreas = [
      "Health & Fitness",
      "Wealth & Career",
      "Spiritual & Mindfulness",
      "Family & Relationships",
      "Friends & Social",
      "Personal Development",
      "Hobbies & Recreation",
    ];

    for (const area of defaultFocusAreas) {
      await this.run(
        "INSERT OR IGNORE INTO focus_areas (name, category) VALUES (?, ?)",
        [area, area.toLowerCase().replace(/ & /g, "_").replace(/ /g, "_")]
      );
    }

    // Insert default templates
    const defaultMorningTemplate = {
      name: "Default Morning Template",
      type: "morning",
      questions: JSON.stringify([
        "What are my top 3 priorities today?",
        "How do I want to feel today?",
        "What am I grateful for?",
        "What challenges might I face?",
        "My intention for today is...",
      ]),
      is_default: 1,
    };

    const defaultEveningTemplate = {
      name: "Default Evening Template",
      type: "evening",
      questions: JSON.stringify([
        "What went well today?",
        "What could have been better?",
        "What did I learn?",
        "Tomorrow's top priority is...",
        "I'm grateful for...",
      ]),
      is_default: 1,
    };

    await this.run(
      "INSERT OR IGNORE INTO templates (name, type, questions, is_default) VALUES (?, ?, ?, ?)",
      [
        defaultMorningTemplate.name,
        defaultMorningTemplate.type,
        defaultMorningTemplate.questions,
        defaultMorningTemplate.is_default,
      ]
    );

    await this.run(
      "INSERT OR IGNORE INTO templates (name, type, questions, is_default) VALUES (?, ?, ?, ?)",
      [
        defaultEveningTemplate.name,
        defaultEveningTemplate.type,
        defaultEveningTemplate.questions,
        defaultEveningTemplate.is_default,
      ]
    );
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
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

  close() {
    return new Promise((resolve) => {
      this.db.close((err) => {
        if (err) {
          console.error("Error closing database:", err);
        }
        resolve();
      });
    });
  }
}

module.exports = Database;
