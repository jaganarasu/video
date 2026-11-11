/**
 * Generates continuous synthetic video canvases for testing studio features:
 * 1. Two-person interview podcast studio (with host, guest, microphones, dynamic soundwave, studio lights)
 * 2. Tech keynote stage (speaker, slide projection, audience silhouetting)
 */

export interface SynthesizerRenderState {
  currentTime: number;
  duration: number;
  activeSpeaker: 1 | 2 | 'both';
  zoomPercent: number; // 100 to 300
  panX: number; // -100 to 100
  panY: number;
}

export function drawInterviewFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: SynthesizerRenderState
) {
  const { currentTime, activeSpeaker } = state;

  // 1. Studio Backdrop (Dark modern acoustic studio with warm LED uplights)
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#0f172a');
  bgGrad.addColorStop(0.5, '#1e1b4b');
  bgGrad.addColorStop(1, '#090d16');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Background acoustic slats
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  const slatWidth = 14;
  const slatGap = 28;
  for (let x = 0; x < width; x += slatGap) {
    ctx.fillRect(x, 0, slatWidth, height * 0.75);
  }

  // Atmospheric neon studio tubes in background
  const tubeGlow1 = ctx.createLinearGradient(0, 0, 0, height);
  tubeGlow1.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
  tubeGlow1.addColorStop(1, 'transparent');
  ctx.fillStyle = tubeGlow1;
  ctx.fillRect(width * 0.15, 40, 6, height * 0.6);

  const tubeGlow2 = ctx.createLinearGradient(0, 0, 0, height);
  tubeGlow2.addColorStop(0, 'rgba(244, 63, 94, 0.4)');
  tubeGlow2.addColorStop(1, 'transparent');
  ctx.fillStyle = tubeGlow2;
  ctx.fillRect(width * 0.85, 40, 6, height * 0.6);

  // Studio Table desk
  ctx.fillStyle = '#0a0f1d';
  ctx.beginPath();
  ctx.ellipse(width * 0.5, height * 0.98, width * 0.65, height * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Determine speaker animation state based on time
  // Person 1 (Host, left) talks around 0-8s, 16-24s, 32-40s...
  // Person 2 (Guest, right) talks around 8-16s, 24-32s, 40-48s...
  const cycle = currentTime % 20;
  const isP1Talking = cycle < 10;
  const isP2Talking = cycle >= 10;

  // Soundwave oscillation values
  const mouthOpenP1 = isP1Talking ? Math.abs(Math.sin(currentTime * 8)) * 12 : 2;
  const mouthOpenP2 = isP2Talking ? Math.abs(Math.sin(currentTime * 8)) * 12 : 2;

  // Head bobbing subtle motion
  const headBobP1 = isP1Talking ? Math.sin(currentTime * 4) * 3 : 0;
  const headBobP2 = isP2Talking ? Math.cos(currentTime * 4) * 3 : 0;

  // -------------------------------------------------------------
  // PERSON 1: HOST (LEFT SIDE)
  // -------------------------------------------------------------
  const p1X = width * 0.28;
  const p1Y = height * 0.56 + headBobP1;

  // Active speaker halo / indicator
  if (isP1Talking || activeSpeaker === 1) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(p1X, p1Y - 40, 110, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.stroke();
    ctx.restore();
  }

  // Torso / Jacket
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.ellipse(p1X, p1Y + 110, 95, 75, 0, 0, Math.PI * 2);
  ctx.fill();

  // Collar shirt
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.moveTo(p1X - 25, p1Y + 40);
  ctx.lineTo(p1X + 25, p1Y + 40);
  ctx.lineTo(p1X, p1Y + 85);
  ctx.closePath();
  ctx.fill();

  // Neck
  ctx.fillStyle = '#f87171';
  ctx.fillRect(p1X - 16, p1Y + 15, 32, 30);

  // Face
  ctx.fillStyle = '#fca5a5';
  ctx.beginPath();
  ctx.ellipse(p1X, p1Y - 30, 48, 62, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.arc(p1X, p1Y - 45, 52, Math.PI, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(p1X - 18, p1Y - 34, 4, 0, Math.PI * 2);
  ctx.arc(p1X + 18, p1Y - 34, 4, 0, Math.PI * 2);
  ctx.fill();

  // Eyebrows
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(p1X - 26, p1Y - 44);
  ctx.lineTo(p1X - 10, p1Y - 42);
  ctx.moveTo(p1X + 10, p1Y - 42);
  ctx.lineTo(p1X + 26, p1Y - 44);
  ctx.stroke();

  // Mouth
  ctx.fillStyle = '#881337';
  ctx.beginPath();
  ctx.ellipse(p1X, p1Y - 6, 12, Math.max(3, mouthOpenP1), 0, 0, Math.PI * 2);
  ctx.fill();

  // Microphone (Host)
  ctx.fillStyle = '#334155';
  ctx.fillRect(p1X + 45, p1Y + 10, 18, 38);
  ctx.beginPath();
  ctx.arc(p1X + 54, p1Y + 10, 12, Math.PI, 0);
  ctx.fillStyle = '#475569';
  ctx.fill();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(p1X + 54, p1Y + 48);
  ctx.lineTo(p1X + 70, height * 0.95);
  ctx.stroke();

  // Person 1 Name Tag (Host)
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(p1X - 70, p1Y + 140, 140, 26);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1;
  ctx.strokeRect(p1X - 70, p1Y + 140, 140, 26);
  ctx.fillStyle = '#ffffff';
  ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('HOST · KARTHIK', p1X, p1Y + 157);

  // -------------------------------------------------------------
  // PERSON 2: GUEST (RIGHT SIDE)
  // -------------------------------------------------------------
  const p2X = width * 0.72;
  const p2Y = height * 0.56 + headBobP2;

  // Active speaker halo / indicator
  if (isP2Talking || activeSpeaker === 2) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(p2X, p2Y - 40, 110, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(244, 63, 94, 0.08)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.stroke();
    ctx.restore();
  }

  // Torso / Blazer
  ctx.fillStyle = '#312e81';
  ctx.beginPath();
  ctx.ellipse(p2X, p2Y + 110, 95, 75, 0, 0, Math.PI * 2);
  ctx.fill();

  // Turtleneck / shirt
  ctx.fillStyle = '#f1f5f9';
  ctx.beginPath();
  ctx.moveTo(p2X - 22, p2Y + 38);
  ctx.lineTo(p2X + 22, p2Y + 38);
  ctx.lineTo(p2X, p2Y + 80);
  ctx.closePath();
  ctx.fill();

  // Neck
  ctx.fillStyle = '#f87171';
  ctx.fillRect(p2X - 16, p2Y + 15, 32, 30);

  // Face
  ctx.fillStyle = '#fca5a5';
  ctx.beginPath();
  ctx.ellipse(p2X, p2Y - 30, 48, 62, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = '#451a03';
  ctx.beginPath();
  ctx.arc(p2X, p2Y - 45, 52, Math.PI * 0.9, Math.PI * 2.1);
  ctx.fill();

  // Glasses
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.strokeRect(p2X - 30, p2Y - 42, 24, 18);
  ctx.strokeRect(p2X + 6, p2Y - 42, 24, 18);
  ctx.beginPath();
  ctx.moveTo(p2X - 6, p2Y - 33);
  ctx.lineTo(p2X + 6, p2Y - 33);
  ctx.stroke();

  // Eyes
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(p2X - 18, p2Y - 34, 4, 0, Math.PI * 2);
  ctx.arc(p2X + 18, p2Y - 34, 4, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  ctx.fillStyle = '#881337';
  ctx.beginPath();
  ctx.ellipse(p2X, p2Y - 6, 12, Math.max(3, mouthOpenP2), 0, 0, Math.PI * 2);
  ctx.fill();

  // Microphone (Guest)
  ctx.fillStyle = '#334155';
  ctx.fillRect(p2X - 63, p2Y + 10, 18, 38);
  ctx.beginPath();
  ctx.arc(p2X - 54, p2Y + 10, 12, Math.PI, 0);
  ctx.fillStyle = '#475569';
  ctx.fill();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(p2X - 54, p2Y + 48);
  ctx.lineTo(p2X - 70, height * 0.95);
  ctx.stroke();

  // Person 2 Name Tag (Guest)
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(p2X - 70, p2Y + 140, 140, 26);
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 1;
  ctx.strokeRect(p2X - 70, p2Y + 140, 140, 26);
  ctx.fillStyle = '#ffffff';
  ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('GUEST · PRIYA', p2X, p2Y + 157);

  // -------------------------------------------------------------
  // Studio Center HUD / Live Audio Waveform Display
  // -------------------------------------------------------------
  const hudY = height * 0.12;
  const hudWidth = 260;
  const hudX = (width - hudWidth) / 2;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
  ctx.fillRect(hudX, hudY, hudWidth, 48);
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
  ctx.strokeRect(hudX, hudY, hudWidth, 48);

  // Live Soundwaves
  const bars = 18;
  const barW = 6;
  const barGap = 4;
  const totalWaveW = bars * (barW + barGap);
  const startWaveX = (width - totalWaveW) / 2;

  for (let i = 0; i < bars; i++) {
    const active = isP1Talking || isP2Talking;
    const waveHeight = active
      ? Math.abs(Math.sin(currentTime * 12 + i * 0.8)) * 24 + 4
      : 3;
    const barX = startWaveX + i * (barW + barGap);
    const barY = hudY + 24 - waveHeight / 2;

    ctx.fillStyle = isP1Talking
      ? '#38bdf8'
      : isP2Talking
      ? '#f43f5e'
      : '#64748b';
    ctx.fillRect(barX, barY, barW, waveHeight);
  }

  // Audio status label
  ctx.font = '500 10px "JetBrains Mono", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'center';
  const speakerLabel = isP1Talking
    ? 'CH 1: KARTHIK (SPEAKING)'
    : isP2Talking
    ? 'CH 2: PRIYA (SPEAKING)'
    : 'AUDIO: AMBIENT';
  ctx.fillText(speakerLabel, width / 2, hudY + 42);

  // Live Timestamp in bottom right corner
  ctx.font = '500 12px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.textAlign = 'right';
  ctx.fillText(`STUDIO REC · 1080p 30fps`, width - 24, height - 20);
}
