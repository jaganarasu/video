import React, { useEffect, useState } from 'react';
import {
  ActiveTab,
  AspectRatioType,
  CropMode,
  ExportJob,
  ProjectData,
  VideoSource,
} from './types';
import {
  loadAllProjects,
  loadCurrentProject,
  loadExportJobs,
  loadVideoLibrary,
  saveCurrentProject,
  saveExportJobs,
  saveVideoToLibrary,
} from './services/storageService';
import { VideoExportManager } from './services/exportService';
import { Header } from './components/common/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { VideoEditorView } from './components/editor/VideoEditorView';
import { VideoLibraryView } from './components/library/VideoLibraryView';
import { BatchExportView } from './components/export/BatchExportView';
import { SettingsView } from './components/settings/SettingsView';
import { NewProjectModal } from './components/modals/NewProjectModal';
import { FFmpegCommandModal } from './components/modals/FFmpegCommandModal';
import { formatBytes } from './utils/timeFormat';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('editor');
  const [project, setProject] = useState<ProjectData>(loadCurrentProject);
  const [allProjects, setAllProjects] = useState<ProjectData[]>(loadAllProjects);
  const [library, setLibrary] = useState<VideoSource[]>(loadVideoLibrary);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>(loadExportJobs);

  // Modals
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isFFmpegModalOpen, setIsFFmpegModalOpen] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Auto-save project whenever it changes
  useEffect(() => {
    saveCurrentProject(project);
  }, [project]);

  // Save export jobs whenever they change
  useEffect(() => {
    saveExportJobs(exportJobs);
  }, [exportJobs]);

  // Handle local video file import (drag & drop or browse)
  const handleImportVideoFile = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.src = objectUrl;

    tempVideo.onloadedmetadata = () => {
      const width = tempVideo.videoWidth || 1920;
      const height = tempVideo.videoHeight || 1080;
      const duration = tempVideo.duration || 60;

      const newSource: VideoSource = {
        id: 'vid_' + Math.random().toString(36).substring(2, 9),
        name: file.name,
        path: `D:\\LocalVideoStudio\\media\\originals\\${file.name}`,
        size: file.size,
        formattedSize: formatBytes(file.size),
        duration: Math.round(duration),
        resolution: { width, height },
        metadata: {
          width,
          height,
          duration: Math.round(duration),
          fps: 30,
          bitrate: `${Math.round((file.size * 8) / (duration * 1000000))} Mbps`,
          codec: file.type.includes('quicktime') ? 'prores / h264' : 'h264',
          audioCodec: 'aac',
          audioChannels: 2,
          sampleRate: 48000,
        },
        url: objectUrl,
        isSample: false,
      };

      saveVideoToLibrary(newSource);
      setLibrary((prev) => [newSource, ...prev]);

      // Automatically attach to current project or prompt
      setProject((prev) => ({
        ...prev,
        projectName: file.name.replace(/\.[^/.]+$/, '') + ' Clips',
        source: newSource,
      }));

      showToast(`Imported ${file.name} (${formatBytes(file.size)})`);
      setActiveTab('editor');
    };

    tempVideo.onerror = () => {
      // Fallback for file types browsers cannot probe directly
      const newSource: VideoSource = {
        id: 'vid_' + Math.random().toString(36).substring(2, 9),
        name: file.name,
        path: `D:\\LocalVideoStudio\\media\\originals\\${file.name}`,
        size: file.size,
        formattedSize: formatBytes(file.size),
        duration: 3600,
        resolution: { width: 1920, height: 1080 },
        metadata: {
          width: 1920,
          height: 1080,
          duration: 3600,
          fps: 30,
          bitrate: '8 Mbps',
          codec: 'h264',
          audioCodec: 'aac',
          audioChannels: 2,
          sampleRate: 48000,
        },
        url: objectUrl,
        isSample: false,
      };

      saveVideoToLibrary(newSource);
      setLibrary((prev) => [newSource, ...prev]);
      setProject((prev) => ({
        ...prev,
        projectName: file.name.replace(/\.[^/.]+$/, '') + ' Clips',
        source: newSource,
      }));

      showToast(`Imported ${file.name} (${formatBytes(file.size)})`);
      setActiveTab('editor');
    };
  };

  // Create new project handler
  const handleCreateNewProject = (
    projectName: string,
    source: VideoSource,
    aspectRatio: AspectRatioType,
    cropMode: CropMode
  ) => {
    const newProj: ProjectData = {
      id: 'proj_' + Math.random().toString(36).substring(2, 9),
      projectName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source,
      output: {
        format: 'mp4',
        resolution: '1080p',
        aspectRatio,
        cropMode,
        manualCrop: { x: 50, y: 50, scale: 1 },
        fps: 30,
        codec: 'libx264',
        audioCodec: 'aac',
        bitrate: 'auto',
      },
      clips: [
        {
          id: 'clip_01',
          name: 'Clip 01 (00:00 - 01:00)',
          startTime: 0,
          endTime: Math.min(60, source.duration),
          color: '#38bdf8',
          order: 1,
        },
      ],
      captions: [
        {
          id: 'cap_01',
          text: 'வணக்கம்! புதிய வீடியோ கிளிப் ஆரம்பம்.',
          startTime: 0,
          endTime: 4,
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
        },
      ],
      logo: {
        enabled: true,
        type: 'preset',
        src: '',
        position: 'top-right',
        customCoords: { x: 85, y: 10 },
        sizePercent: 12,
        opacity: 0.85,
        startTime: 0,
        endTime: source.duration,
      },
      watermark: {
        enabled: true,
        text: '@localvideostudio',
        opacity: 0.6,
        fontSize: 16,
        repeatGrid: false,
        position: 'bottom-right',
        color: '#ffffff',
      },
      overlays: [],
      zoomKeyframes: [
        {
          id: 'kf_0',
          time: 0,
          zoomPercent: 100,
          panX: 0,
          panY: 0,
          duration: 1,
          easing: 'smooth',
          label: 'Wide Shot',
        },
      ],
      aiTracking: {
        enabled: true,
        mode: 'auto-speaker',
        sensitivity: 'medium',
        speakerDetection: true,
        currentDetectedSpeaker: 1,
        speaker1Name: 'Host',
        speaker2Name: 'Guest',
      },
    };

    setProject(newProj);
    setAllProjects((prev) => [newProj, ...prev]);
    showToast(`Created project: ${projectName}`);
    setActiveTab('editor');
  };

  // Trigger export for project
  const handleTriggerExport = () => {
    const manager = VideoExportManager.getInstance();
    const newJobs = manager.createJobs(project);

    setExportJobs((prev) => [...newJobs, ...prev]);
    showToast(`Added ${newJobs.length} clips to batch export queue`);
    setActiveTab('exports');
  };

  // Start rendering all pending export jobs
  const handleStartAllExports = async () => {
    const manager = VideoExportManager.getInstance();
    const pending = exportJobs.filter((j) => j.status === 'pending');

    for (const job of pending) {
      await manager.startExportJob(job, project, null, (updatedJob) => {
        setExportJobs((prev) =>
          prev.map((j) => (j.id === updatedJob.id ? { ...updatedJob } : j))
        );
      });
    }

    showToast('Batch export finished!');
  };

  const handleCancelJob = (jobId: string) => {
    VideoExportManager.getInstance().cancelJob(jobId);
    setExportJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: 'cancelled' } : j))
    );
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0b0f17] text-slate-100 overflow-hidden font-sans">
      {/* App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        project={project}
        onOpenNewProject={() => setIsNewProjectModalOpen(true)}
        onShowFFmpegModal={() => setIsFFmpegModalOpen(true)}
        onQuickExport={handleTriggerExport}
        exportQueueCount={exportJobs.filter((j) => j.status === 'pending' || j.status === 'processing').length}
      />

      {/* Main Content Body */}
      <main className="flex-1 flex overflow-hidden relative">
        {activeTab === 'dashboard' && (
          <DashboardView
            currentProject={project}
            allProjects={allProjects}
            onSelectProject={(proj) => {
              setProject(proj);
              showToast(`Loaded: ${proj.projectName}`);
            }}
            onNewProject={() => setIsNewProjectModalOpen(true)}
            onImportVideoFile={handleImportVideoFile}
            exportJobs={exportJobs}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'editor' && (
          <VideoEditorView
            project={project}
            onUpdateProject={setProject}
            onSaveProject={() => {
              saveCurrentProject(project);
              showToast('Project saved locally');
            }}
            onTriggerExport={handleTriggerExport}
          />
        )}

        {activeTab === 'library' && (
          <VideoLibraryView
            library={library}
            onImportVideoFile={handleImportVideoFile}
            onSelectVideoForNewProject={(video) => {
              setProject((prev) => ({
                ...prev,
                projectName: video.name.replace(/\.[^/.]+$/, '') + ' Project',
                source: video,
              }));
              setActiveTab('editor');
              showToast(`Opened ${video.name} in editor`);
            }}
          />
        )}

        {activeTab === 'exports' && (
          <BatchExportView
            exportJobs={exportJobs}
            project={project}
            onStartAllExports={handleStartAllExports}
            onCancelJob={handleCancelJob}
            onShowFFmpegModal={() => setIsFFmpegModalOpen(true)}
          />
        )}

        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="absolute bottom-6 right-6 z-50 bg-slate-900 border border-blue-500/80 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        library={library}
        onCreateProject={handleCreateNewProject}
      />

      <FFmpegCommandModal
        isOpen={isFFmpegModalOpen}
        onClose={() => setIsFFmpegModalOpen(false)}
        project={project}
      />
    </div>
  );
}
