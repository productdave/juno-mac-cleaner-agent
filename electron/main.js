const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const scanner = require('./scanner');
const settings = require('./settings');
const ai = require('./ai');

const isDev = process.env.NODE_ENV === 'development';

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 680,
    height: 800,
    minWidth: 500,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 18, y: 18 },
    backgroundColor: '#0a0f1a',
    vibrancy: 'under-window',
    visualEffectState: 'active',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  ipcMain.handle('disk:scan', async () => scanner.scan());
  ipcMain.handle('disk:delete', async (_e, paths) => scanner.deletePaths(paths));
  ipcMain.handle('disk:info', async () => scanner.getDiskInfo());
  ipcMain.handle('settings:get', async () => settings.get());
  ipcMain.handle('settings:set', async (_e, patch) => settings.set(patch));
  ipcMain.handle('ai:ask', async (_e, params) => ai.ask(params));

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
