const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('diskAPI', {
  scan: () => ipcRenderer.invoke('disk:scan'),
  delete: (paths) => ipcRenderer.invoke('disk:delete', paths),
  getInfo: () => ipcRenderer.invoke('disk:info'),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (patch) => ipcRenderer.invoke('settings:set', patch),
  askAI: (params) => ipcRenderer.invoke('ai:ask', params),
});
