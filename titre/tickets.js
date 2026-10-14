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
  var PRIX = { dpl: 500, daily: 50 };            /* note 269 ② : MONNAIE §20 gravé (était 128 / 32) */

  /* [nom, perso imposé, conditions, objectif, compteurs du mur] — TICKETS §2.
     Note 202 (#47 E, « parfois le perso n'est pas imposé ») : `null` = perso LIBRE
     (La Course, Le Dernier Debout, Gold Rush, Chasse au Boss) — on vient avec le sien. */
  var SCENARIOS = [
    ['Night of the Skeletons', 'The Necromancer', 'Every mob drawn is a skeleton', 'Kill 5 skeletons and get out', 'Skeletons killed · Frost damage'],
    ['The Arsonist', 'The Wizard', 'All-Ruins dungeon · school forced: Fire', 'Deal 60 Fire damage before the first Collapse', 'Fire damage · WIS-based damage'],
    ['The Crossing', 'The Whiff', 'You cannot attack a mob — only flee', 'Get out alive with 3+ cards in hand', 'Successful flees'],
    ['Double Time', null, 'The Dungeon Timer runs twice as fast', 'Extract before turn 6', 'Successful extractions'],
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
  /* S1413 · DD-2 (notes 226 ⑥, 233 ②) — LE DAILY TOURNE SUR LA SEMAINE, plus sur
     les douze : `DAILY_DUNGEON.md` §0 ⑦ et §4 (un scénario par jour de la
     semaine, la semaine 1 ouvre le lundi 12/10/2026). Les douze restent au DPL.
     [jour UTC (0 = dimanche), id, nom, perso (id ou null), conditions (jetons
     §2, TELS QUE le moteur les lit), ce que l'enveloppe en dit, objectif, mur]. */
  var SEMAINE = [
    [1, 'la_course', 'Double Time', null, ['TIMER_X2'],
      'The Dungeon Timer runs twice as fast', 'Extract before turn 6', 'Successful extractions'],
    [2, 'nuit_des_squelettes', 'Night of the Skeletons', 'the_necromancer',
      ['MOB_POOL(skeleton_duellist,skeleton_archer,longleg_skeleton,skeleton_elite,zombie,mummy)'],
      'Every normal mob drawn is undead', 'Kill 2 of them and get out', 'Skeletons killed · Frost damage'],
    [3, 'sang_pour_sang', 'Blood for Blood', 'the_vampire', ['DAMAGE_X2(CHAOS)'],
      'Chaos damage is doubled, for everyone', 'Deal 100 Chaos damage', 'Chaos damage'],
    [4, 'le_dernier_debout', 'Last One Standing', null, ['NO_PORTAL'],
      'No portal ever opens: nobody gets out', 'Be the last alive when the run ends', 'Damage taken · Collapses survived'],
    [5, 'triple_un', 'Triple One', 'the_robert', ['NATURAL_ONE_SCORES'],
      'Every natural 1 is worth +1 point', 'Roll three natural 1s', 'Natural 1s rolled'],
    [6, 'le_facteur', 'The Postman', 'the_mailman',
      ['STARTING_HAND(squire_spa_convocation_common,arena_invitation_common,squire_spa_convocation_uncommon)'],
      'Three Convocations in hand at the start', 'Play all three and get out', 'Convocations used'],
    [0, 'le_pyromane', 'The Arsonist', 'the_wizard', ['TILE_DECK:RUINS', 'SCHOOL(FIRE)'],
      'All-Ruins dungeon · school forced: Fire', 'Deal 60 Fire damage before turn 4', 'Fire damage · WIS-based damage']
  ];
  /* S1414 · DD-2 bis (note 235 ⑤) — LA TABLE EST CELLE DU DÉFI, pas un choix
     (`DAILY_DUNGEON.md` §0 ③, §4 colonne « table » ⓡ). 2V2 = quatre sièges, deux
     camps (moi + un bot contre deux bots). Le moteur n'a pas encore
     `Scenario.table` (note moteur 181) : l'écran pose la table par les portes
     qui existent (`poserLesSiègesAvantLaPartie`, `poserLesCampsAvantLaPartie`). */
  var TABLES = {
    la_course: { sieges: 5, mode: 'FFA' }, nuit_des_squelettes: { sieges: 4, mode: 'FFA' },
    sang_pour_sang: { sieges: 4, mode: '2V2' }, le_dernier_debout: { sieges: 5, mode: 'FFA' },
    triple_un: { sieges: 3, mode: 'FFA' }, le_facteur: { sieges: 4, mode: '2V2' },
    le_pyromane: { sieges: 4, mode: 'FFA' }
  };
  /* S1418 · CX-4 (note 239 ②) — L'OBJECTIF DANS LA GRAPHIE DU MOTEUR
     (`scenario.ts::lireObjectif`), mot pour mot la colonne « objectif » de
     `DAILY_DUNGEON.md` §4 : le moteur le JUGE au `GAME_END` et publie
     `GAME_ENDED.daily.reussi` — c'est ce RÉUSSI / RATÉ que le CODEX range.
     LAST_ALIVE et NATURAL_ONES n'ont pas encore de lecteur : `main.ts` essaie,
     et retombe sur « en attente du moteur » si le moteur refuse. */
  var OBJECTIFS = {
    la_course: { kind: 'EXTRACT', avant_tour: 6 },
    nuit_des_squelettes: { kind: 'KILLS', mobs: ['skeleton_duellist', 'skeleton_archer', 'longleg_skeleton',
      'skeleton_elite', 'zombie', 'mummy'], n: 2, et: 'EXTRACT' },
    sang_pour_sang: { kind: 'DAMAGE_DEALT', ecole: 'CHAOS', n: 100 },
    le_dernier_debout: { kind: 'LAST_ALIVE' },
    triple_un: { kind: 'NATURAL_ONES', n: 3 },
    le_facteur: { kind: 'CARDS_PLAYED', cards: ['squire_spa_convocation_common', 'arena_invitation_common',
      'squire_spa_convocation_uncommon'], n: 3, et: 'EXTRACT' },
    le_pyromane: { kind: 'DAMAGE_DEALT', ecole: 'FIRE', n: 60, avant_tour: 4 }
  };
  function tableEnClair(t) {
    return t.mode === '2V2' ? '2 vs 2 — you and a bot against two bots'
      : 'Free-for-all — ' + t.sieges + ' players, you + ' + (t.sieges - 1) + ' bots';
  }
  /* le nom en clair, tel que le catalogue l'écrit (`characters.json`) */
  var NOMS = { the_necromancer: 'The Necromancer', the_vampire: 'The Vampire', the_robert: 'The Robert',
    the_mailman: 'The Mailman', the_wizard: 'The Wizard' };
  /* Les jetons que le moteur LIT aujourd'hui (`scenario.ts::lireCondition`,
     palier 825) ; les autres LÈVENT, et le jeu joue le jour sans eux. ⚠ Liste
     écrite à la main : elle grandit avec DD-1 bis ③ — le jeu, lui, ESSAIE le
     moteur (`main.ts`, porte `?daily=`) et ne dépend pas de cette ligne. */
  var LUS = ['TIMER_X2', 'MOB_POOL'];
  function lu(j) { return LUS.indexOf(/^[A-Z_0-9]+/.exec(j)[0]) >= 0; }
  /* §0 ④ — la graine est la date UTC écrite en entier, AAAAMMJJ. */
  function graineUTC(date) {
    return String(date.getUTCFullYear()) + deux(date.getUTCMonth() + 1) + deux(date.getUTCDate());
  }
  function duJour(date) {
    /* S1425 · DD-2 bis (note 251 ②) — à partir du premier jour tiré (`daily.json`
       `debut`), le défi est celui du GÉNÉRATEUR DU MOTEUR (`src/defi_du_jour.ts`,
       `window.LLDefi`). Avant, la semaine écrite à la main ci-dessus. */
    if (window.LLDefi) {
      try {
        var g = window.LLDefi.duJour(date || undefined);
        if (g) { g.prix = PRIX.daily; return g; }
      } catch (e) { console.error('Daily: the engine generator failed', e); }
    }
    date = date || new Date();
    var j = date.getUTCDay();
    var s = SEMAINE.filter(function (x) { return x[0] === j; })[0];
    return { genre: 'daily', id: s[1], nom: s[2], persoId: s[3], perso: s[3] === null ? null : NOMS[s[3]], jetons: s[4].slice(), enAttente: !s[4].every(lu),
      conditions: s[5], objectif: s[6], objectifMoteur: OBJECTIFS[s[1]] || null, mur: s[7], seed: graineUTC(date), runs: 1,
      table: TABLES[s[1]], tableEnClair: tableEnClair(TABLES[s[1]]),
      prime: 64, prix: PRIX.daily };
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

  window.LLTickets = { PRIX: PRIX, SCENARIOS: SCENARIOS, SEMAINE: SEMAINE,
    duJour: duJour, deLaSemaine: deLaSemaine, enPoche: enPoche, achete: achete };
})();
