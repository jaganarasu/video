import { Caption, CaptionLanguage } from '../types';
import { formatSRTTime, parseSRTTime } from './timeFormat';

/**
 * Generate standard SRT formatted subtitle string from captions list
 */
export function generateSRT(captions: Caption[]): string {
  const sorted = [...captions].sort((a, b) => a.startTime - b.startTime);
  return sorted
    .map((caption, index) => {
      const idx = index + 1;
      const start = formatSRTTime(caption.startTime);
      const end = formatSRTTime(caption.endTime);
      return `${idx}\n${start} --> ${end}\n${caption.text.trim()}\n`;
    })
    .join('\n');
}

/**
 * Parse an SRT string into Caption objects
 */
export function parseSRT(srtContent: string, defaultLanguage: CaptionLanguage = 'tamil'): Caption[] {
  const clean = srtContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  const blocks = clean.split(/\n\s*\n/);
  const captions: Caption[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const lines = blocks[i].trim().split('\n');
    if (lines.length < 2) continue;

    // Check if line 0 is index or timecode
    let timeLineIndex = 1;
    if (lines[0].includes('-->')) {
      timeLineIndex = 0;
    }

    const timeLine = lines[timeLineIndex];
    if (!timeLine || !timeLine.includes('-->')) continue;

    const [startStr, endStr] = timeLine.split('-->');
    if (!startStr || !endStr) continue;

    const startTime = parseSRTTime(startStr);
    const endTime = parseSRTTime(endStr);

    const textLines = lines.slice(timeLineIndex + 1);
    const text = textLines.join('\n').trim();

    if (text) {
      captions.push({
        id: 'cap_' + Math.random().toString(36).substring(2, 9),
        text,
        startTime,
        endTime,
        language: defaultLanguage,
        style: {
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 24,
          color: '#ffffff',
          backgroundColor: '#000000',
          backgroundOpacity: 0.75,
          hasBackground: true,
          outlineColor: '#000000',
          outlineWidth: 2,
          shadow: true,
          position: 'bottom',
        },
      });
    }
  }

  return captions;
}

export function downloadSRTFile(captions: Caption[], filename: string = 'subtitles.srt') {
  const srtContent = generateSRT(captions);
  const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
