import React, { useState } from 'react';
import { X, Film, Smartphone, Square, Monitor, Plus, FolderOpen } from 'lucide-react';
import { AspectRatioType, CropMode, ProjectData, VideoSource } from '../../types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  library: VideoSource[];
  onCreateProject: (
    projectName: string,
    source: VideoSource,
    aspectRatio: AspectRatioType,
    cropMode: CropMode
  ) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  library,
  onCreateProject,
}) => {
  if (!isOpen) return null;

  const [projectName, setProjectName] = useState('New Video Clip Project');
  const [selectedSource, setSelectedSource] = useState<VideoSource>(library[0]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('9:16');
  const [cropMode, setCropMode] = useState<CropMode>('blur-bg');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSource) return;
    onCreateProject(projectName, selectedSource, aspectRatio, cropMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0e131f] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden select-none">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-blue-400" />
            <h3 className="text-base font-bold text-white tracking-tight">Create New Project</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Project Name */}
          <div>
            <label className="text-xs font-semibold text-slate-300">Project Name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 mt-1"
            />
          </div>

          {/* Select Source Video */}
          <div>
            <label className="text-xs font-semibold text-slate-300">Source Video File</label>
            <div className="space-y-1.5 mt-1.5 max-h-36 overflow-y-auto">
              {library.map((video) => (
                <div
                  key={video.id}
                  onClick={() => setSelectedSource(video)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between ${
                    selectedSource?.id === video.id
                      ? 'bg-blue-950/70 border-blue-500 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="truncate min-w-0">
                    <div className="font-semibold truncate">{video.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {video.formattedSize} · {video.resolution.width}x{video.resolution.height}
                    </div>
                  </div>
                  {video.isSample && (
                    <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-mono shrink-0 ml-2">
                      SAMPLE
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Primary Output Aspect Ratio */}
          <div>
            <label className="text-xs font-semibold text-slate-300">Target Aspect Ratio</label>
            <div className="grid grid-cols-3 gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => setAspectRatio('9:16')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs transition-colors ${
                  aspectRatio === '9:16'
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span className="font-semibold">9:16</span>
                <span className="text-[9px]">Shorts / Reels</span>
              </button>

              <button
                type="button"
                onClick={() => setAspectRatio('1:1')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs transition-colors ${
                  aspectRatio === '1:1'
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Square className="w-4 h-4" />
                <span className="font-semibold">1:1</span>
                <span className="text-[9px]">Square Posts</span>
              </button>

              <button
                type="button"
                onClick={() => setAspectRatio('16:9')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs transition-colors ${
                  aspectRatio === '16:9'
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span className="font-semibold">16:9</span>
                <span className="text-[9px]">YouTube HD</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors"
            >
              Start Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
