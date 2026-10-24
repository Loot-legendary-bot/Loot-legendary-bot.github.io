/*
 * goblin_den.js — LE GOBLIN DEN (note 283 ②, GO de Croze ; `docs/GOBELIN.md` §2 et §7 ;
 * le portrait déposé, note 284 ①, posé en `/art/gobelin/`).
 *
 * Phrase de Croze (écrite à l'ouverture, R3) : *« Au HOME, après ma première victoire,
 * j'ouvre le GOBLIN DEN sous le Bounty Wall : le gobelin me parle, je mise de 32 à
 * 256 dents à l'un de ses jeux, le résultat tombe à la fin de l'animation et mon
 * solde bouge. »*
 *
 * Les quatre jeux de §2 : TOOTH FLIP (paie ×1,9) · THE CUPS (paie ×2,7) · GOBLIN DICE
 * (1d20 chacun, le plus haut ramasse, égalité = le gobelin garde ; paie ×2) · GOBLIN
 * RAFFLE (ticket 100, tirage HEBDO). Mise 32–256, pas de crédit (la mise ≤ le solde),
 * la porte = la première victoire (comme le mur, BOUNTY_WALL §25).
 *
 * Ce qui n'est PAS ici, et pourquoi :
 *  - la RAFFLE se MONTRE mais ne vend pas de ticket : son tirage est hebdomadaire et
 *    vit au serveur (GOBELIN §4, moteur 208), et le pool de lots n'est écrit nulle
 *    part (`Q-DEN-RAFFLE-LOTS`). Vendre un ticket sans tirage, c'est prendre 100 dents
 *    pour rien.
 *  - les TEXTES du gobelin sont à écrire par le classeur (GOBELIN §7) : les lignes
 *    ci-dessous sont des PLACEHOLDERS courts, une par moment, à remplacer telles quelles.
 *  - en ligne, le tirage doit venir du serveur (graine serveur, moteur 208 / 873 ⑤) :
 *    tant que la route n'existe pas, le Den tire ici et écrit le solde comme toute
 *    écriture du profil (`M-S1438`).
 * La maison gagne sur chaque jeu (espérance < 1) : c'est le drain voulu (§1).
 */
