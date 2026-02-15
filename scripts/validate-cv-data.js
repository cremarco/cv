const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ROOT_DIR = process.cwd();
const CV_DATA_PATH = path.join(ROOT_DIR, 'data', 'cv.json');
const SCHEMA_PATH = path.join(ROOT_DIR, 'schemas', 'cv.schema.json');
const REPORT_PATH = path.join(ROOT_DIR, 'dist', 'verification', 'data-validation-report.json');

const MONTH_PATTERN = '(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)';
const SIMPLE_DATE_PATTERN = `(${MONTH_PATTERN} \\d{4}|\\d{4})`;
const PERIOD_PATTERN = new RegExp(`^${SIMPLE_DATE_PATTERN}( - (${SIMPLE_DATE_PATTERN}|Present|Current))?$`);
const UPDATE_DATE_PATTERN = new RegExp(`^\\d{1,2} ${MONTH_PATTERN} \\d{4}$`);

const LINK_FIELD_CANDIDATES = new Set(['link', 'url', 'thesis_link', 'ceur_url']);
const DATE_FIELD_CANDIDATES = new Set(['time_period', 'period', 'date']);
const DUPLICATE_TEXT_FIELDS = new Set(['topic', 'description', 'title', 'activities']);
const AUXILIARY_DATA_KEYS = new Set(['research_metrics']);

function loadJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function isExternalUrl(value) {
  return /^https?:\/\//i.test(value);
}

function isSpecialLink(value) {
  return /^(mailto:|tel:)/i.test(value);
}

function isLikelyAssetPath(value) {
  return /^(files|img|data|dist|src)\//i.test(value);
}

function isLocalLinkToCheck(value) {
  if (!value || isExternalUrl(value) || isSpecialLink(value)) return false;
  return isLikelyAssetPath(value);
}

function resolveLocalPath(refValue) {
  return path.resolve(ROOT_DIR, refValue.replace(/^\/+/, ''));
}

function ensureReportDir(reportPath) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
}

function validateSchema(data, schema, errors) {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    for (const issue of validate.errors || []) {
      errors.push(`[schema] ${issue.instancePath || '/'} ${issue.message}`);
    }
  }
}

async function getRenderedSectionKeys() {
  const fallback = [
    'academic_experiences',
    'foreign_research_contracts',
    'research_and_technology_transfer',
    'entrepreneurial_initiatives',
    'education',
    'teaching_in_phd_courses',
    'teaching',
    'teaching_webinar',
    'thesis_supervisor',
    'awards',
    'publications',
    'community_service',
    'community_service_editorial',
    'international_research_projects',
    'italian_research_projects',
    'projects',
    'tender_commissions',
  ];

  try {
    const configModule = await import(path.join(ROOT_DIR, 'src', 'config.js'));
    const pipeline = configModule.SECTION_RENDER_PIPELINE;
    if (!Array.isArray(pipeline) || pipeline.length === 0) return new Set(fallback);

    const keys = new Set();
    for (const step of pipeline) {
      if (step.sectionKey) keys.add(step.sectionKey);
      if (step.dataKey) keys.add(step.dataKey);
    }
    return keys.size > 0 ? keys : new Set(fallback);
  } catch (error) {
    return new Set(fallback);
  }
}

function walkData(node, context, onValue) {
  if (Array.isArray(node)) {
    node.forEach((item, index) => walkData(item, `${context}[${index}]`, onValue));
    return;
  }

  if (!node || typeof node !== 'object') {
    return;
  }

  for (const [key, value] of Object.entries(node)) {
    const currentPath = `${context}.${key}`;
    onValue({ key, value, currentPath, contextNode: node });
    walkData(value, currentPath, onValue);
  }
}

function validateFieldFormats(data, errors, warnings) {
  const duplicateRegistry = new Map();

  for (const [sectionName, sectionValue] of Object.entries(data)) {
    walkData(sectionValue, sectionName, ({ key, value, currentPath }) => {
      if (typeof value === 'string') {
        if (DATE_FIELD_CANDIDATES.has(key) && !PERIOD_PATTERN.test(value.trim())) {
          errors.push(`[date-format] ${currentPath} has unsupported value: "${value}"`);
        }

        if (key === 'update_date' && !UPDATE_DATE_PATTERN.test(value.trim())) {
          errors.push(`[date-format] ${currentPath} must be "DD Mon YYYY": "${value}"`);
        }

        if (LINK_FIELD_CANDIDATES.has(key) && isLocalLinkToCheck(value)) {
          const targetPath = resolveLocalPath(value);
          if (!fs.existsSync(targetPath)) {
            errors.push(`[missing-file] ${currentPath} -> ${value}`);
          }
        }

        if (key === 'logo') {
          const logoPath = path.join(ROOT_DIR, 'img', 'mini-logo', value);
          if (!fs.existsSync(logoPath)) {
            errors.push(`[missing-logo] ${currentPath} -> ${value}`);
          }
        }

        if (DUPLICATE_TEXT_FIELDS.has(key)) {
          if (currentPath.includes('.bibtex.')) return;

          const normalized = normalizeText(value);
          if (normalized.length >= 35) {
            const fingerprint = `${sectionName}:${key}:${normalized}`;
            const previous = duplicateRegistry.get(fingerprint);
            if (previous) {
              warnings.push(`[duplicate-text] ${currentPath} duplicates ${previous}`);
            } else {
              duplicateRegistry.set(fingerprint, currentPath);
            }
          }
        }
      }
    });
  }
}

function validateRenderedSections(data, renderedSections, warnings) {
  const topLevelKeys = Object.keys(data);

  for (const sectionKey of topLevelKeys) {
    if (AUXILIARY_DATA_KEYS.has(sectionKey)) continue;

    if (!renderedSections.has(sectionKey)) {
      warnings.push(`[orphan-section] "${sectionKey}" exists in data/cv.json but is not rendered in the section pipeline`);
    }
  }
}

(async () => {
  const errors = [];
  const warnings = [];

  try {
    const data = loadJson(CV_DATA_PATH);
    const schema = loadJson(SCHEMA_PATH);

    validateSchema(data, schema, errors);
    validateFieldFormats(data, errors, warnings);

    const renderedSections = await getRenderedSectionKeys();
    validateRenderedSections(data, renderedSections, warnings);

    const result = {
      generatedAt: new Date().toISOString(),
      summary: {
        errors: errors.length,
        warnings: warnings.length,
      },
      errors,
      warnings,
    };

    ensureReportDir(REPORT_PATH);
    fs.writeFileSync(REPORT_PATH, `${JSON.stringify(result, null, 2)}\n`, 'utf8');

    if (errors.length > 0) {
      console.error(`\n[data-validation] FAILED with ${errors.length} error(s).`);
      errors.forEach((message) => console.error(`  - ${message}`));
    } else {
      console.log(`\n[data-validation] OK (0 blocking errors).`);
    }

    if (warnings.length > 0) {
      console.warn(`[data-validation] ${warnings.length} warning(s):`);
      warnings.forEach((message) => console.warn(`  - ${message}`));
    }

    console.log(`[data-validation] report: ${path.relative(ROOT_DIR, REPORT_PATH)}`);

    process.exitCode = errors.length > 0 ? 1 : 0;
  } catch (error) {
    console.error('[data-validation] fatal error:', error && error.message ? error.message : error);
    process.exitCode = 1;
  }
})();
