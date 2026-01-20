/**
 * Preload Script
 * Exposes Electron APIs to the renderer process securely
 */

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Dialog operations
  openFile: () => ipcRenderer.invoke('dialog:open-file'),
  saveFile: () => ipcRenderer.invoke('dialog:save-file'),
  exportPDF: () => ipcRenderer.invoke('dialog:export-pdf'),

  // Specification operations
  saveSpec: (request: any) => ipcRenderer.invoke('spec:save', request),
  loadSpec: (request: any) => ipcRenderer.invoke('spec:load', request),
  exportSpecPDF: (request: any) => ipcRenderer.invoke('spec:export-pdf', request),
  importOpenEDI: () => ipcRenderer.invoke('spec:import-openedi'),

  // Menu event listeners
  onMenuNew: (callback: () => void) => {
    ipcRenderer.on('menu:new', callback);
    return () => ipcRenderer.removeListener('menu:new', callback);
  },
  onMenuOpen: (callback: () => void) => {
    ipcRenderer.on('menu:open', callback);
    return () => ipcRenderer.removeListener('menu:open', callback);
  },
  onMenuSave: (callback: () => void) => {
    ipcRenderer.on('menu:save', callback);
    return () => ipcRenderer.removeListener('menu:save', callback);
  },
  onMenuSaveAs: (callback: () => void) => {
    ipcRenderer.on('menu:save-as', callback);
    return () => ipcRenderer.removeListener('menu:save-as', callback);
  },
  onMenuImport: (callback: () => void) => {
    ipcRenderer.on('menu:import', callback);
    return () => ipcRenderer.removeListener('menu:import', callback);
  },
  onMenuExportPDF: (callback: () => void) => {
    ipcRenderer.on('menu:export-pdf', callback);
    return () => ipcRenderer.removeListener('menu:export-pdf', callback);
  },
});
