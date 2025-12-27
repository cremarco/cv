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
    <div class="text-xs-8 font-dm-sans font-medium text-ink leading-normal mb-0">
      <p class="mb-0">
        <span>Io sottoscritto </span>
        <span class="font-bold">Marco Cremaschi</span>
        <span>, nato a Chiari (BS) il 04/10/1983, residente a Sesto San Giovanni (Mi) in Viale Gramsci, 730, CF: CRMMRC83R04C618I, </span>
      </p>
      <p class="mb-0">tel: 3664168368, email: cremarco@gmail.com, consapevole delle sanzioni penali, nel caso di dichiarazioni non veritiere e falsità negli atti, richiamate dagli artt. 46 e 47 del DPR 445 del 28/12/2000,</p>
      <p class="mb-0">&nbsp;</p>
      <p class="mb-0 font-bold">DICHIARA</p>
      <p class="mb-0">&nbsp;</p>
      <p class="mb-0">
        che le informazioni sopra riportate sono veritiere.
        <br aria-hidden="true" />
        <br aria-hidden="true" />
        "Autorizzo il trattamento dei miei dati personali ai sensi del GDPR UE 2016/679 "Regolamento Generale sulla Protezione dei Dati""
      </p>
      <p class="mb-0">&nbsp;</p>
      <p class="mb-0">&nbsp;</p>
      <p class="mb-0">${currentDate}</p>
    </div>
  `;
  
  return container;
}

