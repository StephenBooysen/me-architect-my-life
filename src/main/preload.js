const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getAppPath: () => ipcRenderer.invoke("get-app-path"),
  getVersion: () => ipcRenderer.invoke("get-version"),

  // Database operations
  database: {
    run: (sql, params) => ipcRenderer.invoke("db-run", sql, params),
    all: (sql, params) => ipcRenderer.invoke("db-all", sql, params),
    get: (sql, params) => ipcRenderer.invoke("db-get", sql, params),
  },
});
