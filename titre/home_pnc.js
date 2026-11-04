/* S1626 - note 467 / NOTE_ECRAN_HOME_POINT_AND_CLICK.md - LE HOME POINT & CLICK.
 *
 * Phrase de Croze : « Quand j'ouvre le jeu, je suis devant le donjon de nuit : la scene bouge en
 * boucle sans saut, les noms des objets s'affichent deux secondes puis s'effacent ; quand je passe
 * la souris sur la herse, le chariot, le livre, la boite, la stele, l'etal, le mur aux esprits, le
 * gobelin, le chemin ou la lune, l'objet s'eclaire avec son nom ; en cliquant j'arrive en plein
 * ecran dans la bonne partie du menu, et au retour la transition peinture me ramene sur la scene.
 * Seuls les esprits que j'ai deverrouilles sont allumes, et le gobelin n'est la qu'a partir du
 * grade 2. Echap m'ouvre OPTIONS · Menu classique · QUITTER. »
 *
 * La scene se pose PAR-DESSUS le titre (`#v-title`) : l'ancien HOME n'est pas retire, OPTIONS ->
 * CLASSIC MENU le rend tel quel. Les ecrans ouverts sont ceux d'aujourd'hui (`go`), aller ET retour
 * par la peinture. Toutes les positions sont en % du cadre `.screen`, deja en 16:9 (bandes noires
 * par `.frame`, jamais de `cover`). Aucune regle ici : le grade et les esprits se LISENT au profil
 * (`LLProfil`) et aux lecteurs du mur (`LLBountyWall.dort`), la meme source que le widget du mur.
 */
