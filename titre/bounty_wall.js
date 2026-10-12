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
  var PRIX_PERSO = 3500;         /* note 269 ② : grille GRAVÉE (MONNAIE §20) — était 640 (#45 B) */
  var SERVIS = '@servis';

  /* S1373 · note 208 (§13.2) — LES OFFRANDES SONT DES CONSOMMABLES NOMMÉS.
     Une offrande s'offre à UN esprit éveillé et multiplie ce que sa branche gagne
     pendant SA durée ; sur une même branche, les multiplicateurs s'ADDITIONNENT
     (×2 + ×5 = ×7), chacune avec sa durée. Le SANG DE TROLL ne s'achète pas. */
  var OFFRANDES = {
    /* `art` : la carte du jeu qui porte déjà ce nom (`/art/cartes/`) */
    /* S1405 · note 221 (2) OF-2 — TROIS POMMES, mêmes chiffres qu'avant ; elles NE
       S'ACHÈTENT PAS (prix null : trouvées en partie). Les clés restent celles d'hier :
       un profil existant garde son sac. */
    /* S1414 · BW-DA bis (note 235 ⑥ⓐ, §16.1) : les trois pommes ne sont PLUS des
       offrandes (ce sont des cartes). Elles restent LISIBLES ici (`ancienne`) pour
       qu'une offrande qui brûle déjà finisse sa durée ; elles ne s'offrent plus,
       ne s'achètent plus et ne tombent plus. Les 21 ESSENCES sont ajoutées sous
       TRONCS (elles prennent la couleur de leur esprit). */
    pomme: { x: 2, nom: 'Small Apple', duree: 3, prix: null, ancienne: true },
    milk: { x: 5, nom: 'Big Apple', duree: 10, prix: null, ancienne: true },
    sang: { x: 10, nom: 'Apple Tree', duree: 5, prix: null, ancienne: true }
  };
  var SORTES = [];
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
  /* S1415 · BW-5 (note 237 ①, `docs/BOUNTY_WALL_DEFIS.md` v2 — la revue de Croze
     appliquée). Chaque esprit : 6 paliers + le BOUT (2 dés · 3 persos · 1 curseur ·
     1 dos, qui est l'Epic de l'esprit ; les Epic séparés disparaissent). Le DONJON
     (ex-Neutre + l'Exploration du Cartographe) : Progression 1-3 · Exploration 4-15
     (lue dans le CODEX, `codex.js`) · Dungeon Pro Tour 16-21 · le Bout = le sceau.
     Les dés bones et pierre sortent de l'arbre (dés par défaut). Libellés EN
     FRANÇAIS (Croze : « je lis les conditions en français »). Les clés de compteur
     restent celles d'hier (`parties_dpl`…) : un profil existant garde sa progression.
     Les propositions marquées en attente de #56 sont GRAVÉES (note 239 ①, 10/10
     soir) : le mur ne porte plus aucune marque de proposition. Phrase de Croze : « Au mur, chaque esprit a
     six paliers et son dos au bout ; le Donjon rassemble la progression,
     l'exploration et le Pro Tour ; je lis les conditions en français. » */
  var DEFIS = 'defis_carte';            /* « défis de la carte réalisés » : pas encore publié */
  var ARBRES = '@arbres';               /* arbres d'esprit terminés : calculé par `etat` */
  var CODEX = '@codex';                 /* un palier d'Exploration : lu dans `codex.js` */
  function t(a, n, nom) { return { a: a, t: n, nom: nom }; }        /* des dents */
  function x(a, id, nom) { return { a: a, x: id, nom: nom }; }      /* un accès (tickets DPT) */
  function e(a, id, nom) { return { a: a, e: id, nom: nom }; }      /* l'Epic, pas forgée */
  /* L'EXPLORATION (4-15) : le libellé et la récompense ici, le compteur et le seuil
     dans `codex.js` (`LLCodex.noeuds()`, même ordre : douze paliers). `a` ci-dessous
     n'est qu'un repli (le pourcentage) tant que l'index du CODEX n'est pas chargé. */
  var CX = [
    { l: 'Tiles discovered 25 %', r: t(25, 100, '100 teeth') },
    { l: 'Tiles discovered 50 %', r: t(50, 200, '200 teeth') },
    /* S1418 · note 240 ① (BOUNTY_WALL §19) : les 300 dents cèdent la place au dé forgé */
    { l: 'Tiles discovered 75 %', r: d(75, 'nacre_orange_argent', 'Orange-silver pearl dice') },
    { l: 'Tiles discovered 100 %', r: u(100, 'bones', 'Bones cursor') },
    { l: 'Loot cards discovered 25 %', r: t(25, 150, '150 teeth') },
    { l: 'Loot cards discovered 50 %', r: t(50, 250, '250 teeth') },
    { l: 'Loot cards discovered 75 %', r: t(75, 350, '350 teeth') },
    { l: 'Loot cards discovered 100 %', r: u(100, 'collapse', 'Collapse cursor') },
    { l: 'Traps, chests and quests discovered (all)', r: t(100, 250, '250 teeth') },
    { l: 'Sub-bosses discovered (all)', r: t(100, 400, '400 teeth') },
    { l: 'The whole Codex 75 %', r: t(75, 600, '600 teeth') },
    { l: 'The whole Codex, the 3 bosses included 100 %', r: t(100, 1000, '1 000 teeth') }
  ];
  function cx(i) { var g = rg(CODEX, CX[i].l, [CX[i].r]); g.cx = i; return g; }
  /* S1419 · BW-5 bis (note 242, `docs/BOUNTY_WALL_DEFIS.md` v4 = LA RÉFÉRENCE) et
     note 241 ① (l'anglais, 3ᵉ remontée) : chaque libellé tel qu'AFFICHÉ (anglais),
     chaque seuil de la v4, et dans une branche l'ordre du facile au dur (Chaos 4 =
     Rift cursor avant Aristocrat et Vampire ; Lightning 5 = Bolt cursor avant le
     Boltwright ; Poison 4 = The Green avant le Poisoner). Les clés de compteur ne
     changent pas : un compteur acquis se relit contre le NOUVEAU seuil (`etat`),
     un palier atteint est marqué atteint sans rejouer. Les dents prises (`pris`,
     clé `<esprit>:<rang>`) ne vivent qu'au Donjon, dont l'ordre ne bouge pas. */
  var TRONCS = [
    { id: 'poison', t: 'Poison', f: 'poison', pointe: 5, teinte: '#4cbb3a', rangs: [
      rg('degats_poison', 'Poison damage dealt', [d(350, 'noir_vert_acide', 'Acid dice')]),
      rg('mobs_tues', 'Mobs killed', [d(75, 'vert_clair_marbre', 'Green marble dice')]),
      rg('serrures_cle', 'Locks opened with a key', [p(20, 'the_rogue', 'The Rogue')]),
      rg('mobs_tues', 'Mobs killed', [p(200, 'the_green', 'The Green')]),
      rg('d20_nat20', 'Natural 20s rolled', [p(150, 'the_poisoner', 'The Poisoner')]),
      rg('degats_poison', 'Poison damage dealt', [u(2500, 'fiole', 'Vial cursor')]),
      rg(DEFIS, 'Card challenges done', [k(5, 'dos_poison', 'Poison card back (Epic)')])] },
    { id: 'chaos', t: 'Chaos', f: 'chaos', pointe: 1, teinte: '#d8409e', rangs: [
      rg('pv_soignes', 'HP healed', [d(500, 'rose_opaque', 'Rose dice')]),
      rg('suicides', 'Suicides', [p(1, 'the_turd', 'The Turd')]),
      rg('extractions', 'Extractions', [d(30, 'nacre_turquoise_violet', 'Turquoise-violet pearl dice')]),
      rg('degats_chaos', 'Chaos damage dealt', [u(1000, 'faille', 'Rift cursor')]),
      rg('victoires', 'Victories', [p(25, 'the_aristocrat', 'The Aristocrat')]),
      rg('degats_chaos', 'Chaos damage dealt', [p(2000, 'the_vampire', 'The Vampire')]),
      rg(DEFIS, 'Card challenges done', [k(5, 'dos_chaos', 'Chaos card back (Epic)')])] },
    { id: 'feu', t: 'Fire', f: 'feu', pointe: 2, teinte: '#f0612a', rangs: [
      rg('degats_fire', 'Fire damage dealt', [d(350, 'rouge_translucide', 'Red dice')]),
      rg('d20_nat1', 'Natural 1s rolled', [d(100, 'jaune_translucide', 'Amber dice')]),
      rg('consommables', 'Consumables used', [p(40, 'the_cook', 'The Cook')]),
      rg('d20_nat20', 'Natural 20s rolled', [u(100, 'torch', 'Torch cursor')]),
      rg('boss_tues', 'Bosses killed', [p(4, 'the_dredger', 'The Dredger')]),
      rg('degats_pris', 'Damage taken (all schools)', [p(2500, 'the_guard', 'The Guard')]),
      rg(DEFIS, 'Card challenges done', [k(5, 'dos_feu', 'Fire card back (Epic)')])] },
    { id: 'arcane', t: 'Arcane', f: 'arcane', pointe: 0, teinte: '#8a5cf0', rangs: [
      rg('degats_arcane', 'Arcane damage dealt', [u(200, 'wizard', 'Wizard cursor')]),
      rg('degats_wis', 'WIS-based damage dealt', [d(750, 'galaxie_vert_violet', 'Galaxy dice')]),
      rg('degats_arcane', 'Arcane damage dealt', [p(500, 'the_cleric', 'The Cleric')]),
      rg('golden_equipes', 'Golden items equipped', [p(50, 'the_guru', 'The Guru')]),
      rg('degats_wis', 'WIS-based damage dealt', [p(3000, 'the_wizard', 'The Wizard')]),
      rg('degats_arcane', 'Arcane damage dealt', [d(1000, 'cristal_mauve', 'Mauve crystal dice')]),
      rg(DEFIS, 'Card challenges done', [k(5, 'dos_arcane', 'Arcane card back (Epic)')])] },
    { id: 'foudre', t: 'Lightning', f: 'foudre', pointe: 4, teinte: '#f2c230', rangs: [
      rg('degats_lightning', 'Lightning damage dealt', [d(350, 'jaune_opaque', 'Bee dice')]),
      rg('golden_equipes', 'Golden items equipped', [d(40, 'nacre_vert_or', 'Green-gold pearl dice')]),
      rg('d20_nat1', 'Natural 1s rolled', [p(250, 'the_robert', 'The Robert')]),
      rg('invitations', 'Convocations / invitations played', [p(35, 'the_mailman', 'The Mailman')]),
      rg('degats_lightning', 'Lightning damage dealt', [u(1000, 'eclair', 'Bolt cursor')]),
      rg('degats_lightning', 'Lightning damage dealt', [p(2000, 'the_boltwright', 'The Boltwright')]),
      rg(DEFIS, 'Card challenges done', [k(5, 'dos_lightning', 'Lightning card back (Epic)')])] },
    { id: 'givre', t: 'Frost', f: 'givre', pointe: 3, teinte: '#3cb4ea', rangs: [
      rg('degats_frost', 'Frost damage dealt', [d(350, 'bleu_givre', 'Frost blue dice')]),
      rg('coffres', 'Chests opened', [d(50, 'granite_bleu', 'Blue granite dice')]),
      rg('fuites_reussies', 'Successful flees', [p(75, 'the_whiff', 'The Whiff')]),
      rg('degats_frost', 'Frost damage dealt', [p(750, 'the_necromancer', 'The Necromancer')]),
      rg('kills_joueurs', 'Player kills', [p(60, 'the_golmon', 'The Golmon')]),
      rg('degats_frost', 'Frost damage dealt', [u(1500, 'glace', 'Snowflake cursor')]),
      rg(DEFIS, 'Card challenges done', [k(5, 'dos_frost', 'Frost card back (Epic)')])] },
    /* LE DONJON = l'ancien Neutre (au centre du sceau, invisible) + l'Exploration. */
    { id: 'neutre', t: 'Spirit of the Dungeon', f: 'neutre', pointe: null, teinte: '#9a948a', rangs: [
      /* Progress */
      rg('kills_joueurs', 'Player kills', [d(15, 'eclaboussures_sang', 'Blood dice')]),
      rg('signatures_max_partie', 'Signatures in a single game', [p(8, 'the_manbearpig', 'The ManBearPig')]),
      rg('serie_victoires_max', 'Wins in a row', [p(5, 'the_tamarin', 'The Tamarin')]),
      /* Exploration (4-15) : seuils et compteurs lus dans le CODEX */
      cx(0), cx(1), cx(2), cx(3), cx(4), cx(5), cx(6), cx(7), cx(8), cx(9), cx(10), cx(11),
      /* Dungeon Pro Tour */
      rg(ARBRES, 'Spirit trees completed', [x(1, 'dpt', 'DPT tickets unlocked at the Vault')]),
      rg('parties_dpl', 'DPT games played', [u(35, 'legendary', 'Legendary cursor')]),
      /* S1421 · note 246 (BOUNTY_WALL_ASSETS §2 bis) : Dungeon 18 = les dés « the Seal » (à forger :
         « Arriving » tant que `public/dice/sceau/` n'existe pas) ; le dos du Donjon passe au Bout. */
      rg('rang_dpl', 'DPT rank reached (Gold)', [d(3, 'sceau', 'The Seal dice')]),
      rg('victoires_dpl', 'DPT wins', [d(75, 'nacre_bleu_acier', 'Steel-blue pearl dice')]),
      rg('parties_dpl', 'DPT games played', [t(200, 2000, '2 000 teeth')]),
      rg('rang_dpl', 'DPT rank reached (Diamond)', [t(5, 5000, '5 000 teeth')]),
      rg(SERVIS, 'The whole branch', [k(21, 'dos_dungeon', 'Dungeon card back (Epic)')])] }
  ];
  var IDS = TRONCS.map(function (t) { return t.id; });
  /* S1414 · BW-DA bis (note 235 ⑥ⓐ, BOUNTY_WALL §16.1) — LES ESSENCES : 21 objets,
     SMALL ×2 · BIG ×5 · MASSIVE ×10 pour chacun des sept esprits, de sa couleur,
     offrables à LUI SEUL. Durées 3 / 5 / 5 parties (gravées, note 239) ; Vault 100 / 500 / pas à
     vendre. Clé `<taille>_<esprit>` (`small_feu`). */
  var TAILLES = [
    /* note 237 ④ (Croze, 10/10 soir) : les essences NE SE VENDENT PLUS — elles ne
       tombent qu'en partie (prix null partout). */
    { k: 'small', nom: 'Small', x: 2, duree: 3, prix: null, chance: 0.5 },
    { k: 'big', nom: 'Big', x: 5, duree: 5, prix: null, chance: 0.1 },
    { k: 'massive', nom: 'Massive', x: 10, duree: 5, prix: null, chance: 0.01 }
  ];
  TRONCS.forEach(function (t) {
    var ecole = t.id === 'neutre' ? 'Dungeon' : t.t;
    TAILLES.forEach(function (z) {
      var cle = z.k + '_' + t.id;
      OFFRANDES[cle] = { x: z.x, nom: z.nom + ' ' + ecole + ' Essence', duree: z.duree, prix: z.prix,
        esprit: t.id, taille: z.k, teinte: t.teinte };
      SORTES.push(cle);
    });
  });
  /* note 237 ④ — LA CHANCE (rayon LUCK du Vault, gravé note 239) : un objet
     qui dure N parties. `dents` attend le moteur (les dents d'une partie ne sont
     pas publiées, Q-IN) ; `essences` multiplie le drop de fin de partie. Une seule
     chance à la fois (ⓡ, Q-CHANCE-CUMUL) : on n'en rachète pas tant qu'elle court. */
  var CHANCES = {
    rabbit_foot: { nom: 'Floor Wax', parties: 5, dents: 1.5, essences: 2, prix: 100 },        /* MONNAIE §20 gravé */
    four_leaf_clover: { nom: 'Dungeon Bleach', parties: 10, dents: 2, essences: 3, prix: 300 }  /* MONNAIE §20 gravé */
  };
  var SORTES_CHANCE = ['rabbit_foot', 'four_leaf_clover'];
  function chance(profil) {
    var c = profil && profil.chance;
    if (!c || !CHANCES[c.id] || !((c.restant | 0) > 0)) { return null; }
    return { id: c.id, restant: c.restant | 0, nom: CHANCES[c.id].nom, dents: CHANCES[c.id].dents, essences: CHANCES[c.id].essences };
  }
  function acheteLaChance(id) {
    var o = CHANCES[id];
    var fait = false;
    if (!o) { return false; }
    window.LLProfil.modifie(function (p) {
      if (chance(p) !== null || p.dents < o.prix) { return; }
      p.dents -= o.prix;
      p.chance = { id: id, restant: o.parties };
      fait = true;
    });
    return fait;
  }
  /* les essences d'UN esprit, de la plus petite à la plus grande */
  function essencesDe(id) { return SORTES.filter(function (s) { return OFFRANDES[s].esprit === id; }); }
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
    var pris = (profil && profil.mur && Array.isArray(profil.mur.pris)) ? profil.mur.pris : [];
    /* BW-5 : l'Exploration se lit dans le CODEX (chargé à part : sans lui, tout est « en route ») */
    var C = window.LLCodex && typeof window.LLCodex.noeuds === 'function' && window.LLCodex.pret && window.LLCodex.pret()
      ? window.LLCodex.noeuds() : null;
    var arbres = 0;
    return TRONCS.map(function (t) {
      var servis = 0;
      var rangs = t.rangs.map(function (g, gi) {
        var cxn = g.c === CODEX && C !== null ? C[g.cx] : null;
        var n = g.c === SERVIS ? servis : g.c === ARBRES ? arbres : g.c === CODEX ? (cxn ? cxn.n : 0)
          : compteurBranche(profil, t.id, g.c);
        var noeuds = g.noeuds.map(function (x) {
          var a = cxn ? cxn.seuil : x.a;
          var aToi = x.p ? persos.indexOf(x.p) >= 0
            : x.u ? (curs.indexOf(x.u) >= 0 || x.u === 'bones')
            : x.k ? dos.indexOf(x.k) >= 0
            : x.e ? false
            : x.x ? (profil && profil.mur && profil.mur[x.x] === true)
            : x.t ? (g.c === CODEX ? (cxn !== null && cxn.s === 'a_toi') : pris.indexOf(t.id + ':' + gi) >= 0)
            : (des.indexOf(x.d) >= 0 || off.indexOf(x.d) >= 0);
          return { a: a, p: x.p || null, d: x.d || null, u: x.u || null, k: x.k || null, e: x.e || null,
            t: x.t || null, x: x.x || null, cx: g.c === CODEX ? g.cx : null, cle: t.id + ':' + gi, nom: x.nom,
            s: aToi ? 'a_toi' : ((g.c !== CODEX || cxn !== null) && n >= a ? 'pret' : 'lock') };
        });
        noeuds.forEach(function (x) { if (x.s !== 'lock') { servis++; } });
        var bout = noeuds[noeuds.length - 1].a;
        var suivant = null;
        for (var j = 0; j < noeuds.length; j++) { if (noeuds[j].s === 'lock') { suivant = noeuds[j]; break; } }
        return { c: g.c, l: g.l, n: n, bout: bout, noeuds: noeuds, suivant: suivant };
      });
      /* un arbre d'ESPRIT est terminé quand chacun de ses nœuds est à toi (le Donjon ne compte pas) */
      if (t.pointe !== null && rangs.every(function (g) { return g.noeuds.every(function (x) { return x.s === 'a_toi'; }); })) { arbres++; }
      return { id: t.id, t: t.t, f: t.f, pointe: t.pointe, teinte: t.teinte, epic: t.epic === true, rangs: rangs };
    });
  }
  /* BW-5 — PRENDRE un nœud qui ne s'achète pas : des dents (Pro Tour 20-21), l'accès aux
     tickets DPT (16), ou le dos d'un esprit (le Bout : gagné, jamais vendu — Q-DOS-MUR-PRIX).
     L'Exploration se prend dans `codex.js` (`LLCodex.touche`). */
  function prends1(n) {
    if (!n || n.s !== 'pret') { return false; }
    var fait = false;
    window.LLProfil.modifie(function (p) {
      if (typeof p.mur !== 'object' || p.mur === null) { p.mur = {}; }
      if (n.t) {
        if (!Array.isArray(p.mur.pris)) { p.mur.pris = []; }
        if (p.mur.pris.indexOf(n.cle) >= 0) { return; }
        p.mur.pris.push(n.cle);
        p.dents += n.t;
      } else if (n.x) {
        if (p.mur[n.x] === true) { return; }
        p.mur[n.x] = true;
      } else if (n.k) {
        if (!p.possede || typeof p.possede !== 'object') { return; }
        if (!Array.isArray(p.possede.dos)) { p.possede.dos = []; }
        if (p.possede.dos.indexOf(n.k) >= 0) { return; }
        p.possede.dos.push(n.k);
      } else { return; }
      fait = true;
    });
    return fait;
  }
  /* l'achat d'un ticket DPT se débloque au palier 16 du Donjon */
  function dptOuvert(profil) { return !!(profil && profil.mur && profil.mur.dpt === true); }

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
  /* S1419 · note 243 ⑧ⓒ (BOUNTY_WALL §21) — LE VERROU : les six esprits d'école restent
     fermés (visibles, grisés, « Win a game to open the spirits ») jusqu'à la première
     partie GAGNÉE — le palier Dungeon 0 ; le Donjon, lui, s'ouvre dès la première partie.
     La victoire se lit au compteur du profil (`compteurs.victoires`, écrit à la fin de
     partie AVANT `finDePartie` : la partie gagnée ouvre déjà les esprits) ou, pour un
     profil d'avant, aux victoires par personnage. */
  function aGagne(profil) {
    var c = profil && profil.compteurs;
    if (c && typeof c.victoires === 'number' && c.victoires > 0) { return true; }
    var pp = (profil && profil.personnages) || {};
    return Object.keys(pp).some(function (k) { return pp[k] && pp[k].victoires > 0; });
  }
  function verrouVictoire(profil, id) { return id !== 'neutre' && !aGagne(profil); }
  function dort(profil, id) { return verrouVictoire(profil, id) || eveilles(profil).indexOf(id) < 0; }
  function eveille(p, id) {
    if (!Array.isArray(p.ecolesOuvertes)) { p.ecolesOuvertes = []; }
    if (IDS.indexOf(id) >= 0 && p.ecolesOuvertes.indexOf(id) < 0) { p.ecolesOuvertes.push(id); }
  }

  /* ── les offrandes du profil : le sac (`offrandes[]`, une sorte par objet)
     et celles qui brûlent sur le mur (`mur.offertes[]`). */
  function sac(profil) {
    var n = {};
    SORTES.forEach(function (s) { n[s] = 0; });
    var a = profil && profil.offrandes;
    (Array.isArray(a) ? a : []).forEach(function (s) { var k = sorteDe(s); if (k !== null && k in n) { n[k]++; } });
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
    /* S1414 · BW-DA bis (§16.1, §12.3) : les ESSENCES qui brûlent sur une branche
       s'ADDITIONNENT entre elles et au pacte (pacte ×3 + SMALL ×2 = ×5). */
    brulent(profil, id).forEach(function (o) { s += OFFRANDES[o.sorte].x; });
    return s === 0 ? 1 : s;
  }
  /* S1405 · note 222 (2) OF-2 bis — pourquoi une offrande est REFUSÉE sur cet esprit
     (`null` : elle passe). Une plus faible, ou la même, reste dans le sac. */
  function refus(profil, id, sorte) {
    var o = OFFRANDES[sorte];
    if (!o) { return null; }
    /* S1414 · BW-DA bis : une essence ne s'offre qu'à SON esprit ; plus de « mieux déjà là ». */
    if (o.ancienne) { return 'This is a card now, not an offering.'; }
    if (o.esprit !== id) { return 'This essence feeds only the spirit of ' + nomDe(o.esprit) + '.'; }
    if (id === 'exploration') { return 'The Cartographer takes no essence.'; }
    return null;
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
      if (refus(p, id, sorte) !== null) { return; }
      if (!prends(p, sorte)) { return; }
      if (typeof p.mur !== 'object' || p.mur === null) { p.mur = {}; }
      if (!Array.isArray(p.mur.offertes)) { p.mur.offertes = []; }
      /* S1414 · BW-DA bis : les essences s'ADDITIONNENT — plus de remplacement. */
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
    /* S1414 · BW-DA bis (§16.1 ⓡ) : une SMALL d'un esprit OUVERT une partie sur deux,
       une BIG une sur dix, une MASSIVE une sur cent — trois tirages indépendants,
       l'esprit tiré parmi les ouverts (le Cartographe n'en prend pas). */
    var ouverts = (Array.isArray(arguments[1]) ? arguments[1] : []).filter(function (id) { return IDS.indexOf(id) >= 0; });
    if (ouverts.length === 0) { return []; }
    var tombe = [];
    TAILLES.forEach(function (z) {
      var oui = u() < z.chance;
      var qui = ouverts[Math.min(ouverts.length - 1, Math.floor(u() * ouverts.length))];
      if (oui) { tombe.push(z.k + '_' + qui); }
    });
    return tombe;
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
    var drops = tirage(graine, IDS.filter(function (id) { return !dort(p, id); }));
    /* note 237 ④ — la chance multiplie les essences tombées, et perd une partie. */
    var ch = chance(p);
    if (ch !== null) {
      var n = drops.length;
      for (var r = 1; r < ch.essences; r++) { for (var q = 0; q < n; q++) { drops.push(drops[q]); } }
      p.chance = ch.restant - 1 > 0 ? { id: ch.id, restant: ch.restant - 1 } : null;
    }
    if (drops.length > 0) {
      if (!Array.isArray(p.offrandes)) { p.offrandes = []; }
      drops.forEach(function (d) { p.offrandes.push(d); });
    }
    return { drop: drops.length > 0 ? drops[0] : null, drops: drops, brulaient: avant, eveilles: eveilles, gains: gains,
      chance: ch === null ? null : { nom: ch.nom, essences: ch.essences, restant: ch.restant - 1 } };
  }
  function nomDe(id) {
    for (var i = 0; i < TRONCS.length; i++) { if (TRONCS[i].id === id) { return TRONCS[i].t; } }
    return id;
  }

  /* S1405 - note 221 (1c) : l'Epic n'est pas forgee ; sa ligne reste cachee au mur. */
  window.LLBountyWall = { EPIC_FORGEE: false, refus: refus, verrouVictoire: verrouVictoire, aGagne: aGagne, PRIX_PERSO: PRIX_PERSO, FOIS: FOIS, TRONCS: TRONCS, FILTRES: FILTRES, SERVIS: SERVIS, etat: etat,
    compteur: compteur, compteurBranche: compteurBranche, actifs: actifs, PACTE: PACTE, ROMPRE: ROMPRE, pacte: pacte, prixDuPacte: prixDuPacte,
    passeLePacte: passeLePacte, romps: romps, prends1: prends1, dptOuvert: dptOuvert, CODEX: CODEX, ARBRES: ARBRES, DEFIS: DEFIS, ligueOuverte: ligueOuverte, surLeTicket: surLeTicket, offreSurLeTicket: offreSurLeTicket,
    CHANCES: CHANCES, SORTES_CHANCE: SORTES_CHANCE, chance: chance, acheteLaChance: acheteLaChance,
    OFFRANDES: OFFRANDES, SORTES: SORTES, TAILLES: TAILLES, essencesDe: essencesDe, eveilles: eveilles, dort: dort, sac: sac, brulent: brulent,
    multiplicateur: multiplicateur, gain: gain, offre: offre, achete: achete, tirage: tirage, finDePartie: finDePartie,
    nomDe: nomDe };
})();
