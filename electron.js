const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;

// Keep a global reference of the window object
let mainWindow;
let serverProcess;
const SERVER_PORT = 3100;
const SERVER_URL = `http://localhost:${SERVER_PORT}`;

// Enable live reload for development
if (process.env.NODE_ENV === 'development') {
  try {
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
      hardResetMethod: 'exit'
    });
  } catch (error) {
    console.log('Electron reload not available in development mode');
  }
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 1000,
    minWidth: 1200,
    minHeight: 800,
    icon: path.join(__dirname, 'public', 'images', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false, // Don't show until ready
    autoHideMenuBar: false
  });

  // Set application menu
  createApplicationMenu();

  // Load the app
  loadApplication();

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus on window
    if (process.platform === 'darwin') {
      app.focus();
    } else {
      mainWindow.focus();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Prevent navigation away from the app
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== SERVER_URL) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });
}

async function startServer() {
  return new Promise((resolve, reject) => {
    // Start the Express server
    serverProcess = spawn('node', ['app.js'], {
      cwd: __dirname,
      env: { ...process.env, PORT: SERVER_PORT },
      stdio: 'pipe'
    });

    serverProcess.stdout.on('data', (data) => {
      console.log(`Server: ${data}`);
      if (data.toString().includes('running at')) {
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`Server Error: ${data}`);
    });

    serverProcess.on('close', (code) => {
      console.log(`Server process exited with code ${code}`);
    });

    serverProcess.on('error', (error) => {
      console.error('Failed to start server:', error);
      reject(error);
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      resolve(); // Resolve anyway to prevent hanging
    }, 10000);
  });
}

async function loadApplication() {
  try {
    // Start the server first
    await startServer();
    
    // Wait a moment for server to fully initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Load the application
    await mainWindow.loadURL(SERVER_URL);
    
  } catch (error) {
    console.error('Failed to load application:', error);
    
    // Show error dialog
    dialog.showErrorBox(
      'Application Error',
      'Failed to start the application server. Please try again.'
    );
    
    app.quit();
  }
}

function createApplicationMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Goal',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              if (window.location.pathname === '/goals') {
                GoalsComponent.showInlineForm();
              } else {
                window.location.href = '/goals';
              }
            `);
          }
        },
        { type: 'separator' },
        {
          label: 'Preferences',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.executeJavaScript(`window.location.href = '/settings';`);
          }
        },
        { type: 'separator' },
        {
          label: process.platform === 'darwin' ? 'Quit Architect My Life' : 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Navigate',
      submenu: [
        {
          label: 'Dashboard',
          accelerator: 'CmdOrCtrl+1',
          click: () => mainWindow.webContents.executeJavaScript(`window.location.href = '/dashboard';`)
        },
        {
          label: 'Goals',
          accelerator: 'CmdOrCtrl+2',
          click: () => mainWindow.webContents.executeJavaScript(`window.location.href = '/goals';`)
        },
        {
          label: 'Focus Areas',
          accelerator: 'CmdOrCtrl+3',
          click: () => mainWindow.webContents.executeJavaScript(`window.location.href = '/focus-areas';`)
        },
        {
          label: 'Habits',
          accelerator: 'CmdOrCtrl+4',
          click: () => mainWindow.webContents.executeJavaScript(`window.location.href = '/habits';`)
        },
        {
          label: 'How You Feel',
          accelerator: 'CmdOrCtrl+5',
          click: () => mainWindow.webContents.executeJavaScript(`window.location.href = '/how-you-feel';`)
        },
        {
          label: 'Reflection',
          accelerator: 'CmdOrCtrl+6',
          click: () => mainWindow.webContents.executeJavaScript(`window.location.href = '/reflection';`)
        },
        {
          label: 'Wisdom Library',
          accelerator: 'CmdOrCtrl+7',
          click: () => mainWindow.webContents.executeJavaScript(`window.location.href = '/wisdom';`)
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Architect My Life',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Architect My Life',
              message: 'Architect My Life',
              detail: 'Version 1.0.0\n\nA personal goal and habit tracking application to help you build the life you want.\n\nBuilt with Electron and Node.js'
            });
          }
        },
        {
          label: 'Learn More',
          click: () => {
            shell.openExternal('https://github.com/StephenBooysen/me-architect-my-life');
          }
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });

    // Window menu
    template[5].submenu = [
      { role: 'close' },
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' }
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(() => {
  createWindow();

  // macOS specific behavior
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Kill the server process
  if (serverProcess) {
    serverProcess.kill();
  }
  
  // Quit the app unless on macOS
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Kill the server process
  if (serverProcess) {
    serverProcess.kill();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent, navigationUrl) => {
    navigationEvent.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// Handle protocol for macOS
if (process.platform === 'darwin') {
  app.setAboutPanelOptions({
    applicationName: 'Architect My Life',
    applicationVersion: '1.0.0',
    credits: 'Built by Stephen Booysen'
  });
}