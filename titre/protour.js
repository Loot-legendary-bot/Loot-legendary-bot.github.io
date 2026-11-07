/*
 * protour.js — S1676 · note 495 ① + 496 : FIND MATCH, la file du DUNGEON PRO TOUR.
 *
 * Phrase de Croze (R3) : *« on est deux connectés, chacun clique PLAY → DUNGEON PRO TOUR → FIND
 * MATCH : je vois « searching… n / 6 players » et les secondes, CANCEL me sort, et quand la table
 * est faite on est emmenés ensemble au choix des persos, sans code. »*
 *
 * Le serveur est seul juge de la file (`packages/server/src/protour.ts`, palier 1202) :
 *   POST   /protour/queue → entre   { position, trouves, attendus, secondes, match }
 *   GET    /protour/queue → l'état (toutes les 3 s ; trois appels manqués = sorti de la file)
 *   DELETE /protour/queue → CANCEL
 *   402 NO_TICKET : pas de ticket en poche (le Vault le vend, 500 dents).
 * `match` = `MATCH_FOUND { roomCode, sieges, timer, protour }`, rendu UNE fois : le salon est créé
 * par le serveur, on le rejoint comme par code (`LLSalon.entre`, mode automatique : PRÊT tout seul,
 * l'hôte que le serveur a désigné lance dès que tous les sièges sont assis et prêts).
 * Le ticket est débité AU SERVEUR au lancement ; l'écran recopie le compte du serveur dans le profil
 * local, sinon la prochaine écriture du profil (PUT /profile) rendrait le ticket.
 * Aucune règle ici : l'écran affiche ce que la file répond.
 */
