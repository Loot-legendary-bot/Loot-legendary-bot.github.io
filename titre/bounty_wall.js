/*
 * bounty_wall.js — LES EXPLOITS DU BOUNTY WALL (BW-4, notes 195 · 199 · 200 · 203, `docs/BOUNTY_WALL.md` §2, §2 bis, §9, §10).
 *
 * Phrase (note 203) : *« À l'entrée, je vois le sceau et les six esprits ; je
 * jure à l'un d'eux, sa pointe s'allume, et je vois ce qu'il me donnera. »*
 *
 * ⚑ UNE SEULE TABLE : les SEPT ESPRITS (note 203, §9–10) — six écoles aux six
 * pointes du sceau de Salomon, dans l'ordre LU SUR LA FICHE DU WIZARD (`pointe`
 * 0 = en haut, puis dans le sens des aiguilles), et le NEUTRE (le donjon) au
 * centre, invisible. Chaque rang = UN nœud, son compteur du profil et sa
 * récompense — un personnage (`p`), une peau de dé (`d`), un curseur (`u`), un
 * dos (`k`) ou l'Epic (`e`). Avant la note 203 : dix arbres de quatre nœuds
 * (S1359, §7) ; avant la note 202 : six troncs (S1347).
 *
 * ⚠ LES CLÉS DE COMPTEUR SONT CELLES DE L'ÉCRAN, PAS ENCORE CELLES DU MOTEUR :
 * BW-1 (note 154) n'a rien publié. Quand l'objet du `GAME_END` arrive, BW-3
 * somme ses clés dans `profil.compteurs` sous CES noms (une table de passage, à
 * un seul endroit). Deux compteurs ne se somment pas : la meilleure série de
 * victoires et le max de Signatures dans UNE partie (on garde le max, §2).
 *
 * ⚠ LE DOS D'UN ESPRIT (§10 ③) n'a pas de compteur du moteur : il tombe quand
 * on a servi l'esprit — tous les nœuds d'avant atteints. Son compteur est
 * `@servis` (calculé ICI, jamais écrit au profil), son seuil le nombre de nœuds
 * qui le précèdent.
 *
 * ⚠ LES EPIC (peaux à effets, §2 bis, une par esprit §9) ne sont pas encore
 * forgées : elles ne sont pas des nœuds tant qu'elles n'existent pas — le bout
 * de chaque branche le dit.
 */
