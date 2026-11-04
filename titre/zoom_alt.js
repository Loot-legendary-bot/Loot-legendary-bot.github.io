/* S1643 - note 478 (2), suite de S1642 : Alt + survol = la carte en plein cadre, AUSSI au VAULT et au CODEX
 * (la page du HOME est un autre fichier que la table : l'ecouteur de src/main.ts n'y vit pas).
 * Meme geste que sur la table : Alt enfonce -> la plus grande image de la carte survolee, a la hauteur de
 * l'ecran, par-dessus tout ; Alt relache (ou la fenetre qui perd le focus) -> refermee. Une carte du CODEX
 * jamais vue (dos, sans image) ne s'ouvre pas : on ne devoile rien. */
(function () {
  var SEL = '.cx-carte.vu, .cx-zoom, #v-collection #grid > *, #v-collection #hero, #v-collection #roster > *';
  var st = document.createElement('style');
  st.textContent = '.zoom-alt{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;' +
    'justify-content:center;background:rgba(0,0,0,.72);pointer-events:none}' +
    '.zoom-alt>img{height:94vh;width:auto;max-width:94vw;object-fit:contain;border-radius:14px;' +
    'box-shadow:0 10px 60px rgba(0,0,0,.9)}';
  document.head.appendChild(st);
  var ouvert = null;
  function ferme() { if (ouvert) { ouvert.remove(); ouvert = null; } }
  function ouvre() {
    var survoles = document.querySelectorAll(':hover');
    var sous = survoles.length ? survoles[survoles.length - 1] : null;
    var carte = sous && sous.closest ? sous.closest(SEL) : null;
    if (!carte) return;
    var meilleure = null, aire = 0;
    var imgs = carte.tagName === 'IMG' ? [carte] : carte.querySelectorAll('img');
    for (var i = 0; i < imgs.length; i++) {
      var r = imgs[i].getBoundingClientRect(), a = r.width * r.height;
      if (imgs[i].src && a > aire) { aire = a; meilleure = imgs[i]; }
    }
    var src = meilleure ? (meilleure.currentSrc || meilleure.src) : null;
    if (!src) {
      /* le Vault peint ses dos de carte et ses tapis en FOND (background-image), pas en <img> */
      var peints = [carte].concat([].slice.call(carte.querySelectorAll('*')));
      for (var j = 0; j < peints.length && !src; j++) {
        var m = /url\(["']?([^"')]+\/art\/[^"')]+)["']?\)/.exec(getComputedStyle(peints[j]).backgroundImage);
        if (m) src = m[1];
      }
    }
    if (!src) return;
    ferme();
    var fond = document.createElement('div');
    fond.className = 'zoom-alt';
    var img = document.createElement('img');
    img.src = src;
    img.alt = '';
    fond.appendChild(img);
    document.body.appendChild(fond);
    ouvert = fond;
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Alt') return;
    e.preventDefault();
    if (e.repeat && ouvert) return;
    ouvre();
  });
  document.addEventListener('keyup', function (e) { if (e.key === 'Alt') { e.preventDefault(); ferme(); } });
  window.addEventListener('blur', ferme);
})();
