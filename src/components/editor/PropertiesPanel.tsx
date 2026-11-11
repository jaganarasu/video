import React, { useRef } from 'react';
import {
  Scissors,
  Crop,
  Subtitles,
  Image as ImageIcon,
  Smile,
  ZoomIn,
  Plus,
  Trash2,
  Download,
  Upload,
  Sparkles,
  Sliders,
  Type,
  Palette,
  Layers,
  ArrowUp,
  ArrowDown,
  Check,
} from 'lucide-react';
import {
  Caption,
  CaptionLanguage,
  CropMode,
  ProjectData,
  VideoClip,
  ZoomKeyframe,
} from '../../types';
import { SidebarTab } from './EditorSidebar';
import { formatTimecode } from '../../utils/timeFormat';
import { downloadSRTFile, parseSRT } from '../../utils/srtParser';

interface PropertiesPanelProps {
  activeTab: SidebarTab;
  project: ProjectData;
  onUpdateProject: (updater: (prev: ProjectData) => ProjectData) => void;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  selectedClipId: string | null;
  setSelectedClipId: (id: string | null) => void;
  selectedCaptionId: string | null;
  setSelectedCaptionId: (id: string | null) => void;
  selectedKeyframeId: string | null;
  setSelectedKeyframeId: (id: string | null) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  activeTab,
  project,
  onUpdateProject,
  currentTime,
  setCurrentTime,
  selectedClipId,
  setSelectedClipId,
  selectedCaptionId,
  setSelectedCaptionId,
  selectedKeyframeId,
  setSelectedKeyframeId,
}) => {
  const srtInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------------
  // TAB 1: SPLIT & TRIMMING (Section 2.2)
  // -------------------------------------------------------------
  const renderSplitTab = () => {
    const handleSplitPreset = (seconds: number) => {
      const totalDur = project.source.duration;
      const newClips: VideoClip[] = [];
      const colors = ['#38bdf8', '#f43f5e', '#10b981', '#a855f7', '#f59e0b', '#ec4899'];
      let count = 1;

      for (let s = 0; s < totalDur; s += seconds) {
        const e = Math.min(totalDur, s + seconds);
        newClips.push({
          id: 'clip_' + Math.random().toString(36).substring(2, 8),
          name: `Clip ${String(count).padStart(2, '0')} (${formatTimecode(s, false)} - ${formatTimecode(e, false)})`,
          startTime: s,
          endTime: e,
          color: colors[(count - 1) % colors.length],
          order: count,
        });
        count++;
      }

      onUpdateProject((prev) => ({
        ...prev,
        clips: newClips,
      }));
    };

    const selectedClip = project.clips.find((c) => c.id === selectedClipId) || project.clips[0];

    return (
      <div className="space-y-5">
        <div>
          <div className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Auto Split Intervals
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Automatically slice long video into standard duration segments:
          </p>
          <div className="grid grid-cols-3 gap-2 mt-2.5">
            <button
              onClick={() => handleSplitPreset(60)}
              className="px-2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
            >
              1 Minute
            </button>
            <button
              onClick={() => handleSplitPreset(300)}
              className="px-2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
            >
              5 Minutes
            </button>
            <button
              onClick={() => handleSplitPreset(600)}
              className="px-2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
            >
              10 Minutes
            </button>
            <button
              onClick={() => handleSplitPreset(1800)}
              className="px-2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
            >
              30 Minutes
            </button>
            <button
              onClick={() => handleSplitPreset(3600)}
              className="px-2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
            >
              60 Minutes
            </button>
            <button
              onClick={() => {
                const userSec = prompt('Enter custom clip duration in seconds:', '45');
                if (userSec && !isNaN(parseInt(userSec))) {
                  handleSplitPreset(parseInt(userSec));
                }
              }}
              className="px-2 py-2 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-xs font-medium text-blue-300 border border-blue-500/40 transition-colors"
            >
              Custom...
            </button>
          </div>
        </div>

        {/* Selected Clip Properties */}
        {selectedClip && (
          <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Clip Properties</span>
              <button
                onClick={() => {
                  onUpdateProject((prev) => ({
                    ...prev,
                    clips: prev.clips.filter((c) => c.id !== selectedClip.id),
                  }));
                }}
                className="text-xs text-rose-400 hover:text-rose-300 p-1"
                title="Delete Clip"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400">Clip Name</label>
              <input
                type="text"
                value={selectedClip.name}
                onChange={(e) => {
                  const val = e.target.value;
                  onUpdateProject((prev) => ({
                    ...prev,
                    clips: prev.clips.map((c) => (c.id === selectedClip.id ? { ...c, name: val } : c)),
                  }));
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400">Start Time (sec)</label>
                <input
                  type="number"
                  value={Math.round(selectedClip.startTime)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    onUpdateProject((prev) => ({
                      ...prev,
                      clips: prev.clips.map((c) =>
                        c.id === selectedClip.id ? { ...c, startTime: val } : c
                      ),
                    }));
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 font-mono text-white text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400">End Time (sec)</label>
                <input
                  type="number"
                  value={Math.round(selectedClip.endTime)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    onUpdateProject((prev) => ({
                      ...prev,
                      clips: prev.clips.map((c) =>
                        c.id === selectedClip.id ? { ...c, endTime: val } : c
                      ),
                    }));
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 font-mono text-white text-xs mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 font-mono">
              <span>Duration:</span>
              <span className="text-white font-semibold">
                {Math.max(0, Math.round(selectedClip.endTime - selectedClip.startTime))}s
              </span>
            </div>
          </div>
        )}

        {/* Clip Sequence List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Clips Sequence ({project.clips.length})</span>
            <span className="text-[10px] text-slate-400">Export sequence</span>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {project.clips.map((clip, idx) => (
              <div
                key={clip.id}
                onClick={() => {
                  setSelectedClipId(clip.id);
                  setCurrentTime(clip.startTime);
                }}
                className={`cursor-pointer p-2 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                  selectedClipId === clip.id
                    ? 'bg-slate-800 border-blue-500 text-white'
                    : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: clip.color }}
                  />
                  <span className="truncate">{clip.name}</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400 shrink-0">
                  {formatTimecode(clip.startTime, false)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // TAB 2: CROP & ASPECT RATIOS (Section 2.3)
  // -------------------------------------------------------------
  const renderCropTab = () => {
    const cropModes: { id: CropMode; label: string; desc: string }[] = [
      { id: 'blur-bg', label: 'Blur Background', desc: 'Reels / Shorts style blurred backdrop' },
      { id: 'center-crop', label: 'Center Crop', desc: 'Fills target screen by cropping edges' },
      { id: 'fit', label: 'Fit with Letterbox', desc: 'Keeps entire original video with black bars' },
      { id: 'auto-crop', label: 'Auto Framing', desc: 'Adapts frame to video focal area' },
      { id: 'manual', label: 'Manual Pan & Scale', desc: 'Custom positioning controls' },
    ];

    return (
      <div className="space-y-5">
        <div>
          <div className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Framing & Crop Mode
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            How the original {project.source.resolution.width}x{project.source.resolution.height} video fits inside{' '}
            <strong className="text-blue-400">{project.output.aspectRatio}</strong>:
          </p>

          <div className="space-y-1.5 mt-3">
            {cropModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => {
                  onUpdateProject((prev) => ({
                    ...prev,
                    output: {
                      ...prev.output,
                      cropMode: mode.id,
                    },
                  }));
                }}
                className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                  project.output.cropMode === mode.id
                    ? 'bg-blue-950/60 border-blue-500 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="font-semibold flex items-center justify-between">
                  <span>{mode.label}</span>
                  {project.output.cropMode === mode.id && (
                    <Check className="w-3.5 h-3.5 text-blue-400" />
                  )}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{mode.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Pan & Zoom Sliders */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="text-xs font-semibold text-white">Manual Framing Sliders</div>

          {/* Scale */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Zoom Scale</span>
              <span className="font-mono text-white">
                {Math.round(project.output.manualCrop.scale * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={project.output.manualCrop.scale}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onUpdateProject((prev) => ({
                  ...prev,
                  output: {
                    ...prev.output,
                    manualCrop: { ...prev.output.manualCrop, scale: val },
                  },
                }));
              }}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Pan X */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Pan Horizontal (X)</span>
              <span className="font-mono text-white">{project.output.manualCrop.x}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={project.output.manualCrop.x}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                onUpdateProject((prev) => ({
                  ...prev,
                  output: {
                    ...prev.output,
                    manualCrop: { ...prev.output.manualCrop, x: val },
                  },
                }));
              }}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Pan Y */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Pan Vertical (Y)</span>
              <span className="font-mono text-white">{project.output.manualCrop.y}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={project.output.manualCrop.y}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                onUpdateProject((prev) => ({
                  ...prev,
                  output: {
                    ...prev.output,
                    manualCrop: { ...prev.output.manualCrop, y: val },
                  },
                }));
              }}
              className="w-full accent-blue-500"
            />
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // TAB 3: CAPTIONS EDITOR (Section 2.4 - Tamil, Telugu, English)
  // -------------------------------------------------------------
  const renderCaptionsTab = () => {
    const activeCaption = project.captions.find((c) => c.id === selectedCaptionId) || project.captions[0];

    const handleAddCaption = () => {
      const newCap: Caption = {
        id: 'cap_' + Math.random().toString(36).substring(2, 9),
        text: 'புதிய வசனம் / New Caption',
        startTime: currentTime,
        endTime: Math.min(project.source.duration, currentTime + 4),
        language: 'tamil',
        style: {
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 22,
          color: '#ffffff',
          backgroundColor: '#0f172a',
          backgroundOpacity: 0.85,
          hasBackground: true,
          outlineColor: '#000000',
          outlineWidth: 2,
          shadow: true,
          position: 'bottom',
        },
      };

      onUpdateProject((prev) => ({
        ...prev,
        captions: [...prev.captions, newCap].sort((a, b) => a.startTime - b.startTime),
      }));
      setSelectedCaptionId(newCap.id);
    };

    const handleImportSRT = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (content) {
            const parsed = parseSRT(content, 'tamil');
            onUpdateProject((prev) => ({
              ...prev,
              captions: parsed,
            }));
          }
        };
        reader.readAsText(file);
      }
    };

    const quickTamilPhrases = [
      'வணக்கம்!',
      'நண்பர்களே',
      'லைக் பண்ணுங்க',
      'ஷேர் பண்ணுங்க',
      'சப்ஸ்கிரைப்',
      'முக்கிய தகவல்',
    ];

    return (
      <div className="space-y-4">
        {/* SRT Import & Export Row */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => srtInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>Import SRT</span>
          </button>
          <input
            type="file"
            ref={srtInputRef}
            onChange={handleImportSRT}
            accept=".srt"
            className="hidden"
          />

          <button
            onClick={() => downloadSRTFile(project.captions, `${project.projectName}_captions.srt`)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export SRT</span>
          </button>
        </div>

        {/* Add Caption Button */}
        <button
          onClick={handleAddCaption}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Caption at Playhead ({formatTimecode(currentTime, false)})</span>
        </button>

        {/* Active Caption Editor */}
        {activeCaption && (
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Edit Subtitle</span>
              <button
                onClick={() => {
                  onUpdateProject((prev) => ({
                    ...prev,
                    captions: prev.captions.filter((c) => c.id !== activeCaption.id),
                  }));
                }}
                className="text-xs text-rose-400 hover:text-rose-300 p-1"
                title="Delete Caption"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Unicode Quick Phrases */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400">Quick Tamil Phrases:</span>
              <div className="flex flex-wrap gap-1">
                {quickTamilPhrases.map((phrase) => (
                  <button
                    key={phrase}
                    onClick={() => {
                      onUpdateProject((prev) => ({
                        ...prev,
                        captions: prev.captions.map((c) =>
                          c.id === activeCaption.id
                            ? { ...c, text: c.text ? `${c.text} ${phrase}` : phrase }
                            : c
                        ),
                      }));
                    }}
                    className="text-[10px] bg-slate-900 hover:bg-slate-800 px-1.5 py-0.5 rounded text-blue-300 border border-slate-800"
                  >
                    {phrase}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div>
              <textarea
                value={activeCaption.text}
                onChange={(e) => {
                  const val = e.target.value;
                  onUpdateProject((prev) => ({
                    ...prev,
                    captions: prev.captions.map((c) =>
                      c.id === activeCaption.id ? { ...c, text: val } : c
                    ),
                  }));
                }}
                rows={3}
                placeholder="Enter caption text (supports Tamil, Telugu, English Unicode)..."
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white focus:outline-none focus:border-blue-500 font-sans"
              />
            </div>

            {/* Timings */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <label className="text-[10px] text-slate-400 font-sans">Start (s)</label>
                <input
                  type="number"
                  step="0.5"
                  value={activeCaption.startTime}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    onUpdateProject((prev) => ({
                      ...prev,
                      captions: prev.captions.map((c) =>
                        c.id === activeCaption.id ? { ...c, startTime: val } : c
                      ),
                    }));
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-xs mt-0.5"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-sans">End (s)</label>
                <input
                  type="number"
                  step="0.5"
                  value={activeCaption.endTime}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    onUpdateProject((prev) => ({
                      ...prev,
                      captions: prev.captions.map((c) =>
                        c.id === activeCaption.id ? { ...c, endTime: val } : c
                      ),
                    }));
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-xs mt-0.5"
                />
              </div>
            </div>

            {/* Caption Styling Controls */}
            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-400">Position</span>
                <div className="flex gap-1">
                  {(['bottom', 'center', 'top'] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => {
                        onUpdateProject((prev) => ({
                          ...prev,
                          captions: prev.captions.map((c) =>
                            c.id === activeCaption.id
                              ? { ...c, style: { ...c.style, position: pos } }
                              : c
                          ),
                        }));
                      }}
                      className={`px-2 py-0.5 rounded capitalize text-[10px] ${
                        activeCaption.style.position === pos
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Color */}
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-400">Text Color</span>
                <input
                  type="color"
                  value={activeCaption.style.color}
                  onChange={(e) => {
                    const col = e.target.value;
                    onUpdateProject((prev) => ({
                      ...prev,
                      captions: prev.captions.map((c) =>
                        c.id === activeCaption.id
                          ? { ...c, style: { ...c.style, color: col } }
                          : c
                      ),
                    }));
                  }}
                  className="w-6 h-6 rounded bg-transparent cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Captions List */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {project.captions.map((cap) => (
            <div
              key={cap.id}
              onClick={() => {
                setSelectedCaptionId(cap.id);
                setCurrentTime(cap.startTime);
              }}
              className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between ${
                selectedCaptionId === cap.id
                  ? 'bg-slate-800 border-blue-500 text-white'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/40'
              }`}
            >
              <span className="truncate max-w-[170px]">{cap.text}</span>
              <span className="text-[10px] font-mono text-slate-400">
                {formatTimecode(cap.startTime, false)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // TAB 4: LOGO & WATERMARK (Section 2.5)
  // -------------------------------------------------------------
  const renderLogoTab = () => {
    return (
      <div className="space-y-5">
        {/* Logo Toggle & Settings */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Logo Branding</span>
            <input
              type="checkbox"
              checked={project.logo.enabled}
              onChange={(e) => {
                const checked = e.target.checked;
                onUpdateProject((prev) => ({
                  ...prev,
                  logo: { ...prev.logo, enabled: checked },
                }));
              }}
              className="accent-blue-500 rounded"
            />
          </div>

          {project.logo.enabled && (
            <>
              {/* Position Matrix */}
              <div>
                <label className="text-[11px] text-slate-400">Position Corner</label>
                <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                  {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map(
                    (corner) => (
                      <button
                        key={corner}
                        onClick={() => {
                          onUpdateProject((prev) => ({
                            ...prev,
                            logo: { ...prev.logo, position: corner },
                          }));
                        }}
                        className={`p-1.5 rounded text-[11px] capitalize border ${
                          project.logo.position === corner
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        {corner.replace('-', ' ')}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Opacity */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Opacity</span>
                  <span className="font-mono text-white">
                    {Math.round(project.logo.opacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={project.logo.opacity}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onUpdateProject((prev) => ({
                      ...prev,
                      logo: { ...prev.logo, opacity: val },
                    }));
                  }}
                  className="w-full accent-blue-500"
                />
              </div>
            </>
          )}
        </div>

        {/* Text Watermark Settings */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Text Watermark</span>
            <input
              type="checkbox"
              checked={project.watermark.enabled}
              onChange={(e) => {
                const checked = e.target.checked;
                onUpdateProject((prev) => ({
                  ...prev,
                  watermark: { ...prev.watermark, enabled: checked },
                }));
              }}
              className="accent-blue-500 rounded"
            />
          </div>

          {project.watermark.enabled && (
            <>
              <div>
                <label className="text-[11px] text-slate-400">Watermark Text</label>
                <input
                  type="text"
                  value={project.watermark.text}
                  onChange={(e) => {
                    const val = e.target.value;
                    onUpdateProject((prev) => ({
                      ...prev,
                      watermark: { ...prev.watermark, text: val },
                    }));
                  }}
                  placeholder="@creator_channel"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 mt-1 font-mono"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Watermark Transparency</span>
                  <span className="font-mono text-white">
                    {Math.round(project.watermark.opacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={project.watermark.opacity}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onUpdateProject((prev) => ({
                      ...prev,
                      watermark: { ...prev.watermark, opacity: val },
                    }));
                  }}
                  className="w-full accent-blue-500"
                />
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // TAB 5: STICKERS & OVERLAYS (Section 2.6)
  // -------------------------------------------------------------
  const renderStickersTab = () => {
    const presetStickers = [
      { type: 'badge' as const, content: '🔔 SUBSCRIBE', label: 'YouTube Subscribe' },
      { type: 'emoji' as const, content: '🔥', label: 'Fire Reaction' },
      { type: 'emoji' as const, content: '👍', label: 'Thumbs Up' },
      { type: 'badge' as const, content: '⭐ HIGHLIGHT', label: 'Highlight Callout' },
      { type: 'emoji' as const, content: '💯', label: '100 Score' },
      { type: 'badge' as const, content: '⚠️ BREAKING', label: 'Alert Tag' },
    ];

    const addSticker = (preset: typeof presetStickers[0]) => {
      const newOverlay = {
        id: 'ov_' + Math.random().toString(36).substring(2, 8),
        type: preset.type,
        content: preset.content,
        label: preset.label,
        x: 50,
        y: 40,
        scale: 1,
        rotation: 0,
        startTime: currentTime,
        endTime: Math.min(project.source.duration, currentTime + 6),
      };

      onUpdateProject((prev) => ({
        ...prev,
        overlays: [...prev.overlays, newOverlay],
      }));
    };

    return (
      <div className="space-y-4">
        <div className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
          Click to Add Overlay
        </div>
        <div className="grid grid-cols-2 gap-2">
          {presetStickers.map((sticker) => (
            <button
              key={sticker.label}
              onClick={() => addSticker(sticker)}
              className="p-3 bg-slate-950 border border-slate-800 hover:border-blue-500/60 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors"
            >
              <span className="text-xl">{sticker.content}</span>
              <span className="text-[10px] text-slate-300 font-medium">{sticker.label}</span>
            </button>
          ))}
        </div>

        {/* Existing Overlays List */}
        <div className="space-y-2 mt-4">
          <div className="text-xs font-semibold text-slate-400">
            Active Overlays ({project.overlays.length})
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {project.overlays.map((ov) => (
              <div
                key={ov.id}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span>{ov.content}</span>
                  <span className="text-slate-300">{ov.label}</span>
                </div>
                <button
                  onClick={() => {
                    onUpdateProject((prev) => ({
                      ...prev,
                      overlays: prev.overlays.filter((o) => o.id !== ov.id),
                    }));
                  }}
                  className="text-rose-400 hover:text-rose-300 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // TAB 6: DYNAMIC ZOOM KEYFRAMES (Section 2.7 - Two-Person Interview Framing)
  // -------------------------------------------------------------
  const renderZoomTab = () => {
    const keyframes = [...project.zoomKeyframes].sort((a, b) => a.time - b.time);
    const activeKf = keyframes.find((k) => k.id === selectedKeyframeId) || keyframes[0];

    const addKeyframePreset = (preset: 'host' | 'guest' | 'wide' | 'center') => {
      let zoomPercent = 165;
      let panX = 0;
      let panY = 0;
      let label = 'Custom Shot';
      let targetSpeaker: 1 | 2 | 'both' = 'both';

      if (preset === 'host') {
        zoomPercent = 165;
        panX = -45;
        label = 'Person 1 (Host)';
        targetSpeaker = 1;
      } else if (preset === 'guest') {
        zoomPercent = 165;
        panX = 45;
        label = 'Person 2 (Guest)';
        targetSpeaker = 2;
      } else if (preset === 'wide') {
        zoomPercent = 100;
        panX = 0;
        label = 'Wide Studio Shot';
        targetSpeaker = 'both';
      } else if (preset === 'center') {
        zoomPercent = 180;
        panX = 0;
        label = 'Center Close-up';
        targetSpeaker = 'both';
      }

      const newKf: ZoomKeyframe = {
        id: 'kf_' + Math.random().toString(36).substring(2, 8),
        time: Math.round(currentTime * 10) / 10,
        zoomPercent,
        panX,
        panY,
        duration: 1.2,
        easing: 'smooth',
        label,
        targetSpeaker,
      };

      onUpdateProject((prev) => ({
        ...prev,
        zoomKeyframes: [...prev.zoomKeyframes, newKf],
      }));
      setSelectedKeyframeId(newKf.id);
    };

    return (
      <div className="space-y-4">
        {/* Quick Framing Presets for Two-Person Interviews */}
        <div>
          <div className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Two-Person Interview Framing
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Create keyframe at current playhead position ({formatTimecode(currentTime, false)}):
          </p>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={() => addKeyframePreset('host')}
              className="p-2.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/60 border border-blue-500/60 text-xs font-semibold text-blue-200 transition-colors flex flex-col items-center text-center"
            >
              <span>Person 1 · Host</span>
              <span className="text-[10px] text-blue-400 font-normal mt-0.5">Pan Left (165%)</span>
            </button>

            <button
              onClick={() => addKeyframePreset('guest')}
              className="p-2.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/60 text-xs font-semibold text-rose-200 transition-colors flex flex-col items-center text-center"
            >
              <span>Person 2 · Guest</span>
              <span className="text-[10px] text-rose-400 font-normal mt-0.5">Pan Right (165%)</span>
            </button>

            <button
              onClick={() => addKeyframePreset('wide')}
              className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors flex flex-col items-center text-center"
            >
              <span>Wide Studio View</span>
              <span className="text-[10px] text-slate-400 font-normal mt-0.5">Both Speakers (100%)</span>
            </button>

            <button
              onClick={() => addKeyframePreset('center')}
              className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors flex flex-col items-center text-center"
            >
              <span>Center Close-up</span>
              <span className="text-[10px] text-slate-400 font-normal mt-0.5">180% Zoom</span>
            </button>
          </div>
        </div>

        {/* Selected Keyframe Inspector */}
        {activeKf && (
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">
                Keyframe @ {formatTimecode(activeKf.time, false)}
              </span>
              <button
                onClick={() => {
                  onUpdateProject((prev) => ({
                    ...prev,
                    zoomKeyframes: prev.zoomKeyframes.filter((k) => k.id !== activeKf.id),
                  }));
                }}
                className="text-xs text-rose-400 hover:text-rose-300 p-1"
                title="Delete Keyframe"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Label */}
            <div>
              <label className="text-[10px] text-slate-400">Shot Label</label>
              <input
                type="text"
                value={activeKf.label || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  onUpdateProject((prev) => ({
                    ...prev,
                    zoomKeyframes: prev.zoomKeyframes.map((k) =>
                      k.id === activeKf.id ? { ...k, label: val } : k
                    ),
                  }));
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white mt-1"
              />
            </div>

            {/* Zoom Percentage */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Zoom Level</span>
                <span className="font-mono text-white">{Math.round(activeKf.zoomPercent)}%</span>
              </div>
              <input
                type="range"
                min="100"
                max="300"
                value={activeKf.zoomPercent}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  onUpdateProject((prev) => ({
                    ...prev,
                    zoomKeyframes: prev.zoomKeyframes.map((k) =>
                      k.id === activeKf.id ? { ...k, zoomPercent: val } : k
                    ),
                  }));
                }}
                className="w-full accent-blue-500"
              />
            </div>

            {/* Pan X Slider */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Pan X (Left / Right)</span>
                <span className="font-mono text-white">{Math.round(activeKf.panX)}</span>
              </div>
              <input
                type="range"
                min="-80"
                max="80"
                value={activeKf.panX}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  onUpdateProject((prev) => ({
                    ...prev,
                    zoomKeyframes: prev.zoomKeyframes.map((k) =>
                      k.id === activeKf.id ? { ...k, panX: val } : k
                    ),
                  }));
                }}
                className="w-full accent-blue-500"
              />
            </div>
          </div>
        )}

        {/* Keyframe Timeline List */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {keyframes.map((kf) => (
            <div
              key={kf.id}
              onClick={() => {
                setSelectedKeyframeId(kf.id);
                setCurrentTime(kf.time);
              }}
              className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between ${
                selectedKeyframeId === kf.id
                  ? 'bg-slate-800 border-blue-500 text-white'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-amber-400 font-bold">◆</span>
                <span className="truncate">{kf.label || `Zoom ${kf.zoomPercent}%`}</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">
                {formatTimecode(kf.time, false)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <aside className="w-80 bg-[#0d121d] border-l border-slate-800 flex flex-col p-4 select-none shrink-0 overflow-y-auto z-20">
      {activeTab === 'split' && renderSplitTab()}
      {activeTab === 'crop' && renderCropTab()}
      {activeTab === 'captions' && renderCaptionsTab()}
      {activeTab === 'logo' && renderLogoTab()}
      {activeTab === 'stickers' && renderStickersTab()}
      {activeTab === 'zoom' && renderZoomTab()}
      {activeTab === 'media' && (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Active Video Source
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
            <div className="font-semibold text-white break-all">{project.source.name}</div>
            <div className="text-slate-400 font-mono text-[11px] break-all">{project.source.path}</div>
            <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800/80">
              <span>Size:</span>
              <span className="font-mono text-white">{project.source.formattedSize}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Resolution:</span>
              <span className="font-mono text-white">
                {project.source.resolution.width}x{project.source.resolution.height}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
