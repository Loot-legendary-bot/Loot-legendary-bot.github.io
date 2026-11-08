/*
 * aventure.js — LA DESCENTE (S1682 · notes 501 ① + 502 + 503, Croze 08/11).
 *
 * Phrase de Croze (503 ④) : « PLAY → LA DESCENTE : l'entonnoir, les Limbes éclairés, deux
 * médaillons (tuto 1 réussi avec ses étoiles, tuto 2 COMING), je clique tuto 1 et sa carte
 * s'ouvre avec la ligne du Grand Lécheur. »
 *
 * Tout vient de `data/generated/aventure.json` (CLASSEUR), servi à `/titre/aventure.json`
 * par vite.config.ts — aucune copie ici, aucun chapitre inventé :
 *   - la carte = `carte.image` ; tant que l'image n'est pas déposée dans `public/`, le
 *     repli de 502 ① : neuf bandeaux sombres, un par cercle, à leur ancre ;
 *   - un médaillon par chapitre, posé à l'ancre de son cercle (`cercles[].ancre` : x, y,
 *     largeur de la terrasse, en fractions), plusieurs chapitres alignés de gauche à droite
 *     avec la traînée de dents entre eux ;
 *   - quatre états (503 ②) : VERROUILLÉ · COURANT · RÉUSSI · À VENIR (`etat: A_ECRIRE`) ;
 *   - la ligne de Virgile (`ligne_de_virgile`) : null = pas d'encart.
 * La progression n'est pas encore au profil (`aventure.json.progression` : « au profil,
 * serveur comme le grade ») : RÉUSSI se lit sur `ll_tuto.fini`, que le tuto grave à sa
 * clôture (main.ts::tutoGravéFini) ; les étoiles attendent leurs seuils (Q-ECR503-ETOILES).
 */
