const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getAppPath: () => ipcRenderer.invoke("get-app-path"),
  getVersion: () => ipcRenderer.invoke("get-version"),

  // Database operations
  database: {
    query: (sql, params) => ipcRenderer.invoke("db-query", sql, params),
    run: (sql, params) => ipcRenderer.invoke("db-run", sql, params),
    all: (sql, params) => ipcRenderer.invoke("db-all", sql, params),
    get: (sql, params) => ipcRenderer.invoke("db-get", sql, params),
  },

  // AI operations
  ai: {
    chat: (message, context) => ipcRenderer.invoke("ai-chat", message, context),
  },

  // File operations
  files: {
    export: (data, filename) =>
      ipcRenderer.invoke("export-data", data, filename),
    import: () => ipcRenderer.invoke("import-data"),
  },
});
