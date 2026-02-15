# CV Web + PDF (Print-grade)

Questo progetto genera e pubblica un CV accademico in formato web e PDF multipagina A4.
Il rendering PDF avviene server-side con Playwright (Chromium headless), mantenendo testo selezionabile e impaginazione coerente.

## Stack e struttura

- Frontend: HTML + JavaScript modulare (`src/`)
- Stili: Tailwind CSS (`src/input.css` -> `dist/output.css`)
- Dati: `data/cv.json`
- Generazione PDF: `scripts/pdf-renderer.js`, `scripts/pdf-generate.js`, `scripts/pdf-server.js`

## Modalità PDF/Print

La SPA espone la modalità PDF tramite:

- `/?pdf=1` oppure `?pdf=true`
- `/print`

In modalità PDF:

- elementi con `data-pdf-hide` vengono nascosti
- animazioni/transizioni vengono disabilitate
- le pagine `.pdf-page` sono renderizzate in formato A4

### Opzioni rendering

Flag supportati via query string o hash:

- `no-personal-data`: nasconde dati personali e dichiarazione/firma
- `no-link`: rimuove link a file interni (es. `files/...`)
- `pdf-compact` (o `compact`): riduce il peso del PDF comprimendo immagini locali

Esempi:

- `http://localhost:4173/?pdf=1&no-personal-data&no-link`
- `http://localhost:4173/#pdf-compact=1`

## Comandi principali

### Build CSS

```bash
npm run build
```

### Watch CSS

```bash
npm run watch
```

### Generazione PDF da CLI

```bash
npm run pdf:generate
```

`pdf:generate` avvia automaticamente un server statico locale interno (non serve avviare `python -m http.server`).

Output di default:

- `dist/marco-cremaschi-cv.pdf`

PDF compatto:

```bash
npm run pdf:generate:compact
```

### Server HTTP per PDF on-demand

```bash
npm run pdf:server
```

Endpoint:

- `http://localhost:8787/api/pdf`

Differenza operativa:

- `pdf:generate`: produce un file PDF locale e termina
- `pdf:server`: espone un endpoint API che genera PDF per ogni richiesta

## Quality gates

```bash
npm run lint
npm run validate:data
npm run test
npm run verify:external
npm run smoke:pdf
npm run check
```

`npm run check` esegue la pipeline completa di qualità/manutenibilità.

## Verifica correttezza informazioni

### Validazione locale dataset

```bash
npm run validate:data
```

Controlla:

- validità JSON/schema (`schemas/cv.schema.json`)
- esistenza file locali referenziati (`files/...`, `img/...`)
- coerenza formati data usati dal renderer
- sezioni dati non renderizzate (warning)
- duplicati testuali sospetti (warning)

Report:

- `dist/verification/data-validation-report.json`

### Verifica fonti esterne

```bash
npm run verify:external
```

Controlla:

- Google Scholar (Playwright) e confronto metriche
- ORCID via API pubblica
- DOI via Crossref API
- link esterni con classificazione: `ok`, `blocked/bot-protected`, `broken`, `dns-error`, `tls-error`, `timeout`, `network-error`

Report:

- `dist/verification/external-sources-report.json`

Nota: alcuni provider (es. Scopus, LinkedIn o siti protetti da Cloudflare) possono risultare `blocked/bot-protected` anche se il link è corretto in navigazione manuale.

## Variabili ambiente (PDF)

- `BASE_URL`: URL base sito (default `http://localhost:4173`)
- `OUTPUT_PDF`: path output PDF (default `dist/marco-cremaschi-cv.pdf`)
- `PDF_SERVER_PORT`: porta server statico interno usata da `pdf:generate` (default `4173`)
- `PDF_NAV_TIMEOUT_MS`: timeout navigazione Playwright (default `30000`)
- `PDF_TIMEOUT_MS`: timeout chiamata `page.pdf()` (default `30000`)
- `PDF_DEVICE_SCALE_FACTOR`: scala dispositivo (default `2`, oppure `1` in profilo compact)
- `PDF_PORT`: porta API per `pdf:server` (default `8787`)
- `PDF_QUERY`: query addizionale per la stampa (es. `no-link&no-personal-data`)
- `PDF_PROFILE`: profilo rendering (`compact` abilita anche `pdf-compact`)
- `PDF_COMPACT`: flag booleano alternativo a `PDF_PROFILE=compact`
- `PDF_COMPRESS`: abilita compressione finale via Ghostscript
- `PDF_MAX_KB`: target massimo KB per compressione
- `PDF_COMPRESS_PROFILE`: profilo Ghostscript (`screen`, `ebook`, `printer`, `prepress`, `default`)
- `GHOSTSCRIPT_BIN`: percorso binario Ghostscript (default `gs`)

## CI/CD

- CI (`.github/workflows/ci.yml`): esegue `npm run check`
- Deploy (`.github/workflows/deploy.yml`): pubblica solo artefatti runtime da cartella `site/`:
  - `index.html`, `src`, `data`, `img`, `dist`, `files`, `robots.txt`

