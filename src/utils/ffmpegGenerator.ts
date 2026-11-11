import { AspectRatioType, CropMode, ProjectData, VideoClip } from '../types';
import { formatTimecode } from './timeFormat';

export interface FFmpegCommandOptions {
  inputPath: string;
  outputPath: string;
  startTime: number;
  duration: number;
  aspectRatio: AspectRatioType;
  cropMode: CropMode;
  resolution: string;
  fps: number;
  hasLogo: boolean;
  logoPath?: string;
  logoPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'custom';
  hasSubtitles: boolean;
  srtPath?: string;
  zoomPan?: string;
  watermarkText?: string;
}

export function generateFFprobeCommand(inputPath: string): string {
  const safePath = inputPath.includes(' ') ? `"${inputPath}"` : inputPath;
  return `ffprobe -v quiet -show_format -show_streams -of json ${safePath}`;
}

export function generateFFmpegClipCommand(options: FFmpegCommandOptions): string {
  const {
    inputPath,
    outputPath,
    startTime,
    duration,
    aspectRatio,
    cropMode,
    resolution,
    fps,
    hasLogo,
    logoPath,
    logoPosition = 'top-right',
    hasSubtitles,
    srtPath,
    watermarkText,
  } = options;

  const safeInput = inputPath.includes(' ') ? `"${inputPath}"` : inputPath;
  const safeOutput = outputPath.includes(' ') ? `"${outputPath}"` : outputPath;
  const timeStart = formatTimecode(startTime, false);
  const timeDur = formatTimecode(duration, false);

  // Resolution dimensions
  let targetW = 1080;
  let targetH = 1920;
  if (aspectRatio === '1:1') {
    targetW = 1080;
    targetH = 1080;
  } else if (aspectRatio === '16:9') {
    targetW = resolution === '720p' ? 1280 : 1920;
    targetH = resolution === '720p' ? 720 : 1080;
  }

  // Complex filter building
  const filters: string[] = [];

  if (cropMode === 'blur-bg' && aspectRatio !== '16:9') {
    // Blur background filter complex
    let overlayPos = '(W-w)/2:(H-h)/2';
    if (logoPosition === 'top-right') {
      overlayPos = '(W-w)/2:(H-h)/2';
    }
    const filterComplex = `[0:v]scale=${targetW}:${targetH}:force_original_aspect_ratio=increase,crop=${targetW}:${targetH},boxblur=25:5[bg];[0:v]scale=${targetW}:${targetH}:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=${overlayPos}`;
    
    let extraFilters = '';
    if (hasSubtitles && srtPath) {
      const safeSrt = srtPath.replace(/\\/g, '/').replace(/:/g, '\\:');
      extraFilters += `,subtitles='${safeSrt}'`;
    }
    if (watermarkText) {
      extraFilters += `,drawtext=text='${watermarkText}':x=w-tw-20:y=h-th-20:fontsize=24:fontcolor=white@0.6`;
    }

    if (hasLogo && logoPath) {
      const safeLogo = logoPath.includes(' ') ? `"${logoPath}"` : logoPath;
      return `ffmpeg -y -ss ${timeStart} -t ${timeDur} -i ${safeInput} -i ${safeLogo} -filter_complex "${filterComplex}[vbase];[vbase][1:v]overlay=W-w-30:30${extraFilters}" -r ${fps} -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k ${safeOutput}`;
    }

    return `ffmpeg -y -ss ${timeStart} -t ${timeDur} -i ${safeInput} -filter_complex "${filterComplex}${extraFilters}" -r ${fps} -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k ${safeOutput}`;
  }

  // Standard crop filter
  let videoFilter = `scale=${targetW}:${targetH}:force_original_aspect_ratio=increase,crop=${targetW}:${targetH}`;

  if (cropMode === 'fit') {
    videoFilter = `scale=${targetW}:${targetH}:force_original_aspect_ratio=decrease,pad=${targetW}:${targetH}:(ow-iw)/2:(oh-ih)/2:black`;
  }

  filters.push(videoFilter);

  if (watermarkText) {
    filters.push(`drawtext=text='${watermarkText}':x=w-tw-20:y=h-th-20:fontsize=24:fontcolor=white@0.6`);
  }

  if (hasSubtitles && srtPath) {
    const safeSrt = srtPath.replace(/\\/g, '/').replace(/:/g, '\\:');
    filters.push(`subtitles='${safeSrt}'`);
  }

  if (hasLogo && logoPath) {
    const safeLogo = logoPath.includes(' ') ? `"${logoPath}"` : logoPath;
    let logoOverlay = 'W-w-30:30';
    if (logoPosition === 'top-left') logoOverlay = '30:30';
    if (logoPosition === 'bottom-left') logoOverlay = '30:H-h-30';
    if (logoPosition === 'bottom-right') logoOverlay = 'W-w-30:H-h-30';

    return `ffmpeg -y -ss ${timeStart} -t ${timeDur} -i ${safeInput} -i ${safeLogo} -filter_complex "[0:v]${filters.join(',')}[vbase];[vbase][1:v]overlay=${logoOverlay}" -r ${fps} -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k ${safeOutput}`;
  }

  return `ffmpeg -y -ss ${timeStart} -t ${timeDur} -i ${safeInput} -vf "${filters.join(',')}" -r ${fps} -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k ${safeOutput}`;
}

export function generateBatchScript(project: ProjectData, exportDirectory: string = 'D:\\LocalVideoStudio\\media\\exports'): string {
  const lines: string[] = [
    '@echo off',
    'echo ==========================================================',
    'echo   LOCAL VIDEO STUDIO - BATCH EXPORT RUNNER',
    `echo   Project: ${project.projectName}`,
    `echo   Source: ${project.source.path}`,
    'echo ==========================================================',
    `if not exist "${exportDirectory}" mkdir "${exportDirectory}"`,
    '',
  ];

  project.clips.forEach((clip: VideoClip, index: number) => {
    const cleanClipName = clip.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const outFilename = `${exportDirectory}\\${project.projectName}_${cleanClipName}_${project.output.aspectRatio.replace(':', 'x')}.mp4`;
    const srtFile = `${exportDirectory}\\${project.projectName}_subtitles.srt`;

    const cmd = generateFFmpegClipCommand({
      inputPath: project.source.path,
      outputPath: outFilename,
      startTime: clip.startTime,
      duration: clip.endTime - clip.startTime,
      aspectRatio: project.output.aspectRatio,
      cropMode: project.output.cropMode,
      resolution: project.output.resolution,
      fps: project.output.fps,
      hasLogo: project.logo.enabled,
      logoPath: project.logo.src || 'assets\\logo.png',
      logoPosition: project.logo.position,
      hasSubtitles: project.captions.length > 0,
      srtPath: project.captions.length > 0 ? srtFile : undefined,
      watermarkText: project.watermark.enabled ? project.watermark.text : undefined,
    });

    lines.push(`echo [${index + 1}/${project.clips.length}] Processing clip: ${clip.name}...`);
    lines.push(cmd);
    lines.push('if %errorlevel% neq 0 (');
    lines.push(`  echo [ERROR] Failed to export clip: ${clip.name}`);
    lines.push(') else (');
    lines.push(`  echo [SUCCESS] Exported: ${outFilename}`);
    lines.push(')');
    lines.push('');
  });

  lines.push('echo ==========================================================');
  lines.push('echo   Batch Export Completed!');
  lines.push('echo ==========================================================');
  lines.push('pause');

  return lines.join('\r\n');
}
