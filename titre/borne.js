/*
 * borne.js — LA BORNE HI-SCORE (S1584 · note 426 = 412 ②, le moteur 308 ② est livré).
 *
 * Phrase de Croze (R3) : « je clique HI-SCORE : je vois la borne et ses scores avant tout ;
 * PLAY m'emmène ensuite au choix du perso. »
 *
 * Le classement vient du SERVEUR (`GET /hiscore?periode=tout|jour|semaine`, palier 1011 /
 * 1049 : rang implicite, pseudo, tablier, personnage, score, sortie, tours, date). L'écran
 * ne calcule rien : il lit, il trie dans l'ordre reçu, il peint. Sans compte ou sans
 * réseau, la borne le dit et PRESS START reste là.
 *
 * window.LLBorne.ouvre(lancer) — `lancer` est le geste d'avant (la partie HI-SCORE).
 */
(function () {
  'use strict';
  var CSS = '' +
    '#borne{position:fixed;inset:0;z-index:9000;background:radial-gradient(ellipse at 50% 30%,#1b0f0c 0%,#060505 70%);' +
    'display:flex;flex-direction:column;align-items:center;color:#e9e4d8;font-family:"Alegreya",Georgia,serif}' +
    '#borne .bn-titre{margin:4vh 0 0;font:900 max(40px,9vh)/1 "Big Shoulders Display","Arial Black",sans-serif;letter-spacing:.08em;' +
    'color:#f0c95a;text-shadow:0 0 18px rgba(240,201,90,.55),0 0 2px #fff}' +
    '#borne .bn-sous{margin:1vh 0 2vh;font:700 max(14px,2vh)/1 "Big Shoulders Display",sans-serif;letter-spacing:.3em;color:#a39a8a}' +
    '#borne .bn-periodes{display:flex;gap:10px;margin-bottom:2vh}' +
    '#borne button{all:unset;cursor:pointer;font:900 max(16px,2.2vh)/1 "Big Shoulders Display",sans-serif;letter-spacing:.08em;' +
    'text-transform:uppercase;padding:1vh 1.4vw;border:2px solid rgba(233,228,216,.25);color:#cfc6b4}' +
    '#borne button.on{border-color:#f0c95a;color:#f0c95a}' +
    '#borne .bn-cadre{position:relative;width:min(1100px,92vw);flex:1;min-height:0;overflow:hidden;border-top:2px solid rgba(240,201,90,.35);' +
    'border-bottom:2px solid rgba(240,201,90,.35);-webkit-mask-image:linear-gradient(transparent,#000 6%,#000 94%,transparent)}' +
    '#borne .bn-liste{position:absolute;left:0;right:0;top:0}' +
    '#borne .bn-liste.defile{animation:bnDefile var(--duree,30s) linear 3s infinite}' +
    '#borne .bn-cadre:hover .bn-liste.defile{animation-play-state:paused}' +
    '@keyframes bnDefile{from{transform:translateY(0)}to{transform:translateY(-50%)}}' +
    '#borne .bn-l{display:grid;grid-template-columns:8% 7% 1fr 22% 16% 14%;align-items:center;gap:1vw;padding:.9vh 1vw;' +
    'font:700 max(16px,2.4vh)/1.1 "Big Shoulders Display",sans-serif;letter-spacing:.05em;border-bottom:1px solid rgba(233,228,216,.07)}' +
    '#borne .bn-l.tete{color:#a39a8a;font-size:max(14px,1.7vh);letter-spacing:.2em}' +
    '#borne .bn-l .rg{color:#f0c95a}' +
    '#borne .bn-l img{width:max(34px,5vh);height:max(34px,5vh);object-fit:cover;border-radius:50%;image-rendering:pixelated;border:1px solid rgba(233,228,216,.3)}' +
    '#borne .bn-l .sc{text-align:right;color:#f4ecda;font-size:max(18px,2.8vh)}' +
    '#borne .bn-l .dt{text-align:right;color:#8d8578;font:400 max(14px,1.7vh)/1 "Alegreya",serif}' +
    '#borne .bn-l.moi{background:rgba(163,35,29,.35);outline:2px solid #a3231d}' +
    '#borne .bn-dit{padding:6vh 2vw;text-align:center;font-size:max(16px,2.2vh);color:#cfc6b4}' +
    '#borne .bn-bas{display:flex;gap:2vw;align-items:center;margin:2.5vh 0 3.5vh}' +
    '#borne .bn-start{font-size:max(22px,3.6vh);padding:1.4vh 3vw;background:#a3231d;border-color:#a3231d;color:#f4ecda;animation:bnClign 1.1s steps(1,end) infinite}' +
    '@keyframes bnClign{50%{opacity:.35}}' +
    '@media (prefers-reduced-motion:reduce){#borne .bn-liste.defile,#borne .bn-start{animation:none}}';

  var PERIODES = [['tout', 'All time'], ['semaine', 'This week'], ['jour', 'Today']];
  var etat = { periode: 'tout', lancer: null };

  function el(t, cls, txt) { var e = document.createElement(t); if (cls) { e.className = cls; } if (txt !== undefined && txt !== null) { e.textContent = String(txt); } return e; }
  function moi() { try { var p = window.LLProfil ? window.LLProfil.lis() : null; return p && p.pseudo ? String(p.pseudo) : ''; } catch (e) { return ''; } }
  function nomDuPerso(id) {
    return String(id || '').replace(/^the_/, 'the ').replace(/_/g, ' ').toUpperCase();
  }
  function date(at) {
    var d = new Date(Number(at));
    if (isNaN(d.getTime())) { return ''; }
    return d.toISOString().slice(0, 10);
  }

  function ligne(x, i, estMoi) {
    var l = el('div', 'bn-l' + (estMoi ? ' moi' : ''));
    l.appendChild(el('span', 'rg', String(i + 1).padStart(2, '0')));
    var img = el('img'); img.alt = ''; img.src = '/art/personnages/' + String(x.personnage || '') + '.webp';
    img.onerror = function () { img.style.visibility = 'hidden'; };
    l.appendChild(img);
    l.appendChild(el('span', 'ps', x.pseudo || '?'));
    l.appendChild(el('span', 'pe', nomDuPerso(x.personnage)));
    l.appendChild(el('span', 'sc', x.score));
    l.appendChild(el('span', 'dt', date(x.at)));
    return l;
  }

  function peinsLaListe(cadre, lignes, dit) {
    cadre.innerHTML = '';
    if (dit) { cadre.appendChild(el('div', 'bn-dit', dit)); return; }
    var nom = moi();
    var liste = el('div', 'bn-liste');
    var tete = el('div', 'bn-l tete');
    ['RANK', '', 'NAME', 'CHARACTER', 'SCORE', 'DATE'].forEach(function (t) { var c = el('span', '', t); if (t === 'SCORE' || t === 'DATE') { c.style.textAlign = 'right'; } tete.appendChild(c); });
    cadre.appendChild(tete);
    tete.style.position = 'relative'; tete.style.zIndex = '1'; tete.style.background = '#0b0807';
    lignes.forEach(function (x, i) { liste.appendChild(ligne(x, i, nom !== '' && String(x.pseudo).toLowerCase() === nom.toLowerCase())); });
    liste.style.top = tete.offsetHeight ? tete.offsetHeight + 'px' : '5vh';
    cadre.appendChild(liste);
    /* le défilement d'une borne : seulement si la liste déborde ; elle est doublée pour boucler sans saut */
    requestAnimationFrame(function () {
      if (liste.scrollHeight > cadre.clientHeight - 40) {
        lignes.forEach(function (x, i) { liste.appendChild(ligne(x, i, nom !== '' && String(x.pseudo).toLowerCase() === nom.toLowerCase())); });
        liste.style.setProperty('--duree', Math.max(20, lignes.length * 2) + 's');
        liste.classList.add('defile');
      }
    });
  }

  function charge(cadre) {
    var c = window.LLCompte;
    peinsLaListe(cadre, null, 'Loading the scores…');
    if (!c || !c.session || !c.session()) {
      peinsLaListe(cadre, null, 'Log in (HOME → your name) to see the scores. You can still play: PRESS START.');
      return;
    }
    c.appel('GET', '/hiscore?periode=' + encodeURIComponent(etat.periode)).then(function (r) {
      if (!r.ok) { peinsLaListe(cadre, null, r.statut === 0 ? 'The server does not answer. You can still play: PRESS START.' : 'The scores could not be loaded (' + r.statut + ').'); return; }
      var l = r.corps && Array.isArray(r.corps.hiscore) ? r.corps.hiscore : [];
      if (l.length === 0) { peinsLaListe(cadre, null, 'No score yet. Be the first: PRESS START.'); return; }
      peinsLaListe(cadre, l, null);
    });
  }

  function ferme() { var b = document.getElementById('borne'); if (b) { b.remove(); } document.removeEventListener('keydown', clavier); }
  function clavier(e) {
    if (e.key === 'Escape') { ferme(); }
    else if (e.key === 'Enter') { var f = etat.lancer; ferme(); if (f) { f(); } }
  }

  function ouvre(lancer) {
    etat.lancer = lancer || null;
    if (!document.getElementById('borne-style')) { var s = el('style'); s.id = 'borne-style'; s.textContent = CSS; document.head.appendChild(s); }
    ferme();
    var b = el('div'); b.id = 'borne';
    b.appendChild(el('h1', 'bn-titre', 'HI-SCORE'));
    b.appendChild(el('div', 'bn-sous', 'ALONE · 20 TURNS · THE BEST RUNS'));
    var per = el('div', 'bn-periodes');
    var cadre = el('div', 'bn-cadre');
    PERIODES.forEach(function (p) {
      var x = el('button', p[0] === etat.periode ? 'on' : '', p[1]); x.type = 'button';
      x.onclick = function () { etat.periode = p[0]; per.querySelectorAll('button').forEach(function (y) { y.classList.remove('on'); }); x.classList.add('on'); charge(cadre); };
      per.appendChild(x);
    });
    b.appendChild(per);
    b.appendChild(cadre);
    var bas = el('div', 'bn-bas');
    var retour = el('button', '', 'Back'); retour.type = 'button'; retour.onclick = ferme;
    var start = el('button', 'bn-start', 'PRESS START'); start.type = 'button';
    start.onclick = function () { var f = etat.lancer; ferme(); if (f) { f(); } };
    bas.appendChild(retour); bas.appendChild(start);
    b.appendChild(bas);
    document.body.appendChild(b);
    document.addEventListener('keydown', clavier);
    charge(cadre);
  }

  window.LLBorne = { ouvre: ouvre, ferme: ferme };
})();
