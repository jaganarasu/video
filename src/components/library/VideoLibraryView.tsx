import React, { useRef, useState } from 'react';
import {
  FolderOpen,
  Upload,
  Film,
  Play,
  HardDrive,
  Info,
  Clock,
  Layers,
  CheckCircle,
  FileCode,
  Music,
  Monitor,
} from 'lucide-react';
import { VideoSource } from '../../types';
import { formatBytes, formatDurationHuman } from '../../utils/timeFormat';
import { generateFFprobeCommand } from '../../utils/ffmpegGenerator';

interface VideoLibraryViewProps {
  library: VideoSource[];
  onImportVideoFile: (file: File) => void;
  onSelectVideoForNewProject: (video: VideoSource) => void;
}

export const VideoLibraryView: React.FC<VideoLibraryViewProps> = ({
  library,
  onImportVideoFile,
  onSelectVideoForNewProject,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoSource>(library[0] || null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImportVideoFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#0b0f17] text-slate-100">
      {/* Left Column: Media File List & Import Dropzone */}
      <div className="flex-1 flex flex-col border-r border-slate-800 overflow-y-auto p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-blue-400" />
              Local Media Library
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Original videos stored locally in <span className="font-mono text-slate-300">D:\LocalVideoStudio\media\originals</span>
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Local File</span>
          </button>
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
          accept="video/*"
          className="hidden"
        />

        {/* Drag & Drop Import Banner */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-xl p-5 flex items-center justify-center gap-4 text-center transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-950/30'
              : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-blue-400 shrink-0">
            <Upload className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-xs font-semibold text-white">Drop large local video files here</div>
            <div className="text-[11px] text-slate-400">
              Files starting from 1GB & larger than 5GB supported. MP4, MOV, MKV, WebM, AVI.
            </div>
          </div>
        </div>

        {/* Video Items List */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Available Media ({library.length})
          </div>

          {library.map((video) => {
            const isSelected = selectedVideo?.id === video.id;
            return (
              <div
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className={`cursor-pointer rounded-xl p-4 border transition-all flex items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-slate-800/80 border-blue-500/80 shadow-sm shadow-blue-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-blue-400 shrink-0 relative overflow-hidden">
                    <Film className="w-6 h-6 text-slate-400" />
                    {video.isSample && (
                      <span className="absolute bottom-0 inset-x-0 bg-blue-600 text-[8px] font-mono text-center text-white py-0.5">
                        SAMPLE
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate max-w-sm">
                      {video.name}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 font-mono">
                      <span>{video.formattedSize}</span>
                      <span>·</span>
                      <span>{formatDurationHuman(video.duration)}</span>
                      <span>·</span>
                      <span>{video.resolution.width}x{video.resolution.height}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectVideoForNewProject(video);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    Create Project
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Deep Metadata Inspector (FFprobe extracted) */}
      {selectedVideo && (
        <div className="w-full lg:w-[420px] bg-slate-900/90 border-l border-slate-800 flex flex-col overflow-y-auto p-6 space-y-6 shrink-0">
          <div>
            <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider font-mono">
              FFprobe Metadata Extraction
            </div>
            <h3 className="text-base font-bold text-white mt-1 break-all">
              {selectedVideo.name}
            </h3>
            <p className="text-xs font-mono text-slate-400 mt-1 break-all">
              {selectedVideo.path}
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Duration</span>
              </div>
              <div className="text-base font-bold font-mono text-white mt-1">
                {formatDurationHuman(selectedVideo.duration)}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                {selectedVideo.duration} seconds total
              </div>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Monitor className="w-3.5 h-3.5 text-slate-400" />
                <span>Resolution</span>
              </div>
              <div className="text-base font-bold font-mono text-white mt-1">
                {selectedVideo.resolution.width} × {selectedVideo.resolution.height}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                {selectedVideo.resolution.width >= 3840 ? '4K Ultra HD' : 'Full HD 1080p'}
              </div>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                <span>Filesize</span>
              </div>
              <div className="text-base font-bold font-mono text-white mt-1">
                {selectedVideo.formattedSize}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                Local disk allocated
              </div>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Music className="w-3.5 h-3.5 text-slate-400" />
                <span>Framerate</span>
              </div>
              <div className="text-base font-bold font-mono text-white mt-1">
                {selectedVideo.metadata.fps} FPS
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                Constant frame rate
              </div>
            </div>
          </div>

          {/* Technical Stream Information Table */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-300">Video & Audio Streams</div>
            <div className="bg-slate-950/90 rounded-lg border border-slate-800 p-3.5 space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Video Codec</span>
                <span className="text-emerald-400">{selectedVideo.metadata.codec}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Bitrate</span>
                <span className="text-slate-200">{selectedVideo.metadata.bitrate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Audio Codec</span>
                <span className="text-purple-400">{selectedVideo.metadata.audioCodec}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Audio Channels</span>
                <span className="text-slate-200">{selectedVideo.metadata.audioChannels} Channels (Stereo)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Sample Rate</span>
                <span className="text-slate-200">{selectedVideo.metadata.sampleRate} Hz</span>
              </div>
            </div>
          </div>

          {/* FFprobe extraction command */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5" />
              <span>Executed FFprobe Command</span>
            </div>
            <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-blue-300 overflow-x-auto whitespace-pre-wrap">
              {generateFFprobeCommand(selectedVideo.path)}
            </pre>
          </div>

          {/* CTA */}
          <div className="pt-2">
            <button
              onClick={() => onSelectVideoForNewProject(selectedVideo)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Create Project with this Video</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
