// =============================================================================
// DECLARATION CARD
// Creates a declaration/statement text (no card styling)
// =============================================================================

/**
 * Formats current date in English format: "Milan, DD Month YYYY"
 */
function formatCurrentDate() {
  const now = new Date();
  const day = now.getDate();
  const year = now.getFullYear();
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const month = months[now.getMonth()];
  
  return `Milan, ${day} ${month} ${year}`;
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
        The undersigned <span class="font-bold">Marco Cremaschi</span>, born in
        <span class="font-bold">Chiari (BS) on 04/10/1983</span>, residing at
        <span class="font-bold">Viale Gramsci no. 730, 20099 Sesto San Giovanni (MI)</span>, Tax Code
        <span class="font-bold">CRMMRC83R04C618I</span>, Tel. <span class="font-bold">3664168368</span>, E-mail:
        <span class="font-bold">cremarco@gmail.com</span>
        , PEC (certified email): <span class="font-bold">marco.cremaschi@postecertifica.it</span>
        , aware of the criminal penalties provided for false declarations and falsification of documents, pursuant to Articles 46, 47 and 76 of Presidential Decree no. 445 of 28 December 2000,
      </p>
      <p class="mb-0">&nbsp;</p>
      <p class="mb-0 font-bold">DECLARES</p>
      <p class="mb-0">&nbsp;</p>
      <p class="mb-0">
        that the information provided in this curriculum vitae is true and accurate.
        <br aria-hidden="true" />
        <br aria-hidden="true" />
        Pursuant to Regulation (EU) 2016/679 (GDPR) and Legislative Decree no. 196/2003, as amended by Legislative Decree no. 101/2018, I authorize the processing of the personal data contained in this curriculum vitae for purposes related to the evaluation of my application and/or potential collaboration relationships.
      </p>
      <p class="mb-0">&nbsp;</p>
      <p class="mb-0">&nbsp;</p>
      <p class="mb-0">${currentDate}</p>
      <div class="flex justify-end mt-4">
        <div class="relative inline-flex items-center justify-center border border-slate-500 px-1 py-2 mr-8">
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-xs-6 font-dm-sans text-slate-500 opacity-60 text-center">Marco Cremaschi</div>
          </div>
          <img src="img/signature.png" alt="Signature" class="h-24 object-contain relative z-10">
        </div>
      </div>
    </div>
  `;
  
  return container;
}
