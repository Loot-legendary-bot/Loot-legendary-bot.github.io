/*
 * codex.js — LE CODEX, AU HOME (S1411 · CX-1, note 229, docs/CODEX.md §1).
 *
 * Phrase de Croze (R3) : « Au HOME j'ouvre CODEX : six boîtes avec leur compte,
 * les cartes que j'ai croisées en jeu s'affichent, les autres ont leur nom et
 * un "?", je filtre les tuiles marchandes et je cherche un nom. »
 *
 * Trois zones, comme la capture de référence : les FILTRES à gauche, la GRILLE
 * au centre, les six BOÎTES DE DECK à droite (compte découvert / total, %).
 *
 * Deux sources, et aucune autre :
 *   - `codex.gen.json` (GÉNÉRÉ par `tools/codex.py` depuis `data/generated` —
 *     le HOME est une page statique, il ne lit pas la donnée brute) ;
 *   - `codex.seen` du profil (`profil.js`), ÉCRIT PAR LE JEU au moment où il
 *     peint une entité face visible (`main.ts::noteLesDécouvertes`, CODEX §2).
 *
 * Une entité non découverte = son nom et un « ? », rien d'autre (ni art, ni
 * texte). Découverte = son art, cliquable en grand avec sa notice.
 * La grille défile DANS sa fenêtre, jamais la page, sans barre : molette,
 * chevrons, ombre (SC-1, note 190).
 */
