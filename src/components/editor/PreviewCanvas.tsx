import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Sparkles,
  Smartphone,
  Check,
} from 'lucide-react';
import { AspectRatioType, ProjectData } from '../../types';
import { formatTimecode } from '../../utils/timeFormat';
import { drawInterviewFrame } from '../../utils/videoSynthesizer';

interface PreviewCanvasProps {
  project: ProjectData;
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  showSafeZones: boolean;
  canvasScale: number;
  onAddKeyframeAtCurrentTime?: () => void;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  project,
  currentTime,
  setCurrentTime,
  isPlaying,
  setIsPlaying,
  showSafeZones,
  canvasScale,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const blurCanvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameId = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Playback Loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setCurrentTime((prev) => {
        const next = prev + dt * playbackSpeed;
        if (next >= project.source.duration) {
          setIsPlaying(false);
          return 0;
        }
        return next;
      });

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isPlaying, playbackSpeed, project.source.duration]);

  // Compute live zoom & pan from keyframes
  const computeKeyframeInterpolation = (time: number) => {
    const kfs = [...project.zoomKeyframes].sort((a, b) => a.time - b.time);
    if (kfs.length === 0) return { zoom: 100, panX: 0, panY: 0, activeSpeaker: 'both' as const };

    // Find bounding keyframes
    let prev = kfs[0];
    let next = kfs[0];

    for (let i = 0; i < kfs.length; i++) {
      if (kfs[i].time <= time) {
        prev = kfs[i];
      }
      if (kfs[i].time > time) {
        next = kfs[i];
        break;
      }
    }

    if (prev === next || time >= next.time) {
      return {
        zoom: prev.zoomPercent,
        panX: prev.panX,
        panY: prev.panY,
        activeSpeaker: prev.targetSpeaker || 'both',
      };
    }

    // Interpolate between prev and next
    const span = Math.max(0.1, prev.duration || 1);
    const progress = Math.min(1, Math.max(0, (time - prev.time) / span));

    // Smooth easing
    const eased = 0.5 - Math.cos(progress * Math.PI) / 2;

    const zoom = prev.zoomPercent + (next.zoomPercent - prev.zoomPercent) * eased;
    const panX = prev.panX + (next.panX - prev.panX) * eased;
    const panY = prev.panY + (next.panY - prev.panY) * eased;

    return {
      zoom,
      panX,
      panY,
      activeSpeaker: progress > 0.5 ? (next.targetSpeaker || 'both') : (prev.targetSpeaker || 'both'),
    };
  };

  const { zoom, panX, panY, activeSpeaker } = computeKeyframeInterpolation(currentTime);

  // Render to Canvas
  useEffect(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Clear background
    ctx.fillStyle = '#050811';
    ctx.fillRect(0, 0, w, h);

    // 1. Draw Blurred Background if blur-bg mode is active
    if (project.output.cropMode === 'blur-bg' && project.output.aspectRatio !== '16:9') {
      const bCanvas = blurCanvasRef.current;
      if (bCanvas) {
        const bCtx = bCanvas.getContext('2d');
        if (bCtx) {
          drawInterviewFrame(bCtx, 640, 360, {
            currentTime,
            duration: project.source.duration,
            activeSpeaker: 'both',
            zoomPercent: 100,
            panX: 0,
            panY: 0,
          });

          ctx.save();
          ctx.filter = 'blur(28px) brightness(0.55)';
          ctx.drawImage(bCanvas, -w * 0.25, -h * 0.1, w * 1.5, h * 1.2);
          ctx.filter = 'none';
          ctx.restore();
        }
      }
    }

    // 2. Render Main Video with live Zoom & Pan
    const sourceW = 1920;
    const sourceH = 1080;

    let baseScale = 1;
    if (project.output.aspectRatio === '9:16') {
      baseScale = project.output.cropMode === 'fit'
        ? w / sourceW
        : h / sourceH; // fill/crop mode
    } else if (project.output.aspectRatio === '1:1') {
      baseScale = project.output.cropMode === 'fit'
        ? w / sourceW
        : h / sourceH;
    } else {
      baseScale = w / sourceW;
    }

    const effectiveZoom = (zoom / 100) * baseScale;
    const scaledW = sourceW * effectiveZoom;
    const scaledH = sourceH * effectiveZoom;

    // Pan offsets (panX -100 to 100 maps to proportional offset)
    const effectivePanX = (panX / 100) * (scaledW * 0.4);
    const effectivePanY = (panY / 100) * (scaledH * 0.4);

    const drawX = (w - scaledW) / 2 + effectivePanX;
    const drawY = (h - scaledH) / 2 + effectivePanY;

    // Render synthetic video frame on temp canvas and draw transformed
    const offscreen = document.createElement('canvas');
    offscreen.width = sourceW;
    offscreen.height = sourceH;
    const offCtx = offscreen.getContext('2d');
    if (offCtx) {
      drawInterviewFrame(offCtx, sourceW, sourceH, {
        currentTime,
        duration: project.source.duration,
        activeSpeaker,
        zoomPercent: zoom,
        panX,
        panY,
      });

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.clip();
      ctx.drawImage(offscreen, drawX, drawY, scaledW, scaledH);
      ctx.restore();
    }

    // 3. Render AI Face / Speaker Tracking Bounding Box if AI framing is active
    if (project.aiTracking.enabled) {
      ctx.save();
      const isPerson1 = panX < -15 || (activeSpeaker === 1 && panX <= 0);
      const isPerson2 = panX > 15 || (activeSpeaker === 2 && panX >= 0);

      if (isPerson1 || isPerson2) {
        const boxX = w * 0.5 - 75;
        const boxY = h * 0.35 - 90;
        const boxW = 150;
        const boxH = 180;

        ctx.strokeStyle = isPerson1 ? '#38bdf8' : '#f43f5e';
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        // Corner brackets for pro camera look
        const cornerLen = 14;
        ctx.lineWidth = 3;
        // TL
        ctx.beginPath();
        ctx.moveTo(boxX, boxY + cornerLen);
        ctx.lineTo(boxX, boxY);
        ctx.lineTo(boxX + cornerLen, boxY);
        ctx.stroke();
        // TR
        ctx.beginPath();
        ctx.moveTo(boxX + boxW - cornerLen, boxY);
        ctx.lineTo(boxX + boxW, boxY);
        ctx.lineTo(boxX + boxW, boxY + cornerLen);
        ctx.stroke();
        // BL
        ctx.beginPath();
        ctx.moveTo(boxX, boxY + boxH - cornerLen);
        ctx.lineTo(boxX, boxY + boxH);
        ctx.lineTo(boxX + cornerLen, boxY + boxH);
        ctx.stroke();
        // BR
        ctx.beginPath();
        ctx.moveTo(boxX + boxW - cornerLen, boxY + boxH);
        ctx.lineTo(boxX + boxW, boxY + boxH);
        ctx.lineTo(boxX + boxW, boxY + boxH - cornerLen);
        ctx.stroke();

        // Label Tag
        ctx.fillStyle = isPerson1 ? '#0284c7' : '#e11d48';
        ctx.fillRect(boxX, boxY - 22, 130, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(
          isPerson1 ? 'AI TRACK: KARTHIK' : 'AI TRACK: PRIYA',
          boxX + 6,
          boxY - 8
        );
      }
      ctx.restore();
    }

    // 4. Render Captions
    const activeCaption = project.captions.find(
      (c) => currentTime >= c.startTime && currentTime <= c.endTime
    );
    if (activeCaption) {
      ctx.save();
      const capStyle = activeCaption.style;
      const fontSize = Math.floor(w * (activeCaption.style.fontSize / 500));
      ctx.font = `600 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'center';

      let capY = h * 0.85;
      if (capStyle.position === 'top') capY = h * 0.18;
      if (capStyle.position === 'center') capY = h * 0.5;

      const metrics = ctx.measureText(activeCaption.text);
      const textWidth = metrics.width;
      const padX = 16;
      const padY = 8;

      if (capStyle.hasBackground) {
        ctx.fillStyle = `rgba(15, 23, 42, ${capStyle.backgroundOpacity || 0.85})`;
        ctx.beginPath();
        ctx.roundRect(
          (w - textWidth) / 2 - padX,
          capY - fontSize * 0.9,
          textWidth + padX * 2,
          fontSize * 1.3 + padY,
          8
        );
        ctx.fill();
      }

      if (capStyle.outlineWidth > 0) {
        ctx.strokeStyle = capStyle.outlineColor || '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText(activeCaption.text, w / 2, capY);
      }

      ctx.fillStyle = capStyle.color || '#ffffff';
      ctx.fillText(activeCaption.text, w / 2, capY);
      ctx.restore();
    }

    // 5. Render Logo
    if (project.logo.enabled) {
      ctx.save();
      ctx.globalAlpha = project.logo.opacity;
      const logoW = w * 0.18;
      const logoH = logoW * 0.55;
      let lx = w - logoW - 16;
      let ly = 20;

      if (project.logo.position === 'top-left') lx = 16;
      if (project.logo.position === 'bottom-left') {
        lx = 16;
        ly = h - logoH - 24;
      }
      if (project.logo.position === 'bottom-right') {
        lx = w - logoW - 16;
        ly = h - logoH - 24;
      }

      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.roundRect(lx, ly, logoW, logoH, 6);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${Math.floor(logoH * 0.42)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('STUDIO', lx + logoW / 2, ly + logoH * 0.65);
      ctx.restore();
    }

    // 6. Render Watermark
    if (project.watermark.enabled) {
      ctx.save();
      ctx.globalAlpha = project.watermark.opacity;
      ctx.font = '500 13px "JetBrains Mono", monospace';
      ctx.fillStyle = project.watermark.color || '#ffffff';
      ctx.textAlign = 'right';
      ctx.fillText(project.watermark.text, w - 16, h - 14);
      ctx.restore();
    }

    // 7. Render Overlays / Stickers
    project.overlays.forEach((overlay) => {
      if (currentTime >= overlay.startTime && currentTime <= overlay.endTime) {
        ctx.save();
        const ox = (overlay.x / 100) * w;
        const oy = (overlay.y / 100) * h;
        ctx.translate(ox, oy);
        ctx.rotate((overlay.rotation * Math.PI) / 180);
        ctx.scale(overlay.scale, overlay.scale);

        if (overlay.type === 'emoji') {
          ctx.font = '32px serif';
          ctx.textAlign = 'center';
          ctx.fillText(overlay.content, 0, 10);
        } else {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.roundRect(-55, -16, 110, 32, 16);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(overlay.content, 0, 4);
        }
        ctx.restore();
      }
    });

    // 8. Safe Zones Overlay (for Shorts / Reels)
    if (showSafeZones && project.output.aspectRatio === '9:16') {
      ctx.save();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;

      // Top Header Obstruction Zone (profile / sound search)
      ctx.strokeRect(10, 10, w - 20, h * 0.12);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
      ctx.fillRect(10, 10, w - 20, h * 0.12);

      // Right Action Buttons Zone (like, comment, bookmark, share)
      const actionW = w * 0.18;
      const actionH = h * 0.35;
      const actionX = w - actionW - 10;
      const actionY = h * 0.45;
      ctx.strokeRect(actionX, actionY, actionW, actionH);
      ctx.fillRect(actionX, actionY, actionW, actionH);

      // Bottom Caption & Audio metadata area
      const bottomH = h * 0.22;
      ctx.strokeRect(10, h - bottomH - 10, w - 20, bottomH);
      ctx.fillRect(10, h - bottomH - 10, w - 20, bottomH);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '10px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TikTok / Reels UI Safe Zone', w / 2, h * 0.35);
      ctx.restore();
    }
  }, [
    currentTime,
    project,
    zoom,
    panX,
    panY,
    activeSpeaker,
    showSafeZones,
  ]);

  // Canvas aspect ratio sizing calculations
  let canvasW = 360;
  let canvasH = 640; // 9:16 default
  if (project.output.aspectRatio === '1:1') {
    canvasW = 480;
    canvasH = 480;
  } else if (project.output.aspectRatio === '16:9') {
    canvasW = 640;
    canvasH = 360;
  }

  const scaledW = canvasW * canvasScale;
  const scaledH = canvasH * canvasScale;

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-[#070b12] flex flex-col items-center justify-between p-4 overflow-hidden select-none relative"
    >
      {/* Offscreen blur scratchpad */}
      <canvas ref={blurCanvasRef} width={640} height={360} className="hidden" />

      {/* Top Floating Info Tag */}
      <div className="absolute top-4 left-6 z-10 flex items-center gap-2">
        <span className="text-[11px] font-mono text-slate-300 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-md shadow-sm">
          {project.output.aspectRatio === '9:16'
            ? 'Shorts / Reels · 1080×1920'
            : project.output.aspectRatio === '1:1'
            ? 'Square · 1080×1080'
            : 'YouTube HD · 1920×1080'}
        </span>

        {project.aiTracking.enabled && (
          <span className="text-[11px] font-mono text-purple-300 bg-purple-950/80 border border-purple-800/80 px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3 h-3 text-purple-400" />
            AI Auto-Framing Active
          </span>
        )}
      </div>

      {/* Main Viewport Container */}
      <div className="flex-1 w-full flex items-center justify-center min-h-0 relative">
        <div
          style={{ width: scaledW, height: scaledH }}
          className="relative rounded-lg overflow-hidden border border-slate-800 shadow-2xl bg-black transition-all flex items-center justify-center"
        >
          <canvas
            ref={mainCanvasRef}
            width={canvasW}
            height={canvasH}
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Bottom Transport Controls Bar */}
      <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between gap-4 shadow-lg shrink-0 mt-3 z-10">
        {/* Playback Transport Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentTime(Math.max(0, currentTime - 1 / 30))}
            title="Step Backward 1 Frame (J)"
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-md transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white ml-0.5" />
            )}
          </button>

          <button
            onClick={() => setCurrentTime(Math.min(project.source.duration, currentTime + 1 / 30))}
            title="Step Forward 1 Frame (L)"
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Timecode Readout */}
        <div className="font-mono text-xs text-slate-300 flex items-center gap-1.5 tabular-nums">
          <span className="font-semibold text-white">{formatTimecode(currentTime, true)}</span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-400">{formatTimecode(project.source.duration, true)}</span>
        </div>

        {/* Playback Speed Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-300">
            <span className="text-[10px] text-slate-500 mr-1.5">Speed</span>
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              className="bg-transparent focus:outline-none font-mono text-[11px]"
            >
              <option value="0.5" className="bg-slate-900">0.5x</option>
              <option value="1" className="bg-slate-900">1.0x</option>
              <option value="1.5" className="bg-slate-900">1.5x</option>
              <option value="2" className="bg-slate-900">2.0x</option>
            </select>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
