/*
 * classement.js — L'ÉCRAN RANKING, AU HOME (S1429 · RK-1, note 269 ①).
 *
 * Phrase de Croze (R3) : « Au HOME j'ouvre RANKING : je vois les joueurs classés
 * avec leurs points, je clique sur un pseudo et je tombe sur ses stats ; en haut
 * je peux aussi taper un pseudo directement. »
 *
 * Deux appels au serveur du compte (`compte.js::appel`, même base que le login) :
 *   - `GET /ranking`          → la liste : `[{ pseudo, points, grade }]`, ou un objet
 *                               qui la porte sous `joueurs` / `players` / `ranking` ;
 *   - `GET /players/:pseudo`  → le profil public (SRV-2, note moteur 191 ②) :
 *                               `{ pseudo, rang, wall, codex, stats }`.
 * Aucun des deux n'existe sur SRV-1 (mesuré le 12/10 : `app.ts` ne sert que
 * /health, /auth/*, /profile, /rooms). L'écran est bâti CONTRE eux et le dit en
 * clair tant qu'ils ne répondent pas : il s'arme seul le jour où SRV-2 est en
 * ligne, sans palier de l'écran (Q-269-ROUTES).
 *
 * Rien de privé n'est montré ni demandé : un pseudo, des points, un grade, des
 * stats publiques.
 */
