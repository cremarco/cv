const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const http = require('http');

const OUTPUT_PDF = process.env.OUTPUT_PDF || path.resolve(process.cwd(), 'dist', 'marco-cremaschi-cv.pdf');
const SERVER_PORT = Number(process.env.PDF_SERVER_PORT || 4173);
// Set BASE_URL before requiring renderer (it reads it at module load time)
if (!process.env.BASE_URL) {
  process.env.BASE_URL = `http://localhost:${SERVER_PORT}`;
}

const { renderPdfWithRetry, closeBrowser } = require('./pdf-renderer');

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
