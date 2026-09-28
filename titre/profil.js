/*
 * profil.js — LE PROFIL DU JOUEUR, LOCAL (S1299 · P-1, note 183).
 *
 * Croze : *« ya pas de profil utilisateur »*. Phrase : *« Au titre je vois mon
 * pseudo, mes dents et mon Sang, mon rang, et ils sont encore là quand je
 * relance le jeu. »*
 *
 * Décision du classeur (note 183) : profil LOCAL d'abord, UN fichier JSON
 * versionné (`schema_version`), lu au lancement, écrit à chaque changement ;
 * `localStorage` sous la clé unique `ll.profil.v1` tant qu'on est dans le
 * navigateur (`userData` sous Electron, plus tard, derrière le MÊME module).
 *
 * ⚑ **UN SEUL MODULE, ET IL EST ICI** — sur le patron de `curseur.js` : un
 * script classique, chargé en tête par le titre (`ecran_titre.html`) ET par le
 * jeu (`index.html`), parce que le titre lit son profil de façon SYNCHRONE dès
 * sa première ligne. `src/profil.ts` n'est que sa façade typée pour `main.ts` :
 * il ne connaît ni la clé ni le schéma.
 *
 * Les valeurs de départ ne sont pas inventées : la bourse de départ est
 * `docs/MONNAIE.md §2` (2 048 dents) ; le Sang s'ACHÈTE (§4, reco A) : 0 ;
 * le pseudo et le rang sont ceux que le titre affichait en dur (aucune règle de
 * rang n'existe encore — une ligne de file, pas une invention).
 */
