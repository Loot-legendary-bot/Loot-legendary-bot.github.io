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
    '.rk-kv span:last-child{color:#d9b35a;font-weight:700;text-align:right}';

  var etat = { liste: null, choisi: null, motif: null };

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
    f.innerHTML = '';
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
    var blocs = [['Stats', p.stats], ['Bounty Wall', p.wall], ['Codex', p.codex]];
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

  function peins() {
    var box = document.getElementById('ranking'); if (!box) { return; }
    style();
    box.innerHTML = '';
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

  window.LLClassement = { peins: peins, inspecte: inspecte };
})();
