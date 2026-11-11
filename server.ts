import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { spawn, exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));

// Ensure required local folders exist
const BASE_DATA_DIR = process.platform === 'win32' && fs.existsSync('D:\\')
  ? 'D:\\LocalVideoStudio'
  : path.join(__dirname, 'local_storage');

const DIRS = {
  root: BASE_DATA_DIR,
  originals: path.join(BASE_DATA_DIR, 'media', 'originals'),
  temporary: path.join(BASE_DATA_DIR, 'media', 'temporary'),
  exports: path.join(BASE_DATA_DIR, 'media', 'exports'),
  projects: path.join(BASE_DATA_DIR, 'projects'),
  assets: path.join(BASE_DATA_DIR, 'assets'),
};

Object.values(DIRS).forEach((dir) => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) {
    // If D:\ drive is not available, fallback to local directory
    console.warn(`Could not create directory ${dir}, falling back:`, err);
  }
});

// Active background FFmpeg render jobs
interface ActiveJob {
  id: string;
  process: any;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  logs: string[];
  outputFile: string;
  error?: string;
}

const activeJobs = new Map<string, ActiveJob>();

// -------------------------------------------------------------
// API ENDPOINTS FOR LOCAL ENGINE & FFMPEG
// -------------------------------------------------------------

// 1. Health & Engine Status
app.get('/api/engine/status', async (req: Request, res: Response) => {
  const checkCommand = (cmd: string): Promise<{ ok: boolean; version?: string }> => {
    return new Promise((resolve) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          resolve({ ok: false });
        } else {
          const out = stdout || stderr;
          const firstLine = out.split('\n')[0].trim();
          resolve({ ok: true, version: firstLine });
        }
      });
    });
  };

  const ffmpegCheck = await checkCommand('ffmpeg -version');
  const ffprobeCheck = await checkCommand('ffprobe -version');

  // Check hardware encoders if ffmpeg is available
  let nvenc = false;
  let qsv = false;
  if (ffmpegCheck.ok) {
    try {
      await new Promise<void>((resolve) => {
        exec('ffmpeg -encoders', (err, stdout) => {
          if (!err && stdout) {
            nvenc = stdout.includes('nvenc');
            qsv = stdout.includes('qsv');
          }
          resolve();
        });
      });
    } catch {
      // Ignore encoder check failure
    }
  }

  res.json({
    engine: 'local-node-engine',
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    dataDirectory: BASE_DATA_DIR,
    directories: DIRS,
    ffmpeg: {
      installed: ffmpegCheck.ok,
      version: ffmpegCheck.version || 'Not found in system PATH',
      nvencSupported: nvenc,
      qsvSupported: qsv,
    },
    ffprobe: {
      installed: ffprobeCheck.ok,
      version: ffprobeCheck.version || 'Not found in system PATH',
    },
  });
});

// 2. FFprobe Metadata Extraction
app.post('/api/engine/probe', (req: Request, res: Response) => {
  const { filePath } = req.body;
  if (!filePath) {
    res.status(400).json({ error: 'filePath parameter is required' });
    return;
  }

  const safePath = filePath.replace(/"/g, '');
  const cmd = `ffprobe -v quiet -show_format -show_streams -of json "${safePath}"`;

  exec(cmd, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
    if (error) {
      res.status(500).json({
        error: error.message,
        details: stderr,
        fallbackNote: 'Ensure ffprobe is installed in your Windows or system PATH',
      });
      return;
    }

    try {
      const parsed = JSON.parse(stdout);
      res.json({ success: true, metadata: parsed });
    } catch (parseErr: any) {
      res.status(500).json({ error: 'Failed to parse ffprobe output', details: parseErr.message });
    }
  });
});

// 3. Start Local FFmpeg Render Job
app.post('/api/engine/render', (req: Request, res: Response) => {
  const { command, jobId, outputFilename } = req.body;
  if (!command) {
    res.status(400).json({ error: 'command parameter is required' });
    return;
  }

  const id = jobId || 'job_' + Math.random().toString(36).substring(2, 9);
  const outputFile = outputFilename || path.join(DIRS.exports, `${id}.mp4`);

  const job: ActiveJob = {
    id,
    process: null,
    progress: 0,
    status: 'processing',
    logs: [],
    outputFile,
  };

  activeJobs.set(id, job);

  // Parse command arguments for spawn
  // e.g. "ffmpeg -y -i input.mp4 -ss 00:00:10 -t 00:00:30 ..."
  const args = command.startsWith('ffmpeg ') ? command.slice(7) : command;

  const child = spawn('ffmpeg', ['-stats', ...args.split(' ').filter(Boolean)], {
    shell: true,
  });

  job.process = child;

  child.stderr.on('data', (data) => {
    const str = data.toString();
    job.logs.push(str);
    if (job.logs.length > 50) job.logs.shift();

    // Parse FFmpeg progress: time=00:01:23.45 or frame=...
    const timeMatch = str.match(/time=(\d{2}):(\d{2}):(\d{2}\.\d+)/);
    if (timeMatch) {
      const hrs = parseFloat(timeMatch[1]);
      const mins = parseFloat(timeMatch[2]);
      const secs = parseFloat(timeMatch[3]);
      const currentSeconds = hrs * 3600 + mins * 60 + secs;
      // Progress estimation
      job.progress = Math.min(99, Math.round((currentSeconds / 60) * 100));
    }
  });

  child.on('close', (code) => {
    if (code === 0) {
      job.status = 'completed';
      job.progress = 100;
    } else {
      job.status = 'failed';
      job.error = `FFmpeg process exited with code ${code}`;
    }
  });

  child.on('error', (err) => {
    job.status = 'failed';
    job.error = err.message;
  });

  res.json({ success: true, jobId: id, status: 'processing', outputFile });
});

// 4. Check Render Job Progress
app.get('/api/engine/progress/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;
  const job = activeJobs.get(jobId);
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  res.json({
    jobId: job.id,
    status: job.status,
    progress: job.progress,
    outputFile: job.outputFile,
    error: job.error,
    recentLog: job.logs[job.logs.length - 1] || '',
  });
});

// 5. Cancel Render Job
app.post('/api/engine/cancel/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;
  const job = activeJobs.get(jobId);
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  if (job.process) {
    job.process.kill('SIGTERM');
  }
  job.status = 'cancelled';
  res.json({ success: true, jobId, status: 'cancelled' });
});

// 6. List Local Media Files
app.get('/api/engine/media', (req: Request, res: Response) => {
  try {
    const originals = fs.existsSync(DIRS.originals) ? fs.readdirSync(DIRS.originals) : [];
    const exportsList = fs.existsSync(DIRS.exports) ? fs.readdirSync(DIRS.exports) : [];

    res.json({
      originals: originals.map((file) => ({
        name: file,
        path: path.join(DIRS.originals, file),
        size: fs.statSync(path.join(DIRS.originals, file)).size,
      })),
      exports: exportsList.map((file) => ({
        name: file,
        path: path.join(DIRS.exports, file),
        size: fs.statSync(path.join(DIRS.exports, file)).size,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// VITE DEV SERVER OR STATIC PRODUCTION SERVE
// -------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Local Video Studio] Server running on http://0.0.0.0:${PORT}`);
    console.log(`[Local Video Studio] Storage root: ${BASE_DATA_DIR}`);
  });
}

startServer();