(function () {
  'use strict';
  var CLE = 'll.profil.v1';
  var SCHEMA = 1;

  /* S1348 · BW-6 (note 199, verdict #45 A de Croze) — le profil NEUF ne porte
     AUCUN personnage : le premier lancement en fait choisir UN parmi le trio
     (écran titre, `lePremierLancement`), les deux autres se gagnent sur le mur.
     Un profil déjà écrit garde ce qu'il a : `complete` ne vide jamais une liste. */
  var PERSOS_DE_DEPART = [];
  var TRIO_DE_DEPART = ['the_green', 'the_necromancer', 'the_mailman'];

  function neuf() {
    return {
      schema_version: SCHEMA,
      pseudo: 'Croze',
      dents: 2048,
      sang: 0,
      rang: 'Bronze III',
      personnages: {},
      /* S1340 · PR-1 (note 194) — `persos` : les personnages possédés (ids du
         jeu). Au départ, les six que le Vault montrait déjà possédés (Q-PR1,
         veto d'un mot). `des` : les peaux achetées — `bones` l'est d'office. */
      possede: { persos: PERSOS_DE_DEPART.slice(), des: [], curseurs: [], dos: [], peaux: [] },
      equipe: { de: null, curseur: null, dos: null },
      bounty: {},
      today: [],
      options: {}
    };
  }

  /* Un profil lu est COMPLÉTÉ champ à champ par le neuf : un profil écrit par
     une version plus ancienne garde tout ce qu'il a, et gagne ce qui manque. */
  function complete(p) {
    var n = neuf();
    if (p === null || typeof p !== 'object') return n;
    for (var k in n) {
      if (!(k in p) || p[k] === null && n[k] !== null) p[k] = n[k];
    }
    /* S1340 · PR-1 — un profil d'avant PR-1 gagne ses sous-listes manquantes. */
    if (typeof p.possede !== 'object' || p.possede === null) p.possede = n.possede;
    for (var s in n.possede) {
      if (!Array.isArray(p.possede[s])) p.possede[s] = n.possede[s];
    }
    if (typeof p.dents !== 'number' || !isFinite(p.dents)) p.dents = n.dents;
    if (typeof p.sang !== 'number' || !isFinite(p.sang)) p.sang = n.sang;
    p.schema_version = SCHEMA;
    return p;
  }

  function lis() {
    var brut = null;
    try { brut = window.localStorage.getItem(CLE); } catch (e) { brut = null; }
    if (brut === null) {
      var p0 = neuf();
      pose(p0);   /* le premier lancement ÉCRIT : le second relit la même chose */
      return p0;
    }
    try { return complete(JSON.parse(brut)); } catch (e) { return neuf(); }
  }

  function pose(p) {
    try { window.localStorage.setItem(CLE, JSON.stringify(p)); }
    catch (e) { /* un navigateur peut refuser le stockage : la page vit quand même */ }
    /* L'écran de jeu lit le pseudo sous cette clé depuis S1202 : elle suit. */
    try { window.localStorage.setItem('ll.profil.pseudo', String(p.pseudo || '')); } catch (e) { /* idem */ }
    /* S1379 · PK-1 (note 210 ②) — dans le PAQUET PORTABLE, le profil vit aussi
       dans `profil.json`, à côté du `JOUER.bat` (le serveur du paquet pose
       `LL_PORTABLE` en tête de ce fichier). En développement : rien ne change. */
    if (window.LL_PORTABLE === true || window.LL_FICHIER_PROFIL === true) {
      try {
        fetch('/__profil', { method: 'PUT', body: JSON.stringify(p), keepalive: true,
          headers: { 'content-type': 'application/json' } });
      } catch (e) { /* le disque refuse : le navigateur garde sa copie */ }
    }
  }

  /* PK-1 — au chargement, le fichier du dossier fait foi (un autre port, une
     autre machine : le profil suit le dossier, pas le navigateur). */
  if (window.LL_PORTABLE === true || window.LL_FICHIER_PROFIL === true) {
    try {
      var x = new XMLHttpRequest();
      x.open('GET', '/__profil', false);
      x.send(null);
      if (x.status === 200) {
        JSON.parse(x.responseText);
        window.localStorage.setItem(CLE, x.responseText);
      }
    } catch (e) { /* pas de fichier lisible : on part de la copie du navigateur */ }
  }

  function modifie(f) {
    var p = lis();
    f(p);
    pose(p);
    return p;
  }

  /* La vue du titre : ses noms d'hier (`gold`, `rank`) branchés sur le profil.
     `PROFILE.gold -= prix` ÉCRIT donc le solde — le titre n'a pas une ligne de
     plus à changer pour que ses achats restent au relancement. */
  function vueDuTitre() {
    var v = {};
    Object.defineProperty(v, 'pseudo', { get: function () { return lis().pseudo; },
      set: function (x) { modifie(function (p) { p.pseudo = String(x); }); } });
    Object.defineProperty(v, 'gold', { get: function () { return lis().dents; },
      set: function (x) { modifie(function (p) { p.dents = Math.max(0, Math.round(Number(x) || 0)); }); } });
    Object.defineProperty(v, 'sang', { get: function () { return lis().sang; },
      set: function (x) { modifie(function (p) { p.sang = Math.max(0, Math.round(Number(x) || 0)); }); } });
    Object.defineProperty(v, 'rank', { get: function () { return lis().rang; },
      set: function (x) { modifie(function (p) { p.rang = String(x); }); } });
    return v;
  }

  /* `VOIR-PREMIER-LANCEMENT.bat` (note 196 : « un profil vide »). ⚠ SEULEMENT sur
     le port du raccourci (5254 — le stockage est propre à chaque port : le profil
     de Croze n'est jamais touché), et UNE fois par onglet : après le choix, le
     profil vit normalement. Posé ICI parce que ce fichier se charge avant la page. */
  try {
    if (new URLSearchParams(window.location.search).get('profil_de_test') === 'vide'
        && window.location.port === '5254' && !window.sessionStorage.getItem('ll.test.vide')) {
      window.localStorage.removeItem(CLE);
      window.sessionStorage.setItem('ll.test.vide', '1');
    }
  } catch (e) { /* stockage refusé : le raccourci montre le profil tel qu'il est */ }

  /* S1379 · note 210 ① — le bandeau MODE RICHE, discret, en haut, sur les DEUX
     pages tant que le profil porte `options.riche` (posé par `?riche=1` sur le
     port de VOIR-RICHE.bat, `ecran_titre.html`). */
  function bandeauRiche() {
    var p = lis();
    if (!(p && p.options && (p.options.profilDeTest === true || p.options.riche === true))) { return; }
    if (document.getElementById('ll-mode-riche')) { return; }
    var b = document.createElement('div');
    b.id = 'll-mode-riche';
    b.textContent = 'TEST PROFILE';   /* S1393 - note 215 (1) : TOUT DEVERROUILLER */
    b.style.cssText = 'position:fixed;top:4px;left:50%;transform:translateX(-50%);z-index:2147483000;'
      + 'pointer-events:none;font:700 11px/1 monospace;letter-spacing:.3em;padding:4px 12px;'
      + 'color:#e8d9a8;background:rgba(40,8,8,.72);border:1px solid rgba(232,217,168,.45)';
    document.body.appendChild(b);
  }
  if (document.body) { bandeauRiche(); }
  else { document.addEventListener('DOMContentLoaded', bandeauRiche); }

  window.LLProfil = { CLE: CLE, SCHEMA: SCHEMA, TRIO_DE_DEPART: TRIO_DE_DEPART, neuf: neuf, lis: lis, pose: pose, modifie: modifie, vueDuTitre: vueDuTitre };
})();
