import React, { useState } from 'react';
import { X, Terminal, Copy, Check, FileCode, Download } from 'lucide-react';
import { ProjectData } from '../../types';
import {
  generateBatchScript,
  generateFFmpegClipCommand,
  generateFFprobeCommand,
} from '../../utils/ffmpegGenerator';

interface FFmpegCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectData;
}

export const FFmpegCommandModal: React.FC<FFmpegCommandModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  if (!isOpen) return null;

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sampleClip = project.clips[0] || {
    id: 'clip_sample',
    name: 'Sample Clip',
    startTime: 0,
    endTime: 60,
    color: '#38bdf8',
    order: 1,
  };

  const probeCmd = generateFFprobeCommand(project.source.path);
  const clipCmd = generateFFmpegClipCommand({
    inputPath: project.source.path,
    outputPath: `D:\\LocalVideoStudio\\media\\exports\\${project.projectName}_clip01.mp4`,
    startTime: sampleClip.startTime,
    duration: sampleClip.endTime - sampleClip.startTime,
    aspectRatio: project.output.aspectRatio,
    cropMode: project.output.cropMode,
    resolution: project.output.resolution,
    fps: project.output.fps,
    hasLogo: project.logo.enabled,
    logoPath: project.logo.src,
    logoPosition: project.logo.position,
    hasSubtitles: project.captions.length > 0,
    srtPath: `D:\\LocalVideoStudio\\media\\exports\\subtitles.srt`,
    watermarkText: project.watermark.enabled ? project.watermark.text : undefined,
  });

  const verticalBlurCmd = `ffmpeg -i "${project.source.path}" -filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5[bg];[0:v]scale=1080:1920:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2" -c:v libx264 -crf 22 -c:a aac output_shorts_blur.mp4`;

  const handleDownloadBat = () => {
    const script = generateBatchScript(project);
    const blob = new Blob([script], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BatchExport_${project.projectName.replace(/[^a-zA-Z0-9_-]/g, '_')}.bat`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#0e131f] border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden select-none">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                FFmpeg & FFprobe Terminal Commands
              </h3>
              <p className="text-[11px] text-slate-400">
                Exact Windows CMD / PowerShell commands generated according to technical specifications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadBat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .BAT Script</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Commands List */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Section A: Metadata */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span>A. Extract Video Metadata (JSON format)</span>
              <button
                onClick={() => handleCopy(probeCmd, 'probe')}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
              >
                {copiedId === 'probe' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>Copy</span>
              </button>
            </div>
            <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-blue-300 overflow-x-auto whitespace-pre-wrap">
              {probeCmd}
            </pre>
          </div>

          {/* Section B: Current Active Clip Command */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span>B. Split, Crop, Subtitle & Watermark Composite Command</span>
              <button
                onClick={() => handleCopy(clipCmd, 'clip')}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
              >
                {copiedId === 'clip' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>Copy</span>
              </button>
            </div>
            <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap">
              {clipCmd}
            </pre>
          </div>

          {/* Section C: Vertical Blurred Background Filter Complex */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span>C. TikTok / Reels Blur Background Filter (9:16)</span>
              <button
                onClick={() => handleCopy(verticalBlurCmd, 'blur')}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
              >
                {copiedId === 'blur' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>Copy</span>
              </button>
            </div>
            <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-purple-300 overflow-x-auto whitespace-pre-wrap">
              {verticalBlurCmd}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            Commands can be run directly in Windows Terminal, PowerShell, or Electron child_process.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
