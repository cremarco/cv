# CV Web + PDF (Print-grade)

Application to manage and render an academic CV in dual format:

- static web (`index.html` + `src/` modules)
- multi-page A4 PDF generated with Playwright/Chromium

PDF rendering preserves selectable text, consistent pagination, and automated data checks.

## 1. Technical overview

- Frontend: HTML + JavaScript ES Modules (no JS bundler)
- Styles: Tailwind CSS (`src/input.css` -> `dist/output.css`)
- Dataset: `data/cv.json` (validated against a JSON schema)
- Section rendering: pipeline configured in `src/config.js`
- PDF: `scripts/pdf-renderer.js`, `scripts/pdf-generate.js`, `scripts/pdf-server.js`
- Quality checks: lint, tests, dataset validation, external source verification, PDF smoke test

## 2. Requirements

- Node.js 20+ recommended (CI uses Node 20)
- npm
- Playwright Chromium installed locally

Install Playwright browser:

```bash
npx playwright install chromium
```

On Linux CI/container:

```bash
npx playwright install --with-deps chromium
```

## 3. Project setup

```bash
npm ci
```

Initial CSS build:

```bash
npm run build
```

CSS watch mode:

```bash
npm run watch
```

## 4. Local run (web version)

The app is static, but it must be served over HTTP (not `file://`) so dataset `fetch` works.

Quick example on port `4173`:

```bash
python3 -m http.server 4173
```

Then open:

- `http://localhost:4173/`

## 5. Client-side PDF/Print mode

PDF mode can be enabled with:

- `/?pdf=1` or `/?pdf=true`
- `/print`

In PDF mode:

- global state is set (`window.__PDF_READY__`, `window.__PDF_PAGE_COUNT__`, `window.__PDF_ERROR__`)
- `.pdf-page` elements are treated as A4 pages
- additional rendering options can be applied

### Supported flags (query string or hash)

- `no-personal-data`: hides personal data blocks and declaration/signature
- `no-link`: removes links to internal files (`/files`, `/img`, `/data`, `/dist`, `/src`)
- `pdf-compact` or `compact`: flattens visual effects and compresses local images

Examples:

- `http://localhost:4173/?pdf=1&no-personal-data&no-link`
- `http://localhost:4173/?pdf=1&pdf-compact=1`
- `http://localhost:4173/#compact=1`

## 6. CLI PDF generation

Main command:

```bash
npm run pdf:generate
```

Behavior:

- automatically starts a temporary local static server
- renders the CV in PDF mode through Playwright
- writes output to `dist/marco-cremaschi-cv.pdf`
- closes server and browser when done

Compact version:

```bash
npm run pdf:generate:compact
```

## 7. On-demand PDF API server

```bash
npm run pdf:server
```

Endpoint:

- `GET http://localhost:8787/api/pdf`

Difference between approaches:

- `pdf:generate`: generates one local file and exits
- `pdf:server`: exposes an endpoint that generates a PDF per request

Important note:

- `pdf:server` does **not** start a static server for the site
- it requires `BASE_URL` to point to a reachable CV instance (local or remote)

Example:

```bash
BASE_URL=http://localhost:4173 PDF_PORT=8787 npm run pdf:server
```

## 8. PDF environment variables

### Rendering and routing

- `BASE_URL` (default `http://localhost:4173`): base URL for rendering
- `PDF_QUERY` (e.g. `no-link&no-personal-data`): extra query params appended to the URL
- `PDF_PROFILE` (`compact`, `compact-strong`, ...): rendering profile
- `PDF_COMPACT` (boolean): alternative to `PDF_PROFILE=compact`
- `PDF_DEVICE_SCALE_FACTOR` (default `2`, or `1` in compact): Playwright device scale

### Output and ports

- `OUTPUT_PDF` (default `dist/marco-cremaschi-cv.pdf`): output file path
- `PDF_SERVER_PORT` (default `4173`): internal static server port used by `pdf:generate`
- `PDF_PORT` (default `8787`): HTTP API port used by `pdf:server`

### Timeouts

- `PDF_NAV_TIMEOUT_MS` (default `30000`): navigation/pre-render timeout
- `PDF_TIMEOUT_MS` (default `30000`): `page.pdf()` timeout

### Compression (optional, Ghostscript)

- `PDF_COMPRESS` (boolean): enables final compression
- `PDF_MAX_KB` (number): target file size in KB
- `PDF_COMPRESS_PROFILE` (`screen`, `ebook`, `printer`, `prepress`, `default`)
- `GHOSTSCRIPT_BIN` (default `gs`): Ghostscript binary path

## 9. Data model and content updates

Main file:

- `data/cv.json`

Schema:

- `schemas/cv.schema.json`

Rendering pipeline (section order):

- `src/config.js` (`SECTION_RENDER_PIPELINE`)

Main practical rules:

- date fields (`time_period`, `period`, `date`): formats like `MMM YYYY`, `YYYY`, ranges `A - B`, with `Present`/`Current` supported
- `publications.update_date`: format `DD Mon YYYY` (e.g. `16 Feb 2026`)
- `logo` fields: filename must exist in `img/mini-logo/`
- local links in dataset: use repository paths (`files/...`, `img/...`, etc.)

## 10. Quality and validation commands

```bash
npm run lint
npm run validate:data
npm run test
npm run verify:external
npm run smoke:pdf
npm run check
```

Details:

- `lint`: ESLint checks on `.js/.mjs/.cjs`
- `validate:data`: schema validation + file/date consistency checks + orphan-section warnings
- `test`: Node unit tests (`tests/*.test.mjs`)
- `verify:external`: checks Google Scholar, ORCID, DOI (Crossref), external links
- `smoke:pdf`: end-to-end PDF generation smoke test (with retry on random port)
- `check`: full pipeline in sequence

Generated reports:

- `dist/verification/data-validation-report.json`
- `dist/verification/external-sources-report.json`

## 11. CI

- CI: `.github/workflows/ci.yml`
  - `npm ci`
  - install Playwright Chromium
  - `npm run check`

## 12. Repository structure (essential)

```text
.
├─ index.html
├─ data/cv.json
├─ src/
│  ├─ main.js
│  ├─ config.js
│  ├─ data/loader.js
│  ├─ cards/
│  ├─ layout/
│  └─ utils/
├─ scripts/
│  ├─ pdf-renderer.js
│  ├─ pdf-generate.js
│  ├─ pdf-server.js
│  ├─ validate-cv-data.js
│  ├─ verify-external-sources.js
│  └─ smoke-pdf.js
├─ schemas/cv.schema.json
├─ tests/
├─ dist/
└─ files/
```

## 13. Quick troubleshooting

- `Port ... already in use`
  - change `PDF_SERVER_PORT` or free the port
- missing Playwright/Chromium error
  - run `npx playwright install chromium`
- `missing-file` / `missing-logo` errors
  - verify dataset paths against files actually present
- external links marked `blocked/bot-protected`
  - often expected (anti-bot); does not necessarily mean the link is wrong
