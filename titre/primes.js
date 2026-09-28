/*
 * primes.js — LES MISSIONS DU BOUNTY WALL (S1303 · B-2, note 183).
 *
 * Phrase : *« Chaque mission a un avancement qui bouge quand je joue (x/N), et
 * quand je la finis, la récompense tombe dans mon profil et la mission se marque
 * faite. »*
 *
 * ⚑ UNE SEULE LISTE, lue par le titre (`ecran_titre.html`, le mur) ET par le jeu
 * (`main.ts`, qui fait avancer les missions sur les faits publiés). Elle était
 * écrite en dur dans le titre (`NODES`, avec des états « done / open / lock »
 * figés) : l'avancement vit maintenant dans le profil (`profil.bounty`), et
 * l'état se DÉDUIT — faite si le profil le dit, ouverte si c'est une racine ou
 * si une mission qui y mène est faite, verrouillée sinon.
 *
 * Les primes en dents : `Q-B1` (64 → 224). Les récompenses qui ne sont pas des
 * dents (un set de dés, un curseur, un personnage) sont MARQUÉES gagnées dans
 * `profil.bounty` : le Vault ne garde pas encore ce qu'on possède (ligne de
 * file, dite au rapport).
 */
(function () {
  'use strict';
  var MISSIONS = [
    { id: 'first_draw',    x: 6,  y: 50, ic: 'tile',   t: 'First draw',    o: 'Draw your first tile.',             dents: 64,  N: 1 },
    { id: 'first_blood',   x: 19, y: 50, ic: 'blade',  t: 'First blood',   o: 'Win a combat.',                     dents: 96,  N: 1 },
    { id: 'get_out',       x: 32, y: 50, ic: 'boot',   t: 'Get out',       o: 'Flee a combat.',                    dents: 128, N: 1 },
    { id: 'pockets',       x: 48, y: 20, ic: 'chest',  t: 'Pockets',       o: 'Open a chest.',                     dents: 160, N: 1 },
    { id: 'merchant',      x: 65, y: 12, ic: 'coin',   t: 'Merchant',      o: 'Buy an item from a merchant.',      dents: 192, N: 1 },
    { id: 'full_set',      x: 83, y: 22, ic: 'shield', t: 'Full set',      o: 'Wear five pieces of the Gold Set.', recompense: 'Dice set: Gilt', N: 1 },
    { id: 'reaction',      x: 48, y: 50, ic: 'bolt',   t: 'Reaction',      o: 'Play a reaction outside your turn.', dents: 160, N: 1 },
    { id: 'signature',     x: 65, y: 50, ic: 'sigil',  t: 'Signature',     o: 'Resolve your signature ability.',   dents: 192, N: 1 },
    { id: 'executioner',   x: 83, y: 50, ic: 'skull',  t: 'Executioner',   o: 'Kill a Sub-Boss.',                  recompense: 'Cursor: Oxblood smear', N: 1 },
    { id: 'ticking',       x: 48, y: 80, ic: 'glass',  t: 'Ticking',       o: 'Survive to round 8.',               dents: 160, N: 1 },
    { id: 'deadline',      x: 65, y: 88, ic: 'door',   t: 'Deadline',      o: 'Finish a Run alive.',               dents: 224, N: 1 },
    { id: 'last_standing', x: 83, y: 78, ic: 'crown',  t: 'Last standing', o: 'Win a Final Duel.',                 recompense: 'Character: The Necromancer', N: 1 }
  ];
  var LIENS = [[0,1],[1,2],[2,3],[3,4],[4,5],[2,6],[6,7],[7,8],[2,9],[9,10],[10,11]];

  function suivi(profil, id) {
    var b = profil && profil.bounty && profil.bounty[id];
    return (b && typeof b === 'object') ? b : { avance: 0, faite: false, vus: [] };
  }

  /* L'état de chaque mission, déduit du profil. */
  function etats(profil) {
    var faites = MISSIONS.map(function (m) { return suivi(profil, m.id).faite === true; });
    return MISSIONS.map(function (m, i) {
      var entrees = LIENS.filter(function (l) { return l[1] === i; });
      var ouverte = entrees.length === 0 || entrees.some(function (l) { return faites[l[0]]; });
      var s = faites[i] ? 'done' : (ouverte ? 'open' : 'lock');
      var su = suivi(profil, m.id);
      return {
        id: m.id, x: m.x, y: m.y, ic: m.ic, t: m.t, o: m.o, N: m.N,
        r: typeof m.dents === 'number' ? (m.dents + ' teeth') : m.recompense,
        s: s, avance: Math.min(m.N, Number(su.avance) || 0)
      };
    });
  }

  /* Un pas de mission, sur le profil qu'on lui passe (appelé DANS
     `LLProfil.modifie`). `cle` = l'empreinte du fait (graine|seq) : un même
     fait ne compte jamais deux fois. Rend `true` si la mission vient d'être
     FAITE (sa prime est alors créditée). Une mission verrouillée n'avance pas. */
  function avance(profil, id, cle) {
    var i = -1;
    for (var k = 0; k < MISSIONS.length; k++) if (MISSIONS[k].id === id) i = k;
    if (i === -1) return false;
    if (etats(profil)[i].s !== 'open') return false;
    var m = MISSIONS[i];
    if (!profil.bounty || typeof profil.bounty !== 'object') profil.bounty = {};
    var su = suivi(profil, id);
    su.vus = Array.isArray(su.vus) ? su.vus : [];
    if (su.vus.indexOf(cle) !== -1) return false;
    su.vus.push(cle);
    su.avance = Math.min(m.N, (Number(su.avance) || 0) + 1);
    var vientDEtreFaite = su.avance >= m.N && su.faite !== true;
    if (vientDEtreFaite) {
      su.faite = true;
      if (typeof m.dents === 'number') profil.dents = (Number(profil.dents) || 0) + m.dents;
      else su.recompense = m.recompense;
    }
    profil.bounty[id] = su;
    return vientDEtreFaite;
  }

  window.LLPrimes = { MISSIONS: MISSIONS, LIENS: LIENS, etats: etats, avance: avance };
})();