(function () {
  'use strict';
  /* S1439 - note 287 ④ (GOBELIN §8, verdict Croze 13/10) : LE DEN SE GRISE. L'échoppe
   * reste visible au HOME, indisponible, et dit seulement « The goblin will come when
   * the time is right. » — les jeux sortent de la circulation. La v2 (étal ~6 items
   * façon Dark and Darker, mises fixées par le gobelin, cap de paris) attend son mot :
   * le code des jeux reste ici, endormi, et `ENDORMI = false` le rouvre tel quel. */
  var ENDORMI = true;
  var DORT = 'The goblin will come when the time is right.';
  var MISE_MIN = 32, MISE_MAX = 256;
  var MISES = [32, 64, 128, 256];
  var JEUX = [
    ['flip', 'Tooth Flip', 'Tails or fang. Pays ×1.9.'],
    ['cups', 'The Cups', 'Three cups, one tooth. Find it. Pays ×2.7.'],
    ['dice', 'Goblin Dice', 'A d20 each. Highest takes all — a tie, the goblin keeps it. Pays ×2.'],
    ['raffle', 'Goblin Raffle', 'Ticket 100. One weekly draw, one cosmetic.']
  ];
  /* PLACEHOLDERS — le classeur écrit les vraies répliques (GOBELIN §7). */
  var DIT = {
    accueil: 'Teeth, teeth… you smell of teeth. Sit. Play.',
    mise: 'Bold. I like bold.',
    gagne: 'Hrrk. Take it. Come back soon.',
    perd: 'Mine now. Again?',
    egal: 'A tie! The house keeps ties. House rules.',
    pauvre: 'No credit at the Den. Come back richer.',
    raffle: 'The draw is weekly. Not yet, not yet.'
  };
  var voile = null, jeu = 'flip', mise = MISE_MIN, occupe = false;

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) { e.className = cls; }
    if (txt !== undefined) { e.textContent = txt; }
    return e;
  }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function profil() { try { return window.LLProfil.lis(); } catch (e) { return null; } }
  function solde() { var p = profil(); return p ? (p.dents || 0) : 0; }
  /* le tirage du Den : la machine, pas une graine (un jeu de mise n'est pas rejouable) */
  function de(n) {
    try { var a = new Uint32Array(1); window.crypto.getRandomValues(a); return a[0] % n; }
    catch (e) { return Math.floor(Math.random() * n); }
  }
  function ouvert(p) {
    var BW = window.LLBountyWall;
    return !!(BW && p && BW.aGagne(p));
  }
  /* le solde bouge : le profil, puis le HUD du HOME (paintHUD, même portée) */
  function bouge(delta, misee, rendue) {
    window.LLProfil.modifie(function (p) {
      p.dents = Math.max(0, Math.round((p.dents || 0) + delta));
      if (typeof p.den !== 'object' || p.den === null) { p.den = { joues: 0, mise: 0, rendu: 0 }; }
      if (misee) { p.den.joues += 1; p.den.mise += misee; }
      if (rendue) { p.den.rendu += rendue; }
    });
    try { if (typeof PROFILE !== 'undefined') { PROFILE.gold = solde(); } } catch (e) { /* hors du HOME */ }
    try { if (typeof paintHUD === 'function') { paintHUD(true); } } catch (e) { /* idem */ }
    peinsSolde();
  }

  function style() {
    if (document.getElementById('gd-style')) { return; }
    var s = document.createElement('style');
    s.id = 'gd-style';
    s.textContent =
      '#gden-voile{position:absolute;inset:0;z-index:78;display:grid;grid-template-columns:38% 1fr;gap:3cqw;' +
      'padding:4cqh 4cqw;box-sizing:border-box;color:#e9e4d8;' +
      'background:radial-gradient(80% 90% at 25% 40%,rgba(52,34,12,.97) 0%,rgba(8,6,4,.985) 72%)}' +
      '#gden-voile .gd-gauche{display:flex;flex-direction:column;gap:1.6cqh;min-height:0}' +
      '#gden-voile .gd-portrait{position:relative;flex:1;min-height:0;border:.3cqh solid #6b4f24;' +
      'background:#0b0907 center/cover no-repeat;box-shadow:0 0 4cqh rgba(0,0,0,.8) inset}' +
      '#gden-voile .gd-bulle{position:relative;padding:1.6cqh 1.4cqw;background:#efe3c4;color:#24180c;' +
      'font:700 2.3cqh/1.3 Georgia,"Times New Roman",serif;font-style:italic;border-radius:.6cqh}' +
      '#gden-voile .gd-bulle::before{content:"";position:absolute;left:3cqw;top:-1.6cqh;border:1cqh solid transparent;' +
      'border-bottom-color:#efe3c4;border-top:0}' +
      '#gden-voile .gd-droite{display:flex;flex-direction:column;gap:1.8cqh;min-height:0}' +
      '#gden-voile .gd-tete{display:flex;align-items:center;gap:2cqw}' +
      '#gden-voile h2{margin:0;font:900 4.8cqh/1 "Big Shoulders Display","Arial Black",Impact,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#d9b65a}' +
      '#gden-voile .gd-solde{font:700 2.6cqh/1 "Alegreya",Georgia,serif;color:#f2ead6}' +
      '#gden-voile .gd-solde.flash{animation:gd-flash .7s ease-out}' +
      '@keyframes gd-flash{0%{color:#fff;transform:scale(1.18)}100%{color:#f2ead6;transform:scale(1)}}' +
      '#gden-voile .gd-vide{flex:1}' +
      '#gden-voile button{all:unset;cursor:pointer;padding:1.2cqh 1.6cqw;font:900 2cqh/1 "Big Shoulders Display","Arial Black",sans-serif;' +
      'text-transform:uppercase;letter-spacing:.05em;color:#d8cfbb;border:.2cqh solid rgba(233,228,216,.32);text-align:center}' +
      '#gden-voile button:hover{color:#fff;border-color:#d9b65a}' +
      '#gden-voile button.sel{color:#1b1206;background:#d9b65a;border-color:#d9b65a}' +
      '#gden-voile button[disabled]{cursor:not-allowed;opacity:.35}' +
      '#gden-voile .gd-jeux{display:grid;grid-template-columns:repeat(4,1fr);gap:1cqw}' +
      '#gden-voile .gd-jeux button{display:flex;flex-direction:column;gap:.8cqh;padding:1.6cqh 1cqw}' +
      '#gden-voile .gd-jeux small{font:400 1.6cqh/1.25 "Alegreya",Georgia,serif;text-transform:none;letter-spacing:0;color:inherit;opacity:.85}' +
      '#gden-voile .gd-mises{display:flex;align-items:center;gap:1cqw;font:700 2cqh/1 "Alegreya",Georgia,serif;color:#b9ae98}' +
      '#gden-voile .gd-table{flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2.4cqh;' +
      'background:radial-gradient(60% 70% at 50% 50%,rgba(40,70,40,.55),rgba(10,14,9,.9));border:.3cqh solid #4a3a1c}' +
      '#gden-voile .gd-coups{display:flex;gap:2cqw}' +
      '#gden-voile .gd-issue{min-height:3.4cqh;font:900 3cqh/1.1 "Big Shoulders Display","Arial Black",sans-serif;text-transform:uppercase;letter-spacing:.05em;text-align:center}' +
      '#gden-voile .gd-issue.gagne{color:#8fd46b}#gden-voile .gd-issue.perd{color:#e0574c}#gden-voile .gd-issue.egal{color:#d9b65a}' +
      '#gden-voile .gd-dit{margin:0;font:400 1.8cqh/1.35 "Alegreya",Georgia,serif;color:#a89f8d;text-align:center;max-width:46cqw}' +
      '#gden-voile .gd-pied{font:400 1.6cqh/1.3 "Alegreya",Georgia,serif;color:#8a8273}' +
      /* la pièce-dent : tourne, puis se pose sur sa face */
      '#gden-voile .gd-piece{width:16cqh;height:16cqh;border-radius:50%;display:grid;place-items:center;' +
      'background:radial-gradient(circle at 35% 30%,#f7ecc8,#c9a24a 60%,#7a5a1c);color:#3a2708;' +
      'font:900 2.6cqh/1 "Big Shoulders Display","Arial Black",sans-serif;box-shadow:0 1cqh 2cqh rgba(0,0,0,.6)}' +
      '#gden-voile .gd-piece.tourne{animation:gd-tourne .18s linear infinite}' +
      '@keyframes gd-tourne{0%{transform:rotateY(0)}100%{transform:rotateY(360deg)}}' +
      /* les gobelets */
      '#gden-voile .gd-gobelets{display:flex;gap:3cqw;height:18cqh;align-items:flex-end}' +
      '#gden-voile .gd-gob{position:relative;width:12cqh;height:15cqh;cursor:pointer;transition:transform .22s ease-in-out}' +
      '#gden-voile .gd-gob .gd-tasse{position:absolute;inset:0;background:linear-gradient(90deg,#5a3a1a,#9a6a34 45%,#4a2c12);' +
      'clip-path:polygon(18% 0,82% 0,100% 100%,0 100%);border-radius:.4cqh;transition:transform .35s ease-out;z-index:2}' +
      '#gden-voile .gd-gob.leve .gd-tasse{transform:translateY(-9cqh)}' +
      '#gden-voile .gd-gob .gd-dent{position:absolute;left:50%;bottom:.6cqh;transform:translateX(-50%);font-size:4cqh;z-index:1}' +
      '#gden-voile .gd-gob:hover .gd-tasse{filter:brightness(1.25)}' +
      /* les deux d20 */
      '#gden-voile .gd-des{display:flex;gap:5cqw;align-items:center}' +
      '#gden-voile .gd-d20{display:flex;flex-direction:column;align-items:center;gap:1cqh;font:700 1.8cqh/1 "Alegreya",Georgia,serif;color:#b9ae98}' +
      '#gden-voile .gd-d20 b{width:13cqh;height:13cqh;display:grid;place-items:center;font:900 5cqh/1 "Big Shoulders Display","Arial Black",sans-serif;color:#f4ecda;' +
      'background:#2a1d10;clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);}' +
      '#gden-voile .gd-d20 b.roule{animation:gd-secoue .12s linear infinite}' +
      '@keyframes gd-secoue{0%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}100%{transform:rotate(-8deg)}}' +
      /* la porte au HOME, sous le Bounty Wall */
      '#gdenbtn{all:unset;cursor:pointer;display:flex;align-items:center;gap:1cqw;padding:.6cqh .8cqw;' +
      'font:900 2.2cqh/1 "Big Shoulders Display","Arial Black",Impact,sans-serif;letter-spacing:.12em;color:#e9e4d8;' +
      'text-shadow:0 .2cqh .7cqh #000,0 0 .3cqh #000}' +
      '#gdenbtn img{width:6.4cqh;height:6.4cqh;border-radius:50%;object-fit:cover;border:.25cqh solid #c9a24a}' +
      '#gdenbtn .gd-sous{display:block;font:400 1.25cqh/1.2 "Alegreya",Georgia,serif;letter-spacing:.04em;color:#b9b0a0}' +
      '#gdenbtn:hover,#gdenbtn:focus{color:#d9b65a;outline:none}' +
      '#gdenbtn.ferme{cursor:not-allowed}' +
      '#gdenbtn.ferme img,#gdenbtn.ferme .gd-titre{filter:grayscale(1) brightness(.45)}' +
      '#gdenbtn .gd-sous.secoue{animation:gd-secoue .12s linear 4}';
    document.head.appendChild(s);
  }

  function dit(t) { var b = voile && voile.querySelector('.gd-bulle'); if (b) { b.textContent = t; } }
  function issue(t, cls) {
    var i = voile && voile.querySelector('.gd-issue');
    if (i) { i.textContent = t; i.className = 'gd-issue' + (cls ? ' ' + cls : ''); }
  }
  function peinsSolde() {
    var s = voile && voile.querySelector('.gd-solde');
    if (!s) { return; }
    s.textContent = 'Your teeth: ' + fmt(solde());
    s.classList.remove('flash'); void s.offsetWidth; s.classList.add('flash');
    peinsMises();
  }
  function peinsMises() {
    if (!voile) { return; }
    var n = solde();
    if (mise > n) { mise = MISES.filter(function (m) { return m <= n; }).pop() || MISE_MIN; }
    voile.querySelectorAll('.gd-mises button').forEach(function (b) {
      var m = Number(b.dataset.m);
      b.classList.toggle('sel', m === mise);
      b.disabled = occupe || m > n;
    });
  }

  /* une mise se PREND avant le jeu (pas de crédit) ; false si le solde ne la couvre pas */
  function prends() {
    if (occupe) { return false; }
    if (mise < MISE_MIN || mise > MISE_MAX || mise > solde()) { dit(DIT.pauvre); issue('Not enough teeth', 'perd'); return false; }
    occupe = true;
    bouge(-mise, mise, 0);
    dit(DIT.mise);
    issue('');
    return true;
  }
  /* la fin d'un jeu : le résultat s'écrit APRÈS l'animation (note 285 ③) */
  function solde_(gain, texte, cls) {
    if (gain > 0) { bouge(gain, 0, gain); }
    issue(texte, cls);
    dit(cls === 'gagne' ? DIT.gagne : cls === 'egal' ? DIT.egal : DIT.perd);
    occupe = false;
    peinsMises();
    voile.querySelectorAll('.gd-table button').forEach(function (b) { b.disabled = false; });
  }

  function tableFlip(t) {
    var piece = el('div', 'gd-piece', '?');
    t.appendChild(piece);
    var coups = el('div', 'gd-coups');
    ['Tails', 'Fang'].forEach(function (face, k) {
      var b = el('button', '', face); b.type = 'button';
      b.addEventListener('click', function () {
        if (!prends()) { return; }
        coups.querySelectorAll('button').forEach(function (x) { x.disabled = true; });
        var tombe = de(2);
        piece.textContent = ''; piece.classList.add('tourne');
        setTimeout(function () {
          if (!voile) { return; }
          piece.classList.remove('tourne');
          piece.textContent = tombe === 0 ? 'TAILS' : 'FANG';
          var gain = Math.floor(mise * 1.9);
          if (tombe === k) { solde_(gain, (tombe === 0 ? 'Tails' : 'Fang') + ' — you win ' + fmt(gain) + ' teeth', 'gagne'); }
          else { solde_(0, (tombe === 0 ? 'Tails' : 'Fang') + ' — you lose ' + fmt(mise), 'perd'); }
        }, 1500);
      });
      coups.appendChild(b);
    });
    t.appendChild(coups);
    t.appendChild(el('p', 'gd-dit', 'Pick a side, the goblin flips. Win: ×1.9 your stake.'));
  }

  function tableCups(t) {
    var rang = el('div', 'gd-gobelets');
    var gobs = [0, 1, 2].map(function () {
      var g = el('div', 'gd-gob');
      g.appendChild(el('span', 'gd-dent', '🦷'));
      g.appendChild(el('div', 'gd-tasse'));
      rang.appendChild(g);
      return g;
    });
    t.appendChild(rang);
    var go = el('button', '', 'Bet and shuffle'); go.type = 'button';
    var aide = el('p', 'gd-dit', 'Bet, watch the shuffle, then pick a cup. Find the tooth: ×2.7 your stake.');
    var ou = -1, choisir = false;
    gobs.forEach(function (g, k) { g.classList.add('leve'); g.querySelector('.gd-dent').style.visibility = k === 1 ? '' : 'hidden'; });
    go.addEventListener('click', function () {
      if (!prends()) { return; }
      go.disabled = true;
      gobs.forEach(function (g) { g.classList.remove('leve'); });
      ou = de(3);
      var n = 0;
      var tic = setInterval(function () {
        if (!voile) { clearInterval(tic); return; }
        var a = de(3), b = (a + 1 + de(2)) % 3;
        var d = (b - a) * 15;
        gobs[a].style.transform = 'translateX(' + d + 'cqh)';
        gobs[b].style.transform = 'translateX(' + (-d) + 'cqh)';
        setTimeout(function () { gobs[a].style.transform = ''; gobs[b].style.transform = ''; }, 200);
        if (++n >= 8) {
          clearInterval(tic);
          gobs.forEach(function (g, k) { g.querySelector('.gd-dent').style.visibility = k === ou ? '' : 'hidden'; });
          choisir = true;
          aide.textContent = 'Which cup?';
        }
      }, 260);
    });
    gobs.forEach(function (g, k) {
      g.addEventListener('click', function () {
        if (!choisir) { return; }
        choisir = false;
        g.classList.add('leve');
        setTimeout(function () {
          if (!voile) { return; }
          gobs[ou].classList.add('leve');
          var gain = Math.floor(mise * 2.7);
          aide.textContent = 'Bet, watch the shuffle, then pick a cup. Find the tooth: ×2.7 your stake.';
          if (k === ou) { solde_(gain, 'The tooth! You win ' + fmt(gain) + ' teeth', 'gagne'); }
          else { solde_(0, 'Empty — you lose ' + fmt(mise), 'perd'); }
        }, 450);
      });
    });
    t.appendChild(go);
    t.appendChild(aide);
  }

  function tableDice(t) {
    var des = el('div', 'gd-des');
    var toi = el('div', 'gd-d20'); var tb = el('b', '', '?'); toi.appendChild(tb); toi.appendChild(el('span', '', 'You'));
    var lui = el('div', 'gd-d20'); var lb = el('b', '', '?'); lui.appendChild(lb); lui.appendChild(el('span', '', 'The goblin'));
    des.appendChild(toi); des.appendChild(el('span', 'gd-issue', 'vs')); des.appendChild(lui);
    t.appendChild(des);
    var go = el('button', '', 'Roll'); go.type = 'button';
    go.addEventListener('click', function () {
      if (!prends()) { return; }
      go.disabled = true;
      var a = 1 + de(20), b = 1 + de(20);
      tb.classList.add('roule'); lb.classList.add('roule');
      var tic = setInterval(function () { tb.textContent = 1 + de(20); lb.textContent = 1 + de(20); }, 70);
      setTimeout(function () {
        clearInterval(tic);
        if (!voile) { return; }
        tb.classList.remove('roule'); lb.classList.remove('roule');
        tb.textContent = a; lb.textContent = b;
        var gain = mise * 2;
        if (a > b) { solde_(gain, a + ' against ' + b + ' — you win ' + fmt(gain) + ' teeth', 'gagne'); }
        else if (a === b) { solde_(0, a + ' against ' + b + ' — a tie, the goblin keeps it', 'egal'); }
        else { solde_(0, a + ' against ' + b + ' — you lose ' + fmt(mise), 'perd'); }
      }, 1400);
    });
    t.appendChild(go);
    t.appendChild(el('p', 'gd-dit', 'A d20 each. Highest takes ×2 your stake — a tie, the goblin keeps it.'));
  }

  function tableRaffle(t) {
    t.appendChild(el('div', 'gd-piece', '100'));
    var b = el('button', '', 'Buy a ticket — 100'); b.type = 'button'; b.disabled = true;
    t.appendChild(b);
    t.appendChild(el('p', 'gd-dit', 'One draw a week, one cosmetic as the prize — never power. The draw is held online by the server: tickets go on sale with the online Den.'));
    dit(DIT.raffle);
  }

  function peinsTable() {
    var t = voile.querySelector('.gd-table');
    t.innerHTML = '';
    t.appendChild(el('div', 'gd-issue', ''));
    voile.querySelectorAll('.gd-jeux button').forEach(function (b) { b.classList.toggle('sel', b.dataset.k === jeu); });
    voile.querySelector('.gd-mises').style.visibility = jeu === 'raffle' ? 'hidden' : '';
    if (jeu === 'flip') { tableFlip(t); }
    else if (jeu === 'cups') { tableCups(t); }
    else if (jeu === 'dice') { tableDice(t); }
    else { tableRaffle(t); }
  }

  function ferme() { if (voile) { voile.remove(); voile = null; occupe = false; } }
  function ouvre() {
    var p = profil();
    if (ENDORMI || !ouvert(p)) { secoue(); return; }
    style();
    ferme();
    jeu = 'flip'; mise = MISE_MIN;
    var ecran = document.getElementById('screen') || document.body;
    voile = el('div'); voile.id = 'gden-voile'; voile.tabIndex = -1;
    voile.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !occupe) { ferme(); } e.stopPropagation(); });
    var g = el('div', 'gd-gauche');
    var por = el('div', 'gd-portrait'); por.style.backgroundImage = 'url("/art/gobelin/marchand.webp")';
    g.appendChild(por);
    g.appendChild(el('div', 'gd-bulle', DIT.accueil));
    voile.appendChild(g);
    var d = el('div', 'gd-droite');
    var tete = el('div', 'gd-tete');
    tete.appendChild(el('h2', '', 'Goblin Den'));
    tete.appendChild(el('span', 'gd-vide'));
    tete.appendChild(el('span', 'gd-solde', 'Your teeth: ' + fmt(solde())));
    var x = el('button', '', 'Close'); x.type = 'button';
    x.addEventListener('click', function () { if (!occupe) { ferme(); } });
    tete.appendChild(x);
    d.appendChild(tete);
    var jx = el('div', 'gd-jeux');
    JEUX.forEach(function (j) {
      var b = el('button'); b.type = 'button'; b.dataset.k = j[0];
      b.appendChild(document.createTextNode(j[1]));
      b.appendChild(el('small', '', j[2]));
      b.addEventListener('click', function () { if (occupe) { return; } jeu = j[0]; dit(DIT.accueil); peinsTable(); });
      jx.appendChild(b);
    });
    d.appendChild(jx);
    var ms = el('div', 'gd-mises');
    ms.appendChild(el('span', '', 'Stake'));
    MISES.forEach(function (m) {
      var b = el('button', '', String(m)); b.type = 'button'; b.dataset.m = String(m);
      b.addEventListener('click', function () { if (occupe) { return; } mise = m; peinsMises(); });
      ms.appendChild(b);
    });
    ms.appendChild(el('span', '', 'teeth · max 256 · no credit'));
    d.appendChild(ms);
    d.appendChild(el('div', 'gd-table'));
    d.appendChild(el('div', 'gd-pied', 'The house always wins a little: this is where spare teeth go. Teeth never buy power, and are never bought with real money.'));
    voile.appendChild(d);
    ecran.appendChild(voile);
    peinsMises();
    peinsTable();
    voile.focus();
  }

  /* LA PORTE au HOME : sous le Bounty Wall, fermée (grisée) avant la première victoire */
  function secoue() {
    var s = document.querySelector('#gdenbtn .gd-sous');
    if (s) { s.classList.remove('secoue'); void s.offsetWidth; s.classList.add('secoue'); }
  }
  function peinsLaPorte() {
    var b = document.getElementById('gdenbtn');
    if (!b) { return; }
    var ferme_ = ENDORMI || !ouvert(profil());
    b.classList.toggle('ferme', ferme_);
    b.title = ENDORMI ? DORT : (ferme_ ? 'Win your first game to open the Goblin Den.' : 'The goblin merchant: games of teeth');
    var s = b.querySelector('.gd-sous');
    if (s) { s.textContent = ENDORMI ? DORT : (ferme_ ? 'Win your first game to open the Den.' : 'games of teeth'); }
  }
  function posLaPorte() {
    style();
    var bb = document.getElementById('bboard');
    if (!bb || document.getElementById('gdenbtn')) { peinsLaPorte(); return; }
    var b = el('button'); b.id = 'gdenbtn'; b.type = 'button';
    var im = document.createElement('img'); im.src = '/art/gobelin/marchand_160.webp'; im.alt = '';
    b.appendChild(im);
    var tx = el('span');
    tx.appendChild(el('span', 'gd-titre', 'GOBLIN DEN'));
    tx.appendChild(el('span', 'gd-sous', ''));
    b.appendChild(tx);
    b.addEventListener('click', ouvre);
    bb.insertAdjacentElement('afterend', b);
    peinsLaPorte();
  }

  window.LLGoblinDen = { ouvre: ouvre, ferme: ferme, posLaPorte: posLaPorte, peinsLaPorte: peinsLaPorte, MISE_MIN: MISE_MIN, MISE_MAX: MISE_MAX };
})();
