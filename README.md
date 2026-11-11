# Local Video Studio

**Desktop-Grade Local Video Clipping & Editing Suite**  
*Optimized for YouTube Long-Form to Shorts, Instagram Reels, and Two-Person Podcast Interviews.*

---

## 1. How to Access the Application

### A. Instant Browser Access (Current Applet)
You can access and use the full application immediately in your browser via the provided links:

- **Development URL**:  
  [https://ais-dev-2mnwld5btcosxtzbklkifm-725437808076.asia-east1.run.app](https://ais-dev-2mnwld5btcosxtzbklkifm-725437808076.asia-east1.run.app)
- **Production / Shared Preview URL**:  
  [https://ais-pre-2mnwld5btcosxtzbklkifm-725437808076.asia-east1.run.app](https://ais-pre-2mnwld5btcosxtzbklkifm-725437808076.asia-east1.run.app)

*No installation required to test all features: preloaded with a 2-person interview demo video, dynamic zoom keyframes, Tamil & English subtitles, and live client-side video export.*

---

### B. Running as a Local Desktop App on Windows 10 / Windows 11

To install and run **Local Video Studio** directly on your Windows PC with offline local processing:

#### Prerequisites
1. **Node.js LTS** (v18 or higher): [nodejs.org](https://nodejs.org)
2. **FFmpeg & FFprobe**: Installed and added to your Windows PATH.
   - Verify by opening Command Prompt / PowerShell:
     ```bash
     ffmpeg -version
     ffprobe -version
     ```

#### Local Installation Steps
1. **Clone or Download the Repository**:
   ```bash
   git clone <your-repo-url> LocalVideoStudio
   cd LocalVideoStudio
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Launch the Local Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

4. **Electron Desktop Wrapper (Optional)**:
   - For a native `.exe` window, configure Electron using the provided `main.js` and `preload.js` templates located in the in-app **Settings** tab.

---

## 2. Key Features & How to Use

### 1. Dashboard
- **Overview**: View storage metrics (`D:\LocalVideoStudio`), total processed clips, and recent projects.
- **Import Local Video**: Drag and drop any video file (`.mp4`, `.mov`, `.mkv`, `.webm`, `.avi`) from your hard drive (supports files $>1\text{GB}$ and $>5\text{GB}$).
- **Create Project**: Click **"Create New Project"** to select a video source and default aspect ratio.

### 2. Video Editor
The editor consists of 5 dedicated sections:
1. **Top Toolbar**:
   - Aspect ratio switcher: **9:16 Shorts** ($1080 \times 1920$), **1:1 Square** ($1080 \times 1080$), **16:9 YouTube** ($1920 \times 1080$).
   - **AI Auto-Frame**: Toggle automatic speaker detection & tracking.
   - **Safe Zones Grid**: Show/hide Reels & TikTok overlay bounds.
   - **Save & Export**: Quick actions.
2. **Left Sidebar Tools**:
   - **Media**: View source file metadata (bitrate, fps, duration, audio channels).
   - **Split & Clips**: One-click split presets (1m, 5m, 10m, 30m, 60m, custom).
   - **Crop & Frame**: Framing modes including *Blur Background* (Reels style), *Center Crop*, *Fit*, and manual pan/zoom.
   - **Captions**: Full Unicode support for **Tamil (தமிழ்)**, English, Telugu, and Malayalam. Edit styles, colors, outlines, and import/export `.srt` files.
   - **Logo / Watermark**: Set corner logos or text watermarks (`@yourhandle`) with custom opacity.
   - **Stickers**: Add animated stickers (YouTube Subscribe, Fire, Reactions).
   - **Smart Zoom**: Keyframes for two-person interviews (Host close-up, Guest close-up, Wide shot).
3. **Center Preview Canvas**:
   - Live video playback with real-time compositing, blurred background backdrop, captions, overlays, and smooth zoom transitions.
4. **Right Properties Panel**:
   - Contextual sliders for whatever item is currently selected on the canvas or timeline.
5. **Bottom Multi-Track Timeline**:
   - Draggable playhead with millisecond timecode.
   - Individual tracks: Video clips, Audio waveform, Subtitles, Zoom keyframes, and Overlays.
   - Keyboard shortcut **`S`**: Split active clip at playhead position.

### 3. Media Library
- Inspect extracted metadata via FFprobe model.
- View resolution, bitrate, fps, codecs, and audio channels.

### 4. Batch Export Queue
- Batch render selected or all clips into individual H.264/AAC `.mp4` video files.
- Real-time progress bar and estimated time remaining.
- Download completed clips directly.
- **Download Windows .BAT**: Generates an automated batch command script for direct execution in Windows Terminal with native FFmpeg.

### 5. Settings & FFmpeg CLI
- View folder hierarchy (`D:\LocalVideoStudio\media\originals`, `exports`, etc.).
- Inspect and copy exact FFmpeg commands for splitting, vertical conversion, subtitle burning, and watermarking.
- Select hardware acceleration profile (NVIDIA NVENC, Intel QuickSync, or Software CPU).

---

## 3. Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| **Space** | Play / Pause playback |
| **S** | Split video clip at current playhead |
| **J** | Step backward 1 frame |
| **L** | Step forward 1 frame |
| **Ctrl + S** | Save project locally |

---

## 4. Local Folder Hierarchy (Windows)

```text
D:\LocalVideoStudio\
│
├── application\
│   ├── electron\
│   │   ├── main.js
│   │   └── preload.js
│   ├── frontend\
│   └── backend\
│
├── media\
│   ├── originals\   (Original user videos - never overwritten)
│   ├── temporary\   (Render caches & audio scratchpad)
│   └── exports\     (Exported MP4 clips)
│
├── projects\        (Saved project JSON files)
├── assets\          (Logos, stickers, and fonts)
└── backups\
```
