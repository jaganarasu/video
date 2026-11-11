import React, { useRef, useState } from 'react';
import {
  Film,
  Plus,
  Upload,
  Clock,
  HardDrive,
  CheckCircle2,
  Share2,
  Play,
  ArrowRight,
  Sparkles,
  FileVideo,
  Scissors,
  Layers,
  ChevronRight,
  Download,
} from 'lucide-react';
import { ActiveTab, ExportJob, ProjectData, VideoSource } from '../../types';
import { formatBytes, formatDurationHuman } from '../../utils/timeFormat';

interface DashboardViewProps {
  currentProject: ProjectData;
  allProjects: ProjectData[];
  onSelectProject: (project: ProjectData) => void;
  onNewProject: () => void;
  onImportVideoFile: (file: File) => void;
  exportJobs: ExportJob[];
  setActiveTab: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentProject,
  allProjects,
  onSelectProject,
  onNewProject,
  onImportVideoFile,
  exportJobs,
  setActiveTab,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImportVideoFile(e.dataTransfer.files[0]);
    }
  };

  const completedExports = exportJobs.filter((j) => j.status === 'completed');

  return (
    <div className="flex-1 overflow-y-auto bg-[#0b0f17] text-slate-100 p-6 space-y-6">
      {/* Top Banner / Welcome Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Local Video Studio
            </h1>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
              Offline First · Local Processing
            </span>
          </div>
          <p className="text-sm text-slate-400 max-w-2xl">
            Convert your long-form YouTube videos, podcasts, and interviews into multiple viral Shorts, Reels, and clips without uploading files to remote servers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fileInputRef.current?.click();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Import Local Video</span>
          </button>

          <button
            onClick={onNewProject}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Project</span>
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onImportVideoFile(e.target.files[0]);
          }
        }}
        accept="video/mp4,video/quicktime,video/x-matroska,video/webm,video/avi"
        className="hidden"
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Total Projects</div>
            <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
              {allProjects.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Current: <span className="text-blue-400 truncate max-w-[130px] inline-block align-bottom">{currentProject.projectName}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Processed Videos</div>
            <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
              {completedExports.length + 8}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Total clips rendered
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Local Storage (D:\)</div>
            <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
              38.4 GB
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              217.6 GB free on drive
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <HardDrive className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Active Clips</div>
            <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
              {currentProject.clips.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Ratio: <span className="font-mono text-slate-300">{currentProject.output.aspectRatio}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Scissors className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Drag & Drop + Current Project Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drag & Drop Import Card */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-950/20 scale-[0.99]'
              : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 mb-3 shadow-inner">
            <Upload className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-white">Import Local Video</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Drag and drop video files here or click to browse. Supports files over 1GB & 5GB.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4 text-[11px] font-mono text-slate-400">
            <span>MP4</span>
            <span>·</span>
            <span>MOV</span>
            <span>·</span>
            <span>MKV</span>
            <span>·</span>
            <span>WEBM</span>
            <span>·</span>
            <span>AVI</span>
          </div>
          <span className="mt-4 text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
            Browse Computer Files <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Current Active Project Spotlight Card */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <h3 className="text-sm font-semibold text-white">Active Project Ready to Edit</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {currentProject.output.aspectRatio} · {currentProject.output.resolution}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-base font-bold text-white">
                  {currentProject.projectName}
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>
                    <span className="text-slate-400">Source: </span>
                    <span className="font-mono text-slate-300 truncate max-w-xs inline-block align-bottom">{currentProject.source.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Duration: </span>
                    <span className="font-mono text-slate-300">{formatDurationHuman(currentProject.source.duration)}</span>
                    <span className="mx-1 text-slate-400">·</span>
                    <span className="font-mono text-slate-300">{currentProject.source.formattedSize}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Clips defined: </span>
                    <span className="font-mono text-blue-400 font-semibold">{currentProject.clips.length} clips</span>
                    <span className="mx-1 text-slate-400">·</span>
                    <span className="text-slate-400">Captions: </span>
                    <span className="font-mono text-purple-400 font-semibold">{currentProject.captions.length} lines</span>
                  </div>
                </div>
              </div>

              {/* Mini feature highlight */}
              <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80 text-xs space-y-1.5">
                <div className="font-medium text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Configured Automation:</span>
                </div>
                <div className="text-slate-400 space-y-1 text-[11px]">
                  <div>✓ Zoom Keyframes: {currentProject.zoomKeyframes.length} points (Two-Person switch)</div>
                  <div>✓ Auto Subtitles: Tamil & English Unicode</div>
                  <div>✓ Crop Mode: {currentProject.output.cropMode} (TikTok blur background)</div>
                  <div>✓ Branding: Watermark {currentProject.watermark.text}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Last saved: {new Date(currentProject.updatedAt).toLocaleTimeString()}
            </span>
            <button
              onClick={() => setActiveTab('editor')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Open in Video Editor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Projects Table / Grid */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileVideo className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-white">Recent Editing Projects</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {allProjects.length} saved projects
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {allProjects.map((proj) => (
            <div
              key={proj.id}
              className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-blue-400 shrink-0">
                  <Film className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white flex items-center gap-2">
                    <span>{proj.projectName}</span>
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                      {proj.output.aspectRatio}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="font-mono">{proj.source.name}</span>
                    <span>·</span>
                    <span className="font-mono">{proj.clips.length} clips</span>
                    <span>·</span>
                    <span className="font-mono">{proj.source.formattedSize}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className="text-xs text-slate-400 font-mono">
                  {new Date(proj.updatedAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => {
                    onSelectProject(proj);
                    setActiveTab('editor');
                  }}
                  className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <span>Open Project</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
