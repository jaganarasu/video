import React, { useState } from 'react';
import {
  Settings,
  HardDrive,
  Cpu,
  Terminal,
  Folder,
  Layers,
  Copy,
  Check,
  ShieldCheck,
  Laptop,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [hwAcceleration, setHwAcceleration] = useState<'nvenc' | 'qsv' | 'cpu'>('nvenc');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const folderStructureText = `D:\\LocalVideoStudio\\
├── application\\
│   ├── electron\\
│   │   ├── main.js
│   │   ├── preload.js
│   │   └── ipc\\
│   ├── frontend\\
│   └── backend\\
├── media\\
│   ├── originals\\   (User source files, never overwritten)
│   ├── temporary\\   (Proxy render caches & temp wav)
│   └── exports\\     (Final H.264 MP4 clips)
├── projects\\        (Project state JSON files)
├── assets\\          (Logos, stickers, and fonts)
└── backups\\`;

  const electronMainJs = `// application/electron/main.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#0b0f17',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
  }
}

// Secure IPC handler for local video import
ipcMain.handle('select-video-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Video Files', extensions: ['mp4', 'mov', 'mkv', 'webm', 'avi', 'm4v'] }
    ]
  });
  return result.filePaths[0];
});

// Run FFmpeg child process without loading file into JavaScript RAM
ipcMain.handle('run-ffmpeg', async (event, args) => {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', args);
    ffmpeg.stderr.on('data', (data) => {
      mainWindow.webContents.send('ffmpeg-progress', data.toString());
    });
    ffmpeg.on('close', (code) => {
      if (code === 0) resolve({ success: true });
      else reject(new Error(\`FFmpeg exited with code \${code}\`));
    });
  });
});

app.whenReady().then(createWindow);`;

  return (
    <div className="flex-1 overflow-y-auto bg-[#0b0f17] text-slate-100 p-6 space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            Desktop Studio & FFmpeg Settings
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Windows 10/11 Local Processing configuration and hardware acceleration profiles
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Local Offline Engine Active</span>
        </div>
      </div>

      {/* Hardware Acceleration Baseline (Section 10) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Cpu className="w-4 h-4 text-blue-400" />
          <span>Hardware Encoding & GPU Acceleration</span>
        </div>
        <p className="text-xs text-slate-400">
          Select encoding profile matching your development laptop specification (Intel i5 10th Gen, 8GB RAM, NVIDIA MX130 2GB):
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setHwAcceleration('nvenc')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              hwAcceleration === 'nvenc'
                ? 'bg-blue-950/70 border-blue-500 text-white shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/40'
            }`}
          >
            <div className="font-semibold text-xs flex items-center justify-between">
              <span>NVIDIA NVENC (CUDA)</span>
              {hwAcceleration === 'nvenc' && <Check className="w-3.5 h-3.5 text-blue-400" />}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Recommended for NVIDIA MX130 / RTX GPU. Hardware accelerated H.264 encode.
            </div>
          </button>

          <button
            onClick={() => setHwAcceleration('qsv')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              hwAcceleration === 'qsv'
                ? 'bg-blue-950/70 border-blue-500 text-white shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/40'
            }`}
          >
            <div className="font-semibold text-xs flex items-center justify-between">
              <span>Intel QuickSync (QSV)</span>
              {hwAcceleration === 'qsv' && <Check className="w-3.5 h-3.5 text-blue-400" />}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Integrated Intel UHD 620 / Iris graphics hardware encoding.
            </div>
          </button>

          <button
            onClick={() => setHwAcceleration('cpu')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              hwAcceleration === 'cpu'
                ? 'bg-blue-950/70 border-blue-500 text-white shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/40'
            }`}
          >
            <div className="font-semibold text-xs flex items-center justify-between">
              <span>CPU libx264 (Software)</span>
              {hwAcceleration === 'cpu' && <Check className="w-3.5 h-3.5 text-blue-400" />}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Pure CPU fallback. Universal compatibility, reliable CRF quality.
            </div>
          </button>
        </div>
      </div>

      {/* Local Folder Structure (Section 5) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Folder className="w-4 h-4 text-amber-400" />
            <span>Recommended Local Folder Installation</span>
          </div>
          <button
            onClick={() => copyToClipboard(folderStructureText, 'folders')}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
          >
            {copiedSection === 'folders' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>Copy Hierarchy</span>
          </button>
        </div>

        <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre">
          {folderStructureText}
        </pre>
      </div>

      {/* Electron Desktop Main.js Scaffolding (Section 4 & 5) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Terminal className="w-4 h-4 text-purple-400" />
            <span>Electron Desktop IPC Architecture (main.js)</span>
          </div>
          <button
            onClick={() => copyToClipboard(electronMainJs, 'electron')}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
          >
            {copiedSection === 'electron' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>Copy Code</span>
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Enforces Section 4 rules: does not load large video files into JS heap; uses background child process with progress pipe.
        </p>

        <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-blue-300 overflow-x-auto whitespace-pre max-h-64">
          {electronMainJs}
        </pre>
      </div>
    </div>
  );
};
