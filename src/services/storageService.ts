import { ExportJob, ProjectData, VideoSource } from '../types';

const STORAGE_KEYS = {
  CURRENT_PROJECT: 'lvs_current_project',
  ALL_PROJECTS: 'lvs_all_projects',
  VIDEO_LIBRARY: 'lvs_video_library',
  EXPORT_JOBS: 'lvs_export_jobs',
  SETTINGS: 'lvs_app_settings',
};

export const DEFAULT_SAMPLE_VIDEO: VideoSource = {
  id: 'vid_sample_podcast',
  name: 'tech_podcast_ep42_tamil_eng.mp4',
  path: 'D:\\LocalVideoStudio\\media\\originals\\tech_podcast_ep42_tamil_eng.mp4',
  size: 3435973836, // ~3.2 GB
  formattedSize: '3.20 GB',
  duration: 3600, // 60 minutes
  resolution: {
    width: 1920,
    height: 1080,
  },
  metadata: {
    width: 1920,
    height: 1080,
    duration: 3600,
    fps: 30,
    bitrate: '8.4 Mbps',
    codec: 'h264 (High)',
    audioCodec: 'aac (LC)',
    audioChannels: 2,
    sampleRate: 48000,
  },
  url: 'synthetic:interview',
  isSample: true,
  sampleType: 'interview',
};

export const INITIAL_PROJECT: ProjectData = {
  id: 'proj_interview_highlights',
  projectName: 'Tech Interview Highlights (Shorts & Reels)',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  source: DEFAULT_SAMPLE_VIDEO,
  output: {
    format: 'mp4',
    resolution: '1080p',
    aspectRatio: '9:16',
    cropMode: 'blur-bg',
    manualCrop: { x: 50, y: 50, scale: 1 },
    fps: 30,
    codec: 'libx264',
    audioCodec: 'aac',
    bitrate: 'auto',
  },
  clips: [
    {
      id: 'clip_01',
      name: 'Clip 01 · Tamil Hook & Welcome',
      startTime: 0,
      endTime: 60,
      color: '#38bdf8',
      order: 1,
      selected: true,
    },
    {
      id: 'clip_02',
      name: 'Clip 02 · Guest Priya Deep Dive',
      startTime: 60,
      endTime: 120,
      color: '#f43f5e',
      order: 2,
    },
    {
      id: 'clip_03',
      name: 'Clip 03 · AI Video Future Debate',
      startTime: 120,
      endTime: 180,
      color: '#10b981',
      order: 3,
    },
    {
      id: 'clip_04',
      name: 'Clip 04 · Two-Person Switch Final',
      startTime: 180,
      endTime: 240,
      color: '#a855f7',
      order: 4,
    },
  ],
  captions: [
    {
      id: 'cap_01',
      text: 'வணக்கம் நண்பர்களே! Local Video Studio-க்கு நல்வரவு.',
      startTime: 0,
      endTime: 5.5,
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
    {
      id: 'cap_02',
      text: 'Today we are exploring automated video clipping for YouTube Shorts!',
      startTime: 5.5,
      endTime: 11,
      language: 'english',
      style: {
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 22,
        color: '#fef08a',
        backgroundColor: '#0f172a',
        backgroundOpacity: 0.85,
        hasBackground: true,
        outlineColor: '#000000',
        outlineWidth: 2,
        shadow: true,
        position: 'bottom',
      },
    },
    {
      id: 'cap_03',
      text: 'இரண்டு பேர் பேசும் நேர்காணல்களை சுலபமாக வெட்டலாம்.',
      startTime: 11,
      endTime: 17,
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
    {
      id: 'cap_04',
      text: 'Notice how dynamic zoom switches automatically between speakers!',
      startTime: 17,
      endTime: 24,
      language: 'english',
      style: {
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 22,
        color: '#38bdf8',
        backgroundColor: '#0f172a',
        backgroundOpacity: 0.85,
        hasBackground: true,
        outlineColor: '#000000',
        outlineWidth: 2,
        shadow: true,
        position: 'bottom',
      },
    },
    {
      id: 'cap_05',
      text: 'அழகான தமிழ் சப்டைட்டில்களுடன் எக்ஸ்போர்ட் செய்யலாம்.',
      startTime: 24,
      endTime: 30,
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
    src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%232563eb"/><path d="M35 25 L75 50 L35 75 Z" fill="white"/></svg>',
    position: 'top-right',
    customCoords: { x: 85, y: 10 },
    sizePercent: 12,
    opacity: 0.85,
    startTime: 0,
    endTime: 3600,
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
  overlays: [
    {
      id: 'ov_subscribe',
      type: 'badge',
      content: '🔔 SUBSCRIBE',
      label: 'Subscribe Callout',
      x: 50,
      y: 20,
      scale: 1,
      rotation: 0,
      startTime: 3,
      endTime: 10,
    },
    {
      id: 'ov_fire',
      type: 'emoji',
      content: '🔥',
      label: 'Fire Reaction',
      x: 80,
      y: 75,
      scale: 1.2,
      rotation: 5,
      startTime: 12,
      endTime: 20,
    },
  ],
  zoomKeyframes: [
    {
      id: 'kf_0',
      time: 0,
      zoomPercent: 100,
      panX: 0,
      panY: 0,
      duration: 1,
      easing: 'smooth',
      label: 'Wide Both (00:00 - 00:10)',
      targetSpeaker: 'both',
    },
    {
      id: 'kf_1',
      time: 10,
      zoomPercent: 165,
      panX: -45,
      panY: 5,
      duration: 1.2,
      easing: 'smooth',
      label: 'Zoom into Person 1 (Host)',
      targetSpeaker: 1,
    },
    {
      id: 'kf_2',
      time: 20,
      zoomPercent: 165,
      panX: 45,
      panY: 5,
      duration: 1.2,
      easing: 'smooth',
      label: 'Zoom into Person 2 (Guest)',
      targetSpeaker: 2,
    },
    {
      id: 'kf_3',
      time: 30,
      zoomPercent: 100,
      panX: 0,
      panY: 0,
      duration: 1.2,
      easing: 'smooth',
      label: 'Zoom out to Both',
      targetSpeaker: 'both',
    },
    {
      id: 'kf_4',
      time: 40,
      zoomPercent: 170,
      panX: -45,
      panY: 5,
      duration: 1.2,
      easing: 'smooth',
      label: 'Focus on Person 1 (Host)',
      targetSpeaker: 1,
    },
  ],
  aiTracking: {
    enabled: true,
    mode: 'auto-speaker',
    sensitivity: 'medium',
    speakerDetection: true,
    currentDetectedSpeaker: 1,
    speaker1Name: 'Host (Karthik)',
    speaker2Name: 'Guest (Priya)',
  },
};

export function loadCurrentProject(): ProjectData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_PROJECT);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading project from localStorage:', err);
  }
  return INITIAL_PROJECT;
}

export function saveCurrentProject(project: ProjectData) {
  try {
    const updated = { ...project, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.CURRENT_PROJECT, JSON.stringify(updated));

    // Also update in all projects list
    const all = loadAllProjects();
    const idx = all.findIndex((p) => p.id === updated.id);
    if (idx >= 0) {
      all[idx] = updated;
    } else {
      all.unshift(updated);
    }
    localStorage.setItem(STORAGE_KEYS.ALL_PROJECTS, JSON.stringify(all));
  } catch (err) {
    console.error('Error saving project to localStorage:', err);
  }
}

export function loadAllProjects(): ProjectData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ALL_PROJECTS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading all projects:', err);
  }
  return [INITIAL_PROJECT];
}

