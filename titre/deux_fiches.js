/*
 * deux_fiches.js — LES DEUX FICHES EN PLEIN ÉCRAN (S1386 · V-T5, note 213 ③).
 *
 * Phrase : *« Au Vault, je clique le portrait d'un personnage : ses deux
 * fiches, recto et verso, côte à côte en plein écran sur fond noir ; ‹ › pour
 * passer au suivant, Échap pour fermer. Même geste au choix du personnage. »*
 *
 * Un script classique, chargé par les DEUX pages (le titre et le jeu), comme
 * `profil.js` : une seule vue, deux appelants — le portrait du Vault
 * (`ecran_titre.html`, `#hero .shot`) et la fiche du select (`main.ts`,
 * `blocFicheDeSélection`).
 *
 * Les fiches sont à leur taille NATIVE au plus (1414 × 2000) : réduites pour
 * tenir à l'écran, jamais agrandies. Échap est pris en CAPTURE et arrêté : il
 * ferme la vue sans faire aussi « retour » sur l'écran d'en dessous.
 */
(function () {
  'use strict';
  var vue = null, liste = [], rang = 0;

  function style() {
    if (document.getElementById('deux-fiches-style')) { return; }
    var s = document.createElement('style');
    s.id = 'deux-fiches-style';
    s.textContent =
      '#deux-fiches{position:fixed;inset:0;z-index:2147483000;background:#000;display:flex;' +
      'align-items:center;justify-content:center;gap:1.2vw;padding:2vh 4.5vw;box-sizing:border-box}' +
      '#deux-fiches img{display:block;height:auto;width:auto;max-height:96vh;max-width:44vw;' +
      'max-height:min(96vh,2000px);max-width:min(44vw,1414px);object-fit:contain;flex:0 1 auto}' +
      '#deux-fiches button{all:unset;cursor:pointer;position:absolute;top:50%;transform:translateY(-50%);' +
      'font:400 7vh/1 Georgia,serif;color:#e9e4d8;opacity:.55;padding:1vh 1vw}' +
      '#deux-fiches button:hover,#deux-fiches button:focus-visible{opacity:1}' +
      '#deux-fiches .prec{left:.6vw}#deux-fiches .suiv{right:.6vw}' +
      '#deux-fiches .x{top:2.4vh;right:1.2vw;transform:none;font:400 3.4vh/1 ui-monospace,monospace}' +
      '#deux-fiches .nom{position:absolute;left:0;right:0;bottom:1.2vh;text-align:center;' +
      'font:400 1.6vh/1 ui-monospace,monospace;letter-spacing:.3em;text-transform:uppercase;color:#8d8578}';
    document.head.appendChild(s);
  }

  function nomDe(id) {
    return id.replace(/_/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function peins() {
    var id = liste[rang];
    var imgs = vue.querySelectorAll('img');
    imgs[0].src = '/art/personnages/fiches/' + id + '.webp';
    imgs[1].src = '/art/personnages/versos/' + id + '.webp';
    vue.querySelector('.nom').textContent = nomDe(id) + ' · ' + (rang + 1) + ' / ' + liste.length;
  }

  function pas(d) { rang = (rang + d + liste.length) % liste.length; peins(); }

  function ferme() {
    if (vue !== null) { vue.remove(); vue = null; }
    document.removeEventListener('keydown', clavier, true);
  }

  function clavier(e) {
    if (vue === null) { return; }
    if (e.key === 'Escape') { ferme(); }
    else if (e.key === 'ArrowLeft') { pas(-1); }
    else if (e.key === 'ArrowRight') { pas(1); }
    else { return; }
    e.preventDefault(); e.stopImmediatePropagation();
  }

  /* `ids` : la file des personnages (ids du jeu, `the_cook`) ; `i` : celui qu'on ouvre. */
  function ouvre(ids, i) {
    if (!ids || ids.length === 0) { return; }
    ferme();
    style();
    liste = ids.slice();
    rang = Math.max(0, Math.min(liste.length - 1, i | 0));
    vue = document.createElement('div');
    vue.id = 'deux-fiches';
    vue.setAttribute('role', 'dialog');
    vue.setAttribute('aria-label', 'the two character sheets');
    vue.innerHTML = '<img alt="front sheet"><img alt="back sheet">' +
      '<button type="button" class="prec" aria-label="previous">‹</button>' +
      '<button type="button" class="suiv" aria-label="next">›</button>' +
      '<button type="button" class="x" aria-label="close">✕</button><div class="nom"></div>';
    vue.querySelector('.prec').addEventListener('click', function (e) { e.stopPropagation(); pas(-1); });
    vue.querySelector('.suiv').addEventListener('click', function (e) { e.stopPropagation(); pas(1); });
    vue.querySelector('.x').addEventListener('click', function (e) { e.stopPropagation(); ferme(); });
    Array.prototype.forEach.call(vue.querySelectorAll('img'), function (im) {
      im.addEventListener('error', function () { im.style.visibility = 'hidden'; });
      im.addEventListener('load', function () { im.style.visibility = ''; });
    });
    document.body.appendChild(vue);
    document.addEventListener('keydown', clavier, true);
    peins();
  }

  window.LLDeuxFiches = { ouvre: ouvre, ferme: ferme, ouverte: function () { return vue !== null; } };
})();
