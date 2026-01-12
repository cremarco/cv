# CV PDF Generation (Print-Grade)

Questo progetto genera un PDF multipagina A4 “print‑grade” partendo da una singola pagina SPA che contiene tutte le sezioni.
La generazione avviene server‑side via Playwright (Chromium headless), con testo selezionabile e layout fedele.

## Modalita PDF/Print

La SPA espone una modalita PDF tramite query param o route:

- `/?pdf=1` (o `?pdf=true`)
- `/print`

In modalita PDF:

- elementi marcati con `data-pdf-hide` vengono nascosti
- animazioni/transitions sono disabilitate per stabilita layout
- tutte le pagine (sezioni) sono visibili con dimensione A4

Opzioni di rendering via query param (o hash, vedi esempi):

- `no-personal-data`: nasconde email, website, phone e address dalla sidebar e la sezione dichiarazione/firma
- `no-link`: nasconde i link che puntano a file interni al progetto (es. `files/...`)
- `pdf-compact`: riduce il peso del PDF comprimendo le immagini locali (utile per invii via email)

Esempi URL:

- query: `http://localhost:4173/?no-personal-data&no-link`
- hash (utile con preview che aggiunge token): `http://127.0.0.1:3000/#no-personal-data&no-link`
- compatto: `http://localhost:4173/?pdf=1&pdf-compact=1`

I flag globali usati dal renderer:

- `window.__PDF_READY__`: true quando la pagina ha finito di renderizzare
- `window.__PDF_PAGE_COUNT__`: numero di pagine `.pdf-page`
- `window.__PDF_ERROR__`: eventuale errore di render

## Rendering server-side con Playwright

Lo script Playwright stampa solo un URL interno noto (no SSRF):

- `BASE_URL + "?pdf=1"`

Il renderer:

- `waitUntil: "networkidle"`
- attende `.pdf-page`
- attende `__PDF_READY__` e il count delle pagine
- attende il caricamento dei font
- fa uno scroll per triggerare lazy-load
- genera PDF con `preferCSSPageSize: true`

### Dipendenze

Assicurati di avere Chromium installato per Playwright:

```bash
npx playwright install chromium
```

## Comandi

### Build CSS

```bash
npm run build
```

### Generare un PDF (CLI)

1) avvia un server statico del sito:

```bash
python3 -m http.server 4173
```

2) genera il PDF:

```bash
BASE_URL=http://localhost:4173 npm run pdf:generate
```

Output di default: `dist/marco-cremaschi-cv.pdf`.

Con opzioni:

```bash
PDF_QUERY="no-personal-data&no-link" npm run pdf:generate
```

PDF compatto:

```bash
npm run pdf:generate:compact
```

Richiede Ghostscript per la compressione finale (`gs`).

### Avviare un endpoint PDF

```bash
BASE_URL=http://localhost:4173 npm run pdf:server
```

Endpoint: `http://localhost:8787/api/pdf`

## Variabili ambiente

- `BASE_URL`: base URL del sito (default `http://localhost:4173`)
- `OUTPUT_PDF`: path di output del PDF (default `dist/marco-cremaschi-cv.pdf`)
- `PDF_NAV_TIMEOUT_MS`: timeout navigazione (default 30000)
- `PDF_TIMEOUT_MS`: timeout generazione PDF (default 30000)
- `PDF_DEVICE_SCALE_FACTOR`: scala device per migliorare resa di ombre/gradienti (default 2)
- `PDF_PORT`: porta del server PDF (default 8787)
- `PDF_QUERY`: query string aggiuntiva da appendere all'URL di stampa (es. `no-link&no-personal-data`)
- `PDF_PROFILE`: profilo di rendering (`compact` abilita `pdf-compact` e scala device piu bassa)
- `PDF_COMPACT`: flag booleano alternativo a `PDF_PROFILE=compact`
- `PDF_COMPRESS`: attiva la compressione finale con Ghostscript
- `PDF_MAX_KB`: target massimo in KB (usa Ghostscript con profili `ebook`/`screen`)
- `PDF_COMPRESS_PROFILE`: profilo Ghostscript (`screen`, `ebook`, `printer`, `prepress`, `default`)
- `GHOSTSCRIPT_BIN`: path al binario Ghostscript (default `gs`)

## Note di manutenzione

- Le pagine A4 sono identificabili tramite `.pdf-page`.
- Le regole CSS per la modalita PDF sono in `src/input.css`.
- La logica client (PDF mode + impaginazione) e in `src/app.js`.
- I dati del CV sono in `data/cv.json`.
- Il renderer Playwright e in `scripts/pdf-renderer.js`.
