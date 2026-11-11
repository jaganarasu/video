export type AspectRatioType = '9:16' | '1:1' | '16:9';
export type CropMode = 'center-crop' | 'auto-crop' | 'fit' | 'blur-bg' | 'manual';
export type CaptionLanguage = 'tamil' | 'english' | 'telugu' | 'malayalam';

export interface VideoMetadata {
  width: number;
  height: number;
  duration: number; // in seconds
  fps: number;
  bitrate: string;
  codec: string;
  audioCodec: string;
  audioChannels: number;
  sampleRate: number;
}

export interface VideoSource {
  id: string;
  name: string;
  path: string; // e.g. D:\Videos\interview.mp4
  size: number; // in bytes
  formattedSize: string;
  duration: number; // in seconds
  resolution: {
    width: number;
    height: number;
  };
  metadata: VideoMetadata;
  url: string; // Object URL or synthetic stream identifier
  isSample?: boolean;
  sampleType?: 'interview' | 'keynote';
}

export interface VideoClip {
  id: string;
  name: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  color: string;
  order: number;
  selected?: boolean;
}

export interface Caption {
  id: string;
  text: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  language: CaptionLanguage;
  style: {
    fontFamily: string;
    fontSize: number; // in px (preview relative)
    color: string;
    backgroundColor: string;
    backgroundOpacity: number;
    hasBackground: boolean;
    outlineColor: string;
    outlineWidth: number;
    shadow: boolean;
    position: 'bottom' | 'center' | 'top';
    customY?: number; // 0 to 100 percentage
  };
}

export interface LogoSettings {
  enabled: boolean;
  type: 'image' | 'preset';
  src: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'custom';
  customCoords: { x: number; y: number }; // percentage 0-100
  sizePercent: number; // 5% to 40%
  opacity: number; // 0.1 to 1.0
  startTime: number;
  endTime: number;
}

export interface WatermarkSettings {
  enabled: boolean;
  text: string;
  opacity: number;
  fontSize: number;
  repeatGrid: boolean;
  position: 'center' | 'bottom-right' | 'top-left';
  color: string;
}

export interface OverlayItem {
  id: string;
  type: 'emoji' | 'badge' | 'custom_image' | 'cta';
  content: string; // emoji character or SVG path or image src
  label: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  scale: number; // 0.5 to 3.0
  rotation: number; // degrees
  startTime: number;
  endTime: number;
}

export interface ZoomKeyframe {
  id: string;
  time: number; // in seconds
  zoomPercent: number; // 100 to 300%
  panX: number; // -100 to 100 (percentage offset)
  panY: number; // -100 to 100
  duration: number; // transition duration in seconds
  easing: 'linear' | 'smooth' | 'snap';
  label?: string; // e.g. "Person 1 (Host)", "Person 2 (Guest)", "Wide Both"
  targetSpeaker?: 1 | 2 | 'both';
}

export interface AISmartTracking {
  enabled: boolean;
  mode: 'auto-speaker' | 'face-center' | 'split-view';
  sensitivity: 'low' | 'medium' | 'high';
  speakerDetection: boolean;
  currentDetectedSpeaker: 1 | 2 | 'both';
  speaker1Name: string;
  speaker2Name: string;
}

export interface ProjectOutputSettings {
  format: 'mp4';
  resolution: '1080p' | '720p' | '4k';
  aspectRatio: AspectRatioType;
  cropMode: CropMode;
  manualCrop: {
    x: number;
    y: number;
    scale: number;
  };
  fps: 30 | 60;
  codec: 'libx264' | 'h264_nvenc';
  audioCodec: 'aac';
  bitrate: 'auto' | 'high' | 'medium';
}

export interface ProjectData {
  id: string;
  projectName: string;
  createdAt: string;
  updatedAt: string;
  source: VideoSource;
  output: ProjectOutputSettings;
  clips: VideoClip[];
  captions: Caption[];
  logo: LogoSettings;
  watermark: WatermarkSettings;
  overlays: OverlayItem[];
  zoomKeyframes: ZoomKeyframe[];
  aiTracking: AISmartTracking;
}

export interface ExportJob {
  id: string;
  projectId: string;
  projectName: string;
  clipId: string;
  clipName: string;
  startTime: number;
  endTime: number;
  duration: number;
  aspectRatio: AspectRatioType;
  cropMode: CropMode;
  resolution: string;
  format: string;
  fps: number;
  progress: number; // 0 to 100
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  outputFilename: string;
  estimatedRemainingSeconds: number;
  startedAt?: string;
  completedAt?: string;
  downloadUrl?: string;
  ffmpegCommand: string;
  error?: string;
}

export type ActiveTab = 'dashboard' | 'editor' | 'library' | 'exports' | 'settings';