export function loadVideoLibrary(): VideoSource[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VIDEO_LIBRARY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading video library:', err);
  }
  return [
    DEFAULT_SAMPLE_VIDEO,
    {
      id: 'vid_sample_keynote',
      name: 'developer_keynote_2026.mp4',
      path: 'D:\\LocalVideoStudio\\media\\originals\\developer_keynote_2026.mp4',
      size: 5410652160, // 5.04 GB
      formattedSize: '5.04 GB',
      duration: 5400, // 90 mins
      resolution: {
        width: 3840,
        height: 2160,
      },
      metadata: {
        width: 3840,
        height: 2160,
        duration: 5400,
        fps: 60,
        bitrate: '14.2 Mbps',
        codec: 'hevc / h265',
        audioCodec: 'aac',
        audioChannels: 2,
        sampleRate: 48000,
      },
      url: 'synthetic:keynote',
      isSample: true,
      sampleType: 'keynote',
    },
  ];
}

export function saveVideoToLibrary(video: VideoSource) {
  try {
    const library = loadVideoLibrary();
    const idx = library.findIndex((v) => v.id === video.id);
    if (idx >= 0) {
      library[idx] = video;
    } else {
      library.unshift(video);
    }
    localStorage.setItem(STORAGE_KEYS.VIDEO_LIBRARY, JSON.stringify(library));
  } catch (err) {
    console.error('Error saving video to library:', err);
  }
}

export function loadExportJobs(): ExportJob[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPORT_JOBS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading export jobs:', err);
  }
  return [];
}

export function saveExportJobs(jobs: ExportJob[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPORT_JOBS, JSON.stringify(jobs));
  } catch (err) {
    console.error('Error saving export jobs:', err);
  }
}

export function downloadProjectJSON(project: ProjectData) {
  const jsonString = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.projectName.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
