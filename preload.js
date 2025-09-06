const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Application info
  getAppVersion: () => {
    return process.env.npm_package_version || '1.0.0';
  },
  
  // Platform info
  getPlatform: () => {
    return process.platform;
  },
  
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),
  
  // Navigation shortcuts
  navigateTo: (path) => {
    window.location.href = path;
  },
  
  // App-specific functionality
  isElectron: true,
  
  // Theme detection
  shouldUseDarkColors: () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
});

// Add app identification
window.addEventListener('DOMContentLoaded', () => {
  // Add electron class to body for Electron-specific styling
  document.body.classList.add('electron-app');
  
  // Set app version in data attribute
  document.documentElement.setAttribute('data-app-version', process.env.npm_package_version || '1.0.0');
  
  // Platform-specific classes
  document.body.classList.add(`platform-${process.platform}`);
  
  console.log('Architect My Life Electron App Loaded');
});