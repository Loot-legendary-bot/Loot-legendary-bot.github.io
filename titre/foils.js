/*
 * foils.js — LES FOILS : le reflet sur la carte, la carte cinématique à part
 * (S1426 · FL-1, note 253, `docs/FOILS.md`).
 *
 * Phrase de Croze : *« Ma carte Foil brille dans ma main ; je la survole, elle
 * s'ouvre en grand et l'illustration bouge, dans un cadre fait pour elle. »*
 *
 * ⚑ **JAMAIS UNE SUPERPOSITION** (FOILS §1) : la petite carte garde l'art de
 * Croze au pixel près, et reçoit seulement un liseré or et un reflet qui glisse ;
 * la vidéo vit dans un GABARIT À PART (nom · fenêtre d'art 16:9 · texte ·
 * rareté), plein cadre en `object-fit: cover`.
 *
 * ⚑ **LE REFLET EST UNE FEUILLE DE STYLE, PAS UN NŒUD.** Une règle par carte
 * possédée, posée sur l'`src` de son art (`img[src$="/art/cartes/<id>.webp"]`)
 * et son porteur (`.cz` en main et à l'inventaire, `.creneau`, `.obj-cible`,
 * `.cx-img` au Codex). Aucun nœud ajouté au DOM du jeu : `render()` greffe
 * l'ancien DOM (S1391), et un nœud ajouté de l'extérieur serait arraché puis
 * remis à chaque rendu — l'animation repartirait de zéro, le clignotement de la
 * note 135. Une feuille dans `<head>` ne bouge pas.
 *
 * Chargé par le titre (`ecran_titre.html`) ET par le jeu (`index.html`), après
 * `profil.js` : la liste des Foils possédées est `profil.possede.foils`.
 */
