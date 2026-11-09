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
    '#aventure .av-anneau .av-trainee{border-top-width:.8vh}' +
    /* S1691 · 513 ① — la carte du monde dans le noir, sauf l'étage courant (la torche) ; le zoom vers la sous-carte */
    '#aventure .av-nuit-monde{position:absolute;inset:0;pointer-events:none}' +
    '#aventure .av-sous-carte.zoome{animation:avZoom .55s cubic-bezier(.2,.7,.2,1)}' +
    '@keyframes avZoom{from{transform:scale(.18);opacity:0}to{transform:none;opacity:1}}' +
    /* S1691 · 513 ② ③ + 515 ① + 516 — la sous-carte des Limbes : la bande D, la torche, le Turd, la case de BD */
    '#aventure .av-scene{position:relative;height:100%;background-size:100% 100%;background-repeat:no-repeat}' +
    '#aventure .av-scene canvas.av-nuit{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}' +
    '#aventure .av-pin{position:absolute;transform:translate(-50%,-50%);width:clamp(48px,4.6vw,74px);aspect-ratio:1;border-radius:50%;padding:0;cursor:pointer;' +
    'border:3px solid #f2f2f2;background:#0b0b0b center/cover no-repeat;box-shadow:0 0 0 2px #0b0b0b,0 .8vh 1.6vh rgba(0,0,0,.9)}' +
    '#aventure .av-pin.COURANT{border-color:#ffd77a;animation:avLueur 1.6s ease-in-out infinite}' +
    '#aventure .av-pin.REUSSI{border-color:#d9b36a}' +
    '#aventure .av-pin.NON_ATTEINT{filter:brightness(.13) grayscale(1);cursor:default;border-color:#555}' +
    '#aventure .av-pin .av-niv{position:absolute;top:calc(100% + 6px);left:50%;transform:translateX(-50%);white-space:nowrap;pointer-events:none;' +
    'font:800 clamp(11px,1vw,15px)/1 "Big Shoulders Display","Arial Black",sans-serif;letter-spacing:.1em;color:#f2f2f2;text-shadow:0 0 4px #000,0 0 10px #000,0 0 14px #000}' +
    '#aventure .av-pin .av-niv b{color:#ee4b4b}' +
    '#aventure .av-pin.secoue{animation:avSecoue .35s}' +
    '#aventure .av-turd{position:absolute;transform:translate(-50%,-88%);width:clamp(56px,5.2vw,86px);aspect-ratio:1;pointer-events:none;z-index:3;' +
    'transition:left 1s ease-in-out,top 1s ease-in-out;filter:drop-shadow(0 6px 6px rgba(0,0,0,.9))}' +
    '#aventure .av-turd img{width:100%;height:100%;border-radius:50%;border:3px solid #f2f2f2;box-sizing:border-box;background:#0b0b0b}' +
    '#aventure .av-turd.marche img{animation:avPas .25s ease-in-out infinite alternate}' +
    '@keyframes avPas{from{transform:translateY(0) rotate(-4deg)}to{transform:translateY(-6px) rotate(4deg)}}' +
    '#aventure .av-bd{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);z-index:9;width:min(860px,94vw);cursor:pointer;' +
    'display:flex;gap:18px;align-items:center;padding:18px 26px 18px 18px;background:#0b0b0b;color:#f2f2f2;' +
    'clip-path:polygon(0 6%,3% 0,9% 4%,17% 1%,26% 5%,34% 0,43% 3%,52% 0,61% 4%,70% 1%,79% 5%,88% 0,96% 3%,100% 0,99% 34%,100% 66%,98% 100%,90% 96%,81% 100%,72% 97%,63% 100%,54% 96%,45% 100%,36% 97%,27% 100%,18% 96%,9% 100%,2% 97%,0 64%,1% 32%);' +
    'box-shadow:inset 0 0 0 3px #f2f2f2}' +
    '#aventure .av-bd .av-bd-tete{flex:0 0 auto;width:clamp(76px,9vw,120px);aspect-ratio:1;border-radius:50%;border:3px solid #f2f2f2;background:#151515 center/cover}' +
    '#aventure .av-bd .av-bulle{position:relative;flex:1;padding:14px 18px;background:#f2f2f2;color:#0b0b0b;border-radius:18px;' +
    'font:700 clamp(15px,1.45vw,20px)/1.35 "Alegreya",Georgia,serif}' +
    '#aventure .av-bd .av-bulle:before{content:"";position:absolute;left:-14px;top:50%;margin-top:-10px;border:10px solid transparent;border-right:16px solid #f2f2f2;border-left:0}' +
    '#aventure .av-bd .av-bulle b{display:block;font:800 13px/1 "Big Shoulders Display","Arial Black",sans-serif;letter-spacing:.16em;color:#a3231d;margin-bottom:6px}' +
    '#aventure .av-bd .av-suite{position:absolute;right:16px;bottom:8px;font:800 12px/1 "Big Shoulders Display","Arial Black",sans-serif;letter-spacing:.14em;color:#a1a1a1}' +
    '#aventure .av-fiche .av-obj{font-weight:700}' +
    '#aventure .av-fiche .av-etoiles{font:800 22px/1 "Big Shoulders Display","Arial Black",sans-serif;letter-spacing:.2em;color:#a3231d}' +
    '#aventure .av-fiche .av-regle{font-size:14px;opacity:.75}' +
    '#aventure .av-fiche button:disabled{opacity:.45;cursor:not-allowed}';

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

  /*
   * ═══ S1691 · notes 513 ② ③ ④ + 515 ① + 516 — LA SOUS-CARTE DES LIMBES ═══════════════════════════
   * Phrase de Croze (513 ④) : « DIVE → CAMPAIGN : je vois l'entonnoir dans le noir avec les Limbes éclairées,
   * je clique, je vois dix points, le Turd me parle en BD, je lance le niveau 1. »
   * Le fond = la bande D (`public/art/campagne/limbo_bande.webp`, téléchargée en S1691 depuis
   * `structure.sous_carte_limbes.bande.D.url`) ; les médaillons v2 = `public/art/campagne/medaillons/<id>.webp`.
   * Chaque asset se remplace par un fichier du même nom (515 ③) : rien ici ne dépend d'une image hors des ancres.
   */
  var BANDE_LIMBES = '/art/campagne/limbo_bande.webp', BANDE_RATIO = 3136 / 1344;
  var TURD = '/art/personnages/all_ico_webp_CORRECTED_ALL/200px/the_turd_200px.webp';
  /* les ancres MESURÉES sur la bande D (S1691 : la base de chaque bâtiment, en fractions de l'image), renvoyées au
     CLASSEUR (516 ②) ; `chapitres[].ancre` les remplace dès qu'il les écrit. */
  var ANCRES_D = {
    tuto_1: { x: 0.064, y: 0.476 }, tuto_2: { x: 0.156, y: 0.193 }, limbo_3: { x: 0.309, y: 0.275 },
    limbo_4: { x: 0.446, y: 0.246 }, limbo_5: { x: 0.577, y: 0.253 }, limbo_6: { x: 0.708, y: 0.231 },
    limbo_7: { x: 0.507, y: 0.714 }, limbo_8: { x: 0.660, y: 0.655 }, limbo_9: { x: 0.835, y: 0.692 },
    limbo_10: { x: 0.932, y: 0.469 },
  };
  var PIN_DY = -0.15, TURD_DY = 0.09;   /* le médaillon flotte au-dessus du toit, le Turd se tient devant, sur la route */
  function ancreDe(ch) {
    var a = ch && ch.ancre;
    if (a && typeof a.x === 'number' && typeof a.y === 'number') return a;
    return ANCRES_D[ch.id] || null;
  }
  function lisTurd() { try { return localStorage.getItem('ll_aventure_turd'); } catch (e) { return null; } }
  function poseTurd(id) { try { localStorage.setItem('ll_aventure_turd', id); } catch (e) { /* */ } }

  /* l'état de chaque point des Limbes : réussi, puis LE courant (le premier pas réussi), puis le noir.
     `jouable` = le scénario existe (PLAY) ; sinon la fiche dit NOT YET (513 ④). */
  function etatsLimbes(c) {
    var out = [], courant = false;
    c.chapitres.forEach(function (ch) {
      var reussi = ch.scenario === 'tuto' && tutoFini();
      var e = reussi ? 'REUSSI' : courant ? 'NON_ATTEINT' : 'COURANT';
      if (!reussi) courant = true;
      out.push({ cercle: c, chapitre: ch, etat: e, jouable: ch.etat === 'JOUABLE' && LANCEURS[ch.scenario] !== undefined });
    });
    return out;
  }

  /* l'objectif du niveau en anglais, lu sur `spec_v2.objectif` (jetons de la donnée) ; un jeton inconnu = rien d'écrit */
  function objectifEn(s) {
    if (typeof s !== 'string') return null;
    var parts = s.replace(/\(.*?\)/g, '').trim().split(/\s+puis\s+/).map(function (p) {
      var m, base = null, fin = '';
      if (/sans mourir/.test(p)) fin += ' without dying';
      if (/et vivant/.test(p)) fin += ' and stay alive';
      if ((m = /avant (?:la fin du |le )?tour (\d+)/.exec(p))) fin += ' before turn ' + m[1];
      var t = p.split(/\s+/)[0];
      if ((m = /^KILL_N_MOBS:(\d+)$/.exec(t))) base = 'Kill ' + m[1] + (m[1] === '1' ? ' monster' : ' monsters');
      else if ((m = /^KILL_MOB:(\w+)$/.exec(t))) base = 'Kill the ' + m[1].replace(/_/g, ' ');
      else if ((m = /^EQUIP_N:(\d+)$/.exec(t))) base = 'Equip ' + m[1] + ' pieces of gear';
      else if ((m = /^CHESTS:(\d+)$/.exec(t))) base = 'Open ' + m[1] + ' chests';
      else if ((m = /^ALIVE_AT_TURN:(\d+)$/.exec(t))) base = 'Be alive at turn ' + m[1];
      else if (t === 'EXTRACT') base = 'Get out through a portal';
      else if (t === 'EXTRACT_ALIVE') base = 'Get out alive through a portal';
      else if (t === 'SIGNATURE_USED') base = 'Use your Signature';
      return base === null ? null : base + fin;
    });
    return parts.some(function (p) { return p === null; }) ? null : parts.join(', then ');
  }

  function ficheDuNiveau(d, x, rang) {
    var vieille = racine.querySelector('.av-fiche-voile'); if (vieille) vieille.remove();
    var voile = el('div', 'av-fiche-voile'), f = el('div', 'av-fiche');
    var c = x.cercle, ch = x.chapitre;
    f.appendChild(el('div', 'av-cercle', romain(c.numero) + ' · ' + mot(c.nom_en, c.nom) + ' · ' + mot('level ', 'niveau ') + rang));
    f.appendChild(el('h3', null, ch.titre));
    var obj = objectifEn(ch.spec_v2 && ch.spec_v2.objectif);
    if (obj) f.appendChild(el('p', 'av-obj', mot('Objective: ', 'Objectif : ') + obj));
    /* les étoiles : « ✓ » tant que le moteur ne publie pas `SCENARIO_ENDED` (511 ②) */
    f.appendChild(el('div', 'av-etoiles', x.etat === 'REUSSI' ? '✓' : '☆ ☆ ☆'));
    var t3 = ch.etoiles && typeof ch.etoiles.tours_max_3_etoiles === 'number' ? ch.etoiles.tours_max_3_etoiles : 12;
    f.appendChild(el('p', 'av-regle', mot('★ objective · ★★ without dying · ★★★ done by turn ' + t3,
      '★ objectif · ★★ sans mourir · ★★★ fini au tour ' + t3)));
    var pied = el('div', 'av-pied');
    var retour = el('button', null, mot('BACK', 'RETOUR')); retour.type = 'button';
    retour.addEventListener('click', function () { voile.remove(); });
    pied.appendChild(retour);
    var jouer = el('button', 'av-jouer', x.jouable ? mot('PLAY', 'JOUER') : 'NOT YET'); jouer.type = 'button';
    if (x.jouable) {
      jouer.addEventListener('click', function () {
        var q = new URLSearchParams(window.location.search);
        q.set('tuto', LANCEURS[ch.scenario]); q.delete('perso');
        window.location.href = '/?' + q.toString();
      });
    } else {
      jouer.disabled = true;
      f.appendChild(el('p', 'av-regle', mot('Comes with a next update.', 'Arrive avec une prochaine mise à jour.')));
    }
    pied.appendChild(jouer);
    f.appendChild(pied);
    voile.appendChild(f);
    voile.addEventListener('click', function (e) { if (e.target === voile) voile.remove(); });
    racine.appendChild(voile);
  }

  /* 513 ③ — la case de BD : le Turd à gauche, sa bulle à droite ; arrivée → conseil → la fiche du niveau */
  function caseDeBD(d, x, rang) {
    var vieille = racine.querySelector('.av-bd'); if (vieille) vieille.remove();
    var v = x.chapitre.virgile || {};
    var lignes = [v.arrivee, v.conseil].filter(function (s) { return typeof s === 'string' && s.trim() !== ''; });
    if (lignes.length === 0) { ficheDuNiveau(d, x, rang); return; }
    var bd = el('div', 'av-bd'), tete = el('div', 'av-bd-tete'), bulle = el('div', 'av-bulle'), suite = el('span', 'av-suite');
    tete.style.backgroundImage = "url('" + TURD + "')";
    bd.appendChild(tete); bd.appendChild(bulle); bd.appendChild(suite);
    var i = 0;
    function montre() {
      bulle.innerHTML = '';
      bulle.appendChild(el('b', null, (d.virgile && d.virgile.nom) || 'THE TURD'));
      bulle.appendChild(document.createTextNode(lignes[i]));
      suite.textContent = i < lignes.length - 1 ? mot('CLICK ▸', 'CLIC ▸') : mot('THE LEVEL ▸', 'LE NIVEAU ▸');
    }
    bd.addEventListener('click', function () {
      i += 1;
      if (i < lignes.length) { montre(); return; }
      bd.remove(); ficheDuNiveau(d, x, rang);
    });
    montre();
    racine.querySelector('.av-sous-carte').appendChild(bd);
  }

  function sousCarteLimbes(d, c, origine) {
    var vieille = racine.querySelector('.av-sous-carte'); if (vieille) vieille.remove();
    var points = etatsLimbes(c).filter(function (x) { return ancreDe(x.chapitre) !== null; });
    var page = el('div', 'av-sous-carte' + (origine ? ' zoome' : ''));
    if (origine) page.style.transformOrigin = origine.x + 'px ' + origine.y + 'px';
    var tete = el('div', 'av-tete');
    var retour = el('button', 'av-b', mot('◀ THE NINE CIRCLES', '◀ LES NEUF CERCLES')); retour.type = 'button';
    retour.addEventListener('click', function () { page.remove(); });
    tete.appendChild(retour);
    tete.appendChild(el('h2', null, romain(c.numero) + ' · ' + mot(c.nom_en, c.nom).toUpperCase()));
    var faits = points.filter(function (x) { return x.etat === 'REUSSI'; }).length;
    tete.appendChild(el('span', 'av-sous', faits + ' / ' + points.length + mot(' levels', ' niveaux')));
    page.appendChild(tete);
    var bandeau = el('div', 'av-bandeau'), scene = el('div', 'av-scene');
    scene.style.backgroundImage = "url('" + BANDE_LIMBES + "'),radial-gradient(ellipse at 50% 45%,#2a1e16 0%,#0d0907 80%)";
    var nuit = el('canvas', 'av-nuit');
    scene.appendChild(nuit);

    var atteints = points.filter(function (x) { return x.etat !== 'NON_ATTEINT'; });
    var courant = points.filter(function (x) { return x.etat === 'COURANT'; })[0] || atteints[atteints.length - 1] || points[0];
    var ici = lisTurd();
    var pointDuTurd = atteints.filter(function (x) { return x.chapitre.id === ici; })[0] || courant;

    var turd = el('div', 'av-turd'), timg = el('img'); timg.src = TURD; timg.alt = 'The Turd'; turd.appendChild(timg);
    function placeTurd(x) { var a = ancreDe(x.chapitre); turd.style.left = (a.x * 100) + '%'; turd.style.top = ((a.y + TURD_DY) * 100) + '%'; }
    placeTurd(pointDuTurd);

    /* la torche : le noir partout, éteint là où on est passé (les points atteints, le chemin entre eux) et autour du Turd */
    function peinsLaNuit() {
      var W = scene.clientWidth, H = scene.clientHeight;
      if (W === 0 || H === 0) return;
      if (nuit.width !== W || nuit.height !== H) { nuit.width = W; nuit.height = H; }
      var g = nuit.getContext('2d');
      g.globalCompositeOperation = 'source-over';
      g.clearRect(0, 0, W, H);
      g.fillStyle = 'rgba(3,2,2,0.94)';
      g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = 'destination-out';
      function trou(px, py, r) {
        var gr = g.createRadialGradient(px, py, 0, px, py, r);
        gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.55, 'rgba(0,0,0,0.92)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(px, py, r, 0, Math.PI * 2); g.fill();
      }
      var prec = null;
      atteints.forEach(function (x) {
        var a = ancreDe(x.chapitre), px = a.x * W, py = a.y * H;
        trou(px, py, H * (x === courant ? 0.3 : 0.24));
        if (prec) {
          g.save(); g.lineCap = 'round'; g.strokeStyle = 'rgba(0,0,0,0.75)'; g.lineWidth = H * 0.1;
          g.filter = 'blur(' + Math.round(H * 0.03) + 'px)';
          g.beginPath(); g.moveTo(prec.x, prec.y); g.lineTo(px, py); g.stroke(); g.restore();
        }
        prec = { x: px, y: py };
      });
      /* la lueur suit le Turd, même pendant qu'il marche */
      var cs = window.getComputedStyle(turd);
      trou(parseFloat(cs.left) || 0, (parseFloat(cs.top) || 0) - H * 0.04, H * 0.22);
    }

    var enMarche = false;
    function marcheVers(x, puis) {
      if (x === pointDuTurd) { puis(); return; }
      enMarche = true;
      turd.classList.add('marche');
      placeTurd(x);
      var fin = Date.now() + 1050;
      (function boucle() {
        peinsLaNuit();
        if (Date.now() < fin) { requestAnimationFrame(boucle); return; }
        turd.classList.remove('marche');
        enMarche = false;
        pointDuTurd = x; poseTurd(x.chapitre.id);
        peinsLaNuit();
        puis();
      }());
    }

    points.forEach(function (x, i) {
      var a = ancreDe(x.chapitre), rang = i + 1;
      var m = el('button', 'av-pin ' + x.etat); m.type = 'button';
      m.dataset.chapitre = x.chapitre.id;
      m.style.left = (a.x * 100) + '%'; m.style.top = (Math.max(0.07, a.y + PIN_DY) * 100) + '%';
      m.style.backgroundImage = "url('/art/campagne/medaillons/" + x.chapitre.id + ".webp')";
      if (x.etat !== 'NON_ATTEINT') {
        var lib = el('span', 'av-niv'); lib.innerHTML = '<b>' + rang + '</b> · ';
        lib.appendChild(document.createTextNode(String(x.chapitre.titre).toUpperCase() + (x.etat === 'REUSSI' ? ' ✓' : '')));
        m.appendChild(lib);
        m.title = x.chapitre.titre;
      }
      m.addEventListener('click', function () {
        if (enMarche) return;
        if (x.etat === 'NON_ATTEINT') { m.classList.remove('secoue'); void m.offsetWidth; m.classList.add('secoue'); return; }
        var bd = racine.querySelector('.av-bd'); if (bd) bd.remove();
        marcheVers(x, function () { caseDeBD(d, x, rang); });
      });
      scene.appendChild(m);
    });
    scene.appendChild(turd);
    bandeau.appendChild(scene);
    page.appendChild(bandeau);

    function taille() {
      var H = bandeau.clientHeight || Math.max(300, window.innerHeight - 64);
      scene.style.width = Math.max(bandeau.clientWidth, Math.round(H * BANDE_RATIO)) + 'px';
      peinsLaNuit();
    }
    bandeau.addEventListener('wheel', function (e) {
      if (e.ctrlKey) return;
      e.preventDefault(); bandeau.scrollLeft += (Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX);
    }, { passive: false });
    var tire = null;
    bandeau.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; tire = { x: e.clientX, l: bandeau.scrollLeft }; });
    window.addEventListener('pointermove', function (e) { if (tire) bandeau.scrollLeft = tire.l - (e.clientX - tire.x); });
    window.addEventListener('pointerup', function () { tire = null; });
    window.addEventListener('resize', function () { if (page.isConnected) taille(); });
    racine.appendChild(page);
    requestAnimationFrame(function () {
      taille();
      var a = ancreDe(pointDuTurd.chapitre);
      bandeau.scrollLeft = Math.max(0, a.x * scene.clientWidth - bandeau.clientWidth / 2);
      /* l'arrivée : le Turd parle tout de suite au point où il se tient */
      caseDeBD(d, pointDuTurd, points.indexOf(pointDuTurd) + 1);
    });
  }

  function sousCarte(d, c, liste, origine) {
    if (c.numero === 1 && d.structure && d.structure.sous_carte_limbes) { sousCarteLimbes(d, c, origine); return; }
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
    var ancreDe2 = function (num) { return d.cercles.filter(function (c) { return c.numero === num; })[0]; };
    var a1 = ancreDe2(voile), a2 = ancreDe2(voile + 1), a3 = ancreDe2(voile + 2);
    if (a1 && a2) {
      var yHaut = (a1.ancre.y + a2.ancre.y) / 2, yBas = a3 ? (a2.ancre.y + a3.ancre.y) / 2 : 1;
      var b = el('div', 'av-brume'); b.style.top = (yHaut * 100) + '%'; b.style.height = ((yBas - yHaut) * 100) + '%'; carte.appendChild(b);
      if (a3) { var nr = el('div', 'av-noir'); nr.style.top = (yBas * 100) + '%'; carte.appendChild(nr); }
    }

    /* S1691 · 513 ① — tous les anneaux dans le noir sauf l'étage courant : un trou de torche chaud sur lui seul */
    var cT = ancreDe2(atteint);
    if (cT) {
      var nuitM = el('div', 'av-nuit-monde');
      var rx = Math.round(cT.ancre.largeur * 62), X = cT.ancre.x * 100, Y = cT.ancre.y * 100;
      nuitM.style.background =
        'radial-gradient(ellipse ' + rx + '% 7% at ' + X + '% ' + Y + '%,rgba(255,170,80,.16) 0%,rgba(255,150,60,.06) 45%,rgba(0,0,0,0) 62%),' +
        'radial-gradient(ellipse ' + rx + '% 8% at ' + X + '% ' + Y + '%,rgba(3,1,1,0) 0%,rgba(3,1,1,0) 48%,rgba(3,1,1,.93) 100%)';
      carte.appendChild(nuitM);
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
        p.addEventListener('click', function (e) { sousCarte(d, c, liste, { x: e.clientX, y: e.clientY }); });
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
        var bd = racine.querySelector('.av-bd');
        if (v) v.remove(); else if (bd) bd.remove(); else if (sc) sc.remove(); else ferme();
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
