import React from 'react';
import {
  Share2,
  Play,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Download,
  Terminal,
  FileCode,
  Layers,
  StopCircle,
} from 'lucide-react';
import { ExportJob, ProjectData } from '../../types';
import { generateBatchScript } from '../../utils/ffmpegGenerator';

interface BatchExportViewProps {
  exportJobs: ExportJob[];
  project: ProjectData;
  onStartAllExports: () => void;
  onCancelJob: (jobId: string) => void;
  onShowFFmpegModal: () => void;
}

export const BatchExportView: React.FC<BatchExportViewProps> = ({
  exportJobs,
  project,
  onStartAllExports,
  onCancelJob,
  onShowFFmpegModal,
}) => {
  const pendingJobs = exportJobs.filter((j) => j.status === 'pending');
  const processingJobs = exportJobs.filter((j) => j.status === 'processing');
  const completedJobs = exportJobs.filter((j) => j.status === 'completed');

  const handleDownloadBatchScript = () => {
    const script = generateBatchScript(project);
    const blob = new Blob([script], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Export_${project.projectName.replace(/[^a-zA-Z0-9_-]/g, '_')}.bat`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0b0f17] text-slate-100 p-6 space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Batch Export Queue
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Local H.264 / AAC MP4 video rendering queue and batch FFmpeg runner
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadBatchScript}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            title="Download Windows .bat script for automated local FFmpeg export"
          >
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span>Download Windows .BAT</span>
          </button>

          <button
            onClick={onShowFFmpegModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Terminal className="w-4 h-4 text-blue-400" />
            <span>Inspect Commands</span>
          </button>

          <button
            onClick={onStartAllExports}
            disabled={exportJobs.length === 0 || processingJobs.length > 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Render All Clips</span>
          </button>
        </div>
      </div>

      {/* Queue Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">Total in Queue</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {exportJobs.length}
          </div>
        </div>
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <div className="text-xs text-blue-400">Processing</div>
          <div className="text-2xl font-bold font-mono text-blue-300 mt-1">
            {processingJobs.length}
          </div>
        </div>
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <div className="text-xs text-emerald-400">Completed</div>
          <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">
            {completedJobs.length}
          </div>
        </div>
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">Pending</div>
          <div className="text-2xl font-bold font-mono text-slate-300 mt-1">
            {pendingJobs.length}
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-400">
          <span>Clips in Render Queue</span>
          <span>Target Directory: D:\LocalVideoStudio\media\exports</span>
        </div>

        {exportJobs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Layers className="w-8 h-8 mx-auto text-slate-400" />
            <div className="text-sm font-semibold text-white">Queue is empty</div>
            <p className="text-xs max-w-sm mx-auto">
              Add clips in the Video Editor and click Export to populate the batch queue.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {exportJobs.map((job) => (
              <div key={job.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors">
                {/* Left Job Info */}
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-semibold text-white truncate">
                      {job.clipName}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {job.aspectRatio} · {job.resolution}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-blue-400">
                      {job.format.toUpperCase()} (H.264/AAC)
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 font-mono flex items-center gap-3">
                    <span>Duration: {Math.round(job.duration)}s</span>
                    <span>·</span>
                    <span className="truncate max-w-md">{job.outputFilename}</span>
                  </div>

                  {/* Progress Bar if processing */}
                  {job.status === 'processing' && (
                    <div className="space-y-1 pt-1 max-w-md">
                      <div className="flex justify-between text-[11px] font-mono text-slate-400">
                        <span>Rendering frames...</span>
                        <span className="text-blue-400 font-semibold">{job.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div
                          style={{ width: `${job.progress}%` }}
                          className="bg-blue-500 h-full rounded-full transition-all duration-200"
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Estimated remaining: ~{job.estimatedRemainingSeconds}s
                      </div>
                    </div>
                  )}

                  {job.error && (
                    <div className="text-xs text-rose-400 flex items-center gap-1.5 pt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{job.error}</span>
                    </div>
                  )}
                </div>

                {/* Right Status & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  {/* Status Badge */}
                  {job.status === 'pending' && (
                    <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Pending
                    </span>
                  )}

                  {job.status === 'processing' && (
                    <span className="text-xs font-mono text-blue-400 bg-blue-950/80 border border-blue-800/80 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                      Processing
                    </span>
                  )}

                  {job.status === 'completed' && (
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  )}

                  {job.status === 'cancelled' && (
                    <span className="text-xs font-mono text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5" />
                      Cancelled
                    </span>
                  )}

                  {/* Cancel Button if processing */}
                  {job.status === 'processing' && (
                    <button
                      onClick={() => onCancelJob(job.id)}
                      className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Cancel Export"
                    >
                      <StopCircle className="w-4 h-4" />
                    </button>
                  )}

                  {/* Download Video Button when completed */}
                  {job.downloadUrl && (
                    <a
                      href={job.downloadUrl}
                      download={job.outputFilename}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Clip</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
