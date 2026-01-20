/**
 * Electron Main Process
 * Handles window management, IPC, file operations, and PDF generation
 */

import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { generatePDF } from './pdf-generator';
import {
  Specification,
  SaveSpecificationRequest,
  LoadSpecificationRequest,
  ExportPDFRequest,
  IPCResponse,
} from '../shared/models/edi-types';

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    title: 'EDI Specification Builder',
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3003');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  createMenu();
}

function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Specification',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow?.webContents.send('menu:new'),
        },
        {
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow?.webContents.send('menu:open'),
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow?.webContents.send('menu:save'),
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => mainWindow?.webContents.send('menu:save-as'),
        },
        { type: 'separator' },
        {
          label: 'Import OpenEDI Spec...',
          click: () => mainWindow?.webContents.send('menu:import'),
        },
        {
          label: 'Export PDF...',
          accelerator: 'CmdOrCtrl+E',
          click: () => mainWindow?.webContents.send('menu:export-pdf'),
        },
        { type: 'separator' },
        { role: 'quit' },
      ],
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
        { role: 'selectAll' },
      ],
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
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About EDI Specification Builder',
          click: () => {
            dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: 'About',
              message: 'EDI Specification Builder',
              detail: 'Version 1.0.0\n\nA tool for creating and editing ANSI X12 EDI implementation specifications.',
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC Handlers

ipcMain.handle('dialog:open-file', async (): Promise<IPCResponse<string>> => {
  try {
    const result = await dialog.showOpenDialog(mainWindow!, {
      filters: [
        { name: 'EDI Specifications', extensions: ['edispec', 'json'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, error: 'No file selected' };
    }

    return { success: true, data: result.filePaths[0] };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('dialog:save-file', async (): Promise<IPCResponse<string>> => {
  try {
    const result = await dialog.showSaveDialog(mainWindow!, {
      filters: [{ name: 'EDI Specifications', extensions: ['edispec'] }],
      defaultPath: 'specification.edispec',
    });

    if (result.canceled || !result.filePath) {
      return { success: false, error: 'No file selected' };
    }

    return { success: true, data: result.filePath };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('dialog:export-pdf', async (): Promise<IPCResponse<string>> => {
  try {
    const result = await dialog.showSaveDialog(mainWindow!, {
      filters: [{ name: 'PDF Documents', extensions: ['pdf'] }],
      defaultPath: 'specification.pdf',
    });

    if (result.canceled || !result.filePath) {
      return { success: false, error: 'No file selected' };
    }

    return { success: true, data: result.filePath };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

ipcMain.handle(
  'spec:save',
  async (_event, request: SaveSpecificationRequest): Promise<IPCResponse> => {
    try {
      const { specification, filePath } = request;
      if (!filePath) {
        return { success: false, error: 'No file path provided' };
      }

      const content = JSON.stringify(specification, null, 2);
      fs.writeFileSync(filePath, content, 'utf-8');

      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
);

ipcMain.handle(
  'spec:load',
  async (_event, request: LoadSpecificationRequest): Promise<IPCResponse<Specification>> => {
    try {
      const { filePath } = request;
      const content = fs.readFileSync(filePath, 'utf-8');
      const specification = JSON.parse(content) as Specification;

      return { success: true, data: specification };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
);

ipcMain.handle(
  'spec:export-pdf',
  async (_event, request: ExportPDFRequest): Promise<IPCResponse> => {
    try {
      const { specification, filePath } = request;
      await generatePDF(specification, filePath);
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
);

ipcMain.handle('spec:import-openedi', async (): Promise<IPCResponse<string>> => {
  try {
    const result = await dialog.showOpenDialog(mainWindow!, {
      filters: [
        { name: 'OpenEDI Specifications', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, error: 'No file selected' };
    }

    const content = fs.readFileSync(result.filePaths[0], 'utf-8');
    return { success: true, data: content };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

// App lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