(function () {
  'use strict';
  var DONNEE = null;
  var etat = { boite: 'tiles', q: '', partout: false, vus: true, pasVus: true, f: {} };

  function style() {
    if (document.getElementById('cx-style')) return;
    var s = document.createElement('style');
    s.id = 'cx-style';
    s.textContent =
      '#v-codex .htitle,#v-codex .hsep{display:none}' +
      '.cx{position:absolute;left:3cqw;right:3cqw;top:17cqh;bottom:4cqh;display:grid;' +
        'grid-template-columns:19cqw minmax(0,1fr) 19cqw;gap:1.6cqw;font-family:"Alegreya",Georgia,serif;color:#e9e2d4}' +
      '.cx-col{min-height:0;display:flex;flex-direction:column;gap:1.1cqh}' +
      '.cx-titre{font:700 4.6cqh/1 "Archivo Black",Impact,sans-serif;letter-spacing:.04em;text-transform:uppercase}' +
      '.cx-sous{font-size:1.5cqh;letter-spacing:.14em;opacity:.7;text-transform:uppercase}' +
      '.cx-recherche{width:100%;box-sizing:border-box;background:rgba(0,0,0,.45);color:#e9e2d4;' +
        'border:1px solid rgba(255,255,255,.3);padding:.9cqh .8cqw;font:inherit;font-size:1.6cqh}' +
      '.cx-rangee{display:flex;flex-wrap:wrap;gap:.45cqh .35cqw}' +
      '.cx-k{font-size:1.25cqh;letter-spacing:.2em;opacity:.6;text-transform:uppercase;margin-top:.6cqh}' +
      '.cx-puce{background:transparent;color:inherit;border:1px solid rgba(255,255,255,.28);' +
        'padding:.45cqh .55cqw;font:inherit;font-size:1.3cqh;letter-spacing:.06em;cursor:pointer}' +
      '.cx-puce.on{border-color:#e9e2d4;background:rgba(233,226,212,.16)}' +
      '.cx-filtres{flex:1 1 auto;min-height:0;overflow-y:auto;scrollbar-width:none}' +
      '.cx-filtres::-webkit-scrollbar,.cx-grille::-webkit-scrollbar{display:none}' +
      '.cx-centre{position:relative;min-height:0;display:flex;flex-direction:column;gap:1cqh}' +
      '.cx-tete{display:flex;align-items:baseline;gap:1.2cqw}' +
      '.cx-fen{position:relative;flex:1 1 auto;min-height:0}' +
      '.cx-grille{position:absolute;inset:0;overflow-y:auto;scrollbar-width:none;display:grid;' +
        'grid-template-columns:repeat(auto-fill,minmax(8.6cqw,1fr));gap:1.2cqh .8cqw;align-content:start;padding:.4cqh .2cqw 3cqh}' +
      '.cx-ombre{position:absolute;left:0;right:0;height:4cqh;pointer-events:none;opacity:0;transition:opacity .2s}' +
      '.cx-ombre.h{top:0;background:linear-gradient(rgba(8,6,6,.9),transparent)}' +
      '.cx-ombre.b{bottom:0;background:linear-gradient(transparent,rgba(8,6,6,.9))}' +
      '.cx-ombre.on{opacity:1}' +
      '.cx-chev{position:absolute;right:.2cqw;z-index:2;background:rgba(0,0,0,.6);color:#e9e2d4;' +
        'border:1px solid rgba(255,255,255,.3);font-size:1.6cqh;padding:.2cqh .6cqw;cursor:pointer;display:none}' +
      '.cx-chev.on{display:block}.cx-chev.h{top:0}.cx-chev.b{bottom:0}' +
      '.cx-carte{display:flex;flex-direction:column;gap:.5cqh;cursor:default;min-width:0}' +
      '.cx-carte.vu{cursor:zoom-in}' +
      '.cx-img{aspect-ratio:2/3;display:flex;align-items:center;justify-content:center;' +
        'background:rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.14);overflow:hidden}' +
      '.cx-img img{width:100%;height:100%;object-fit:contain;display:block}' +
      '.cx-carte.vu:hover .cx-img{border-color:#e9e2d4}' +
      '.cx-q{font:700 7cqh/1 "Archivo Black",Impact,sans-serif;opacity:.35}' +
      '.cx-nom{font-size:1.3cqh;line-height:1.25;letter-spacing:.04em;overflow-wrap:anywhere}' +
      '.cx-carte:not(.vu) .cx-nom{opacity:.6}' +
      '.cx-tirage{font-size:1.1cqh;letter-spacing:.06em;color:#c9a227;margin-top:.3cqh}' +
      '.cx-notice .cx-tirage{font-size:1.5cqh;margin-top:1cqh}' +
      '.cx-vide{grid-column:1/-1;opacity:.6;font-size:1.6cqh;padding:2cqh 0}' +
      '.cx-boite{display:block;width:100%;text-align:left;background:rgba(0,0,0,.42);color:inherit;' +
        'border:1px solid rgba(255,255,255,.2);padding:1.1cqh .9cqw;font:inherit;cursor:pointer}' +
      '.cx-boite.on{border-color:#e9e2d4;background:rgba(233,226,212,.12)}' +
      '.cx-bnom{font:700 2.1cqh/1 "Archivo Black",Impact,sans-serif;letter-spacing:.05em}' +
      '.cx-bcompte{display:flex;justify-content:space-between;font-size:1.5cqh;margin-top:.7cqh;opacity:.85}' +
      '.cx-barre{height:.5cqh;background:rgba(255,255,255,.12);margin-top:.6cqh}' +
      '.cx-barre i{display:block;height:100%;background:#e9e2d4}' +
      '.cx-next{font-size:1.15cqh;letter-spacing:.04em;opacity:.7;margin-top:.6cqh;line-height:1.3}' +
      '.cx-grand{position:absolute;inset:0;z-index:40;background:rgba(6,4,4,.9);display:flex;' +
        'align-items:center;justify-content:center;gap:3cqw;cursor:zoom-out}' +
      '.cx-grand img{height:82cqh;max-width:52cqw;object-fit:contain}' +
      '.cx-notice{max-width:32cqw;white-space:pre-line;font-size:1.8cqh;line-height:1.5}' +
      '.cx-notice b{display:block;font:700 3.4cqh/1.1 "Archivo Black",Impact,sans-serif;margin-bottom:1.6cqh}' +
      /* S1414 · CX-3 (note 235 ③, CODEX §6 ⓡ) — L'ÉTAGÈRE DU CARTOGRAPHE. Les boîtes sont
         des boîtes de deck en carton, un sceau de cire par boîte à sa couleur, le compte
         gravé sur le couvercle ; la grille est posée sur une table de bois sombre ; une
         carte inconnue est une carte RETOURNÉE (le dos Lick Floor) ; les filtres vivent
         sur une lanterne-registre. Proposé — Croze tranche sur capture. */
      '.cx-col.cx-registre{padding:1.6cqh 1cqw;background:' +
        'radial-gradient(90% 42% at 22% 0%,rgba(255,196,120,.22),rgba(255,160,80,.06) 55%,transparent 75%),' +
        'repeating-linear-gradient(180deg,transparent 0 3.1cqh,rgba(233,226,212,.06) 3.1cqh 3.2cqh),' +
        'linear-gradient(180deg,#1b1410,#120d0a);border:1px solid rgba(201,162,39,.28);box-shadow:inset 0 0 3cqh rgba(0,0,0,.7)}' +
      '.cx-fen{background:' +
        'repeating-linear-gradient(90deg,rgba(0,0,0,.18) 0 .2cqw,transparent .2cqw 1.9cqw),' +
        'repeating-linear-gradient(90deg,#2b1d13 0 7cqw,#24180f 7cqw 14cqw),#22170f;' +
        'border:1px solid #3a2a1c;box-shadow:inset 0 0 5cqh rgba(0,0,0,.85),0 1cqh 2cqh rgba(0,0,0,.6)}' +
      '.cx-grille{padding:1.4cqh 1cqw 3cqh}' +
      '.cx-img{box-shadow:0 .6cqh 1.2cqh rgba(0,0,0,.7)}' +
      '.cx-img.dos{background:#0b0b0b url(/art/dos/lick_floor.webp) center/cover no-repeat;border-color:rgba(233,226,212,.18)}' +
      '.cx-img.dos .cx-q{display:none}' +
      '.cx-boite{position:relative;color:#2a2018;background:' +
        'linear-gradient(180deg,rgba(255,255,255,.18),transparent 22%),' +
        'repeating-linear-gradient(90deg,rgba(80,60,30,.06) 0 .15cqw,transparent .15cqw .5cqw),' +
        'linear-gradient(180deg,#d9caa3,#bba97e);border:1px solid #7a6844;border-radius:.3cqh;' +
        'box-shadow:0 .5cqh 0 #6f5d3b,0 .9cqh 1.4cqh rgba(0,0,0,.6);padding:.5cqh 1cqw .5cqh 4.2cqw;margin-bottom:0}' +
      '.cx-boite .cx-bcompte{margin-top:.4cqh}.cx-boite .cx-barre{margin-top:.35cqh}.cx-boite .cx-next{margin-top:.35cqh}' +
      '.cx-boite.on{background:linear-gradient(180deg,rgba(255,255,255,.28),transparent 22%),linear-gradient(180deg,#eadcb6,#c9b78b);' +
        'border-color:#a3231d;transform:translateX(-.6cqw);box-shadow:0 .5cqh 0 #6f5d3b,0 0 0 .2cqh #a3231d,0 .9cqh 1.4cqh rgba(0,0,0,.6)}' +
      '.cx-bnom{color:#1f160f;text-shadow:0 1px 0 rgba(255,255,255,.35)}' +
      '.cx-bcompte{opacity:1;color:#3a2c1c;font-weight:700;text-shadow:0 1px 0 rgba(255,255,255,.4),0 -1px 0 rgba(0,0,0,.25)}' +
      '.cx-barre{background:rgba(42,32,24,.22)}.cx-barre i{background:#5b3a1e}' +
      '.cx-next{color:#3a2c1c;opacity:.85}' +
      '.cx-sceau{position:absolute;left:.9cqw;top:50%;width:2.6cqw;height:2.6cqw;margin-top:-1.3cqw;border-radius:50%;' +
        'background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.35),transparent 40%),var(--cire);' +
        'box-shadow:0 0 0 .25cqw var(--cire),0 .3cqh .5cqh rgba(0,0,0,.55),inset 0 0 .6cqw rgba(0,0,0,.45)}' +
      '.cx-sceau::after{content:"";position:absolute;inset:28%;border-radius:50%;border:.12cqw solid rgba(0,0,0,.35)}' +
      /* S1416 · HM-5 ⓔ — SPIRIT MISSIONS (colonne gauche, défile dans sa fenêtre, sans barre) et CHARACTERS */
      '.cx-registre{min-height:0}' +
      '.cx-missions{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;gap:.6cqh;margin-top:.8cqh}' +
      '.cx-ml{flex:1 1 auto;min-height:0;overflow-y:auto;scrollbar-width:none;display:flex;flex-direction:column;gap:.5cqh}' +
      '.cx-ml::-webkit-scrollbar{display:none}' +
      '.cx-mesprit{all:unset;box-sizing:border-box;display:flex;gap:.6cqw;align-items:center;cursor:pointer;padding:.4cqh .4cqw;' +
        'border-left:.3cqh solid var(--teinte);background:rgba(0,0,0,.4)}' +
      '.cx-mesprit:hover,.cx-mesprit.on{background:rgba(0,0,0,.65)}' +
      '.cx-pp{width:4.6cqh;height:4.6cqh;border-radius:50%;object-fit:cover;flex:none;box-shadow:0 0 0 .2cqh var(--teinte)}' +
      '.cx-mtxt{display:flex;flex-direction:column;gap:.2cqh;min-width:0;font-size:1.25cqh;line-height:1.3}' +
      '.cx-mtxt b{font-size:1.45cqh;letter-spacing:.06em;text-transform:uppercase}' +
      '.cx-mcompte{opacity:.75}.cx-mnext{opacity:.9;color:#d8c9a8}' +
      '.cx-mdetail{display:flex;flex-direction:column;gap:.2cqh;padding:.4cqh .4cqw .8cqh 1.2cqw;font-size:1.2cqh}' +
      '.cx-mnoeud.a_toi{color:#9fd18b}.cx-mnoeud.pret{color:#f0c35a}.cx-mnoeud.lock{opacity:.6}' +
      '.cx-owned{font-size:1.2cqh;letter-spacing:.14em;text-transform:uppercase;opacity:.6}' +
      '.cx-perso.a-toi .cx-owned{opacity:1;color:#9fd18b}' +
      '.cx-grand-perso img{max-height:86cqh}' +
      '.cx-decks{gap:.3cqh}.cx-decks .cx-boite{padding-top:.15cqh;padding-bottom:.15cqh}' +
      /* S1472 · 362 ① : la dixième boîte (GRADES) tient dans la colonne */
      '.cx-decks .cx-bcompte{margin-top:.3cqh}.cx-decks .cx-barre{margin-top:.3cqh}.cx-decks .cx-next{margin-top:.25cqh}' +
      /* S1418 · CX-4 : la boîte DAILY CHALLENGES est une liste de rangs, pas une grille */
      '.cx-grille.cx-lignes{display:flex;flex-direction:column;gap:.7cqh}' +
      '.cx-daily{display:grid;grid-template-columns:7.5cqw 1fr 8cqw 6cqw;gap:.3cqh 1cqw;align-items:baseline;' +
        'padding:.8cqh 1cqw;border:1px solid rgba(233,226,212,.18);border-left:.35cqw solid #6b6359;background:rgba(0,0,0,.42)}' +
      '.cx-daily.ok{border-left-color:#5f9c4b}.cx-daily.ko{border-left-color:#9c2b25}' +
      '.cx-ddate{font-size:1.3cqh;opacity:.7;letter-spacing:.08em}' +
      '.cx-dnom{font-size:1.7cqh;font-weight:700;text-transform:uppercase;letter-spacing:.06em}' +
      '.cx-dres{font-size:1.4cqh;font-weight:700;letter-spacing:.14em;text-align:right}' +
      '.cx-daily.ok .cx-dres{color:#9fd18b}.cx-daily.ko .cx-dres{color:#e0675d}' +
      '.cx-ddents{font-size:1.3cqh;opacity:.75;text-align:right}' +
      '.cx-dinfo{grid-column:2/-1;font-size:1.25cqh;opacity:.8}' +
      /* S1472 · note 362 ① : la galerie des GRADES (écu numéroté tant que les tabliers manquent) */
      '.cx-grade{gap:.35cqh;align-items:center;text-align:center;padding:.8cqh .3cqw;border:1px solid rgba(233,226,212,.14);background:rgba(0,0,0,.38)}' +
      '.cx-ecu{width:62%;aspect-ratio:5/6;display:flex;align-items:center;justify-content:center;' +
        'clip-path:polygon(0 0,100% 0,100% 58%,50% 100%,0 58%);background:linear-gradient(180deg,#7a1717,#3a0b0b);' +
        'box-shadow:inset 0 0 1.4cqh rgba(0,0,0,.6)}' +
      '.cx-ecu-n{font:700 4.4cqh/1 "Archivo Black",Impact,sans-serif;color:#e9d9b0;margin-bottom:1.2cqh}' +
      /* S1484 · 366 ③ : le tablier */
      '.cx-tablier{width:70%;aspect-ratio:1/1;object-fit:contain;filter:drop-shadow(0 .4cqh .8cqh rgba(0,0,0,.6))}' +
      '.cx-gnum{font-size:1.15cqh;letter-spacing:.2em;opacity:.7}' +
      '.cx-grade .cx-nom{font-weight:700;opacity:1}' +
      '.cx-ggp{font-size:1.3cqh;color:#e9d9b0}' +
      '.cx-gou{font-size:1.05cqh;letter-spacing:.12em;opacity:.65}' +
      '.cx-grade.ouvert{border-color:rgba(201,162,39,.55)}' +
      '.cx-grade.ferme{filter:grayscale(1);opacity:.45}' +
      '.cx-grade.mien{border-color:#e9d9b0;background:rgba(201,162,39,.16);box-shadow:0 0 1.6cqh rgba(201,162,39,.55)}' +
      '.cx-grade.mien .cx-gou{color:#e9d9b0;opacity:1;font-weight:700}';
    document.head.appendChild(s);
  }

  function vus() {
    var p = window.LLProfil ? window.LLProfil.lis() : null;
    var s = p && p.codex && p.codex.seen ? p.codex.seen : {};
    var out = {};
    ['tiles', 'traps', 'mobs', 'chests', 'loots', 'quests'].forEach(function (f) {
      out[f] = new Set(Array.isArray(s[f]) ? s[f] : []);
    });
    return out;
  }

  /* note 271 (4) : l'id du dos équipé, ou null (Lick Floor, le CSS par défaut) */
  function dosEquipe() {
    try {
      var p = window.LLProfil ? window.LLProfil.lis() : null;
      var id = p && p.equipe ? p.equipe.dos : null;
      return typeof id === 'string' && /^[a-z0-9_]+$/.test(id) ? id : null;
    } catch (e) { return null; }
  }
  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt !== undefined) e.textContent = txt;
    return e;
  }

  /* S1416 · HM-5 ⓔ (note 238 ⑪, CODEX §7) — LA HUITIÈME BOÎTE : CHARACTERS. Les 20,
     TOUS visibles (« owned / not owned »), la fiche recto / verso au clic ; l'achat et
     l'équipement restent au VAULT. La liste vient du HOME (`LLPersosDuCodex`). */
  var PERSOS = 'characters';
  function boitePersos() {
    var l = typeof window.LLPersosDuCodex === 'function' ? window.LLPersosDuCodex() : [];
    return { cle: PERSOS, libelle: 'Characters', filtres: [], famille: null, items: l };
  }
  function cartePerso(it) {
    var c = el('div', 'cx-carte vu cx-perso' + (it.possede ? ' a-toi' : ''));
    var cadre = el('div', 'cx-img');
    var im = new Image();
    im.loading = 'eager';
    im.alt = '';
    im.src = '/art/personnages/grand/' + it.id + '.webp';
    cadre.appendChild(im);
    c.appendChild(cadre);
    c.appendChild(el('div', 'cx-nom', it.nom));
    c.appendChild(el('div', 'cx-owned', it.possede ? 'owned' : 'not owned'));
    c.addEventListener('click', function () { agrandisPerso(it); });
    return c;
  }
  function agrandisPerso(it) {
    var racine = document.getElementById('v-codex');
    var g = el('div', 'cx-grand cx-grand-perso');
    var face = 'fiches';
    var im = new Image();
    im.alt = it.nom;
    im.src = '/art/personnages/fiches/' + it.id + '.webp';
    g.appendChild(im);
    var n = el('div', 'cx-notice');
    n.appendChild(el('b', '', it.nom));
    n.appendChild(document.createTextNode((it.lu || '') + ' — ' + (it.possede ? 'owned' : 'not owned: buy it at the Vault') + '.'));
    var tourne = el('button', 'cx-puce on', 'VERSO');
    tourne.type = 'button';
    tourne.addEventListener('click', function (e) {
      e.stopPropagation();
      face = face === 'fiches' ? 'versos' : 'fiches';
      im.src = '/art/personnages/' + face + '/' + it.id + '.webp';
      tourne.textContent = face === 'fiches' ? 'VERSO' : 'RECTO';
    });
    im.onerror = function () {
      if (face === 'versos') { tourne.remove(); face = 'fiches'; im.src = '/art/personnages/fiches/' + it.id + '.webp'; }
    };
    n.appendChild(tourne);
    g.appendChild(n);
    var ferme = function () { g.remove(); document.removeEventListener('keydown', esc, true); };
    var esc = function (e) { if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); ferme(); } };
    g.addEventListener('click', ferme);
    document.addEventListener('keydown', esc, true);
    racine.appendChild(g);
  }

  /* S1418 · CX-4 (note 239 ②, CODEX §8) — LA NEUVIÈME BOÎTE : DAILY CHALLENGES. Un
     rang par Daily joué, lu dans `profil.options.dailies` (écrit en fin de partie par
     `main.ts::compteLaPartieAuProfil`, avec le RÉUSSI / RATÉ que le moteur publie dans
     `GAME_ENDED.daily`). Filtres : résultat, condition, mois. Le Cartographe ne la
     compte pas (pas une découverte). Les Dailies passés ne se rejouent pas : la boîte
     se lit, rien ne s'y lance. Phrase de Croze : « Au CODEX, la boîte DAILY CHALLENGES :
     chaque Daily que j'ai joué a sa ligne — date, nom, table, perso, objectif, RÉUSSI
     ou RATÉ — et je filtre réussi / raté. » */
  var DAILIES = 'dailies';
  function rangsDaily() {
    var p = window.LLProfil ? window.LLProfil.lis() : null;
    var l = p && p.options && Array.isArray(p.options.dailies) ? p.options.dailies : [];
    return l.filter(function (r) { return r && typeof r.date === 'string' && /^\d{8}$/.test(r.date); }).slice().reverse();
  }
  function resultatDe(r) { return r.reussi === true ? 'SUCCESS' : r.reussi === false ? 'FAILED' : 'NOT JUDGED'; }
  function conditionDe(j) {
    var t = String(j).replace(/\(.*$/, '');
    if (t === 'TILE_DECK:RUINS') return 'RUINS DECK';
    return t.replace(/_X2$/, ' \u00d72').replace(/_/g, ' ');
  }
  function boiteDailies() {
    var items = rangsDaily().map(function (r) {
      return { r: r, nom: String(r.nom || ''), f: { res: [resultatDe(r)],
        cond: (Array.isArray(r.jetons) ? r.jetons : []).map(conditionDe),
        mois: [r.date.slice(0, 4) + '-' + r.date.slice(4, 6)] } };
    });
    var valeurs = function (k) {
      var s = [];
      items.forEach(function (it) { it.f[k].forEach(function (v) { if (s.indexOf(v) < 0) s.push(v); }); });
      return s;
    };
    var filtres = [{ cle: 'res', libelle: 'Result', valeurs: ['SUCCESS', 'FAILED'] }];
    if (valeurs('cond').length > 0) filtres.push({ cle: 'cond', libelle: 'Condition', valeurs: valeurs('cond') });
    if (valeurs('mois').length > 0) filtres.push({ cle: 'mois', libelle: 'Month', valeurs: valeurs('mois').sort().reverse() });
    return { cle: DAILIES, libelle: 'Today\u2019s Dungeons', filtres: filtres, famille: null, items: items };
  }
  function passeDaily(it) {
    var q = etat.q.trim().toLowerCase();
    if (q !== '' && it.nom.toLowerCase().indexOf(q) < 0) return false;
    for (var k in etat.f) {
      var choix = etat.f[k];
      if (!choix || choix.length === 0) continue;
      var a = it.f[k] || [];
      var ok = false;
      for (var j = 0; j < choix.length; j++) { if (a.indexOf(choix[j]) >= 0) { ok = true; break; } }
      if (!ok) return false;
    }
    return true;
  }
  function ligneDaily(it, noms) {
    var r = it.r;
    var c = el('div', 'cx-daily' + (r.reussi === true ? ' ok' : r.reussi === false ? ' ko' : ''));
    c.appendChild(el('div', 'cx-ddate', r.date.slice(0, 4) + '-' + r.date.slice(4, 6) + '-' + r.date.slice(6, 8)));
    c.appendChild(el('div', 'cx-dnom', it.nom));
    c.appendChild(el('div', 'cx-dres', resultatDe(r)));
    var d = el('div', 'cx-ddents', typeof r.dents === 'number' ? r.dents + ' teeth' : '\u2014 teeth');
    if (typeof r.dents !== 'number') d.title = 'the game does not publish the teeth of a game yet';
    c.appendChild(d);
    var info = [r.table, noms[r.perso] || String(r.perso || ''), r.objectif].filter(function (x) { return x; });
    c.appendChild(el('div', 'cx-dinfo', info.join(' \u00b7 ')));
    return c;
  }

  /* S1416 · HM-5 ⓔ — SPIRIT MISSIONS : les défis de chaque esprit (`BOUNTY_WALL_DEFIS.md`
     v2), le portrait de l'esprit, l'état de chaque palier — EN CONSULTATION : on agit aux
     SPIRITS ROOMS. Un esprit se déplie au clic (`etat.esprit`). */
  function missions() {
    var box = el('div', 'cx-missions');
    box.appendChild(el('div', 'cx-sous', 'Spirit missions'));
    var BW = window.LLBountyWall;
    if (!BW || typeof BW.etat !== 'function' || !window.LLProfil) {
      box.appendChild(el('div', 'cx-vide', 'The spirits are not reachable from here.'));
      return box;
    }
    var etats = BW.etat(window.LLProfil.lis(), ['bones', 'pierre']);
    var liste = el('div', 'cx-ml');
    etats.forEach(function (t) {
      var faits = 0; var tous = 0; var suivant = null;
      t.rangs.forEach(function (g) {
        g.noeuds.forEach(function (x) { tous += 1; if (x.s === 'a_toi') faits += 1; });
        if (suivant === null && g.suivant !== null) suivant = { l: g.l, n: g.n, a: g.suivant.a, nom: g.suivant.nom };
      });
      var ligne = el('button', 'cx-mesprit' + (etat.esprit === t.id ? ' on' : ''));
      ligne.type = 'button';
      ligne.style.setProperty('--teinte', t.teinte || '#9a948a');
      var pp = new Image();
      pp.alt = '';
      pp.src = '/art/mur/pp_' + t.id + '.webp';
      pp.className = 'cx-pp';
      ligne.appendChild(pp);
      var txt = el('div', 'cx-mtxt');
      txt.appendChild(el('b', '', t.pointe === null ? 'Spirit of the Dungeon' : 'Spirit of ' + t.t));
      txt.appendChild(el('span', 'cx-mcompte', faits + ' / ' + tous + ' done'));
      if (suivant !== null) {
        txt.appendChild(el('span', 'cx-mnext', 'next: ' + suivant.l + ' — ' + Math.min(suivant.n, suivant.a) + ' / ' + suivant.a + ' → ' + suivant.nom));
      }
      ligne.appendChild(txt);
      ligne.addEventListener('click', function () { etat.esprit = etat.esprit === t.id ? null : t.id; peins(); });
      liste.appendChild(ligne);
      if (etat.esprit === t.id) {
        var det = el('div', 'cx-mdetail');
        t.rangs.forEach(function (g) {
          det.appendChild(el('div', 'cx-k', g.l + ' (' + g.n + ')'));
          g.noeuds.forEach(function (x) {
            var st = x.s === 'a_toi' ? '✓ done' : x.s === 'pret' ? '● ready — take it in the Spirits Rooms' : 'locked · ' + Math.min(g.n, x.a) + ' / ' + x.a;
            det.appendChild(el('div', 'cx-mnoeud ' + x.s, x.nom + ' · ' + st));
          });
        });
        liste.appendChild(det);
      }
    });
    box.appendChild(liste);
    return box;
  }

  /* S1472 · note 362 ① (GRADES §10 ⑥, §11 ②) — LA DIXIÈME BOÎTE : GRADES. Les 33, en
     galerie : le titre EN (le FR au survol, « garde la traduction FR »), le seuil de GP et
     où il se gagne. 1-3 = le jeu normal (l'échelon ouvert, marqué) ; 4-29 = le Pro Tour,
     30-33 = les tables VIP : fermés avec le DPT, grisés « opens later ». Ton grade est
     allumé : le moteur ne compte pas encore les GP (moteur 229, Q-GRD1), donc tu es au 1
     (seuil 0 GP). Les 33 tabliers de Croze sont posés (S1484, `public/art/grades/`) ; l'écu numéroté
     reste le repli. Phrase de Croze : « au CODEX, la boîte
     GRADES : les 33 grades, leur nom, leurs GP, le mien allumé, le Pro Tour grisé ». */
  var GRADES = 'grades';
  var GRADES_EN = ['Apprentice Floor-Licker', 'Fellow Chewer', 'Master Molar', 'Master Keyhole-Eye',
    'Master Not-Yet-Dead', 'Nosy Secretary', 'Provost of the Keyring', 'Steward of the Portcullis',
    'Elect of the Low Blow', 'Elect of the Three Skulls', 'Sublime Torchbearer', 'Grand Master of the Die',
    'Royal Strongbox', 'Grand Elect of the Cavity', 'Knight of the Fountain', 'Prince of the Two Cats',
    'Knight of the Grimoire', 'Bleeding Rose', 'Two-Headed Grand Pontiff', 'Master ad D20', 'Night Owl',
    'Prince of the Onion', 'Chief of the Magpies', 'Prince of the Crabs', 'Knight of the Brazen Tongue',
    'Prince of the Apple', 'Commander of the Flail', 'Knight of the Grey Star', 'Saint Bone',
    'Kadosh of the Fork', 'Grand Dental Inquisitor', 'Prince of the Harlequin’s Secret', 'Sovereign Grand Licker'];
  var GRADES_FR = ['Apprenti Lèche-Dalle', 'Compagnon Mâcheur', 'Maître Molaire', 'Maître Œil-de-Serrure',
    'Maître Pas-Encore-Mort', 'Secrétaire Indiscret', 'Prévôt du Trousseau', 'Intendant de la Herse',
    'Élu du Coup Bas', 'Élu des Trois Crânes', 'Sublime Porte-Torche', 'Grand Maître du Dé',
    'Royal Coffre-Fort', 'Grand Élu de la Carie', 'Chevalier de la Fontaine', 'Prince des Deux Chats',
    'Chevalier du Grimoire', 'Rose-Saignée', 'Grand Pontife Bicéphale', 'Maître ad D20', 'Noctambule',
    'Prince de l’Oignon', 'Chef des Pies', 'Prince des Crabes', 'Chevalier de la Langue d’Airain',
    'Prince de la Pomme', 'Commandeur du Fléau', 'Chevalier de l’Étoile Grise', 'Saint-Os',
    'Kadosh à la Fourchette', 'Grand Inquisiteur Dentaire', 'Prince du Secret d’Arlequin', 'Souverain Grand Lécheur'];
  /* GRADES §11 ② : les GP pour ATTEINDRE le grade n (le 33 = le top 10 de la saison) */
  var GRADES_GP = [0, 300, 600, 1000, 1400, 1800, 2200, 2600, 3000, 3400, 3800, 4200, 4600, 5000, 5800,
    6600, 7400, 8200, 9400, 10600, 11800, 13000, 14200, 15400, 16600, 17800, 19000, 20200, 21400,
    23400, 25400, 27400, null];
  /* S1480 · note 314 ② — le grade se lit sur les GP du profil (`gp`, posés à la fin de chaque partie
     comptée, depuis `GAME_ENDED.grades` du moteur) : le plus haut seuil atteint. */
  var MON_GRADE = (function () {
    var gp = 0;
    try { var p = window.LLProfil && window.LLProfil.lis(); if (p && typeof p.gp === 'number') gp = p.gp; } catch (e) { gp = 0; }
    var g = 1;
    for (var i = 0; i < GRADES_GP.length; i++) { if (GRADES_GP[i] !== null && gp >= GRADES_GP[i]) g = i + 1; }
    return g;
  })();
  function ouSeGagne(n) { return n <= 3 ? 'NORMAL PLAY' : n <= 29 ? 'DUNGEON PRO TOUR' : 'VIP TABLES'; }
  function boiteGrades() {
    var items = GRADES_EN.map(function (nom, i) {
      var n = i + 1;
      return { n: n, nom: nom, fr: GRADES_FR[i], gp: GRADES_GP[i], f: { ou: [ouSeGagne(n)] } };
    });
    return { cle: GRADES, libelle: 'Grades', famille: null, items: items,
      filtres: [{ cle: 'ou', libelle: 'Earned in', valeurs: ['NORMAL PLAY', 'DUNGEON PRO TOUR', 'VIP TABLES'] }] };
  }
  function carteGrade(it) {
    var ferme = it.n > 3;
    var c = el('div', 'cx-carte cx-grade' + (ferme ? ' ferme' : ' ouvert') + (it.n === MON_GRADE ? ' mien' : ''));
    c.title = it.fr;
    /* S1484 · note 366 ③ — le TABLIER de Croze (ASSETS/tabliers, détouré par tools/tabliers_webp.py) ;
       l'écu numéroté reste le repli si l'image manque. */
    var ecu = el('div', 'cx-ecu');
    ecu.appendChild(el('span', 'cx-ecu-n', String(it.n)));
    var tab = document.createElement('img');
    tab.className = 'cx-tablier';
    tab.alt = it.nom;
    tab.loading = 'lazy';
    tab.src = '/art/grades/tablier_' + (it.n < 10 ? '0' : '') + it.n + '.webp';
    tab.onerror = function () { tab.replaceWith(ecu); };
    c.appendChild(tab);
    c.appendChild(el('div', 'cx-gnum', 'GRADE ' + it.n));
    c.appendChild(el('div', 'cx-nom', it.nom));
    c.appendChild(el('div', 'cx-ggp', it.gp === null ? 'top 10 of the season' : it.gp.toLocaleString('en-US') + ' GP'));
    c.appendChild(el('div', 'cx-gou', it.n === MON_GRADE ? 'YOUR GRADE' : ferme ? ouSeGagne(it.n) + ' · opens later' : ouSeGagne(it.n)));
    return c;
  }

  function boiteOuverte() {
    if (etat.boite === PERSOS) return boitePersos();
    if (etat.boite === DAILIES) return boiteDailies();
    if (etat.boite === GRADES) return boiteGrades();
    for (var i = 0; i < DONNEE.boites.length; i++) {
      if (DONNEE.boites[i].cle === etat.boite) return DONNEE.boites[i];
    }
    return DONNEE.boites[0];
  }

  function passe(it, b, V) {
    var vu = V[b.famille].has(it.id);
    if (vu && !etat.vus) return false;
    if (!vu && !etat.pasVus) return false;
    var q = etat.q.trim().toLowerCase();
    if (q !== '' && (it.nom + ' ' + (it.famille || '')).toLowerCase().indexOf(q) < 0) return false;
    if (etat.partout && q !== '') return true;   /* recherche sur tout le codex : pas de pastilles */
    for (var k in etat.f) {
      var choix = etat.f[k];
      if (!choix || choix.length === 0) continue;
      var a = it.f[k] || [];
      var ok = false;
      for (var j = 0; j < choix.length; j++) { if (a.indexOf(choix[j]) >= 0) { ok = true; break; } }
      if (!ok) return false;
    }
    return true;
  }

  function agrandis(it) {
    /* S1426 - FL-1 (note 253) : une Foil possedee (ou la quete / le mob dont Croze a depose la video)
       s'ouvre en carte cinematique, le gabarit fait pour la video (`foils.js`). */
    if (window.LLFoils && window.LLFoils.pourLeCodex(it.id)) { return; }
    var racine = document.getElementById('v-codex');
    var g = el('div', 'cx-grand');
    var im = new Image();
    im.alt = it.nom;
    im.src = it.art;
    g.appendChild(im);
    var n = el('div', 'cx-notice');
    n.appendChild(el('b', '', it.nom));
    n.appendChild(document.createTextNode(it.texte || ''));
    /* S1536 · note 384 ⑦ — « au Codex je vois qu'un Fairy Garden sort dix fois moins qu'une tuile normale » */
    if (typeof it.tirage === 'number') n.appendChild(el('div', 'cx-tirage', 'Draw chance: ' + Math.round(it.tirage * 100) + ' % of a normal tile'));
    g.appendChild(n);
    var ferme = function () { g.remove(); document.removeEventListener('keydown', esc, true); };
    var esc = function (e) { if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); ferme(); } };
    g.addEventListener('click', ferme);
    document.addEventListener('keydown', esc, true);
    racine.appendChild(g);
  }

  function carte(it, vu) {
    var c = el('div', 'cx-carte' + (vu ? ' vu' : ''));
    var cadre = el('div', 'cx-img');
    if (vu && it.art) {
      var im = new Image();
      im.loading = 'eager';   /* jamais lazy : un onglet qui ne compose pas ne la charge jamais (main.ts, tuileDeRoster) */
      im.alt = '';
      im.src = it.art;
      cadre.appendChild(im);
    } else {
      cadre.className = 'cx-img dos';   /* S1414 · CX-3 : une carte retournée, le dos Lick Floor */
      /* note 271 (4) : LE DOS ÉQUIPÉ du joueur (profil equipe.dos ; null = Lick Floor) */
      var dosEq = dosEquipe();
      if (dosEq) cadre.style.backgroundImage = 'url(/art/dos/' + dosEq + '.webp)';
      cadre.appendChild(el('span', 'cx-q', '?'));
    }
    c.appendChild(cadre);
    c.appendChild(el('div', 'cx-nom', it.nom));
    /* S1536 · note 384 ⑦ — le poids de tirage (v158) : « 10 % » sous le nom d'une tuile spéciale */
    if (typeof it.tirage === 'number') c.appendChild(el('div', 'cx-tirage', 'draw chance ' + Math.round(it.tirage * 100) + ' %'));
    if (vu) c.addEventListener('click', function () { agrandis(it); });
    return c;
  }

  function ombres(grille, fen) {
    var maj = function () {
      var haut = grille.scrollTop > 2;
      var bas = grille.scrollTop + grille.clientHeight < grille.scrollHeight - 2;
      fen.querySelector('.cx-ombre.h').classList.toggle('on', haut);
      fen.querySelector('.cx-ombre.b').classList.toggle('on', bas);
      fen.querySelector('.cx-chev.h').classList.toggle('on', haut);
      fen.querySelector('.cx-chev.b').classList.toggle('on', bas);
    };
    grille.addEventListener('scroll', maj);
    requestAnimationFrame(maj);
    setTimeout(maj, 300);
  }

  function peins() {
    var racine = document.getElementById('v-codex');
    if (!racine) return;
    style();
    if (DONNEE === null) {
      fetch('/titre/codex.gen.json', { cache: 'no-store' })
        .then(function (r) { return r.json(); })
        .then(function (d) { DONNEE = d; peins(); })
        .catch(function () {
          var box = document.getElementById('codex');
          if (box) box.textContent = 'The codex index is missing (tools/codex.py).';
        });
      return;
    }
    var box = document.getElementById('codex');
    box.innerHTML = '';
    var V = vus();
    var b = boiteOuverte();

    /* ── gauche : recherche, découvert / pas encore, pastilles ── */
    var g = el('div', 'cx-col cx-registre');
    g.appendChild(el('div', 'cx-titre', 'Codex'));
    var q = el('input', 'cx-recherche');
    q.type = 'search';
    q.placeholder = 'search a name';
    q.value = etat.q;
    q.addEventListener('input', function () {
      etat.q = q.value;
      peinsLaGrille();
    });
    g.appendChild(q);
    var portee = el('div', 'cx-rangee');
    [['THIS BOX', false], ['WHOLE CODEX', true]].forEach(function (x) {
      var p = el('button', 'cx-puce' + (etat.partout === x[1] ? ' on' : ''), x[0]);
      p.type = 'button';
      p.addEventListener('click', function () { etat.partout = x[1]; peins(); });
      portee.appendChild(p);
    });
    g.appendChild(portee);
    var dec = el('div', 'cx-rangee');
    [['DISCOVERED', 'vus'], ['NOT YET', 'pasVus']].forEach(function (x) {
      var p = el('button', 'cx-puce' + (etat[x[1]] ? ' on' : ''), (etat[x[1]] ? '☑ ' : '☐ ') + x[0]);
      p.type = 'button';
      p.addEventListener('click', function () { etat[x[1]] = !etat[x[1]]; peins(); });
      dec.appendChild(p);
    });
    g.appendChild(dec);
    var fl = el('div', 'cx-filtres');
    b.filtres.forEach(function (rang) {
      fl.appendChild(el('div', 'cx-k', rang.libelle));
      var r = el('div', 'cx-rangee');
      rang.valeurs.forEach(function (v) {
        var choix = etat.f[rang.cle] || [];
        var on = choix.indexOf(v) >= 0;
        var p = el('button', 'cx-puce' + (on ? ' on' : ''), v);
        p.type = 'button';
        p.addEventListener('click', function () {
          var c = (etat.f[rang.cle] || []).slice();
          var i = c.indexOf(v);
          if (i >= 0) c.splice(i, 1); else c.push(v);
          etat.f[rang.cle] = c;
          peins();
        });
        r.appendChild(p);
      });
      fl.appendChild(r);
    });
    g.appendChild(fl);
    g.appendChild(missions());
    box.appendChild(g);

    /* ── centre : la grille ── */
    var c = el('div', 'cx-centre');
    var tete = el('div', 'cx-tete');
    var titre = el('div', 'cx-titre', b.libelle);
    tete.appendChild(titre);
    var compteVisible = el('div', 'cx-sous', '');
    tete.appendChild(compteVisible);
    c.appendChild(tete);
    var fen = el('div', 'cx-fen');
    var grille = el('div', 'cx-grille');
    fen.appendChild(grille);
    ['h', 'b'].forEach(function (k) {
      fen.appendChild(el('div', 'cx-ombre ' + k));
      var ch = el('button', 'cx-chev ' + k, k === 'h' ? '▲' : '▼');
      ch.type = 'button';
      ch.addEventListener('click', function () {
        grille.scrollBy({ top: (k === 'h' ? -1 : 1) * grille.clientHeight * 0.8, behavior: 'smooth' });
      });
      fen.appendChild(ch);
    });
    c.appendChild(fen);
    box.appendChild(c);

    function peinsLaGrille() {
      grille.innerHTML = '';
      var boites = etat.partout && etat.q.trim() !== '' ? DONNEE.boites : [b];
      var n = 0;
      grille.classList.toggle('cx-lignes', b.cle === DAILIES);
      if (b.cle === DAILIES) {
        var noms = {};
        boitePersos().items.forEach(function (x) { noms[x.id] = x.nom; });
        b.items.forEach(function (it) {
          if (!passeDaily(it)) return;
          grille.appendChild(ligneDaily(it, noms));
          n += 1;
        });
        if (b.items.length === 0) grille.appendChild(el('div', 'cx-vide', 'No Today\u2019s Dungeon played yet \u2014 DIVE \u2192 TODAY\u2019S DUNGEON.'));
        else if (n === 0) grille.appendChild(el('div', 'cx-vide', 'Nothing matches.'));
        compteVisible.textContent = n + ' shown \u00b7 ' + b.items.length + ' played';
        grille.scrollTop = 0;
        return;
      }
      if (b.cle === GRADES) {
        var qg = etat.q.trim().toLowerCase();
        var ou = etat.f.ou || [];
        b.items.forEach(function (it) {
          if (qg !== '' && (it.nom + ' ' + it.fr).toLowerCase().indexOf(qg) < 0) return;
          if (ou.length > 0 && ou.indexOf(it.f.ou[0]) < 0) return;
          grille.appendChild(carteGrade(it));
          n += 1;
        });
        if (n === 0) grille.appendChild(el('div', 'cx-vide', 'Nothing matches.'));
        compteVisible.textContent = n + ' shown · your grade: ' + MON_GRADE + ' · grades 1-3 open in normal play';
        grille.scrollTop = 0;
        return;
      }
      if (b.cle === PERSOS) {
        var qp = etat.q.trim().toLowerCase();
        b.items.forEach(function (it) {
          if (qp !== '' && it.nom.toLowerCase().indexOf(qp) < 0) return;
          grille.appendChild(cartePerso(it));
          n += 1;
        });
        compteVisible.textContent = n + ' shown · ' + b.items.filter(function (x) { return x.possede; }).length + ' owned';
        grille.scrollTop = 0;
        return;
      }
      boites.forEach(function (bb) {
        bb.items.forEach(function (it) {
          if (!passe(it, bb, V)) return;
          grille.appendChild(carte(it, V[bb.famille].has(it.id)));
          n += 1;
        });
      });
      if (n === 0) grille.appendChild(el('div', 'cx-vide', 'Nothing matches.'));
      compteVisible.textContent = n + ' shown';
      grille.scrollTop = 0;
    }
    peinsLaGrille();
    ombres(grille, fen);

    /* ── droite : les sept boîtes ── (S1414 · CX-3 : la cire de chaque boîte, CODEX §6 ⓡ) */
    var CIRE = { tiles: '#7d776c', traps: '#8b4a22', mobs: '#cfc3a4', bosses: '#6e1414', chests: '#c9a227',
      quests: '#1c1a19', loots: '#a8987a' };
    var d = el('div', 'cx-col cx-decks');
    d.appendChild(el('div', 'cx-sous', 'Decks'));
    var liste = noeuds();
    DONNEE.boites.forEach(function (bb) {
      var total = bb.items.length;
      var trouve = 0;
      bb.items.forEach(function (it) { if (V[bb.famille].has(it.id)) trouve += 1; });
      var pct = total === 0 ? 0 : Math.floor(100 * trouve / total);
      var bt = el('button', 'cx-boite' + (bb.cle === b.cle ? ' on' : ''));
      bt.type = 'button';
      var sc = el('span', 'cx-sceau');
      sc.style.setProperty('--cire', CIRE[bb.cle] || '#6e1414');
      bt.appendChild(sc);
      bt.appendChild(el('div', 'cx-bnom', bb.libelle));
      var cpt = el('div', 'cx-bcompte');
      cpt.appendChild(el('span', '', trouve + ' / ' + total));
      cpt.appendChild(el('span', '', pct + ' %'));
      bt.appendChild(cpt);
      var barre = el('div', 'cx-barre');
      var i = el('i');
      i.style.width = pct + '%';
      barre.appendChild(i);
      bt.appendChild(barre);
      /* CX-2 : le prochain nœud du Cartographe que cette boîte nourrit */
      var nx = prochainDe(bb.cle, liste);
      if (nx !== null) {
        bt.appendChild(el('div', 'cx-next', (nx.s === 'pret' ? '\u2713 ' : 'next: ') + nx.l + ' \u2192 ' + nx.recompense));
      }
      bt.addEventListener('click', function () {
        etat.boite = bb.cle;
        etat.f = {};
        peins();
      });
      d.appendChild(bt);
    });
    var bp = boitePersos();
    var aMoi = bp.items.filter(function (x) { return x.possede; }).length;
    var btp = el('button', 'cx-boite' + (b.cle === PERSOS ? ' on' : ''));
    btp.type = 'button';
    var scp = el('span', 'cx-sceau');
    scp.style.setProperty('--cire', '#3d2a52');
    btp.appendChild(scp);
    btp.appendChild(el('div', 'cx-bnom', 'Characters'));
    var cptp = el('div', 'cx-bcompte');
    cptp.appendChild(el('span', '', bp.items.length + ' to browse'));
    cptp.appendChild(el('span', '', aMoi + ' owned'));
    btp.appendChild(cptp);
    btp.addEventListener('click', function () { etat.boite = PERSOS; etat.f = {}; peins(); });
    d.appendChild(btp);
    var bd = boiteDailies();
    var btd = el('button', 'cx-boite' + (b.cle === DAILIES ? ' on' : ''));
    btd.type = 'button';
    var scd = el('span', 'cx-sceau');
    scd.style.setProperty('--cire', '#2f4a5c');
    btd.appendChild(scd);
    btd.appendChild(el('div', 'cx-bnom', 'Today\u2019s Dungeons'));
    var cptd = el('div', 'cx-bcompte');
    cptd.appendChild(el('span', '', bd.items.length + ' played'));
    cptd.appendChild(el('span', '', bd.items.filter(function (x) { return x.r.reussi === true; }).length + ' succeeded'));
    btd.appendChild(cptd);
    btd.addEventListener('click', function () { etat.boite = DAILIES; etat.f = {}; peins(); });
    d.appendChild(btd);
    var btg = el('button', 'cx-boite' + (b.cle === GRADES ? ' on' : ''));
    btg.type = 'button';
    var scg = el('span', 'cx-sceau');
    scg.style.setProperty('--cire', '#8a1c1c');
    btg.appendChild(scg);
    btg.appendChild(el('div', 'cx-bnom', 'Grades'));
    var cptg = el('div', 'cx-bcompte');
    cptg.appendChild(el('span', '', '33 grades'));
    cptg.appendChild(el('span', '', 'yours: ' + MON_GRADE));
    btg.appendChild(cptg);
    btg.addEventListener('click', function () { etat.boite = GRADES; etat.f = {}; peins(); });
    d.appendChild(btg);
    box.appendChild(d);
  }

  /* ── CX-2 (note 229, CODEX §3) — LA HUITIÈME BRANCHE : EXPLORATION ──────
     LE CARTOGRAPHE ne donne QUE des dents et des VIVRES (les offrandes du sac,
     `bounty_wall.js` OFFRANDES) ; ni pacte ni offrande sur sa branche. Il
     s'éveille à la première découverte. Les seuils se CALCULENT sur les totaux
     comptés (jamais un nombre écrit : 75 % de 454 = 341, Q-CODEX-TOTAL), au
     plafond (« 23 sur 90 », « 76 sur 301 » : la table de §3 arrondit au-dessus).
     Un nœud franchi se TOUCHE : il verse sa récompense, une fois
     (`profil.exploration.pris`, ses indices). */
  function charge(cb) {
    if (DONNEE !== null) { cb(); return; }
    fetch('/titre/codex.gen.json', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (d) { DONNEE = d; cb(); })
      .catch(function () { /* sans index, le Cartographe dort */ });
  }
  function progres() {
    var V = vus();
    var P = { tout: { n: 0, total: 0 }, subboss: { n: 0, total: 0 }, boss: { n: 0, total: 0 } };
    DONNEE.boites.forEach(function (b) {
      var n = 0;
      b.items.forEach(function (it) {
        var vu = V[b.famille].has(it.id);
        if (vu) n += 1;
        if (b.cle === 'bosses') {
          var k = (it.f.tier || [])[0] === 'BOSS' ? 'boss' : 'subboss';
          P[k].total += 1;
          if (vu) P[k].n += 1;
        }
      });
      P[b.cle] = { n: n, total: b.items.length };
      P.tout.n += n;
      P.tout.total += b.items.length;
    });
    return P;
  }
  var TOUTES = ['tiles', 'traps', 'mobs', 'bosses', 'chests', 'loots', 'quests'];
  /* S1414 · CX-3 (note 235 ③, CODEX §3/§6) : « pour les récompenses ne laisse que des teeth »
     — 100 · 150 · 250 · 400 · 600 · 1 000, plus aucune offrande. */
  /* S1415 · BW-5 (note 237 ①, BOUNTY_WALL_DEFIS v2) : l'Exploration devient les
     paliers 4-15 de la branche DONJON du mur — douze paliers, dans l'ordre de
     `bounty_wall.js` CX (libellés et récompenses y sont aussi). Deux paliers donnent
     un CURSEUR (Bones, Collapse) : ils ne versent rien ici, le mur les sert. */
  function pc(cle, f) {
    return { n: function (P) { return P[cle].n; }, seuil: function (P) { return Math.ceil(P[cle].total * f); } };
  }
  function nd(l, boites, dents, m, extra) {
    var o = { l: l, boites: boites, dents: dents, sorte: null, n: m.n, seuil: m.seuil };
    if (extra) { for (var k in extra) { o[k] = extra[k]; } }
    return o;
  }
  var NOEUDS = [
    nd('25 % of the TILES', ['tiles'], 100, pc('tiles', 0.25)),
    nd('50 % of the TILES', ['tiles'], 200, pc('tiles', 0.5)),
    /* S1418 - note 240 (1), BOUNTY_WALL 19 : le de forge remplace les 300 dents */
    nd('75 % of the TILES', ['tiles'], 0, pc('tiles', 0.75), { des: 'Orange pearl dice' }),
    nd('100 % of the TILES', ['tiles'], 0, pc('tiles', 1), { curseur: 'Bones cursor' }),
    nd('25 % of the LOOT CARDS', ['loots'], 150, pc('loots', 0.25)),
    nd('50 % of the LOOT CARDS', ['loots'], 250, pc('loots', 0.5)),
    nd('75 % of the LOOT CARDS', ['loots'], 350, pc('loots', 0.75)),
    nd('100 % of the LOOT CARDS', ['loots'], 0, pc('loots', 1), { curseur: 'Collapse cursor' }),
    /* S1413 · CX-1 bis (note 234 ②) : ce palier compte aussi les QUESTS. */
    nd('every TRAP, every CHEST and every QUEST', ['traps', 'chests', 'quests'], 250,
      { n: function (P) { return P.traps.n + P.chests.n + P.quests.n; },
        seuil: function (P) { return P.traps.total + P.chests.total + P.quests.total; } }),
    nd('every SUB-BOSS', ['bosses'], 400,
      { n: function (P) { return P.subboss.n; }, seuil: function (P) { return P.subboss.total; } }),
    nd('75 % of the CODEX', TOUTES, 600, pc('tout', 0.75)),
    nd('100 % of the CODEX — the 3 BOSSES too', TOUTES, 1000, pc('tout', 1), { bout: true })
  ];
  /* BW-5 : un profil d'avant (six nœuds) garde ce qu'il a pris, relu sous le nouvel ordre. */
  var ANCIEN_ORDRE = [0, 4, 8, 9, 10, 11];
  function pris(p) {
    var x = p && p.exploration && Array.isArray(p.exploration.pris) ? p.exploration.pris : [];
    if (p && p.exploration && p.exploration.v === 2) return x;
    return x.map(function (i) { return ANCIEN_ORDRE[i]; }).filter(function (i) { return typeof i === 'number'; });
  }
  function recompense(x) {
    var O = window.LLBountyWall ? window.LLBountyWall.OFFRANDES : {};
    var parts = [];
    if (x.dents > 0) parts.push(x.dents.toLocaleString('en-US') + ' teeth');
    if (x.curseur) parts.push(x.curseur);
    if (x.des) parts.push(x.des);
    if (x.sorte && O[x.sorte]) parts.push(O[x.sorte].nom + ' ×' + O[x.sorte].x);
    return parts.join(' + ');
  }
  function noeuds() {
    var P = progres();
    var pr = pris(window.LLProfil ? window.LLProfil.lis() : null);
    return NOEUDS.map(function (x, i) {
      var n = x.n(P), seuil = x.seuil(P);
      return { i: i, l: x.l, n: Math.min(n, seuil), seuil: seuil, dents: x.dents, sorte: x.sorte,
        bout: x.bout === true, boites: x.boites, recompense: recompense(x),
        s: pr.indexOf(i) >= 0 ? 'a_toi' : n >= seuil ? 'pret' : 'lock' };
    });
  }
  function dort() { return progres().tout.n === 0; }
  function touche(i) {
    var x = noeuds()[i];
    if (!x || x.s !== 'pret') return false;
    var fait = false;
    window.LLProfil.modifie(function (p) {
      if (typeof p.exploration !== 'object' || p.exploration === null) p.exploration = { pris: [] };
      p.exploration.pris = pris(p);
      p.exploration.v = 2;
      if (p.exploration.pris.indexOf(i) >= 0) return;
      p.exploration.pris.push(i);
      p.dents += x.dents;
      if (x.sorte) {
        if (!Array.isArray(p.offrandes)) p.offrandes = [];
        p.offrandes.push(x.sorte);
      }
      fait = true;
    });
    return fait;
  }
  /* « le CODEX affiche sous chaque boîte le prochain nœud qu'elle nourrit » (§3) :
     le premier nœud pas encore touché qui la lit, les siens avant les communs. */
  function prochainDe(cle, liste) {
    var a = null;
    for (var i = 0; i < liste.length; i++) {
      var x = liste[i];
      if (x.s === 'a_toi' || x.boites.indexOf(cle) < 0) continue;
      if (x.boites.length < TOUTES.length) return x;
      if (a === null) a = x;
    }
    return a;
  }

  /* BW-5 : le mur lit l'Exploration ici ; il demande d'abord si l'index est chargé. */
  function pret() { return DONNEE !== null; }
  window.LLCodex = { peins: peins, charge: charge, progres: progres, noeuds: noeuds, dort: dort, pret: pret,
    touche: touche, prochainDe: prochainDe };
})();
