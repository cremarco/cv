const fs = require('fs/promises');
const path = require('path');
const { renderPdfWithRetry, closeBrowser } = require('./pdf-renderer');

const OUTPUT_PDF = process.env.OUTPUT_PDF || path.resolve(process.cwd(), 'dist', 'marco-cremaschi-cv.pdf');

(async () => {
  try {
    const pdfBuffer = await renderPdfWithRetry();
    await fs.mkdir(path.dirname(OUTPUT_PDF), { recursive: true });
    await fs.writeFile(OUTPUT_PDF, pdfBuffer);
    console.log(`[pdf] written to ${OUTPUT_PDF}`);
  } catch (error) {
    console.error('[pdf] generation failed', { message: error && error.message ? error.message : 'unknown error' });
    process.exitCode = 1;
  } finally {
    await closeBrowser();
  }
})();
