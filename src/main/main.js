const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Database = require('./database');
const isDev = process.argv.includes('--dev');

let mainWindow;
let database;

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
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../../assets/icon.png'),
    show: false,
    titleBarStyle: 'default'
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist-renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  // Initialize database
  database = new Database();
  await database.init();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for database operations
ipcMain.handle('get-app-path', () => {
  return app.getPath('userData');
});

ipcMain.handle('get-version', () => {
  return app.getVersion();
});

// Database IPC handlers
ipcMain.handle('db-run', async (event, sql, params) => {
  try {
    return await database.run(sql, params);
  } catch (error) {
    console.error('Database run error:', error);
    throw error;
  }
});

ipcMain.handle('db-get', async (event, sql, params) => {
  try {
    return await database.get(sql, params);
  } catch (error) {
    console.error('Database get error:', error);
    throw error;
  }
});

ipcMain.handle('db-all', async (event, sql, params) => {
  try {
    return await database.all(sql, params);
  } catch (error) {
    console.error('Database all error:', error);
    throw error;
  }
});

// Cleanup on app quit
app.on('before-quit', async () => {
  if (database) {
    await database.close();
  }
});