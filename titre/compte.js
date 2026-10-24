/*
 * compte.js — LE COMPTE EN LIGNE, côté écran (S1424 · NET-1, notes 249 ① et 250).
 *
 * Phrase de Croze (note 250, ONLINE §8.2) : *« Je crée un compte avec un pseudo
 * et un mot de passe, sans e-mail ; on me montre ma clé de secours UNE fois et
 * je coche « I understand » ; si j'oublie mon mot de passe je vois mon indice,
 * ou je le remets avec ma clé. »* — et la note 249 ① : *« au premier login, Keep
 * my local progress? ; ensuite le profil se lit au login et s'écrit à chaque
 * changement »*.
 *
 * Le CONTRAT n'est pas inventé : il est lu dans `packages/server/src/app.ts`
 * (palier 850 du moteur, `origin/master`) — `POST /auth/register` → `{pseudo,
 * token, recoveryKey}` · `POST /auth/login` → `{pseudo, token, hasProfile}` ·
 * `GET /auth/hint/:pseudo` · `POST /auth/reset` · connecté : `POST
 * /auth/password` · `/auth/hint` · `/auth/recovery-key` · `GET`/`PUT /profile`
 * (`import: true` → 409 `PROFILE_EXISTS` si le compte a déjà un profil). Le
 * serveur rend des CODES ; c'est ici qu'ils deviennent une phrase anglaise.
 *
 * Le serveur : `https://lootlegendary-api.fly.dev` (ONLINE §8.1, app
 * `lootlegendary-api`) ; `?serveur=<url>` le remplace pour l'onglet (banc local).
 * La session (`ll.compte.v1`) garde le pseudo, le jeton ET l'adresse : la page
 * de jeu (`index.html`) pousse le profil au même serveur (`profil.js` → `pose`).
 *
 * « Play offline » : le profil local continue de marcher sans compte, et le
 * choix se garde (`ll.compte.horsligne`) — le HOME ne redemande pas à chaque
 * lancement ; PROFILE → Account rouvre la porte.
 *
 * Le profil hors ligne n'est JAMAIS perdu : avant qu'un profil de compte le
 * remplace, il est mis de côté (`ll.profil.horsligne`), et « Log out » le rend.
 */
