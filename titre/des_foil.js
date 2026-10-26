/*
 * des_foil.js — LES DÉS FOIL (S1550 · note 385 ② (b), MONNAIE §32 (b)).
 *
 * Phrase de Croze : « au grade 10, mes dés brillent. » Chaque set de dés possédé a une variante foil —
 * reflets, bords lumineux, MÊMES faces — déverrouillée au grade 10 (ⓡ), et le choix foil / normal se fait
 * au Vault (tiroir du set : FOIL · ON / OFF).
 *
 * ⚑ RÈGLE 328 bis : jamais un dé peint par un modèle. Le foil est PROCÉDURAL : une feuille de style posée
 * sur les RENDUS du jeu (`/dice/<peau>/…`, faces et bandes), comme le reflet des cartes Foil (`foils.js`) —
 * aucun nœud ajouté au DOM du jeu (`render()` greffe l'ancien DOM, un nœud ajouté de dehors serait arraché).
 *
 * Le grade vient du moteur (`profil.grade`, écrit en fin de partie depuis `GAME_ENDED.grades`) ; le choix
 * vit au profil (`options.desFoil` : les peaux mises en foil). Chargé par le titre ET par le jeu, après
 * `profil.js`.
 */
(function () {
  'use strict';

  /* MONNAIE §32 (b), note 385 ② : « déverrouillée au grade 10 (ⓡ) ». */
  var GRADE_DU_FOIL = 10;
  var ID = /^[a-z0-9_]+$/;

  function profil() {
    try { return window.LLProfil ? window.LLProfil.lis() : null; } catch (e) { return null; }
  }
  function grade(p) { return p && typeof p.grade === 'number' && isFinite(p.grade) ? p.grade : 1; }
  function debloque() { return grade(profil()) >= GRADE_DU_FOIL; }
  function choisies(p) {
    var l = p && p.options && Array.isArray(p.options.desFoil) ? p.options.desFoil : [];
    return l.filter(function (x) { return typeof x === 'string' && ID.test(x); });
  }
  function actif(peau) { return debloque() && choisies(profil()).indexOf(peau) >= 0; }

  var BASE =
    '@keyframes ll-de-foil{' +
    '0%,100%{filter:drop-shadow(0 0 1px rgba(255,244,200,.95)) drop-shadow(0 0 5px rgba(170,215,255,.55)) saturate(1.2) brightness(1.04)}' +
    '33%{filter:drop-shadow(0 0 2px rgba(255,250,225,1)) drop-shadow(0 0 9px rgba(255,170,235,.6)) saturate(1.45) brightness(1.16) hue-rotate(10deg)}' +
    '66%{filter:drop-shadow(0 0 2px rgba(235,255,240,1)) drop-shadow(0 0 8px rgba(160,255,215,.55)) saturate(1.35) brightness(1.1) hue-rotate(-10deg)}}';

  function regles() {
    if (!debloque()) return '';
    return choisies(profil()).map(function (peau) {
      var s = '/dice/' + peau + '/';
      return 'img[src*="' + s + '"],[style*="' + s + '"]{animation:ll-de-foil 2.8s ease-in-out infinite}';
    }).join('');
  }

  function pose() {
    var st = document.getElementById('ll-des-foil');
    if (st === null) {
      st = document.createElement('style');
      st.id = 'll-des-foil';
      (document.head || document.documentElement).appendChild(st);
    }
    var r = regles();
    st.textContent = r === '' ? '' : BASE + r;
  }

  function bascule(peau) {
    if (!ID.test(String(peau)) || !debloque() || !window.LLProfil) return false;
    window.LLProfil.modifie(function (p) {
      p.options = p.options || {};
      var l = choisies(p);
      var k = l.indexOf(peau);
      if (k >= 0) l.splice(k, 1); else l.push(peau);
      p.options.desFoil = l;
    });
    pose();
    return true;
  }

  window.LLDesFoil = { GRADE: GRADE_DU_FOIL, debloque: debloque, actif: actif, bascule: bascule, pose: pose };
  pose();
  /* un autre onglet (le titre) a changé le choix : la partie le suit */
  window.addEventListener('storage', function (e) { if (e.key === null || /profil/.test(String(e.key))) pose(); });
}());
