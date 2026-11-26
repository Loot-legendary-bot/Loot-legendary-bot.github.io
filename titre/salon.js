/*
 * salon.js — NET-1 ② LE SALON (notes 249 ②, 251 ① ; ONLINE §7.1, §7.4).
 *
 * Phrase de Croze (ONLINE §7.4) : *« J'invite un ami avec un code, on joue une
 * partie sur deux PC, et si ma connexion saute je reviens où j'en étais. »*
 *
 * Ce fichier porte la première moitié : créer un salon (un code de six
 * lettres) ou en rejoindre un, voir les pseudos assis, se dire prêt, et
 * l'hôte qui lance. Le relais est `packages/server/src/salons.ts` (palier 850) :
 *   POST /rooms {seats}           → {code}
 *   ws /room/CODE, 1er message    { t:'hello', token }
 *   puis                          { t:'ready', ready } · { t:'start', setup }
 *   il répond                     welcome · room · start · error
 *
 * Au `start`, la mise en place (graine tirée par le serveur, sièges, mode, mon
 * siège, les pseudos) est gardée dans `sessionStorage['ll.salon.partie']` et
 * la partie s'ouvre sur `/?salon=CODE` : `main.ts` la lit avant `newGame`.
 * Un siège vide est joué par un bot.
 *
 * Le serveur est celui du compte (`LLCompte.serveur()`, `?serveur=` pour
 * basculer local / Fly). Sans compte, le salon ouvre l'écran de connexion.
 */
