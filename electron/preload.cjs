/**
 * Local Video Studio - Electron Preload Script
 * Exposes secure API boundary to the React renderer
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,

  // Open native Windows File Dialog
  selectVideoFile: () => ipcRenderer.invoke('select-video-file'),

  // Execute FFprobe on local file without loading file into JS memory
  runFFprobe: (filePath) => ipcRenderer.invoke('run-ffprobe', filePath),

  // Execute FFmpeg as a separate child process
  runFFmpeg: (payload) => ipcRenderer.invoke('run-ffmpeg', payload),

  // Listen for real-time progress events from FFmpeg
  onFFmpegProgress: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('ffmpeg-progress', handler);
    return () => ipcRenderer.removeListener('ffmpeg-progress', handler);
  },

  // Open Windows Explorer to exports directory
  openExportsFolder: () => ipcRenderer.invoke('open-exports-folder'),

  // Query hardware and system diagnostics
  getSystemDiagnostics: () => ipcRenderer.invoke('get-system-diagnostics'),
});
