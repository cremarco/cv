const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'http://localhost:4173';
const PDF_QUERY = process.env.PDF_QUERY || '';
const NAVIGATION_TIMEOUT_MS = Number(process.env.PDF_NAV_TIMEOUT_MS || 30000);
const PDF_TIMEOUT_MS = Number(process.env.PDF_TIMEOUT_MS || 30000);
const MAX_RETRIES = 1;

function parseEnvFlag(value) {
  if (value === undefined || value === null) return false;
  const normalized = String(value).trim().toLowerCase();
  if (normalized === '' || normalized === '1' || normalized === 'true') return true;
  if (normalized === '0' || normalized === 'false') return false;
  return true;
}

const PDF_PROFILE = String(process.env.PDF_PROFILE || '').trim().toLowerCase();
const PDF_COMPACT = parseEnvFlag(process.env.PDF_COMPACT);
const IS_COMPACT_PROFILE = PDF_PROFILE.startsWith('compact') || PDF_COMPACT;
const PDF_DEVICE_SCALE_FACTOR = Number(process.env.PDF_DEVICE_SCALE_FACTOR || (IS_COMPACT_PROFILE ? 1 : 2));

const A4_VIEWPORT = { width: 794, height: 1123 };

let browserPromise;

function buildTargetUrl() {
  const targetUrl = new URL(BASE_URL);

  if (PDF_QUERY) {
    const query = PDF_QUERY.startsWith('?') ? PDF_QUERY.slice(1) : PDF_QUERY;
    const extraParams = new URLSearchParams(query);
    extraParams.forEach((value, key) => {
      targetUrl.searchParams.set(key, value);
    });
  }

  if (IS_COMPACT_PROFILE) {
    targetUrl.searchParams.set('pdf-compact', '1');
  }

  targetUrl.searchParams.set('pdf', '1');
  return targetUrl.toString();
}

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = chromium.launch({ headless: true });
  }

  const browser = await browserPromise;
  if (!browser.isConnected()) {
    browserPromise = chromium.launch({ headless: true });
    return browserPromise;
  }

  return browser;
}

async function closeBrowser() {
  if (!browserPromise) {
    return;
  }

  try {
    const browser = await browserPromise;
    if (browser.isConnected()) {
      await browser.close();
    }
  } finally {
    browserPromise = null;
  }
}

function isTransientError(error) {
  const message = String(error && error.message ? error.message : '');
  return (
    error &&
    (error.name === 'TimeoutError' ||
      /timeout|target closed|navigation|net::|protocol error|browser has disconnected/i.test(message))
  );
}

async function renderPdfOnce() {
  const browser = await getBrowser();
  const context = await browser.newContext({
    viewport: A4_VIEWPORT,
    // Increase device scale for rasterized effects (e.g., shadows/gradients) to look crisp in PDF viewers.
    deviceScaleFactor: PDF_DEVICE_SCALE_FACTOR,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(NAVIGATION_TIMEOUT_MS);
  page.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT_MS);

  try {
    await page.emulateMedia({ media: 'print' });

    const targetUrl = buildTargetUrl();
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: NAVIGATION_TIMEOUT_MS });

    await page.waitForSelector('.pdf-page', { timeout: NAVIGATION_TIMEOUT_MS });
    await page.waitForFunction(
      () => window.__PDF_READY__ === true,
      null,
      { timeout: NAVIGATION_TIMEOUT_MS }
    );

    const expectedCount = await page.evaluate(() => window.__PDF_PAGE_COUNT__ || 0);
    if (expectedCount > 0) {
      await page.waitForFunction(
        count => document.querySelectorAll('.pdf-page').length === count,
        expectedCount,
        { timeout: NAVIGATION_TIMEOUT_MS }
      );
    } else {
      await page.waitForFunction(
        () => document.querySelectorAll('.pdf-page').length > 0,
        null,
        { timeout: NAVIGATION_TIMEOUT_MS }
      );
    }

    // Wait for web fonts to avoid layout shifts between pages.
    await page.waitForFunction(
      () => !document.fonts || document.fonts.status === 'loaded',
      null,
      { timeout: NAVIGATION_TIMEOUT_MS }
    );

    const pdfError = await page.evaluate(() => window.__PDF_ERROR__);
    if (pdfError) {
      throw new Error(`PDF render error: ${pdfError}`);
    }

    // Scroll once to trigger any lazy-loaded assets before capture.
    await page.evaluate(async () => {
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise(resolve => setTimeout(resolve, 250));
      window.scrollTo(0, 0);
    });

    // Ensure background colors are preserved in print output.
    await page.addStyleTag({
      content: 'html{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }',
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true, // Respect CSS A4 sizing and page breaks.
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
      },
      timeout: PDF_TIMEOUT_MS,
    });

    return pdfBuffer;
  } finally {
    await context.close();
  }
}

async function renderPdfWithRetry() {
  let attempt = 0;

  while (true) {
    try {
      return await renderPdfOnce();
    } catch (error) {
      if (attempt >= MAX_RETRIES || !isTransientError(error)) {
        throw error;
      }

      attempt += 1;
    }
  }
}

module.exports = {
  renderPdfWithRetry,
  closeBrowser,
};
