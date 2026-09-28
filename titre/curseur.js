/*
 * ═══ ⛑⛑ S1289 · CU-T1 (note 178) — LE CURSEUR ÉQUIPÉ, PARTOUT ═══════════════
 *
 * Phrase de Croze : *« Dans le Vault j'équipe le curseur Torch, et partout dans
 * le jeu ma souris devient la torche ; sur ce qui se clique, elle passe en
 * version survol. »*
 *
 * **UN SEUL FICHIER, DEUX PAGES** : l'écran titre (`titre/ecran_titre.html`,
 * où vit le Vault) et la partie (`index.html`) le chargent tous les deux. Deux
 * copies de cette logique divergeraient au premier réglage qu'on ne reporte
 * pas sur les deux.
 * Il vit sous `titre/` parce que c'est le dossier de `public/` que git suit
 * (`.gitignore` : `public/*` est ignoré, `titre/` excepté).
 *
 * **LE POINTEUR RESTE NATIF** (note 178 : zéro latence) : `cursor: url(png)
 * x y, repli`. Jamais un faux curseur dessiné qui suit la souris.
 *
 * **LE CHOIX** : `ll.profil.curseur` dans `localStorage` — l'id du curseur
 * (`bones`, `torch`…). Rien d'écrit, ou un id inconnu : `bones`, l'offert.
 * Les deux pages sont servies par la même origine : la clé est partagée.
 *
 * **LES POINTS CHAUDS** se lisent dans `art/curseurs/hotspots.json`, déballé
 * avec les PNG — jamais recopiés ici. La LISTE des curseurs aussi : un id
 * n'existe que s'il y a son `<id>.png` au registre.
 *
 * **« CE QUI SE CLIQUE »** = ce que les feuilles de style de la page déclarent
 * déjà `cursor: pointer` (lues à la source, pas une liste écrite à la main),
 * plus les boutons et les liens. Un élément désactivé garde son curseur.
 */
