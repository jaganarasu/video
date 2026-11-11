/**
 * Local Engine Service
 * Automatically negotiates between:
 * 1. Native Electron IPC Desktop Engine (Feature: electron-local-engine)
 * 2. Local Node.js + FFmpeg Server Engine (Full-Stack server.ts)
 * 3. Client Web Browser Engine (In-Browser HTML5 Canvas + MediaRecorder)
 */

declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean;
      selectVideoFile: () => Promise<{ path: string; name: string; size: number } | null>;
      runFFprobe: (filePath: string) => Promise<{ success: boolean; metadata?: any; error?: string }>;
      runFFmpeg: (payload: { command: string; jobId: string }) => Promise<{ success: boolean; code?: number; error?: string }>;
      onFFmpegProgress: (callback: (data: { jobId: string; raw: string }) => void) => () => void;
      openExportsFolder: () => Promise<boolean>;
      getSystemDiagnostics: () => Promise<any>;
    };
  }
}

export type EngineType = 'electron' | 'local-node' | 'web-browser';

export interface EngineDiagnostics {
  engineType: EngineType;
  isElectron: boolean;
  isLocalServer: boolean;
  ffmpegInstalled: boolean;
  ffprobeInstalled: boolean;
  ffmpegVersion?: string;
  ffprobeVersion?: string;
  dataDirectory: string;
  platform: string;
  nvencSupported: boolean;
  qsvSupported: boolean;
  details?: string;
}

export class LocalEngineService {
  private static instance: LocalEngineService;
  private currentEngine: EngineType = 'web-browser';
  private cachedDiagnostics: EngineDiagnostics | null = null;

  public static getInstance(): LocalEngineService {
    if (!LocalEngineService.instance) {
      LocalEngineService.instance = new LocalEngineService();
    }
    return LocalEngineService.instance;
  }

  /**
   * Detect and test available local processing engines
   */
  public async detectEngine(): Promise<EngineDiagnostics> {
    // 1. Check if running inside Electron Native Desktop
    if (typeof window !== 'undefined' && window.electronAPI?.isElectron) {
      this.currentEngine = 'electron';
      try {
        const diag = await window.electronAPI.getSystemDiagnostics();
        const result: EngineDiagnostics = {
          engineType: 'electron',
          isElectron: true,
          isLocalServer: false,
          ffmpegInstalled: !!diag.ffmpegInstalled,
          ffprobeInstalled: !!diag.ffprobeInstalled,
          ffmpegVersion: diag.ffmpegInstalled ? 'System FFmpeg Available' : 'FFmpeg not found in PATH',
          ffprobeVersion: diag.ffprobeInstalled ? 'System FFprobe Available' : 'FFprobe not found in PATH',
          dataDirectory: diag.storageDirs?.exports || 'D:\\LocalVideoStudio\\media\\exports',
          platform: diag.platform || 'win32',
          nvencSupported: true,
          qsvSupported: true,
          details: 'Connected via secure Electron IPC child process engine.',
        };
        this.cachedDiagnostics = result;
        return result;
      } catch (err: any) {
        console.warn('Electron diagnostic query failed:', err);
      }
    }

    // 2. Check if running with local Node.js server (server.ts)
    try {
      const res = await fetch('/api/engine/status', {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        this.currentEngine = 'local-node';
        const result: EngineDiagnostics = {
          engineType: 'local-node',
          isElectron: false,
          isLocalServer: true,
          ffmpegInstalled: !!data.ffmpeg?.installed,
          ffprobeInstalled: !!data.ffprobe?.installed,
          ffmpegVersion: data.ffmpeg?.version,
          ffprobeVersion: data.ffprobe?.version,
          dataDirectory: data.dataDirectory || 'D:\\LocalVideoStudio',
          platform: data.platform || 'local',
          nvencSupported: !!data.ffmpeg?.nvencSupported,
          qsvSupported: !!data.ffmpeg?.qsvSupported,
          details: 'Connected via full-stack Node.js Express local engine.',
        };
        this.cachedDiagnostics = result;
        return result;
      }
    } catch {
      // Local server endpoint not reachable, fallback to web browser engine
    }

    // 3. Fallback: Web Browser Engine
    this.currentEngine = 'web-browser';
    const webResult: EngineDiagnostics = {
      engineType: 'web-browser',
      isElectron: false,
      isLocalServer: false,
      ffmpegInstalled: false,
      ffprobeInstalled: false,
      ffmpegVersion: 'Browser Canvas + MediaRecorder Fallback',
      ffprobeVersion: 'HTML5 Video Metadata Engine',
      dataDirectory: 'Browser Memory / IndexedDB Cache',
      platform: typeof navigator !== 'undefined' ? navigator.platform : 'browser',
      nvencSupported: false,
      qsvSupported: false,
      details: 'Running in Web Sandbox mode with HTML5 Canvas video processing.',
    };
    this.cachedDiagnostics = webResult;
    return webResult;
  }

  public getEngineType(): EngineType {
    return this.currentEngine;
  }

  public getCachedDiagnostics(): EngineDiagnostics | null {
    return this.cachedDiagnostics;
  }

  /**
   * Run FFprobe metadata extraction
   */
  public async probeVideo(filePath: string): Promise<{ success: boolean; metadata?: any; error?: string }> {
    if (this.currentEngine === 'electron' && window.electronAPI) {
      return await window.electronAPI.runFFprobe(filePath);
    }

    if (this.currentEngine === 'local-node') {
      try {
        const res = await fetch('/api/engine/probe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filePath }),
        });
        return await res.json();
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    return {
      success: false,
      error: 'Direct filesystem FFprobe requires Electron or local Node server.',
    };
  }

  /**
   * Execute real local FFmpeg render
   */
  public async runFFmpegRender(command: string, jobId: string): Promise<{ success: boolean; jobId?: string; error?: string }> {
    if (this.currentEngine === 'electron' && window.electronAPI) {
      const res = await window.electronAPI.runFFmpeg({ command, jobId });
      return { success: res.success, jobId, error: res.error };
    }

    if (this.currentEngine === 'local-node') {
      try {
        const res = await fetch('/api/engine/render', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command, jobId }),
        });
        return await res.json();
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    return { success: false, error: 'Local FFmpeg execution not active' };
  }

  /**
   * Open exported folder in Windows Explorer
   */
  public async openExportsFolder(): Promise<void> {
    if (this.currentEngine === 'electron' && window.electronAPI) {
      await window.electronAPI.openExportsFolder();
    }
  }
}
