const { contextBridge, ipcRenderer } = require('electron');

// Dipakai index.html: window.desktop.read() / write(json)
contextBridge.exposeInMainWorld('desktop', {
  read: () => ipcRenderer.sendSync('data:read'),
  write: (json) => ipcRenderer.send('data:write', json),
  folder: () => ipcRenderer.sendSync('data:folder')
});
