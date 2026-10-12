/*
 * bannieres.js — note 270 (1) : les PLAYER BANNERS de Croze (ASSETS/BANN NICKNAME),
 * PLAYER_BANNER.md 1-2 : la PLAQUE peinte sous le pseudo ; le texte (et le grade) sont
 * poses PAR-DESSUS, jamais peints dans l'asset.
 *
 * CALQUE LEGER, JETABLE (« Croze n'est pas sur qu'elles restent ») : ce module + le
 * dossier public/art/banners/ (detoure par tools/bannieres_pseudo.py). Les retirer =
 * supprimer les deux et la balise <script> de ecran_titre.html ; rien d'autre n'en depend.
 *
 * La plaque montree : `profil.equipe.banniere` si elle existe au registre, sinon
 * « originale ». Aucun achat, aucun rayon : PLAYER_BANNER 6 (rayon FRAMES) attend le mot
 * de Croze.
 */
(function () {
  var ID_PAR_DEFAUT = 'originale';
  var CONNUES = ['originale', 'originale_alt', 'fire', 'chaos', 'arcane', 'poison', 'stone'];

  function style() {
    if (document.getElementById('llb-style')) return;
    var s = document.createElement('style');
    s.id = 'llb-style';
    s.textContent =
      '.llb-plaque{display:inline-block;background-position:center;background-size:100% 100%;' +
      'background-repeat:no-repeat;padding:1.15cqh 2.6cqw 1.25cqh 2.6cqw;' +
      'color:#efece3 !important;text-shadow:0 .15cqh .35cqh #000,0 0 .2cqh #000}';
    document.head.appendChild(s);
  }

  function choisie() {
    try {
      var p = window.LLProfil ? window.LLProfil.lis() : null;
      var id = p && p.equipe ? p.equipe.banniere : null;
      if (typeof id === 'string' && CONNUES.indexOf(id) >= 0) return id;
    } catch (e) { /* profil illisible : la plaque par defaut */ }
    return ID_PAR_DEFAUT;
  }

  /* Pose la plaque derriere un element de texte (le pseudo). */
  function pose(el, id) {
    if (!el) return;
    style();
    var b = typeof id === 'string' && CONNUES.indexOf(id) >= 0 ? id : choisie();
    el.classList.add('llb-plaque');
    el.style.backgroundImage = 'url(/art/banners/' + b + '.webp)';
    el.dataset.banniere = b;
  }

  window.LLBannieres = { pose: pose, choisie: choisie, connues: CONNUES.slice() };
})();