(function () {
  'use strict';
  var CLE_PARTIE = 'll.salon.partie';

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) { e.className = cls; }
    if (txt !== undefined) { e.textContent = txt; }
    return e;
  }
  function bouton(row, txt, cls, f) {
    var b = el('button', cls || '', txt);
    b.type = 'button';
    b.addEventListener('click', f);
    row.appendChild(b);
    return b;
  }
  function style() {
    if (document.getElementById('sal-style')) { return; }
    var s = document.createElement('style');
    s.id = 'sal-style';
    s.textContent =
      '#salon{position:absolute;inset:0;z-index:79;display:grid;place-items:center;' +
      'background:radial-gradient(90% 80% at 50% 40%,rgba(23,18,15,.97) 0%,rgba(7,6,5,.98) 80%)}' +
      '#salon .cb{width:52cqw;max-height:92cqh;overflow:hidden;padding:4cqh 3.2cqw;background:#0e0c0a;' +
      'border:.25cqh solid rgba(233,228,216,.22);text-align:left}' +
      '#salon h2{margin:0 0 .8cqh;font:900 4.2cqh/1 "Big Shoulders Display","Arial Black",Impact,sans-serif;letter-spacing:.06em;' +
      'text-transform:uppercase;color:#e9e4d8}' +
      '#salon h3{margin:2.4cqh 0 .6cqh;font:700 1.6cqh/1 "Alegreya",Georgia,serif;letter-spacing:.12em;' +
      'text-transform:uppercase;color:#cfc6b4}' +
      '#salon p{margin:0 0 1.2cqh;font:400 1.9cqh/1.35 "Alegreya",Georgia,serif;color:#9d9586}' +
      '#salon input[type=text]{box-sizing:border-box;width:14cqw;padding:1cqh 1cqw;text-transform:uppercase;' +
      'font:900 2.6cqh/1 "Alegreya",Georgia,serif;letter-spacing:.2em;color:#efece3;background:#060506;' +
      'border:.2cqh solid #3a3631;outline:0}' +
      '#salon input:focus{border-color:#a3231d}' +
      '#salon .err{min-height:2.4cqh;margin:1.4cqh 0 0;color:#e0564c}' +
      '#salon .row{display:flex;gap:1.2cqw;align-items:center;margin-top:1.6cqh;flex-wrap:wrap}' +
      '#salon button{all:unset;cursor:pointer;padding:1.2cqh 1.8cqw;font:900 1.9cqh/1 "Big Shoulders Display","Arial Black",sans-serif;' +
      'text-transform:uppercase;letter-spacing:.05em;color:#cfc6b4;border:.2cqh solid rgba(233,228,216,.3)}' +
      '#salon button.oui{background:#a3231d;color:#f4ecda;border-color:#a3231d}' +
      '#salon button.sel{color:#f4ecda;border-color:#e9e4d8}' +
      '#salon button[disabled]{opacity:.35;cursor:not-allowed}' +
      '#salon button:hover:not([disabled]){color:#fff}' +
      '#salon .code{margin:1.6cqh 0;padding:1.8cqh 0;text-align:center;font:900 6cqh/1 "Alegreya",Georgia,serif;' +
      'letter-spacing:.3em;color:#efece3;background:#060506;border:.25cqh dashed #a3231d;user-select:all}' +
      '#salon ol{margin:1cqh 0 0;padding:0;list-style:none}' +
      '#salon li{display:flex;gap:1.2cqw;align-items:baseline;padding:1cqh 1cqw;margin-bottom:.6cqh;' +
      'font:400 2cqh/1 "Alegreya",Georgia,serif;color:#cfc6b4;background:#060506;border-left:.4cqh solid #3a3631}' +
      '#salon li.moi{border-left-color:#a3231d}' +
      '#salon li b{min-width:7cqw;color:#efece3}' +
      '#salon li .nom{flex:1;color:#efece3;display:flex;align-items:center;gap:.8cqw}' +
      '#salon li img.tablier{height:3.6cqh;width:auto;flex:0 0 auto;filter:drop-shadow(0 0 .3cqh rgba(0,0,0,.9))}' +
      '#salon li .vide{flex:1;color:#6f685d}' +
      '#salon li .pret{color:#7fbf6a}' +
      '#salon li .attend{color:#d8a24a}' +
      '#salon li .horsligne{color:#6f685d}';
    document.head.appendChild(s);
  }

  var voile = null, ws = null, etat = null, moi = null, codeOuvert = null, fermeVoulue = false;
  function ferme() {
    fermeVoulue = true;
    if (ws) { try { ws.close(); } catch (e) { /* déjà fermée */ } ws = null; }
    if (voile) { voile.remove(); voile = null; }
    etat = null; moi = null; codeOuvert = null;
  }
  function cadre() {
    style();
    var ecran = document.getElementById('screen') || document.body;
    if (!voile) {
      voile = el('div');
      voile.id = 'salon';
      voile.addEventListener('keydown', function (e) { e.stopPropagation(); });
      ecran.appendChild(voile);
    }
    voile.innerHTML = '<div class="cb"></div>';
    return voile.firstChild;
  }

  var PHRASES = {
    SEATS_RANGE: 'A room has 2 to 6 seats.',
    ROOM_NOT_FOUND: 'No room with this code.',
    UNAUTHORIZED: 'Your session ended. Log in again.',
    NOT_READY: 'Everyone seated must be ready.',
    HOST_ONLY: 'Only the host starts the game.',
    ALREADY_STARTED: 'This game has already started.',
    NOT_IN_LOBBY: 'You are not seated in this room.',
    RESEAU: 'The server does not answer. Try again later.'
  };
  /* S1837 - note 595 (4) : LA MEME VERSION POUR TOUTE LA TABLE. Le online est un lockstep (chaque client fait tourner
     SON moteur) : le `hello` porte la version du moteur (`window.LLDefi.version`, gravee au build, null hors build) et
     le relais refuse une autre version que celle du salon (`BUILD_MISMATCH`, note moteur 464 (2)). */
  function maVersion() {
    var d = window.LLDefi, v = d && d.version;
    return typeof v === 'string' && v !== '' ? v : null;
  }
  /* RELOAD rafraichit d'abord le cache des fichiers non haches (la page, titre/defi.js, les scripts de titre/ :
     Pages les sert dix minutes en cache), puis recharge. */
  function rechargeLaVersion() {
    var urls = [location.pathname, '/titre/defi.js'];
    Array.prototype.forEach.call(document.querySelectorAll('script[src^="/titre/"]'), function (x) { urls.push(x.getAttribute('src')); });
    Promise.all(urls.map(function (u) { return fetch(u, { cache: 'reload' }).catch(function () { return null; }); }))
      .then(function () { location.reload(); });
  }
  function peintVersionNeuve(salonVersion) {
    if (ws) { fermeVoulue = true; try { ws.close(); } catch (e) { /* deja fermee */ } ws = null; }
    var b = cadre();
    b.appendChild(el('h2', '', 'NEW VERSION ' + '—' + ' RELOAD'));
    b.appendChild(el('p', '', 'This room plays version ' + String(salonVersion || '?') + '; this tab runs ' + String(maVersion() || 'another one') + '. Everyone at the table must play the same version: reload, then join with the code again.'));
    var r = el('div', 'row'); b.appendChild(r);
    var go = bouton(r, 'Reload', 'oui', function () { go.disabled = true; rechargeLaVersion(); });
    bouton(r, 'Back', '', ferme);
  }
  function phrase(code) {
    /* S1427 - note 254 (1) : le message nomme le serveur qui n'a pas répondu */
    if (code === 'RESEAU' && window.LLCompte && window.LLCompte.sansReponse) { return window.LLCompte.sansReponse(base()); }
    return PHRASES[code] || ('The server refused (' + code + ').');
  }

  function session() { return window.LLCompte ? window.LLCompte.session() : null; }
  function base() {
    var s = session();
    return (s && s.base) || (window.LLCompte ? window.LLCompte.serveur() : '');
  }

  /* ① l'entrée : CREATE A ROOM · JOIN WITH A CODE */
  function ouvre() {
    var s = session();
    if (!s) {
      if (window.LLCompte) { window.LLCompte.accueil('Log in to play online with friends.'); }
      return;
    }
    fermeVoulue = false;
    var sieges = 4, mode = 'FFA';
    /* note 275 (3), note moteur 204 (1) - L'IDLE-TIMER, option de salon, ON par defaut : 60 s par
       action, 3 depassements de suite -> le joueur passe DECO (il passe ses actions jusqu'a son
       retour). La regle vit au serveur ; l'ecran la choisit, l'envoie et la dit. */
    var idle = true;
    var b = cadre();
    b.appendChild(el('h2', '', 'Play with friends'));
    b.appendChild(el('p', '', 'Logged in as ' + s.pseudo + '.'));
    b.appendChild(el('h3', '', 'Create a room'));
    var rs = el('div', 'row'); b.appendChild(rs);
    var rm = el('div', 'row'); b.appendChild(rm);
    var ri = el('div', 'row'); b.appendChild(ri);
    var peint = function () {
      rs.innerHTML = ''; rm.innerHTML = ''; ri.innerHTML = '';
      rs.appendChild(el('p', '', 'Seats'));
      /* S1837 - 601 (3) : SIX sieges (le relais en accepte 2 a 6, `app.ts:893`). Un nombre qui ne
         porte pas les equipes du mode choisi le ramene au chacun-pour-soi. */
      [2, 3, 4, 5, 6].forEach(function (n) {
        bouton(rs, String(n), n === sieges ? 'sel' : '', function () {
          sieges = n;
          if ((mode === '2V2' && n !== 4) || (mode === '2V2V2' && n !== 6)) { mode = 'FFA'; }
          peint();
        });
      });
      rm.appendChild(el('p', '', 'Mode'));
      bouton(rm, 'Free-for-all', mode === 'FFA' ? 'sel' : '', function () { mode = 'FFA'; peint(); });
      var d = bouton(rm, '2 vs 2', mode === '2V2' ? 'sel' : '', function () { mode = '2V2'; sieges = 4; peint(); });
      d.title = 'Four seats: seats 1 + 2 against seats 3 + 4.';
      /* S1837 - 601 (3) : trois equipes de deux (moteur 921 : six sieges, trois camps). */
      var t3 = bouton(rm, '2 vs 2 vs 2', mode === '2V2V2' ? 'sel' : '', function () { mode = '2V2V2'; sieges = 6; peint(); });
      t3.title = 'Six seats: seats 1 + 2, seats 3 + 4, seats 5 + 6.';
      ri.appendChild(el('p', '', 'Idle timer'));
      bouton(ri, 'On', idle ? 'sel' : '', function () { idle = true; peint(); });
      bouton(ri, 'Off', idle ? '' : 'sel', function () { idle = false; peint(); });
      ri.appendChild(el('p', '', idle ? '60 s per action ' + '—' + ' 3 timeouts in a row and the player is disconnected (passes until back).' : 'No limit: nobody is ever pushed out.'));
    };
    peint();
    var rc = el('div', 'row'); b.appendChild(rc);
    var cree = bouton(rc, 'Create', 'oui', function () {
      cree.disabled = true; err.textContent = '...';
      fetch(base() + '/rooms', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: 'Bearer ' + s.token },
        body: JSON.stringify({ seats: sieges, idleTimer: idle })
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; });
      }, function () { return { ok: false, j: { error: 'RESEAU' } }; }).then(function (r) {
        cree.disabled = false;
        if (!r.ok) { err.textContent = phrase(r.j && r.j.error); return; }
        idleVoulu = idle;
        entre(r.j.code, mode);
      });
    });
    b.appendChild(el('h3', '', 'Join with a code'));
    var rj = el('div', 'row'); b.appendChild(rj);
    var champ = el('input'); champ.type = 'text'; champ.maxLength = 6; champ.spellcheck = false;
    champ.autocomplete = 'off'; champ.placeholder = 'ABCDEF';
    rj.appendChild(champ);
    var rejoint = function () {
      var c = champ.value.trim().toUpperCase();
      if (!/^[A-Z]{6}$/.test(c)) { err.textContent = 'A code is six letters.'; return; }
      entre(c, null);
    };
    bouton(rj, 'Join', 'oui', rejoint);
    champ.addEventListener('keydown', function (e) { if (e.key === 'Enter') { rejoint(); } });
    var err = el('p', 'err', ''); b.appendChild(err);
    var rf = el('div', 'row'); b.appendChild(rf);
    bouton(rf, 'Back', '', ferme);
    /* S1427 - note 257 (4) : le mode d'emploi, une page de RULES */
    if (window.LLRegles) { bouton(rf, 'How to play online', '', function () { ferme(); window.LLRegles.ouvre('online'); }); }
  }

  /* ② le salon : le code, les sièges, PRÊT, et LANCER pour l'hôte */
  /* note 275 (3) : l'idle-timer choisi a la creation (l'hote seul le connait avant le depart) */
  var idleVoulu = true;
  /* S1676 - note 495 (1) : la table du DUNGEON PRO TOUR (`protour.js`, MATCH_FOUND). Le serveur a créé
     le salon : pas de code à donner, PRÊT part tout seul, et l'hôte que le serveur a désigné lance dès
     que tous les sièges sont assis et prêts. `null` = un salon d'amis, inchangé. */
  var auto = null, autoLance = false;
  function entre(code, mode, opts) {
    var s = session();
    if (!s) { ouvre(); return; }
    if (ws) { try { ws.close(); } catch (e) { /* idem */ } }
    auto = opts && opts.protour === true ? opts : null; autoLance = false;
    codeOuvert = code; etat = null; moi = null; fermeVoulue = false;
    peintLeSalon(code, mode, 'Connecting...');
    var url = base().replace(/^http/, 'ws') + '/room/' + code;
    var w;
    try { w = new WebSocket(url); } catch (e) { peintLeSalon(code, mode, phrase('RESEAU')); return; }
    ws = w;
    w.onopen = function () { var h = { t: 'hello', token: s.token }; if (maVersion() !== null) { h.build = maVersion(); } w.send(JSON.stringify(h)); };
    w.onmessage = function (ev) {
      var m; try { m = JSON.parse(ev.data); } catch (e) { return; }
      if (m.t === 'welcome') { moi = m; peintLeSalon(code, mode, ''); return; }
      if (m.t === 'room') { etat = m; peintLeSalon(code, mode, ''); if (auto) { avanceSeul(w); } return; }
      if (m.t === 'start') { lance(code, m.setup); return; }
      if (m.t === 'error' && m.code === 'BUILD_MISMATCH') { peintVersionNeuve(m.build); return; }
      if (m.t === 'error') { peintLeSalon(code, mode, phrase(m.code)); }
    };
    w.onclose = function () {
      if (ws !== w || fermeVoulue) { return; }
      ws = null;
      peintLeSalon(code, mode, 'Connection lost. Join again with the code.');
    };
    w.onerror = function () { /* la fermeture suit et le dit */ };
  }

  /* S1676 - 495 (1) : en Pro Tour, PRÊT tout seul ; l'hôte lance quand la table entière est assise et prête. */
  function avanceSeul(w) {
    if (!etat || !moi || etat.started || ws !== w) { return; }
    var jeSuis = moi.seat !== null ? etat.seats[moi.seat] : null;
    if (jeSuis && !jeSuis.ready) { w.send(JSON.stringify({ t: 'ready', ready: true })); return; }
    if (moi.host !== true || autoLance) { return; }
    var pleins = etat.seats.every(function (x) { return x.pseudo !== null && x.ready && x.connected !== false; });
    if (!pleins) { return; }
    autoLance = true;
    w.send(JSON.stringify({ t: 'start', setup: { mode: 'FFA', idleTimer: true, protour: true, timer: auto.timer } }));
  }

  function peintLeSalon(code, mode, message) {
    if (codeOuvert !== code) { return; }
    var b = cadre();
    if (auto) {
      b.appendChild(el('h2', '', 'Dungeon Pro Tour'));
      b.appendChild(el('p', '', 'Table found — waiting for everyone to sit down. The game starts on its own.'));
    } else {
      b.appendChild(el('h2', '', 'Room'));
      b.appendChild(el('div', 'code', code));
    }
    var rc = el('div', 'row'); if (!auto) { b.appendChild(rc); }
    var copie = bouton(rc, 'Copy the code', '', function () {
      try { navigator.clipboard.writeText(code).then(function () { copie.textContent = 'Copied'; }, function () { copie.textContent = 'Select it'; }); }
      catch (e) { copie.textContent = 'Select it'; }
    });
    rc.appendChild(el('p', '', 'Give it to your friends: Play with friends → Join.'));
    var hote = moi && moi.host === true;
    if (hote && mode) { b.appendChild(el('p', '', idleVoulu ? 'Idle timer: on — 60 s per action, 3 timeouts in a row = disconnected.' : 'Idle timer: off.')); }
    if (hote && mode) { b.appendChild(el('p', '', mode === '2V2' ? 'Mode: 2 vs 2 — seats 1 + 2 against seats 3 + 4.' : mode === '2V2V2' ? 'Mode: 2 vs 2 vs 2 — seats 1 + 2, seats 3 + 4, seats 5 + 6.' : 'Mode: free-for-all.')); }
    var ol = el('ol'); b.appendChild(ol);
    var tousPrets = false, assis = 0;
    if (etat) {
      tousPrets = true;
      etat.seats.forEach(function (x) {
        var li = el('li', moi && moi.seat === x.seat ? 'moi' : '');
        li.appendChild(el('b', '', 'Seat ' + (x.seat + 1)));
        if (x.pseudo === null) {
          li.appendChild(el('span', 'vide', 'empty — a bot plays it'));
        } else {
          assis += 1;
          if (!x.ready) { tousPrets = false; }
          var nom = el('span', 'nom', x.pseudo + (etat.host && x.pseudo.toLowerCase() === etat.host.toLowerCase() ? ' (host)' : ''));
          /* S1579 - mot de Croze (29/10) : « le tablier a cote du pseudo de chaque personne ». Le grade 1-33 est
             celui du siege si la salle le publie (`seats[].grade`, demande M-S1579 au serveur) ; mon siege le lit
             a mon profil, comme le HOME. Sans grade connu, pas de tablier (jamais un grade 1 suppose a un autre). */
          var g = typeof x.grade === 'number' ? x.grade : null;
          /* S1637 - mot de Croze (03/11) : « dans un lobby, je vois mon tablier mais pas ceux des autres ». Le serveur
             publie `grade: null` pour un profil qui n'a encore fini aucune partie (`gradeDuProfil`) : c'est le grade 1,
             celui que ce joueur voit sur son propre HOME (`ecran_titre.html`, « un profil qui n'a encore fini aucune
             partie est au grade 1 »). Un serveur qui ne publie PAS le champ ne fait toujours rien supposer. */
          if (g === null && Object.prototype.hasOwnProperty.call(x, 'grade') && x.grade === null) { g = 1; }
          if (g === null && moi && moi.seat === x.seat) {
            try { var pr = window.LLProfil && window.LLProfil.lis(); g = pr && typeof pr.grade === 'number' ? pr.grade : 1; } catch (e) { g = null; }
          }
          if (g !== null && g >= 1 && g <= 33) {
            var tab = document.createElement('img'); tab.className = 'tablier'; tab.alt = 'GRADE ' + Math.round(g);
            tab.title = 'GRADE ' + Math.round(g);
            tab.src = '/art/grades/tablier_' + String(Math.round(g)).padStart(2, '0') + '.webp';
            tab.onerror = function () { this.remove(); };
            nom.insertBefore(tab, nom.firstChild);
          }
          li.appendChild(nom);
          li.appendChild(el('span', x.connected ? (x.ready ? 'pret' : 'attend') : 'horsligne',
            x.connected ? (x.ready ? 'ready' : 'not ready') : 'away'));
        }
        ol.appendChild(li);
      });
      if (moi && moi.seat === null) { b.appendChild(el('p', '', 'The room is full: you watch.')); }
    }
    var err = el('p', 'err', message || ''); b.appendChild(err);
    var row = el('div', 'row'); b.appendChild(row);
    if (!auto && moi && moi.seat !== null && etat && !etat.started) {
      var jeSuis = etat.seats[moi.seat];
      var pret = jeSuis && jeSuis.ready;
      bouton(row, pret ? 'Not ready' : 'Ready', pret ? '' : 'oui', function () {
        if (ws) { ws.send(JSON.stringify({ t: 'ready', ready: !pret })); }
      });
    }
    if (!auto && hote && etat && !etat.started) {
      var go = bouton(row, 'Start', 'oui', function () {
        if (!ws) { return; }
        go.disabled = true;
        ws.send(JSON.stringify({ t: 'start', setup: { mode: mode === '2V2' || mode === '2V2V2' ? mode : 'FFA', idleTimer: idleVoulu } }));
      });
      go.disabled = !tousPrets || assis < 2;
      if (assis < 2) { go.title = 'Wait for a friend to join.'; }
      else if (!tousPrets) { go.title = 'Everyone seated must be ready.'; }
    }
    bouton(row, 'Leave', '', ferme);
  }

  /* ③ le départ : la mise en place gardée, la partie ouverte sur `?salon=CODE` */
  function lance(code, setup) {
    var partie = {
      code: code,
      base: base(),
      seed: setup.seed,
      seats: Array.isArray(setup.players) ? setup.players.length : 4,
      mode: setup.mode === '2V2' || setup.mode === '2V2V2' ? setup.mode : 'FFA',
      /* note 275 (3) : l'option choisie par l'hote, relayee a tous par le setup */
      idleTimer: setup.idleTimer !== false,
      /* S1676 - 495 (1) : la partie sait qu'elle est une table du Pro Tour (bandeau, chrono : passes suivantes) */
      protour: setup.protour === true,
      timer: typeof setup.timer === 'number' ? setup.timer : null,
      players: setup.players,
      /* note 306 F / 297 ② : les cosmetiques EQUIPES de chaque siege (le relais les publie dans
         `seats[].equipped`, moteur 895) - la partie rend ceux du PROPRIETAIRE, jamais les miens. */
      equipped: etat && Array.isArray(etat.seats) ? etat.seats.map(function (x) { return x && x.equipped ? x.equipped : null; }) : [],
      /* S1811 - 612 (2) (c) : les GP et la serie de chaque siege (`seats[].gp`, `seats[].serie`, note 469 (1)) -
         la partie donne au moteur la MEME table de grades chez tous les ecrans du salon. */
      points: etat && Array.isArray(etat.seats) ? etat.seats.map(function (x) { return x ? { gp: x.gp, serie: x.serie } : null; }) : [],
      seat: moi ? moi.seat : null,
      hote: !!(moi && moi.host),
      /* le jeton de CET onglet : deux comptes peuvent jouer depuis un même navigateur */
      token: session() ? session().token : null
    };
    try { window.sessionStorage.setItem(CLE_PARTIE, JSON.stringify(partie)); } catch (e) { /* stockage refusé */ }
    fermeVoulue = true;
    if (ws) { try { ws.close(); } catch (e) { /* idem */ } ws = null; }
    var q = new URLSearchParams(window.location.search);
    ['joueurs', 'seed', 'daily', 'equipe', 'camps', 'siege'].forEach(function (k) { q.delete(k); });
    q.set('salon', code);
    window.location.href = '/?' + q.toString();
  }

  window.LLSalon = { ouvre: ouvre, entre: entre, CLE_PARTIE: CLE_PARTIE };
})();
