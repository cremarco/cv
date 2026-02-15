const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT_DIR = process.cwd();
const CV_DATA_PATH = path.join(ROOT_DIR, 'data', 'cv.json');
const INDEX_PATH = path.join(ROOT_DIR, 'index.html');
const REPORT_PATH = path.join(ROOT_DIR, 'dist', 'verification', 'external-sources-report.json');

const EXTERNAL_LINK_FIELDS = new Set(['link', 'url', 'thesis_link', 'ceur_url']);

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function ensureReportDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function normalizeScholarUrl(url) {
  const parsed = new URL(url);
  if (!parsed.searchParams.has('hl')) {
    parsed.searchParams.set('hl', 'en');
  }
  return parsed.toString();
}

function collectLinksFromData(data) {
  const links = new Set();

  function walk(node) {
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    if (!node || typeof node !== 'object') {
      return;
    }

    for (const [key, value] of Object.entries(node)) {
      if (typeof value === 'string' && EXTERNAL_LINK_FIELDS.has(key) && /^https?:\/\//i.test(value)) {
        links.add(value.trim());
      }
      walk(value);
    }
  }

  walk(data);
  return links;
}

function collectLinksFromIndex(htmlText) {
  const links = new Set();
  const hrefRegex = /href="(https?:[^"#]+)"/g;

  for (const match of htmlText.matchAll(hrefRegex)) {
    links.add(match[1]);
  }

  return links;
}

function parseInteger(value) {
  if (typeof value !== 'string') return null;
  const normalized = value.replace(/,/g, '').trim();
  if (!/^\d+$/.test(normalized)) return null;
  return Number(normalized);
}

async function verifyGoogleScholar(expectedMetrics) {
  const result = {
    source: 'google_scholar',
    profileUrl: expectedMetrics.url,
    checkedUrl: null,
    status: 'not_checked',
    expected: {
      citations: expectedMetrics.citations,
      h_index: expectedMetrics.h_index,
      i10_index: expectedMetrics.i10_index,
    },
    observed: null,
    notes: [],
  };

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36',
    });

    const targetUrl = normalizeScholarUrl(expectedMetrics.url);
    result.checkedUrl = targetUrl;

    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForSelector('#gsc_rsb_st', { timeout: 20000 });

    const tableData = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('#gsc_rsb_st tr'));
      const metrics = {};

      rows.forEach((row) => {
        const cells = Array.from(row.querySelectorAll('td')).map((cell) => cell.textContent.trim());
        if (cells.length >= 2) {
          metrics[cells[0].toLowerCase()] = cells[1];
        }
      });

      return metrics;
    });

    const observed = {
      citations: parseInteger(tableData.citations),
      h_index: parseInteger(tableData['h-index']),
      i10_index: parseInteger(tableData['i10-index']),
    };

    result.observed = observed;

    const mismatches = [];
    for (const field of ['citations', 'h_index', 'i10_index']) {
      if (typeof observed[field] !== 'number') {
        mismatches.push(`${field} not readable from profile`);
      } else if (observed[field] !== expectedMetrics[field]) {
        mismatches.push(`${field}: expected ${expectedMetrics[field]}, observed ${observed[field]}`);
      }
    }

    if (mismatches.length === 0) {
      result.status = 'ok';
    } else {
      result.status = 'mismatch';
      result.notes.push(...mismatches);
    }
  } catch (error) {
    result.status = 'error';
    result.notes.push(error && error.message ? error.message : String(error));
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return result;
}

async function verifyOrcid(orcidData) {
  const result = {
    source: 'orcid',
    profileUrl: orcidData.url,
    status: 'not_checked',
    observed: null,
    notes: [],
  };

  const apiUrl = `https://pub.orcid.org/v3.0/${encodeURIComponent(orcidData.id)}/person`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      result.status = 'error';
      result.notes.push(`HTTP ${response.status} from ORCID API`);
      return result;
    }

    const payload = await response.json();
    const observedPath = payload.path || null;
    const observedId = observedPath
      ? String(observedPath).split('/').filter(Boolean)[0] || null
      : null;

    result.observed = {
      path: observedPath,
      id: observedId,
      givenName: payload.name?.['given-names']?.value || null,
      familyName: payload.name?.['family-name']?.value || null,
    };

    if (observedId !== orcidData.id) {
      result.status = 'mismatch';
      result.notes.push(`Expected ORCID ${orcidData.id}, observed ${observedId}`);
    } else {
      result.status = 'ok';
    }
  } catch (error) {
    result.status = 'error';
    result.notes.push(error && error.message ? error.message : String(error));
  }

  return result;
}

