/*
 * tickets.js — LES TICKETS DU VAULT (note 201 ⑤, `docs/TICKETS.md` §1 et §2).
 *
 * Phrase : *« Au Vault j'ouvre l'enveloppe d'un ticket avant de l'acheter : elle
 * me dit la seed, l'objectif, les conditions, le personnage imposé et ce que ça
 * fait avancer sur le Bounty Wall. »*
 *
 * Deux tickets, en DENTS seulement (MONNAIE §5 — jamais en Sang) :
 * DUNGEON PRO LEAGUE (128 ⓡ, la seed de la SEMAINE, partie classée) et DAILY
 * DUNGEON (32 ⓡ, la seed du JOUR). Le scénario vient des douze de §2 :
 * le Daily tourne un par jour (douze jours sans doublon, donc jamais deux fois
 * dans la semaine) ; le DPL est choisi le lundi pour toute la semaine.
 * La seed se lit sur la date : AAAAMMJJ pour le jour, AAAA·SS pour la semaine.
 *
 * ⚠ Le ticket acheté se GARDE dans le profil (`tickets.dpl`, `tickets.daily`) :
 * le jouer passe par la partie classée (BW-5, « Find match » pas encore ouvert).
 */
(function () {
  'use strict';
  var PRIX = { dpl: 128, daily: 32 };            /* #45 D « ok » · #47 C ⓡ */

  /* [nom, perso imposé, conditions, objectif, compteurs du mur] — TICKETS §2.
     Note 202 (#47 E, « parfois le perso n'est pas imposé ») : `null` = perso LIBRE
     (La Course, Le Dernier Debout, Gold Rush, Chasse au Boss) — on vient avec le sien. */
  var SCENARIOS = [
    ['Night of the Skeletons', 'The Necromancer', 'Every mob drawn is a skeleton', 'Kill 5 skeletons and get out', 'Skeletons killed · Frost damage'],
    ['The Arsonist', 'The Wizard', 'All-Ruins dungeon · school forced: Fire', 'Deal 60 Fire damage before the first Collapse', 'Fire damage · WIS-based damage'],
    ['The Crossing', 'The Whiff', 'You cannot attack a mob — only flee', 'Get out alive with 3+ cards in hand', 'Successful flees'],
    ['The Race', null, 'The Dungeon Timer runs twice as fast', 'Extract before turn 6', 'Successful extractions'],
    ['Feast', 'The Cook', 'Every draw gives one more consumable', 'Use 8 consumables', 'Consumables used'],
    ['Last One Standing', null, 'No portal: nobody gets out', 'Be the last alive at the last Collapse', 'Damage taken · Collapses survived'],
    ['Gold Rush', null, 'Golden items are three times as common', 'Equip 5 golden items', 'Golden items equipped'],
    ['Locksmith', 'The Rogue', '8 locked tiles, keys everywhere', 'Open 4 locks with a key', 'Locks opened with a key'],
    ['Triple One', 'The Robert', 'Every natural 1 is worth +1 point', 'Finish with 3 points from 1s', 'Natural 1s rolled'],
    ['Boss Hunt', null, 'A Boss is placed on turn 1', 'Kill it', 'Bosses killed · Mobs killed'],
    ['Blood for Blood', 'The Vampire', 'Chaos damage is doubled', 'Deal 100 Chaos damage', 'Chaos damage'],
    ['The Postman', 'The Mailman', 'Three Convocations in hand at the start', 'Play all three and get out', 'Convocations used']
  ];

  function jourDe(date) {
    return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  }
  /* la semaine ISO : le lundi l'ouvre */
  function semaineDe(date) {
    var d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    var j = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - j);
    var an = d.getUTCFullYear();
    var n = Math.ceil(((d - Date.UTC(an, 0, 1)) / 86400000 + 1) / 7);
    return { an: an, n: n, lundi: jourDe(date) - ((date.getDay() || 7) - 1) };
  }
  function deux(n) { return (n < 10 ? '0' : '') + String(n); }
  function scenario(i, seed, genre) {
    var s = SCENARIOS[((i % 12) + 12) % 12];
    return { genre: genre, nom: s[0], perso: s[1], conditions: s[2], objectif: s[3], mur: s[4], seed: seed };
  }
  function duJour(date) {
    date = date || new Date();
    return scenario(jourDe(date), String(date.getFullYear()) + deux(date.getMonth() + 1) + deux(date.getDate()), 'daily');
  }
  function deLaSemaine(date) {
    date = date || new Date();
    var w = semaineDe(date);
    return scenario(Math.floor(w.lundi / 7), String(w.an) + '-W' + deux(w.n), 'dpl');
  }

  function enPoche(profil) {
    var t = profil && profil.tickets;
    return { dpl: t && typeof t.dpl === 'number' ? t.dpl : 0, daily: t && typeof t.daily === 'number' ? t.daily : 0 };
  }
  function achete(genre) {
    window.LLProfil.modifie(function (p) {
      if (typeof p.tickets !== 'object' || p.tickets === null) { p.tickets = { dpl: 0, daily: 0 }; }
      p.tickets[genre] = (typeof p.tickets[genre] === 'number' ? p.tickets[genre] : 0) + 1;
    });
  }
  /* S1373 · note 208 (§13.3) : LE DOUBLE et LE TRIPLE SERMENT n'existent plus — le PACTE
     (un seul esprit, ×3) les remplace, et il vit au mur (`bounty_wall.js`). */

  window.LLTickets = { PRIX: PRIX, SCENARIOS: SCENARIOS,
    duJour: duJour, deLaSemaine: deLaSemaine, enPoche: enPoche, achete: achete };
})();