(function () {
  'use strict';
  var CLE = 'll.profil.curseur';
  var OFFERT = 'bones';
  var DOSSIER = '/art/curseurs/';
  var points = null;           /* { 'torch.png': [16, 1], … } une fois lu */

  function lu() {
    try { return window.localStorage.getItem(CLE) || OFFERT; } catch (e) { return OFFERT; }
  }
  function connu(id) { return points !== null && (id + '.png') in points; }
  function actuel() { var id = lu(); return connu(id) ? id : OFFERT; }

  /* Les sélecteurs que la page déclare `cursor: pointer`, @media compris. */
  function lesCliquables() {
    var sels = ['a[href]', 'button', '[role="button"]', 'summary', 'select',
      'label[for]', 'input[type="checkbox"]', 'input[type="radio"]'];
    function lis(regles) {
      for (var i = 0; i < regles.length; i += 1) {
        var r = regles[i];
        if (r.cssRules && !r.selectorText) { lis(r.cssRules); continue; }
        if (r.style && r.style.cursor === 'pointer' && r.selectorText) {
          r.selectorText.split(',').forEach(function (s) {
            s = s.trim();
            if (s !== '' && s.indexOf('::') === -1 && s.indexOf('#ll-curseur') === -1) sels.push(s);
          });
        }
      }
    }
    for (var k = 0; k < document.styleSheets.length; k += 1) {
      var f = document.styleSheets[k];
      if (f.ownerNode && f.ownerNode.id === 'll-curseur') continue;
      try { lis(f.cssRules); } catch (e) { /* feuille d'une autre origine : illisible, ignorée */ }
    }
    return sels;
  }

  function pose() {
    if (points === null) return;
    var id = actuel();
    var p = points[id + '.png'] || [0, 0];
    var h = points[id + '_hover.png'] || p;
    /*
     * ⛑ S1291 · CU-4 (note 180) — « LES CURSEURS SONT TRONQUÉS ». Mesuré sur la
     * machine de Croze : 2560 × 1440 à 100 %, taille de curseur Windows 32 px,
     * et les images livrées font 64 × 64. Le pointeur est donc servi à 32 px
     * CSS : l'image RÉDUITE (jamais recadrée, `tools/curseurs_tailles.py`) à
     * 1x, 48 px à 1,5x, l'original 64 px à 2x. Le point chaud se dit en px CSS
     * de l'image rendue : la moitié de celui des 64 px. Deux déclarations : la
     * première (32 px seul) tient si `image-set` n'est pas compris.
     */
    function curseur(fichier, pt, repli) {
      var x = Math.round(pt[0] / 2), y = Math.round(pt[1] / 2);
      var seul = 'url(' + DOSSIER.replace(/\/$/, '-32/') + fichier + ') ' + x + ' ' + y + ', ' + repli;
      var jeu = 'image-set(url(' + DOSSIER.replace(/\/$/, '-32/') + fichier + ') 1x, url('
        + DOSSIER.replace(/\/$/, '-48/') + fichier + ') 1.5x, url(' + DOSSIER + fichier + ') 2x) '
        + x + ' ' + y + ', ' + repli;
      return { seul: seul, jeu: jeu };
    }
    var base = curseur(id + '.png', p, 'auto');
    var survol = curseur(id + '_hover.png', h, 'pointer');
    var style = document.getElementById('ll-curseur');
    if (style === null) {
      style = document.createElement('style');
      style.id = 'll-curseur';
      document.head.appendChild(style);
    }
    style.textContent =
      'html, body { cursor: ' + base.seul + '; cursor: ' + base.jeu + '; }\n'
      + ':is(' + lesCliquables().join(', ') + ')'
      + ':not(:disabled, [disabled], [aria-disabled="true"]) { cursor: ' + survol.seul
      + ' !important; cursor: ' + survol.jeu + ' !important; }\n';
    document.documentElement.dataset.curseur = id;
  }

  /** Équipe `id` (le Vault l'appelle) : il est écrit, puis posé sur-le-champ. */
  function equipe(id) {
    try { window.localStorage.setItem(CLE, id); } catch (e) { /* le choix vaut pour cette page */ }
    pose();
  }

  window.llCurseur = { actuel: actuel, equipe: equipe, pose: pose, CLE: CLE, OFFERT: OFFERT };

  fetch(DOSSIER + 'hotspots.json')
    .then(function (r) { return r.json(); })
    .then(function (j) {
      points = j;
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pose);
      else pose();
    })
    .catch(function () { /* pas de registre : le pointeur du système, rien de cassé */ });

  /* Équipé dans un autre onglet : celui-ci suit. */
  window.addEventListener('storage', function (e) { if (e.key === CLE) pose(); });

  /*
   * ═══ S1289 · CU-T3 (note 178) — L'EFFET AU CLIC, À LA POINTE ═════════════
   *
   * Phrase de Croze : *« Quand je clique, un petit effet part de la pointe du
   * curseur, propre à chaque curseur (os qui craquent, braise, flamme,
   * étincelle de cristal, éclat d'or). »*
   *
   * ≤ 220 ms, `transform` et `opacity` SEULEMENT, `pointer-events: none` : le
   * pointeur natif ne bouge pas et aucun clic n'est avalé. La couche est posée
   * sur `body`, HORS de `#composition` : celle-ci est mise à l'échelle par un
   * `transform`, et un `fixed` posé dedans se calerait sur ses 1920 × 1080 au
   * lieu de la fenêtre — l'effet partirait à côté de la pointe.
   *
   * Un curseur inconnu de cette table ne fait RIEN (jamais un effet d'emprunt).
   */
  var DUREE = 220;
  var EFFETS = {
    bones:     { teinte: '#ece6d8', forme: 'eclat',   n: 5, portee: 16, montee: 0 },   /* os qui craquent */
    collapse:  { teinte: '#d8542a', forme: 'point',   n: 6, portee: 12, montee: 10 },  /* braise */
    torch:     { teinte: '#f0a038', forme: 'goutte',  n: 4, portee: 10, montee: 16 },  /* flamme */
    wizard:    { teinte: '#bfe4ff', forme: 'losange', n: 4, portee: 15, montee: 0 },   /* étincelle de cristal */
    legendary: { teinte: '#e8c35a', forme: 'rayon',   n: 6, portee: 18, montee: 0 },   /* éclat d'or */
  };
  var FORMES = {
    eclat:   'width:2px;height:7px;border-radius:1px;',
    point:   'width:4px;height:4px;border-radius:50%;',
    goutte:  'width:5px;height:8px;border-radius:50% 50% 50% 50% / 60% 60% 40% 40%;',
    losange: 'width:5px;height:5px;',
    rayon:   'width:2px;height:10px;border-radius:1px;',
  };

  function effetAuClic(e) {
    if (e.button !== 0) return;
    var f = EFFETS[actuel()];
    if (!f || !document.body || typeof document.body.animate !== 'function') return;
    var reduit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var couche = document.createElement('div');
    couche.className = 'll-clic';
    couche.style.cssText = 'position:fixed;left:' + e.clientX + 'px;top:' + e.clientY
      + 'px;width:0;height:0;pointer-events:none;z-index:2147483647;';
    var n = reduit ? 1 : f.n;
    for (var i = 0; i < n; i += 1) {
      var a = (i / n) * Math.PI * 2 - Math.PI / 2;
      var deg = a * 180 / Math.PI + 90;
      var p = document.createElement('span');
      p.style.cssText = 'position:absolute;left:0;top:0;background:' + f.teinte + ';'
        + FORMES[f.forme] + 'box-shadow:0 0 4px ' + f.teinte + ';';
      couche.appendChild(p);
      var dx = reduit ? 0 : Math.cos(a) * f.portee;
      var dy = reduit ? 0 : Math.sin(a) * f.portee - f.montee;
      var tourne = f.forme === 'losange' ? 45 : (f.forme === 'eclat' || f.forme === 'rayon') ? deg : 0;
      p.animate([
        { transform: 'translate(-50%,-50%) rotate(' + tourne + 'deg) scale(1)', opacity: 1 },
        { transform: 'translate(calc(-50% + ' + dx + 'px),calc(-50% + ' + dy + 'px)) rotate('
          + tourne + 'deg) scale(' + (reduit ? 1.6 : 0.4) + ')', opacity: 0 },
      ], { duration: DUREE, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
    }
    document.body.appendChild(couche);
    /* Retirée par l'horloge des tâches, pas par `finished` : un onglet dont le
       compositeur dort ne finit jamais son animation, et la couche resterait. */
    window.setTimeout(function () { couche.remove(); }, DUREE + 60);
  }
  document.addEventListener('pointerdown', effetAuClic, true);
  window.llCurseur.EFFETS = EFFETS;
}());
