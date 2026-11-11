/**
 * Local Video Studio - Electron Main Process (Desktop Local Processing Engine)
 * Platform: Windows 10 / Windows 11 / macOS / Linux
 */

const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, exec } = require('child_process');

let mainWindow = null;

// Determine media storage directories
const BASE_STORAGE = process.platform === 'win32' && fs.existsSync('D:\\')
  ? 'D:\\LocalVideoStudio'
  : path.join(app.getPath('userData'), 'LocalVideoStudio');

const STORAGE_DIRS = {
  originals: path.join(BASE_STORAGE, 'media', 'originals'),
  exports: path.join(BASE_STORAGE, 'media', 'exports'),
  temporary: path.join(BASE_STORAGE, 'media', 'temporary'),
  projects: path.join(BASE_STORAGE, 'projects'),
};

// Ensure directories exist
Object.values(STORAGE_DIRS).forEach((dir) => {
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch (e) {
    console.warn('Directory check error:', e);
  }
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 720,
    title: 'Local Video Studio',
    backgroundColor: '#0b0f17',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: true,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000').catch(() => {
      // If dev server not yet up, load index file
      mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Handle external links safely
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// ------------------------------------------------------------------
// SECURE IPC HANDLERS (Section 4 & 5 Architecture Rules)
// ------------------------------------------------------------------

// 1. Select Video File via Native Windows Dialog
ipcMain.handle('select-video-file', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Video to Import (Supports 1GB+ & 5GB+)',
    properties: ['openFile'],
    filters: [
      { name: 'Video Files', extensions: ['mp4', 'mov', 'mkv', 'webm', 'avi', 'm4v'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];
  const stats = fs.statSync(filePath);

  return {
    path: filePath,
    name: path.basename(filePath),
    size: stats.size,
  };
});

// 2. Run FFprobe without loading video into JS heap (Section 4)
ipcMain.handle('run-ffprobe', async (event, filePath) => {
  return new Promise((resolve, reject) => {
    const cmd = `ffprobe -v quiet -show_format -show_streams -of json "${filePath}"`;
    exec(cmd, { maxBuffer: 15 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        return resolve({ success: false, error: error.message, details: stderr });
      }
      try {
        const metadata = JSON.parse(stdout);
        resolve({ success: true, metadata });
      } catch (e) {
        resolve({ success: false, error: 'Failed to parse ffprobe json output' });
      }
    });
  });
});

// 3. Run FFmpeg Child Process with Real-Time Progress Stream
ipcMain.handle('run-ffmpeg', async (event, { command, jobId }) => {
  return new Promise((resolve) => {
    const args = command.startsWith('ffmpeg ') ? command.slice(7) : command;
    const child = spawn('ffmpeg', ['-stats', ...args.split(' ').filter(Boolean)], {
      shell: true,
    });

    child.stderr.on('data', (data) => {
      const msg = data.toString();
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('ffmpeg-progress', { jobId, raw: msg });
      }
    });

    child.on('close', (code) => {
      resolve({ success: code === 0, code });
    });

    child.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });
  });
});

// 4. Open Exported Folder in Windows Explorer
ipcMain.handle('open-exports-folder', async () => {
  shell.openPath(STORAGE_DIRS.exports);
  return true;
});

// 5. Get System Diagnostics
ipcMain.handle('get-system-diagnostics', async () => {
  const checkCmd = (c) =>
    new Promise((res) => {
      exec(c, (err, out) => res(!err));
    });

  const ffmpegOk = await checkCmd('ffmpeg -version');
  const ffprobeOk = await checkCmd('ffprobe -version');

  return {
    isElectron: true,
    platform: process.platform,
    arch: process.arch,
    appVersion: app.getVersion(),
    storageDirs: STORAGE_DIRS,
    ffmpegInstalled: ffmpegOk,
    ffprobeInstalled: ffprobeOk,
  };
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