(function () {
  'use strict';
  var ART = '/art/home/';
  /* l'ordre du clavier (note §5) */
  var ORDRE = ['dive', 'codex', 'rules', 'boardgame', 'ranking', 'vault', 'bounty_wall', 'goblin_den', 'patch_notes', 'quit'];
  /* la cle du mur -> l'id de la branche dans bounty_wall.js */
  var ESPRITS = { arcane: 'arcane', poison: 'poison', chaos: 'chaos', spirit_of_the_dungeon: 'neutre', lightning: 'foudre', fire: 'feu', frost: 'givre' };
  var COULEURS = { arcane: '#8a5cf0', poison: '#4cbb3a', chaos: '#d8409e', spirit_of_the_dungeon: '#e9e4d8', lightning: '#f2c230', fire: '#f0612a', frost: '#3cb4ea' };
  var NOMS = { arcane: 'ARCANE', poison: 'POISON', chaos: 'CHAOS', spirit_of_the_dungeon: 'SPIRIT OF THE DUNGEON', lightning: 'LIGHTNING', fire: 'FIRE', frost: 'FROST' };
  var ZONES = null, racine = null, video = null, gob = null, panneau = null;
  var zonesEl = {}, voiles = {}, badges = {};
  var minuterieNoms = 0, minuterieCligne = 0;

  /* ── les options (au profil, comme VFX) ─────────────────────────────────────────── */
  function opts() {
    try { var o = (window.LLProfil.lis().options || {}).home; return (o && typeof o === 'object') ? o : {}; } catch (e) { return {}; }
  }
  function poseOpt(k, v) {
    if (!window.LLProfil) return;
    window.LLProfil.modifie(function (p) {
      if (typeof p.options !== 'object' || p.options === null) p.options = {};
      if (typeof p.options.home !== 'object' || p.options.home === null) p.options.home = {};
      p.options.home[k] = v;
    });
  }
  function classique() { return opts().classique === true; }
  function hauteQualite() { return opts().hq === true; }
  function animationsReduites() {
    if (opts().reduit === true) return true;
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }
  function grade() {
    try { var g = window.LLProfil.lis().grade; return typeof g === 'number' && isFinite(g) ? g : 1; } catch (e) { return 1; }
  }
  function cleDuJoueur() {
    try { var p = window.LLProfil.lis(); return String(p.pseudo || p.id || 'local'); } catch (e) { return 'local'; }
  }
  function memoire(k, v) {
    var cle = 'll.home.' + k + '.' + cleDuJoueur();
    try {
      if (v === undefined) return JSON.parse(window.localStorage.getItem(cle) || 'null');
      window.localStorage.setItem(cle, JSON.stringify(v));
    } catch (e) { /* stockage absent : rien ne s'anime, rien ne casse */ }
    return null;
  }

  /* ── le style ──────────────────────────────────────────────────────────────────── */
  function style() {
    if (document.getElementById('pnc-style')) return;
    var s = document.createElement('style'); s.id = 'pnc-style';
    s.textContent = [
      '#pnc{position:absolute;inset:0;z-index:5;display:none;overflow:hidden;background:#000}',
      '.screen.pnc-on #pnc{display:block}',
      '.screen.pnc-on #v-title{pointer-events:none}',
      '.screen.pnc-on #v-title .logo,.screen.pnc-on #v-title .menu,.screen.pnc-on #v-title #fr{display:none}',
      '.screen.pnc-on #v-title .foot{pointer-events:auto}',
      '.screen.pnc-on .bgw,.screen.pnc-on .scrim,.screen.pnc-on #bboard,.screen.pnc-on #gdenbtn{display:none!important}',
      /* S1646 — l'aide de l'ancien HOME (« esc goes back · backgrounds cycle ») ment sur la scène : Échap y ouvre le panneau */
      'body:has(.screen.pnc-on) .hint{visibility:hidden}',
      '#pnc .pnc-poster,#pnc video{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;display:block}',
      '#pnc video{opacity:0;transition:opacity .3s ease}',
      '#pnc video.pret{opacity:1}',
      '#pnc .pnc-gob{position:absolute;pointer-events:none;filter:brightness(.72);transition:transform .22s ease,filter .22s ease;transform-origin:50% 100%}',
      '#pnc .pnc-gob.monte{animation:pncMonte .6s ease-out both}',
      '@keyframes pncMonte{from{transform:translateY(60%)}to{transform:translateY(0)}}',
      '#pnc .pnc-gob.eveil{filter:brightness(1);transform:translateY(-1.5cqh)}',
      '#pnc .pnc-yeux{position:absolute;left:30%;top:44%;width:20%;height:12%;background:radial-gradient(ellipse at center,rgba(0,0,0,.85),rgba(0,0,0,0) 70%);opacity:0;transition:opacity .06s linear}',
      '#pnc .pnc-gob.cligne .pnc-yeux{opacity:1}',
      '#pnc .pnc-z{position:absolute;margin:0;padding:0;border:0;background:transparent;cursor:inherit;outline:none}',
      '#pnc .pnc-z::before{content:"";position:absolute;inset:-12%;border-radius:50%;opacity:0;pointer-events:none;mix-blend-mode:screen;',
      '  background:radial-gradient(ellipse at center,rgba(255,196,120,.42),rgba(255,150,60,.16) 45%,rgba(255,120,40,0) 72%);transition:opacity .12s ease}',
      '#pnc .pnc-z:hover::before,#pnc .pnc-z:focus-visible::before,#pnc .pnc-z.sous-tab::before{opacity:1}',
      '#pnc .pnc-z.inactif{pointer-events:none}',
      '#pnc .pnc-z.inactif::before{display:none}',
      '#pnc .pnc-nom{position:absolute;left:50%;bottom:100%;transform:translate(-50%,-.6cqh);white-space:nowrap;pointer-events:none;',
      '  font:900 2.6cqh/1 "Big Shoulders Display","Arial Black",Impact,sans-serif;letter-spacing:.12em;color:#f4efe2;',
      '  text-shadow:0 0 .5cqh #000,0 0 1.2cqh #000,0 .2cqh .2cqh #000;opacity:0;transition:opacity .4s ease}',
      '#pnc .pnc-z.nom-bas .pnc-nom{bottom:auto;top:100%;transform:translate(-50%,.6cqh)}',
      '#pnc .pnc-z:hover .pnc-nom,#pnc .pnc-z:focus-visible .pnc-nom,#pnc.noms .pnc-z:not(.inactif) .pnc-nom{opacity:1;transition-duration:.12s}',
      '#pnc .pnc-z .pnc-sous{display:block;font-size:1.5cqh;letter-spacing:.08em;margin-top:.5cqh;color:#d9c9a3}',
      '#pnc .pnc-voile{position:absolute;border-radius:50%;pointer-events:none;background:radial-gradient(ellipse at center,rgba(0,0,0,.75) 62%,rgba(0,0,0,0) 100%);transition:opacity .6s ease}',
      '#pnc .pnc-voile.leve{opacity:0}',
      '#pnc .pnc-esprit{position:absolute;border-radius:50%}',
      '#pnc .pnc-esprit::before{background:radial-gradient(ellipse at center,var(--esprit) 0%,rgba(0,0,0,0) 70%)}',
      '#pnc .pnc-badge{position:absolute;transform:translateY(-50%);pointer-events:none;white-space:nowrap;font:900 1.6cqh/1 "Big Shoulders Display","Arial Black",Impact,sans-serif;',
      '  color:#f4efe2;background:rgba(10,8,6,.78);border:1px solid rgba(201,162,39,.6);padding:.3cqh .5cqh;letter-spacing:.06em}',
      '#pnc-esc{position:absolute;inset:0;z-index:45;display:none;align-items:center;justify-content:center;background:rgba(3,3,5,.55)}',
      '#pnc-esc.on{display:flex}',
      '#pnc-esc .pnc-esc-box{display:flex;flex-direction:column;gap:1.4cqh;padding:3cqh 4cqw;background:rgba(12,10,8,.92);border:1px solid rgba(201,162,39,.45)}',
      '#pnc-esc button{font:900 3cqh/1 "Big Shoulders Display","Arial Black",Impact,sans-serif;letter-spacing:.14em;color:#efe6cf;background:transparent;border:0;padding:.6cqh 1cqw;cursor:inherit;text-align:center}',
      '#pnc-esc button:hover,#pnc-esc button:focus-visible{color:#fff;text-shadow:0 0 1cqh rgba(255,170,90,.8);outline:none}',
      /* S1627 - note 468 (1) : `.hud` est en pointer-events:none, l'engrenage le reprenait sans le dire */
      '.hud .hud-gear{pointer-events:auto;background:transparent;border:0;color:#d9c9a3;cursor:inherit;padding:0 .3cqw;display:inline-flex;align-items:center}',
      '.hud .hud-gear svg{width:2.4cqh;height:2.4cqh}',
      '.hud .hud-gear:hover{color:#fff}'
    ].join('\n');
    document.head.appendChild(s);
  }

  /* ── la scene ──────────────────────────────────────────────────────────────────── */
  function pct(r) { return 'left:' + r.x + '%;top:' + r.y + '%;width:' + r.w + '%;height:' + r.h + '%'; }

  function poseLaVideo() {
    if (video) { video.remove(); video = null; }
    if (animationsReduites()) return;
    var v = document.createElement('video');
    v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true; v.preload = 'auto';
    v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    v.poster = ART + 'HOME_FINAL_LF_poster.jpg';
    v.src = ART + (hauteQualite() ? 'HOME_FINAL_LF_loop_4K.mp4' : 'HOME_FINAL_LF_loop_2K.mp4');
    v.addEventListener('canplay', function () { v.classList.add('pret'); });
    v.addEventListener('error', function () { v.remove(); if (video === v) video = null; });
    racine.insertBefore(v, racine.children[1] || null);
    video = v;
    try { var p = v.play(); if (p && p.catch) p.catch(function () { /* autoplay refuse : le poster reste */ }); } catch (e) { /* */ }
  }

  /* S1628 - mot de Croze (03/11) : « la transition, c'est quand on BACK d'un menu, pas quand on clique DIVE / CODEX : la, direct » - tout aller depuis la scene passe `paint=false` */
  function action(cle) {
    var g = window.go;
    if (typeof g !== 'function') return;
    switch (cle) {
      case 'dive': g('pve', null, null, false); break;
      case 'codex': g('codex', null, null, false); break;
      case 'rules': g('rules', null, null, false); break;
      case 'boardgame': g('board', null, null, false); break;
      case 'ranking': g('ranking', null, null, false); break;
      case 'vault': g('collection', null, null, false); break;
      case 'bounty_wall': if (grade() >= 2) g('league', null, null, false); break;   /* avant le grade 2 : le survol le dit, le clic n'ouvre rien */
      case 'goblin_den': if (window.LLGoblinDen) window.LLGoblinDen.ouvre(); break;
      case 'patch_notes': { var v = document.getElementById('version'); if (v) v.click(); break; }
      case 'quit': { var q = document.getElementById('quit'); if (q) q.classList.add('on'); break; }
    }
  }

  function bâtis() {
    racine = document.createElement('div'); racine.id = 'pnc';
    var poster = new Image(); poster.className = 'pnc-poster'; poster.alt = ''; poster.src = ART + 'HOME_FINAL_LF_poster.jpg';
    racine.appendChild(poster);
    /* S1628 - note 468 (2), mot de Croze (03/11) : « vire le logo LICK FLOOR » - le HOME n'a plus de logo */
    /* le gobelin (§7) */
    var G = ZONES.gobelin;
    gob = document.createElement('div'); gob.className = 'pnc-gob';
    gob.style.cssText = 'left:' + G.x + '%;top:' + G.y + '%;width:' + G.w + '%';
    var gi = new Image(); gi.alt = ''; gi.src = ART + 'goblin_layer.webp'; gi.style.cssText = 'display:block;width:100%;height:auto';
    gob.appendChild(gi);
    var yeux = document.createElement('div'); yeux.className = 'pnc-yeux'; gob.appendChild(yeux);
    racine.appendChild(gob);
    /* les voiles et les zones des esprits (§6) */
    Object.keys(ZONES.medaillons_esprits).forEach(function (k) {
      var m = ZONES.medaillons_esprits[k];
      var box = 'left:' + (m.cx - m.rx) + '%;top:' + (m.cy - m.ry) + '%;width:' + (2 * m.rx) + '%;height:' + (2 * m.ry) + '%';
      var vo = document.createElement('div'); vo.className = 'pnc-voile'; vo.style.cssText = box;
      racine.appendChild(vo); voiles[k] = vo;
    });
    /* les zones (§4), dans l'ordre du clavier ; `reserve` n'a ni survol ni clic */
    ORDRE.forEach(function (cle) {
      var z = ZONES.zones[cle]; if (!z) return;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'pnc-z';
      b.dataset.zone = cle; b.style.cssText = pct(z.rect);
      if (z.rect.y < 12) b.classList.add('nom-bas');
      var nom = document.createElement('span'); nom.className = 'pnc-nom'; nom.textContent = z.label;
      b.appendChild(nom); b.setAttribute('aria-label', z.label);
      b.addEventListener('click', function () { if (!b.classList.contains('inactif')) action(cle); });
      if (cle === 'goblin_den') {
        b.addEventListener('mouseenter', function () { gob.classList.add('eveil'); });
        b.addEventListener('mouseleave', function () { gob.classList.remove('eveil'); });
        b.addEventListener('focus', function () { gob.classList.add('eveil'); });
        b.addEventListener('blur', function () { gob.classList.remove('eveil'); });
      }
      racine.appendChild(b); zonesEl[cle] = b;
    });
    /* les esprits cliquables, par-dessus la pierre du mur */
    Object.keys(ZONES.medaillons_esprits).forEach(function (k) {
      var m = ZONES.medaillons_esprits[k];
      var b = document.createElement('button'); b.type = 'button'; b.className = 'pnc-z pnc-esprit';
      b.dataset.esprit = k; b.style.cssText = 'left:' + (m.cx - m.rx) + '%;top:' + (m.cy - m.ry) + '%;width:' + (2 * m.rx) + '%;height:' + (2 * m.ry) + '%';
      b.style.setProperty('--esprit', COULEURS[k]);
      var nom = document.createElement('span'); nom.className = 'pnc-nom'; nom.textContent = NOMS[k];
      b.appendChild(nom); b.setAttribute('aria-label', NOMS[k]); b.tabIndex = -1;
      b.addEventListener('click', function () { if (!b.classList.contains('inactif')) ouvreLEsprit(k); });
      racine.appendChild(b); zonesEl['esprit:' + k] = b;
    });
    var scr = document.getElementById('screen');
    scr.insertBefore(racine, document.getElementById('sweep'));
    /* Echap (§8) : OPTIONS · Menu classique · QUITTER */
    panneau = document.createElement('div'); panneau.id = 'pnc-esc';
    var bx = document.createElement('div'); bx.className = 'pnc-esc-box';
    [['OPTIONS', function () { fermeLePanneau(); window.go('stub', 'Options', null, false); }],
     ['CLASSIC MENU', function () { fermeLePanneau(); poseOpt('classique', true); surLaVue('title'); }],
     ['QUIT', function () { fermeLePanneau(); action('quit'); }]].forEach(function (x) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = x[0];
      b.addEventListener('click', x[1]); bx.appendChild(b);
    });
    panneau.appendChild(bx);
    panneau.addEventListener('click', function (e) { if (e.target === panneau) fermeLePanneau(); });
    scr.appendChild(panneau);
    poseLEngrenage();
    poseLaVideo();
  }

  /* l'engrenage = OPTIONS, a cote de la deconnexion (§8) */
  function poseLEngrenage() {
    var lo = document.getElementById('hud-logout');
    if (!lo || document.getElementById('hud-gear')) return;
    var b = document.createElement('button'); b.type = 'button'; b.id = 'hud-gear'; b.className = 'hud-gear';
    b.title = 'OPTIONS'; b.setAttribute('aria-label', 'OPTIONS');
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>' +
      '<circle cx="12" cy="12" r="6.6"/></svg>';
    b.addEventListener('click', function () { if (typeof window.go === 'function') window.go('stub', 'Options', null, false); });
    lo.insertAdjacentElement('afterend', b);
  }

  function ouvreLEsprit(k) {
    /* le BOUNTY WALL, ouvert sur la branche de cet esprit : la page lit `LLHomePnc.espritDemande` */
    api.espritDemande = ESPRITS[k];
    window.go('league', null, null, false);
  }

  function ouvreLePanneau() { if (panneau) { panneau.classList.add('on'); var b = panneau.querySelector('button'); if (b) b.focus(); } }
  function fermeLePanneau() { if (panneau) panneau.classList.remove('on'); }

  /* ── l'etat, relu a chaque arrivee (§6 synchro, §7 grade 2) ──────────────────── */
  function relis(anime) {
    if (!racine) return;
    var g2 = grade() >= 2;
    var profil = null; try { profil = window.LLProfil.lis(); } catch (e) { profil = null; }
    var BW = window.LLBountyWall;
    /* le gobelin */
    gob.style.display = g2 ? '' : 'none';
    zonesEl.goblin_den.classList.toggle('inactif', !g2);
    zonesEl.goblin_den.tabIndex = g2 ? 0 : -1;
    if (g2 && anime && !memoire('gobelin')) { gob.classList.remove('monte'); void gob.offsetWidth; gob.classList.add('monte'); memoire('gobelin', true); }
    /* le mur : avant le grade 2, ferme, et son survol le dit */
    var mur = zonesEl.bounty_wall;
    var sous = mur.querySelector('.pnc-sous');
    if (!g2) {
      if (!sous) { sous = document.createElement('span'); sous.className = 'pnc-sous'; mur.querySelector('.pnc-nom').appendChild(sous); }
      sous.textContent = 'Unlocked at grade 2';
    } else if (sous) sous.remove();
    mur.dataset.ferme = g2 ? '' : '1';
    /* les esprits, chacun le sien */
    var avant = memoire('esprits') || [];
    var ouverts = [];
    Object.keys(ESPRITS).forEach(function (k) {
      var dort = true;
      try { dort = !g2 || !BW || !profil || BW.dort(profil, ESPRITS[k]); } catch (e) { dort = true; }
      if (!dort) ouverts.push(k);
      var b = zonesEl['esprit:' + k];
      b.classList.toggle('inactif', dort);
      b.tabIndex = -1;
      voiles[k].style.transitionDelay = '0ms';
      voiles[k].classList.toggle('leve', !dort);
      /* le badge du pacte, colle au medaillon, cote exterieur (§6) */
      if (badges[k]) { badges[k].remove(); delete badges[k]; }
      var mx = 0; try { mx = BW && profil ? BW.multiplicateur(profil, ESPRITS[k]) : 0; } catch (e) { mx = 0; }
      if (!dort && mx > 1) {
        var m = ZONES.medaillons_esprits[k], bd = document.createElement('span'); bd.className = 'pnc-badge';
        bd.textContent = BW.affiche(mx) + ' · pact';
        var droite = m.cx >= 88.5;
        bd.style.top = m.cy + '%';
        if (droite) bd.style.left = (m.cx + m.rx + 0.3) + '%'; else bd.style.right = (100 - (m.cx - m.rx) + 0.3) + '%';
        racine.appendChild(bd); badges[k] = bd;
      }
    });
    /* un esprit deverrouille depuis la derniere visite s'allume sous les yeux, l'un apres l'autre */
    if (anime && !animationsReduites()) {
      var neufs = ouverts.filter(function (k) { return avant.indexOf(k) < 0; });
      neufs.forEach(function (k, i) {
        var vo = voiles[k];
        vo.style.transition = 'none'; vo.classList.remove('leve'); void vo.offsetWidth; vo.style.transition = '';
        vo.style.transitionDelay = (400 + 250 * i) + 'ms';
        vo.classList.add('leve');
      });
    }
    memoire('esprits', ouverts);
  }

  /* ── l'arrivee : les noms 2 s, puis le fondu (§5) ─────────────────────────────── */
  function montreLesNoms() {
    clearTimeout(minuterieNoms);
    racine.classList.add('noms');
    minuterieNoms = setTimeout(function () { racine.classList.remove('noms'); }, 2000);
  }

  function cligne() {
    clearTimeout(minuterieCligne);
    minuterieCligne = setTimeout(function () {
      if (gob && racine && actif()) { gob.classList.add('cligne'); setTimeout(function () { gob.classList.remove('cligne'); }, 120); }
      cligne();
    }, 6000 + Math.floor(Math.random() * 4000));
  }

  function actif() {
    var s = document.getElementById('screen');
    return !!(s && s.classList.contains('pnc-on'));
  }

  /* appele par `set(v)` de l'ecran titre, a chaque changement de vue */
  function surLaVue(v) {
    if (!ZONES) return;
    if (!racine) bâtis();
    var on = v === 'title' && !classique();
    var s = document.getElementById('screen');
    var etait = s.classList.contains('pnc-on');
    s.classList.toggle('pnc-on', on);
    if (!on) { fermeLePanneau(); if (video) video.pause(); return; }
    if (video) { try { var p = video.play(); if (p && p.catch) p.catch(function () {}); } catch (e) { /* */ } }
    relis(true);
    montreLesNoms();
    if (!etait) cligne();
  }

  /* Alt maintenu = tous les noms ; Echap sur la scene = le petit panneau */
  document.addEventListener('keydown', function (e) {
    if (!racine || !actif()) return;
    if (e.key === 'Alt') { e.preventDefault(); clearTimeout(minuterieNoms); racine.classList.add('noms'); return; }
    if (e.key === 'Escape') {
      var ouvert = ['quit', 'drawer', 'burn', 'notes-patch', 'gradepop'].some(function (id) {
        var el = document.getElementById(id); return el && (id === 'notes-patch' || id === 'gradepop' || el.classList.contains('on'));
      });
      if (document.querySelector('.gd-voile, .pack-voile')) ouvert = true;
      if (ouvert) return;
      if (panneau.classList.contains('on')) fermeLePanneau(); else ouvreLePanneau();
    }
  }, true);   /* capture : lu AVANT le gestionnaire du titre, qui ferme la confirmation QUIT */
  document.addEventListener('keyup', function (e) {
    if (e.key === 'Alt' && racine) racine.classList.remove('noms');
  });
  window.addEventListener('blur', function () { if (racine) racine.classList.remove('noms'); });
  /* le profil change (un esprit, un grade) : on relit sans rejouer l'arrivee */
  window.addEventListener('storage', function () { if (actif()) relis(true); });

  /* les trois lignes d'OPTIONS (§9), posees par `peinsLaLangue` */
  function lignesOptions(box) {
    var t = document.createElement('div'); t.className = 'langue-titre'; t.textContent = 'HOME'; t.style.marginTop = '2.4cqh'; box.appendChild(t);
    [['classique', 'CLASSIC MENU'], ['hq', 'HIGH QUALITY BACKGROUND (4K)'], ['reduit', 'REDUCED ANIMATIONS (still image)']].forEach(function (x) {
      var on = opts()[x[0]] === true;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'langue-btn' + (on ? ' on' : '');
      b.textContent = (on ? '■  ' : '□  ') + x[1];
      b.addEventListener('click', function () {
        poseOpt(x[0], !on);
        if (racine && (x[0] === 'hq' || x[0] === 'reduit')) poseLaVideo();
        if (typeof window.peinsLaLangue === 'function') window.peinsLaLangue();
      });
      box.appendChild(b);
    });
  }

  var api = { surLaVue: surLaVue, lignesOptions: lignesOptions, relis: relis, espritDemande: null, actif: actif };
  window.LLHomePnc = api;
  style();
  fetch(ART + 'home_zones.json', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (z) {
    if (!z || !z.zones) return;
    ZONES = z;
    surLaVue(typeof window.__llVue === 'function' ? window.__llVue() : 'title');
  }).catch(function () { /* sans zones, l'ancien HOME reste */ });
}());
