const fs = require('fs/promises');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const SCRIPT_PATH = path.join(process.cwd(), 'scripts', 'pdf-generate.js');

function randomPort() {
  return 4300 + Math.floor(Math.random() * 500);
}

function runGeneratePdf(outputPath, port) {
  return new Promise((resolve, reject) => {
    const env = {
      ...process.env,
      OUTPUT_PDF: outputPath,
      PDF_SERVER_PORT: String(port),
    };

    const child = spawn(process.execPath, [SCRIPT_PATH], {
      env,
      stdio: 'pipe',
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);

    child.on('exit', (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

async function verifyPdfFile(outputPath) {
  const stat = await fs.stat(outputPath);
  if (!stat.isFile() || stat.size <= 0) {
    throw new Error('Generated PDF is empty or missing');
  }
}

(async () => {
  const outputPath = path.join(os.tmpdir(), `cv-smoke-${Date.now()}.pdf`);

  try {
    let lastResult = null;

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const port = randomPort();
      const result = await runGeneratePdf(outputPath, port);
      lastResult = result;

      if (result.code === 0) {
        await verifyPdfFile(outputPath);
        console.log(`[smoke-pdf] success on attempt ${attempt} (port ${port})`);
        process.exitCode = 0;
        return;
      }

      if (!/already in use/i.test(result.stdout) && !/already in use/i.test(result.stderr)) {
        break;
      }
    }

    const message = lastResult
      ? `\nstdout:\n${lastResult.stdout}\nstderr:\n${lastResult.stderr}`
      : '';
    throw new Error(`[smoke-pdf] generation failed after retries.${message}`);
  } catch (error) {
    console.error(error && error.message ? error.message : error);
    process.exitCode = 1;
  } finally {
    try {
      await fs.rm(outputPath, { force: true });
    } catch (cleanupError) {
      // ignore cleanup issues
    }
  }
})();