(function () {
  'use strict';

  /* Les vidéos de Croze (`ASSETS\FOILS\`, 11/10 soir), une par ART : deux
     raretés qui partagent la même image partagent la vidéo. H.264, 672×560 —
     le dépôt est en mp4, et ce PC n'a aucun encodeur webm (FOILS §2 accepte
     les deux). La quête et le mob n'ont pas de Foil à posséder : leur vidéo
     joue au Codex dès qu'ils sont découverts (`Q-FOIL-HORS-LOOT`). */
  var VIDEOS = {
    wraith_compass_common: 'wraith_compass', wraith_compass_uncommon: 'wraith_compass',
    antimonium_uncommon: 'antimonium', antimonium_legendary: 'antimonium',
    ring_of_blood_legendary: 'ring_of_blood',
    thistle_tea_common: 'thistle_tea',
    elemental_kill: 'elemental_kill',
    slime: 'slime'
  };
  var LOOTS_AVEC_VIDEO = ['wraith_compass_common', 'wraith_compass_uncommon', 'antimonium_uncommon',
    'antimonium_legendary', 'ring_of_blood_legendary', 'thistle_tea_common'];
  var PORTEURS = ['.cz', '.creneau', '.obj-cible', '.cx-img'];
  var SURVOL_LONG = 600;   /* note 253 ⓑ */

  function video(id) { return VIDEOS[id] ? '/art/foils/' + VIDEOS[id] + '.mp4' : null; }

  function possedees() {
    var p = null;
    try { p = window.LLProfil ? window.LLProfil.lis() : null; } catch (e) { p = null; }
    var l = p && p.possede && Array.isArray(p.possede.foils) ? p.possede.foils : [];
    return l.filter(function (x) { return typeof x === 'string' && /^[a-z0-9_]+$/.test(x); });
  }
  function possede(id) { return possedees().indexOf(id) >= 0; }

  var BASE =
    '@keyframes ll-foil-reflet{0%{background-position:120% 0}100%{background-position:-20% 0}}' +
    '#ll-cine{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;' +
    'background:rgba(4,3,4,.82);font-family:"Courier Prime",ui-monospace,monospace;color:#e9e4d8}' +
    '#ll-cine.survol{pointer-events:none}' +
    '#ll-cine .lc-cadre{width:min(58vw,92vh);display:flex;flex-direction:column;gap:1.4vh;padding:2vh 2vh 2.4vh;' +
    'background:#0b0a09;border:.4vh solid #c9a24a;box-shadow:0 0 4vh rgba(201,162,74,.45),0 2vh 6vh rgba(0,0,0,.8)}' +
    '#ll-cine .lc-nom{font:900 3.4vh/1.05 "Arial Black",sans-serif;text-transform:uppercase;letter-spacing:.04em;' +
    'color:#f4ecda;text-align:center}' +
    '#ll-cine .lc-fenetre{position:relative;aspect-ratio:16/9;overflow:hidden;background:#000;border:.25vh solid #3a3631}' +
    '#ll-cine video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}' +
    '#ll-cine .lc-texte{font-size:2vh;line-height:1.35;white-space:pre-line;color:#cfc6b4;text-align:center}' +
    '#ll-cine .lc-rar{font:900 1.8vh/1 "Arial Black",sans-serif;letter-spacing:.12em;text-align:center;color:#c9a24a}' +
    '#ll-cine .lc-rar[data-rar="COMMON"]{color:#d8d2c4}#ll-cine .lc-rar[data-rar="UNCOMMON"]{color:#5fc25a}' +
    '#ll-cine .lc-rar[data-rar="RARE"]{color:#4f8fe6}#ll-cine .lc-rar[data-rar="EPIC"]{color:#a964e0}' +
    '#ll-cine .lc-rar[data-rar="LEGENDARY"]{color:#f08a24}' +
    '#ll-cine .lc-pied{font-size:1.5vh;color:#6f685d;text-align:center}';

  function regles(ids) {
    if (ids.length === 0) return '';
    var sel = function (suffixe) {
      var out = [];
      ids.forEach(function (id) {
        PORTEURS.forEach(function (p) { out.push(p + ':has(> img[src$="/art/cartes/' + id + '.webp"])' + suffixe); });
      });
      return out.join(',');
    };
    return sel('') + '{outline:2px solid #c9a24a;outline-offset:-2px;box-shadow:0 0 10px rgba(201,162,74,.55)}' +
      sel('::after') + '{content:"";position:absolute;inset:0;pointer-events:none;z-index:1;mix-blend-mode:screen;' +
      'background:linear-gradient(115deg,transparent 40%,rgba(255,236,170,.55) 48%,rgba(160,220,255,.4) 53%,transparent 61%);' +
      'background-size:300% 100%;animation:ll-foil-reflet 2.8s linear infinite}' +
      /* `.cz`, `.creneau`, `.obj-cible` sont déjà positionnés (mesuré) ; la case du Codex non. */
      ids.map(function (id) { return '.cx-img:has(> img[src$="/art/cartes/' + id + '.webp"])'; }).join(',') + '{position:relative}';
  }

  function rafraichis() {
    var s = document.getElementById('ll-foils');
    if (!s) {
      s = document.createElement('style'); s.id = 'll-foils';
      (document.head || document.documentElement).appendChild(s);
    }
    var t = BASE + regles(possedees());
    if (s.textContent !== t) s.textContent = t;
  }

  /* Le texte de la carte vient du Codex (`codex.gen.json`, la même source que
     la grille) : le gabarit dit le nom, le texte et la rareté sans rien inventer. */
  var fiches = null;
  function chargeLesFiches() {
    if (fiches !== null) return Promise.resolve(fiches);
    return fetch('/titre/codex.gen.json', { cache: 'force-cache' }).then(function (r) { return r.json(); })
      .then(function (d) {
        fiches = {};
        (d.boites || []).forEach(function (b) { (b.items || []).forEach(function (it) { fiches[it.id] = it; }); });
        return fiches;
      }).catch(function () { fiches = {}; return fiches; });
  }

  var ouverte = null;
  function ferme() {
    if (ouverte) { ouverte.remove(); ouverte = null; document.removeEventListener('keydown', esc, true); }
  }
  function esc(e) { if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); ferme(); } }

  /* La carte cinématique. `survol` : ouverte par le survol long — elle laisse
     passer la souris et se ferme quand la souris quitte la carte. */
  function ouvre(id, survol) {
    var src = video(id);
    if (!src) return false;
    ferme();
    var v = document.createElement('div'); v.id = 'll-cine';
    if (survol) v.className = 'survol';
    var c = document.createElement('div'); c.className = 'lc-cadre';
    var nom = document.createElement('div'); nom.className = 'lc-nom';
    var f = document.createElement('div'); f.className = 'lc-fenetre';
    var vid = document.createElement('video');
    vid.src = src; vid.autoplay = true; vid.loop = true; vid.muted = true; vid.playsInline = true;
    vid.setAttribute('muted', ''); vid.setAttribute('playsinline', '');
    f.appendChild(vid);
    var tx = document.createElement('div'); tx.className = 'lc-texte';
    var rar = document.createElement('div'); rar.className = 'lc-rar';
    c.appendChild(nom); c.appendChild(f); c.appendChild(tx); c.appendChild(rar);
    if (!survol) { var pied = document.createElement('div'); pied.className = 'lc-pied'; pied.textContent = 'Click or Esc to close'; c.appendChild(pied); }
    v.appendChild(c);
    v.addEventListener('click', ferme);
    document.addEventListener('keydown', esc, true);
    document.body.appendChild(v);
    ouverte = v;
    chargeLesFiches().then(function (fs) {
      var it = fs[id];
      nom.textContent = it ? it.nom : id.replace(/_/g, ' ');
      tx.textContent = it && it.texte ? it.texte : '';
      var r = it && it.f && it.f.rarete && it.f.rarete[0] ? it.f.rarete[0] : '';
      if (VIDEOS[id] && LOOTS_AVEC_VIDEO.indexOf(id) >= 0) { rar.textContent = (r ? r + ' · ' : '') + 'FOIL'; } else { rar.textContent = r; }
      if (r) rar.setAttribute('data-rar', r);
    });
    /* Mesuré en jeu : au PREMIER chargement d'une vidéo, `play()` lancé avant
       qu'elle soit prête peut la laisser en pause (readyState 4, t = 0) ; on
       relance quand elle peut jouer. */
    var joue = function () { var p = vid.play(); if (p && p.catch) p.catch(function () { /* l'image fixe reste */ }); };
    vid.addEventListener('canplay', function () { if (vid.paused) joue(); });
    joue();
    return true;
  }

  /* Le Codex : une Foil POSSÉDÉE ouvre sa carte cinématique ; la quête et le
     mob, qui n'ont pas de Foil à posséder, l'ouvrent dès qu'ils sont vus. */
  function pourLeCodex(id) {
    if (!video(id)) return false;
    if (LOOTS_AVEC_VIDEO.indexOf(id) >= 0 && !possede(id)) return false;
    return ouvre(id, false);
  }

  /* Le survol long, en jeu : écoute DÉLÉGUÉE sur le document, aucun nœud posé
     sur la carte. Le clic reste au jeu (il joue la carte). */
  var minuterie = null, porteur = null;
  function idDe(el) {
    if (!el || !el.closest) return null;
    var p = el.closest(PORTEURS.join(','));
    if (!p) return null;
    var im = p.querySelector(':scope > img[src*="/art/cartes/"]');
    if (!im) return null;
    var m = /\/art\/cartes\/([a-z0-9_]+)\.webp/.exec(im.getAttribute('src') || '');
    return m ? { id: m[1], p: p } : null;
  }
  function arme() {
    document.addEventListener('pointerover', function (e) {
      var x = idDe(e.target);
      if (!x || x.p === porteur) return;
      clearTimeout(minuterie); porteur = x.p;
      if (!possede(x.id) || !video(x.id)) return;
      minuterie = setTimeout(function () { if (porteur === x.p && x.p.isConnected) ouvre(x.id, true); }, SURVOL_LONG);
    }, true);
    document.addEventListener('pointerout', function (e) {
      if (!porteur) return;
      var vers = e.relatedTarget;
      if (vers && porteur.contains(vers)) return;
      clearTimeout(minuterie); porteur = null;
      if (ouverte && ouverte.classList.contains('survol')) ferme();
    }, true);
  }

  window.LLFoils = {
    VIDEOS: VIDEOS, LOOTS_AVEC_VIDEO: LOOTS_AVEC_VIDEO,
    video: video, possede: possede, possedees: possedees,
    ouvre: ouvre, ferme: ferme, pourLeCodex: pourLeCodex, rafraichis: rafraichis
  };
  rafraichis();
  window.addEventListener('storage', function (e) { if (e.key === 'll.profil.v1') rafraichis(); });
  arme();
})();