(function () {
  'use strict';
  /* S1373 · note 208 (§13) — LE ×5 PORTAIT SUR LES SEUILS, PAS SUR LES PRIX.
     Les seuils de la table ci-dessous sont ceux de §13.1 ; les prix reviennent :
     un personnage 640 (#45 B), une peau de dé cinq fois son prix de Vault (Croze
     le garde : `FOIS`), un curseur ou un dos au prix du Vault. */
  var FOIS = 5;
  var PRIX_PERSO = 640;          /* #45 B · §13 (le ×5 de la note 206 est retiré) */
  var SERVIS = '@servis';

  /* S1373 · note 208 (§13.2) — LES OFFRANDES SONT DES CONSOMMABLES NOMMÉS.
     Une offrande s'offre à UN esprit éveillé et multiplie ce que sa branche gagne
     pendant SA durée ; sur une même branche, les multiplicateurs s'ADDITIONNENT
     (×2 + ×5 = ×7), chacune avec sa durée. Le SANG DE TROLL ne s'achète pas. */
  var OFFRANDES = {
    /* `art` : la carte du jeu qui porte déjà ce nom (`/art/cartes/`) */
    pomme: { x: 2, nom: 'The Apple', duree: 3, prix: 250, art: 'apple_common' },
    milk: { x: 5, nom: 'Troll Milk', duree: 10, prix: 1500, art: 'troll_milk_epic' },
    sang: { x: 10, nom: 'Troll Blood', duree: 5, prix: null, art: 'troll_blood_legendary' }
  };
  var SORTES = ['pomme', 'milk', 'sang'];
  /* un profil d'avant la note 208 porte les trois noms d'hier : ils se lisent
     sous leur nouveau nom (même rang, même rareté de drop) */
  var ANCIENNES = { offrande: 'pomme', 'super': 'milk', divine: 'sang' };
  function sorteDe(s) { return OFFRANDES[s] ? s : (ANCIENNES[s] || null); }

  /* S1373 · note 208 (§13.3) — LE PACTE remplace le serment, le double et le
     triple serment, et le « ¼ » : UN seul esprit, sa branche ×3 pour toujours ;
     les autres comptent ×1. Le premier pacte est gratuit ; en changer (rompre
     l'ancien) coûte ROMPRE dents, avec une confirmation. */
  var PACTE = 3;
  var ROMPRE = 500;              /* §13.3 ⓡ : « le prix d'un perso, peut-être un peu moins » */

  function p(a, id, nom) { return { a: a, p: id, nom: nom }; }
  function d(a, id, nom) { return { a: a, d: id, nom: nom }; }
  /* S1356 · BW-4 bis (note 201 ④) : un curseur (`u`) ou un dos de carte (`k`) au bout d'un rang. */
  function u(a, id, nom) { return { a: a, u: id, nom: nom }; }
  function k(a, id, nom) { return { a: a, k: id, nom: nom }; }
  function rg(c, l, noeuds) { return { c: c, l: l, noeuds: noeuds }; }

  /* S1361 · note 203 (#48, BOUNTY_WALL §9–10) — LES SEPT ESPRITS. Les nœuds de
     Croze dans son ordre (§9), The Green au FEU entre le Cook et la peau sang
     (§10 ①), The Golmon au GIVRE (§10 ①), le dos de l'esprit à l'avant-dernier
     nœud (§10 ③), l'Epic au bout (`epic`, hors barre). ⌂ curseurs (PROPOSÉS —
     Q-BW4TER-CURSEURS) : Wizard à l'Arcane (inchangé), Torch à la Foudre,
     Legendary au Neutre (la ligue) ; Collapse n'a plus de place. */
  /* S1373 · note 208 (§13.1) — LES SEUILS ×5, arrondis au rond supérieur (la
     table de §13.1 fait foi : granite 150, curseur Torch 150). Trois exploits ne
     se multiplient pas : le suicide (1), la série de victoires (5), les
     Signatures dans UNE partie (10) — et le rang DPL. */
  var TRONCS = [
    { id: 'arcane', t: 'Arcane', f: 'arcane', pointe: 0, teinte: '#8a5cf0', epic: true, rangs: [
      rg('degats_arcane', 'Arcane damage dealt', [u(250, 'wizard', 'Wizard cursor')]),
      rg('degats_arcane', 'Arcane damage dealt', [p(500, 'the_cleric', 'The Cleric')]),
      rg('golden_equipes', 'Golden items equipped', [d(250, 'nacre_vert_or', 'Gold pearl dice')]),
      rg('golden_equipes', 'Golden items equipped', [p(500, 'the_guru', 'The Guru')]),
      rg('degats_wis', 'WIS-based damage dealt', [p(5000, 'the_wizard', 'The Wizard')]),
      rg(SERVIS, 'Spirit served', [k(5, 'dos_arcane', 'Arcane card back')])] },
    { id: 'chaos', t: 'Chaos', f: 'chaos', pointe: 1, teinte: '#d8409e', epic: true, rangs: [
      rg('degats_chaos', 'Chaos damage dealt', [d(250, 'galaxie_vert_violet', 'Galaxy dice')]),
      /* Croze, 27/09 : « The Turd ça se débloque quand tu te suicides plutôt » (seuil 1 ⓡ, #46 C) — inchangé §13.1 */
      rg('suicides', 'Died by your own hand', [p(1, 'the_turd', 'The Turd')]),
      rg('extractions', 'Successful extractions', [d(50, 'nacre_turquoise_violet', 'Turquoise pearl dice')]),
      rg('victoires', 'Games won', [p(150, 'the_aristocrat', 'The Aristocrat')]),
      rg('degats_chaos', 'Chaos damage dealt', [p(2500, 'the_vampire', 'The Vampire')]),
      rg(SERVIS, 'Spirit served', [k(5, 'dos_chaos', 'Chaos card back')])] },
    { id: 'feu', t: 'Fire', f: 'feu', pointe: 2, teinte: '#f0612a', epic: true, rangs: [
      rg('degats_fire', 'Fire damage dealt', [d(500, 'rouge_translucide', 'Red glass dice')]),
      rg('consommables', 'Consumables used', [p(50, 'the_cook', 'The Cook')]),
      rg('mobs_tues', 'Mobs killed', [p(100, 'the_green', 'The Green')]),
      rg('kills_joueurs', 'Players killed', [d(50, 'eclaboussures_sang', 'Blood-splatter dice')]),
      rg('boss_tues', 'Bosses killed', [p(5, 'the_dredger', 'The Dredger')]),
      rg(SERVIS, 'Spirit served', [k(5, 'dos_feu', 'Fire card back')])] },
    { id: 'givre', t: 'Frost', f: 'givre', pointe: 3, teinte: '#3cb4ea', epic: true, rangs: [
      rg('degats_frost', 'Frost damage dealt', [d(250, 'bleu_givre', 'Frost-blue dice')]),
      rg('coffres', 'Chests opened', [d(150, 'granite_bleu', 'Blue granite dice')]),
      rg('fuites_reussies', 'Successful flees', [p(500, 'the_whiff', 'The Whiff')]),
      rg('degats_frost', 'Frost damage dealt', [p(500, 'the_necromancer', 'The Necromancer')]),
      rg('kills_joueurs', 'Players killed', [p(250, 'the_golmon', 'The Golmon')]),
      rg('victoires_dpl', 'DPL wins', [d(25, 'nacre_bleu_acier', 'Steel pearl dice')]),
      rg(SERVIS, 'Spirit served', [k(6, 'dos_givre', 'Frost card back')])] },
    { id: 'foudre', t: 'Lightning', f: 'foudre', pointe: 4, teinte: '#f2c230', epic: true, rangs: [
      rg('degats_lightning', 'Lightning damage dealt', [d(500, 'jaune_opaque', 'Bee dice')]),
      rg('d20_nat1', 'Natural 1s rolled', [d(250, 'jaune_translucide', 'Amber dice')]),
      rg('d20_nat1', 'Natural 1s rolled', [p(1000, 'the_robert', 'The Robert')]),
      rg('degats_lightning', 'Lightning damage dealt', [p(2500, 'the_boltwright', 'The Boltwright')]),
      rg('d20_nat20', 'Natural 20s rolled', [u(150, 'torch', 'Torch cursor')]),
      rg(SERVIS, 'Spirit served', [k(5, 'dos_foudre', 'Lightning card back')])] },
    { id: 'poison', t: 'Poison', f: 'poison', pointe: 5, teinte: '#4cbb3a', epic: true, rangs: [
      rg('degats_poison', 'Poison damage dealt', [d(500, 'noir_vert_acide', 'Acid dice')]),
      rg('mobs_tues', 'Mobs killed', [d(250, 'vert_clair_marbre', 'Green marble dice')]),
      rg('serrures_cle', 'Locks opened with a key', [p(50, 'the_rogue', 'The Rogue')]),
      rg('d20_nat20', 'Natural 20s rolled', [p(500, 'the_poisoner', 'The Poisoner')]),
      rg('serie_victoires_max', 'Wins in a row (best)', [p(5, 'the_tamarin', 'The Tamarin')]),
      rg(SERVIS, 'Spirit served', [k(5, 'dos_poison', 'Poison card back')])] },
    /* LE NEUTRE = le donjon (§10 ②) : au centre du sceau, invisible. */
    { id: 'neutre', t: 'The Dungeon', f: 'neutre', pointe: null, teinte: '#9a948a', epic: true, rangs: [
      rg('squelettes', 'Skeletons killed', [d(50, 'bones', 'Bone dice')]),
      rg('collapses_encaisses', 'Collapses survived', [d(50, 'pierre', 'Stone dice')]),
      rg('invitations', 'Convocations used', [p(50, 'the_mailman', 'The Mailman')]),
      rg('degats_pris', 'Damage taken', [p(500, 'the_guard', 'The Guard')]),
      rg('signatures_max_partie', 'Signatures in one game (best)', [p(10, 'the_manbearpig', 'The ManBearPig')]),
      rg('pv_soignes', 'HP healed', [d(1000, 'rose_opaque', 'Pink dice')]),
      rg('parties_dpl', 'DPL games played', [u(50, 'legendary', 'Legendary cursor')]),
      rg('rang_dpl', 'Best DPL rank (1 bronze · 3 gold)', [k(1, 'dpl_bronze', 'Bronze card back')]),
      rg(SERVIS, 'Spirit served', [k(8, 'dos_neutre', 'Dungeon card back')])] }
  ];
  var IDS = TRONCS.map(function (t) { return t.id; });
  /* le tableau général (« SEE ALL ») garde un filtre par esprit */
  var FILTRES = [['all', 'All']].concat(TRONCS.map(function (t) { return [t.f, t.t]; }));

  /* S1373 · note 208 (§13.3) — LE PACTE. `mur.pacte` porte l'esprit du pacte
     (un seul). Un profil d'avant la note 208 portait ses esprits JURÉS dans
     `mur.actifs` : le premier devient son pacte — il l'avait déjà juré, il ne le
     repaie pas. Un id d'avant la note 203 n'est plus un esprit : il tombe. */
  function pacte(profil) {
    var m = profil && profil.mur;
    var id = m && typeof m.pacte === 'string' ? m.pacte
      : m && Array.isArray(m.actifs) && m.actifs.length > 0 ? m.actifs[0] : null;
    return id !== null && IDS.indexOf(id) >= 0 && !dort(profil, id) ? id : null;
  }
  /* compat : les lecteurs d'hier (le tableau général) lisent une liste */
  function actifs(profil) { var x = pacte(profil); return x === null ? [] : [x]; }
  /* ce que coûte un pacte avec `id` : 0 (le premier, ou celui qu'on a déjà),
     ROMPRE sinon (on rompt l'ancien pour passer le nouveau). */
  function prixDuPacte(profil, id) {
    var x = pacte(profil);
    return x === null || x === id ? 0 : ROMPRE;
  }
  /* passe le pacte avec `id` ; rend vrai s'il est passé. L'appelant a DÉJÀ
     demandé la confirmation quand le prix n'est pas nul. */
  function passeLePacte(id) {
    var fait = false;
    window.LLProfil.modifie(function (p) {
      if (dort(p, id)) { return; }   /* note 206 ① : pas de pacte avec un esprit qui dort */
      var prix = prixDuPacte(p, id);
      if (p.dents < prix) { return; }
      p.dents -= prix;
      if (typeof p.mur !== 'object' || p.mur === null) { p.mur = {}; }
      p.mur.pacte = id;
      delete p.mur.actifs;
      delete p.mur.contrats;       /* le double / triple serment n'existe plus */
      fait = true;
    });
    return fait;
  }
  /* rompre sans en passer un autre : ROMPRE dents, la branche revient à ×1 */
  function romps() {
    var fait = false;
    window.LLProfil.modifie(function (p) {
      if (pacte(p) === null || p.dents < ROMPRE) { return; }
      p.dents -= ROMPRE;
      p.mur.pacte = null;
      delete p.mur.actifs;
      delete p.mur.contrats;
      fait = true;
    });
    return fait;
  }

  function compteur(profil, c) {
    var v = profil && profil.compteurs && profil.compteurs[c];
    return typeof v === 'number' && isFinite(v) && v > 0 ? Math.floor(v) : 0;
  }
  /* S1390 · BW-3 — LA BARRE D'UNE BRANCHE. Un même compteur nourrit plusieurs
     esprits (mobs tués : Feu ET Poison), mais le pacte et les offrandes
     multiplient UNE branche, et une branche endormie ne compte pas (§12.1,
     §13.3) : la progression vit donc PAR ESPRIT, `profil.branches[esprit][clé]`,
     écrite par `finDePartie`. `profil.compteurs` garde les totaux bruts (le
     PROFIL les montre). Un profil sans `branches` (le profil de test de
     VOIR-BOUNTY-WALL, un profil d'avant) lit le total brut. */
  function compteurBranche(profil, id, c) {
    var b = profil && profil.branches;
    if (!b || typeof b !== 'object') { return compteur(profil, c); }
    var v = b[id] && b[id][c];
    return typeof v === 'number' && isFinite(v) && v > 0 ? Math.floor(v) : 0;
  }

  /* `offertes` : les peaux que le registre donne d'office (`offerte`). Chaque
     nœud : `lock` (en route), `pret` (seuil atteint, pas acheté), `a_toi`. */
  function etat(profil, offertes) {
    var pp = (profil && profil.possede) || {};
    var persos = Array.isArray(pp.persos) ? pp.persos : [];
    var des = Array.isArray(pp.des) ? pp.des : [];
    var curs = Array.isArray(pp.curseurs) ? pp.curseurs : [];
    var dos = Array.isArray(pp.dos) ? pp.dos : [];
    var off = Array.isArray(offertes) ? offertes : [];
    return TRONCS.map(function (t) {
      var servis = 0;
      return { id: t.id, t: t.t, f: t.f, pointe: t.pointe, teinte: t.teinte, epic: t.epic === true, rangs: t.rangs.map(function (g) {
        var n = g.c === SERVIS ? servis : compteurBranche(profil, t.id, g.c);
        var noeuds = g.noeuds.map(function (x) {
          var aToi = x.p ? persos.indexOf(x.p) >= 0
            : x.u ? (curs.indexOf(x.u) >= 0 || x.u === 'bones')
            : x.k ? dos.indexOf(x.k) >= 0
            : x.e ? false
            : (des.indexOf(x.d) >= 0 || off.indexOf(x.d) >= 0);
          return { a: x.a, p: x.p || null, d: x.d || null, u: x.u || null, k: x.k || null, e: x.e || null, nom: x.nom,
            s: aToi ? 'a_toi' : (n >= x.a ? 'pret' : 'lock') };
        });
        noeuds.forEach(function (x) { if (x.s !== 'lock') { servis++; } });
        var bout = g.noeuds[g.noeuds.length - 1].a;
        var suivant = null;
        for (var j = 0; j < noeuds.length; j++) { if (noeuds[j].s === 'lock') { suivant = noeuds[j]; break; } }
        return { c: g.c, l: g.l, n: n, bout: bout, noeuds: noeuds, suivant: suivant };
      }) };
    });
  }

  /* ── S1370 · note 206 ① — LA PORTE D'UN ESPRIT ───────────────────────────
     Un esprit DORT (visage éteint, pas de barre, pas de serment, pas
     d'offrande) tant que le profil n'a ni infligé ni pris un dégât de son école.
     `profil.ecolesOuvertes` porte les esprits éveillés. Le NEUTRE s'éveille au
     premier dégât GENERIC — « c'est-à-dire à la première partie » (§12) : la fin
     de partie l'ouvre (`finDePartie`). S1381 · BW-3 (moteur, palier 812) : les
     dégâts PRIS portent leur école sur `HP_LOST.schools` — la fin de partie
     éveille l'esprit de chaque école encaissée. Les dégâts INFLIGÉS par école
     ne sont pas encore publiés : ils n'éveillent rien. */
  function eveilles(profil) {
    var a = profil && profil.ecolesOuvertes;
    var e = Array.isArray(a) ? a.filter(function (x) { return IDS.indexOf(x) >= 0; }) : [];
    /* un profil qui a DÉJÀ joué (avant la note 206) a déjà vu le donjon */
    var pp = (profil && profil.personnages) || {};
    var joue = Object.keys(pp).some(function (k) { return pp[k] && pp[k].parties > 0; });
    if (joue && e.indexOf('neutre') < 0) { e.push('neutre'); }
    return e;
  }
  function dort(profil, id) { return eveilles(profil).indexOf(id) < 0; }
  function eveille(p, id) {
    if (!Array.isArray(p.ecolesOuvertes)) { p.ecolesOuvertes = []; }
    if (IDS.indexOf(id) >= 0 && p.ecolesOuvertes.indexOf(id) < 0) { p.ecolesOuvertes.push(id); }
  }

  /* ── les offrandes du profil : le sac (`offrandes[]`, une sorte par objet)
     et celles qui brûlent sur le mur (`mur.offertes[]`). */
  function sac(profil) {
    var n = { pomme: 0, milk: 0, sang: 0 };
    var a = profil && profil.offrandes;
    (Array.isArray(a) ? a : []).forEach(function (s) { var k = sorteDe(s); if (k !== null) { n[k]++; } });
    return n;
  }
  /* retire UNE offrande de la sorte `sorte` du sac (sous son nom d'hier au besoin) */
  function prends(p, sorte) {
    if (!Array.isArray(p.offrandes)) { return false; }
    for (var i = 0; i < p.offrandes.length; i++) {
      if (sorteDe(p.offrandes[i]) === sorte) { p.offrandes.splice(i, 1); return true; }
    }
    return false;
  }
  function brulent(profil, id) {
    var a = profil && profil.mur && profil.mur.offertes;
    return (Array.isArray(a) ? a : []).filter(function (o) {
      return o && o.esprit === id && sorteDe(o.sorte) !== null && typeof o.restant === 'number' && o.restant > 0;
    }).map(function (o) { return { esprit: o.esprit, sorte: sorteDe(o.sorte), restant: o.restant }; });
  }
  /* le multiplicateur d'une branche (§13.3) : le pacte (×3) et les offrandes
     actives s'ADDITIONNENT (pacte ×3 + pomme ×2 = ×5) ; ×1 sans rien. */
  function multiplicateur(profil, id) {
    var s = pacte(profil) === id ? PACTE : 0;
    brulent(profil, id).forEach(function (o) { s += OFFRANDES[o.sorte].x; });
    return s === 0 ? 1 : s;
  }
  /* le gain d'une branche : compteur × multiplicateur (plus de ¼, §13.3).
     BW-3 l'appellera quand le moteur publiera ses compteurs (BW-1). */
  function gain(profil, id, n) {
    return n * multiplicateur(profil, id);
  }
  /* note 207 ⓑ : OFFRIR dès que l'arbre est ouvert (l'esprit éveillé) — pas besoin de pacte */
  function offre(id, sorte) {
    var fait = false;
    window.LLProfil.modifie(function (p) {
      if (dort(p, id) || !OFFRANDES[sorte]) { return; }
      if (!prends(p, sorte)) { return; }
      if (typeof p.mur !== 'object' || p.mur === null) { p.mur = {}; }
      if (!Array.isArray(p.mur.offertes)) { p.mur.offertes = []; }
      p.mur.offertes.push({ esprit: id, sorte: sorte, restant: OFFRANDES[sorte].duree });
      fait = true;
    });
    return fait;
  }

  /* S1373 · note 208 (§13.4) — UNE OFFRANDE SUR LE TICKET DPL : les dents de
     cette partie classée ×2/×5/×10, une par ticket, seulement la Ligue débloquée
     (une partie de DPL jouée, le compteur `parties_dpl`). Elle part du sac tout
     de suite et reste posée sur le ticket (`tickets.offrandeDpl`) jusqu'à ce que
     la partie la consomme, gagnée ou perdue. */
  function ligueOuverte(profil) { return compteur(profil, 'parties_dpl') >= 1; }
  function surLeTicket(profil) {
    var t = profil && profil.tickets;
    return t && sorteDe(t.offrandeDpl) !== null ? sorteDe(t.offrandeDpl) : null;
  }
  function offreSurLeTicket(sorte) {
    var fait = false;
    window.LLProfil.modifie(function (p) {
      var t = p.tickets;
      if (!ligueOuverte(p) || !OFFRANDES[sorte] || !t || !(t.dpl > 0) || surLeTicket(p) !== null) { return; }
      if (!prends(p, sorte)) { return; }
      t.offrandeDpl = sorte;
      fait = true;
    });
    return fait;
  }
  function achete(sorte) {
    var o = OFFRANDES[sorte];
    var fait = false;
    if (!o || o.prix === null) { return false; }
    window.LLProfil.modifie(function (p) {
      if (p.dents < o.prix) { return; }
      p.dents -= o.prix;
      if (!Array.isArray(p.offrandes)) { p.offrandes = []; }
      p.offrandes.push(sorte);
      fait = true;
    });
    return fait;
  }

  /* LE DROP (§12) : une partie sur deux, tiré sur la GRAINE de la partie —
     reproductible, jamais un `Math.random()`. Offrande 80 % · super 18 % ·
     divine 2 % (ⓡ, #49 B) — §13.2 : pomme · Troll Milk · Sang de Troll. mulberry32, deux tirages. */
  function tirage(graine) {
    var a = (Number(graine) >>> 0) ^ 0x6f666672;   /* « offr » : un flux à part de celui du moteur */
    function u() {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    if (u() >= 0.5) { return null; }
    var v = u();
    return v < 0.80 ? 'pomme' : v < 0.98 ? 'milk' : 'sang';
  }

  /* LA FIN DE PARTIE, dans l'écriture du profil qui compte la partie (UNE fois
     par partie — l'appelant garde l'empreinte) : le neutre s'éveille, chaque
     offrande qui brûle perd une partie, et le drop tombe dans le sac. Rend ce
     que l'écran de fin doit dire. */
  /* l'école publiée par le moteur (`types.ts`, en minuscules) → l'esprit */
  var ESPRIT_DE_L_ECOLE = { arcane: 'arcane', chaos: 'chaos', fire: 'feu', frost: 'givre', lightning: 'foudre', poison: 'poison' };
  function finDePartie(p, graine, ecolesPrises, gainsBruts) {
    eveille(p, 'neutre');
    var eveilles = [];
    (Array.isArray(ecolesPrises) ? ecolesPrises : []).forEach(function (s) {
      var id = ESPRIT_DE_L_ECOLE[s];
      if (id === undefined || eveilles.indexOf(id) >= 0) { return; }
      if (!Array.isArray(p.ecolesOuvertes) || p.ecolesOuvertes.indexOf(id) < 0) { eveilles.push(id); }
      eveille(p, id);
    });
    /* S1390 · BW-3 — ce que la partie rapporte à chaque esprit ÉVEILLÉ, multiplié
       par SON pacte et SES offrandes de cette partie (avant qu'elles ne
       s'usent, juste en dessous) ; un compteur ne compte qu'une fois par branche. */
    var gains = [];
    if (gainsBruts && typeof gainsBruts === 'object') {
      if (typeof p.branches !== 'object' || p.branches === null) { p.branches = {}; }
      TRONCS.forEach(function (t) {
        if (dort(p, t.id)) { return; }
        var m = multiplicateur(p, t.id);
        var b = p.branches[t.id] || (p.branches[t.id] = {});
        var vus = {};
        var total = 0;
        t.rangs.forEach(function (g) {
          if (g.c === SERVIS || vus[g.c]) { return; }
          vus[g.c] = true;
          var d = gainsBruts[g.c];
          if (typeof d !== 'number' || !(d > 0)) { return; }
          b[g.c] = (typeof b[g.c] === 'number' ? b[g.c] : 0) + d * m;
          total += d * m;
        });
        if (total > 0) { gains.push({ esprit: t.id, n: total, x: m }); }
      });
    }
    var avant = [];
    if (p.mur && Array.isArray(p.mur.offertes)) {
      IDS.forEach(function (id) {
        var m = multiplicateur(p, id);
        if (m > 1) { avant.push({ esprit: id, x: m }); }
      });
      p.mur.offertes = p.mur.offertes
        .map(function (o) { return { esprit: o.esprit, sorte: sorteDe(o.sorte), restant: (o.restant | 0) - 1 }; })
        .filter(function (o) { return o.restant > 0 && o.sorte !== null; });
    }
    var drop = tirage(graine);
    if (drop !== null) {
      if (!Array.isArray(p.offrandes)) { p.offrandes = []; }
      p.offrandes.push(drop);
    }
    return { drop: drop, brulaient: avant, eveilles: eveilles, gains: gains };
  }
  function nomDe(id) {
    for (var i = 0; i < TRONCS.length; i++) { if (TRONCS[i].id === id) { return TRONCS[i].t; } }
    return id;
  }

  window.LLBountyWall = { PRIX_PERSO: PRIX_PERSO, FOIS: FOIS, TRONCS: TRONCS, FILTRES: FILTRES, SERVIS: SERVIS, etat: etat,
    compteur: compteur, compteurBranche: compteurBranche, actifs: actifs, PACTE: PACTE, ROMPRE: ROMPRE, pacte: pacte, prixDuPacte: prixDuPacte,
    passeLePacte: passeLePacte, romps: romps, ligueOuverte: ligueOuverte, surLeTicket: surLeTicket, offreSurLeTicket: offreSurLeTicket,
    OFFRANDES: OFFRANDES, SORTES: SORTES, eveilles: eveilles, dort: dort, sac: sac, brulent: brulent,
    multiplicateur: multiplicateur, gain: gain, offre: offre, achete: achete, tirage: tirage, finDePartie: finDePartie,
    nomDe: nomDe };
})();
