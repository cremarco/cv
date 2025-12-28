// =============================================================================
// DECLARATION CARD
// Creates a declaration/statement text (no card styling)
// =============================================================================

/**
 * Formats current date in Italian format: "Milano, DD mese YYYY"
 */
function formatCurrentDate() {
  const now = new Date();
  const day = now.getDate();
  const year = now.getFullYear();
  
  const months = [
    'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
    'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'
  ];
  
  const month = months[now.getMonth()];
  
  return `Milano, ${day} ${month} ${year}`;
}

/**
 * Creates a declaration text with personal information and GDPR authorization
 */
export function createDeclarationCard() {
  const container = document.createElement('div');
  container.className = 'w-full';
  
  const currentDate = formatCurrentDate();
  
  // Using text-xs-8 (11px) for better readability
  container.innerHTML = `
    <div class="text-xs-8 font-dm-sans font-medium text-slate-800 leading-normal mb-0">
      <p class="mb-0">
        Io sottoscritto <span class="font-bold">Marco Cremaschi</span>, nato a
        <span class="font-bold">Chiari (BS) il 04/10/1983</span>, residente a
        <span class="font-bold">Sesto San Giovanni (Mi) in Viale Gramsci, 730</span>, CF:
        <span class="font-bold">CRMMRC83R04C618I</span>, tel: <span class="font-bold">3664168368</span>, email:
        <span class="font-bold">cremarco@gmail.com</span>, consapevole delle sanzioni penali, nel caso di dichiarazioni non veritiere e falsità negli atti, richiamate dagli artt. 46 e 47 del DPR 445 del 28/12/2000,
      </p>
      <p class="mb-0">&nbsp;</p>
      <p class="mb-0 font-bold">DICHIARA</p>
      <p class="mb-0">&nbsp;</p>
      <p class="mb-0">
        che le informazioni sopra riportate sono veritiere.
        <br aria-hidden="true" />
        <br aria-hidden="true" />
        Autorizzo il trattamento dei dati personali contenuti nel presente curriculum ai sensi dell'art. 13 del Regolamento (UE) 2016/679 (GDPR) e del D.Lgs. 196/2003, come modificato dal D.Lgs. 101/2018.
      </p>
      <p class="mb-0">&nbsp;</p>
      <p class="mb-0">&nbsp;</p>
      <p class="mb-0">${currentDate}</p>
      <div class="flex justify-end mt-4">
        <div class="relative inline-flex items-center justify-center border border-slate-500 px-1 py-2 mr-8">
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-xs-6 font-dm-sans text-slate-500 opacity-60 text-center">Marco Cremaschi</div>
          </div>
          <img src="img/signature.png" alt="Firma" class="h-24 object-contain relative z-10">
        </div>
      </div>
    </div>
  `;
  
  return container;
}