(function () {
  'use strict';

  var CSS =
    '.rk{position:absolute;left:5.1%;right:5.1%;top:33%;bottom:5%;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:0 3cqw;' +
    'font-family:var(--mono,monospace);color:#e9e2d4}' +
    '.rk-col{display:flex;flex-direction:column;min-height:0}' +
    '.rk-find{display:flex;gap:1cqw;margin-bottom:1.6cqh}' +
    '.rk-find input{flex:1;min-width:0;background:#0d0c0b;border:1px solid rgba(233,226,212,.35);color:#f4eddc;' +
    'font:700 2cqh/1 var(--mono,monospace);padding:1.1cqh 1cqw;letter-spacing:.04em}' +
    '.rk-find input::placeholder{color:rgba(233,226,212,.4)}' +
    '.rk-find button{background:#a3231d;color:#fff0d8;border:0;font:900 1.7cqh/1 "Arial Black",sans-serif;letter-spacing:.12em;' +
    'padding:0 1.6cqw;cursor:pointer;text-transform:uppercase}' +
    '.rk-tete,.rk-l{display:grid;grid-template-columns:4.5cqw minmax(0,1fr) 9cqw 9cqw;gap:1cqw;align-items:baseline;padding:.9cqh .8cqw}' +
    '.rk-tete{font:900 1.3cqh/1 "Arial Black",sans-serif;letter-spacing:.16em;text-transform:uppercase;color:rgba(233,226,212,.55);' +
    'border-bottom:1px solid rgba(233,226,212,.25)}' +
    '.rk-liste{flex:1;min-height:0;overflow-y:auto;scrollbar-width:none}' +
    '.rk-liste::-webkit-scrollbar{display:none}' +
    '.rk-l{font-size:1.9cqh;border-bottom:1px solid rgba(233,226,212,.08);cursor:pointer}' +
    '.rk-l:hover,.rk-l:focus-visible{background:rgba(163,35,29,.28);outline:none}' +
    '.rk-l.moi{border-left:3px solid #d9b35a}' +
    '.rk-pos{color:rgba(233,226,212,.55)}.rk-pts{text-align:right;color:#d9b35a;font-weight:700}.rk-gr{text-align:right}' +
    '.rk-dit{font-size:1.7cqh;line-height:1.5;color:rgba(233,226,212,.75);padding:1.4cqh .8cqw}' +
    '.rk-dit b{color:#f4eddc}' +
    '.rk-fiche{border-left:1px solid rgba(233,226,212,.2);padding-left:2cqw;overflow-y:auto;scrollbar-width:none}' +
    '.rk-fiche h3{font:900 3.4cqh/1.1 "Arial Black",sans-serif;letter-spacing:.06em;margin:0 0 .6cqh;color:#f4eddc}' +
    '.rk-fiche .rk-k{font:900 1.3cqh/1 "Arial Black",sans-serif;letter-spacing:.16em;text-transform:uppercase;color:rgba(233,226,212,.55);margin:2cqh 0 .6cqh}' +
    '.rk-kv{display:flex;justify-content:space-between;gap:1cqw;font-size:1.8cqh;padding:.45cqh 0;border-bottom:1px solid rgba(233,226,212,.08)}' +
    '.rk-kv span:last-child{color:#d9b35a;font-weight:700;text-align:right}' +
    /* S1459 - note 324 : les deux onglets, et la carriere */
    '.rk-onglets{position:absolute;left:0;top:-5.6cqh;display:flex;gap:1.2cqw;z-index:1}' +
    '.rk-onglet{background:none;border:0;border-bottom:3px solid transparent;color:rgba(233,226,212,.55);cursor:pointer;' +
    'font:900 1.9cqh/1 "Arial Black",sans-serif;letter-spacing:.16em;padding:.6cqh .2cqw;text-transform:uppercase}' +
    '.rk-onglet.on{color:#f4eddc;border-bottom-color:#a3231d}' +
    '.rk-car{display:flex;flex-direction:column;gap:1.4cqh}' +
    '.rk-gros{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.4cqw}' +
    '.rk-gros div{border:1px solid rgba(233,226,212,.18);padding:1.4cqh 1cqw;text-align:center}' +
    '.rk-gros b{display:block;font:900 5cqh/1 "Arial Black",sans-serif;color:#d9b35a}' +
    '.rk-gros span{display:block;margin-top:.8cqh;font:900 1.25cqh/1 "Arial Black",sans-serif;letter-spacing:.16em;color:rgba(233,226,212,.6)}' +
    '.rk-mode{display:grid;grid-template-columns:minmax(0,1.4fr) repeat(3,minmax(0,1fr));gap:1cqw;font-size:1.8cqh;padding:.6cqh 0;' +
    'border-bottom:1px solid rgba(233,226,212,.08)}' +
    '.rk-mode span:not(:first-child){text-align:right;color:#d9b35a;font-weight:700}' +
    '.rk-mode.dort{opacity:.45}.rk-mode.dort span:not(:first-child){color:inherit;font-weight:400}' +
    '.rk-mode.tete{font:900 1.2cqh/1 "Arial Black",sans-serif;letter-spacing:.16em;color:rgba(233,226,212,.55)}' +
    '.rk-mode.tete span:not(:first-child){color:inherit}';

  var etat = { liste: null, choisi: null, motif: null, onglet: 'RANKED' };

  /* ═══ S1459 - note 324 — CAREER ═══
     Phrase : « Au HOME j'ouvre RANKING, l'onglet CAREER : « 47 games · 19 successes · 40 % », une ligne
     par mode, ma meilleure serie, mon temps de jeu, mon perso le plus joue ; je clique un pseudo de la
     liste : les memes lignes pour lui, ou la phrase qui dit que le serveur ne les sert pas encore. »
     MOI = le profil de ce PC, calcule comme le serveur (`carriereDe`, palier 909 : memes cles, meme
     definition du succes) ; LUI = le bloc `stats` de `GET /players/:pseudo`. Un compteur absent rend
     null : la ligne dit « counted from now on », jamais un chiffre devine. */
  function carriereDuProfil(p) {
    p = p || {};
    var fini = function (v) { return typeof v === 'number' && isFinite(v); };
    var cpt = p.compteurs && typeof p.compteurs === 'object' ? p.compteurs : {};
    var lu = function (k) { return fini(cpt[k]) ? cpt[k] : null; };
    var games = 0, victoires = 0, most = null;
    var persos = p.personnages && typeof p.personnages === 'object' ? p.personnages : {};
    Object.keys(persos).forEach(function (id) {
      var v = persos[id]; if (!v || typeof v !== 'object') { return; }
      var g = fini(v.parties) ? v.parties : 0, w = fini(v.victoires) ? v.victoires : 0;
      games += g; victoires += w;
      if (g > 0 && (most === null || g > most.games)) { most = { character: id, games: g, successes: w }; }
    });
    var opts = p.options && typeof p.options === 'object' ? p.options : {};
    var dailies = Array.isArray(opts.dailies) ? opts.dailies : [];
    var reussis = dailies.filter(function (d) { return d && d.reussi === true; }).length;
    var successes = victoires + reussis;
    var mode = function (m, k) { return { games: lu('parties_' + m), successes: lu(k) }; };
    var daily = mode('daily', 'reussites_daily');
    /* les Dailies d'AVANT le compteur se relisent dans `options.dailies` (note 324 ④) */
    if (daily.games === null && dailies.length > 0) { daily = { games: dailies.length, successes: reussis }; }
    return {
      games: games, successes: successes, success_rate: games < 1 ? null : Math.round((100 * successes) / games),
      by_mode: { bots: mode('bots', 'victoires_bots'), online: mode('online', 'victoires_online'), daily: daily,
        dpt: mode('dpt', 'victoires_dpt') },
      best_streak: lu('serie_victoires_max'), playtime_ms: lu('playtime_ms'), most_played: most
    };
  }
  function nomDuPerso(id) {
    return String(id || '').split('_').map(function (m) { return m.charAt(0).toUpperCase() + m.slice(1); }).join(' ');
  }
  function duree(ms) {
    if (typeof ms !== 'number' || !isFinite(ms)) { return null; }
    var min = Math.round(ms / 60000), h = Math.floor(min / 60), m = min % 60;
    return h > 0 ? h + ' h ' + (m < 10 ? '0' : '') + m : m + ' min';
  }
  function taux(g, s) { return typeof g === 'number' && g >= 1 && typeof s === 'number' ? Math.round((100 * s) / g) + ' %' : '—'; }
  function blocCarriere(c) {
    var b = el('div', 'rk-car');
    var gros = el('div', 'rk-gros');
    [[fmt(c.games), 'GAMES PLAYED'], [fmt(c.successes), 'SUCCESSES'],
     [c.success_rate === null || c.success_rate === undefined ? '—' : c.success_rate + ' %', 'SUCCESS RATE']]
      .forEach(function (x) { var d = el('div'); d.append(el('b', null, x[0]), el('span', null, x[1])); gros.appendChild(d); });
    b.appendChild(gros);
    var t = el('div', 'rk-mode tete');
    t.append(el('span', null, 'MODE'), el('span', null, 'PLAYED'), el('span', null, 'SUCCESS'), el('span', null, '%'));
    b.appendChild(t);
    var bm = c.by_mode || {};
    [['VS BOTS', bm.bots, false], ['ONLINE', bm.online, false], ["TODAY'S DUNGEON", bm.daily, false],
     ['DUNGEON PRO TOUR', bm.dpt, window.LL_DPT_ENDORMI === true]].forEach(function (x) {
      var m = x[1] || {}, l = el('div', 'rk-mode' + (x[2] ? ' dort' : ''));
      l.appendChild(el('span', null, x[0]));
      if (x[2]) { l.append(el('span', null, 'sleeps'), el('span'), el('span')); }
      else if (m.games === null || m.games === undefined) { l.append(el('span', null, 'counted from now on'), el('span'), el('span')); }
      else { l.append(el('span', null, fmt(m.games)), el('span', null, fmt(m.successes)), el('span', null, taux(m.games, m.successes))); }
      b.appendChild(l);
    });
    var kv = function (k, v) { var d = el('div', 'rk-kv'); d.append(el('span', null, k), el('span', null, v)); b.appendChild(d); };
    kv('BEST WIN STREAK', c.best_streak === null || c.best_streak === undefined ? 'counted from now on' : fmt(c.best_streak));
    kv('PLAYTIME', duree(c.playtime_ms) || 'counted from now on');
    var mp = c.most_played;
    kv('MOST PLAYED', mp && mp.character ? nomDuPerso(mp.character) + ' — ' + fmt(mp.successes) + ' win' + (mp.successes === 1 ? '' : 's')
      + ' of ' + fmt(mp.games) + ' game' + (mp.games === 1 ? '' : 's') : '—');
    return b;
  }
  function estUneCarriere(st) { return !!st && typeof st === 'object' && typeof st.games === 'number' && st.by_mode; }

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) { e.className = cls; }
    if (txt !== undefined && txt !== null) { e.textContent = String(txt); }
    return e;
  }
  function fmt(n) { return typeof n === 'number' ? n.toLocaleString('en-US') : (n === undefined || n === null || n === '' ? '—' : String(n)); }
  function C() { return window.LLCompte || null; }
  function hote() {
    var c = C(); var s = c && c.session && c.session();
    var b = String((s && s.base) || (c ? c.serveur() : ''));
    return b.replace(/^[a-z]+:\/\//i, '').replace(/\/.*$/, '') || 'the server';
  }
  function moi() {
    try { return window.LLProfil ? window.LLProfil.lis() : null; } catch (e) { return null; }
  }
  /* la liste, quelle que soit l'enveloppe que SRV-2 choisira */
  function lignesDe(corps) {
    var l = Array.isArray(corps) ? corps : corps && (corps.joueurs || corps.players || corps.ranking || corps.classement);
    if (!Array.isArray(l)) { return null; }
    return l.map(function (x) {
      return { pseudo: String(x.pseudo || x.name || '?'), points: x.points !== undefined ? x.points : x.pts,
               grade: x.grade || x.rang || x.rank || '' };
    });
  }

  function style() {
    if (document.getElementById('rk-style')) { return; }
    var s = document.createElement('style'); s.id = 'rk-style'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  function peinsLaListe(zone) {
    zone.innerHTML = '';
    var P = moi();
    var nom = P && P.pseudo ? String(P.pseudo) : '';
    if (etat.liste === null) { zone.appendChild(el('div', 'rk-dit', 'Asking ' + hote() + ' for the ranking…')); return; }
    if (etat.liste.erreur) {
      var d = el('div', 'rk-dit'); d.innerHTML = etat.liste.erreur; zone.appendChild(d);
      /* ta ligne, tant que le serveur n'a pas de classement : ce PC sait ton pseudo et ton grade */
      if (nom) {
        var l = ligne({ pseudo: nom, points: null, grade: P.rang || '' }, '—', true);
        l.title = 'you, read on this PC';
        zone.appendChild(l);
      }
      return;
    }
    if (etat.liste.lignes.length === 0) { zone.appendChild(el('div', 'rk-dit', 'Nobody is ranked yet.')); return; }
    etat.liste.lignes.forEach(function (x, i) { zone.appendChild(ligne(x, i + 1, x.pseudo === nom)); });
  }

  function ligne(x, pos, estMoi) {
    var l = el('div', 'rk-l' + (estMoi ? ' moi' : '')); l.tabIndex = 0;
    l.appendChild(el('span', 'rk-pos', pos));
    l.appendChild(el('span', 'rk-ps', x.pseudo));
    l.appendChild(el('span', 'rk-pts', fmt(x.points)));
    l.appendChild(el('span', 'rk-gr', x.grade || '—'));
    l.addEventListener('click', function () { inspecte(x.pseudo); });
    l.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); inspecte(x.pseudo); } });
    return l;
  }

  function peinsLaFiche() {
    var f = document.getElementById('rk-fiche'); if (!f) { return; }
    var garde = etat.onglet === 'CAREER' ? f.querySelector('.rk-find') : null;
    f.innerHTML = '';
    if (garde) { f.appendChild(garde); }
    var c = etat.choisi;
    if (c === null) {
      f.appendChild(el('div', 'rk-dit', 'Click a player, or type a name above, to see their stats.'));
      return;
    }
    f.appendChild(el('h3', null, c.pseudo));
    if (c.attente) { f.appendChild(el('div', 'rk-dit', 'Asking ' + hote() + '…')); return; }
    if (c.erreur) { var d = el('div', 'rk-dit'); d.innerHTML = c.erreur; f.appendChild(d); return; }
    var p = c.profil || {};
    if (p.rang || p.grade) { f.appendChild(el('div', 'rk-kv')).append(el('span', null, 'Grade'), el('span', null, p.rang || p.grade)); }
    /* note 324 ① — sa CARRIERE, quand le serveur porte le bloc ; sinon la phrase d'attente */
    if (estUneCarriere(p.stats)) { f.appendChild(el('div', 'rk-k', 'Career')); f.appendChild(blocCarriere(p.stats)); }
    else { f.appendChild(el('div', 'rk-dit', hote() + ' does not serve the career lines yet.')); }
    var blocs = [['Bounty Wall', p.wall], ['Codex', p.codex]];
    blocs.forEach(function (b) {
      if (!b[1] || typeof b[1] !== 'object') { return; }
      f.appendChild(el('div', 'rk-k', b[0]));
      Object.keys(b[1]).forEach(function (k) {
        var v = b[1][k];
        var kv = el('div', 'rk-kv');
        kv.append(el('span', null, k), el('span', null, typeof v === 'object' && v !== null ? JSON.stringify(v) : fmt(v)));
        f.appendChild(kv);
      });
    });
  }

  function echappe(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function inspecte(pseudo) {
    pseudo = String(pseudo || '').trim();
    if (pseudo === '') { return; }
    var c = C();
    etat.choisi = { pseudo: pseudo, attente: true };
    peinsLaFiche();
    if (!c || !c.appel) { etat.choisi = { pseudo: pseudo, erreur: 'No account module on this page.' }; peinsLaFiche(); return; }
    c.appel('GET', '/players/' + encodeURIComponent(pseudo)).then(function (r) {
      if (!etat.choisi || etat.choisi.pseudo !== pseudo) { return; }
      if (r.ok) { etat.choisi = { pseudo: String((r.corps && r.corps.pseudo) || pseudo), profil: r.corps }; }
      else if (r.statut === 0) { etat.choisi = { pseudo: pseudo, erreur: echappe(c.sansReponse()) }; }
      else if (r.statut === 404) {
        etat.choisi = { pseudo: pseudo, erreur: 'No public profile for <b>' + echappe(pseudo) + '</b> on ' + echappe(hote()) +
          '. Inspecting a player arrives with the next server update — until then, nobody can be looked up.' };
      } else { etat.choisi = { pseudo: pseudo, erreur: echappe(c.phrase((r.corps && r.corps.error) || ('HTTP ' + r.statut))) }; }
      peinsLaFiche();
    });
  }

  function charge(zone) {
    var c = C();
    etat.liste = null; peinsLaListe(zone);
    if (!c || !c.appel) { etat.liste = { erreur: 'No account module on this page.' }; peinsLaListe(zone); return; }
    c.appel('GET', '/ranking').then(function (r) {
      var lignes = r.ok ? lignesDe(r.corps) : null;
      if (lignes) { etat.liste = { lignes: lignes }; }
      else if (r.statut === 0) { etat.liste = { erreur: echappe(c.sansReponse()) }; }
      else {
        etat.liste = { erreur: '<b>' + echappe(hote()) + '</b> has no ranking yet: it opens with the next server update. ' +
          'Your own line, read on this PC:' };
      }
      peinsLaListe(zone);
    });
  }

  function onglets(box) {
    var o = el('div', 'rk-onglets');
    ['RANKED', 'CAREER'].forEach(function (n) {
      var b = el('button', 'rk-onglet' + (etat.onglet === n ? ' on' : ''), n); b.type = 'button';
      b.addEventListener('click', function () { etat.onglet = n; peins(); });
      o.appendChild(b);
    });
    box.appendChild(o);
  }
  function peinsCarriere(box) {
    var gauche = el('div', 'rk-col');
    var P = moi();
    gauche.appendChild(el('div', 'rk-k', 'You' + (P && P.pseudo ? ' — ' + P.pseudo : '') + ' (this PC)'));
    gauche.appendChild(blocCarriere(carriereDuProfil(P)));
    var find = el('form', 'rk-find');
    var inp = el('input'); inp.placeholder = 'Another player — type a name'; inp.maxLength = 24; inp.spellcheck = false;
    inp.setAttribute('aria-label', 'find a player');
    var go = el('button', null, 'Find'); go.type = 'submit';
    find.append(inp, go);
    find.addEventListener('submit', function (e) { e.preventDefault(); inspecte(inp.value); });
    var fiche = el('div', 'rk-fiche'); fiche.id = 'rk-fiche';
    fiche.appendChild(find);
    var zone = el('div'); zone.id = 'rk-fiche-corps';
    box.append(gauche, fiche);
    if (etat.choisi === null) { fiche.appendChild(el('div', 'rk-dit', 'Type a name to see their career.')); }
    else { peinsLaFiche(); }
  }

  function peins() {
    var box = document.getElementById('ranking'); if (!box) { return; }
    style();
    box.innerHTML = '';
    onglets(box);
    if (etat.onglet === 'CAREER') { peinsCarriere(box); return; }
    var gauche = el('div', 'rk-col');
    var find = el('form', 'rk-find');
    var inp = el('input'); inp.placeholder = 'Find a player — type a name'; inp.maxLength = 24; inp.spellcheck = false;
    inp.setAttribute('aria-label', 'find a player');
    var go = el('button', null, 'Find'); go.type = 'submit';
    find.append(inp, go);
    find.addEventListener('submit', function (e) { e.preventDefault(); inspecte(inp.value); });
    gauche.appendChild(find);
    var tete = el('div', 'rk-tete');
    tete.append(el('span', null, '#'), el('span', null, 'Player'), el('span', 'rk-pts', 'Points'), el('span', 'rk-gr', 'Grade'));
    gauche.appendChild(tete);
    var zone = el('div', 'rk-liste'); zone.id = 'rk-liste';
    gauche.appendChild(zone);
    var fiche = el('div', 'rk-fiche'); fiche.id = 'rk-fiche';
    box.append(gauche, fiche);
    etat.choisi = null; peinsLaFiche();
    charge(zone);
  }

  window.LLClassement = { peins: peins, inspecte: inspecte, carriereDuProfil: carriereDuProfil };
})();
