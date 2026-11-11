import React, { useState } from 'react';
import {
  X,
  HardDrive,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Terminal,
  Copy,
  Check,
  FolderOpen,
  Laptop,
  HelpCircle,
} from 'lucide-react';
import { EngineDiagnostics } from '../../services/localEngineService';

interface LocalEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagnostics: EngineDiagnostics | null;
  onRecheck: () => Promise<void>;
}

export const LocalEngineModal: React.FC<LocalEngineModalProps> = ({
  isOpen,
  onClose,
  diagnostics,
  onRecheck,
}) => {
  if (!isOpen) return null;

  const [isChecking, setIsChecking] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsChecking(true);
    await onRecheck();
    setIsChecking(false);
  };

  const copyText = (txt: string, key: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isElectron = diagnostics?.engineType === 'electron';
  const isLocalNode = diagnostics?.engineType === 'local-node';
  const hasFFmpeg = diagnostics?.ffmpegInstalled;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#0e131f] border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden select-none">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Local Processing Engine Diagnostics
              </h3>
              <p className="text-[11px] text-slate-400">
                Electron IPC, Node.js background processes, and FFmpeg verification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isChecking}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-blue-400' : ''}`} />
              <span>Re-check</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Active Engine Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] font-mono">
                Current Engine Mode
              </span>
              {isElectron ? (
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 font-mono text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Electron Native Desktop
                </span>
              ) : isLocalNode ? (
                <span className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-800/80 text-blue-300 font-mono text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-blue-400" />
                  Local Node.js + Express
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800/80 text-purple-300 font-mono text-[11px] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  Web Preview Mode
                </span>
              )}
            </div>

            <div className="text-sm font-semibold text-white">
              {isElectron
                ? 'Running inside native Windows Electron shell with direct filesystem access'
                : isLocalNode
                ? 'Running on local machine with Node.js background FFmpeg execution engine'
                : 'Running inside Web Sandbox (with real client-side Canvas & MediaRecorder video rendering)'}
            </div>

            <div className="text-[11px] text-slate-400">
              Storage root: <strong className="text-slate-300 font-mono">{diagnostics?.dataDirectory || 'D:\\LocalVideoStudio'}</strong>
            </div>
          </div>

          {/* Component Health Matrix */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300">Engine Subsystem Health</div>
            <div className="bg-slate-950 rounded-xl border border-slate-800 divide-y divide-slate-800/60 font-mono text-[11px]">
              {/* Row 1: FFmpeg */}
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {hasFFmpeg ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <div>
                    <div className="text-white font-sans font-medium">FFmpeg Binary (ffmpeg.exe)</div>
                    <div className="text-[10px] text-slate-400">
                      {diagnostics?.ffmpegVersion || 'Checking system PATH...'}
                    </div>
                  </div>
                </div>
                <span className={hasFFmpeg ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                  {hasFFmpeg ? 'AVAILABLE' : 'STANDBY / WEB FALLBACK'}
                </span>
              </div>

              {/* Row 2: FFprobe */}
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {diagnostics?.ffprobeInstalled ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <div>
                    <div className="text-white font-sans font-medium">FFprobe Metadata (ffprobe.exe)</div>
                    <div className="text-[10px] text-slate-400">
                      {diagnostics?.ffprobeVersion || 'Checking system PATH...'}
                    </div>
                  </div>
                </div>
                <span className={diagnostics?.ffprobeInstalled ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                  {diagnostics?.ffprobeInstalled ? 'AVAILABLE' : 'HTML5 PROBE FALLBACK'}
                </span>
              </div>

              {/* Row 3: Electron Window */}
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {isElectron ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                  <div>
                    <div className="text-white font-sans font-medium">Electron IPC Bridge (window.electronAPI)</div>
                    <div className="text-[10px] text-slate-400">
                      {isElectron ? 'Secure IPC preload bound' : 'Web environment (IPC ready when launched via npm run electron:dev)'}
                    </div>
                  </div>
                </div>
                <span className={isElectron ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                  {isElectron ? 'CONNECTED' : 'INACTIVE'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Setup Commands for Local Windows Machine */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                <span>How to Run Locally on Windows</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              If running on your local computer, open PowerShell or Command Prompt in the project folder:
            </p>

            <div className="space-y-2">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between font-mono text-[11px] text-blue-300">
                <span>npm run dev</span>
                <button
                  onClick={() => copyText('npm run dev', 'cmd1')}
                  className="text-slate-400 hover:text-white p-1"
                  title="Copy command"
                >
                  {copiedKey === 'cmd1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between font-mono text-[11px] text-emerald-300">
                <span>npm run electron:dev</span>
                <button
                  onClick={() => copyText('npm run electron:dev', 'cmd2')}
                  className="text-slate-400 hover:text-white p-1"
                  title="Copy command"
                >
                  {copiedKey === 'cmd2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between font-mono text-[11px] text-purple-300">
                <span>winget install Gyan.FFmpeg</span>
                <button
                  onClick={() => copyText('winget install Gyan.FFmpeg', 'cmd3')}
                  className="text-slate-400 hover:text-white p-1"
                  title="Install FFmpeg on Windows"
                >
                  {copiedKey === 'cmd3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            Local Video Studio operates offline-first with zero telemetry.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
