const http = require('http');
const { renderPdfWithRetry, closeBrowser } = require('./pdf-renderer');

const PORT = Number(process.env.PDF_PORT || 8787);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (req.method !== 'GET' || url.pathname !== '/api/pdf') {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }

  try {
    const pdfBuffer = await renderPdfWithRetry();
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="marco-cremaschi-cv.pdf"',
      'Cache-Control': 'no-store',
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  } catch (error) {
    console.error('[pdf] generation failed', {
      message: error && error.message ? error.message : 'unknown error',
    });
    res.statusCode = 500;
    res.end('PDF generation failed');
  }
});

server.listen(PORT, () => {
  console.log(`[pdf] server listening on http://localhost:${PORT}/api/pdf`);
});

async function shutdown() {
  server.close(() => {
    closeBrowser()
      .catch(() => null)
      .finally(() => process.exit(0));
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
