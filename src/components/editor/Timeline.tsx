import React, { useRef, useState } from 'react';
import {
  Scissors,
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Subtitles,
  Smile,
  ImageIcon,
  Sparkles,
} from 'lucide-react';
import { Caption, OverlayItem, ProjectData, VideoClip, ZoomKeyframe } from '../../types';
import { formatTimecode } from '../../utils/timeFormat';

interface TimelineProps {
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

export const Timeline: React.FC<TimelineProps> = ({
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
  const containerRef = useRef<HTMLDivElement>(null);
  // Pixels per second zoom factor (default: 4px per second, or 10px per second)
  const [pixelsPerSecond, setPixelsPerSecond] = useState<number>(8);
  const totalDuration = project.source.duration;
  const timelineWidth = Math.max(1200, totalDuration * pixelsPerSecond);

  // Handle click on timeline ruler or body to scrub playhead
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = Math.max(0, Math.min(totalDuration, clickX / pixelsPerSecond));
    setCurrentTime(newTime);
  };

  // Split Video Track at Current Playhead
  const handleSplitAtPlayhead = () => {
    // Find clip that encompasses currentTime
    const clipIndex = project.clips.findIndex(
      (c) => currentTime > c.startTime && currentTime < c.endTime
    );

    if (clipIndex === -1) return;

    const original = project.clips[clipIndex];
    const leftClip: VideoClip = {
      ...original,
      endTime: currentTime,
      name: `${original.name.split(' (')[0]} Part A`,
    };

    const rightClip: VideoClip = {
      id: 'clip_' + Math.random().toString(36).substring(2, 8),
      name: `${original.name.split(' (')[0]} Part B`,
      startTime: currentTime,
      endTime: original.endTime,
      color: '#f43f5e',
      order: original.order + 1,
    };

    const newClips = [...project.clips];
    newClips.splice(clipIndex, 1, leftClip, rightClip);

    onUpdateProject((prev) => ({
      ...prev,
      clips: newClips,
    }));
    setSelectedClipId(rightClip.id);
  };

  // Add Zoom Keyframe at Playhead
  const handleAddKeyframeAtPlayhead = () => {
    const newKf: ZoomKeyframe = {
      id: 'kf_' + Math.random().toString(36).substring(2, 8),
      time: Math.round(currentTime * 10) / 10,
      zoomPercent: 165,
      panX: 0,
      panY: 0,
      duration: 1.2,
      easing: 'smooth',
      label: `Zoom @ ${formatTimecode(currentTime, false)}`,
      targetSpeaker: 'both',
    };

    onUpdateProject((prev) => ({
      ...prev,
      zoomKeyframes: [...prev.zoomKeyframes, newKf],
    }));
    setSelectedKeyframeId(newKf.id);
  };

  // Playhead position in pixels
  const playheadX = currentTime * pixelsPerSecond;

  // Generate ruler markers every 10 or 30 seconds
  const rulerInterval = pixelsPerSecond >= 10 ? 5 : 15;
  const markerCount = Math.ceil(totalDuration / rulerInterval);

  return (
    <div className="h-64 bg-[#0a0e17] border-t border-slate-800 flex flex-col select-none shrink-0 z-20">
      {/* Top Timeline Controls Strip */}
      <div className="h-10 bg-[#0d121d] border-b border-slate-800 flex items-center justify-between px-4">
        {/* Left Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSplitAtPlayhead}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            title="Split clip at playhead (S)"
          >
            <Scissors className="w-3.5 h-3.5 text-blue-400" />
            <span>Split Cut (S)</span>
          </button>

          <button
            onClick={handleAddKeyframeAtPlayhead}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 border border-slate-700 transition-colors"
            title="Add Zoom Keyframe at playhead"
          >
            <span className="text-amber-400 font-bold">◆</span>
            <span>Add Keyframe</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            onClick={() => setCurrentTime(0)}
            className="px-2 py-1 rounded hover:bg-slate-800 text-xs text-slate-400 hover:text-slate-200 font-mono"
            title="Jump to Start"
          >
            00:00:00
          </button>
        </div>

        {/* Center: Current Playhead Readout */}
        <div className="font-mono text-xs text-blue-400 font-semibold tabular-nums">
          PLAYHEAD: {formatTimecode(currentTime, true)}
        </div>

        {/* Right: Timeline Zoom Scale */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPixelsPerSecond(Math.max(2, pixelsPerSecond - 2))}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            title="Zoom Out Timeline"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="text-[10px] font-mono text-slate-400 w-12 text-center">
            {pixelsPerSecond} px/s
          </span>

          <button
            onClick={() => setPixelsPerSecond(Math.min(30, pixelsPerSecond + 2))}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            title="Zoom In Timeline"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Multi-Track Scroll Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers (Left pinned labels) */}
        <div className="w-32 bg-[#090d16] border-r border-slate-800 flex flex-col shrink-0 text-xs font-medium text-slate-400 divide-y divide-slate-800/60 z-10">
          <div className="h-6 flex items-center px-3 text-[10px] uppercase font-mono text-slate-400">
            Timecode
          </div>
          <div className="h-10 flex items-center px-3 gap-1.5 text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Video Track</span>
          </div>
          <div className="h-7 flex items-center px-3 gap-1.5 text-slate-400">
            <span>Audio Wave</span>
          </div>
          <div className="h-8 flex items-center px-3 gap-1.5 text-purple-400">
            <Subtitles className="w-3.5 h-3.5" />
            <span>Captions</span>
          </div>
          <div className="h-7 flex items-center px-3 gap-1.5 text-amber-400">
            <span className="font-bold">◆</span>
            <span>Zoom Pan</span>
          </div>
          <div className="h-7 flex items-center px-3 gap-1.5 text-rose-400">
            <Smile className="w-3.5 h-3.5" />
            <span>Overlays</span>
          </div>
        </div>

        {/* Scrollable Tracks Canvas & Playhead Container */}
        <div
          ref={containerRef}
          className="flex-1 overflow-x-auto overflow-y-hidden relative bg-[#060a12]"
        >
          <div
            style={{ width: `${timelineWidth}px` }}
            className="h-full relative divide-y divide-slate-800/40"
            onClick={handleTimelineClick}
          >
            {/* 1. Time Ruler */}
            <div className="h-6 bg-slate-950/90 relative border-b border-slate-800">
              {Array.from({ length: markerCount }).map((_, i) => {
                const markSec = i * rulerInterval;
                const markX = markSec * pixelsPerSecond;
                return (
                  <div
                    key={i}
                    style={{ left: `${markX}px` }}
                    className="absolute top-0 bottom-0 border-l border-slate-800 pl-1 text-[9px] font-mono text-slate-400 select-none flex items-center"
                  >
                    {formatTimecode(markSec, false)}
                  </div>
                );
              })}
            </div>

            {/* 2. Video Track */}
            <div className="h-10 bg-slate-900/40 relative flex items-center">
              {project.clips.map((clip) => {
                const left = clip.startTime * pixelsPerSecond;
                const width = Math.max(10, (clip.endTime - clip.startTime) * pixelsPerSecond);
                const isSelected = selectedClipId === clip.id;

                return (
                  <div
                    key={clip.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedClipId(clip.id);
                    }}
                    style={{
                      left: `${left}px`,
                      width: `${width}px`,
                    }}
                    className={`absolute h-8 rounded border px-2 flex items-center justify-between text-xs font-semibold cursor-pointer transition-all overflow-hidden ${
                      isSelected
                        ? 'border-white shadow-md z-10'
                        : 'border-slate-700/80 hover:brightness-110'
                    }`}
                  >
                    {/* Background color strip */}
                    <div
                      className="absolute inset-0 opacity-80"
                      style={{ backgroundColor: clip.color }}
                    />
                    <span className="relative z-10 text-white drop-shadow truncate text-[11px]">
                      {clip.name}
                    </span>
                    <span className="relative z-10 text-white/80 font-mono text-[9px] drop-shadow shrink-0 ml-1">
                      {Math.round(clip.endTime - clip.startTime)}s
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 3. Audio Waveform Track */}
            <div className="h-7 bg-slate-950/60 relative flex items-center overflow-hidden px-1">
              <svg
                width={timelineWidth}
                height="24"
                className="opacity-40"
                xmlns="http://www.w3.org/2000/svg"
              >
                {Array.from({ length: Math.floor(timelineWidth / 4) }).map((_, idx) => {
                  const h = Math.abs(Math.sin(idx * 0.4) * Math.cos(idx * 0.15)) * 18 + 2;
                  return (
                    <rect
                      key={idx}
                      x={idx * 4}
                      y={(24 - h) / 2}
                      width="2"
                      height={h}
                      fill="#38bdf8"
                    />
                  );
                })}
              </svg>
            </div>

            {/* 4. Captions Track */}
            <div className="h-8 bg-slate-900/30 relative flex items-center">
              {project.captions.map((cap) => {
                const left = cap.startTime * pixelsPerSecond;
                const width = Math.max(14, (cap.endTime - cap.startTime) * pixelsPerSecond);
                const isSelected = selectedCaptionId === cap.id;

                return (
                  <div
                    key={cap.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCaptionId(cap.id);
                      setCurrentTime(cap.startTime);
                    }}
                    style={{
                      left: `${left}px`,
                      width: `${width}px`,
                    }}
                    className={`absolute h-6 rounded bg-purple-950/80 border text-[10px] text-purple-200 px-2 flex items-center truncate cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-purple-400 bg-purple-900 text-white shadow-sm'
                        : 'border-purple-800/80 hover:bg-purple-900/60'
                    }`}
                  >
                    <span className="truncate">{cap.text}</span>
                  </div>
                );
              })}
            </div>

            {/* 5. Zoom Keyframes Track */}
            <div className="h-7 bg-slate-950/40 relative flex items-center">
              {project.zoomKeyframes.map((kf) => {
                const left = kf.time * pixelsPerSecond;
                const isSelected = selectedKeyframeId === kf.id;

                return (
                  <div
                    key={kf.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedKeyframeId(kf.id);
                      setCurrentTime(kf.time);
                    }}
                    style={{ left: `${left}px` }}
                    className={`absolute -translate-x-1/2 flex items-center gap-1 cursor-pointer p-0.5 rounded transition-transform hover:scale-125 ${
                      isSelected ? 'scale-125 z-10' : ''
                    }`}
                    title={`${kf.label || 'Zoom'} (${formatTimecode(kf.time, false)})`}
                  >
                    <span className="text-amber-400 text-sm font-bold leading-none">◆</span>
                    <span className="text-[9px] font-mono text-amber-200 bg-amber-950/80 px-1 rounded hidden sm:inline">
                      {Math.round(kf.zoomPercent)}%
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 6. Overlays / Stickers Track */}
            <div className="h-7 bg-slate-900/30 relative flex items-center">
              {project.overlays.map((ov) => {
                const left = ov.startTime * pixelsPerSecond;
                const width = Math.max(12, (ov.endTime - ov.startTime) * pixelsPerSecond);

                return (
                  <div
                    key={ov.id}
                    style={{ left: `${left}px`, width: `${width}px` }}
                    className="absolute h-5 rounded bg-rose-950/80 border border-rose-800/80 text-[10px] text-rose-200 px-1.5 flex items-center gap-1 truncate cursor-pointer"
                  >
                    <span>{ov.content}</span>
                    <span className="truncate">{ov.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Playhead Red Needle */}
            <div
              style={{ left: `${playheadX}px` }}
              className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-30 pointer-events-none"
            >
              {/* Playhead Head Marker */}
              <div className="w-3 h-3 bg-rose-500 rotate-45 -translate-x-[5px] -translate-y-1 shadow-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
