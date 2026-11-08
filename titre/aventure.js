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
 *
 * S1684 · note 505 ③ (Croze : « plus proche de 100 levels, cacher en post-prod l'étage d'en dessous et mettre un
 * "?" ») — `aventure.json.structure` : l'entonnoir reste la CARTE DU MONDE, un clic sur un cercle atteint ouvre SA
 * SOUS-CARTE (l'anneau déplié en bande horizontale, `niveaux_vises` médaillons sur la traînée de dents, défilement
 * latéral ; les chapitres écrits prennent les premiers niveaux, les autres sont À VENIR) ; le cercle sous le cercle
 * courant est voilé (brume + un grand « ? » dessiné ici, en attendant le calque du CLASSEUR), les plus bas noirs.
 * Le numéro d'un niveau = son rang dans la descente (cercle n, niveau k → (n−1)×11 + k ; le dernier du 9ᵉ = 100).
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
    '#aventure .av-fiche button.av-jouer{background:#a3231d;color:#f4ecda}' +
    /* 505 ③ — la plaque d'un cercle sur l'entonnoir, le voile du dessous, la sous-carte */
    '#aventure button.av-plaque{position:absolute;transform:translate(-50%,-50%);cursor:pointer;white-space:nowrap;padding:.9vh 1.4vw;' +
    'background:rgba(14,9,6,.82);border:2px solid #8a6a3a;color:#efe6cf;display:flex;flex-direction:column;align-items:center;gap:.4vh;' +
    'font:800 clamp(14px,1.6vw,22px)/1 "Big Shoulders Display","Arial Black",sans-serif;letter-spacing:.12em;box-shadow:0 .6vh 1.6vh rgba(0,0,0,.85)}' +
    '#aventure button.av-plaque small{font:700 clamp(10px,.9vw,13px)/1 "Alegreya",Georgia,serif;letter-spacing:.1em;color:#d9b36a}' +
    '#aventure button.av-plaque:hover{border-color:#ffd77a;color:#ffd77a}' +
    '#aventure button.av-plaque.courant{border-color:#ffd77a;animation:avLueur 1.6s ease-in-out infinite}' +
    '#aventure button.av-plaque.voile{cursor:not-allowed;background:transparent;border:none;box-shadow:none;color:#cfc4b0;' +
    'font:900 clamp(60px,8vw,120px)/1 "Big Shoulders Display","Arial Black",sans-serif;text-shadow:0 0 18px #000,0 0 40px #000}' +
    '#aventure button.av-plaque.voile small{color:#9a8a72}' +
    '#aventure button.av-plaque.noir{display:none}' +
    '#aventure button.av-plaque.secoue{animation:avSecoue .35s}' +
    '#aventure .av-brume{position:absolute;left:0;right:0;pointer-events:none;' +
    'background:linear-gradient(rgba(10,8,8,.25),rgba(40,36,34,.78) 30%,rgba(40,36,34,.78) 70%,rgba(4,2,2,.96));filter:blur(2px)}' +
    '#aventure .av-noir{position:absolute;left:0;right:0;bottom:0;pointer-events:none;background:#030101}' +
    '#aventure .av-sous-carte{position:absolute;inset:0;z-index:7;background:#060404;display:flex;flex-direction:column}' +
    '#aventure .av-sous-carte .av-tete{position:relative}' +
    '#aventure .av-bandeau{flex:1;overflow-x:auto;overflow-y:hidden;position:relative;scrollbar-color:#3a2c20 #060404}' +
    '#aventure .av-anneau{position:relative;height:100%;min-width:100%}' +
    '#aventure .av-anneau .av-sol{position:absolute;left:0;right:0;top:50%;height:44%;transform:translateY(-50%);border-radius:40px;' +
    'background:radial-gradient(ellipse at 50% 35%,#3a2a1e 0%,#1e1510 60%,#0d0907 100%);box-shadow:inset 0 -2vh 3vh rgba(0,0,0,.7),0 2vh 4vh rgba(0,0,0,.8);' +
    'background-size:cover}' +
    '#aventure .av-anneau .av-med{width:clamp(70px,7vw,110px)}' +
    '#aventure .av-anneau .av-med .av-niv{position:absolute;top:calc(100% + 1.2vh);left:50%;transform:translateX(-50%);white-space:nowrap;' +
    'font:700 clamp(11px,1vw,15px)/1.2 "Alegreya",Georgia,serif;letter-spacing:.06em;color:#d9b36a;text-shadow:0 0 6px #000}' +
    '#aventure .av-anneau .av-trainee{border-top-width:.8vh}';

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

  /* 505 ③ — les niveaux d'un cercle : `niveaux_vises` places, les chapitres écrits d'abord (dans leur ordre) */
  function niveauxDuCercle(d, c, liste) {
    var n = typeof c.niveaux_vises === 'number' ? c.niveaux_vises
      : (d.structure && typeof d.structure.niveaux_par_cercle === 'number' ? d.structure.niveaux_par_cercle : c.chapitres.length);
    var parCercle = d.structure && typeof d.structure.niveaux_par_cercle === 'number' ? d.structure.niveaux_par_cercle : n;
    var ecrits = liste.filter(function (x) { return x.cercle === c; });
    var out = [];
    for (var k = 1; k <= Math.max(n, ecrits.length); k += 1) {
      out.push({ k: k, numero: (c.numero - 1) * parCercle + k, x: ecrits[k - 1] || null });
    }
    return out;
  }

  function sousCarte(d, c, liste) {
    var vieille = racine.querySelector('.av-sous-carte'); if (vieille) vieille.remove();
    var page = el('div', 'av-sous-carte');
    var tete = el('div', 'av-tete');
    var retour = el('button', 'av-b', mot('◀ THE NINE CIRCLES', '◀ LES NEUF CERCLES')); retour.type = 'button';
    retour.addEventListener('click', function () { page.remove(); });
    tete.appendChild(retour);
    tete.appendChild(el('h2', null, romain(c.numero) + ' · ' + mot(c.nom_en, c.nom).toUpperCase()));
    var niv = niveauxDuCercle(d, c, liste);
    var faits = niv.filter(function (v) { return v.x && v.x.etat === 'REUSSI'; }).length;
    tete.appendChild(el('span', 'av-sous', faits + ' / ' + niv.length + mot(' levels', ' niveaux')));
    page.appendChild(tete);
    var bandeau = el('div', 'av-bandeau'), anneau = el('div', 'av-anneau');
    var PAS = Math.max(150, Math.round(window.innerWidth / 6.5)), MARGE = Math.round(PAS * 0.8);
    anneau.style.width = (MARGE * 2 + PAS * (niv.length - 1)) + 'px';
    var sol = el('div', 'av-sol');
    /* l'anneau déplié prend la peinture de son cercle quand la carte est déposée (sinon le dégradé) */
    sol.style.backgroundImage = "url('/" + String(d.carte.image).replace(/^\/+/, '') + "'),radial-gradient(ellipse at 50% 35%,#3a2a1e 0%,#1e1510 60%,#0d0907 100%)";
    sol.style.backgroundPosition = '50% ' + (c.ancre.y * 100) + '%';
    sol.style.backgroundSize = '100% auto';
    anneau.appendChild(sol);
    var t = el('div', 'av-trainee');
    t.style.left = MARGE + 'px'; t.style.width = (PAS * (niv.length - 1)) + 'px'; t.style.top = '50%';
    anneau.appendChild(t);
    var courantEl = null;
    niv.forEach(function (v, i) {
      var etat = v.x ? v.x.etat : 'A_VENIR';
      var m = el('button', 'av-med ' + etat); m.type = 'button';
      m.style.left = (MARGE + PAS * i) + 'px'; m.style.top = '50%';
      if (v.x) m.dataset.chapitre = v.x.chapitre.id;
      m.dataset.niveau = String(v.numero);
      m.innerHTML = String(v.numero) +
        '<small>' + (etat === 'A_VENIR' ? mot('COMING', 'BIENTÔT') : etat === 'REUSSI' ? '✓' : '') + '</small>' +
        (etat === 'VERROUILLE' ? CHAINE : '');
      var nom = el('span', 'av-niv', v.x ? v.x.chapitre.titre : mot('level ', 'niveau ') + v.k);
      m.appendChild(nom);
      m.title = v.x ? v.x.chapitre.titre : '';
      m.addEventListener('click', function () {
        if (etat === 'VERROUILLE') { m.classList.remove('secoue'); void m.offsetWidth; m.classList.add('secoue'); return; }
        if (v.x) ficheDuChapitre(d, v.x);
      });
      if (etat === 'COURANT') courantEl = m;
      anneau.appendChild(m);
    });
    bandeau.appendChild(anneau);
    page.appendChild(bandeau);
    /* la molette fait défiler la bande de gauche à droite */
    bandeau.addEventListener('wheel', function (e) {
      if (e.ctrlKey) return;
      e.preventDefault(); bandeau.scrollLeft += (Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX);
    }, { passive: false });
    var tire = null;
    bandeau.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; tire = { x: e.clientX, l: bandeau.scrollLeft }; });
    window.addEventListener('pointermove', function (e) { if (tire) bandeau.scrollLeft = tire.l - (e.clientX - tire.x); });
    window.addEventListener('pointerup', function () { tire = null; });
    racine.appendChild(page);
    /* le niveau courant au centre */
    requestAnimationFrame(function () {
      if (courantEl) bandeau.scrollLeft = Math.max(0, courantEl.offsetLeft - bandeau.clientWidth / 2);
    });
  }

  function peins(d) {
    racine.innerHTML = '';
    var tete = el('div', 'av-tete');
    var retour = el('button', 'av-b', mot('◀ BACK', '◀ RETOUR')); retour.type = 'button'; retour.addEventListener('click', ferme);
    tete.appendChild(retour);
    tete.appendChild(el('h2', null, d.nom));
    tete.appendChild(el('span', 'av-sous', mot('the nine circles — click a circle to see its levels', 'les neuf cercles — clique un cercle pour voir ses niveaux')));
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

    /* 505 ③ — le cercle atteint est FINI quand chacun de ses niveaux est réussi : alors le suivant se dévoile
       (jamais aujourd'hui : les Limbes visent 11 niveaux et en ont deux d'écrits). Sous le cercle atteint, l'étage
       voilé (brume + « ? »), puis le noir. */
    var cAtteint = d.cercles.filter(function (c) { return c.numero === atteint; })[0];
    var fini = cAtteint ? niveauxDuCercle(d, cAtteint, liste).every(function (v) { return v.x && v.x.etat === 'REUSSI'; }) : false;
    var voile = fini ? atteint + 1 : atteint;   /* le dernier cercle dévoilé */
    var ancreDe = function (num) { return d.cercles.filter(function (c) { return c.numero === num; })[0]; };
    var a1 = ancreDe(voile), a2 = ancreDe(voile + 1), a3 = ancreDe(voile + 2);
    if (a1 && a2) {
      var yHaut = (a1.ancre.y + a2.ancre.y) / 2, yBas = a3 ? (a2.ancre.y + a3.ancre.y) / 2 : 1;
      var b = el('div', 'av-brume'); b.style.top = (yHaut * 100) + '%'; b.style.height = ((yBas - yHaut) * 100) + '%'; carte.appendChild(b);
      if (a3) { var nr = el('div', 'av-noir'); nr.style.top = (yBas * 100) + '%'; carte.appendChild(nr); }
    }

    /* 505 ③ — sur la carte du monde, chaque cercle est UNE plaque : dévoilé = son nom et « n / 11 », cliquable
       (sa sous-carte) ; l'étage voilé = un grand « ? » ; plus bas = rien (le noir). */
    d.cercles.forEach(function (c) {
      var etage = c.numero <= voile ? 'ouvert' : c.numero === voile + 1 ? 'voile' : 'noir';
      var niv = niveauxDuCercle(d, c, liste);
      var p = el('button', 'av-plaque ' + etage + (c.numero === atteint && !fini ? ' courant' : '')); p.type = 'button';
      p.dataset.cercle = String(c.numero);
      p.style.left = (c.ancre.x * 100) + '%'; p.style.top = (c.ancre.y * 100) + '%';
      if (etage === 'ouvert') {
        p.appendChild(document.createTextNode(romain(c.numero) + ' · ' + mot(c.nom_en, c.nom).toUpperCase()));
        p.appendChild(el('small', null, niv.filter(function (v) { return v.x && v.x.etat === 'REUSSI'; }).length + ' / ' + niv.length));
        p.addEventListener('click', function () { sousCarte(d, c, liste); });
      } else if (etage === 'voile') {
        p.appendChild(document.createTextNode('?'));
        p.appendChild(el('small', null, mot('finish the circle above', 'finis le cercle du dessus')));
        p.addEventListener('click', function () { p.classList.remove('secoue'); void p.offsetWidth; p.classList.add('secoue'); });
      }
      carte.appendChild(p);
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
        var v = racine.querySelector('.av-fiche-voile'); var sc = racine.querySelector('.av-sous-carte');
        if (v) v.remove(); else if (sc) sc.remove(); else ferme();
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

  window.LLAventure = { ouvre: ouvre, ferme: ferme, charge: charge, etats: etats, niveauxDuCercle: niveauxDuCercle };
}());
