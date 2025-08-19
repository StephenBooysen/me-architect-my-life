const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const express = require("express");
const cors = require("cors");
const Database = require("./database");
const isDev = process.argv.includes("--dev");

let mainWindow;
let database;
let apiServer;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "../../assets/icon.png"),
    show: false,
    titleBarStyle: "default",
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../../dist-renderer/index.html"));
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

async function startApiServer() {
  const apiApp = express();
  const port = 4001;

  apiApp.use(cors());
  apiApp.use(express.json());

  // Claude API Proxy
  apiApp.post('/api/claude', async (req, res) => {
    try {
      const { messages, system, apiKey } = req.body;
      
      if (!apiKey) {
        return res.status(400).json({ error: 'API key is required' });
      }
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Messages array is required' });
      }
      
      // Make request to Claude API using fetch
      const fetch = require('node-fetch');
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          system: system || "You are a helpful AI assistant specializing in personal development, goal setting, and productivity.",
          messages: messages
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Claude API error:', response.status, errorText);
        return res.status(response.status).json({ 
          error: `Claude API error: ${response.status}`,
          details: errorText
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Claude API proxy error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Claude API Test Connection
  apiApp.post('/api/claude/test', async (req, res) => {
    try {
      const { apiKey } = req.body;
      
      if (!apiKey) {
        return res.status(400).json({ error: 'API key is required' });
      }
      
      const fetch = require('node-fetch');
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 10,
          messages: [{
            role: 'user',
            content: 'Test'
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ 
          error: `API test failed: ${response.status}`,
          details: errorText
        });
      }

      const data = await response.json();
      res.json({ success: true, message: "API key is valid", data });
    } catch (error) {
      console.error('Claude API test error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return new Promise((resolve, reject) => {
    apiServer = apiApp.listen(port, (err) => {
      if (err) {
        console.error('Failed to start API server:', err);
        reject(err);
      } else {
        console.log(`Electron API server running on port ${port}`);
        resolve();
      }
    });
  });
}

app.whenReady().then(async () => {
  // Initialize database
  database = new Database();
  await database.init();

  // Start API server for Claude AI proxy
  await startApiServer();

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// IPC handlers for database operations
ipcMain.handle("get-app-path", () => {
  return app.getPath("userData");
});

ipcMain.handle("get-version", () => {
  return app.getVersion();
});

// Database IPC handlers
ipcMain.handle("db-run", async (event, sql, params) => {
  try {
    return await database.run(sql, params);
  } catch (error) {
    console.error("Database run error:", error);
    throw error;
  }
});

ipcMain.handle("db-get", async (event, sql, params) => {
  try {
    return await database.get(sql, params);
  } catch (error) {
    console.error("Database get error:", error);
    throw error;
  }
});

ipcMain.handle("db-all", async (event, sql, params) => {
  try {
    return await database.all(sql, params);
  } catch (error) {
    console.error("Database all error:", error);
    throw error;
  }
});

// Cleanup on app quit
app.on("before-quit", async () => {
  if (database) {
    await database.close();
  }
  if (apiServer) {
    apiServer.close();
  }
});
