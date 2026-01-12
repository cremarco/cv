const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const OUTPUT_PDF = process.env.OUTPUT_PDF || path.resolve(process.cwd(), 'dist', 'marco-cremaschi-cv.pdf');
const SERVER_PORT = Number(process.env.PDF_SERVER_PORT || 4173);
// Set BASE_URL before requiring renderer (it reads it at module load time)
if (!process.env.BASE_URL) {
  process.env.BASE_URL = `http://localhost:${SERVER_PORT}`;
}

const { renderPdfWithRetry, closeBrowser } = require('./pdf-renderer');

function parseEnvFlag(value) {
  if (value === undefined || value === null) return false;
  const normalized = String(value).trim().toLowerCase();
  if (normalized === '' || normalized === '1' || normalized === 'true') return true;
  if (normalized === '0' || normalized === 'false') return false;
  return true;
}

function getTempPdfPath(basePath, suffix) {
  const dir = path.dirname(basePath);
  const ext = path.extname(basePath) || '.pdf';
  const name = path.basename(basePath, ext);
  return path.join(dir, `${name}.${suffix}${ext}`);
}

function buildGhostscriptArgs(inputPath, outputPath, profile) {
  return [
    '-sDEVICE=pdfwrite',
    `-dPDFSETTINGS=/${profile}`,
    '-dNOPAUSE',
    '-dBATCH',
    '-dQUIET',
    '-dDetectDuplicateImages=true',
    '-dCompressFonts=true',
    `-sOutputFile=${outputPath}`,
    inputPath,
  ];
}

function runGhostscript(inputPath, outputPath, profile) {
  const gsBin = process.env.GHOSTSCRIPT_BIN || 'gs';
  const args = buildGhostscriptArgs(inputPath, outputPath, profile);

  return new Promise((resolve, reject) => {
    const child = spawn(gsBin, args, { stdio: 'ignore' });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Ghostscript exited with code ${code}`));
      }
    });
  });
}

async function getFileSizeBytes(filePath) {
  const stats = await fs.stat(filePath);
  return stats.size || 0;
}

async function compressPdfIfNeeded(outputPath) {
  const profile = String(process.env.PDF_PROFILE || '').trim().toLowerCase();
  const compact = profile === 'compact' || profile === 'compact-strong' || parseEnvFlag(process.env.PDF_COMPACT);
  const compressFlag = parseEnvFlag(process.env.PDF_COMPRESS);
  const maxKb = Number(process.env.PDF_MAX_KB || 0);
  const explicitProfile = String(process.env.PDF_COMPRESS_PROFILE || '').trim().toLowerCase();

  if (!compact && !compressFlag && !maxKb && !explicitProfile) return;

  const targetBytes = maxKb > 0 ? maxKb * 1024 : 0;
  let bestPath = outputPath;
  let bestSize = await getFileSizeBytes(outputPath);
  const tempFiles = new Set();

  const profiles = explicitProfile
    ? [explicitProfile]
    : (targetBytes > 0 ? ['ebook', 'screen'] : ['screen']);

  for (const gsProfile of profiles) {
    const tempPath = getTempPdfPath(outputPath, `gs-${gsProfile}`);
    tempFiles.add(tempPath);

    try {
      await runGhostscript(outputPath, tempPath, gsProfile);
      const size = await getFileSizeBytes(tempPath);
      if (size > 0 && size < bestSize) {
        bestSize = size;
        bestPath = tempPath;
      }
      if (targetBytes > 0 && size > 0 && size <= targetBytes) {
        break;
      }
    } catch (error) {
      if (error && error.code === 'ENOENT') {
        console.warn('[pdf] Ghostscript not found. Skipping compression.');
        break;
      }
      console.warn(`[pdf] compression failed (${gsProfile}): ${error && error.message ? error.message : 'unknown error'}`);
    }
  }

  if (bestPath !== outputPath) {
    await fs.copyFile(bestPath, outputPath);
    console.log(`[pdf] compressed to ${Math.round(bestSize / 1024)}kb`);
  }

  await Promise.all(
    Array.from(tempFiles).map(async (filePath) => {
      try {
        await fs.rm(filePath, { force: true });
      } catch (error) {
        // ignore cleanup errors
      }
    })
  );

  if (targetBytes > 0 && bestSize > targetBytes) {
    console.warn(`[pdf] compressed size ${Math.round(bestSize / 1024)}kb exceeds target ${maxKb}kb`);
  }
}

// Simple static file server
function createStaticServer(rootDir, port) {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
  };

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let filePath = path.join(rootDir, url.pathname === '/' ? '/index.html' : url.pathname);

    // Security: prevent directory traversal
    if (!filePath.startsWith(rootDir)) {
      res.statusCode = 403;
      res.end('Forbidden');
      return;
    }

    fsSync.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // Try index.html for directories
        if (url.pathname.endsWith('/')) {
          filePath = path.join(rootDir, url.pathname, 'index.html');
        } else {
          res.statusCode = 404;
          res.end('Not found');
          return;
        }
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      fsSync.readFile(filePath, (err, data) => {
        if (err) {
          res.statusCode = 404;
          res.end('Not found');
          return;
        }

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      });
    });
  });

  return new Promise((resolve, reject) => {
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        reject(new Error(`Port ${port} is already in use. Please stop the server or set PDF_SERVER_PORT to a different port.`));
      } else {
        reject(err);
      }
    });

    server.listen(port, () => {
      console.log(`[pdf] static server started on http://localhost:${port}`);
      resolve(server);
    });
  });
}

(async () => {
  let server = null;
  try {
    // Start static server
    server = await createStaticServer(process.cwd(), SERVER_PORT);

    // Wait a bit for server to be ready
    await new Promise(resolve => setTimeout(resolve, 100));

    // Generate PDF
    const pdfBuffer = await renderPdfWithRetry();
    await fs.mkdir(path.dirname(OUTPUT_PDF), { recursive: true });
    await fs.writeFile(OUTPUT_PDF, pdfBuffer);
    console.log(`[pdf] written to ${OUTPUT_PDF}`);
    await compressPdfIfNeeded(OUTPUT_PDF);
  } catch (error) {
    console.error('[pdf] generation failed', { message: error && error.message ? error.message : 'unknown error' });
    process.exitCode = 1;
  } finally {
    // Close server
    if (server) {
      await new Promise((resolve) => {
        server.close(() => {
          console.log('[pdf] static server stopped');
          resolve();
        });
      });
    }
    await closeBrowser();
  }
})();