(function () {
  'use strict';
  var CLE_SESSION = 'll.compte.v1';
  var CLE_HORSLIGNE = 'll.compte.horsligne';
  var CLE_COPIE = 'll.profil.horsligne';
  var SERVEUR_DEFAUT = 'https://lootlegendary-api.fly.dev';

  function lsGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* stockage refusé */ } }
  function lsDel(k) { try { window.localStorage.removeItem(k); } catch (e) { /* idem */ } }

  function serveur() {
    var q = null;
    try {
      q = new URLSearchParams(window.location.search).get('serveur');
      if (q) { window.sessionStorage.setItem('ll.serveur', q); }
      else { q = window.sessionStorage.getItem('ll.serveur'); }
    } catch (e) { q = null; }
    /* S1425 - note 251 (1) : la bascule local / Fly du panneau DEV (OPTIONS, Ctrl+Shift+D) */
    return String(window.LL_SERVEUR || q || lsGet('ll.serveur') || SERVEUR_DEFAUT).replace(/\/+$/, '');
  }

  function session() {
    try {
      var s = JSON.parse(lsGet(CLE_SESSION) || 'null');
      return s && typeof s.token === 'string' && typeof s.pseudo === 'string' ? s : null;
    } catch (e) { return null; }
  }
  /* `pret: false` tant que le profil du compte n'est pas choisi : `profil.js`
     ne pousse RIEN avant — sinon le profil local d'un second PC écraserait
     celui du compte entre le login et la question. */
  function poseSession(pseudo, token, pret) {
    var base = session() && session().pseudo === pseudo ? session().base : serveur();
    lsSet(CLE_SESSION, JSON.stringify({ pseudo: pseudo, token: token, base: base, pret: pret === true }));
    lsDel(CLE_HORSLIGNE);
  }

  /* Les codes du serveur, en anglais sec : une phrase par ligne (loi anti-flood). */
  var PHRASES = {
    PSEUDO_LENGTH: 'Name: 3 to 16 characters.',
    PSEUDO_CHARS: 'Name: no spaces.',
    PASSWORD_LENGTH: 'Password: 8 characters at least.',
    HINT_LENGTH: 'Hint: 60 characters at most.',
    HINT_CONTAINS_PASSWORD: 'Your hint must not contain your password.',
    PSEUDO_TAKEN: 'This name is taken.',
    BAD_CREDENTIALS: 'Wrong name or password.',
    TOO_MANY_ATTEMPTS: 'Too many tries. Wait 15 minutes.',
    NO_ACCOUNT: 'No account with this name.',
    UNAUTHORIZED: 'Your session ended. Log in again.',
    RESEAU: 'The server does not answer. Play offline, or try again later.'
  };
  /* S1427 - note 254 (1) : « The server does not answer » ne disait pas LEQUEL.
     Le message nomme l'adresse jointe : Fly, ou ce PC (la bascule du panneau DEV). */
  function sansReponse(base) {
    var b = String(base || (session() && session().base) || serveur());
    var hote = b.replace(/^[a-z]+:\/\//i, '').replace(/\/.*$/, '');
    if (/^(localhost|127\.0\.0\.1|\[::1\])(:|$)/i.test(hote)) {
      return 'No answer from this PC (' + hote + ') \u2014 switch SERVER to Fly in DEV (OPTIONS, Ctrl+Shift+D).';
    }
    return 'No answer from ' + hote + ' \u2014 check your connection, or play offline.';
  }
  function phrase(code, base) {
    if (code === 'RESEAU') { return sansReponse(base); }
    return PHRASES[code] || ('The server refused (' + code + ').');
  }

  /* Un appel : rend `{ok, statut, corps}` ; le réseau mort rend le code RESEAU. */
  function appel(methode, chemin, corps, base) {
    var s = session();
    var h = { 'content-type': 'application/json' };
    if (s) { h.authorization = 'Bearer ' + s.token; }
    return fetch((base || (s && s.base) || serveur()) + chemin, {
      method: methode, headers: h, body: corps === undefined ? undefined : JSON.stringify(corps)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        return { ok: r.ok, statut: r.status, corps: j || {} };
      });
    }, function () { return { ok: false, statut: 0, corps: { error: 'RESEAU', base: base || (s && s.base) || serveur() } }; });
  }

  /* ── le profil ─────────────────────────────────────────────────────────── */
  function profilLocal() { return window.LLProfil ? window.LLProfil.lis() : null; }
  function metDeCote() {
    /* une seule copie : celle d'AVANT le premier compte, jamais écrasée par un profil de compte */
    if (lsGet(CLE_COPIE) === null) {
      var brut = lsGet(window.LLProfil ? window.LLProfil.CLE : 'll.profil.v1');
      if (brut !== null) { lsSet(CLE_COPIE, brut); }
    }
  }
  function adopte(p, pseudo) {
    if (!window.LLProfil) { return; }
    metDeCote();
    var s = session();
    if (s) { poseSession(s.pseudo, s.token, true); }
    if (p && typeof p === 'object') { p.pseudo = pseudo; window.LLProfil.pose(p); }
  }

  /* ── l'interface ───────────────────────────────────────────────────────── */
  var voile = null;
  function style() {
    if (document.getElementById('cpt-style')) { return; }
    var s = document.createElement('style');
    s.id = 'cpt-style';
    s.textContent =
      '#compte{position:absolute;inset:0;z-index:80;display:grid;place-items:center;' +
      'background:radial-gradient(90% 80% at 50% 40%,rgba(23,18,15,.97) 0%,rgba(7,6,5,.98) 80%)}' +
      '#compte .cb{width:46cqw;max-height:92cqh;overflow:hidden;padding:4cqh 3.2cqw;background:#0e0c0a;' +
      'border:.25cqh solid rgba(233,228,216,.22);text-align:left}' +
      '#compte h2{margin:0 0 .8cqh;font:900 4.2cqh/1 "Arial Black",Impact,sans-serif;letter-spacing:.06em;' +
      'text-transform:uppercase;color:#e9e4d8}' +
      '#compte p{margin:0 0 1.4cqh;font:400 1.9cqh/1.35 "Courier Prime",ui-monospace,monospace;color:#9d9586}' +
      '#compte label{display:block;margin:1.2cqh 0 .5cqh;font:700 1.6cqh/1 ui-monospace,monospace;' +
      'letter-spacing:.12em;text-transform:uppercase;color:#cfc6b4}' +
      '#compte label i{font-style:normal;font-weight:400;letter-spacing:0;text-transform:none;color:#8d8578}' +
      '#compte input[type=text],#compte input[type=password]{box-sizing:border-box;width:100%;padding:1cqh 1cqw;' +
      'font:400 2.2cqh/1 ui-monospace,monospace;color:#efece3;background:#060506;border:.2cqh solid #3a3631;outline:0}' +
      '#compte input:focus{border-color:#a3231d}' +
      '#compte .err{min-height:2.4cqh;margin:1.4cqh 0 0;color:#e0564c}' +
      '#compte .row{display:flex;gap:1.2cqw;align-items:center;margin-top:2.4cqh;flex-wrap:wrap}' +
      '#compte button{all:unset;cursor:pointer;padding:1.2cqh 1.8cqw;font:900 1.9cqh/1 "Arial Black",sans-serif;' +
      'text-transform:uppercase;letter-spacing:.05em;color:#cfc6b4;border:.2cqh solid rgba(233,228,216,.3)}' +
      '#compte button.oui{background:#a3231d;color:#f4ecda;border-color:#a3231d}' +
      '#compte button[disabled]{opacity:.35;cursor:not-allowed}' +
      '#compte button.lien{padding:.4cqh 0;border:0;font:400 1.8cqh/1 "Courier Prime",monospace;' +
      'text-transform:none;letter-spacing:0;text-decoration:underline;color:#9d9586}' +
      '#compte button:hover:not([disabled]){color:#fff}' +
      '#compte .cle{margin:2cqh 0;padding:2cqh 0;text-align:center;font:900 5.4cqh/1 ui-monospace,monospace;' +
      'letter-spacing:.12em;color:#efece3;background:#060506;border:.25cqh dashed #a3231d;user-select:all}' +
      '#compte .coche{display:flex;gap:1cqw;align-items:center;margin-top:1.6cqh;font:700 2cqh/1 ui-monospace,monospace;' +
      'color:#efece3;cursor:pointer;text-transform:none;letter-spacing:0}' +
      '#compte .coche input{width:2.4cqh;height:2.4cqh;accent-color:#a3231d}' +
      '#compte .indice{padding:1.4cqh 1cqw;color:#efece3;background:#060506;border-left:.4cqh solid #a3231d}';
    document.head.appendChild(s);
  }

  function ferme() { if (voile) { voile.remove(); voile = null; } }
  function cadre() {
    style();
    var ecran = document.getElementById('screen') || document.body;
    if (!voile) {
      voile = document.createElement('div');
      voile.id = 'compte';
      voile.addEventListener('keydown', function (e) { e.stopPropagation(); });
      ecran.appendChild(voile);
    }
    voile.innerHTML = '<div class="cb"></div>';
    return voile.firstChild;
  }
  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) { e.className = cls; }
    if (txt !== undefined) { e.textContent = txt; }
    return e;
  }
  function champ(box, libelle, type, aide) {
    var l = el('label', '', libelle);
    if (aide) { l.appendChild(document.createTextNode(' ')); l.appendChild(el('i', '', aide)); }
    var i = el('input');
    i.type = type; i.spellcheck = false; i.autocomplete = 'off';
    box.appendChild(l); box.appendChild(i);
    return i;
  }
  function bouton(row, txt, cls, f) {
    var b = el('button', cls || '', txt);
    b.type = 'button';
    b.addEventListener('click', f);
    row.appendChild(b);
    return b;
  }
  /* un geste qui attend le serveur : boutons gelés, l'erreur dite en anglais */
  function attends(box, promesse, suite, rattrape) {
    var err = box.querySelector('.err');
    var bs = box.querySelectorAll('button');
    for (var i = 0; i < bs.length; i++) { bs[i].disabled = true; }
    err.textContent = '...';
    promesse.then(function (r) {
      for (var j = 0; j < bs.length; j++) { bs[j].disabled = false; }
      if (r.ok) { err.textContent = ''; suite(r.corps); return; }
      if (rattrape && rattrape(r)) { err.textContent = ''; return; }
      err.textContent = phrase(r.corps && r.corps.error, r.corps && r.corps.base);
      if (r.corps && r.corps.error === 'BAD_CREDENTIALS') {
        var oubli = box.querySelector('[data-oubli]');
        if (oubli) { oubli.style.display = ''; }
      }
    });
  }

  /* ① l'accueil : LOG IN · CREATE ACCOUNT · PLAY OFFLINE */
  function accueil(message) {
    var b = cadre();
    b.appendChild(el('h2', '', 'Account'));
    b.appendChild(el('p', '', 'Log in to keep your progress on any PC.'));
    b.appendChild(el('p', '', 'No account? You can still play offline.'));
    var pseudo = champ(b, 'Name', 'text');
    var passe = champ(b, 'Password', 'password');
    b.appendChild(el('p', 'err', message || ''));
    var row = el('div', 'row'); b.appendChild(row);
    var go = function () {
      attends(b, appel('POST', '/auth/login', { pseudo: pseudo.value.trim(), password: passe.value }), function (c) {
        poseSession(c.pseudo, c.token);
        apresConnexion(c.pseudo, c.hasProfile === true);
      });
    };
    bouton(row, 'Log in', 'oui', go);
    bouton(row, 'Create account', '', function () { creation(); });
    bouton(row, 'Play offline', '', function () { lsSet(CLE_HORSLIGNE, '1'); ferme(); });
    var oubli = el('div', 'row'); oubli.setAttribute('data-oubli', ''); oubli.style.display = 'none';
    oubli.appendChild(el('p', '', 'Forgot it?'));
    bouton(oubli, 'Show my hint', 'lien', function () { voirIndice(pseudo.value.trim()); });
    bouton(oubli, 'Reset with my recovery key', 'lien', function () { reset(pseudo.value.trim()); });
    b.appendChild(oubli);
    passe.addEventListener('keydown', function (e) { if (e.key === 'Enter') { go(); } });
    pseudo.focus();
  }

  /* ② la création : pseudo · mot de passe ×2 · indice optionnel */
  function creation() {
    var b = cadre();
    b.appendChild(el('h2', '', 'Create account'));
    b.appendChild(el('p', '', 'No e-mail. Just a name and a password.'));
    var pseudo = champ(b, 'Name', 'text', '3 to 16 characters, no spaces');
    var p1 = champ(b, 'Password', 'password', '8 characters at least');
    var p2 = champ(b, 'Password again', 'password');
    var hint = champ(b, 'Hint (optional)', 'text', 'shown to you if you forget your password; never put the password itself');
    hint.maxLength = 60;
    b.appendChild(el('p', 'err', ''));
    var row = el('div', 'row'); b.appendChild(row);
    bouton(row, 'Create', 'oui', function () {
      var err = b.querySelector('.err');
      if (p1.value !== p2.value) { err.textContent = 'The two passwords differ.'; return; }
      if (hint.value !== '' && p1.value !== '' && hint.value.toLowerCase().indexOf(p1.value.toLowerCase()) >= 0) {
        err.textContent = phrase('HINT_CONTAINS_PASSWORD'); return;
      }
      attends(b, appel('POST', '/auth/register', { pseudo: pseudo.value.trim(), password: p1.value, hint: hint.value }), function (c) {
        poseSession(c.pseudo, c.token);
        montreLaCle(c.recoveryKey, function () { apresConnexion(c.pseudo, false); });
      });
    });
    bouton(row, 'Back', '', function () { accueil(); });
    pseudo.focus();
  }

  /* ③ la clé de secours, montrée UNE fois — CONTINUE gelé tant que « I understand » n'est pas coché */
  function montreLaCle(cle, suite) {
    var b = cadre();
    b.appendChild(el('h2', '', 'Recovery key'));
    b.appendChild(el('div', 'cle', cle));
    b.appendChild(el('p', '', 'This key is the ONLY way to reset your password.'));
    b.appendChild(el('p', '', 'We do not ask for an e-mail.'));
    b.appendChild(el('p', '', 'Lose both, lose the account.'));
    var lab = el('label', 'coche');
    var coche = el('input'); coche.type = 'checkbox';
    lab.appendChild(coche); lab.appendChild(document.createTextNode('I understand'));
    b.appendChild(lab);
    b.appendChild(el('p', 'err', ''));
    var row = el('div', 'row'); b.appendChild(row);
    var copie = bouton(row, 'Copy', '', function () {
      try { navigator.clipboard.writeText(cle).then(function () { copie.textContent = 'Copied'; }, function () { copie.textContent = 'Select it'; }); }
      catch (e) { copie.textContent = 'Select it'; }
    });
    var cont = bouton(row, 'Continue', 'oui', function () { if (coche.checked) { suite(); } });
    cont.disabled = true;
    coche.addEventListener('change', function () { cont.disabled = !coche.checked; });
  }

  /* ④ l'indice */
  function voirIndice(pseudo) {
    var b = cadre();
    b.appendChild(el('h2', '', 'Your hint'));
    b.appendChild(el('p', 'err', ''));
    var row = el('div', 'row'); b.appendChild(row);
    bouton(row, 'Back', '', function () { accueil(); });
    bouton(row, 'Reset with my recovery key', '', function () { reset(pseudo); });
    attends(b, appel('GET', '/auth/hint/' + encodeURIComponent(pseudo)), function (c) {
      var d = el('p', 'indice', c.hint ? c.hint : 'You left no hint.');
      b.insertBefore(d, b.querySelector('.err'));
    });
  }

  /* ⑤ le reset par la clé : la clé est consommée, la nouvelle montrée une fois */
  function reset(pseudoConnu) {
    var b = cadre();
    b.appendChild(el('h2', '', 'Reset password'));
    var pseudo = champ(b, 'Name', 'text'); pseudo.value = pseudoConnu || '';
    var cle = champ(b, 'Recovery key', 'text', 'like K7PF-2QMD-9RXA');
    var p1 = champ(b, 'New password', 'password', '8 characters at least');
    var p2 = champ(b, 'New password again', 'password');
    b.appendChild(el('p', 'err', ''));
    var row = el('div', 'row'); b.appendChild(row);
    bouton(row, 'Reset', 'oui', function () {
      if (p1.value !== p2.value) { b.querySelector('.err').textContent = 'The two passwords differ.'; return; }
      attends(b, appel('POST', '/auth/reset', { pseudo: pseudo.value.trim(), recoveryKey: cle.value, newPassword: p1.value }), function (c) {
        poseSession(c.pseudo, c.token);
        montreLaCle(c.recoveryKey, function () { apresConnexion(c.pseudo, true); });
      });
    });
    bouton(row, 'Back', '', function () { accueil(); });
  }

  /* ⑥ après la connexion : le profil du compte, ou l'import du profil local */
  function apresConnexion(pseudo, aUnProfil) {
    if (aUnProfil) {
      var b0 = cadre();
      b0.appendChild(el('h2', '', 'Welcome back'));
      b0.appendChild(el('p', 'err', ''));
      attends(b0, appel('GET', '/profile'), function (c) {
        if (c.profile) { adopte(c.profile, pseudo); window.location.reload(); }
        else { apresConnexion(pseudo, false); }
      });
      return;
    }
    var b = cadre();
    b.appendChild(el('h2', '', 'Keep my local progress?'));
    var P = profilLocal() || {};
    b.appendChild(el('p', '', 'This PC has ' + Number(P.dents || 0).toLocaleString('en-US') + ' teeth and your Bounty Wall.'));
    b.appendChild(el('p', '', 'Keep it: it becomes your account.'));
    b.appendChild(el('p', '', 'Start fresh: the account starts empty; this PC keeps its copy for offline play.'));
    b.appendChild(el('p', 'err', ''));
    var row = el('div', 'row'); b.appendChild(row);
    var envoie = function (p) {
      p.pseudo = pseudo;
      attends(b, appel('PUT', '/profile', { profile: p, import: true }), function () {
        adopte(p, pseudo); window.location.reload();
      }, function (r) {
        /* 409 PROFILE_EXISTS : le compte a déjà un profil — c'est lui qui fait foi */
        if (r.statut !== 409 || !r.corps.profile) { return false; }
        adopte(r.corps.profile, pseudo); window.location.reload();
        return true;
      });
    };
    bouton(row, 'Keep it', 'oui', function () { envoie(profilLocal()); });
    bouton(row, 'Start fresh', '', function () { metDeCote(); envoie(window.LLProfil.neuf()); });
  }

  /* ── PROFILE → Account (note 250 ③) ────────────────────────────────────── */
  /* posé DANS le bloc Player (la grille du PROFILE a déjà six blocs en 1080) */
  function blocDuProfil(c) {
    var s = session();
    var ligne = function (k, v) {
      var d = el('div', 'pf-ligne'); d.appendChild(el('span', 'pf-k', k)); d.appendChild(el('span', 'pf-v', v)); c.appendChild(d);
    };
    var gestes = el('div', 'pf-compte');
    var lien = function (txt, f) {
      var b = el('button', 'pf-btn', txt); b.type = 'button'; b.addEventListener('click', f); gestes.appendChild(b); return b;
    };
    if (s) {
      ligne('Account', s.pseudo + ' (online)');
      lien('Change password', function () { changePasse(); });
      lien('Change hint', function () { changeIndice(); });
      lien('New recovery key', function () { nouvelleCle(); });
      lien('Log out', function () { deconnexion(); });
    } else {
      ligne('Account', 'offline: your progress lives on this PC only');
      lien('Log in or create account', function () { accueil(); });
    }
    c.appendChild(gestes);
    return c;
  }

  function changePasse() {
    var b = cadre();
    b.appendChild(el('h2', '', 'Change password'));
    var a = champ(b, 'Current password', 'password');
    var p1 = champ(b, 'New password', 'password', '8 characters at least');
    var p2 = champ(b, 'New password again', 'password');
    b.appendChild(el('p', 'err', ''));
    var row = el('div', 'row'); b.appendChild(row);
    bouton(row, 'Change', 'oui', function () {
      if (p1.value !== p2.value) { b.querySelector('.err').textContent = 'The two passwords differ.'; return; }
      attends(b, appel('POST', '/auth/password', { password: a.value, newPassword: p1.value }), function () {
        fini('Password changed.');
      });
    });
    bouton(row, 'Cancel', '', ferme);
  }
  function changeIndice() {
    var b = cadre();
    b.appendChild(el('h2', '', 'Change hint'));
    var a = champ(b, 'Current password', 'password');
    var h = champ(b, 'New hint (empty = no hint)', 'text', 'never put the password itself');
    h.maxLength = 60;
    b.appendChild(el('p', 'err', ''));
    var row = el('div', 'row'); b.appendChild(row);
    bouton(row, 'Change', 'oui', function () {
      attends(b, appel('POST', '/auth/hint', { password: a.value, hint: h.value }), function () { fini('Hint changed.'); });
    });
    bouton(row, 'Cancel', '', ferme);
  }
  function nouvelleCle() {
    var b = cadre();
    b.appendChild(el('h2', '', 'New recovery key?'));
    b.appendChild(el('p', '', 'Your old key stops working.'));
    b.appendChild(el('p', 'err', ''));
    var row = el('div', 'row'); b.appendChild(row);
    bouton(row, 'New key', 'oui', function () {
      attends(b, appel('POST', '/auth/recovery-key', {}), function (c) { montreLaCle(c.recoveryKey, ferme); });
    });
    bouton(row, 'Cancel', '', ferme);
  }
  function fini(texte) {
    var b = cadre();
    b.appendChild(el('h2', '', texte));
    var row = el('div', 'row'); b.appendChild(row);
    bouton(row, 'OK', 'oui', ferme);
  }
  function deconnexion() {
    lsDel(CLE_SESSION);
    lsSet(CLE_HORSLIGNE, '1');
    var copie = lsGet(CLE_COPIE);
    if (copie !== null && window.LLProfil) { lsSet(window.LLProfil.CLE, copie); lsDel(CLE_COPIE); }
    window.location.reload();
  }

  /* S1472 · note 360 ⑪ — « je peux me déconnecter » : LOG OUT / SWITCH PROFILE, depuis OPTIONS et le HOME.
     Ferme le profil courant et REVIENT AU CHOIX DE PROFIL (la porte du compte : log in · create · play
     offline) — à la différence de « Log out » du compte, qui restait hors ligne sans rien redemander. En
     ligne, la session du navigateur est oubliée ; le profil hors ligne mis de côté est rendu. */
  function changeDeProfil() {
    lsDel(CLE_SESSION);
    lsDel(CLE_HORSLIGNE);
    var copie = lsGet(CLE_COPIE);
    if (copie !== null && window.LLProfil) { lsSet(window.LLProfil.CLE, copie); lsDel(CLE_COPIE); }
    try { window.sessionStorage.removeItem('ll.compte.lu'); } catch (e) { /* idem */ }
    window.location.reload();
  }

  /* ── au lancement du HOME ─────────────────────────────────────────────── */
  function auLancement() {
    var s = session();
    if (s && s.pret !== true) { apresConnexion(s.pseudo, true); return; }
    if (s) {
      /* le profil se relit au serveur (un autre PC a pu jouer) — une fois par onglet */
      var deja = null;
      try { deja = window.sessionStorage.getItem('ll.compte.lu'); } catch (e) { deja = '1'; }
      if (deja) { return; }
      try { window.sessionStorage.setItem('ll.compte.lu', '1'); } catch (e) { /* idem */ }
      appel('GET', '/profile', undefined, s.base).then(function (r) {
        if (r.statut === 401) { lsDel(CLE_SESSION); accueil(phrase('UNAUTHORIZED')); return; }
        if (!r.ok || !r.corps.profile || !window.LLProfil) { return; }
        var ici = lsGet(window.LLProfil.CLE);
        r.corps.profile.pseudo = s.pseudo;
        if (ici !== JSON.stringify(r.corps.profile)) { adopte(r.corps.profile, s.pseudo); window.location.reload(); }
      });
      return;
    }
    if (lsGet(CLE_HORSLIGNE) === '1') { return; }
    accueil();
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', auLancement); }
  else { auLancement(); }

  window.LLCompte = { appel: appel, session: session, serveur: serveur, accueil: accueil, blocDuProfil: blocDuProfil, changeDeProfil: changeDeProfil, phrase: phrase, sansReponse: sansReponse, DEFAUT: SERVEUR_DEFAUT };
})();
