import React from 'react';
import {
  Film,
  Save,
  RotateCcw,
  RotateCw,
  Smartphone,
  Square,
  Monitor,
  Eye,
  Download,
  Sparkles,
  Maximize2,
  Grid,
} from 'lucide-react';
import { AspectRatioType, ProjectData } from '../../types';

interface EditorToolbarProps {
  project: ProjectData;
  onUpdateProject: (updater: (prev: ProjectData) => ProjectData) => void;
  onSave: () => void;
  onExport: () => void;
  showSafeZones: boolean;
  setShowSafeZones: (show: boolean) => void;
  isAiFramingActive: boolean;
  setIsAiFramingActive: (active: boolean) => void;
  canvasScale: number;
  setCanvasScale: (scale: number) => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  project,
  onUpdateProject,
  onSave,
  onExport,
  showSafeZones,
  setShowSafeZones,
  isAiFramingActive,
  setIsAiFramingActive,
  canvasScale,
  setCanvasScale,
}) => {
  const setAspectRatio = (ratio: AspectRatioType) => {
    onUpdateProject((prev) => ({
      ...prev,
      output: {
        ...prev.output,
        aspectRatio: ratio,
      },
    }));
  };

  return (
    <div className="h-12 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 select-none shrink-0 text-slate-200">
      {/* Left: Project Name & History */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={project.projectName}
          onChange={(e) => {
            const val = e.target.value;
            onUpdateProject((prev) => ({ ...prev, projectName: val }));
          }}
          className="bg-transparent hover:bg-slate-800/80 focus:bg-slate-950 px-2 py-1 rounded text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[240px] truncate"
          title="Click to rename project"
        />

        <div className="h-4 w-px bg-slate-800 mx-1" />

        <button
          onClick={onSave}
          title="Save Project (Ctrl+S)"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-slate-800 text-xs text-slate-300 transition-colors"
        >
          <Save className="w-3.5 h-3.5 text-blue-400" />
          <span>Save</span>
        </button>

        <div className="flex items-center gap-0.5">
          <button
            title="Undo"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            title="Redo"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center: Aspect Ratio Switcher (Section 2.3) */}
      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
        <button
          onClick={() => setAspectRatio('9:16')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
            project.output.aspectRatio === '9:16'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Vertical 9:16 (Shorts / Reels · 1080x1920)"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>9:16 Shorts</span>
        </button>

        <button
          onClick={() => setAspectRatio('1:1')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
            project.output.aspectRatio === '1:1'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Square 1:1 (Social Posts · 1080x1080)"
        >
          <Square className="w-3.5 h-3.5" />
          <span>1:1 Square</span>
        </button>

        <button
          onClick={() => setAspectRatio('16:9')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
            project.output.aspectRatio === '16:9'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Landscape 16:9 (YouTube HD · 1920x1080)"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>16:9 YouTube</span>
        </button>
      </div>

      {/* Right: AI Smart Framing, Safe Zones, Zoom Fit & Export */}
      <div className="flex items-center gap-2.5">
        {/* AI Framing Toggle */}
        <button
          onClick={() => {
            const next = !isAiFramingActive;
            setIsAiFramingActive(next);
            onUpdateProject((prev) => ({
              ...prev,
              aiTracking: {
                ...prev.aiTracking,
                enabled: next,
              },
            }));
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
            isAiFramingActive
              ? 'bg-purple-950/70 border-purple-500/80 text-purple-200'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Phase 2 AI Smart Zoom: automatically track active speaker"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isAiFramingActive ? 'text-purple-400' : ''}`} />
          <span>AI Auto-Frame</span>
        </button>

        {/* Safe Zones Toggle */}
        <button
          onClick={() => setShowSafeZones(!showSafeZones)}
          className={`p-1.5 rounded border text-xs transition-colors ${
            showSafeZones
              ? 'bg-slate-800 border-blue-500/80 text-blue-400'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle TikTok/Reels UI Safe Zones overlay"
        >
          <Grid className="w-3.5 h-3.5" />
        </button>

        {/* Canvas Fit Scaling Selector */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs">
          <span className="text-[10px] text-slate-400 mr-1.5">Zoom</span>
          <select
            value={canvasScale}
            onChange={(e) => setCanvasScale(parseFloat(e.target.value))}
            className="bg-transparent text-slate-200 focus:outline-none font-mono text-[11px]"
          >
            <option value="0.5" className="bg-slate-900">50%</option>
            <option value="0.75" className="bg-slate-900">75%</option>
            <option value="1.0" className="bg-slate-900">100%</option>
            <option value="1.25" className="bg-slate-900">125%</option>
          </select>
        </div>

        {/* Export CTA */}
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors ml-1"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>
    </div>
  );
};
