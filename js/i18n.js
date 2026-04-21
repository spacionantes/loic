/**
 * Bilingual FR/EN toggle.
 * Reads data-i18n / data-i18n-html / data-i18n-attr attributes.
 * Persists choice in localStorage. Defaults to 'en'.
 */

const STRINGS = {
  en: {
    'meta.description':   'BROOKE — filmmaker & director working across music and culture. Signals, transmissions, and frames from Coachella, Boiler Room and beyond.',
    'skip.link':          'Skip to work',
    'nav.work':           'Work',
    'nav.reel':           'Reel',
    'nav.about':          'About',
    'nav.clients':        'Clients',
    'nav.contact':        'Contact',
    'status.available':   'AVAILABLE FOR COMMISSIONS',
    'hero.sub':           'FILMMAKER / DIRECTOR — BASED IN NANTES',
    'hero.signal':        'SIGNAL RELAY ·',
    'hero.scroll':        'SCROLL · ENTER THE NETWORK',
    'reel.sound':         'TRANSMIT · SOUND',
    'reel.press':         'DOWNLOAD PRESS KIT',
    'work.title':         'SELECTED WORK',
    'work.intro':         'Transmissions captured in the field. Each node is a signal preserved from a moment that will not happen again.',
    'about.title':        'THE OPERATOR',
    'about.node':         'NODE · BROOKE / 00',
    'about.prose':        `<p>I film <em>what electricity looks like when it moves through a crowd</em>. Music, ritual, noise, light. My work lives where the shutter meets the synapse — the frames pulled from a set are the same frames that were about to be forgotten.</p><p>From Coachella main stages to basements wired by Boiler Room, I chase the exact millisecond a room realises it is alive. I work lean, with small teams, favoring proximity over polish. The camera is a sensor; the cut is a nerve.</p><p>Based in Nantes. Available worldwide.</p>`,
    'clients.title':      'SIGNAL PARTNERS',
    'clients.note':       'Built in collaboration with the producers, crews and artists that keep the signal clean. Full credits inside each case file.',
    'contact.title':      "LET'S TRANSMIT.",
    'contact.email':      'EMAIL',
    'contact.copied':     'SIGNAL COPIED ·',
    'contact.book':       'BOOK A CALL',
    'footer.rights':      'ALL SIGNALS RESERVED',
    'footer.eos':         'END OF SIGNAL',
    'footer.built':       'BUILT WITH LIGHT',
    'hud.uplink':         'UPLINK STABLE',
    'overlay.client':     'CLIENT',
    'overlay.year':       'YEAR',
    'overlay.format':     'FORMAT',
    'overlay.role':       'ROLE',
  },
  fr: {
    'meta.description':   'BROOKE — réalisateur & directeur photo travaillant musique et culture. Signaux, transmissions et images de Coachella, Boiler Room et au-delà.',
    'skip.link':          'Aller au travail',
    'nav.work':           'Travaux',
    'nav.reel':           'Reel',
    'nav.about':          'À propos',
    'nav.clients':        'Clients',
    'nav.contact':        'Contact',
    'status.available':   'DISPONIBLE POUR COMMANDES',
    'hero.sub':           'RÉALISATEUR / DIRECTEUR — BASÉ À NANTES',
    'hero.signal':        'RELAIS SIGNAL ·',
    'hero.scroll':        'DÉFILER · ENTRER DANS LE RÉSEAU',
    'reel.sound':         'TRANSMETTRE · SON',
    'reel.press':         'TÉLÉCHARGER LE DOSSIER PRESSE',
    'work.title':         'TRAVAUX SÉLECTIONNÉS',
    'work.intro':         'Transmissions captées sur le terrain. Chaque nœud est un signal préservé d\'un instant qui ne se reproduira pas.',
    'about.title':        "L'OPÉRATEUR",
    'about.node':         'NŒUD · BROOKE / 00',
    'about.prose':        `<p>Je filme <em>ce à quoi ressemble l'électricité quand elle traverse une foule</em>. Musique, rituel, bruit, lumière. Mon travail vit là où l'obturateur rencontre la synapse — les images tirées d'un plateau sont celles qui allaient être oubliées.</p><p>Des scènes principales de Coachella aux caves câblées par Boiler Room, je traque la milliseconde exacte où une salle réalise qu'elle est vivante. Je travaille léger, en petites équipes, privilégiant la proximité à la perfection. La caméra est un capteur ; le montage est un nerf.</p><p>Basé à Nantes. Disponible partout.</p>`,
    'clients.title':      'PARTENAIRES SIGNAL',
    'clients.note':       'Construit en collaboration avec les producteurs, équipes et artistes qui maintiennent le signal propre. Crédits complets dans chaque dossier.',
    'contact.title':      'ÉMETTONS ENSEMBLE.',
    'contact.email':      'E-MAIL',
    'contact.copied':     'SIGNAL COPIÉ ·',
    'contact.book':       'RÉSERVER UN APPEL',
    'footer.rights':      'TOUS SIGNAUX RÉSERVÉS',
    'footer.eos':         'FIN DE SIGNAL',
    'footer.built':       'CONSTRUIT AVEC LA LUMIÈRE',
    'hud.uplink':         'LIAISON STABLE',
    'overlay.client':     'CLIENT',
    'overlay.year':       'ANNÉE',
    'overlay.format':     'FORMAT',
    'overlay.role':       'RÔLE',
  },
};

export const CREDITS_ROTATOR = {
  en: ['COACHELLA', 'BOILER ROOM', 'SMOOTHRECORD', 'VIEILLES CHARRUES', 'RED BULL MUSIC', 'ARTE CONCERT'],
  fr: ['COACHELLA', 'BOILER ROOM', 'SMOOTHRECORD', 'VIEILLES CHARRUES', 'RED BULL MUSIC', 'ARTE CONCERT'],
};

const STORAGE_KEY = 'brooke-lang';

let currentLang = 'en';

function applyLang(lang) {
  const dict = STRINGS[lang];
  if (!dict) return;
  currentLang = lang;

  // data-i18n → textContent
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key] !== undefined) el.textContent = dict[key];
  });

  // data-i18n-html → innerHTML
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml;
    if (dict[key] !== undefined) el.innerHTML = dict[key];
  });

  // data-i18n-attr → arbitrary attribute (e.g. content on <meta>)
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    const attr = el.dataset.i18nAttr;
    const key  = el.dataset.i18n;
    if (attr && dict[key] !== undefined) el.setAttribute(attr, dict[key]);
  });

  // Reflect on <html> and toggle button
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-lang-opt]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.langOpt === lang);
  });

  localStorage.setItem(STORAGE_KEY, lang);
}

export function getLang() { return currentLang; }

export function initI18n() {
  const saved = localStorage.getItem(STORAGE_KEY);
  applyLang(saved === 'fr' ? 'fr' : 'en');

  document.getElementById('lang-toggle')?.addEventListener('click', e => {
    const opt = e.target.closest('[data-lang-opt]');
    if (opt) {
      applyLang(opt.dataset.langOpt);
    } else {
      applyLang(currentLang === 'en' ? 'fr' : 'en');
    }
  });
}
