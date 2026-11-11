import React from 'react';
import {
  Film,
  FolderOpen,
  LayoutDashboard,
  Layers,
  Terminal,
  Settings,
  Share2,
  HardDrive,
  Download,
} from 'lucide-react';
import { ActiveTab, ProjectData } from '../../types';
import { EngineDiagnostics } from '../../services/localEngineService';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  project: ProjectData;
  onOpenNewProject: () => void;
  onShowFFmpegModal: () => void;
  onQuickExport: () => void;
  exportQueueCount: number;
  diagnostics?: EngineDiagnostics | null;
  onOpenEngineModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  project,
  onOpenNewProject,
  onShowFFmpegModal,
  onQuickExport,
  exportQueueCount,
  diagnostics,
  onOpenEngineModal,
}) => {
  return (
    <header className="h-13 bg-[#0d121d] border-b border-slate-800 flex items-center justify-between px-4 select-none shrink-0 z-30">
      {/* Left: Window Title & Brand Wordmark */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight">Local Video Studio</span>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className="font-mono text-emerald-400">v1.0 Desktop</span>
              <span>·</span>
              <span className="truncate max-w-[150px]">{project.projectName}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 ml-4 bg-slate-900/80 p-1 rounded-lg border border-slate-800/80">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'editor'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Video Editor
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'library'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Media Library
          </button>

          <button
            onClick={() => setActiveTab('exports')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors relative ${
              activeTab === 'exports'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            Batch Exports
            {exportQueueCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-500 text-[10px] text-white flex items-center justify-center font-mono">
                {exportQueueCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </button>
        </nav>
      </div>

      {/* Right: Actions and Local Engine Indicators */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenEngineModal}
          title="Click to view Local Engine Diagnostics & Setup Guide"
          className={`flex items-center gap-2 px-2.5 py-1 rounded text-[11px] font-mono border transition-colors ${
            diagnostics?.isElectron
              ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
              : diagnostics?.isLocalServer
              ? 'bg-blue-950/80 border-blue-700 text-blue-300'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              diagnostics?.isElectron
                ? 'bg-emerald-400'
                : diagnostics?.isLocalServer
                ? 'bg-blue-400'
                : 'bg-purple-400'
            }`}
          />
          <span>
            {diagnostics?.isElectron
              ? 'Electron Native'
              : diagnostics?.isLocalServer
              ? 'Local Node + FFmpeg'
              : 'Local Engine: Ready'}
          </span>
        </button>

        <button
          onClick={onShowFFmpegModal}
          title="Inspect FFmpeg Commands"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
        >
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          <span>FFmpeg CLI</span>
        </button>

        <button
          onClick={onQuickExport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Video</span>
        </button>
      </div>
    </header>
  );
};