(function () {
  'use strict';

  var INTERVALLE_MS = 3000;
  var PHRASES = {
    NO_TICKET: 'No Dungeon Pro Tour ticket in your pocket — the Vault sells them (500 teeth).',
    NO_PROFILE: 'Your profile is not on the server yet — play one game online, then try again.',
    UNAUTHORIZED: 'Your session ended. Log in again.',
    TOO_MANY_REQUESTS: 'The server asks us to slow down — searching again in a moment.',
    RESEAU: 'The server does not answer. Try again later.'
  };
  function phrase(code) {
    if (code === 'RESEAU' && window.LLCompte && window.LLCompte.sansReponse) {
      return window.LLCompte.sansReponse(window.LLCompte.serveur());
    }
    return PHRASES[code] || ('The server refused (' + code + ').');
  }

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) { e.className = cls; }
    if (txt !== undefined) { e.textContent = txt; }
    return e;
  }
  function style() {
    if (document.getElementById('pt-style')) { return; }
    var s = document.createElement('style');
    s.id = 'pt-style';
    s.textContent =
      '#protour{position:absolute;inset:0;z-index:79;display:grid;place-items:center;overflow:hidden;background:#070605}' +
      '#protour .pt-fond{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(.38) saturate(1.15)}' +
      '#protour .pt-voile{position:absolute;inset:0;background:radial-gradient(70% 60% at 50% 50%,rgba(7,6,5,.35) 0%,rgba(7,6,5,.92) 100%)}' +
      '#protour .pt-cb{position:relative;width:46cqw;padding:4.5cqh 3.2cqw;text-align:center;background:rgba(10,8,7,.86);' +
      'border:.25cqh solid rgba(163,35,29,.75);box-shadow:0 0 6cqh rgba(163,35,29,.35)}' +
      '#protour .pt-kick{font:700 1.6cqh/1 "Alegreya",Georgia,serif;letter-spacing:.24em;text-transform:uppercase;color:#cf5a4c}' +
      '#protour h2{margin:1.2cqh 0 2.4cqh;font:900 6cqh/1 "Big Shoulders Display","Arial Black",Impact,sans-serif;' +
      'letter-spacing:.06em;text-transform:uppercase;color:#efece3}' +
      '#protour .pt-compte{font:900 9cqh/1 "Big Shoulders Display","Arial Black",Impact,sans-serif;color:#efece3}' +
      '#protour .pt-compte i{font-style:normal;color:#8d8577}' +
      '#protour .pt-sous{margin:.6cqh 0 2.4cqh;font:400 2cqh/1.3 "Alegreya",Georgia,serif;color:#b9b0a0}' +
      '#protour .pt-jauge{height:1.2cqh;margin:0 auto 1cqh;width:80%;background:#1b1714;border:.15cqh solid #3a3631}' +
      '#protour .pt-jauge b{display:block;height:100%;width:100%;background:#a3231d;transition:width .9s linear}' +
      '#protour .pt-sec{font:700 2.2cqh/1 "Alegreya",Georgia,serif;color:#e9e4d8}' +
      '#protour .pt-dit{min-height:2.6cqh;margin:2cqh 0 0;font:400 1.9cqh/1.35 "Alegreya",Georgia,serif;color:#9d9586}' +
      '#protour .pt-dit.err{color:#e0564c}' +
      '#protour .pt-row{display:flex;gap:1.2cqw;justify-content:center;margin-top:2.6cqh}' +
      '#protour button{all:unset;cursor:pointer;padding:1.3cqh 2.4cqw;font:900 2.1cqh/1 "Big Shoulders Display","Arial Black",sans-serif;' +
      'text-transform:uppercase;letter-spacing:.06em;color:#cfc6b4;border:.2cqh solid rgba(233,228,216,.35)}' +
      '#protour button.oui{background:#a3231d;color:#f4ecda;border-color:#a3231d}' +
      '#protour button:hover{color:#fff}';
    document.head.appendChild(s);
  }

  var voile = null, minuteur = null, actif = false, fenetreS = 120;
  function session() { return window.LLCompte ? window.LLCompte.session() : null; }
  function appel(m) {
    if (!window.LLCompte) { return Promise.resolve({ ok: false, statut: 0, corps: { error: 'RESEAU' } }); }
    return window.LLCompte.appel(m, '/protour/queue');
  }

  function arrete() {
    actif = false;
    if (minuteur !== null) { clearTimeout(minuteur); minuteur = null; }
  }
  function ferme() {
    arrete();
    if (voile) { voile.remove(); voile = null; }
  }

  function cadre() {
    style();
    var ecran = document.getElementById('screen') || document.body;
    if (!voile) {
      voile = el('div');
      voile.id = 'protour';
      voile.addEventListener('keydown', function (e) { e.stopPropagation(); });
      var fond = el('img', 'pt-fond'); fond.alt = '';
      fond.src = '/art/da/fonds/protour/salle_aux_braseros.webp';
      fond.onerror = function () { this.remove(); };
      voile.appendChild(fond);
      voile.appendChild(el('div', 'pt-voile'));
      var cb = el('div', 'pt-cb'); voile.appendChild(cb);
      ecran.appendChild(voile);
    }
    var b = voile.querySelector('.pt-cb');
    b.innerHTML = '';
    return b;
  }

  /* L'écran FIND MATCH : n / N, les secondes de la fenêtre, CANCEL. */
  function peint(etat, message, erreur) {
    var b = cadre();
    b.appendChild(el('div', 'pt-kick', 'Dungeon Pro Tour · ranked'));
    b.appendChild(el('h2', '', 'Find match'));
    if (etat && etat.position !== null) {
      var c = el('div', 'pt-compte');
      c.appendChild(document.createTextNode(String(etat.trouves)));
      c.appendChild(el('i', '', ' / ' + etat.attendus));
      b.appendChild(c);
      b.appendChild(el('div', 'pt-sous', 'searching… ' + etat.trouves + ' / ' + etat.attendus + ' players · a full table starts at once'));
      var sec = typeof etat.secondes === 'number' ? etat.secondes : null;
      if (sec !== null && sec > fenetreS) { fenetreS = sec; }
      var j = el('div', 'pt-jauge'); var barre = el('b'); j.appendChild(barre); b.appendChild(j);
      barre.style.width = sec === null ? '0%' : Math.max(0, Math.min(100, 100 * sec / fenetreS)) + '%';
      b.appendChild(el('div', 'pt-sec', sec === null ? '' : sec > 0
        ? sec + ' s — then the table starts with 2 players or more'
        : 'Starting the table…'));
    } else if (!erreur) {
      b.appendChild(el('div', 'pt-sous', 'Entering the queue…'));
    }
    b.appendChild(el('p', 'pt-dit' + (erreur ? ' err' : ''), message || 'Your ticket is used only when the game starts — never for a cancelled search.'));
    var row = el('div', 'pt-row'); b.appendChild(row);
    var cancel = el('button', erreur ? '' : 'oui', erreur ? 'Back' : 'Cancel');
    cancel.type = 'button';
    cancel.addEventListener('click', annule);
    row.appendChild(cancel);
  }

  function annule() {
    var etaitActif = actif;
    ferme();
    if (etaitActif) { appel('DELETE'); }
  }

  /* MATCH_FOUND : le compte du serveur recopié, puis le salon rejoint en automatique. */
  function trouve(match) {
    arrete();
    peint(null, 'Table found — ' + match.sieges + ' players. Joining…', false);
    var poursuit = function () {
      ferme();
      if (window.LLSalon && window.LLSalon.entre) {
        window.LLSalon.entre(match.roomCode, 'FFA', { protour: true, timer: match.timer, sieges: match.sieges });
      }
    };
    if (!window.LLCompte || !window.LLProfil) { poursuit(); return; }
    window.LLCompte.appel('GET', '/profile').then(function (r) {
      var t = r.ok && r.corps && r.corps.profile && r.corps.profile.tickets;
      if (t && typeof t.dpl === 'number') {
        window.LLProfil.modifie(function (p) {
          if (typeof p.tickets !== 'object' || p.tickets === null) { p.tickets = {}; }
          p.tickets.dpl = t.dpl;
        });
      }
      poursuit();
    }, poursuit);
  }

  function lit(r) {
    if (!actif) { return; }
    if (!r.ok) {
      var code = r.corps && r.corps.error ? r.corps.error : (r.statut === 0 ? 'RESEAU' : String(r.statut));
      if (code === 'TOO_MANY_REQUESTS') { peint(null, phrase(code), false); suivant(); return; }
      arrete();
      if (code === 'UNAUTHORIZED' && window.LLCompte) { ferme(); window.LLCompte.accueil(phrase(code)); return; }
      peint(null, phrase(code), true);
      return;
    }
    var etat = r.corps;
    if (etat.match) { trouve(etat.match); return; }
    if (etat.position === null) {
      /* sorti de la file sans table (le ticket relu au lancement, ou trop longtemps sans nouvelles) */
      arrete();
      peint(null, 'You are no longer in the queue — check your ticket, then search again.', true);
      return;
    }
    peint(etat, '', false);
    suivant();
  }
  function suivant() {
    if (!actif) { return; }
    minuteur = setTimeout(function () { minuteur = null; if (actif) { appel('GET').then(lit); } }, INTERVALLE_MS);
  }

  /* L'entrée : FIND MATCH sur la page du Pro Tour. */
  function cherche() {
    if (!session()) {
      if (window.LLCompte) { window.LLCompte.accueil('Log in to play the Dungeon Pro Tour.'); }
      return;
    }
    if (actif) { return; }
    actif = true; fenetreS = 120;
    peint(null, '', false);
    appel('POST').then(lit);
  }

  /* fermer l'onglet sort de la file (le serveur l'oublie aussi au bout de 10 s) */
  window.addEventListener('pagehide', function () {
    if (!actif) { return; }
    var s = session();
    if (!s) { return; }
    try {
      fetch(s.base + '/protour/queue', { method: 'DELETE', keepalive: true, headers: { authorization: 'Bearer ' + s.token } });
    } catch (e) { /* le serveur l'oubliera seul */ }
  });

  window.LLProTour = { cherche: cherche, annule: annule };
})();
