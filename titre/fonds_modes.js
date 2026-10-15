/*
 * fonds_modes.js — UN FOND AU HASARD À CHAQUE PARTIE, DANS LE LOT DE SON MODE
 * (S1450 · note 311 ①, DA_FONDS 14/10 nuit).
 *
 * Phrase de Croze (R3) : « Je lance trois parties VS BOTS : trois fonds différents ;
 * un Today's Dungeon tire dans les fonds du Today's. »
 *
 * Verbatim : « j'ai rajouté les fonds pour les autres modes genre today's dungeon et
 * DUNGEON PRO TOUR, et sinon tu n'as qu'à faire un carrousel pour voir ce qu'il y a de
 * mieux, chaque partie y a un nouveau fond randomisé par exemple. »
 *
 * Les lots viennent de `ASSETS\FONDS ALTERNATIF\` (déposés le 14/10, 23:29-23:58) et de
 * `ASSETS\BOUNTY WALL\` (les textures du 09/10) ; les murs du dépôt des grades
 * (`ASSETS\ASSETS\murs\`, 15/10 00:35) sont écartés — « ceux ci sont ratés » (312 ⑤).
 * Le rangement par mode est le mien, à la ressemblance des prompts de DA_FONDS (12/10) :
 * Croze retire ce qui ne marche pas, la liste est au rapport.
 *
 * La règle : à chaque tirage, un fichier du lot, JAMAIS le même que le tirage d'avant du
 * même lot quand le lot en compte deux ou plus (le dernier est gardé dans le navigateur ;
 * s'il ne peut pas l'être, le tirage reste au hasard). Le Pro Tour garde ses lots fermés
 * tant que `LL_DPT_ENDORMI` (aucune partie ne s'y lance).
 */
(function () {
  'use strict';
  var R = '/art/da/fonds/';
  var LOTS = {
    bots: ['bots/mur_bleu.webp', 'bots/mur_brun.webp', 'bots/mur_sanglant.webp'],
    daily: ['daily/mur_mousse_torches.webp', 'daily/mur_mousse.webp', 'daily/clair_de_lune.webp'],
    protour: ['protour/salle_aux_braseros.webp'],
    protour_vip: ['protour_vip/coffin_lounge.webp'],
    bounty: ['bounty/mur_peint.webp', 'bounty/planche_1.webp', 'bounty/planche_2.webp']
  };
  var CLE = 'll.fond.dernier.';

  /* Tire un fond du lot ; `extra` (facultatif) entre dans le lot (le fond déjà choisi d'un panneau). */
  function tire(lot, extra) {
    var l = (LOTS[lot] || []).map(function (f) { return R + f; });
    if (typeof extra === 'string' && extra !== '' && l.indexOf(extra) < 0) { l.push(extra); }
    if (l.length === 0) { return null; }
    var avant = null;
    try { avant = localStorage.getItem(CLE + lot); } catch (e) { /* stockage refusé : hasard simple */ }
    var possibles = l.length > 1 ? l.filter(function (f) { return f !== avant; }) : l;
    var f = possibles[Math.floor(Math.random() * possibles.length)];
    try { localStorage.setItem(CLE + lot, f); } catch (e) { /* idem */ }
    return f;
  }

  /* Le jeu (index.html) : le mode se lit dans l'adresse que le HOME a posée
     (`?daily=<graine>` pour Today's Dungeon ; sinon VS BOTS). Un tirage par chargement. */
  function poseLeFondDeLaPartie() {
    var q = new URLSearchParams(window.location.search);
    var lot = (q.get('daily') || '').trim() !== '' ? 'daily' : 'bots';
    var f = tire(lot);
    if (f === null) { return null; }
    var h = document.documentElement;
    h.style.setProperty('--da-fond-partie', 'url("' + f + '")');
    h.classList.add('da-fond-partie');
    h.dataset.fondLot = lot;
    return f;
  }

  window.LLFonds = { LOTS: LOTS, tire: tire, poseLeFondDeLaPartie: poseLeFondDeLaPartie };
})();
