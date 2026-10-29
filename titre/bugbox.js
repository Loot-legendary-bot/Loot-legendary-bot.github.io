/*
 * S1569 - notes 399 (4) / 400 (13) : LA BUG BOX. Croze : « je clique BUG, j'ecris une ligne, j'envoie -
 * sans rien remplir d'autre. » Un petit bouton BUG, au HOME et en partie ; un champ, ENVOYER. Tout le
 * reste est joint sans rien demander : la version, le pseudo, et - en partie - le mode, la graine, le
 * tour, le siege, le journal et la vue (fournis par le jeu via `window.LLBugContexte`), la taille
 * d'ecran et le navigateur. Le serveur (moteur 1020, `POST /bug`) garde le tout ; hors ligne, le
 * rapport attend dans ce navigateur et repart au prochain lancement.
 *
 * Le serveur est celui des comptes (`compte.js`, memes cles : `ll.serveur`, `ll.compte.v1`), lu ici
 * sans dependre de `compte.js`, que la page de jeu ne charge pas.
 */
(function () {
  'use strict';
  var CLE_ATTENTE = 'll.bugs.attente';
  var SERVEUR_DEFAUT = 'https://lootlegendary-api.fly.dev';

  function lsGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* stockage refuse */ } }

  function serveur() {
    if (window.LLCompte && typeof window.LLCompte.serveur === 'function') return window.LLCompte.serveur();
    var q = null;
    try { q = window.sessionStorage.getItem('ll.serveur'); } catch (e) { q = null; }
    return String(window.LL_SERVEUR || q || lsGet('ll.serveur') || SERVEUR_DEFAUT).replace(/\/+$/, '');
  }
  function session() {
    try {
      var s = JSON.parse(lsGet('ll.compte.v1') || 'null');
      return s && typeof s.token === 'string' && typeof s.pseudo === 'string' ? s : null;
    } catch (e) { return null; }
  }
  function pseudo() {
    var s = session();
    if (s) return s.pseudo;
    try { var p = window.LLProfil && window.LLProfil.lis(); return p && typeof p.pseudo === 'string' ? p.pseudo : null; }
    catch (e) { return null; }
  }

  var version = null;
  fetch('/__version.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; })
    .then(function (v) { version = v; }).catch(function () { version = null; });

  function rapport(message) {
    var c = {};
    try { c = typeof window.LLBugContexte === 'function' ? (window.LLBugContexte() || {}) : {}; } catch (e) { c = { contexteRefuse: String(e) }; }
    return {
      message: message,
      pseudo: pseudo(),
      build: version ? ('ecran ' + version.sha + (version.date ? ' · ' + version.date : '')) : null,
      page: window.location.pathname,
      mode: c.mode || (window.location.pathname.indexOf('/titre/') === 0 ? 'HOME' : null),
      graine: c.graine === undefined ? null : c.graine,
      tour: c.tour === undefined ? null : c.tour,
      siege: c.siege === undefined ? null : c.siege,
      journal: Array.isArray(c.journal) ? c.journal : [],
      vue: c.vue === undefined ? null : c.vue,
      navigateur: navigator.userAgent,
      ecran: String(window.innerWidth) + '×' + String(window.innerHeight) + ' @' + String(window.devicePixelRatio || 1),
      at: new Date().toISOString()
    };
  }

  function envoie(corps) {
    var s = session();
    var h = { 'Content-Type': 'application/json' };
    if (s) h.Authorization = 'Bearer ' + s.token;
    return fetch(serveur() + '/bug', { method: 'POST', headers: h, body: JSON.stringify(corps) })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }
  function enAttente() { try { var l = JSON.parse(lsGet(CLE_ATTENTE) || '[]'); return Array.isArray(l) ? l : []; } catch (e) { return []; } }
  function garde(corps) {
    var l = enAttente(); l.push(corps);
    while (l.length > 0 && JSON.stringify(l).length > 3000000) { l[0].journal = []; if (JSON.stringify(l).length > 3000000) l.shift(); }
    lsSet(CLE_ATTENTE, JSON.stringify(l));
  }
  /* au lancement : ce qui attend repart, un par un ; ce qui echoue reste */
  function renvoieLAttente() {
    var l = enAttente(); if (l.length === 0) return;
    lsSet(CLE_ATTENTE, '[]');
    l.reduce(function (p, corps) {
      return p.then(function () { return envoie(corps).catch(function () { garde(corps); }); });
    }, Promise.resolve());
  }

  function ouvre() {
    if (document.getElementById('bugbox')) return;
    var voile = document.createElement('div'); voile.id = 'bugbox'; voile.className = 'bugbox-voile';
    var boite = document.createElement('div'); boite.className = 'bugbox-boite';
    var titre = document.createElement('div'); titre.className = 'bugbox-titre'; titre.textContent = 'REPORT A BUG';
    var champ = document.createElement('textarea'); champ.className = 'bugbox-champ'; champ.rows = 4;
    champ.placeholder = 'What went wrong? One line is enough.';
    var dit = document.createElement('div'); dit.className = 'bugbox-dit';
    dit.textContent = 'The game attaches the rest by itself: version, game, turn, log, screen.';
    var barre = document.createElement('div'); barre.className = 'bugbox-barre';
    var envoyer = document.createElement('button'); envoyer.type = 'button'; envoyer.className = 'bugbox-envoyer'; envoyer.textContent = 'SEND';
    var fermer = document.createElement('button'); fermer.type = 'button'; fermer.className = 'bugbox-fermer'; fermer.textContent = 'CLOSE';
    function ferme() { voile.remove(); }
    fermer.onclick = ferme;
    voile.onclick = function (ev) { if (ev.target === voile) ferme(); };
    voile.onkeydown = function (ev) { if (ev.key === 'Escape') { ev.stopPropagation(); ferme(); } };
    envoyer.onclick = function () {
      var m = champ.value.trim();
      if (m === '') { dit.textContent = 'Write one line first.'; champ.focus(); return; }
      envoyer.disabled = true; dit.textContent = 'Sending…';
      var corps = rapport(m);
      envoie(corps).then(function () {
        dit.textContent = 'Sent, thank you.'; champ.value = '';
        setTimeout(ferme, 1400);
      }).catch(function () {
        garde(corps);
        dit.textContent = 'No connection — kept here, it will be sent at the next launch.';
        setTimeout(ferme, 2600);
      });
    };
    barre.appendChild(envoyer); barre.appendChild(fermer);
    boite.appendChild(titre); boite.appendChild(champ); boite.appendChild(dit); boite.appendChild(barre);
    voile.appendChild(boite); document.body.appendChild(voile);
    champ.focus();
  }

  function pose() {
    if (document.getElementById('bugbox-porte')) return;
    var b = document.createElement('button'); b.type = 'button'; b.id = 'bugbox-porte'; b.className = 'bugbox-porte';
    b.textContent = 'BUG'; b.title = 'report a bug — one line, the game attaches the rest';
    b.onclick = function (ev) { ev.stopPropagation(); ouvre(); };
    document.body.appendChild(b);
    if (window.location.pathname.indexOf('/titre/') !== 0) document.body.classList.add('bugbox-jeu');
    var st = document.createElement('style');
    st.textContent = '.bugbox-porte{position:fixed;right:14px;bottom:44px;z-index:9000;padding:3px 9px;font:700 14px/1.2 system-ui,sans-serif;'
      + 'letter-spacing:.12em;color:#efe6cf;background:rgba(20,16,12,.85);border:1px solid #8c5a54;border-radius:3px;cursor:pointer;opacity:.75}'
      + '.bugbox-porte:hover{opacity:1;border-color:#c9524a}'
      /* en partie, le coin bas-droit porte DONJON / JOURNAL / SUIVRE / OPTIONS : BUG se range dessous, dans la
         bande du bas, a cote de « 📋 rapport » (mesure : aucun chevauchement a 1920 x 1080) */
      + 'body.bugbox-jeu .bugbox-porte{bottom:2px;right:8px;padding:1px 8px;font-size:14px}'
      + '.bugbox-voile{position:fixed;inset:0;z-index:9500;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center}'
      + '.bugbox-boite{width:min(520px,92vw);background:#16120e;border:2px solid #8c5a54;border-radius:4px;padding:16px 18px;color:#efe6cf;font:15px/1.4 system-ui,sans-serif}'
      + '.bugbox-titre{font-weight:800;letter-spacing:.14em;margin-bottom:10px}'
      + '.bugbox-champ{width:100%;box-sizing:border-box;background:#0b0907;color:#efe6cf;border:1px solid #5a4a3a;padding:8px;font:15px/1.4 system-ui,sans-serif;resize:vertical}'
      + '.bugbox-dit{margin:8px 0 12px;font-size:14px;opacity:.8}'
      + '.bugbox-barre{display:flex;gap:10px;justify-content:flex-end}'
      + '.bugbox-barre button{padding:6px 16px;font:700 14px system-ui,sans-serif;letter-spacing:.1em;cursor:pointer;border-radius:3px}'
      + '.bugbox-envoyer{background:#c9524a;color:#fff;border:1px solid #c9524a}.bugbox-envoyer:disabled{opacity:.5}'
      + '.bugbox-fermer{background:transparent;color:#efe6cf;border:1px solid #5a4a3a}';
    document.head.appendChild(st);
    renvoieLAttente();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pose); else pose();
  window.LLBugBox = { ouvre: ouvre, enAttente: enAttente };
})();