(function () {
  'use strict';

  /* le lanceur du scénario d'un chapitre : `scenario: "tuto"` = le tuto d'aujourd'hui (503 ③),
     la même porte que FIRST STEPS (`?tuto=tuto_1_the_run`) */
  var LANCEURS = { tuto: 'tuto_1_the_run' };

  var donnee = null, chargement = null;
  function charge() {
    if (chargement) return chargement;
    chargement = fetch('/titre/aventure.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { donnee = d; return d; })
      .catch(function () { return null; });
    return chargement;
  }

  function fr() { try { return window.LLLangue && window.LLLangue.cible() === 'FR'; } catch (e) { return false; } }
  function mot(en, f) { return fr() ? f : en; }
  function romain(n) { return ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'][n] || String(n); }
  function tutoFini() {
    try { return JSON.parse(localStorage.getItem('ll_tuto') || '{}').fini === true; } catch (e) { return false; }
  }
  function el(t, c, x) { var n = document.createElement(t); if (c) n.className = c; if (x != null) n.textContent = x; return n; }

  /* l'état de chaque chapitre, dans l'ordre de la descente : on descend, on ne saute pas */
  function etats(d) {
    var liste = [], courantPris = false, bloque = false;
    d.cercles.forEach(function (c) {
      c.chapitres.forEach(function (ch) {
        var e;
        if (ch.etat !== 'JOUABLE') e = 'A_VENIR';
        else if (bloque) e = 'VERROUILLE';
        else if (ch.scenario === 'tuto' && tutoFini()) e = 'REUSSI';
        else if (!courantPris) { e = 'COURANT'; courantPris = true; bloque = true; }
        else e = 'VERROUILLE';
        liste.push({ cercle: c, chapitre: ch, etat: e });
      });
    });
    return liste;
  }

  var STYLE =
    '#aventure{position:fixed;inset:0;z-index:9300;display:none;background:#060404;color:#efe6cf;font-family:"Alegreya",Georgia,serif}' +
    '#aventure.on{display:block}' +
    '#aventure .av-tete{position:absolute;left:0;right:0;top:0;height:64px;z-index:5;display:flex;align-items:center;gap:16px;padding:0 20px;' +
    'background:linear-gradient(#060404 60%,rgba(6,4,4,0))}' +
    '#aventure .av-tete h2{margin:0;font:800 30px/1 "Big Shoulders Display","Arial Black",sans-serif;letter-spacing:.12em;color:#d9b36a}' +
    '#aventure .av-tete .av-sous{font-size:15px;opacity:.7}' +
    '#aventure .av-tete .av-vide{flex:1}' +
    '#aventure button.av-b{background:rgba(20,14,10,.85);color:#efe6cf;border:1px solid #6a5642;padding:7px 14px;cursor:pointer;' +
    'font:700 15px/1 "Alegreya",Georgia,serif;letter-spacing:.08em}' +
    '#aventure button.av-b:hover{border-color:#d9b36a;color:#d9b36a}' +
    '#aventure .av-defile{position:absolute;inset:0;overflow:auto;scrollbar-color:#3a2c20 #060404}' +
    '#aventure .av-carte{position:relative;margin:0 auto;aspect-ratio:1536/2736}' +
    '#aventure .av-carte img.av-fond{position:absolute;inset:0;width:100%;height:100%;display:block;user-select:none;-webkit-user-drag:none}' +
    '#aventure .av-bande{position:absolute;transform:translate(-50%,-50%);height:6.2%;border-radius:50%;' +
    'background:radial-gradient(ellipse at 50% 40%,#3a2a1e 0%,#1e1510 55%,#0d0907 100%);box-shadow:0 1.2vh 2.4vh rgba(0,0,0,.8),inset 0 -.6vh 1vh rgba(0,0,0,.7)}' +
    '#aventure .av-ombre{position:absolute;left:0;right:0;pointer-events:none;background:rgba(4,2,2,.62)}' +
    '#aventure .av-nom{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none;' +
    'font:700 clamp(13px,1.5vw,18px)/1 "Big Shoulders Display","Arial Black",sans-serif;letter-spacing:.14em;color:#d9b36a;text-shadow:0 0 6px #000,0 0 12px #000}' +
    '#aventure .av-nom.noir{color:#7d6a55}' +
    '#aventure .av-trainee{position:absolute;height:0;border-top:.5vh dotted #e8dcc0;transform:translateY(-50%);opacity:.75;pointer-events:none}' +
    '#aventure .av-med{position:absolute;transform:translate(-50%,-50%);width:clamp(54px,5.4vw,84px);aspect-ratio:1;border-radius:50%;cursor:pointer;' +
    'display:flex;align-items:center;justify-content:center;flex-direction:column;border:.35vh solid #b08a4a;' +
    'background:radial-gradient(circle at 40% 35%,#5a3e22,#25170c 70%);box-shadow:0 .6vh 1.4vh rgba(0,0,0,.85);' +
    'font:800 clamp(18px,2vw,30px)/1 "Big Shoulders Display","Arial Black",sans-serif;color:#f4e3b8;padding:0}' +
    '#aventure .av-med small{font:700 clamp(9px,.8vw,12px)/1 "Alegreya",Georgia,serif;letter-spacing:.1em;margin-top:.3vh}' +
    '#aventure .av-med.COURANT{border-color:#ffd77a;animation:avLueur 1.6s ease-in-out infinite}' +
    '#aventure .av-med.REUSSI{border-color:#d9b36a;background:radial-gradient(circle at 40% 35%,#6c5a2a,#2a210c 70%)}' +
    '#aventure .av-med.VERROUILLE{filter:grayscale(1) brightness(.5);cursor:not-allowed}' +
    '#aventure .av-med.A_VENIR{border-style:dashed;border-color:#6a5642;background:radial-gradient(circle,#1a1410,#0b0806);color:#8a7660;cursor:default}' +
    '#aventure .av-med .av-chaine{position:absolute;inset:-12%;pointer-events:none}' +
    '#aventure .av-med.secoue{animation:avSecoue .35s}' +
    '@keyframes avLueur{0%,100%{box-shadow:0 0 1.2vh 0 rgba(255,215,122,.55),0 .6vh 1.4vh rgba(0,0,0,.85)}50%{box-shadow:0 0 3.4vh .6vh rgba(255,215,122,.9),0 .6vh 1.4vh rgba(0,0,0,.85)}}' +
    '@keyframes avSecoue{0%,100%{margin-left:0}25%{margin-left:-6px}75%{margin-left:6px}}' +
    '#aventure .av-virgile{position:absolute;left:20px;bottom:20px;z-index:5;max-width:min(380px,40vw);padding:12px 16px;' +
    'background:rgba(20,14,10,.92);border:1px solid #6a5642;font:italic 400 16px/1.4 "Alegreya",Georgia,serif}' +
    '#aventure .av-virgile b{display:block;font-style:normal;color:#d9b36a;letter-spacing:.06em;margin-bottom:4px}' +
    '#aventure .av-fiche-voile{position:absolute;inset:0;z-index:8;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center}' +
    '#aventure .av-fiche{width:min(460px,90vw);padding:26px 28px 22px;color:#2a2420;' +
    'background:radial-gradient(120% 90% at 40% 35%,#f4ecda 0%,#eadfc6 62%,#d8c7a4 100%);filter:drop-shadow(0 12px 24px rgba(0,0,0,.7))}' +
    '#aventure .av-fiche .av-cercle{font:700 14px/1 "Alegreya",Georgia,serif;letter-spacing:.14em;text-transform:uppercase;color:#7a5a30}' +
    '#aventure .av-fiche h3{margin:8px 0 12px;font:800 34px/1 "Big Shoulders Display","Arial Black",sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#a3231d}' +
    '#aventure .av-fiche p{margin:0 0 12px;font:400 17px/1.45 "Alegreya",Georgia,serif}' +
    '#aventure .av-fiche p.av-v{font-style:italic;border-left:3px solid #a3231d;padding-left:10px}' +
    '#aventure .av-fiche .av-pied{display:flex;gap:10px;justify-content:flex-end;margin-top:16px}' +
    '#aventure .av-fiche button{cursor:pointer;padding:9px 18px;font:800 17px/1 "Big Shoulders Display","Arial Black",sans-serif;letter-spacing:.1em;' +
    'border:2px solid #a3231d;background:transparent;color:#a3231d}' +
    '#aventure .av-fiche button.av-jouer{background:#a3231d;color:#f4ecda}';

  var CHAINE = '<svg class="av-chaine" viewBox="0 0 100 100"><g fill="none" stroke="#9a9a9a" stroke-width="6">' +
    '<ellipse cx="22" cy="78" rx="10" ry="6" transform="rotate(-45 22 78)"/><ellipse cx="38" cy="62" rx="10" ry="6" transform="rotate(-45 38 62)"/>' +
    '<ellipse cx="62" cy="38" rx="10" ry="6" transform="rotate(-45 62 38)"/><ellipse cx="78" cy="22" rx="10" ry="6" transform="rotate(-45 78 22)"/></g>' +
    '<rect x="40" y="40" width="20" height="18" rx="3" fill="#6d6d6d"/><path d="M44 40v-5a6 6 0 0 1 12 0v5" fill="none" stroke="#6d6d6d" stroke-width="4"/></svg>';

  var racine = null, defile = null, carte = null, zoom = 1, ZOOMS = [0.7, 1, 1.5, 2.2];

  function largeurDeBase() { return Math.min(window.innerWidth * 0.92, window.innerHeight * 1.05, 1100); }
  function poseLaTaille() { if (carte) carte.style.width = Math.round(largeurDeBase() * zoom) + 'px'; }

  function zoome(sens) {
    var i = ZOOMS.indexOf(zoom); var j = Math.max(0, Math.min(ZOOMS.length - 1, i + sens));
    if (j === i) return;
    var cy = (defile.scrollTop + defile.clientHeight / 2) / carte.offsetHeight;
    var cx = (defile.scrollLeft + defile.clientWidth / 2) / Math.max(1, carte.offsetWidth);
    zoom = ZOOMS[j]; poseLaTaille();
    defile.scrollTop = cy * carte.offsetHeight - defile.clientHeight / 2;
    defile.scrollLeft = cx * carte.offsetWidth - defile.clientWidth / 2;
  }

  function ferme() { if (racine) racine.classList.remove('on'); }

  function ficheDuChapitre(d, x) {
    var voile = el('div', 'av-fiche-voile'), f = el('div', 'av-fiche');
    var c = x.cercle, ch = x.chapitre;
    f.appendChild(el('div', 'av-cercle', romain(c.numero) + ' · ' + mot(c.nom_en, c.nom)));
    f.appendChild(el('h3', null, ch.titre));
    if (typeof c.ligne_de_virgile === 'string' && c.ligne_de_virgile.trim() !== '') {
      f.appendChild(el('p', 'av-v', '« ' + c.ligne_de_virgile + ' » — ' + d.virgile.nom));
    }
    var corps;
    if (x.etat === 'A_VENIR') corps = mot('Coming — the scribe is still writing this chapter.', 'Bientôt — le scribe écrit encore ce chapitre.');
    else if (ch.scenario === 'tuto') corps = mot('A real game as the Mailman, run by a dungeon master: he stops you on cards and walks you through every move.',
      'Une vraie partie avec The Mailman, menée par un maître de jeu : il t’arrête sur les cartes et te guide à chaque geste.');
    else corps = '';
    if (corps) f.appendChild(el('p', null, corps));
    if (x.etat === 'REUSSI') f.appendChild(el('p', null, mot('Cleared.', 'Réussi.')));
    var pied = el('div', 'av-pied');
    var retour = el('button', null, mot('BACK', 'RETOUR')); retour.type = 'button';
    retour.addEventListener('click', function () { voile.remove(); });
    pied.appendChild(retour);
    var lanceur = LANCEURS[ch.scenario];
    if ((x.etat === 'COURANT' || x.etat === 'REUSSI') && lanceur) {
      var jouer = el('button', 'av-jouer', mot('PLAY', 'JOUER')); jouer.type = 'button';
      jouer.addEventListener('click', function () {
        var q = new URLSearchParams(window.location.search);
        q.set('tuto', lanceur); q.delete('perso');
        window.location.href = '/?' + q.toString();
      });
      pied.appendChild(jouer);
    }
    f.appendChild(pied);
    voile.appendChild(f);
    voile.addEventListener('click', function (e) { if (e.target === voile) voile.remove(); });
    racine.appendChild(voile);
  }

  function peins(d) {
    racine.innerHTML = '';
    var tete = el('div', 'av-tete');
    var retour = el('button', 'av-b', mot('◀ BACK', '◀ RETOUR')); retour.type = 'button'; retour.addEventListener('click', ferme);
    tete.appendChild(retour);
    tete.appendChild(el('h2', null, d.nom));
    tete.appendChild(el('span', 'av-sous', mot('the nine circles — chapter 1 is the tutorial', 'les neuf cercles — le chapitre 1 est le tutoriel')));
    tete.appendChild(el('span', 'av-vide'));
    var moins = el('button', 'av-b', '−'), plus = el('button', 'av-b', '+');
    moins.type = plus.type = 'button'; moins.title = 'zoom out'; plus.title = 'zoom in';
    moins.addEventListener('click', function () { zoome(-1); }); plus.addEventListener('click', function () { zoome(1); });
    tete.appendChild(moins); tete.appendChild(plus);
    racine.appendChild(tete);

    defile = el('div', 'av-defile');
    var marge = el('div'); marge.style.height = '64px'; defile.appendChild(marge);
    carte = el('div', 'av-carte');
    poseLaTaille();
    var liste = etats(d);
    /* le cercle atteint : celui du chapitre courant, sinon le plus profond qui porte un chapitre réussi */
    var atteint = 1;
    liste.forEach(function (x) { if (x.etat === 'COURANT' || x.etat === 'REUSSI') atteint = Math.max(atteint, x.cercle.numero); });

    /* le repli de 502 ① sous l'image : il reste visible tant que l'image n'est pas déposée */
    d.cercles.forEach(function (c) {
      var b = el('div', 'av-bande');
      b.style.left = (c.ancre.x * 100) + '%'; b.style.top = (c.ancre.y * 100) + '%'; b.style.width = (c.ancre.largeur * 100) + '%';
      carte.appendChild(b);
    });
    var img = el('img', 'av-fond'); img.alt = ''; img.draggable = false;
    img.addEventListener('error', function () { img.remove(); });
    img.src = '/' + String(d.carte.image).replace(/^\/+/, '');
    carte.appendChild(img);

    /* la pénombre : tout ce qui est sous le cercle atteint */
    var suivant = d.cercles.filter(function (c) { return c.numero === atteint + 1; })[0];
    if (suivant) {
      var courant = d.cercles.filter(function (c) { return c.numero === atteint; })[0];
      var y = courant ? (courant.ancre.y + suivant.ancre.y) / 2 : suivant.ancre.y - 0.05;
      var o = el('div', 'av-ombre'); o.style.top = (y * 100) + '%'; o.style.bottom = '0'; carte.appendChild(o);
    }

    d.cercles.forEach(function (c) {
      var n = el('div', 'av-nom' + (c.numero > atteint ? ' noir' : ''), romain(c.numero) + ' · ' + mot(c.nom_en, c.nom).toUpperCase());
      n.style.left = (c.ancre.x * 100) + '%';
      n.style.top = ((c.ancre.y - 0.042) * 100) + '%';
      carte.appendChild(n);
      var meds = liste.filter(function (x) { return x.cercle === c; });
      var k = meds.length; if (k === 0) return;
      var x0 = c.ancre.x - c.ancre.largeur / 2;
      var xs = meds.map(function (_, i) { return x0 + c.ancre.largeur * (i + 1) / (k + 1); });
      if (k > 1) {
        var t = el('div', 'av-trainee');
        t.style.left = (xs[0] * 100) + '%'; t.style.width = ((xs[k - 1] - xs[0]) * 100) + '%'; t.style.top = (c.ancre.y * 100) + '%';
        carte.appendChild(t);
      }
      meds.forEach(function (x, i) {
        var m = el('button', 'av-med ' + x.etat); m.type = 'button';
        m.dataset.chapitre = x.chapitre.id;
        m.style.left = (xs[i] * 100) + '%'; m.style.top = (c.ancre.y * 100) + '%';
        var num = liste.indexOf(x) + 1;
        m.innerHTML = (x.etat === 'A_VENIR' ? '?' : String(num)) +
          '<small>' + (x.etat === 'A_VENIR' ? mot('COMING', 'BIENTÔT') : x.etat === 'REUSSI' ? '✓' : '') + '</small>' +
          (x.etat === 'VERROUILLE' ? CHAINE : '');
        m.title = x.chapitre.titre;
        m.addEventListener('click', function () {
          if (x.etat === 'VERROUILLE') { m.classList.remove('secoue'); void m.offsetWidth; m.classList.add('secoue'); return; }
          ficheDuChapitre(d, x);
        });
        carte.appendChild(m);
      });
    });
    defile.appendChild(carte);
    racine.appendChild(defile);

    defile.addEventListener('wheel', function (e) { if (e.ctrlKey) { e.preventDefault(); zoome(e.deltaY < 0 ? 1 : -1); } }, { passive: false });
    /* glisser pour défiler */
    var tire = null;
    defile.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; tire = { y: e.clientY, x: e.clientX, t: defile.scrollTop, l: defile.scrollLeft }; });
    window.addEventListener('pointermove', function (e) { if (!tire) return; defile.scrollTop = tire.t - (e.clientY - tire.y); defile.scrollLeft = tire.l - (e.clientX - tire.x); });
    window.addEventListener('pointerup', function () { tire = null; });

    var c0 = d.cercles.filter(function (c) { return c.numero === atteint; })[0];
    var virg = c0 && typeof c0.ligne_de_virgile === 'string' && c0.ligne_de_virgile.trim() !== '' ? c0.ligne_de_virgile : null;
    if (virg) {
      var v = el('div', 'av-virgile'); v.appendChild(el('b', null, d.virgile.nom)); v.appendChild(document.createTextNode(virg));
      racine.appendChild(v);
    }
    /* le cercle courant centré */
    requestAnimationFrame(function () {
      if (c0) defile.scrollTop = Math.max(0, 64 + c0.ancre.y * carte.offsetHeight - defile.clientHeight / 2);
    });
  }

  function ouvre() {
    if (racine === null) {
      var s = document.createElement('style'); s.textContent = STYLE; document.head.appendChild(s);
      racine = el('div'); racine.id = 'aventure';
      document.body.appendChild(racine);
      document.addEventListener('keydown', function (e) {
        if (!racine.classList.contains('on') || e.key !== 'Escape') return;
        var v = racine.querySelector('.av-fiche-voile'); if (v) v.remove(); else ferme();
      });
      window.addEventListener('resize', function () { if (racine.classList.contains('on')) poseLaTaille(); });
    }
    racine.classList.add('on');
    racine.innerHTML = '<div class="av-tete"><h2>…</h2></div>';
    return charge().then(function (d) {
      if (!d || !Array.isArray(d.cercles)) {
        racine.innerHTML = '';
        var t = el('div', 'av-tete'); var r = el('button', 'av-b', mot('◀ BACK', '◀ RETOUR')); r.type = 'button'; r.addEventListener('click', ferme);
        t.appendChild(r); t.appendChild(el('span', 'av-sous', mot('The map could not be read.', 'La carte n’a pas pu être lue.')));
        racine.appendChild(t); return;
      }
      peins(d);
    });
  }

  window.LLAventure = { ouvre: ouvre, ferme: ferme, charge: charge, etats: etats };
}());