async function verifyDois(dois) {
  const entries = [];

  for (const doi of dois) {
    const endpoint = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
    try {
      const response = await fetch(endpoint, {
        headers: {
          'User-Agent': 'cv-verifier/1.0 (mailto:invalid@example.com)',
        },
      });

      entries.push({
        doi,
        endpoint,
        status: response.ok ? 'ok' : 'error',
        httpStatus: response.status,
      });
    } catch (error) {
      entries.push({
        doi,
        endpoint,
        status: 'error',
        httpStatus: null,
        error: error && error.message ? error.message : String(error),
      });
    }
  }

  const summary = {
    total: entries.length,
    ok: entries.filter((entry) => entry.status === 'ok').length,
    error: entries.filter((entry) => entry.status === 'error').length,
  };

  return { summary, entries };
}

function classifyHttpStatus(status) {
  if (status >= 200 && status < 400) return 'ok';
  if ([401, 403, 429, 451, 999].includes(status)) return 'blocked/bot-protected';
  if (status >= 400) return 'broken';
  return 'network-error';
}

function classifyFetchError(error) {
  const message = String(error && error.message ? error.message : error).toLowerCase();
  const code = String(error?.cause?.code || '').toUpperCase();

  if (error && error.name === 'AbortError') return 'timeout';
  if (code === 'ENOTFOUND' || code === 'EAI_AGAIN' || message.includes('getaddrinfo')) return 'dns-error';
  if (code.startsWith('ERR_TLS') || message.includes('certificate') || message.includes('ssl')) return 'tls-error';

  return 'network-error';
}

async function verifyExternalLink(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    let response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
    });

    if (response.status === 405 || response.status === 400) {
      response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
      });
    }

    clearTimeout(timeout);

    return {
      url,
      status: classifyHttpStatus(response.status),
      httpStatus: response.status,
      finalUrl: response.url,
    };
  } catch (error) {
    clearTimeout(timeout);
    return {
      url,
      status: classifyFetchError(error),
      httpStatus: null,
      error: error && error.message ? error.message : String(error),
    };
  }
}

async function verifyExternalLinks(links) {
  const queue = [...links];
  const results = [];
  const batchSize = 6;

  for (let index = 0; index < queue.length; index += batchSize) {
    const chunk = queue.slice(index, index + batchSize);
    const chunkResults = await Promise.all(chunk.map((url) => verifyExternalLink(url)));
    results.push(...chunkResults);
  }

  const summary = {
    total: results.length,
    ok: results.filter((entry) => entry.status === 'ok').length,
    blocked: results.filter((entry) => entry.status === 'blocked/bot-protected').length,
    broken: results.filter((entry) => entry.status === 'broken').length,
    dnsError: results.filter((entry) => entry.status === 'dns-error').length,
    tlsError: results.filter((entry) => entry.status === 'tls-error').length,
    timeout: results.filter((entry) => entry.status === 'timeout').length,
    networkError: results.filter((entry) => entry.status === 'network-error').length,
  };

  return { summary, entries: results };
}

function printSummary(report) {
  const scholar = report.sources.googleScholar;
  const orcid = report.sources.orcid;
  const dois = report.sources.doi.summary;
  const links = report.sources.externalLinks.summary;

  console.log('\n[verify-external] Results');
  console.log(`  - Google Scholar: ${scholar.status}`);
  if (scholar.notes.length > 0) {
    scholar.notes.forEach((note) => console.log(`    * ${note}`));
  }

  console.log(`  - ORCID: ${orcid.status}`);
  if (orcid.notes.length > 0) {
    orcid.notes.forEach((note) => console.log(`    * ${note}`));
  }

  console.log(`  - DOI (Crossref): ${dois.ok}/${dois.total} ok`);
  console.log(
    `  - External links: ok=${links.ok}, blocked=${links.blocked}, broken=${links.broken}, dns=${links.dnsError}, tls=${links.tlsError}, timeout=${links.timeout}, network=${links.networkError}`
  );

  console.log(`[verify-external] report: ${path.relative(ROOT_DIR, REPORT_PATH)}`);
}

(async () => {
  try {
    const cvData = loadJson(CV_DATA_PATH);
    const indexHtml = readFile(INDEX_PATH);

    const scholarResult = await verifyGoogleScholar(cvData.research_metrics.google_scholar);
    const orcidResult = await verifyOrcid(cvData.research_metrics.orcid);

    const dois = [...new Set((cvData.publications?.papers || []).map((paper) => paper.doi).filter(Boolean))];
    const doiResult = await verifyDois(dois);

    const externalLinks = new Set([
      ...collectLinksFromData(cvData),
      ...collectLinksFromIndex(indexHtml),
    ]);
    const linkResult = await verifyExternalLinks([...externalLinks]);

    const report = {
      generatedAt: new Date().toISOString(),
      assumptions: [
        'A blocked/bot-protected link is reported as warning, not as data error.',
        'Scopus may be inaccessible from automated checks due to anti-bot protections.',
      ],
      sources: {
        googleScholar: scholarResult,
        orcid: orcidResult,
        doi: doiResult,
        externalLinks: linkResult,
      },
    };

    ensureReportDir(REPORT_PATH);
    fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

    printSummary(report);

    process.exitCode = 0;
  } catch (error) {
    console.error('[verify-external] fatal error:', error && error.message ? error.message : error);
    process.exitCode = 1;
  }
})();
