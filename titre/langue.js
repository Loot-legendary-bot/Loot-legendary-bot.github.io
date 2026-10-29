/*
 * langue.js — FRANÇAIS / ENGLISH (S1379 · O-T2, note 209 ①).
 *
 * Croze : *« J'ai besoin dans OPTIONS de pouvoir switcher français / anglais. »*
 * Phrase : *« J'ouvre OPTIONS, je bascule FRANÇAIS / ENGLISH, l'écran change de
 * langue tout de suite, et il s'en souvient au relancement. »*
 *
 * ⚑ **CHAQUE SURFACE A UNE LANGUE D'ORIGINE, ET ON TRADUIT DEPUIS ELLE.** Le
 * jeu (`main.ts`) est écrit en français ; le HOME (`ecran_titre.html`) en
 * anglais. Aucun lexique n'existait : ce module en porte un par sens, et il
 * traduit les libellés FIXES du cadre (boutons, titres, bandes) — un nœud de
 * texte dont la valeur entière est une clé. **Les phrases du fil, les noms de
 * cartes et ce que le moteur publie restent tels quels** : les noms de cartes
 * sont ceux des cartons (note 209), et une phrase du moteur n'a qu'une langue
 * (`tools/langue.py`). *Tranche 1 — le lexique doit GROSSIR, jamais deviner.*
 *
 * ⚑ **EFFET IMMÉDIAT, SANS RECHARGER** : un observateur traduit tout nœud qui
 * naît ou change ; l'original est gardé (WeakMap) et rendu quand on revient à
 * la langue d'origine. Recharger le jeu perdrait la partie.
 *
 * La langue vit dans le profil (`profil.options.langue`, `profil.js`) : la même
 * clé pour le HOME et le jeu. Absente = la langue d'origine de chaque surface,
 * c'est-à-dire l'écran d'hier au pixel près.
 */
(function () {
  'use strict';

  /* Le jeu, écrit en français -> anglais. Clé = la valeur ENTIÈRE du nœud (sans
     ses blancs de bord), telle que le DOM la porte — relevée à l'écran. */
  var FR_EN = {
    'ON TE DEMANDE': 'YOU ARE ASKED',
    'VEUX-TU RÉAGIR ?': 'DO YOU REACT?',
    'TU REÇOIS': 'YOU TAKE',
    'DMG DU COLLAPSE': 'COLLAPSE DMG',
    '⏱ SANS RÉPONSE, JE PASSE POUR TOI DANS': '⏱ NO ANSWER, I PASS FOR YOU IN',
    'PASSER — je ne réagis pas': 'SKIP — I don’t react',
    'PASSER LA MAIN': 'PASS',
    'PASSER': 'SKIP',
    'FINIR LE TOUR': 'END TURN',
    'CE QUE TU PEUX FAIRE': 'WHAT YOU CAN DO',
    'CARTES JOUÉES · JETS': 'PLAYED CARDS · ROLLS',
    'JOUÉES': 'PLAYED',
    '✗ ÉCHEC': '✗ FAIL',
    '✓ SUCCÈS': '✓ SUCCESS',
    'jet nu': 'raw roll',
    'résultat': 'result',
    'il fallait': 'needed',
    'DÉ': 'DIE',
    'ÉCOLES DE MAGIE': 'SCHOOLS OF MAGIC',
    'une par TOUR DE DONJON': 'one per DUNGEON TURN',
    'PRÊTE — cliquer pour la déclarer': 'READY — click to declare it',
    'EN MAIN — MAINTENANT': 'IN HAND — NOW',
    'la fenêtre les offre': 'the window offers them',
    'MAINTENANT — cliquer pour la jouer': 'NOW — click to play it',
    'INVENTAIRE — ce qu’il porte': 'INVENTORY — what it wears',
    'DÉSÉQUIPER': 'UNEQUIP',
    'LIBRE': 'EMPTY',
    'PAS FAITE': 'NOT DONE',
    'FAITE': 'DONE',
    '○  SUIVRE L’ACTION': '○  FOLLOW THE ACTION',
    '●  SUIVRE L’ACTION': '●  FOLLOW THE ACTION',
    'SUIVRE L’ACTION': 'FOLLOW THE ACTION',
    '📜  JOURNAL': '📜  LOG',
    'JOURNAL': 'LOG',
    '⚙ options · échap': '⚙ options · esc',
    '📋 rapport': '📋 report',
    '← LA TABLE': '← THE TABLE',
    'LA TABLE': 'THE TABLE',
    'TA CIBLE': 'YOUR TARGET',
    '◎ TA CIBLE': '◎ YOUR TARGET',
    'Main vide.': 'Empty hand.',
    'DÉBUT DE TOUR': 'TURN START',
    'NOUVEAU TOUR DE DONJON': 'NEW DUNGEON TURN',
    'TU ES MORT': 'YOU ARE DEAD',
    'GARDE CE QUE TU VEUX': 'KEEP WHAT YOU WANT',
    'OÙ ATTERRIS-TU ?': 'WHERE DO YOU LAND?',
    'PROCHAIN COLLAPSE': 'NEXT COLLAPSE',
    'SIGNATURE': 'SIGNATURE',
    'ACTIONS': 'ACTIONS',
    /* le panneau des OPTIONS lui-même */
    'OPTIONS': 'OPTIONS',
    'LANGUE': 'LANGUAGE',
    'TABLE': 'TABLE',
    'NOUVELLE TABLE': 'NEW TABLE',
    '●  COCHÉE': '●  ON',
    '○  DÉCOCHÉE': '○  OFF',
    'la Lanterne — la table par défaut': 'the Lantern — the default table',
    'l’ancienne table': 'the old table',
    'BOTS': 'BOTS',
    'RYTHME': 'PACE',
    'DÉVELOPPEUR': 'DEVELOPER',
    'SANG': 'BLOOD',
    'SON': 'SOUND',
    'MUSIQUE': 'MUSIC',
    'AMBIANCE': 'AMBIENCE',
    'BRUITAGES': 'SOUND EFFECTS',
    'LANGUE DU JEU': 'GAME LANGUAGE',
    'COCHÉE': 'ON',
    'DÉCOCHÉE': 'OFF',
    'LENT': 'SLOW',
    'RAPIDE': 'FAST',
    'COUPÉE': 'OFF',
    'COUPÉS': 'OFF',
    'ACTIVÉE': 'ON',
    'ACTIVÉS': 'ON',
    'EFFETS': 'EFFECTS',
    'RÉSOLUTION': 'RESOLUTION',
    'DÉFINITION': 'DEFINITION',
    'LA FENÊTRE': 'THE WINDOW',
    'FENÊTRE': 'WINDOW',
    'PLEIN ÉCRAN': 'FULLSCREEN',
    'FENÊTRÉ': 'WINDOWED',
    'TRACE DES SCÈNES': 'SCENE TRACE',
    'ENVOYER': 'SEND',
    'COPIER LA TRACE': 'COPY THE TRACE',
    'TÉLÉCHARGER': 'DOWNLOAD',
    'FERMER': 'CLOSE',
    'QUÊTES FAITES': 'QUESTS DONE',
    'aucune quête accomplie': 'no quest done',
    /* l'onglet LE DONJON (T-T5, note 211) */
    '⌖  DONJON': '⌖  DUNGEON',
    'LE DONJON': 'THE DUNGEON',
    'TOUR': 'TURN',
    'PIOCHE': 'DRAW',
    'PORTAIL': 'PORTAL',
    'TUILES': 'TILES',
    'partout': 'everywhere',
    '◂ maintenant': '◂ now',
    '◂ prochain Collapse': '◂ next Collapse',
    'pas de portail à ce tour': 'no portal this turn',
    'le portail est ouvert sur TOUTES les tuiles': 'the portal is open on EVERY Tile',
    'à l’Upkeep : aucun Collapse, aucun portail': 'at Upkeep: no Collapse, no portal',
    'COMMENT ON MARQUE': 'HOW YOU SCORE',
    /* S1410 · note 227 ③ — le Timer et la légende de la fiche v0.999 */
    'COLLAPSE · DÉGÂTS': 'COLLAPSE · DAMAGES',
    'APPARITION DU PORTAIL': 'PORTAL SPAWN',
    'FUITE  1d20+AGI vs 1d20+AGI': 'FLEE  Opposed 1d20 + AGI → Success',
    'LÉGENDE · BON À SAVOIR': 'LEGEND · GOOD TO KNOW',
    'valeur d’école : le nombre de ta fiche pour cette école. Une icône d’école dans un texte = ce nombre.': 'School value: the number on your sheet for that school. A school icon in a text = that number.',
    'Splash/AoE est un type de dégâts, pas une zone : ce qu’il touche est écrit sur la carte.': 'Splash/AoE is a damage type, not an area: what it hits is written on the card.',
    'TP = téléport': 'TP = teleport',
    'LES 20 CLASSES': 'THE 20 CLASSES',
    '⟵ DONJON': '⟵ DUNGEON',
    'chaque Mob a STR / DEX / WIS / AGI': 'Every Mob has STR / DEX / WIS / AGI',
    'quête accomplie +1 · joueur tué +1 · Last Out +1 · Boss tué +2 · Sub-Boss 0':
      'quest done +1 · player killed +1 · Last Out +1 · Boss killed +2 · Sub-Boss 0',
    'extraction : tu sors vivant, tes points sont gardés et ton équipement passe au run 2':
      'extraction: you get out alive, your points are kept and your Gear carries into run 2',
    'mourir efface les points du run en cours': 'dying wipes the points of the current run',
    'au run 1, dès qu’un joueur mène de 3 points ou plus, la partie s’arrête':
      'in run 1, as soon as a player leads by 3 points or more, the game stops',
    'égalité en tête à la fin : Duel Final': 'tie at the top at the end: Final Duel',
    '⟵ LA TABLE': '⟵ THE TABLE',
    '⟶ LE COMBAT': '⟶ THE COMBAT',
    'LE COMBAT EST FINI': 'THE COMBAT IS OVER',
    'LE COMBAT EST FINI — VOUS LOOTEZ': 'THE COMBAT IS OVER — YOU LOOT',
    'COMBAT TERMINÉ': 'COMBAT OVER',
    'un seul joueur reste debout': 'only one player left standing',
    'FIN DE TOUR': 'TURN END',
    'PREMIER JOUEUR': 'FIRST PLAYER',
    'REPLIER LE DÉTAIL': 'FOLD THE DETAIL',
    'un clic coupe': 'a click skips',
    'PASSIF': 'PASSIVE',
    'à l’entrée de sa tuile — pas une attaque': 'on entering their Tile — not an attack',
    '⊘ une décision est en attente — répondez-y d\'abord': '⊘ a decision is pending — answer it first',
    'une décision est en attente — répondez-y d\'abord': 'a decision is pending — answer it first',
    'fuite refusée': 'flee refused',
    '⊘ attend qu’un coup soit encaissé': '⊘ waits for a hit to be taken',
    'attend qu’un coup soit encaissé': 'waits for a hit to be taken',
    'contre un Mob': 'against a Mob',
    'PROCHAIN COLLAPSE — aucun à ce palier': 'NEXT COLLAPSE — none at this step',
    'porte sur le porteur — rien à désigner de plus': 'targets the bearer — nothing more to designate',
    '+ 100 SANG (test)': '+ 100 BLOOD (test)',
    'Elle se garde d’une partie à l’autre, et elle ne touche à aucune règle : c’est la même partie, montrée autrement. Décoche, et l’ancienne table revient au pixel près.':
      'It is kept from one game to the next, and it touches no rule: the same game, shown differently. Untick it, and the old table comes back pixel for pixel.',
    'Le plein écran ne change pas la mise en page : il donne plus de pixels à la même composition.':
      'Fullscreen does not change the layout: it gives more pixels to the same composition.'
  };
  /* Libellés qui portent un nombre : motif -> gabarit ($1…). */
  var FR_EN_MOTIFS = [
    /* S1427 - vu en partie (l'Arene) : la consultation d'une tuile, `view.ts` du moteur
       (`${choice.reason} — choisissez une option`). */
    [/^(.+) — entrée — choisissez une option$/, '$1 — on entering — choose an option'],
    /* S1447 - #59 (Razor Bridge) : la designation d une ENTREE de tuile, et sa description au journal. */
    [/^(.+) — entrée — choose a target$/, '$1 — on entering — choose a target'],
    [/^(.+) — entrée$/, '$1 — on entering'],
    /* S1460 - note 339 (3) : « ROLL The Trigger Hall — entrée 1d20 » (capture 7 de Croze) : le libelle du moteur
       (`tile.ts:616`, M-S1460) au milieu d'une ligne de jet. */
    [/^(.*\S) — entrée(\s+\d*d\d+\s*)$/, '$1 — on entering$2'],
    /* S1460 - note 339 (2) : l'audit a chaud EN (20 etats) — deux phrases du moteur restaient francaises. */
    [/^(⊘ )?retirer « (.+) » ferait tomber son porteur à 0 PV — interdit$/, '$1removing « $2 » would drop its bearer to 0 HP — forbidden'],
    [/^CONSULTATION — entrée au Goblin Casino — défausse 1 carte pour entrer dans la partie$/, 'CONSULTATION — entering the Goblin Casino — discard 1 card to join the game'],
    [/^(.+) — choisissez une option$/, '$1 — choose an option'],
    [/^RUN (\d+) · TOUR DE DONJON (\d+)$/, 'RUN $1 · DUNGEON TURN $2'],
    [/^(\d+) POINTS?$/, '$1 POINTS'],
    [/^(\d+) emplacement\(s\) sur cette fiche$/, '$1 slot(s) on this sheet'],
    [/^garder (\d+) carte\(s\)$/, 'keep $1 card(s)'],
    [/^RUN (\d+) · TOUR (\d+)$/, 'RUN $1 · TURN $2'],
    [/^le portail ouvre sur un jet ≥ (\d+)$/, 'the portal opens on a roll ≥ $1'],
    [/^à l’Upkeep : 1d(\d+) — le même dé fait les dégâts du Collapse et ouvre le portail$/, 'at Upkeep: 1d$1 — the same die deals the Collapse dmg and opens the portal'],
    [/^1d(\d+) = dégâts$/, '1d$1 = dmg'],
    [/^FUITE  1d20\+AGI vs 1d20\+AGI  (\d+) adversaire\(s\)$/, 'FLEE  Opposed 1d20 + AGI → Success  $1 opponent(s)'],
    [/^(\d+)\/(\d+) par tour de donjon$/, '$1/$2 per dungeon turn'],
    [/^défausser (\d+)$/, 'discard $1'],
    [/^(\d+) passif\(s\) — ils s’appliquent seuls, rien à jouer ici$/, '$1 passive(s) — they apply on their own, nothing to play here'],
    [/^la fiche n’a pas d’emplacement ([A-Z]+)$/, 'the sheet has no $1 slot'],
    [/^(\d+) tuiles en jeu, choisis celle où tu atterris$/, '$1 Tiles in play, choose the one you land on'],
    [/^(.+) — il est tombé$/, '$1 — fell'],
    [/^au moins ([\d,]+) s entre deux gestes d’un bot$/, 'at least $1 s between two bot moves'],
    [/^ton Sang : (\d+) — la monnaie achetée ; ce bouton disparaît avec Steam$/, 'your Blood: $1 — the bought currency; this button goes away with Steam'],
    [/^ta fenêtre : (.+) — échelle appliquée (.+)$/, 'your window: $1 — scale applied $2'],
    [/^(\d+) carte\(s\) pour une limite de (\d+) — aucune défausse due$/, '$1 card(s) for a limit of $2 — no discard due']
  ];

  /* ⛑ S1392 · O-T3 (note 215 ②) — TRANCHE 2, relevée au balayage des 150
     états déposés (527 textes français distincts, anglais actif) : les
     libellés FIXES les plus vus, et ceux des captures de Croze. */
  var FR_EN_2 = {
    'RIEN À VOLER': 'NOTHING TO STEAL',
    'fermer': 'close',
    '· TOI': '· YOU',
    'TOI': 'YOU',
    'PAS MAINTENANT': 'NOT NOW',
    '⏱ la scène se joue encore — ta question arrive juste après, et rien ne passera à ta place avant': '⏱ the scene is still playing — your question comes right after, and nothing will pass for you before',
    '⏱ le dé est encore en train de se montrer — le compte à rebours n’a pas commencé, et rien ne passera à ta place avant': '⏱ the die is still showing — the countdown has not started, and nothing will pass for you before',
    'CE QUI SE PASSE DANS CE COMBAT': 'WHAT HAPPENS IN THIS COMBAT',
    'Aucune carte jouée, aucun dé depuis le tour précédent.': 'No card played, no die rolled since the previous turn.',
    'TA MAIN': 'YOUR HAND',
    'autant de cartes que tu veux': 'as many cards as you want',
    'pas exploré · pas interagi': 'not explored · no interaction',
    'pas exploré · interagi': 'not explored · interacted',
    'exploré · pas interagi': 'explored · no interaction',
    'exploré · interagi': 'explored · interacted',
    'RÉACTIONS': 'REACTIONS',
    'jouables DANS leur déclencheur': 'playable IN their trigger',
    'rien à payer': 'nothing to pay',
    'hors de son déclencheur': 'outside its trigger',
    '▼ À TOI': '▼ YOUR MOVE',
    '▶ À TOI': '▶ YOUR MOVE',
    '▶ À LUI': '▶ THEIR MOVE',
    'AUCUNE TUILE — ce siège n’est sur aucune tuile en ce moment': 'NO TILE — this seat is on no Tile right now',
    'AUCUNE TUILE — le Duel Final ne se tient sur aucune tuile': 'NO TILE — the Final Duel is held on no Tile',
    'TU ES MORT — tu regardes': 'YOU ARE DEAD — you watch',
    'leurs mains restent cachées · tu ne peux plus jouer ni réagir': 'their hands stay hidden · you can no longer play or react',
    'TU REGARDES': 'YOU ARE WATCHING',
    '⟵ MON PLATEAU': '⟵ MY BOARD',
    'ÉPUISÉE': 'SPENT',
    '⊘ déjà employée ce TOUR DE DONJON — elle revient à la fin du tour de donjon, pas à la fin de ton tour': '⊘ already used this DUNGEON TURN — it comes back at the end of the dungeon turn, not at the end of your turn',
    '⊘ changer d\'équipement appartient à son propre tour de combat': '⊘ changing Gear belongs to your own combat turn',
    'CE QU’IL FAIT': 'WHAT THEY DO',
    'CE QU’IL PORTE': 'WHAT THEY WEAR',
    'PLUS DE COLLAPSE — le Duel Final n’a ni tour de donjon ni Upkeep': 'NO MORE COLLAPSE — the Final Duel has neither dungeon turn nor Upkeep',
    '⊘ un Skill se déclare sur son tour de COMBAT': '⊘ a Skill is declared on your COMBAT turn',
    'un Skill se déclare sur son tour de COMBAT': 'a Skill is declared on your COMBAT turn',
    '⊘ une fuite se déclare sur son tour de COMBAT': '⊘ fleeing is declared on your COMBAT turn',
    'une fuite se déclare sur son tour de COMBAT': 'fleeing is declared on your COMBAT turn',
    'SIGNATURE — disponible ce tour de donjon': 'SIGNATURE — available this dungeon turn',
    'SIGNATURE — jouée ce tour de donjon': 'SIGNATURE — played this dungeon turn',
    'SIGNATURE PRÊTE': 'SIGNATURE READY',
    'SIGNATURE DÉPENSÉE': 'SIGNATURE SPENT',
    'signature déjà jouée': 'signature already played',
    'planché': 'floored',
    'planché à 0': 'floored at 0',
    '— tu ne peux pas payer': '— you cannot pay',
    '⊘ une Réaction ne se déclenche qu\'en combat': '⊘ a Reaction only triggers in combat',
    'une Réaction ne se déclenche qu\'en combat': 'a Reaction only triggers in combat',
    'Rien de la partie n\'est tiré avant le dernier READY : le premier Upkeep, les tuiles de départ et le jet d\'ordre attendent derrière cette porte.': 'Nothing in the game is drawn before the last READY: the first Upkeep, the starting Tiles and the order roll wait behind this door.',
    'CHOISIS TON PERSONNAGE': 'CHOOSE YOUR CHARACTER',
    'clic = ta fiche · la partie se repose avec elle · « ? » laisse la graine choisir': 'click = your sheet · the game resets with it · « ? » lets the seed choose',
    'mode admin — éteint': 'admin mode — off',
    'Difficulté': 'Difficulty',
    'RETOUR': 'BACK',
    'CONFIRMER': 'CONFIRM',
    'Choisis ton dé': 'Choose your die',
    'JOUEUR': 'PLAYER',
    '→ les gestes sont sur le carton, encadrés en vert': '→ the moves are on the card, framed in green',
    '→ le geste est sur le carton, encadré en vert': '→ the move is on the card, framed in green',
    '⚠ RÉUSSITE CRITIQUE': '⚠ CRITICAL SUCCESS',
    '⚠ ÉCHEC CRITIQUE': '⚠ CRITICAL FAILURE',
    '⊘ le Skill de ce tour est déjà employé — un seul par tour de combat': '⊘ this turn’s Skill is already used — one per combat turn',
    'LA TABLE ATTEND — rien n’est demandé à ce siège': 'THE TABLE IS WAITING — nothing is asked of this seat',
    'plus d’Action — mais tes cartes et ta Signature restent jouables : en jouant, le tour ne se ferme que par ce bouton': 'no Action left — but your cards and your Signature stay playable: while you play, the turn only closes with this button',
    'REFUSÉ — cette situation ne s’ouvre pas. L’écran est resté sur la précédente : rien n’a bougé.': 'REFUSED — this situation does not open. The screen stayed on the previous one: nothing moved.',
    'impossible d’équiper': 'cannot equip',
    '⊘ attend que quelqu’un soit sur le point de tomber': '⊘ waits for someone about to fall',
    'attend que quelqu’un soit sur le point de tomber': 'waits for someone about to fall',
    '⊘ ce joueur est sorti du jeu': '⊘ this player has left the game',
    'ce joueur est sorti du jeu': 'this player has left the game',
    '·  ⚠ PIRE  ·  le dé du déclencheur': '·  ⚠ WORSE  ·  the trigger’s die',
    '·  le dé du déclencheur': '·  the trigger’s die',
    '·  une autre règle de relance  ·  le dé du déclencheur': '·  another reroll rule  ·  the trigger’s die',
    '·  une autre règle de relance  ·  inchangé  ·  le dé du déclencheur': '·  another reroll rule  ·  unchanged  ·  the trigger’s die',
    '·  la meilleure face, d’office  ·  le dé du déclencheur': '·  the best face, automatically  ·  the trigger’s die',
    '⊘ ce n\'est pas votre tour de combat': '⊘ it is not your combat turn',
    'ce n\'est pas votre tour de combat': 'it is not your combat turn',
    'rien à viser — un joueur de la tuile, au choix': 'nothing to target — a player on the Tile, your choice',
    '⊘ rien à viser — un joueur de la tuile, au choix': '⊘ nothing to target — a player on the Tile, your choice',
    'aucun autre moment en attente': 'no other moment waiting',
    'CE QUI EST DÛ À CE SIÈGE': 'WHAT THIS SEAT OWES',
    'une par TOUR DE DONJON — pas par tour de joueur': 'one per DUNGEON TURN — not per player turn',
    'TOUR :': 'TURN:',
    'RANGEMENT PAR ÉCOLE — six piles, capacité illimitée, aucun créneau': 'STORED BY SCHOOL — six piles, unlimited capacity, no slot',
    'les six piles sont connues en entier — capacité illimitée, rien ne manque ici': 'the six piles are fully known — unlimited capacity, nothing missing here',
    'extrait du donjon': 'extracted from the dungeon',
    '(ou laisser vide : la décision s\'ouvrira)': '(or leave empty: the decision will open)',
    '⊘ il vous manque ce que cette interaction demande': '⊘ you lack what this interaction asks for',
    '⊘ déjà employée ce tour de donjon': '⊘ already used this dungeon turn',
    'déjà employée ce tour de donjon': 'already used this dungeon turn',
    'épuisée pour ce tour de donjon': 'spent for this dungeon turn',
    'ÉGALITÉ — profite au lanceur (§6.6)': 'TIE — goes to the roller (§6.6)',
    'attend qu’une carte soit jouée': 'waits for a card to be played',
    '⊘ attend qu’une carte soit jouée': '⊘ waits for a card to be played',
    'attend qu’un mob soit tiré': 'waits for a Mob to be drawn',
    '⊘ attend qu’un mob soit tiré': '⊘ waits for a Mob to be drawn',
    'attend que quelqu’un te fuie': 'waits for someone to flee you',
    '⊘ attend que quelqu’un te fuie': '⊘ waits for someone to flee you',
    '⚑ une réponse t’est demandée — panneau ci-contre': '⚑ an answer is asked of you — panel alongside',
    '⊘ aucun tour de combat dû à ce siège (on attend une action)': '⊘ no combat turn owed by this seat (an action is awaited)',
    '⊘ aucun tour de combat dû à ce siège (on attend un choix)': '⊘ no combat turn owed by this seat (a choice is awaited)',
    'TON TOUR — tu agis': 'YOUR TURN — you act',
    'une action': 'one action',
    'le Collapse': 'the Collapse',
    '— une sortie est disponible sur cette tuile (§4.2)': '— an exit is available on this Tile (§4.2)',
    '⊘ cette carte est offerte dans une question en cours — elle ne bouge pas tant que tu n\'as pas répondu': '⊘ this card is offered in a pending question — it does not move until you answer',
    '⊘ ne se joue pas pendant un combat': '⊘ cannot be played during a combat',
    'FIN DU RUN 1': 'END OF RUN 1',
    'les scores, le stuff, et ce qui reste en main': 'the scores, the Gear, and what is left in hand',
    'repart de zéro · le stash revient en main': 'starts from zero · the stash comes back to hand',
    'clique n’importe où pour le détail des points': 'click anywhere for the point details',
    'DÉPOUILLE': 'REMAINS',
    'LE MOMENT OÙ ÇA COMPTE': 'THE MOMENT THAT COUNTS',
    'LE RUN EST FINI': 'THE RUN IS OVER',
    'la partie se termine — clique n’importe où pour aller au tableau': 'the game ends — click anywhere to go to the board',
    'la main est vide : il n\'y a rien à mettre à l\'abri': 'the hand is empty: there is nothing to keep safe',
    '⊘ on ne réarrange pas son équipement pendant qu\'une carte vient le prendre': '⊘ you don’t rearrange your Gear while a card is taking it',
    '⊘ le geste de ce tour de combat est employé': '⊘ this combat turn’s move is used',
    'le geste de ce tour de combat est employé': 'this combat turn’s move is used',
    'LE FAIRE, OU PASSER ?': 'DO IT, OR PASS?',
    'le faire': 'do it',
    '⚑ LE FAIRE, OU PASSER ? — panneau ci-contre': '⚑ DO IT, OR PASS? — panel alongside',
    'UN MOMENT — tu réponds': 'A MOMENT — you answer',
    'Le siège attendu porte « ← À LUI ».': 'The awaited seat bears « ← THEIR MOVE ».',
    '✓ semé': '✓ shaken off',
    '→ RÉUSSIE — tous semés': '→ SUCCESS — all shaken off',
    'mort — pour de bon': 'dead — for good',
    'PERSONNE N’EST RESSORTI DEBOUT': 'NOBODY CAME OUT STANDING',
    'vous POUVEZ — on vous le demandera, refuser ne coûte rien': 'you MAY — you will be asked, refusing costs nothing',
    'portée non connue sur cette carte — rien à désigner': 'range unknown on this card — nothing to designate',
    '· jusqu’à la fin du tour en cours': '· until the end of the current turn',
    'VERROU — trois voies, et elles ne coûtent pas pareil :': 'LOCK — three ways, and they do not cost the same:',
    'BRISER — défausser cette carte (sans jet)': 'BREAK — discard this card (no roll)',
    'BRISER — la clé': 'BREAK — the key',
    'Le tour de': 'The turn of',
    'est suspendu et reprendra après cette fenêtre.': 'is suspended and will resume after this window.',
    'Qui de vous deux entre en lice ?': 'Which of you two steps into the ring?',
    'MOI — j’entre en lice': 'ME — I step in',
    'PASSER — je ne désigne personne': 'PASS — I name nobody',
    'pt PERDU — il en avait déjà gagné, il ne lui en reste aucun': 'pt LOST — they had earned some, none are left',
    '·  collapse  ·  il reste': '·  collapse  ·  left:',
    'PV)  ·  à': 'HP)  ·  at',
    'COMBAT': 'COMBAT',
    'REVENIR': 'BACK',
    'je me débrouille': 'I’ll manage',
    'cliquer sur la ligne la déclare': 'click the line to declare it',
    'cliquer sur la bande la déclare': 'click the band to declare it',
    'survol ou tabulation pour l’agrandir': 'hover or tab to enlarge',
    'disponible': 'available',
    'fiche imprimée — survol ou tabulation pour l’agrandir': 'printed sheet — hover or tab to enlarge',
    'à débloquer aux Bounty Wall': 'to unlock in the Bounty Wall',
    'aucun personnage à toi — TOUT DÉVERROUILLER est dans LES VIVRES, au HOME': 'no character of your own — UNLOCK EVERYTHING is in LES VIVRES, at HOME',
    'retour au HOME (Bounty Wall, Vault, LES VIVRES)': 'back to HOME (Bounty Wall, Vault, LES VIVRES)',
    'ta cible : ton attaque part sur lui': 'your target: your attack goes at it',
    'ne réagit à rien : elle se déclenche par un coût': 'reacts to nothing: it is triggered by a cost',
    'le commit et l’heure où TON serveur a démarré (JOUER.bat) — à citer dans tout signalement. S’il date d’hier, ferme la fenêtre noire et relance : le code a bougé depuis, ton écran ne l’a pas': 'the commit and time YOUR server started (JOUER.bat) — quote it in any report. If it dates from yesterday, close the black window and relaunch: the code has moved since, your screen has not',
    'ouvrir le mode admin (?debug=1) — ce n\'est pas l\'écran du joueur': 'open admin mode (?debug=1) — not the player’s screen',
    'graine · tour · qui la partie attend · depuis combien de temps plus rien ne bouge · les 40 dernières lignes du journal — un symptôme = un collage. Marche partie figée, et sans presse-papier.': 'seed · turn · who the game waits for · how long nothing has moved · the last 40 log lines — one symptom = one paste. Works on a frozen game, and without clipboard.',
    'la NOUVELLE TABLE, le son (ambiance · musique) et la résolution — Échap ouvre et referme, comme dans MTG Arena, Hearthstone et Slay the Spire : elle ferme ce qui est ouvert, et s’il n’y a rien d’ouvert, elle ouvre ce panneau': 'the NEW TABLE, sound (ambience · music) and resolution — Esc opens and closes, as in MTG Arena, Hearthstone and Slay the Spire: it closes what is open, and if nothing is open, it opens this panel',
    'bascule vers la vue compacte — le jeu continue dessous, et la scène finit de se raconter en petit': 'switch to the compact view — the game goes on underneath, and the scene finishes in small',
    'la pièce retourne dans ta main': 'the piece goes back to your hand',
    'tout lire en grand — Échap pour revenir': 'read it all in big — Esc to go back',
    'la table normale, avec les joueurs — le combat continue · Échap': 'the normal table, with the players — the combat goes on · Esc',
    'revenir au combat': 'back to the combat',
    'retombe : définitif': 'falls back: permanent',
    'la vue suit celui qui joue — clique pour revenir à ton plateau': 'the view follows whoever plays — click to go back to your board',
    'le joueur précédent (flèche gauche)': 'previous player (left arrow)',
    'le joueur suivant (flèche droite)': 'next player (right arrow)',
    'revenir à mon plateau — Échap aussi': 'back to my board — Esc too',
    'changer d\'équipement appartient à son propre tour de combat': 'changing Gear belongs to your own combat turn',
    'tu valides la fiche de chaque siège, l’un après l’autre — au lieu de laisser la graine choisir pour eux': 'you confirm each seat’s sheet, one after the other — instead of letting the seed choose for them',
    'le Skill de ce tour est déjà employé — un seul par tour de combat': 'this turn’s Skill is already used — one per combat turn',
    'MOVE — PIOCHE une tuile du deck et s’y rend. La destination est SUBIE (SPEC §5.3) : on ne choisit pas où l’on va, et on ne clique pas une tuile déjà en jeu.': 'MOVE — DRAWS a Tile from the deck and goes there. The destination is FORCED (SPEC §5.3): you do not choose where you go, and you do not click a Tile already in play.',
    'cette carte est offerte dans une question en cours — elle ne bouge pas tant que tu n\'as pas répondu': 'this card is offered in a pending question — it does not move until you answer',
    'attend qu’un coup soit encaissé': 'waits for a hit to be taken',
    'le geste de ce tour de combat est employé': 'this combat turn’s move is used',
    'la vue suivra toute seule celui qui joue': 'the view will follow whoever plays',
    'tout le journal de la partie — Échap pour revenir': 'the whole game log — Esc to go back',
    'les tours du donjon, le portail, comment on marque — Échap pour revenir': 'the dungeon turns, the portal, how to score — Esc to go back',
    'replier le détail': 'fold the details',
    'ce n’est pas le classement des dés : c’est le tour de table.': 'this is not the dice ranking: it is the seating order.',
    'déplier le détail': 'unfold the details',
    'NOUVEAU TOUR DE DONJON': 'NEW DUNGEON TURN',
    'COMBAT TERMINÉ': 'COMBAT OVER',
    'LE MOB FUIT': 'THE MOB FLEES',
    'LE COLLAPSE BONDIT': 'THE COLLAPSE STRIKES',
    'LE DONJON CHANGE': 'THE DUNGEON SHIFTS',
    'TROC SANS SUITE': 'TRADE FELL THROUGH',
    'CARTES DE DÉPART EN PLUS': 'EXTRA STARTING CARDS',
    'LE PLUS HAUT ENCAISSE': 'THE HIGHEST TAKES IT',
    'CONTRÉ': 'COUNTERED',
    'REDIRIGÉ': 'REDIRECTED',
    '⊘ rien à viser — tous les adversaires du combat': '⊘ nothing to target — all opponents in the combat',
    'rien à viser — tous les adversaires du combat': 'nothing to target — all opponents in the combat',
    'rien à viser — un présent de la tuile, joueur ou Mob, lanceur exclu — au choix': 'nothing to target — anyone on the Tile, player or Mob, caster excluded — your choice',
    '⊘ rien à viser — un présent de la tuile, joueur ou Mob, lanceur exclu — au choix': '⊘ nothing to target — anyone on the Tile, player or Mob, caster excluded — your choice',
    'porte sur celui dont l’action a déclenché l’effet — rien à désigner de plus': 'applies to the one whose action triggered the effect — nothing more to designate',
    'réveillée : UNE CARTE VIENT D’ÊTRE JOUÉE': 'woken: A CARD WAS JUST PLAYED',
    'Compris !': 'Got it!'
  };
  for (var k2 in FR_EN_2) {
    if (Object.prototype.hasOwnProperty.call(FR_EN_2, k2)) FR_EN[k2] = FR_EN_2[k2];
  }

  /* Les fragments qui reviennent DANS les lignes à motif (ce que la carte lit
     sur un dé, pourquoi un combat se clôt) : traduits dans le groupe capturé. */
  var FRAGMENTS = [
    [/la face du dé ([\d-]+)/g, 'die face $1'],
    [/le total modifié atteint (\d+)/g, 'the modified total reaches $1'],
    [/le total modifié ne dépasse pas (\d+)/g, 'the modified total is at most $1'],
    [/le jet réussit, réussite critique comprise/g, 'the roll succeeds, critical success included'],
    [/le jet échoue, échec critique compris/g, 'the roll fails, critical failure included'],
    [/s’applique quoi qu’il arrive/g, 'applies whatever happens'],
    [/le plus BAS jet de la portée/g, 'the LOWEST roll in range'],
    [/l’échec critique/g, 'the critical failure'],
    [/la cible désignée est un Mob/g, 'the chosen target is a Mob'],
    [/le joueur a choisi l’option (\d+)/g, 'the player chose option $1'],
    [/PLUS AUCUN COMBATTANT SUR LA TUILE — mort, fuite ou déplacement subi/g, 'NO FIGHTER LEFT ON THE TILE — death, flight or forced move'],
    [/PLUS AUCUN COMBATTANT EN LICE/g, 'NO FIGHTER LEFT IN THE RING'],
    [/plus aucun adversaire debout/g, 'no opponent left standing'],
    [/un seul joueur reste debout/g, 'a single player still stands'],
    [/il a fui — son dé est passé/g, 'fled — the roll passed'],
    [/il a quitté la tuile/g, 'left the Tile'],
    [/il a pris le portail/g, 'took the portal'],
    [/il est tombé/g, 'fell'],
    [/contre un Mob/g, 'against a Mob'],
    [/le Collapse/g, 'the Collapse'],
    [/ ou /g, ' or '],
    [/— hors tuile/g, '— off Tile'],
    [/NOUVEAU TOUR DE DONJON/g, 'NEW DUNGEON TURN'],
    [/COMBAT TERMINÉ/g, 'COMBAT OVER'],
    [/LE MOB FUIT/g, 'THE MOB FLEES'],
    [/LE COLLAPSE BONDIT/g, 'THE COLLAPSE STRIKES'],
    [/LE DONJON CHANGE/g, 'THE DUNGEON SHIFTS'],
    [/TROC SANS SUITE/g, 'TRADE FELL THROUGH'],
    [/CARTES DE DÉPART EN PLUS/g, 'EXTRA STARTING CARDS'],
    [/LE PLUS HAUT ENCAISSE/g, 'THE HIGHEST TAKES IT'],
    [/CONTRÉ/g, 'COUNTERED'],
    [/REDIRIGÉ/g, 'REDIRECTED'],
    [/⚠ le fait visé \(seq (\d+)\) n’est pas dans la vue/g, '⚠ the targeted fact (seq $1) is not in the view'],
    [/qu’un dé soit lancé/g, 'a die being rolled'],
    [/portail à (\d+)\+/g, 'portal at $1+'],
    [/le début d’un tour de joueur/g, 'the start of a player turn'],
    [/que quelqu’un entre sur une tuile/g, 'someone entering a Tile'],
    [/\bTOI\b/g, 'YOU']
  ];
  function fragments(s) {
    for (var i = 0; i < FRAGMENTS.length; i += 1) s = s.replace(FRAGMENTS[i][0], FRAGMENTS[i][1]);
    return s;
  }
  function avecFragments(gabarit) {
    return function () {
      var a = arguments;
      return gabarit.replace(/\$(\d)/g, function (m, k) { return fragments(String(a[Number(k)])); });
    };
  }
  var FR_EN_MOTIFS_2 = [
    [/^Jouer (.+) \?$/, 'Play $1?'],
    [/^à toi : (.+)$/, 'your move: $1'],
    [/^(.+) · (.+) · (-?\d+) PV sur (\d+) · (\d+) carte\(s\) · (.+)$/, avecFragments('$1 · $2 · $3 HP out of $4 · $5 card(s) · $6')],
    [/^somme réelle (-?\d+) — écrasée à 0 par le plancher \(§2\.1\). Retirer un malus ne rendra rien tant que la dette n'est pas comblée\.$/, 'real sum $1 — floored at 0 (§2.1). Removing a malus gives nothing back until the debt is covered.'],
    [/^([A-Z]+) (-?\d+) — base (-?\d+) · modificateur (-?\d+) · planché à 0 \(somme réelle (-?\d+), §2\.1\)$/, '$1 $2 — base $3 · modifier $4 · floored at 0 (real sum $5, §2.1)'],
    [/^gear score (\d+) — ce qu'il porte, pesé par rareté \((.+)\)$/, 'Gear score $1 — what they wear, weighted by rarity ($2)'],
    [/^on pioche ([A-Z]+) à ce palier$/, 'draws $1 at this step'],
    [/^(\d+) quête\(s\) accomplie\(s\) : (.+)$/, '$1 quest(s) done: $2'],
    [/^(\d+) PV sur (\d+)$/, '$1 HP out of $2'],
    [/^agrandir le carton de (.+) — texte imprimé compris$/, 'enlarge the card of $1 — printed text included'],
    [/^la pièce retourne dans ta main — coûtera (\d+) PV$/, 'the piece goes back to your hand — it will cost $1 HP'],
    [/^sa main : (\d+) cartes? — cachée$/, 'their hand: $1 card(s) — hidden'],
    [/^équiper → ([A-Z]+)$/, 'equip → $1'],
    [/^→ (.+) COMMENCE$/, '→ $1 GOES FIRST'],
    [/^TOUR (\d+)$/, 'TURN $1'],
    [/^pioche ([A-Z]+)(.*)$/, avecFragments('draws $1$2')],
    [/^(\d+) siège\(s\) · (\d+) dé chacun(.*)$/, '$1 seat(s) · $2 die each$3'],
    [/^(.*?)(\d+) rouleurs · (\d+) dés? chacun(.*)$/, '$1$2 rollers · $3 die each$4'],
    [/^ORDRE DU TOUR \(horaire, pivoté sur le premier\)(.*)$/, 'TURN ORDER (clockwise, from the first)$1'],
    [/^(.+) — (\d+) dé\(s\) lus FACE PAR FACE\. La somme ne décide rien$/, '$1 — $2 dice read FACE BY FACE. The sum decides nothing'],
    [/^(.+) — (\d+) dé\(s\) lus SÉPARÉMENT, chacun dans sa propre table\. Aucune somme : elle ne désignerait rien$/, '$1 — $2 dice read SEPARATELY, each in its own table. No sum: it would designate nothing'],
    [/^TOI(\s+)(\d*[dD]\d+.*)$/, 'YOU$1$2'],
    [/^Joueur (\d+)$/, 'Player $1'],
    [/^(.+) · Joueur (\d+)$/, '$1 · Player $2'],
    [/^ARÈNE — (.+)$/, 'ARENA — $1'],
    [/^PROCHAIN COLLAPSE — au prochain Upkeep · (1d\d+) au palier courant$/, 'NEXT COLLAPSE — at the next Upkeep · $1 at the current step'],
    [/^(⊘ )?il faut défausser (\d+) carte\(s\), la main en compte (\d+)$/, '$1you must discard $2 card(s), the hand holds $3'],
    [/^→ la carte demandait (.+) — cette face ne l’a pas donné$/, avecFragments('→ the card asked for $1 — this face did not give it')],
    [/^→ la carte lit cette face : (.+)$/, avecFragments('→ the card reads this face: $1')],
    [/^(\d+) emplacement\(s\) sur cette fiche · refusé\(s\) : (.+)$/, '$1 slot(s) on this sheet · refused: $2'],
    [/^T(\d+) · ⚔ COMBAT CLOS — (.+)$/, avecFragments('T$1 · ⚔ COMBAT CLOSED — $2')],
    [/^T(\d+) · ⚔ COMBAT CLOS$/, 'T$1 · ⚔ COMBAT CLOSED'],
    [/^T(\d+) · ⚔ COMBAT OUVERT — (.+)  ·  à$/, 'T$1 · ⚔ COMBAT OPENED — $2  ·  at'],
    [/^T(\d+) · (.+) joue « (.+) »  ·  carte$/, 'T$1 · $2 plays « $3 »  ·  card'],
    [/^T(\d+) · 🎲 DÉ RELANCÉ — (.+)$/, 'T$1 · 🎲 DIE REROLLED — $2'],
    [/^⟶ LE COMBAT · (.+) · ROUND (\d+)$/, avecFragments('⟶ THE COMBAT · $1 · ROUND $2')],
    [/^: (.+)  ·  ordre : (.+)  ·  AGI décroissante — aucun dé$/, ': $1  ·  order: $2  ·  AGI descending — no die'],
    [/^PV\)  ·  ordre : (.+)  ·  AGI décroissante — aucun dé$/, 'HP)  ·  order: $1  ·  AGI descending — no die'],
    [/^(\d+) carte\(s\) pour une limite de (\d+) — la scène finit de donner$/, '$1 card(s) for a limit of $2 — the scene is still dealing'],
    [/^(\d+) cartes pour une limite de (\d+) — clique dans ta main les cartes que tu jettes$/, '$1 cards for a limit of $2 — click the cards you throw away in your hand'],
    [/^FINIR LE TOUR — (\d+) à défausser \((\d+) cochée\(s\)\)$/, 'END TURN — $1 to discard ($2 checked)'],
    [/^(\d+) cartes? en main$/, '$1 card(s) in hand'],
    [/^⏭ (\d+) scène\(s\) non montrée\(s\) — la file en tient (\d+)(.*)$/, avecFragments('⏭ $1 scene(s) not shown — the queue holds $2$3')],
    [/^JET  (.+) — entrée  (\d*d\d+)$/, 'ROLL  $1 — entry  $2'],
    [/^JET  (.+)$/, 'ROLL  $1'],
    [/^ÉQUIPER → ([A-Z]+)$/, 'EQUIP → $1'],
    [/^proposer à (.+)$/, 'offer to $1'],
    [/^Emplacement pris — déséquipe (.+) pour poser celle-ci$/, 'Slot taken — unequip $1 to put this one on'],
    [/^T(\d+) · ── TOUR DE (.+) —$/, 'T$1 · ── $2’S TURN —'],
    [/^T(\d+) · ━━━ NOUVEAU TOUR DE DONJON$/, 'T$1 · ━━━ NEW DUNGEON TURN'],
    [/^T(\d+) · ☠ (.+) est mort — tué par (.+)\. Personne ne marque\.(.*)$/, avecFragments('T$1 · ☠ $2 died — killed by $3. Nobody scores.$4')],
    [/^T(\d+) · PASSIF — (.+) · (.+) \(s’applique sur (.+)\)$/, avecFragments('T$1 · PASSIVE — $2 · $3 (applies on: $4)')],
    [/^T(\d+) · (.+) entre dans (.+)  ·  en piochant une tuile$/, 'T$1 · $2 enters $3  ·  by drawing a Tile'],
    [/^T(\d+) · (.+) équipe (.+) → ([A-Z]+)$/, 'T$1 · $2 equips $3 → $4'],
    [/^Le corps de (.+)$/, 'The body of $1'],
    [/^LOOT A CORPSE — (.+) \((\d+) carte\(s\)\)$/, 'LOOT A CORPSE — $1 ($2 card(s))'],
    [/^(\d+) pièce\(s\) équipable\(s\) — dans la main, ci-contre$/, '$1 equippable piece(s) — in hand, alongside'],
    [/^tirage de table — aucun dé · intervalle (.+) → « (.+) »$/, 'table draw — no die · range $1 → « $2 »'],
    [/^(\d*d\d+) · intervalle (.+) → « (.+) »  ·  ⚠ touche toute la table, où qu’ils soient dans le donjon$/, '$1 · range $2 → « $3 »  ·  ⚠ hits the whole table, wherever they are in the dungeon'],
    [/^(\d*d\d+) · intervalle (.+) → « (.+) »  ·  ⚠ touche tous les joueurs présents sur la tuile, engagés ou non$/, '$1 · range $2 → « $3 »  ·  ⚠ hits every player on the Tile, engaged or not'],
    [/^Nouvelle partie — seed (\d+) · la table valide son READY$/, 'New game — seed $1 · the table confirms its READY'],
    [/^(\d+) siège\(s\) à valider :$/, '$1 seat(s) to confirm:'],
    [/^serveur démarré (.+)$/, 'server started $1'],
    [/^T(\d+) · 🐾 RENCONTRE DÉCLARÉE — (.+)  ·  (.+)  ·  réveillée en explorant$/, 'T$1 · 🐾 ENCOUNTER DECLARED — $2  ·  $3  ·  woken by exploring'],
    [/^on attend : (.+)$/, avecFragments('waiting for: $1')],
    [/^défausser (\d+) à (\d+)$/, 'discard $1 to $2'],
    [/^réveillée par un (\d+)$/, 'woken by a $1'],
    [/^T(\d+) · INTERACTION — (.+) · « (.+) » sur (.+)$/, 'T$1 · INTERACTION — $2 · « $3 » on $4'],
    [/^T(\d+) · CARTE JOUÉE — « (.+) » a résolu$/, 'T$1 · CARD PLAYED — « $2 » resolved'],
    [/^T(\d+) · TUILE RÉSOLUE — (.+)$/, 'T$1 · TILE RESOLVED — $2'],
    [/^T(\d+) · BRANCHE — aucune ne tient$/, 'T$1 · BRANCH — none holds'],
    [/^T(\d+) · BRANCHE — s’applique quoi qu’il arrive$/, 'T$1 · BRANCH — applies whatever happens'],
    [/^T(\d+) · ═══ FIN DU RUN — tous morts ou extraits$/, 'T$1 · ═══ END OF THE RUN — all dead or extracted'],
    [/^T(\d+) · TÉLÉPORT — (.+) → une tuile piochée du deck courant, subie$/, 'T$1 · TELEPORT — $2 → a Tile drawn from the current deck, forced'],
    [/^T(\d+) · DÉFAUSSE — (.+) ·$/, 'T$1 · DISCARD — $2 ·'],
    [/^CONSULTATION — (.+) · posée par (.+)  ·  (\d+) invité\(s\), (\d+) en attente$/, 'CONSULTATION — $1 · asked by $2  ·  $3 invited, $4 waiting'],
    [/^les camps : (.+)$/, 'the sides: $1'],
    [/^(.+) — qu’il y aille$/, '$1 — let them go'],
    [/^=  (\d+) dégâts bruts \(§8\.1\) — les PV suivent, à l'écriture$/, '=  $1 raw dmg (§8.1) — HP follow when written'],
    [/^SA DERNIÈRE TUILE CONNUE — (.+) — elle n’est plus en jeu$/, 'THEIR LAST KNOWN TILE — $1 — no longer in play'],
    [/^(.+) — RIEN NE S’EST PASSÉ$/, '$1 — NOTHING HAPPENED'],
    [/^ÉCOLE CHOISIE · (.+)$/, 'SCHOOL CHOSEN · $1'],
    [/^·  (.+)  ·  il est à$/, '·  $1  ·  they are at'],
    [/^·  (.+)  ·  il reste$/, '·  $1  ·  left:'],
    [/^T(\d+) · ♦ GOBLIN CASINO FERMÉ — égalité à$/, 'T$1 · ♦ GOBLIN CASINO CLOSED — tie at'],
    [/^(.+) n’a aucune carte de gear en main — sa main est révélée quand même$/, '$1 has no Gear card in hand — their hand is revealed anyway'],
    [/^(.+) n’a aucune carte à voler — sa main est révélée quand même$/, '$1 has nothing to steal — their hand is revealed anyway'],
    [/^(.+) n’a aucune carte en main — rien à voler$/, '$1 has no card in hand — nothing to steal'],
    [/^main révélée : (.+)$/, 'hand revealed: $1']
  ];
  FR_EN_MOTIFS = FR_EN_MOTIFS.concat(FR_EN_MOTIFS_2);

  /* S1419 - note 241 (1) : LES PHRASES DU MOTEUR. Le moteur publie des phrases francaises
     (raisons de jouabilite, refus, verdicts, journal) que l ecran recopie ; `tools/langue.py`
     (le moteur) en compte 503. Tant qu il ne publie pas de cles, ce lexique les traduit a
     l affichage. Paires lues dans `packages/engine/src`, une par phrase. */
  var FR_EN_MOTEUR = {
    "ne fait rien, par décision — carburant à Signature": "does nothing, by design — fuel for a Signature",
    "⊘ ne fait rien, par décision — carburant à Signature": "⊘ does nothing, by design — fuel for a Signature",
    "cette cible n'est pas atteignable dans la portée visée": "this target is out of the chosen range",
    "la cible a quitté le combat avant que le coup ne porte — aucun PV retiré": "the target left the combat before the hit landed — no HP removed",
    "la cible est IMMUNISÉE contre ce coup — aucun PV retiré": "the target is IMMUNE to this hit — no HP removed",
    "égalité des deux jets : aucune différence — aucun PV retiré": "both rolls tied: no difference — no HP removed",
    "hors partie — une carte détruite ne va pas sous le deck": "out of the game — a destroyed card does not go under the deck",
    "tout gardé : k ≥ N": "all kept: k ≥ N",
    "tranché : cette ligne ne fait rien — ce n'est pas un oubli": "ruled: this line does nothing — it is not an oversight",
    "aucun six : les mises sont perdues": "no six: the stakes are lost",
    "aucune mise : rien n'est joué": "no stake: nothing is played",
    "montant inchangé — la réduction appliquée au calcul est celle de l'ancien destinataire": "amount unchanged — the reduction applied to the calculation is the former recipient's",
    "le vol est passé : la main révélée reste entière": "the steal was passed: the revealed hand stays whole",
    "aucun : la destination se tire parmi les uniques du deck": "none: the destination is drawn among the deck's uniques",
    "aucun : une seule tuile en jeu": "none: only one Tile in play",
    "aucun : une seule tuile tirée": "none: only one Tile drawn",
    "aucune tuile — le compte vaut zéro": "no Tile — the count is zero",
    "DAMAGE_DEALT a été lu sur ce coup avant son annulation — le gain produit chez l'attaquant n'est pas repris": "DAMAGE_DEALT was read on this hit before its cancellation — the gain made by the attacker is not taken back",
    "une décision est déjà en attente — la question du dé ne s'empile pas sur une autre, et toucher un dé non désigné serait choisir à sa place": "a decision is already pending — the die question does not stack on another one, and touching an undesignated die would be choosing in their place",
    "la relance a eu lieu — le joueur garde l'un des deux résultats": "the reroll happened — the player keeps one of the two results",
    "la relance est retombée sur la même face : il n'y a qu'un résultat": "the reroll landed on the same face: there is only one result",
    "le joueur pose la face du dé — aucune seed consommée": "the player sets the die face — no seed consumed",
    "First Strike octroyé dans la fenêtre d'ouverture — le tri se refait, une fois, avant que quiconque ait agi": "First Strike granted in the opening window — the order is re-sorted, once, before anyone has acted",
    "affrontement d'ouverture gagné — RPS passe devant First Strike et AGI": "opening clash won — RPS goes before First Strike and AGI",
    "un combattant est entré en cours de combat — l'ordre est retrié par AGI , et la parole reste à celui qui l'avait": "a fighter joined mid-combat — the order is re-sorted by AGI, and the turn stays with whoever had it",
    "le rouleur n'est plus en donjon": "the roller is no longer in the dungeon",
    "un coup létal est déposé — la série s'arrête à la balle qui tue": "a lethal hit is set down — the series stops at the killing bullet",
    "une ligne s'est suspendue pendant qu'une autre attendait sa reprise": "a line was suspended while another was waiting to resume",
    "la dernière sortie l'avait rendue au deck : elle en est retirée": "the last exit had returned it to the deck: it is removed from it",
    "temps écoulé — la réponse prudente par défaut a été appliquée": "time's up — the safe default answer was applied",
    "aucun : rien n'avait été distribué — la mise défaussée reste perdue": "none: nothing had been dealt — the discarded stake stays lost",
    "fermé sans condition de fin remplie": "closed with no end condition met",
    "le porteur n'est plus un combattant debout — fuite, désengagement ou mort": "the bearer is no longer a standing fighter — Flee, disengagement or death",
    "une carte a annulé la fuite : le départ n'a pas lieu": "a card cancelled the Flee: the departure does not happen",
    "cette carte n'est plus chez lui : elle a quitté sa main ou son équipement avant qu'il ne réponde": "this card is no longer theirs: it left their hand or Gear before they answered",
    "cette pièce ne peut plus quitter son porteur — la retirer le ferait tomber à zéro, ou elle ne se retire pas": "this piece can no longer leave its bearer — removing it would drop them to zero, or it cannot be removed",
    "hors partie — un sacrifice ne va pas sous le deck": "out of the game — a sacrifice does not go under the deck",
    "plusieurs ont fait le plus haut : ceux-là relancent, les autres sont battus": "several rolled the highest: they reroll, the others are beaten",
    "les deux sont tombés dans le même échange : égalité, personne ne gagne la partie": "both fell in the same exchange: tie, nobody wins the game",
    "les deux camps sont tombés dans le même échange : égalité, personne ne gagne la partie": "both sides fell in the same exchange: tie, nobody wins the game",
    "le mob n'est plus en jeu pour se blesser": "the Mob is no longer in play to hurt itself",
    "ce siège a quitté le donjon pendant la ronde — sa face ne compte plus": "this seat left the dungeon during the round — its face no longer counts",
    "ce monstre ne peut pas être tué": "this monster cannot be killed",
    "portée vide : la fuite n'est offerte à personne": "empty range: the Flee is offered to nobody",
    "le lot de cette ligne n'est plus là — personne ne pourrait le relire": "this line's batch is gone — nobody could read it back",
    "le mob qui jouait cette ligne n'est plus en jeu": "the Mob playing this line is no longer in play",
    "plus aucun participant dans le donjon entre le dépôt et la résolution  — la rencontre est abandonnée, aucun mob n'a été tiré": "no participant left in the dungeon between declaration and resolution — the encounter is abandoned, no Mob was drawn",
    "hors partie — une pièce détruite ne va pas sous le deck": "out of the game — a destroyed piece does not go under the deck",
    "le maximum tombe à la fermeture de la fenêtre de mort": "the maximum drops when the death window closes",
    "sous le deck de sa rareté — `discard` est une défausse": "under its rarity deck — `discard` is a discard",
    "le porteur n'est plus en donjon": "the bearer is no longer in the dungeon",
    "ce passif au coup ne sait donner que des cartes à qui a frappé": "this on-hit passive can only give cards to whoever struck",
    "les PV ont monté pendant la fenêtre de mort": "HP went up during the death window",
    "un plancher de survie a été posé pendant la fenêtre de mort": "a survival floor was set during the death window",
    "elle a quitté le jeu : la liste a été proposée avant qu'elle ne parte": "it left play: the list was offered before it left",
    "il y est déjà : la liste a été proposée avant qu'il n'y arrive": "they are already there: the list was offered before they arrived",
    "sous leur deck d'origine, dans l'ordre de tirage": "under their original deck, in draw order",
    "le passif a disparu entre la question et sa réponse": "the passive vanished between the question and its answer",
    "une autre décision est déjà ouverte — la question ne peut pas se poser": "another decision is already open — the question cannot be asked",
    "refus enregistré — mais les lignes qui frappent toute la tuile t'atteignent quand même, la tuile est partagée": "refusal recorded — but lines that hit the whole Tile still reach you, the Tile is shared",
    "refus enregistré — rien n'est encaissé, le combat a lieu ailleurs": "refusal recorded — nothing is taken, the combat is elsewhere",
    "le coût d'une pièce portée suspendrait — aucun chemin de reprise sur ce type de déclaration": "the cost of a worn piece would suspend — no resume path for this kind of declaration",
    "aucun tueur — ni point ni dépouille (le donjon ne frappe au nom de personne). Main et gear ne sont PAS retirés : la dépouille s'écrit du point de vue du tueur et ne dit rien de ce cas": "no killer — no point and no remains (the dungeon strikes in nobody's name). Hand and Gear are NOT removed: the remains are written from the killer's point of view and say nothing about this case",
    "un déclencheur ouvre la fenêtre": "a trigger opens the window",
    "R3 — aucune action à l'expiration : le siège passe automatiquement": "R3 — no action at expiry: the seat passes automatically",
    "le jet a échoué : rien ne s'est appliqué, la charge est rendue": "the roll failed: nothing applied, the charge is given back",
    "la cellule de cette carte ne porte aucune ligne d'effet : il n'y a rien à exécuter": "this card's cell carries no effect line: there is nothing to execute",
    "plus aucun combat : la fuite n'a plus d'objet": "no combat left: the Flee is moot",
    "un dé est en l'air : la fuite attend qu'il ait sa fenêtre, et un second lot effacerait le premier": "a die is in the air: the Flee waits for its window, and a second batch would erase the first",
    "retenu avant que la fuite ne se résolve": "held back before the Flee resolves",
    "la forme machine d'une redirection conditionnée au personnage n'existe pas encore": "the machine form of a character-conditioned redirect does not exist yet",
    "les deux sièges se sont taus : le tournoi n’a pas de champion": "both seats stayed silent: the tournament has no champion",
    "le passif a disparu du catalogue entre l'affrontement et sa reprise": "the passive vanished from the catalog between the clash and its resumption",
    "le passif a disparu du catalogue entre le jet et sa reprise": "the passive vanished from the catalog between the roll and its resumption",
    "aucun nombre annoncé — le silence ne prédit rien": "no number announced — silence predicts nothing",
    "une annonce a été faite — sa valeur ne sera publiée qu'à la révélation": "an announcement was made — its value will only be published at the reveal",
    "la consultation ne porte ni son fait ni son porteur — rien à marquer": "the consultation carries neither its fact nor its bearer — nothing to mark",
    "le combat s'est clos pendant la consultation — la marque n'a plus de moment": "the combat closed during the consultation — the mark no longer has a moment",
    "égalité — on rejoue jusqu'à résolution": "tie — replay until resolved",
    "un joueur mort ne marque plus de points": "a dead player scores no more points",
    "ce passif n'a pas de ligne d'attaque : cette op en demande une": "this passive has no attack line: this op requires one",
    "ce passif ne produit rien, et c'est voulu": "this passive produces nothing, and that is intended",
    "le combat est terminé — il n'y a plus personne à qui échapper": "the combat is over — there is nobody left to escape from",
    "le combat a atteint son plafond de rounds : le mob se retire": "the combat reached its round cap: the Mob withdraws",
    "aucune ligne d'attaque ne couvre cette face — le mob ne frappe pas": "no attack line covers this face — the Mob does not strike",
    "ce monstre s'en va : son passif l'a fait fuir avant qu'il frappe": "this monster leaves: its passive made it flee before it struck",
    "le mob qui avait jeté ce dé ne joue plus ce tour — personne ne le lira": "the Mob that rolled this die no longer plays this turn — nobody will read it",
    "la ligne qui avait jeté ce dé ne reviendra pas le lire": "the line that rolled this die will not come back to read it",
    "plus personne à viser quand la ligne a repris : le prix est payé, la ligne ne fait rien": "nobody left to target when the line resumed: the price is paid, the line does nothing",
    "la ligne n'a pas lieu — « If correct: Target deal 0 »": "the line does not happen — « If correct: Target deal 0 »",
    "le combat appartient à la tuile — quitter la tuile en sort": "the combat belongs to the Tile — leaving the Tile leaves it",
    "aucune cible valide dans la portée visée": "no valid target in the aimed range",
    "le joueur a quitté cette tuile avant que son entrée ne soit servie": "the player left this Tile before its entry was served",
    "le joueur n'est plus en donjon": "the player is no longer in the dungeon",
    "la victime n'est plus en donjon": "the victim is no longer in the dungeon",
    "le verrou n'était plus là quand le dé est revenu — la fenêtre du jet l'a levé, ou le joueur a quitté le donjon": "the lock was gone when the die came back — the roll's window lifted it, or the player left the dungeon",
    "vous n'avez ni clé ni crochet — la défausse et le jet restent ouverts, et cette tentative ne coûte pas d'Action": "you have neither key nor lockpick — discarding and rolling stay open, and this attempt costs no Action",
    "choisis la pièce à détruire": "choose the piece to destroy",
    "la face se choisit — le dé se pose, il ne se relance pas": "the face is chosen — the die is set, not rerolled",
    "mets de côté autant de cartes que tu veux — elles reviendront en fin de run": "set aside as many cards as you want — they will come back at the end of the run",
    "quel dé ?": "which die?",
    "sa main vous est révélée — prenez ce que vous emportez": "their hand is revealed to you — take what you carry off",
    "un effet t'est proposé": "an effect is offered to you",
    "Le Goblin Casino : tu joues, ou tu file vers une tuile au hasard (gratuitement) ?": "The Goblin Casino: do you play, or slip away to a random Tile (for free)?",
    "ton partenaire te réclame cette carte": "your partner claims this card from you",
    "ce coup n'a pas traversé le calcul des dégâts (Collapse, prix en PV) — il n'a pas de noyau à reprendre, et le montant ne se devine pas": "this hit did not go through the dmg calculation (Collapse, HP cost) — it has no core to take back, and the amount cannot be guessed",
    "cette capacité ne produira rien avec l'arme portée": "this ability will produce nothing with the weapon worn",
    "la cible du coup a disparu": "the hit's target is gone",
    "First Strike hors combat : il n'y a aucun ordre d'initiative à fixer": "First Strike out of combat: there is no initiative order to set",
    "First Strike hors de la fenêtre d'ouverture : l'ordre se fige à l'ouverture et ne se recalcule pas en cours de combat": "First Strike outside the opening window: the order is locked at the opening and is not recomputed during combat",
    "aucun adversaire fourni pour le jet opposé — le combat doit le désigner": "no opponent given for the opposed roll — the combat must designate one",
    "aucun affrontement n'a été ouvert pour cette ligne : elle ne désigne aucun joueur adverse": "no showdown was opened for this line: it designates no opposing player",
    "aucun check à lancer": "no check to roll",
    "aucun combat en cours : il n'y a pas de combat à quitter": "no combat in progress: there is no combat to leave",
    "aucun combat en cours : il n'y a pas de mob tiré à relancer": "no combat in progress: there is no drawn Mob to reroll",
    "aucun combat ouvert — la promesse doit suivre l'engagement qu'elle récompense": "no combat open — the promise must follow the engagement it rewards",
    "aucun combat à quitter": "no combat to leave",
    "aucun coup LÉTAL en attente — personne à sauver": "no LETHAL hit pending — nobody to save",
    "aucun coup de dégâts ne précède dans cette branche — « relance le jet » n'a pas d'objet, et en lancer un neuf serait autre chose": "no dmg hit comes before in this branch — « reroll the roll » has no object, and rolling a new one would be something else",
    "aucun coup en attente porté par le lanceur — rien à rediriger": "no pending hit dealt by the caster — nothing to redirect",
    "aucun coup en attente contre le lanceur — rien à rediriger": "no pending hit against the caster — nothing to redirect",
    "aucun coup en attente contre la cible — rien à alourdir": "no pending hit against the target — nothing to make heavier",
    "aucun coup en attente contre le lanceur — rien à transformer": "no pending hit against the caster — nothing to transform",
    "aucun coup en attente porté par le lanceur — rien à multiplier": "no pending hit dealt by the caster — nothing to multiply",
    "aucun des joueurs visés n'est sur une tuile : rien à réarmer": "none of the targeted players is on a Tile: nothing to rearm",
    "aucun dé dans le contexte : « modifier le résultat » n'a pas d'objet": "no die in context: « modify the result » has no object",
    "aucun dé dans le contexte : « poser une face » n'a pas d'objet": "no die in context: « set a face » has no object",
    "aucun dé dans le contexte : « relance » n'a pas d'objet, et en lancer un nouveau serait autre chose": "no die in context: « reroll » has no object, and rolling a new one would be something else",
    "aucun exécuteur sur le chemin des CAPACITÉS ; si elle se résout sur la PILE ou par une ligne de MOB, c'est attendu": "no executor on the ABILITIES path; if it resolves on the STACK or through a MOB line, that is expected",
    "aucun joueur en donjon n'est résolu": "no player in the dungeon is resolved",
    "aucun joueur résolu": "no player resolved",
    "aucun joueur visé : personne ne défausse": "no player targeted: nobody discards",
    "aucun joueur visé : personne ne paie": "no player targeted: nobody pays",
    "aucun joueur visé : personne ne pioche": "no player targeted: nobody draws",
    "aucun joueur visé : personne ne roule": "no player targeted: nobody rolls",
    "aucun joueur visé : personne à déplacer": "no player targeted: nobody to move",
    "aucun joueur visé : personne à voler": "no player targeted: nobody to steal from",
    "aucun joueur visé : rien à faire crouler": "no player targeted: nothing to collapse",
    "aucun joueur à engager dans la portée visée": "no player to engage in the targeted range",
    "aucun mob au combat : rien à vaincre": "no Mob in the combat: nothing to defeat",
    "aucun mob dans ce combat à renforcer": "no Mob in this combat to reinforce",
    "aucun mob dans la portée visée — cette op ne vise que des mobs": "no Mob in the targeted range — this op only targets Mobs",
    "aucun mob debout à tuer": "no standing Mob to kill",
    "aucun mob nommé": "no Mob named",
    "aucun mob visé : cette op fait quitter le combat à un mob, et la portée n'en désigne aucun": "no Mob targeted: this op makes a Mob leave the combat, and the range designates none",
    "aucun monstre à relancer : cette relance a besoin du monstre qui vient d'être tiré, et rien ne le lui a donné": "no monster to reroll: this reroll needs the monster just drawn, and nothing gave it one",
    "aucun montant à absorber": "no amount to absorb",
    "aucun montant à ajouter": "no amount to add",
    "aucun montant — un entier signé est attendu (+n ou -n)": "no amount — a signed integer is expected (+n or -n)",
    "aucun type retenu — cette ligne ne passe pas par une déclaration qui puisse en demander un": "no type chosen — this line does not go through a declaration that could ask for one",
    "aucune annonce secrète n'a été ouverte pour cette ligne : cette ligne-ci n'en ouvre pas, il n'y avait personne à interroger sur la tuile, ou une consultation était déjà ouverte": "no secret announcement was opened for this line: this line opens none, there was nobody on the Tile to ask, or a consultation was already open",
    "aucune arme équipée et aucune arme de fiche": "no equipped weapon and no sheet weapon",
    "aucune autre tuile en jeu : il n'y a nulle part où se téléporter": "no other Tile in play: there is nowhere to teleport to",
    "aucune capacité n'est nommée — l'identifiant de la capacité visée est attendu": "no ability is named — the targeted ability's identifier is expected",
    "aucune carte en cours de résolution : le sacrifice ne sait pas ce qu'il détruirait, et le deviner choisirait une pièce au hasard": "no card being resolved: the sacrifice does not know what it would destroy, and guessing would pick a piece at random",
    "aucune carte piochée à relancer. La marque de dernière pioche n'est posée que par une pioche — un don, un vol ou une dépouille entrent en main sans être piochés": "no drawn card to reroll. The last-draw mark is only set by a draw — a gift, a theft or a corpse loot enter the hand without being drawn",
    "aucune cible : cette portée doit être désignée ou venir d'un déclencheur": "no target: this range must be designated or come from a trigger",
    "aucune cible : il n'y a personne à prédire": "no target: there is nobody to predict",
    "aucune cible : la portée n'en désigne aucune": "no target: the range designates none",
    "aucune cible : la portée ne trouve personne": "no target: the range finds nobody",
    "aucune cible : la portée ne trouve personne d'autre que le lanceur": "no target: the range finds nobody but the caster",
    "aucune cible : le déclencheur n'en désigne aucune": "no target: the trigger designates none",
    "aucune cible : personne à faire jeter": "no target: nobody to make roll",
    "aucune cible : personne à téléporter": "no target: nobody to teleport",
    "aucune cible : personne à verrouiller": "no target: nobody to lock",
    "aucune cible MOB : un joueur ne se dépouille pas ainsi": "no MOB target: a player is not stripped this way",
    "aucune cible déplaçable — toutes hors combat ou hors donjon": "no movable target — all out of combat or out of the dungeon",
    "aucune cible joueur — un mob n'a pas de réserve de vie qui grandit": "no player target — a Mob has no life pool that grows",
    "aucune cible joueur — un mob ne survit pas ainsi": "no player target — a Mob does not survive this way",
    "aucune cible joueur — une arme de mob ne se modifie pas ainsi": "no player target — a Mob's weapon is not modified this way",
    "aucune cible à faire fuir": "no target to make flee",
    "aucune cible — la ligne doit nommer le coup qu'elle touche": "no target — the line must name the hit it affects",
    "aucune durée n'est posée : un décalage qui n'expire jamais n'est pas ce que le carton promet — c'est la colonne qui porte la fenêtre": "no duration is set: an offset that never expires is not what the card promises — the column is what carries the window",
    "aucune ligne d'attaque numérotée chez ce combattant — il n'y a rien à prédire": "no numbered attack line on this fighter — there is nothing to predict",
    "aucune offre n'a été posée pour cette ligne : elle ne désigne aucun joueur": "no offer was made for this line: it designates no player",
    "aucune option retenue : le choix d'option ne vaut que sur les effets de tuile": "no option chosen: the option choice only applies to Tile effects",
    "aucune portée : qui engage-t-on ?": "no range: who is being engaged?",
    "aucune portée résolue": "no range resolved",
    "aucune source : « depuis quoi » n'est pas écrit": "no source: « from what » is not written",
    "aucune tuile à détruire : le lanceur n'est nulle part": "no Tile to destroy: the caster is nowhere",
    "aucune valeur — un nombre est attendu, ou la face la plus haute": "no value — a number is expected, or the highest face",
    "aucune école retenue — cette ligne ne passe pas par une déclaration qui puisse en demander une": "no school chosen — this line does not go through a declaration that could ask for one",
    "ce combat n'a pas de tuile (Duel Final) — on n'y entre pas": "this combat has no Tile (Final Duel) — it cannot be entered",
    "ce mode de vol n'est pas arbitré": "this steal mode is not ruled",
    "ce monstre n'est plus dans ce combat — on ne relance pas un absent": "this monster is no longer in this combat — an absent one is not rerolled",
    "ce siège n'est plus là": "this seat is gone",
    "cette Action offerte est restreinte, et le moteur n'a pas d'Action restreinte : son compteur ne demande jamais à quoi elle sert": "this offered Action is restricted, and the engine has no restricted Action: its counter never asks what it is for",
    "cette ligne fait jeter sa portée entière ET porte des opérations : même question sans réponse écrite que la base de dégâts — une fois, ou une fois par cible ?": "this line makes its whole range roll AND carries operations: same question with no written answer as the dmg base — once, or once per target?",
    "cette ligne fait jeter sa portée entière ET porte une base de dégâts : celle-ci s'applique-t-elle une fois, ou une fois par cible ? Aucune ligne du corpus ne le dit": "this line makes its whole range roll AND carries a dmg base: does it apply once, or once per target? No line in the corpus says",
    "cette ligne n'est pas une carte — il n'y a rien à donner": "this line is not a card — there is nothing to give",
    "cette montée de butin est restreinte, et le moteur n'a pas de montée restreinte : elle s'applique au prochain butin, quel qu'il soit": "this loot upgrade is restricted, and the engine has no restricted upgrade: it applies to the next loot, whatever it is",
    "cette offre viserait plusieurs sièges à la fois, et rien n'écrit si un seul oui suffirait": "this offer would target several seats at once, and nothing says whether a single yes would be enough",
    "cette tuile n'est plus en jeu": "this Tile is no longer in play",
    "deux pièces portées renforcent la même capacité : l'ordre des renforts n'est pas arbitré": "two worn pieces reinforce the same ability: the order of reinforcements is not ruled",
    "dé adverse hors grammaire": "opposing die outside the grammar",
    "déjà à destination — rien à déplacer": "already at destination — nothing to move",
    "engager un joueur est un PvP : ni condition de mob ni invitation de Fake Coop ne s'y appliquent": "engaging a player is PvP: neither a Mob condition nor a Fake Coop invitation applies",
    "faire fuir un mob n'est pas spécifié": "making a Mob flee is not specified",
    "hors combat : aucun adversaire pour riposter": "out of combat: no opponent to strike back",
    "hors combat : aucun mob à tuer": "out of combat: no Mob to kill",
    "hors combat : il n'y a aucun combat ouvert à rejoindre": "out of combat: there is no open combat to join",
    "hors combat : « until the end of the fight » n'a pas de fin à nommer": "out of combat: « until the end of the fight » has no end to name",
    "jet opposé : plus aucun adversaire debout": "opposed roll: no opponent left standing",
    "jet opposé contre une portée : personne d'autre que le lanceur": "opposed roll against a range: nobody but the caster",
    "jet opposé hors combat et sans cible désignée : aucun adversaire": "opposed roll out of combat and with no designated target: no opponent",
    "l'adversaire est un mob : un mob n'a pas d'attaque d'arme, ses lignes tombent à son tour — l'op ne fait rien": "the opponent is a Mob: a Mob has no weapon attack, its lines land on its turn — the op does nothing",
    "l'opposition a changé pendant que les dés étaient offerts — les faces ne désignent plus les mêmes adversaires": "the opposition changed while the dice were offered — the faces no longer designate the same opponents",
    "la carte de la ligne n'a pas de donneur à désigner": "the line's card has no giver to designate",
    "la cellule ne nomme aucun mode de vol": "the cell names no steal mode",
    "la cible a quitté la partie": "the target has left the game",
    "la cible n'a encore rien pioché : il n'y a pas de dernière carte": "the target has not drawn anything yet: there is no last card",
    "la cible n'est plus dans le combat": "the target is no longer in the combat",
    "la cible ne porte aucune pièce d'équipement — il n'y a rien à détruire": "the target wears no Gear piece — there is nothing to destroy",
    "la cible visée n'est pas sur cette tuile": "the chosen target is not on this Tile",
    "la dernière carte piochée par la cible n'est plus dans sa main": "the last card drawn by the target is no longer in their hand",
    "la destination est un joueur, et personne n'est désigné": "the destination is a player, and nobody is designated",
    "la destruction au hasard n'est écrite nulle part : aucune carte ne la demande, et l'inventer choisirait une pièce sans règle": "random destruction is written nowhere: no card asks for it, and inventing it would pick a piece with no rule",
    "la formule de cette ligne est déjà groupée : le renfort de la pièce portée y ferait des parenthèses dans des parenthèses": "this line’s formula is already grouped: the worn piece’s boost would put parentheses inside parentheses",
    "la ligne a suspendu avant sa relance : elle ne se rejouera pas": "the line paused before its repeat: it will not replay",
    "la portée du tournoi se lit « la tuile » ou « partout », rien de plus": "the tournament’s range reads « the Tile » or « anywhere », nothing more",
    "le deck de pièges est vide": "the trap deck is empty",
    "le destinataire n'est plus en donjon : aucun coup ne lui est redirigé": "the recipient is no longer in the dungeon: no hit is redirected to them",
    "le destinataire n'est plus en donjon : la carte ne lui va pas": "the recipient is no longer in the dungeon: the card doesn’t go to them",
    "le donneur n'est plus en donjon : il n'a plus de main à donner": "the giver is no longer in the dungeon: they have no hand left to give",
    "le filtre manque : il s'écrit, il ne se sous-entend pas": "the filter is missing: it must be written, not implied",
    "le jet a été décliné par son lanceur — la ligne continue sans jet": "the roll was declined by its roller — the line goes on without a roll",
    "le jet n'est pas ouvert : aucune de ses conditions ne tient — la ligne continue sans jet": "the roll is not open: none of its conditions holds — the line goes on without a roll",
    "le joueur n'est sur aucune tuile": "the player is on no Tile",
    "le lanceur n'est pas sur la tuile de ce combat — « mobs in your tile » ne désigne personne": "the caster is not on this combat’s Tile — « mobs in your tile » designates no one",
    "le lanceur n'est pas à la table": "the caster is not at the table",
    "le lanceur n'est plus là pour se blesser": "the caster is no longer there to hurt themself",
    "le lanceur n'est sur aucune tuile": "the caster is on no Tile",
    "le lanceur n'est sur aucune tuile — la boucle n'a pas de lieu": "the caster is on no Tile — the loop has no place",
    "le lot rendu par la fenêtre porte moins de dés que la volée a de sièges : les faces ne désignent plus personne": "the batch returned by the window holds fewer dice than the volley has seats: the faces designate no one anymore",
    "le porteur est déjà dans ce combat — on n'y entre pas deux fois": "the bearer is already in this combat — you don’t enter it twice",
    "le porteur n'est pas dans l'ordre de ce combat : aucun rang à lui donner": "the bearer is not in this combat’s order: no rank to give them",
    "le porteur n'est pas sur la tuile de ce combat — on rejoint un combat où l'on se tient": "the bearer is not on this combat’s Tile — you join a combat where you stand",
    "le rang RPS est déjà posé pour ce siège : un affrontement ne se gagne qu'une fois par ouverture": "the RPS rank is already set for this seat: a contest is won only once per opening",
    "le renouvellement n'est pas dit : la cellule doit choisir entre une permission qui se consomme (la mort ne rendra plus rien) et une qui reste (elle rendra quand même)": "renewal is not stated: the cell must choose between a permission that is spent (death will give nothing back) and one that stays (it will give back anyway)",
    "le rouleur n'est plus là": "the roller is gone",
    "les PV maximum ne se déplacent pas par modificateur : la fiche les exclut, et ils s'écrivent impérativement à l'équipement": "max HP don’t move by modifier: the sheet excludes them, and they must be written on the Gear",
    "non branchée": "not wired",
    "on ne se donne pas sa propre main": "you don’t give yourself your own hand",
    "on ne se vole pas soi-même": "you don’t steal from yourself",
    "personne n'était à retenir : la portée de cette ligne ne désigne aucun joueur": "no one to hold: this line’s range designates no player",
    "plus aucun adversaire debout — rien à encaisser": "no opponent left standing — no hit to take",
    "plus aucun autre monstre de cette catégorie dans la pile — la relance rendrait le monstre même qu'on vient de remettre": "no other monster of this category left in the pile — the reroll would give back the very monster just put back",
    "rien n'a été défaussé sur cette ligne — la rareté à rendre n'a aucune source": "nothing was discarded on this line — the rarity to give back has no source",
    "rien à défausser — la main est vide de ce qui est demandé": "nothing to discard — the hand holds none of what is asked",
    "téléporter un mob n'est pas spécifié": "teleporting a mob is not specified",
    "un combat est déjà en cours": "a combat is already under way",
    "un des deux n'est plus en donjon : rien ne change de main": "one of the two is no longer in the dungeon: nothing changes hands",
    "un mob se renforce autrement : il porte ses propres bonus de combat , pas les modificateurs de fiche": "a mob is boosted differently: it carries its own combat bonuses, not sheet modifiers",
    "une cible précédente de la même ligne attend une décision : la suspension en série n'est pas bâtie, et servir celle-ci se ferait sur un monde à moitié écrit": "a previous target of the same line awaits a decision: serial suspension is not built, and serving this one would happen on a half-written world",
    "une consultation est déjà ouverte : le tournoi ne peut pas s'y ajouter": "a consultation is already open: the tournament can’t be added to it",
    "une consultation est déjà ouverte — deux questions ne s'empilent pas": "a consultation is already open — two questions don’t stack",
    "une décision est déjà en attente — la main révélée ne s'empile pas sur une autre question": "a decision is already pending — the revealed hand doesn’t stack on another question",
    "une décision est déjà en attente — la question de la face ne s'empile pas sur une autre": "a decision is already pending — the face question doesn’t stack on another",
    "une prédiction se pose sur un combattant — hors combat, personne": "a prediction is placed on a fighter — out of combat, there’s no one",
    "verrouiller un mob n'est pas spécifié": "locking a mob is not specified",
    "verrouillé — on ne quitte pas la tuile": "locked — you can’t leave the Tile",
    "voleur ou volé inconnu": "thief or victim unknown",
    "volée sans check : rien à faire jeter": "volley with no check: no one to make roll",
    "« (vide) » ne nomme aucune des deux bornes connues": "« (empty) » names neither of the two known limits",
    "« (vide) » n'est pas une forme arbitrée : seules la carte en cours et la main entière le sont": "« (empty) » is not a ruled form: only the current card and the whole hand are",
    "échanger sa place avec un mob n'est pas spécifié": "swapping places with a mob is not specified",
    "Le Goblin Casino (Ruins) — mise en secret : combien de cartes défausses-tu ?": "The Goblin Casino (Ruins) — secret stake: how many cards do you discard?",
    "le joueur n'est plus en donjon — une application de Collapse n'a pas de sujet": "the player is no longer in the dungeon — a Collapse application has no subject",
    "ce chemin de déclaration ne fournit aucun rouleur de Réaction": "this declaration path provides no Reaction roller",
    "la carte à sacrifier n'est pas nommée : la deviner choisirait une pièce au hasard": "the card to sacrifice is not named: guessing it would pick a piece at random",
    "le nombre est laissé au choix du joueur, sans plafond : ni la cellule ni la ressource ne bornent la question. En inventer une borne serait une règle d'équilibrage": "the number is left to the player’s choice, with no cap: neither the cell nor the resource bounds the question. Inventing a bound would be a balance rule",
    "un nombre est demandé, et rien dans la donnée ne dit lequel : le déduire d'un plafond ferait passer une absence pour un choix": "a number is asked for, and nothing in the data says which: deducing it from a cap would pass an absence off as a choice",
    "une décision est déjà en attente — « you may » ne peut pas s'ouvrir": "a decision is already pending — « you may » can’t open",
    "on ne réarrange pas son équipement pendant qu'une carte vient le prendre": "you don’t rearrange your Gear while a card is taking it",
    "Prédisez SECRÈTEMENT le numéro de la prochaine ligne d'attaque": "SECRETLY predict the number of the next attack line",
    "Prédisez SECRÈTEMENT le total de dégâts, AVANT réduction": "SECRETLY predict the total dmg, BEFORE reduction",
    "il vous manque ce que cette interaction demande": "you lack what this interaction asks for",
    "la contre-proposition est sur la table — tu fermes, ou tu laisses ?": "the counter-offer is on the table — do you close, or walk away?",
    "on te propose un échange : contre-propose, ou refuse — refuser ne coûte rien": "you’re offered a trade: counter-offer, or refuse — refusing costs nothing",
    "présente les cartes que tu mets sur la table — ta main, et les pièces que tu portes": "show the cards you put on the table — your hand, and the pieces you wear",
    "un seul joueur en jeu : rien à désigner": "a single player in play: nothing to designate",
    "capacité passive : elle ne se déclare pas, on ne te la propose jamais": "passive ability: it is not declared, you are never offered it",
    "un prix à payer": "a price to pay",
    "une cible à désigner": "a target to choose",
    "une option à retenir": "an option to pick",
    "Dépouille : prenez ce que vous voulez, le reste demeure sur lui": "Remains: take what you want, the rest stays on the body",
    "une carte à choisir dans la liste": "a card to choose from the list",
    "une carte à choisir dans la main révélée": "a card to choose from the revealed hand",
    "choisis le type de ta prochaine attaque d'arme": "choose the type of your next weapon attack",
    "choisis l'école de ta prochaine attaque d'arme": "choose the school of your next weapon attack",
    "choisis le type du coup qui t'arrive": "choose the type of the incoming hit",
    "choisis l'école du coup qui t'arrive": "choose the school of the incoming hit",
    "défausse tout": "discards all",
    "étourdit": "stuns",
    "ton tour se termine": "your turn ends",
    "Jouer — ouvrir la partie aux occupants de la tuile": "Play — open the game to the Tile’s occupants",
    "Ne pas lancer": "Don’t roll",
    "Partir — une tuile au hasard, gratuitement": "Leave — a random Tile, for free",
    "Fuite offerte sans jet — accepter : tu quittes le combat et pars sur une tuile tirée au hasard · rester : rien, le combat continue · ne rien dire vaut rester": "Flee offered with no roll — accept: you leave the combat and go to a randomly drawn Tile · stay: nothing, the combat goes on · saying nothing means staying",
    "votre bague ouvre le choix — désignez qui prend le piège": "your ring opens the choice — choose who takes the trap",
    "une carte à présenter dans la liste": "a card to present from the list",
    "une pièce portée, à présenter dans la liste": "a worn piece, to present from the list",
    "répond à la fenêtre avant que le tour ne reprenne": "answers the window before the turn resumes",
    "ne se joue pas pendant un combat": "cannot be played during a combat",
    "ce geste se déclare sur son tour de COMBAT": "this move is declared on your COMBAT turn",
    "un dé est en l'air — il attend sa fenêtre": "a die is in the air — it waits for its window",
    "attend son déclencheur": "waits for its trigger",
    "siège inconnu": "unknown seat",
    "déclaration non arbitrée": "declaration not ruled on",
    "déjà employée": "already used",
    "pièce portée sans déclencheur : c'est un passif": "worn piece with no trigger: it is a passive",
    "cette portée ne touche personne ici — rien à viser": "this range hits nobody here — nothing to target",
    "aucune fuite hors du donjon — il n'y a nulle part où aller": "no Flee out of the dungeon — there is nowhere to go",
    "le Collapse n'a ni type ni école : il n'y a rien à changer sur ce coup": "the Collapse has neither type nor school: there is nothing to change on this hit",
    "ne déclare aucun déclencheur : se joue à votre tour, ou à votre tour de combat": "declares no trigger: played on your turn, or on your combat turn",
    "ne fait rien, par décision — carburant à Signature": "does nothing, by design — fuel for a Signature",
    "retirée du jeu jouable au classeur": "removed from the playable game in the card sheet",
    "cette ligne exige un combat, et ce porteur n'est engagé dans aucun": "this line requires a combat, and this bearer is engaged in none",
    "fuite : verrouillé : on ne quitte pas la tuile": "Flee: locked — you can’t leave the Tile",
    "AGI décroissante — aucun dé": "AGI descending — no die",
    "PLUS AUCUN COMBATTANT EN LICE": "NO FIGHTER LEFT IN THE RING",
    "plus aucun adversaire debout": "no opponent left standing",
    "plus aucun joueur debout — personne ne l'emporte": "no player left standing — nobody wins",
  };
  for (var km in FR_EN_MOTEUR) {
    if (Object.prototype.hasOwnProperty.call(FR_EN_MOTEUR, km) && !Object.prototype.hasOwnProperty.call(FR_EN, km)) FR_EN[km] = FR_EN_MOTEUR[km];
  }
  FR_EN_MOTIFS = FR_EN_MOTIFS.concat([
    [new RegExp("^le montant \\((-?\\d+)\\) n'a pas passé la défense de la cible — aucun PV retiré$"), "the amount ($1) did not get past the target's defense — no HP removed"],
    [new RegExp("^« (.+?) » vaut 0 pour ce porteur — aucun PV retiré$"), "« $1 » is 0 for this bearer — no HP removed"],
    [new RegExp("^le total accumulé \\((-?\\d+)\\) ne passe pas la défense — aucun PV retiré$"), "the accumulated total ($1) does not get past the defense — no HP removed"],
    [new RegExp("^le palier du tour (\\d+) n'a pas de dé de Collapse$"), "the step of turn $1 has no Collapse die"],
    [new RegExp("^(-?\\d+) mob\\(s\\) promis ne sont pas morts — fuite ou combat clos autrement$"), "$1 promised mob(s) are not dead — Flee or combat closed otherwise"],
    [new RegExp("^deck (.+?) épuisé$"), "$1 deck exhausted"],
    [new RegExp("^la tuile « (.+?) » est introuvable au catalogue$"), "Tile « $1 » is not in the catalog"],
    [new RegExp("^le piège « (.+?) » est introuvable au catalogue$"), "trap « $1 » is not in the catalog"],
    [new RegExp("^« (.+?) » est introuvable au catalogue$"), "« $1 » is not in the catalog"],
    [new RegExp("^ex æquo à (-?\\d+) PV — le porteur de Cake a désigné$"), "tied at $1 HP — the Cake bearer chose"],
    [new RegExp("^la fenêtre de respawn est le run 1, tours 1 à (\\d+)$"), "the respawn window is run 1, turns 1 to $1"],
    [new RegExp("^le dé d'exploration est tombé sur (-?\\d+), et la table de « (.+?) » ne va que de (.+?) — un modificateur l'a poussé au-delà, et ce que ça donne n'est pas encore tranché : rien ne se passe$"), "the exploration die landed on $1, and the table of « $2 » only covers $3 — a modifier pushed it beyond, and what that gives is not ruled yet: nothing happens"],
    [new RegExp("^(\\d+) tuiles tirées, choisis celle où tu atterris$"), "$1 Tiles drawn, choose the one you land on"],
    [new RegExp("^(.+?) — quel mode d'attaque \\? ① (.+?) \\(([a-z]+)\\) · ② (.+?) \\(([a-z]+), et l'arme est détruite\\)$"), "$1 — which attack mode? ① $2 ($3) · ② $4 ($5, and the weapon is destroyed)"],
    [new RegExp("^(.+?) — quel mode d'attaque \\? ① (.+?) \\(([a-z]+)\\) · ② (.+?) \\(([a-z]+)\\)$"), "$1 — which attack mode? ① $2 ($3) · ② $4 ($5)"],
    [new RegExp("^Lancer (.+?) \\? La carte l'offre, elle ne l'impose pas\\.$"), "Roll $1? The card offers it, it does not force it."],
    [new RegExp("^défausse subie — (\\d+) carte\\(s\\)$"), "forced discard — $1 card(s)"],
    [new RegExp("^défausse subie — (\\d+) carte\\(s\\) \\((.+?)\\)$"), "forced discard — $1 card(s) ($2)"],
    [new RegExp("^mets de côté jusqu'à (\\d+) carte\\(s\\) — elles reviendront en fin de run$"), "set aside up to $1 card(s) — they will come back at the end of the run"],
    [new RegExp("^(.+?) atteint — rien n'est encore distribué\\. Relancer (\\d+)d(\\d+) pour du (.+?) \\? Un (\\d+) et tout le monde repart les mains vides\\.$"), "$1 reached — nothing is dealt yet. Reroll $2d$3 for $4? A $5 and everyone leaves empty-handed."],
    [new RegExp("^(.+?) — (\\d+) joueurs à (-?\\d+) PV : désigne qui le prend$"), "$1 — $2 players at $3 HP: choose who takes it"],
    [new RegExp("^(.+?) — ta bague ouvre le choix : désigne qui le prend, les PV n'entrent pas en compte$"), "$1 — your ring opens the choice: choose who takes it, HP do not count"],
    [new RegExp("^(\\d+) destinataire\\(s\\) désigné\\(s\\) — un coup va sur UNE cible$"), "$1 recipient(s) designated — a hit goes to ONE target"],
    [new RegExp("^(\\d+) joueurs visés : la cellule ne dit pas si « n » se compte par victime ou en tout$"), "$1 players targeted: the cell does not say whether « n » counts per victim or in total"],
    [new RegExp("^(\\d+) joueurs visés : une destination à choisir ne se suspend que pour un seul — aucun porteur du corpus ne le demande$"), "$1 players targeted: a destination choice only pauses for one player — no card in the corpus asks for it"],
    [new RegExp("^(\\d+) joueurs visés : une défausse subie ne se suspend que pour un seul — aucun porteur du corpus ne le demande$"), "$1 players targeted: a forced discard only pauses for one player — no card in the corpus asks for it"],
    [new RegExp("^(\\d+) joueurs visés : une pioche à garder ne se suspend que pour un seul — aucun porteur du corpus ne le demande$"), "$1 players targeted: a draw-to-keep only pauses for one player — no card in the corpus asks for it"],
    [new RegExp("^(\\d+) tuile\\(s\\) demandée\\(s\\), (\\d+) dans le deck (.+?) portant l'école (.+?)$"), "$1 Tile(s) requested, $2 in the $3 deck bearing the $4 school"],
    [new RegExp("^(\\d+) tuile\\(s\\) demandée\\(s\\), (\\d+) dans le deck (.+?)$"), "$1 Tile(s) requested, $2 in the $3 deck"],
    [new RegExp("^(\\d+) demandée\\(s\\), (\\d+) carte\\(s\\) misée\\(s\\) : le compte et le fil ne s'accordent pas, et la rareté des cartes en trop n'est écrite nulle part$"), "$1 requested, $2 card(s) staked: the count and the stake do not match, and the rarity of the extra cards is written nowhere"],
    [new RegExp("^(\\d+) cartes demandées — il n'y a qu'une seule dernière carte piochée$"), "$1 cards requested — there is only one last drawn card"],
    [new RegExp("^(\\d+) destinataire\\(s\\) désigné\\(s\\) — une main va vers UNE main$"), "$1 recipient(s) designated — a hand goes to ONE hand"],
    [new RegExp("^(\\d+) donneur\\(s\\) désigné\\(s\\) — une main va vers UNE main$"), "$1 giver(s) designated — a hand goes to ONE hand"],
    [new RegExp("^(\\d+) adversaires en combat, et aucun jet de fuite raté à lire : seuls ripostent ceux contre qui la fuite a échoué, et il n'y en a pas ici$"), "$1 opponents in combat, and no failed Flee roll to read: only those the Flee failed against strike back, and there are none here"],
    [new RegExp("^(.+?) : sa ligne de butin ne donne rien — aucune carte à prendre$"), "$1: its loot line gives nothing — no card to take"],
    [new RegExp("^(.+?) vient de réapparaître — No Spawn Kill$"), "$1 just respawned — No Spawn Kill"],
    [new RegExp("^destinataire non arbitré : « (.+?) »$"), "recipient not ruled: « $1 »"],
    [new RegExp("^donneur non arbitré : « (.+?) »$"), "giver not ruled: « $1 »"],
    [new RegExp("^(.+?) porte plusieurs dés : les conditions de face liraient la somme, pas une face — le champ des faces individuelles manque$"), "$1 has several dice: face conditions would read the sum, not a face — the individual-faces field is missing"],
    [new RegExp("^aucun coup n'a pu tomber : (.+?)$"), "no hit could land: $1"],
    [new RegExp("^aucun mob tué — (.+?)$"), "no Mob killed — $1"],
    [new RegExp("^aucune riposte n'a pu tomber : (.+?)$"), "no counterattack could land: $1"],
    [new RegExp("^aucune tuile unique dans le deck (.+?) : elles sont toutes en jeu$"), "no unique Tile in the $1 deck: they are all in play"],
    [new RegExp("^avancer de (-?\\d+) : le Timer ne va que vers l'avant — reculer le Collapse n'est écrit nulle part$"), "advance by $1: the Timer only moves forward — moving the Collapse back is written nowhere"],
    [new RegExp("^compte de pièges illisible : « (.+?) »$"), "unreadable trap count: « $1 »"],
    [new RegExp("^coup rejoué : (.+?)$"), "hit replayed: $1"],
    [new RegExp("^deck (.+?) épuisé : (\\d+) carte\\(s\\) sur (\\d+)$"), "deck $1 exhausted: $2 card(s) out of $3"],
    [new RegExp("^destination non arbitrée : « (.+?) »$"), "destination not ruled: « $1 »"],
    [new RegExp("^durée hors des six connues : « (.+?) »$"), "duration outside the six known ones: « $1 »"],
    [new RegExp("^dé hors grammaire : « (.+?) »$"), "die outside the grammar: « $1 »"],
    [new RegExp("^déjà verrouillé : (.+?) — rien à poser$"), "already locked: $1 — nothing to set"],
    [new RegExp("^formule d'arme hors grammaire : « (.+?) »$"), "weapon formula outside the grammar: « $1 »"],
    [new RegExp("^garde non arbitrée : « (.+?) »$"), "guard not ruled: « $1 »"],
    [new RegExp("^jet opposé contre (\\d+) adversaires sans que la ligne en désigne un : la règle ne tranche que la fuite, pas un jet opposé collectif — à trancher$"), "opposed roll against $1 opponents without the line designating one: the rule only settles Flee, not a collective opposed roll — to be settled"],
    [new RegExp("^l'arme de fiche « (.+?) » n'a pas de formule normalisée$"), "the sheet weapon « $1 » has no normalized formula"],
    [new RegExp("^l'axe « (.+?) » n'a pas de lecteur — seuls les dégâts portent un canal en sortie$"), "the axis « $1 » has no reader — only dmg carries an output channel"],
    [new RegExp("^la cible n'a rien à se faire prendre — main de (\\d+) carte\\(s\\), (\\d+) demandée\\(s\\)$"), "the target has nothing to be taken — hand of $1 card(s), $2 requested"],
    [new RegExp("^la condition « (.+?) » porte sur un mob nommé ; un tirage au hasard exclut déjà les morts de son pool$"), "the condition « $1 » is about a named Mob; a random draw already excludes the dead from its pool"],
    [new RegExp("^la face (.+?) est hors du dé — un 1d(\\d+) ne la montre pas, et la raboter rendrait la cellule fausse en silence$"), "face $1 is off the die — a 1d$2 doesn’t show it, and clamping it would silently make the cell wrong"],
    [new RegExp("^la portée « (.+?) » résout (\\d+) joueur\\(s\\) : un échange en veut exactement un$"), "range « $1 » resolves $2 player(s): a swap needs exactly one"],
    [new RegExp("^la portée « (.+?) » ne résout aucun joueur : aucune borne à réarmer$"), "range « $1 » resolves no player: no limit to reset"],
    [new RegExp("^la promesse de « (.+?) » n'a pas d'objet : le combat s'est ouvert sans mob — rien à vaincre, donc rien à promettre$"), "the promise of « $1 » has no object: the combat opened with no mob — nothing to defeat, so nothing to promise"],
    [new RegExp("^la restriction d'emplacement « (.*?) » est ignorée : la table du coffre nomme des raretés, pas des emplacements$"), "slot restriction « $1 » is ignored: the chest table names rarities, not slots"],
    [new RegExp("^le compte vaut 0 \\(« (.*?) »\\) — aucune Réaction n'est forcée$"), "the count is 0 (« $1 ») — no Reaction is forced"],
    [new RegExp("^le coup précédent porte (\\d+) jets — « le jet » ne désigne plus rien\\. Une seule cible, un seul terme de dé$"), "the previous hit carries $1 rolls — « the roll » designates nothing anymore. One target, one die term"],
    [new RegExp("^le deck (.+?) est vide — la relance rendrait la carte même qu'on vient de rendre$"), "the $1 deck is empty — the reroll would give back the very card just returned"],
    [new RegExp("^le lieu « (.+?) » a quitté le jeu : il n'est plus sur le plateau, et son carton n'est plus dans son deck$"), "place « $1 » has left the game: it is no longer on the board, and its card is no longer in its deck"],
    [new RegExp("^le mode de destruction « (.+?) » n'est pas arbitré : la grammaire n'en connaît qu'un, et celui-ci n'y est pas$"), "destruction mode « $1 » is not ruled: the grammar knows only one, and this one is not it"],
    [new RegExp("^le mot « (.+?) » ne dit pas le renouvellement : la cellule doit choisir entre une permission qui se consomme \\(la mort ne rendra plus rien\\) et une qui reste \\(elle rendra quand même\\)$"), "the word « $1 » doesn’t state renewal: the cell must choose between a permission that is spent (death will give nothing back) and one that stays (it will give back anyway)"],
    [new RegExp("^le mot « (.*?) » n'a pas de lecteur ici : on rejoint un combat en queue, ou en retriant l'initiative, et rien d'autre$"), "the word « $1 » has no reader here: you join a combat at the back, or by re-sorting initiative, and nothing else"],
    [new RegExp("^le mot « (.*?) » n'a pas de lecteur ici : un affrontement se joue tel quel, se propose au lieu de s'imposer, ou se gagne d'office contre un mob$"), "the word « $1 » has no reader here: a contest is played as is, offered instead of imposed, or won outright against a mob"],
    [new RegExp("^le palier du tour (\\d+) n'a pas de dé de Collapse \\(tours 1 à 3\\) — aucune application n'a lieu$"), "the step of turn $1 has no Collapse die (turns 1 to 3) — no application takes place"],
    [new RegExp("^le prix vaut 0 \\(« (.*?) »\\) — rien n'est prélevé$"), "the price is 0 (« $1 ») — nothing is taken"],
    [new RegExp("^montant nul ou négatif : « (.+?) » → (.+?)$"), "zero or negative amount: « $1 » → $2"],
    [new RegExp("^nombre d'Actions illisible : « (.*?) »$"), "unreadable number of Actions: « $1 »"],
    [new RegExp("^nombre d'applications hors grammaire : « (.*?) » — un entier ≥ 1 est attendu$"), "number of applications outside the grammar: « $1 » — an integer ≥ 1 is expected"],
    [new RegExp("^portée inconnue : « (.*?) »$"), "unknown range: « $1 »"],
    [new RegExp("^rareté inconnue : « (.+?) »$"), "unknown rarity: « $1 »"],
    [new RegExp("^rareté inconnue — « (.+?) »$"), "unknown rarity — « $1 »"],
    [new RegExp("^rien à défausser \\((.+?)\\) — la main est vide de ce qui est demandé$"), "nothing to discard ($1) — the hand holds none of what is asked"],
    [new RegExp("^troisième argument non reconnu : « (.+?) »$"), "third argument not recognized: « $1 »"],
    [new RegExp("^type de dégâts hors vocabulaire : « (.+?) »$"), "dmg type outside the vocabulary: « $1 »"],
    [new RegExp("^une croissance négative \\((-?\\d+)\\) n'est pas une forme ouverte — elle rouvrirait le retrait qui tue, et la grammaire ne l'écrit nulle part$"), "a negative growth ($1) is not an open form — it would reopen the lethal removal, and the grammar writes it nowhere"],
    [new RegExp("^une décision « (.+?) » attend déjà : il ne s'en ouvre qu'une à la fois, et l'écraser ferait perdre la question posée$"), "a « $1 » decision is already waiting: only one opens at a time, and overwriting it would lose the question asked"],
    [new RegExp("^deck (.+?) épuisé : (\\d+) carte\\(s\\) sur (\\d+)$"), "$1 deck exhausted: $2 card(s) out of $3"],
    [new RegExp("^« (.+?) » porte (\\d+) écoles et la formule nue n'en désigne aucune$"), "« $1 » carries $2 schools and the bare formula designates none"],
    [new RegExp("^« (.+?) » porte l'école VARIABLE : elle se choisit, elle ne se devine pas$"), "« $1 » carries the VARIABLE school: it is chosen, not guessed"],
    [new RegExp("^« (.+?) » n'est ni une portée connue, ni un mob du catalogue$"), "« $1 » is neither a known range nor a catalog mob"],
    [new RegExp("^« (.+?) » n'est pas un mob du catalogue$"), "« $1 » is not a catalog mob"],
    [new RegExp("^« (.+?) » : un compte entier ≥ 1 est attendu$"), "« $1 »: an integer count ≥ 1 is expected"],
    [new RegExp("^« (.+?) » n'est ni un nombre ni ANY : le compte ne se devine pas$"), "« $1 » is neither a number nor ANY: the count isn’t guessed"],
    [new RegExp("^« (.+?) » n'est pas lisible : un entier signé est attendu — la forme du corpus est \\+1, \\+2, \\+3$"), "« $1 » is unreadable: a signed integer is expected — the corpus form is +1, +2, +3"],
    [new RegExp("^« (.+?) » n'est pas un décalage lisible : un entier signé est attendu, la forme du corpus est \\+2$"), "« $1 » is not a readable offset: a signed integer is expected, the corpus form is +2"],
    [new RegExp("^« (.+?) » n'est ni en main ni équipée chez le lanceur — rien à détruire$"), "« $1 » is neither in the caster’s hand nor equipped — nothing to destroy"],
    [new RegExp("^« (.+?) » a été piochée mais n'est plus en main — jouée, défaussée ou volée entre-temps\\. On ne relance pas une carte absente$"), "« $1 » was drawn but is no longer in hand — played, discarded or stolen meanwhile. A missing card isn’t rerolled"],
    [new RegExp("^« (.+?) » a quitté la table pendant que les dés étaient offerts : son jet ne peut plus être classé$"), "« $1 » left the table while the dice were offered: their roll can no longer be ranked"],
    [new RegExp("^« (.+?) » n'est pas un dé unique — l'escalade compare une face à la précédente, et une somme de dés n'a pas de face$"), "« $1 » is not a single die — escalation compares a face to the previous one, and a sum of dice has no face"],
    [new RegExp("^« (.+?) » n'est pas un argument reconnu — le Ruins qualifie sa mise en secret, et la portée dit qui peut rejoindre la partie$"), "« $1 » is not a recognized argument — Ruins makes its stake secret, and the range says who can join the game"],
    [new RegExp("^« (.+?) » n'est ni un mob du catalogue ni une portée connue$"), "« $1 » is neither a catalog mob nor a known range"],
    [new RegExp("^« (.+?) » n'est pas une école du vocabulaire$"), "« $1 » is not a school of the vocabulary"],
    [new RegExp("^« (.+?) » ne porte aucune Réaction — il n'y a rien à rouler$"), "« $1 » carries no Reaction — there is nothing to roll"],
    [new RegExp("^« (.+?) » porte (\\d+) Réactions : la ligne n'en nomme aucune, et choisir la première serait inventer$"), "« $1 » carries $2 Reactions: the line names none, and picking the first would be inventing"],
    [new RegExp("^« (.*?) » n'est pas arbitré — la ligne se rejoue entière$"), "« $1 » is not ruled — the line replays in full"],
    [new RegExp("^« (.*?) » : un compte d'options ≥ 2 est attendu$"), "« $1 »: an option count ≥ 2 is expected"],
    [new RegExp("^« (.*?) » ne nomme pas le mob des perdants : Sub-Boss ou Boss$"), "« $1 » doesn’t name the losers’ mob: Sub-Boss or Boss"],
    [new RegExp("^« (.+?) » ne nomme aucune des deux bornes connues$"), "« $1 » names neither of the two known limits"],
    [new RegExp("^« (.+?) » est un mode de désignation et rien n'est désigné sur cette ligne — elle ne peut résoudre personne$"), "« $1 » is a designation mode and nothing is designated on this line — it can resolve no one"],
    [new RegExp("^« (.+?) » n'est pas un second argument connu$"), "« $1 » is not a known second argument"],
    [new RegExp("^« (.+?) » n'est pas une forme arbitrée : seules la carte en cours et la main entière le sont$"), "« $1 » is not a ruled form: only the current card and the whole hand are"],
    [new RegExp("^« (.+?) » désigne plusieurs lieux du deck (.+?) : (.+)$"), "« $1 » designates several places in the $2 deck: $3"],
    [new RegExp("^« (.+?) » ne résout sur aucun lieu du deck (.+?)$"), "« $1 » resolves to no place in the $2 deck"],
    [new RegExp("^« (.+?) » n'est pas arbitré comme source : seule la MAIN l'est — retirer une pièce portée coûterait son maximum de PV, et le carton ne le dit pas$"), "« $1 » is not ruled as a source: only the HAND is — removing a worn piece would cost its max HP, and the card doesn’t say so"],
    [new RegExp("^« (.+?) » n'est pas arbitré comme sujet du déplacement : un seul jeton l'est — et sans second argument, c'est la portée qui bouge$"), "« $1 » is not ruled as the subject of the move: only one token is — and without a second argument, the range is what moves"],
    [new RegExp("^école hors vocabulaire : « (.+?) »$"), "school outside the vocabulary: « $1 »"],
    [new RegExp("^école inconnue : « (.+?) »$"), "unknown school: « $1 »"],
    [new RegExp("^étiquette inconnue : « (.*?) »$"), "unknown tag: « $1 »"],
    [new RegExp("^entrée au Goblin Casino — défausse (\\d+) carte pour entrer dans la partie$"), "Goblin Casino entry — discard $1 card to join the game"],
    [new RegExp("^immunité au Collapse : (.+)$"), "immune to the Collapse: $1"],
    [new RegExp("^l'emplacement ([A-Z]+) est plein \\(capacité (\\d+)\\)$"), "the $1 slot is full (capacity $2)"],
    [new RegExp("^la fiche de « (.+?) » n'a pas d'emplacement ([A-Z]+)$"), "« $1 »’s sheet has no $2 slot"],
    [new RegExp("^retirer « (.+?) » ferait tomber son porteur à 0 PV — interdit$"), "removing « $1 » would drop its bearer to 0 HP — forbidden"],
    [new RegExp("^« (.+?) » déclare (.+?), hors des six écoles : « (.+?) » range par piles d'école et n'en a aucune de ce nom$"), "« $1 » declares $2, outside the six schools: « $3 » stores by school piles and has none of that name"],
    [new RegExp("^« (.+?) » est refusée sur ([A-Z]+) et le moteur ne sait pas dire pourquoi : la case porte (\\d+)\\/(\\d+), la fiche de « (.+?) » ne refuse pas ([A-Z]+), et ce n'est pas une consommable\\. Refus signalé comme non expliqué plutôt que rangé sous un motif voisin$"), "« $1 » is refused on $2 and the engine can’t say why: the slot holds $3/$4, « $5 »’s sheet doesn’t refuse $6, and it isn’t a consumable. Refusal flagged as unexplained rather than filed under a nearby reason"],
    [new RegExp("^« (.+?) » est réservée à (.+?) — « (.+?) » ne peut pas la porter$"), "« $1 » is reserved for $2 — « $3 » can’t wear it"],
    [new RegExp("^« (.+?) » est une consommable, elle ne s'équipe pas$"), "« $1 » is a consumable, it can’t be equipped"],
    [new RegExp("^« (.+?) » ne déclare aucune école : « (.+?) » range son équipement par piles d'école, pas par emplacements, et une pièce sans école n'a aucune pile où aller$"), "« $1 » declares no school: « $2 » stores Gear by school piles, not by slots, and a piece with no school has no pile to go to"],
    [new RegExp("^« (.+?) » ne porte aucun équipement — sa main, elle, reste entière$"), "« $1 » wears no Gear — their hand, though, stays whole"],
    [new RegExp("^Annonce secrète — (-?\\d+) à (-?\\d+)$"), "Secret call — $1 to $2"],
    [new RegExp("^Pierre-feuille-ciseaux, offert — manche (\\d+) · vous pouvez décliner$"), "Rock-paper-scissors, offered — round $1 · you may decline"],
    [new RegExp("^Pierre-feuille-ciseaux — manche (\\d+)$"), "Rock-paper-scissors — round $1"],
    [new RegExp("^(\\d+) joueurs à (-?\\d+) PV — le porteur désignera$"), "$1 players at $2 HP — the bearer will choose"],
    [new RegExp("^détourné vers le plus haut en PV \\((-?\\d+)\\)$"), "redirected to the highest HP ($1)"],
    [new RegExp("^la bague ouvre le choix — (\\d+) joueurs en jeu, les PV n'entrent plus en compte$"), "the ring opens the choice — $1 players in play, HP no longer count"],
    [new RegExp("^(\\d+) \\(le résultat actuel\\)$"), "$1 (current result)"],
    [new RegExp("^(.+?) — défaussez (\\d+) à (\\d+) carte\\(s\\)$"), "$1 — discard $2 to $3 card(s)"],
    [new RegExp("^(.+?) — défaussez (\\d+) carte\\(s\\)$"), "$1 — discard $2 card(s)"],
    [new RegExp("^(.+?) — le dé montre (-?\\d+) : quelle face garder \\? \\(une POSE ne fabrique aucun naturel\\)$"), "$1 — the die shows $2: which face to keep? (a SET never makes a natural)"],
    [new RegExp("^(.+?) — le dé montre (-?\\d+) : quelle face garder \\?$"), "$1 — the die shows $2: which face to keep?"],
    [new RegExp("^Pioche (.+?) : (\\d+) tirées, gardez-en (\\d+) — les autres retournent sous le deck de leur rareté, dans l'ordre de pioche$"), "$1 draw: $2 drawn, keep $3 — the others go back under their rarity’s deck, in draw order"],
    [new RegExp("^ta prochaine attaque d'arme devient ([^·]+?)$"), "your next weapon attack becomes $1"],
    [new RegExp("^le coup qui t'arrive devient ([^·]+?)$"), "the incoming hit becomes $1"],
    [new RegExp("^défausse tout \\(([^·]+?)\\)$"), "discards all ($1)"],
    [new RegExp("^défausse (\\d+) \\(([^·]+?)\\)$"), "discards $1 ($2)"],
    [new RegExp("^défausse (\\d+)$"), "discards $1"],
    [new RegExp("^inflige ([^·]+?) de dégâts$"), "deals $1 dmg"],
    [new RegExp("^inflige ([^·]+?) de dégâts ([^·]+?)$"), "deals $1 $2 dmg"],
    [new RegExp("^multiplie sa ([A-Z_]+) par (\\d+)$"), "multiplies their $1 by $2"],
    [new RegExp("^gagne autant de ([A-Z_]+) que de PV soignés$"), "gains as much $1 as HP healed"],
    [new RegExp("^gagne autant de ([A-Z_]+) que de dégâts infligés$"), "gains as much $1 as dmg dealt"],
    [new RegExp("^gagne autant de ([A-Z_]+) que x$"), "gains as much $1 as x"],
    [new RegExp("^gagne ([^·\\s]+) de ([A-Z_]+)$"), "gains $1 $2"],
    [new RegExp("^perd ([^·\\s]+) de ([A-Z_]+)$"), "loses $1 $2"],
    [new RegExp("^téléporte \\(([^·]+?)\\)$"), "teleports ($1)"],
    [new RegExp("^va à ([^·]+?)$"), "goes to $1"],
    [new RegExp("^soigne ([^·]+?)$"), "heals $1"],
    [new RegExp("^pioche ([^·]+?) butin\\(s\\) du palier$"), "draws $1 loot(s) of this step’s rarity"],
    [new RegExp("^pioche ([^·]+?) butin\\(s\\) (?!du palier$)([^·,]+?)$"), "draws $1 $2 loot(s)"],
    [new RegExp("^pioche ([^·]+?) carte\\(s\\) du palier, en garde ([^·]+?)$"), "draws $1 card(s) of this step’s rarity, keeps $2"],
    [new RegExp("^pioche ([^·]+?) carte\\(s\\) du palier$"), "draws $1 card(s) of this step’s rarity"],
    [new RegExp("^pioche ([^·]+?) carte\\(s\\) (?!du palier)([^·,]+?), en garde ([^·]+?)$"), "draws $1 $2 card(s), keeps $3"],
    [new RegExp("^pioche ([^·]+?) carte\\(s\\) (?!du palier)([^·,]+?)$"), "draws $1 $2 card(s)"],
    [new RegExp("^combat (\\d+) mob\\(s\\) au hasard — récompense ([^·]+?)$"), "fights $1 random mob(s) — reward $2"],
    [new RegExp("^combat (\\d+) mob\\(s\\) au hasard$"), "fights $1 random mob(s)"],
    [new RegExp("^combat ([A-Z][^·]*?) — récompense ([^·]+?)$"), "fights $1 — reward $2"],
    [new RegExp("^combat ([A-Z][^·—]*?)$"), "fights $1"],
    [new RegExp("^(.+?) — celui que tu choisis sera relancé$"), "$1 — the one you choose will be rerolled"],
    [new RegExp("^(.+?) — celui que tu choisis prendra la face annoncée$"), "$1 — the one you choose will take the announced face"],
    [new RegExp("^(.+?) — celui que tu choisis sera modifié$"), "$1 — the one you choose will be modified"],
    [new RegExp("^Lancer (\\d*d\\d+\\S*)$"), "Roll $1"],
    [new RegExp("^S'arrêter — garder le (.+?) acquis$"), "Stop — keep the $1 already won"],
    [new RegExp("^Relancer — viser (.+?)$"), "Reroll — aim for $1"],
    [new RegExp("^dé (\\d+) — il montre (-?\\d+) \\(1d(\\d+)\\)$"), "die $1 — shows $2 (1d$3)"],
    [new RegExp("^(.+?) — choisissez un type d'attaque$"), "$1 — choose an attack type"],
    [new RegExp("^(.+?) — choisissez une école$"), "$1 — choose a school"],
    [new RegExp("^(.+?) — combien \\? \\(de (-?\\d+) à (-?\\d+)\\)$"), "$1 — how many? ($2 to $3)"],
    [new RegExp("^(.+?) — désignez qui vous invitez\\. N'inviter personne est une réponse\\.$"), "$1 — choose whom you invite. Inviting nobody is an answer."],
    [new RegExp("^(.+?) — désignez un ou plusieurs joueurs$"), "$1 — choose one or more players"],
    [new RegExp("^(.+?) — désignez une cible$"), "$1 — choose a target"],
    [new RegExp("^(.+?) — les non retenues repartent sous le deck (.+?), dans l'ordre de tirage$"), "$1 — the ones not kept go back under the $2 deck, in draw order"],
    [new RegExp("^Défaussez jusqu'à (\\d+) cartes \\((\\d+) en main\\) — les cartes défaussées retournent sous le deck de leur rareté$"), "Discard down to $1 cards ($2 in hand) — discarded cards go back under their rarity’s deck"],
    [new RegExp("^à égalité à (-?\\d+) PV — désignez qui prend le piège$"), "tied at $1 HP — choose who takes the trap"],
    [new RegExp("^répond à « (.+?) » avant que le tour ne reprenne$"), "answers « $1 » before the turn resumes"],
    [new RegExp("^doit répondre à (.+?)$"), "must answer $1"],
    [new RegExp("^joue son tour — (\\d+) Action\\(s\\) restante\\(s\\)$"), "plays their turn — $1 Action(s) left"],
    [new RegExp("^déjà employée (\\d+)×$"), "already used $1×"],
    [new RegExp("^(.+?) — cette ligne n'appartient pas à ce joueur$"), "$1 — this line does not belong to this player"],
    [new RegExp("^(\\d+) rounds sans issue — ex æquo aux PV, personne ne passe$"), "$1 rounds with no outcome — tied on HP, nobody goes through"],
    [new RegExp("^(\\d+) rounds sans issue — le survivant a le plus de PV$"), "$1 rounds with no outcome — the survivor has the most HP"],
  ]);


  /* Le HOME, écrit en anglais -> français. Les NOMS (Vault, Bounty Wall, Dive,
     Dungeon Pro League…) restent : ce sont des titres de Croze, pas des mots. */
  var EN_FR = {
    'Back': 'Retour',
    /* S1409 - note 226 (3) : le HOME passe en anglais ; en FRANCAIS, ces
       libelles retrouvent leurs mots d'avant (« Les Vivres » est le nom de Croze). */
    'Provisions': 'Les Vivres',
    'Tutorial': 'Tutoriel',
    'a game with a dungeon master': 'une partie avec un maître de jeu',
    'never played': 'jamais fait',
    'The notebook': 'Le carnet',
    'Options': 'Options',
    'Quit': 'Quitter',
    'Play': 'Jouer',
    'Start': 'Commencer',
    'Stay': 'Rester',
    'Equipped': 'Équipé',
    'Your team': 'Ton équipe',
    'Them': 'Eux',
    'Today': 'Aujourd’hui',
    'Reward': 'Récompense',
    'Rank': 'Rang',
    'Random dice': 'Dés au hasard',
    'Random cursor': 'Curseur au hasard',
    'Random character': 'Personnage au hasard',
    'Progress': 'Progression',
    'Payout': 'Gains',
    'In your vault': 'Dans ton vault',
    'Final Duel': 'Duel Final',
    'Contracts': 'Contrats',
    'Choose your run': 'Choisis ta partie',
    'Choose your first character': 'Choisis ton premier personnage',
    'Bot match': 'Partie contre les bots',
    'characters · dice sets · cursors': 'personnages · dés · curseurs',
    'LANGUAGE': 'LANGUE',
    /* l'écran PROFILE (PR-2, note 209 ②) */
    'Profile': 'Profil',
    'your games · your save file': 'tes parties · ton fichier de sauvegarde',
    'Player': 'Joueur',
    'Name': 'Nom',
    'Teeth': 'Dents',
    'Blood': 'Sang',
    'Games': 'Parties',
    'Played': 'Jouées',
    'Won': 'Gagnées',
    'Owned': 'Possédé',
    'Characters': 'Personnages',
    'Dice sets': 'Dés',
    'Cursors': 'Curseurs',
    'Card backs': 'Dos de cartes',
    'Offerings': 'Offrandes',
    'Pact': 'Pacte',
    'Awake spirits': 'Esprits éveillés',
    'Counters': 'Compteurs',
    'Save file': 'Fichier de sauvegarde',
    'OPEN FOLDER': 'OUVRIR LE DOSSIER',
    'EXPORT': 'EXPORTER',
    'IMPORT': 'IMPORTER',
    'none': 'aucun',
    'none yet': 'aucun pour l’instant',
    '0 (counted once the engine reports it)': '0 (compté dès que le moteur le publie)',
    'This launch has no save file (a test shortcut): the profile lives in this browser.':
      'Ce lancement n’a pas de fichier de sauvegarde (un raccourci de test) : le profil vit dans ce navigateur.',
    'The folder opens in your file explorer.': 'Le dossier s’ouvre dans ton explorateur.'
  };
  var EN_FR_MOTIFS = [];
  /* S1460 - note 339 (2) : L'AUDIT A CHAUD EN FRANCAIS. Releve sur 57 etats deposes (iframes 1920 x 1080,
     langue FR, texte visible, cartons retires par le corpus du catalogue) : 235 textes anglais peints.
     Le texte IMPRIME des cartes et des tuiles reste anglais (339 (4)) ; les noms de personnages aussi
     (ce sont des cartes). Le reste se traduit ici : les libelles fixes en cles exactes, les phrases a
     trous en motifs. */
  var ECOLE_FR = { Fire: 'Feu', Frost: 'Glace', Lightning: 'Foudre', Poison: 'Poison', Arcane: 'Arcane', Chaos: 'Chaos' };
  var EMPLACEMENT_FR = { WEAPON: 'ARME', HEAD: 'TÊTE', CHEST: 'TORSE', LEGS: 'JAMBES', BACK: 'DOS', HANDS: 'MAINS',
    FEET: 'PIEDS', RING: 'ANNEAU', 'RING 1': 'ANNEAU 1', 'RING 2': 'ANNEAU 2', CONSUMABLE: 'CONSOMMABLE' };
  var CONDITION_FR = [
    [/the modified total reaches (-?\d+)/g, 'le total modifié atteint $1'],
    [/the modified total does not exceed (-?\d+)/g, 'le total modifié ne dépasse pas $1'],
    [/the die face ([\d-]+)/g, 'la face $1'],
    [/the roll fails, critical failure included/g, 'le jet échoue, échec critique compris'],
    [/the roll succeeds, critical success included/g, 'le jet réussit, succès critique compris'],
    [/applies no matter what/g, 's’applique quoi qu’il arrive'],
    [/the LOWEST roll in range/g, 'le jet le plus BAS de la plage'],
    [/the HIGHEST roll in range/g, 'le jet le plus HAUT de la plage'],
    [/the caster’s character is /g, 'le personnage du lanceur est '],
    [/ or /g, ' ou '], [/ and /g, ' et ']
  ];
  function conditionFR(s) {
    var t = String(s);
    for (var i = 0; i < CONDITION_FR.length; i += 1) t = t.replace(CONDITION_FR[i][0], CONDITION_FR[i][1]);
    return t;
  }
  var ATTEND_FR = { 'a hit to be taken': 'un coup encaissé', 'a die to be rolled': 'un dé lancé',
    'the opening of a combat': 'l’ouverture d’un combat' };
  var CIBLE_FR = { 'a player on the Tile, of your choice': 'un joueur sur la Tuile, au choix',
    'anyone on the Tile, player or Mob, caster excluded — of your choice': 'n’importe qui sur la Tuile, joueur ou Mob, lanceur exclu — au choix' };
  var RELANCE_FR = { 'another reroll rule': 'une autre règle de relance', 'unchanged': 'inchangé',
    'the trigger die': 'le dé déclencheur', 'the best face, automatically': 'la meilleure face, automatiquement' };
  var EN_FR_JEU = {
    'WEAPON': 'ARME', 'HEAD': 'TÊTE', 'CHEST': 'TORSE', 'LEGS': 'JAMBES', 'BACK': 'DOS', 'HANDS': 'MAINS',
    'FEET': 'PIEDS', 'RING 1': 'ANNEAU 1', 'RING 2': 'ANNEAU 2', 'EMPTY': 'LIBRE',
    'HIDE': 'MASQUER', 'READY': 'PRÊT', 'WIN': 'VICTOIRE', 'ROLL FOR FIRST PLAYER': 'JET DU PREMIER JOUEUR',
    'ACTS NOW': 'AGIT', 'YOU ARE DEAD — YOU WATCH': 'TU ES MORT — TU REGARDES', 'mort — for good': 'mort — pour de bon',
    'Draw a tile and go there.': 'Pioche une tuile et vas-y.',
    'this tile cannot be explored': 'cette tuile ne s’explore pas',
    'this tile has no interaction': 'cette tuile n’a pas d’interaction',
    'already explored this visit': 'déjà explorée à cette visite',
    'free — it does not cost your Action': 'gratuit — ça ne coûte pas ton Action',
    'take the portal: you leave the dungeon for good': 'prends le portail : tu quittes le donjon pour de bon',
    'hand': 'main', 'empty hand': 'main vide',
    /* S1465 · note 346 — le podium de fin de run : ordinaux, bouton, attente, gear vide. */
    '1st': '1er', '2nd': '2e', '3rd': '3e', '4th': '4e', '5th': '5e', '6th': '6e',
    'POINT DETAILS': 'DÉTAIL DES POINTS', 'waiting for the other players…': 'on attend les autres joueurs…',
    'no Gear': 'aucun Gear',
    'no player is left in the dungeon': 'plus aucun joueur dans le donjon',
    'the whole table, wherever they are in the dungeon': 'toute la table, où qu’elle soit dans le donjon',
    '→ answer on the right': '→ réponds à droite', 'Pick a number': 'Choisis un nombre',
    'THE CARD PLAYED': 'LA CARTE JOUÉE', 'THE RESPONSE': 'LA RÉPONSE', 'it moves on by itself': 'ça avance tout seul',
    'PASS — I discard nothing': 'PASSER — je ne défausse rien',
    '⊘ this question cannot be refused — only SILENCE ends it, and it answers “present no cards” (§7.2)':
      '⊘ cette question ne se refuse pas — seul le SILENCE la clôt, et il répond « ne présenter aucune carte » (§7.2)',
    'DON’T SIT (costs nothing)': 'NE PAS S’ASSEOIR (ne coûte rien)',
    'not answering means not sitting — silence discards nothing (§7.2)':
      'ne pas répondre, c’est ne pas s’asseoir — le silence ne défausse rien (§7.2)',
    '◎ TARGETING YOU': '◎ TE VISE', 'BACK TO MENU': 'RETOUR AU MENU', 'END TURN': 'FIN DU TOUR',
    'THROW NOTHING (you lose)': 'NE RIEN JOUER (tu perds)',
    'both signs are revealed TOGETHER — nobody sees the other first. A tie is replayed (§6.5.2).':
      'les deux signes se révèlent ENSEMBLE — personne ne voit l’autre d’abord. Une égalité se rejoue (§6.5.2).',
    '⏱ the scene is still playing — your question comes right after, and nothing will pass for you before then':
      '⏱ la scène se joue encore — ta question arrive juste après, et rien ne passera pour toi d’ici là',
    '⏱ the die is still being shown — the countdown has not started, and nothing will pass for you before then':
      '⏱ le dé est encore montré — le compte à rebours n’a pas commencé, et rien ne passera pour toi d’ici là',
    '⊘ used this Dungeon Turn — back at the end of the Dungeon Turn':
      '⊘ utilisée ce Tour de donjon — revient à la fin du Tour de donjon',
    'DUNGEON': 'DONJON', 'LOG': 'JOURNAL', 'FOLLOW': 'SUIVRE', 'FOLLOWING': 'SUIVI', 'OPTIONS': 'OPTIONS',
    'GRAVEYARD': 'CIMETIÈRE', 'No card played from a hand yet.': 'Aucune carte jouée de la main pour l’instant.',
    'no collapse': 'pas de Collapse', 'no portal': 'pas de portail', 'portal everywhere': 'portail partout',
    'TABLE v2': 'TABLE v2', 'the table (V: lighter / darker veil over the room)': 'la table (V : voile plus clair / plus sombre sur la salle)',
    'the old table — switch ON to come back': 'l’ancienne table — passe sur ON pour revenir',
    /* S1466 - note 350 (2) : le mot GENERIQUE de l'interface est « coffre » (l'issue d'exploration, l'activite
       d'un siege) ; les noms de cartons composes (Large Chest, Marvelous Chest…) restent anglais. */
    'Chest': 'Coffre', 'opening a chest': 'ouvre un coffre', 'a chest': 'un coffre',
    /* S1477 - note 358 bis : l'oeil des cartes de de, et son reglage dans OPTIONS. */
    'ASK ME': 'DEMANDE-MOI', 'MUTED': 'MUETTE', 'DICE CARDS': 'CARTES DE DÉ',
    '▼ PLAY A LIT CARD FROM YOUR HAND': '▼ JOUE UNE CARTE ALLUMÉE DE TA MAIN',
    /* S1481 - note 364 (6) : la fenetre de reaction, une pause */
    'You have time to play reactions — lit cards, Signature, gear':
      'Tu as le temps de jouer des réactions — cartes allumées, Signature, équipement',
    'OK · CONTINUE': 'OK · CONTINUER',
    'HOW IT ENDED': 'COMMENT ÇA S’EST FINI', 'tie — rerolled': 'égalité — relancé',
    /* S1489 - note 368 (1)(b) : une langue par ecran -- l'annonce des fenetres de reaction (`annonce`, main.ts). */
    'A CARD HAS JUST BEEN DRAWN': 'UNE CARTE VIENT D’ÊTRE PIOCHÉE',
    'A PLAYER TURN BEGINS': 'UN TOUR DE JOUEUR COMMENCE',
    'A PLAYER TURN ENDS': 'UN TOUR DE JOUEUR SE TERMINE',
    'THE RUN BEGINS': 'LE RUN COMMENCE',
    'A COMBAT OPENS': 'UN COMBAT S’OUVRE',
    'SOMEONE ENTERS A TILE': 'QUELQU’UN ENTRE SUR UNE TUILE',
    'SOMEONE ENTERS YOUR TILE': 'QUELQU’UN ENTRE SUR TA TUILE',
    'A MOVE HAS JUST BEEN DECLARED': 'UN DÉPLACEMENT VIENT D’ÊTRE DÉCLARÉ',
    'A CARD HAS JUST BEEN PLAYED': 'UNE CARTE VIENT D’ÊTRE JOUÉE',
    'A HIT HAS JUST BEEN TAKEN': 'UN COUP VIENT D’ÊTRE ENCAISSÉ',
    'SOMEONE HAS JUST BEEN TARGETED': 'QUELQU’UN VIENT D’ÊTRE CIBLÉ',
    'SOMEONE IS ABOUT TO FALL — the last window before the fall': 'QUELQU’UN VA TOMBER — la dernière fenêtre avant la chute',
    'SOMEONE HAS JUST BEEN KILLED': 'QUELQU’UN VIENT D’ÊTRE TUÉ',
    'A MOB HAS JUST BEEN DRAWN': 'UN MOB VIENT D’ÊTRE PIOCHÉ',
    'A PLAYER HAS JUST DIED': 'UN JOUEUR VIENT DE MOURIR',
    'A DIE HAS JUST BEEN ROLLED': 'UN DÉ VIENT D’ÊTRE LANCÉ',
    'A PIECE HAS JUST BEEN EQUIPPED': 'UNE PIÈCE VIENT D’ÊTRE ÉQUIPÉE',
    'A TRADE HAS JUST TAKEN PLACE': 'UN TROC VIENT D’AVOIR LIEU',
    'SOMEONE HAS JUST DISCARDED': 'QUELQU’UN VIENT DE DÉFAUSSER',
    'SOMEONE HAS JUST FLED FROM YOU': 'QUELQU’UN VIENT DE TE FUIR',
    'AN OFFER HAS JUST BEEN ACCEPTED': 'UNE OFFRE VIENT D’ÊTRE ACCEPTÉE',
    'AN OFFER HAS JUST BEEN REFUSED': 'UNE OFFRE VIENT D’ÊTRE REFUSÉE',
    'A GEAR PIECE HAS JUST BEEN DRAWN': 'UNE PIÈCE DE GEAR VIENT D’ÊTRE PIOCHÉE',
    'A TILE HAS JUST BEEN DRAWN': 'UNE TUILE VIENT D’ÊTRE PIOCHÉE',
    'MAKE YOUR CHOICE': 'FAIS TON CHOIX',
    'NO CARD': 'AUCUNE', 'THE ONES I OPEN': 'CELLES QUE J’OUVRE', 'EVERY CARD': 'TOUTES',
    'ask me for dice cards (rerolls, +N, Signature) — a new card arrives muted; open its eye to be asked':
      'me demander pour les cartes de dé (relances, +N, Signature) — une carte neuve arrive muette ; ouvre son œil pour être interrogé'
  };
  /* 392 (4) - LE TUTO EN FRANCAIS ENTIER quand le profil est FR (GLOSSAIRE 1 bis : jamais un ecran mixte) ;
     textes de TUTO.md 12.1 traduits au glossaire, noms propres gardes (THE MAILMAN, Blessed, Apple, Touch Grass). */
  var EN_FR_TUTO = {
    "I am your game master. You play THE MAILMAN. A run is simple: get in, loot, get out with points.": "Je suis ton maître du jeu. Tu joues THE MAILMAN. Une Run, c’est simple : entrer, piller, ressortir avec des points.",
    "TO THE FLOOR.": "DANS LE DONJON.",
    "TO THE FLOOR": "DANS LE DONJON",
    "Two quests since turn one. Each one done is a point, and points win the game. One of them needs a fight — next time.": "Deux quêtes dès le premier tour. Chacune accomplie vaut un point, et les points font gagner la partie. L’une d’elles demande un combat — ce sera pour la prochaine fois.",
    "Tap your quests.": "Touche tes quêtes.",
    "You don't walk this dungeon — you draw it.": "Ce donjon, tu ne le parcours pas — tu le tires.",
    "MOVE.": "SE DÉPLACER.",
    "Turn one is a single action; then two a turn.": "Le premier tour, une seule action ; ensuite deux par tour.",
    "END TURN.": "FIN DU TOUR.",
    "Every room hides a die — trap, mob or chest.": "Chaque salle cache un dé — piège, mob ou coffre.",
    "EXPLORE.": "EXPLORER.",
    "A chest is three dice — each one a card, or nothing.": "Un coffre, c’est trois dés — chacun une carte, ou rien.",
    "OPEN IT.": "OUVRE-LE.",
    "Seven cards at most: gear is worn, consumables are played.": "Sept cartes au plus : l’équipement se porte, les consommables se jouent.",
    "Wear the gloves and the pants.": "Porte les gants et le pantalon.",
    "DEX aims — your Mail Bag hits 1d4+DEX, and DEX just doubled.": "La DEX vise — ton Mail Bag frappe à 1d4+DEX, et ta DEX vient de doubler.",
    "Tap DEX.": "Touche DEX.",
    "Two actions a turn. Some rooms test you when you enter.": "Deux actions par tour. Certaines salles te mettent à l’épreuve quand tu entres.",
    "22 on the die: Blessed is done. A quest counts once revealed.": "22 au dé : Blessed est accomplie. Une quête compte une fois révélée.",
    "Reveal it.": "Révèle-la.",
    "Each dungeon turn the timer steps: everyone draws, loot gets rarer.": "À chaque tour de donjon, le Dungeon Timer avance : tout le monde pioche, le butin monte en rareté.",
    "Rooms with a die are where loot lives — and traps.": "Les salles à dé, c’est là que vit le butin — et les pièges.",
    "A 1 to 3 here is a trap.": "Ici, un 1 à 3, c’est un piège.",
    "Bone Spike: 3d12 minus DEX — your gear just ate 6 of it.": "Bone Spike : 3d12 moins DEX — ton équipement vient d’en encaisser 6.",
    "Play the Apple.": "Joue l’Apple.",
    "Turn 4: the dungeon starts to bite back.": "Tour 4 : le donjon commence à mordre.",
    "The Collapse: each turn a die hits everyone — no parry, no armor. A 6 just opened a PORTAL on your tile.": "Le Collapse : à chaque tour, un dé frappe tout le monde — ni parade, ni armure. Un 6 vient d’ouvrir un PORTAIL sur ta tuile.",
    "Play the Heal Potion.": "Joue la Heal Potion.",
    "That 6 came out of your HP.": "Ce 6, tu l’as pris dans tes HP.",
    "Tap to continue.": "Touche pour continuer.",
    "Every room has one INTERACT, once per tile.": "Chaque salle a une INTERACTION, une fois par tuile.",
    "Out with your loot: your score freezes, your gear stays — and the dungeon goes on without you.": "Dehors avec ton butin : ton score se fige, ton équipement reste — et le donjon continue sans toi.",
    "USE PORTAL.": "PRENDRE LE PORTAIL.",
    "One quest, one point: your first run is done. Points come from quests, kills, Last Out and the Final Duel — the rest you'll learn by playing.": "Une quête, un point : ta première Run est finie. Les points viennent des quêtes, des mobs tués, du Last Out et du Duel Final — le reste, tu l’apprendras en jouant.",
    "TO THE TABLE.": "À LA TABLE.",
    "TO THE TABLE": "À LA TABLE",
    "YOU NOW KNOW": "TU SAIS MAINTENANT",
    "— MOVE draws a room": "— SE DÉPLACER tire une salle",
    "— EXPLORE rolls its die": "— EXPLORER lance son dé",
    "— gear is worn, consumables are played": "— l’équipement se porte, les consommables se jouent",
    "— quests are points": "— les quêtes sont des points",
    "— the portal gets you out": "— le portail te fait sortir",
    "160 teeth — the first time": "160 dents — la première fois",
    "BACK TO THE MENU": "RETOUR AU MENU",
    "I'll manage": "Je me débrouille",
    "leaves this tutorial — RULES → TUTORIAL to play it again": "quitte ce tutoriel — RÈGLES → TUTORIEL pour le rejouer",
    "Rules": "Règles",
    "Trap": "Piège",
    "YOUR TURN": "TON TOUR",
    "· YOU are reacting": "· TU réagis",
    "Large Chest": "Grand coffre",
    "⏱ IF YOU DON’T ACT, I’LL END YOUR TURN IN": "⏱ SI TU N’AGIS PAS, JE FINIS TON TOUR DANS",
    "end": "fin",
    "T1 · free": "T1 · libre",
    "T1 · end": "T1 · fin",
    "T1 · in the explore": "T1 · dans l’exploration",
    "T2 · free": "T2 · libre",
    "T2 · end": "T2 · fin",
    "T2 · in the explore": "T2 · dans l’exploration",
    "T3 · free": "T3 · libre",
    "T3 · end": "T3 · fin",
    "T3 · in the explore": "T3 · dans l’exploration",
    "T4 · free": "T4 · libre",
    "T4 · end": "T4 · fin",
    "T4 · in the explore": "T4 · dans l’exploration"
  };
  for (var kt in EN_FR_TUTO) { if (Object.prototype.hasOwnProperty.call(EN_FR_TUTO, kt)) EN_FR[kt] = EN_FR_TUTO[kt]; }
  /* 390 (3) - S1552 : le HOME et MON COMPTE en FR, releves au DOM (un texte visible que `traduis` rend inchange). Noms propres
     et modes gardes (Classic, Experimental, Pro Tour, Vault, Codex, Bounty Wall) ; Daily -> Defi du jour (GLOSSAIRE 1). */
  var EN_FR_HOME = {
    "click a menu entry · esc goes back · backgrounds cycle on their own": "clique une entrée · échap revient · les fonds changent seuls",
    "Dive": "Plonger",
    "classic · today’s dungeon · dungeon pro tour · experimental": "classic · défi du jour · dungeon pro tour · experimental",
    "buy & equip · characters · dice sets · cursors": "acheter et équiper · personnages · sets de dés · curseurs",
    "browse · tiles · mobs · loot cards · quests · characters": "parcourir · tuiles · mobs · cartes de butin · quêtes · personnages",
    "Ranking": "Classement",
    "Boardgame": "Jeu de plateau",
    "Back to menu": "Retour au menu",
    "Against bots and/or players": "Contre des bots et/ou des joueurs",
    "Free-for-all against bots and/or players, 3 to 5 players, alone or with friends. Pays out in teeth.": "Chacun pour soi contre des bots et/ou des joueurs, de 3 à 5 joueurs, seul ou entre amis. Rapporte des dents.",
    "One a day": "Un par jour",
    "Today’s Dungeon": "Défi du jour",
    "One seed for everyone — try as often as you like, your best try counts.": "Une même graine pour tous — essaie autant que tu veux, ton meilleur essai compte.",
    "Ranked ladder": "Classement compétitif",
    "The Pro Tour opens soon.": "Le Pro Tour ouvre bientôt.",
    "Not ranked": "Non classé",
    "2v2, 2v2v2 and a six-player free-for-all against bots. Being tested — no ranking.": "2v2, 2v2v2 et un chacun pour soi à six contre des bots. En test — pas de classement.",
    "Fire": "Feu",
    "Lightning": "Foudre",
    "Frost": "Givre",
    "Seven spirits": "Sept esprits",
    "Click a face: its path opens around it.": "Clique un visage : son chemin s’ouvre autour de lui.",
    "SEE ALL shows every path side by side.": "TOUT VOIR montre chaque chemin côte à côte.",
    "See all": "Tout voir",
    "Play with friends": "Jouer entre amis",
    "MY VAULT": "MON VAULT",
    "Dice set": "Set de dés",
    "Charms": "Charmes",
    "Charm": "Charme",
    "Consumables": "Consommables",
    "LICK FLOOR exists on a table.": "LICK FLOOR existe sur une table.",
    "The physical game is coming.": "Le jeu physique arrive.",
    "Leave your email: you’ll know before everyone.": "Laisse ton e-mail : tu le sauras avant tout le monde.",
    "I want to know first": "Je veux savoir en premier",
    "Account": "Compte",
    "offline: your progress lives on this PC only": "hors ligne : ta progression vit sur ce PC seulement",
    "Log in or create account": "Se connecter ou créer un compte",
    "Inventory": "Inventaire",
    "Items": "Objets",
    "nothing in your bag": "rien dans ton sac",
    "Dice skins": "Peaux de dés",
    "LOG OUT": "SE DÉCONNECTER",
    "Win your first game to open the Bounty Wall.": "Gagne ta première partie pour ouvrir le Bounty Wall.",
    "OPENING — THE TABLE CONFIRMS": "OUVERTURE — LA TABLE CONFIRME",
    "Nothing in the game is drawn before the last READY: the first Upkeep, the starting Tiles and the turn-order roll wait behind this gate.": "Rien n’est tiré avant le dernier PRÊT : le premier Upkeep, les tuiles de départ et le jet d’ordre du tour attendent derrière cette porte.",
    "TAKEN": "PRIS"
  };
  /* 390 (3) - S1553 : les compteurs du Bounty Wall (« <libelle> N / M »), au CHARACTER SELECT. */
  var COMPTEUR_FR = { "Consumables used": "Consommables utilisés", "Convocations / invitations played": "Convocations / invitations jouées",
    "Suicides": "Suicides", "Victories": "Victoires", "Player kills": "Joueurs tués", "Natural 1s rolled": "1 naturels obtenus",
    "WIS-based damage dealt": "Dégâts à base de WIS infligés", "Locks opened with a key": "Serrures ouvertes avec une clé",
    "Golden items equipped": "Objets dorés équipés", "Wins in a row": "Victoires d’affilée", "Successful fuit": "Fuites réussies",
    "Successful flees": "Fuites réussies", "Fire damage dealt": "Dégâts de Feu infligés", "Frost damage dealt": "Dégâts de Givre infligés",
    "Lightning damage dealt": "Dégâts de Foudre infligés", "Poison damage dealt": "Dégâts de Poison infligés",
    "Arcane damage dealt": "Dégâts d’Arcane infligés", "Chaos damage dealt": "Dégâts de Chaos infligés",
    "Bosses felled by two": "Boss abattus à deux", "Bosses killed": "Boss tués", "Chests opened": "Coffres ouverts",
    "DPT games played": "Parties DPT jouées", "DPT rank reached (Diamond)": "Rang DPT atteint (Diamond)",
    "DPT rank reached (Gold)": "Rang DPT atteint (Gold)", "DPT wins": "Victoires DPT", "Damage dealt": "Dégâts infligés",
    "Damage taken (all schools)": "Dégâts subis (toutes écoles)", "Dice-Eating Geese played": "Dice-Eating Geese jouées",
    "Extractions": "Extractions", "Fake co-ops pulled off": "Fake co-ops réussis", "HP healed": "PV soignés",
    "Mobs killed": "Mobs tués", "Natural 20s rolled": "20 naturels obtenus", "RUINS tiles entered": "Tuiles RUINS visitées",
    "Signatures in a single game": "Signatures en une seule partie", "Trades made": "Trocs faits",
    "Trades with players": "Trocs avec des joueurs" };
  for (var kh in EN_FR_HOME) { if (Object.prototype.hasOwnProperty.call(EN_FR_HOME, kh)) EN_FR[kh] = EN_FR_HOME[kh]; }
  /* S1555 - note 390 (3) : les SURFACES DE JEU en FR, relevees au DOM (DO YOU REACT, consultation, Casino) -- un
     texte visible que `traduis` rendait inchange. Stats FOR / DEX / SAG / AGI (391 (1) c), PV (GLOSSAIRE 2). */
  var EN_FR_JEU390 = {
    '⚠ YOU ARE TARGETED': '⚠ TU ES CIBLÉ', '⚠ IT’S HAPPENING TO YOU': '⚠ ÇA T’ARRIVE',
    '⚠ YOUR INVENTORY IS TARGETED': '⚠ TON INVENTAIRE EST CIBLÉ', '⚠ YOUR TILE IS TARGETED': '⚠ TA TUILE EST CIBLÉE',
    'You have time to play reactions — lit cards, Signature, gear — or/then press OK CONTINUE':
      'Tu as le temps de jouer des réactions — cartes allumées, Signature, équipement — puis OK · CONTINUER',
    'REACTION': 'RÉACTION', 'REACT NOW': 'RÉAGIS MAINTENANT', 'NOT NOW': 'PAS MAINTENANT',
    'OUT': 'SORTI', 'unplayable': 'injouable', 'portal taken': 'portail pris',
    /* S1566 - 400 (9) le tour interrompu ; 299 (1) le Sceau de Salomon */
    'YOUR TURN IS INTERRUPTED BY': 'TON TOUR EST INTERROMPU PAR', '— IT RESUMES AFTER THEIR ACTION': '— IL REPREND APRÈS SON ACTION',
    /* S1569 - 399 (4) / 400 (13) la BUG BOX */
    'REPORT A BUG': 'SIGNALER UN BUG', 'The game attaches the rest by itself: version, game, turn, log, screen.':
      'Le jeu joint le reste tout seul : version, partie, tour, journal, écran.',
    'Write one line first.': 'Écris d’abord une ligne.', 'Sending…': 'Envoi…', 'Sent, thank you.': 'Envoyé, merci.',
    'No connection — kept here, it will be sent at the next launch.': 'Pas de connexion — gardé ici, il partira au prochain lancement.',
    /* S1568 - 400 (12) la porte HI-SCORE */
    'Alone · 20 turns': 'Seul · 20 tours', 'Alone against the dungeon for twenty turns. Score as much as you can.':
      'Seul contre le donjon pendant vingt tours. Marque le plus de points possible.',
    'PASS': 'PASSER', 'USE IT NOW': 'L’UTILISER MAINTENANT', 'EQUIP IT NOW': 'L’ÉQUIPER MAINTENANT', 'KEEP IT IN HAND': 'LA GARDER EN MAIN',
    'COMMON': 'COMMUN', 'UNCOMMON': 'PEU COMMUN', 'EPIC': 'ÉPIQUE', 'LEGENDARY': 'LÉGENDAIRE',
    'Common': 'Commun', 'Uncommon': 'Peu commun', 'Epic': 'Épique', 'Legendary': 'Légendaire',
    /* S1557 - 389 (2) : la serrure de The Cell */
    'ROLL 1d20+STR (20 or more)': 'JET 1d20+STR (20 ou plus)', 'DISCARD YOUR HAND': 'DÉFAUSSE TA MAIN', 'USE YOUR KEY': 'UTILISE TA CLÉ',
    'the Action is spent even on failure · success teleports you': 'l’Action est dépensée même en cas d’échec · la réussite te téléporte',
    'Roll': 'Jet', 'dmg': 'dégâts','FIRE': 'FEU', 'FROST': 'GIVRE', 'LIGHTNING': 'FOUDRE',
    'forced target:': 'cible imposée :', '(only candidate — no choice to make)': '(seul candidat — aucun choix à faire)',
    'OVER': 'TERMINÉ', 'WINNER': 'VAINQUEUR', 'DEAD': 'MORT', 'YOUR BET': 'TON PARI',
    'scroll up': 'remonter', 'more below': 'la suite plus bas',
    'GAME OVER': 'FIN DE PARTIE', 'GAME': 'PARTIE', 'REWARDS': 'GAINS', '⤢ DETAILS': '⤢ DÉTAILS',
    'NEW GAME': 'NOUVELLE PARTIE', '⚔ FINAL DUEL': '⚔ DUEL FINAL',
    'TEETH EARNED': 'DENTS GAGNÉES', 'Table bonus': 'Prime de table',
    /* le troc (364 (5), protocole du moteur 956) */
    'YOUR CARDS — click to put on the table': 'TES CARTES — clique pour la poser sur la table', 'WORN': 'PORTÉE',
    'VALIDATE': 'VALIDER', 'CANCEL': 'ANNULER', '✓ VALIDATED': '✓ VALIDÉ', '✓ VALIDATED — waiting': '✓ VALIDÉ — on attend',
    'the trade happens when both of you validate the same table — any change takes both validations back':
      'le troc a lieu quand vous validez tous les deux la même table — tout changement reprend les deux validations',
    'click = put it on the table': 'clic = la poser sur la table', 'click = take it back': 'clic = la reprendre',
    /* les libelles litteraux de main.ts restes anglais (harnais : langue.js sous node, profil FR, el('…', '<litteral>')),
       hors couche admin / debug. */
    'AUTO-EXTRACT — the last one in the dungeon': 'AUTO-EXTRACTION — le dernier dans le donjon',
    'auto-extract — the last one in the dungeon': 'auto-extraction — le dernier dans le donjon',
    'YOU TAKE THE PORTAL': 'TU PRENDS LE PORTAIL',
    'the first': 'le premier', 'the second': 'le second', 'THE SECRET NUMBER': 'LE NOMBRE SECRET',
    'GOBLIN CASINO (RUINS) — THE SECRET BET': 'GOBLIN CASINO (RUINS) — LA MISE SECRÈTE',
    '→ NOBODY ELSE IN THE DUNGEON — THE ALTAR AWAITS OTHER VISITORS': '→ PERSONNE D’AUTRE DANS LE DONJON — L’AUTEL ATTEND D’AUTRES VISITEURS',
    'THE FINAL DUEL': 'LE DUEL FINAL', 'no killing blow': 'pas de coup fatal', 'BACK IN THE DUNGEON': 'DE RETOUR DANS LE DONJON',
    'nothing lost': 'rien de perdu', 'IMMUNITY INACTIVE': 'IMMUNITÉ INACTIVE', 'no answer given': 'aucune réponse donnée',
    'THE LOCK GIVES — WHAT IT COSTS': 'LA SERRURE CÈDE — CE QUE ÇA COÛTE', 'CASINO — YOU BUST': 'CASINO — TU SAUTES',
    'THE PROMISE ARRIVES': 'LA PROMESSE ARRIVE', 'the Flee': 'la fuite', 'TRAP': 'PIÈGE', '☠ TRAP': '☠ PIÈGE',
    'A TRAP CHANGES VICTIM': 'UN PIÈGE CHANGE DE VICTIME', 'A HIT IS REFLECTED': 'UN COUP EST RENVOYÉ',
    'THE OFFERING HAS SPOKEN': 'L’OFFRANDE A PARLÉ', 'DRAW REROLL': 'RELANCE DU TIRAGE',
    'A DIE ROLLED FOR NOTHING': 'UN DÉ LANCÉ POUR RIEN', 'YOUR WHOLE HAND GOES': 'TOUTE TA MAIN PART',
    'your hand was already empty — nothing went': 'ta main était déjà vide — rien n’est parti',
    'FORCED — you didn’t have to click': 'FORCÉ — tu n’avais pas à cliquer',
    'DECLARED — applied after the reactions': 'DÉCLARÉ — appliqué après les réactions', '— after the reveal': '— après la révélation',
    'everything this seat has seen — most recent on top': 'tout ce que ce siège a vu — le plus récent en haut',
    'no Tile in play': 'aucune tuile en jeu', 'no points scored': 'aucun point marqué',
    'No abilities on this sheet.': 'Aucune capacité sur cette fiche.', 'GEAR · AUTOMATIC': 'ÉQUIPEMENT · AUTOMATIQUE',
    'goes off on its own — you won’t be asked': 'part tout seul — on ne te demandera rien', 'GEAR': 'ÉQUIPEMENT', 'Gear': 'Équipement',
    '— you cannot pay': '— tu ne peux pas payer', 'LEAVES PLAY:': 'QUITTE LE JEU :',
    'PASSIVES — they apply on their own': 'PASSIFS — ils s’appliquent seuls', 'EQUIP from hand:': 'ÉQUIPER depuis la main :',
    'UNEQUIP to hand:': 'RETIRER vers la main :', '⚠ BY EQUIPPING, YOU JUST LOST': '⚠ EN ÉQUIPANT, TU VIENS DE PERDRE',
    '⊘ no valid target here': '⊘ aucune cible valable ici', '(or leave empty: the decision will open)': '(ou laisse vide : la décision s’ouvrira)',
    'TIE — goes to the roller': 'ÉGALITÉ — va au lanceur', 'BUST': 'SAUTÉ', '— an exit is available on this Tile': '— une sortie est disponible sur cette tuile',
    'THE CELL — break the lock:': 'THE CELL — briser la serrure :', 'no way offered this turn': 'aucun moyen offert ce tour',
    '⏸ PAUSED — the timer is stopped at': '⏸ EN PAUSE — le minuteur est arrêté à', '· your reserve is draining:': '· ta réserve s’épuise :',
    '① the roll': '① le jet', 'WHY YOU ROLL': 'POURQUOI TU LANCES', 'IT TARGETS YOU': 'ÇA TE VISE', 'YOU TAKE': 'TU PRENDS',
    'TRADE (free, outside the Action count):': 'TROC (gratuit, hors du compte des Actions) :', 'no other seat at this table': 'aucun autre siège à cette table',
    'hand verdict (step by step):': 'verdict de la main (pas à pas) :', 'empty hand': 'main vide', '☠ remains of': '☠ restes de',
    '⎋ Esc puts back all raised cards': '⎋ Échap repose toutes les cartes levées', 'no drawn Tile is known on this decision': 'aucune tuile tirée connue sur cette décision',
    '⚠ you are destroying a piece equipped by': '⚠ tu détruis une pièce équipée par', 'asks you for this card': 'te demande cette carte',
    'TURN:': 'TOUR :', 'WAITING ON:': 'ON ATTEND :', '— no winner': '— pas de vainqueur', 'Dead — run lost': 'Mort — run perdu',
    'THE DUNGEON EMPTIES': 'LE DONJON SE VIDE', 'your partner:': 'ton partenaire :', 'No deaths: no one has a choice to make.': 'Aucun mort : personne n’a de choix à faire.',
    'YOUR QUESTS FOR RUN 2': 'TES QUÊTES POUR LE RUN 2', 'you keep your character — you may redraw your unfinished quests': 'tu gardes ton personnage — tu peux retirer tes quêtes inachevées',
    'Choose your school': 'Choisis ton école', 'WHERE THE POINTS CAME FROM': 'D’OÙ VIENNENT LES POINTS', 'HAND': 'MAIN',
    'no event this game': 'aucun événement cette partie', 'NO WINNER': 'PAS DE VAINQUEUR', 'nothing earned this game': 'rien gagné cette partie',
    '× — not included yet': '× — pas encore inclus', 'nothing found this game': 'rien trouvé cette partie', 'nothing moved this game': 'rien n’a bougé cette partie',
    'the Bounty Wall is not loaded here': 'le Bounty Wall n’est pas chargé ici', 'NO WINNER — nobody wins this game': 'PAS DE VAINQUEUR — personne ne gagne cette partie',
    'YOUR PROFILE': 'TON PROFIL', 'no points scored this game': 'aucun point marqué cette partie', 'WHAT THE WHOLE GAME DID': 'CE QUE LA PARTIE ENTIÈRE A FAIT',
    '↻ YOUR CHANCE TO RESPOND': '↻ TA CHANCE DE RÉPONDRE', 'nothing yet.': 'rien pour l’instant.', 'YOUR TURN TO PLAY': 'À TOI DE JOUER',
    '· YOU': '· TOI', 'nothing yet this turn': 'rien encore ce tour', 'roll?': 'jet ?', 'DAMAGE': 'DÉGÂTS', 'choose where you go': 'choisis où tu vas',
    'none of your attacks can target it right now': 'aucune de tes attaques ne peut le cibler maintenant',
    'they win: you get double · they lose: you lose your teeth': 's’il gagne : tu touches le double · s’il perd : tu perds tes dents',
    'BETS CLOSED — the first blow has been struck': 'PARIS FERMÉS — le premier coup est porté', 'PLACE YOUR BET — before the first blow': 'PARIE — avant le premier coup',
    'nothing has happened in this combat yet': 'rien ne s’est encore passé dans ce combat', 'nothing equipped — they carried nothing': 'rien d’équipé — il ne portait rien',
    'ON THEM': 'SUR LUI', 'ON THE GROUND': 'AU SOL', 'the whole table — key points in bold': 'toute la table — l’essentiel en gras',
    'the duel is over.': 'le duel est fini.', 'each loss with its source — nothing is summed': 'chaque perte avec sa source — rien n’est additionné',
    'NO OPPONENT TO SHOW': 'AUCUN ADVERSAIRE À MONTRER', 'IMMUNE — the school doesn’t get through': 'IMMUNISÉ — l’école ne passe pas',
    'DAMAGE TAKEN': 'DÉGÂTS SUBIS', 'no loot to reveal': 'aucun butin à révéler', 'no outcome fact known since the opening': 'aucune issue connue depuis l’ouverture',
    'TARGET OF YOUR NEXT MOVE': 'CIBLE DE TON PROCHAIN COUP', 'no fighter left standing opposite': 'plus aucun combattant debout en face',
    'INITIATIVE · order fixed at opening:': 'INITIATIVE · ordre fixé à l’ouverture :', 'TO ANSWER': 'À RÉPONDRE', 'applies on its own': 's’applique seul',
    'THE COMBAT, IN ORDER': 'LE COMBAT, DANS L’ORDRE', 'the combat has just opened — nothing has landed yet': 'le combat vient de s’ouvrir — rien n’a encore porté',
    'LOOT': 'BUTIN', 'YOU GIVE': 'TU DONNES', 'nothing yet — click a card below': 'rien pour l’instant — clique une carte en dessous',
    '✓ YOU VALIDATED': '✓ TU AS VALIDÉ', 'nothing yet': 'rien pour l’instant', 'NO CHOICE REQUESTED': 'AUCUN CHOIX DEMANDÉ',
    'nothing is known about this seat yet': 'on ne sait encore rien de ce siège', 'no Mob known in this combat': 'aucun Mob connu dans ce combat',
    '🗝 OPENING A CHEST': '🗝 OUVERTURE D’UN COFFRE', 'no action roll known for this seat': 'aucun jet d’action connu pour ce siège',
    'how the Explore line of TABLE v2 shows the tile’s die': 'comment la ligne Explorer de la TABLE v2 montre le dé de la tuile',
    'music, effects and interface together': 'musique, effets et interface ensemble',
    'turn start and end, the turn timer, menu clicks': 'début et fin de tour, le minuteur du tour, les clics de menu',
    'the move is resolving — END TURN comes once the damage has landed': 'le coup se résout — FIN DU TOUR vient une fois les dégâts posés',
    'the dungeon turn by turn — Esc to go back': 'le donjon tour par tour — Échap pour revenir',
    'FOLLOW THE ACTION: the view will follow whoever plays': 'SUIVRE L’ACTION : la vue suit celui qui joue',
    'options — Esc opens and closes': 'options — Échap ouvre et ferme',
    'click for the detail': 'clique pour le détail',
    'Signature available': 'Signature disponible', 'Signature spent this Dungeon Turn': 'Signature employée ce tour de donjon',
    'Signature ready — playable now': 'Signature prête — jouable maintenant',
    'BET 1 CARD TO SIT AT THE TABLE': 'MISE 1 CARTE POUR T’ASSEOIR À LA TABLE',
    '⊘ empty hand — nothing to bet, you cannot sit': '⊘ main vide — rien à miser, tu ne peux pas t’asseoir',
    'GRAVEYARD ⤢': 'CIMETIÈRE ⤢',
    'HOW MANY CARDS DO YOU DISCARD, IN SECRET?': 'COMBIEN DE CARTES DÉFAUSSES-TU, EN SECRET ?',
    'open the graveyard: every card played from a hand, full size': 'ouvrir le cimetière : chaque carte jouée d’une main, en grand',
    'the commit and time YOUR server started (JOUER.bat) — quote it in every report. If it is from yesterday, close the black window and relaunch: the code has moved since, your screen has not':
      'le commit et l’heure où TON serveur a démarré (JOUER.bat) — cite-le dans chaque rapport. S’il date d’hier, ferme la fenêtre noire et relance : le code a bougé depuis, ton écran non',
    'which commit this screen is built from, and when it was built — quote it in every report: a stale screen gives a false verdict':
      'de quel commit cet écran est construit, et quand — cite-le dans chaque rapport : un écran périmé rend un faux verdict',
    'seed · turn · who the game is waiting on · how long nothing has moved · the last 40 log lines — one symptom = one paste. Works with a frozen game, and without a clipboard.':
      'graine · tour · qui la partie attend · depuis quand rien ne bouge · les 40 dernières lignes du journal — un symptôme = un collage. Marche avec une partie figée, et sans presse-papiers.',
    'open admin mode (?debug=1) — this is not the player screen':'ouvrir le mode admin (?debug=1) — ce n’est pas l’écran du joueur',
    /* les annonces des fenetres, en minuscules dans « en reaction a : » (le cimetiere) */
    'SOMEONE IS ABOUT TO FALL': 'QUELQU’UN VA TOMBER', 'SOMEONE HAS JUST FLED FROM YOU': 'QUELQU’UN VIENT DE TE FUIR',
    'AN OFFER HAS JUST BEEN ACCEPTED': 'UNE OFFRE VIENT D’ÊTRE ACCEPTÉE', 'AN OFFER HAS JUST BEEN REFUSED': 'UNE OFFRE VIENT D’ÊTRE REFUSÉE',
    'A GEAR PIECE HAS JUST BEEN DRAWN': 'UNE PIÈCE D’ÉQUIPEMENT VIENT D’ÊTRE PIOCHÉE', 'A TILE HAS JUST BEEN DRAWN': 'UNE TUILE VIENT D’ÊTRE TIRÉE'
  };
  for (var k390 in EN_FR_JEU390) { if (Object.prototype.hasOwnProperty.call(EN_FR_JEU390, k390)) EN_FR[k390] = EN_FR_JEU390[k390]; }
  /* « en attente de … » : la table `attente` des declencheurs (main.ts, DECLENCHEUR_EN_FRANCAIS), entiere. */
  var ATTEND_390 = { 'a card to be drawn': 'qu’une carte soit piochée', 'the start of a player turn': 'le début d’un tour de joueur',
    'the end of a player turn': 'la fin d’un tour de joueur', 'the start of the Run': 'le début du Run',
    'someone to enter a Tile': 'que quelqu’un entre sur une tuile', 'someone to enter your Tile': 'que quelqu’un entre sur ta tuile',
    'the bearer to declare they will leave their Tile': 'que le porteur déclare quitter sa tuile',
    'a card to be played': 'qu’une carte soit jouée', 'someone to be targeted': 'que quelqu’un soit ciblé',
    'someone to be about to fall': 'que quelqu’un soit sur le point de tomber', 'someone to be killed': 'que quelqu’un soit tué',
    'a Mob to be drawn': 'qu’un Mob soit pioché', 'a player to die': 'qu’un joueur meure',
    'a piece to be equipped': 'qu’une pièce soit équipée', 'a trade to take place': 'qu’un troc ait lieu',
    'someone to discard': 'que quelqu’un défausse', 'someone to flee from you': 'qu’on te fuie',
    'an offer to be accepted': 'qu’une offre soit acceptée', 'an offer to be refused': 'qu’une offre soit refusée',
    'a Gear piece to be drawn': 'qu’une pièce d’équipement soit piochée', 'a Tile to be drawn': 'qu’une tuile soit tirée' };
  for (var ka in ATTEND_390) { if (Object.prototype.hasOwnProperty.call(ATTEND_390, ka) && ATTEND_FR[ka] === undefined) ATTEND_FR[ka] = ATTEND_390[ka]; }
  function attendFR(q) {
    var l = q.split(', or ');
    for (var i = 0; i < l.length; i += 1) { if (ATTEND_FR[l[i]] === undefined) return null; l[i] = ATTEND_FR[l[i]]; }
    return l.join(', ou ');
  }
  function annonceFR(s) {
    var k = s.toUpperCase();
    return Object.prototype.hasOwnProperty.call(EN_FR, k) ? EN_FR[k].toLowerCase() : s;
  }
  /* S1565 - note 400 (6), verdict Croze 28/10 : « on garde STR DEX WIS AGI MAX HP partout, toujours en anglais » --
     les stats ne se traduisent plus (remplace FOR / SAG de 391 (1) c). */
  function statsFR(s) { return s; }
  var STAT_FR = { STR: 'STR', DEX: 'DEX', WIS: 'WIS', AGI: 'AGI' };
  /* ... et HP / MAX HP au lieu de PV / PV max, y compris dans les phrases francaises du moteur, que le profil FR
     affiche telles quelles : derniere passe de `traduisLaChaine` en FR. */
  function hpEnAnglais(s) {
    return s.replace(/\bPV (?:max(?:imum)?|MAX)\b/g, 'MAX HP').replace(/\bPV\b/g, 'HP');
  }
  var ECOLE_MIN_FR = { arcane: 'arcane', chaos: 'chaos', fire: 'feu', frost: 'givre', lightning: 'foudre', poison: 'poison' };
  for (var kj in EN_FR_JEU) { if (Object.prototype.hasOwnProperty.call(EN_FR_JEU, kj)) EN_FR[kj] = EN_FR_JEU[kj]; }
  var GESTE_FR = { 'Move': 'Se déplacer', 'Explore (1d6)': 'Explorer (1d6)', 'Interaction :': 'Interaction :',
    'Extract': 'Sortir', 'Trade': 'Troc', 'Fight': 'Combattre', 'Loot the body': 'Fouiller le corps',
    'Break the lock': 'Briser le verrou' };
  EN_FR_MOTIFS = [
    [/^(\d+)\. (Move|Explore \(1d6\)|Interaction :|Extract|Trade|Fight|Loot the body|Break the lock)$/,
      function (m, n, g) { return n + '. ' + GESTE_FR[g]; }],
    [/^TURN (\d+)$/, 'TOUR $1'], [/^collapse 1d(\d+)$/, 'Collapse 1d$1'], [/^portal (\d+) %$/, 'portail $1 %'],
    /* S1567 - note 403 (1) : PROCHAIN COLLAPSE · PROCHAIN PORTAIL */
    [/^next collapse 1d(\d+)$/, 'prochain Collapse 1d$1'], [/^next portal (\d+) %$/, 'prochain portail $1 %'],
    [/^ROUND (\d+)$/, 'MANCHE $1'],
    [/^next: (.+)$/, 'suivant : $1'], [/^LEVEL (\d+) · (.+)$/, 'NIVEAU $1 · $2'],
    [/^LEVEL (\d+)$/, 'NIVEAU $1'], [/^MASTER (THE .+)$/, 'MAÎTRISER $1'], [/^OWNED (.+)$/, 'POSSÉDÉS $1'],
    [/^(\d+) seat\(s\) to confirm:$/, '$1 siège(s) à confirmer :'],
    [/^New game — (.+) · the table confirms its READY$/, 'Nouvelle partie — $1 · la table confirme son PRÊT'],
    [/^(.+) (\d+) \/ (\d+)$/, function (m, l, a, b) { return COMPTEUR_FR[l] === undefined ? m : COMPTEUR_FR[l] + ' ' + a + ' / ' + b; }],
    /* 392 (4) - les restes anglais du tuto joue en FR (mesures au DOM, S1551). */
    [/^⏱ NO ACTION LEFT — END TURN IN (\d+) s$/, '⏱ PLUS D’ACTION — FIN DU TOUR DANS $1 s'],
    [/^(.+)'s turn$/, 'TOUR DE $1'], [/^· (.+) is reacting$/, '· $1 réagit'],
    [/^⏳ WAITING — (.+) is reacting · (\d+) s$/, '⏳ EN ATTENTE — $1 réagit · $2 s'],
    /* 388 (2) / 390 (6) - la raison d'un Skill refuse, dans l'aide du tour de combat. */
    [/^(.+) — unavailable: the target is protected — (.+)$/, '$1 — indisponible : la cible est protégée — $2'],
    [/^(.+) — unavailable: the target is protected$/, '$1 — indisponible : la cible est protégée'],
    [/^(.+) — unavailable: (.+)$/, '$1 — indisponible : $2'],
    /* 392 (4) - GLOSSAIRE 3 : « THE BOLTWRIGHT STARTS » -> « THE BOLTWRIGHT COMMENCE » (le jet du premier joueur). */
    [/^(→ )?(.+) STARTS$/, function (m, f, q) { return (f || '') + q + ' COMMENCE'; }],
    /* S1480 - note 314 (2) : les points de grade de l'ecran de fin. */
    [/^PROMOTED — GRADE (\d+)$/, 'PROMU — GRADE $1'],
    [/^(\d+)(?:st|nd|rd|th) place(.*)$/, function (m, n, reste) {
      return (n === '1' ? '1re' : n + 'e') + ' place' + reste.replace('streak', 'série'); }],
    /* S1466 - note 350 (2) : les presentations TEXT / PERCENT de l'exploration (« 6 Chest », « Chest 17 % »). */
    [/^(\d+(?:-\d+)?) Chest$/, '$1 Coffre'], [/^Chest (\d+ %)$/, 'Coffre $1'],
    [/^ROLL (.+)$/, 'JET $1'],
    [/^ATTACK TABLE — (.+)$/, 'TABLE D’ATTAQUE — $1'],
    [/^→ the card reads this face: (.+)$/, function (m, c) { return '→ la carte lit cette face : ' + conditionFR(c); }],
    [/^→ the card asked for (.+) — this face did not give it$/, function (m, c) { return '→ la carte demandait ' + conditionFR(c) + ' — cette face ne l’a pas donné'; }],
    [/^→ (.+) flees to (.+?) — turn over$/, '→ $1 fuit vers $2 — fin du tour'],
    [/^→ (.+) flees to (.+)$/, '→ $1 fuit vers $2'],
    [/^(⊘ )?awaits (.+)$/, function (m, p, q) { var a = attendFR(q); return a === null ? m : (p || '') + 'attend ' + a; }],
    [/^(⊘ )?nothing to target — (.+)$/, function (m, p, q) { return CIBLE_FR[q] === undefined ? m : (p || '') + 'rien à cibler — ' + CIBLE_FR[q]; }],
    [/^⚔ (.+) fights (.+)$/, '⚔ $1 combat $2'],
    [/^(.+) deals (Fire|Frost|Lightning|Poison|Arcane|Chaos) DMG to (.+)$/, function (m, a, e, b) { return a + ' inflige des DMG de ' + ECOLE_FR[e] + ' à ' + b; }],
    [/^(.+) deals DMG to (.+)$/, '$1 inflige des DMG à $2'],
    [/^☠ (.+) dies \((.+)\)$/, '☠ $1 meurt ($2)'],
    [/^You draw (.+)$/, 'Tu pioches $1'],
    [/^T(\d+) · (.+) plays “(.+)” · card$/, 'T$1 · $2 joue « $3 » · carte'],
    [/^T(\d+) · 🎲 DIE REROLLED — (.+)$/, function (m, t, r) {
      return 'T' + t + ' · 🎲 DÉ RELANCÉ — ' + r.split(' · ').map(function (x) { return RELANCE_FR[x] || x; }).join(' · '); }],
    [/^(.+) plays (.+)$/, '$1 joue $2'],
    [/^(.+) discards (.+)$/, '$1 défausse $2'],
    [/^(.+) moves to (.+)$/, '$1 se rend à $2'],
    [/^(.+) stuns (.+)$/, '$1 étourdit $2'],
    [/^(.+) flees (.+)$/, '$1 fuit $2'],
    [/^(\d+) cards? in hand$/, '$1 carte(s) en main'],
    [/^waiting on: (.+)$/, function (m, q) { return 'on attend : ' + q.replace(/\bYOU\b/, 'TOI'); }],
    [/^offered by : (.+)$/, 'proposé par : $1'],
    [/^already seated : (.+)$/, 'déjà assis : $1'],
    [/^sitting costs 1 card from hand — already seated: (.+)$/, 's’asseoir coûte 1 carte de la main — déjà assis : $1'],
    [/^CONSULTATION — (.+) · asked by (.+) · (\d+) invited, (\d+) pending$/, 'CONSULTATION — $1 · posée par $2 · $3 invités, $4 en attente'],
    [/^TILE ENTRY — (.+) enters (.+?) → Rock-Paper-Scissors, round (\d+)$/, 'ENTRÉE DE TUILE — $1 entre dans $2 → Pierre-feuille-ciseaux, manche $3'],
    [/^TILE ENTRY — (.+) enters (.+)$/, 'ENTRÉE DE TUILE — $1 entre dans $2'],
    [/^Slot taken — unequip (.+) to put this one on$/, 'Emplacement pris — retire $1 pour mettre celle-ci'],
    [/^EQUIP → ([A-Z]+(?: \d)?)( · COSTS THE SKILL)?$/, function (m, s, c) { return 'ÉQUIPER → ' + (EMPLACEMENT_FR[s] || s) + (c ? ' · COÛTE LE SKILL' : ''); }],
    [/^(.+) · USED TO RUN$/, '$1 · A SERVI À FUIR'],
    [/^YOU (\d*d\d+)$/, 'TOI $1'],
    [/^(\d+)d(\d+) — (\d+) dice read FACE BY FACE\. The sum decides nothing$/, '$1d$2 — $3 dés lus FACE PAR FACE. La somme ne décide rien'],
    [/^(.+) · range ([\d-]+) → « (.+) » · ⚠ hits the whole table, wherever they are in the dungeon$/, '$1 · plage $2 → « $3 » · ⚠ touche toute la table, où qu’elle soit dans le donjon'],
    [/^↳ in reaction to: (.+)$/, function (m, q) { return '↳ en réaction à : ' + annonceFR(q); }],
    /* S1555 - note 390 (3) : les surfaces de jeu (DO YOU REACT, consultation, Casino), relevees au DOM. */
    [/^(.+) — (.+) — in reaction to: (.+)$/, function (m, a, b, q) { return a + ' — ' + b + ' — en réaction à : ' + annonceFR(q); }],
    [/^(ARME · )?(.+) — sheet weapon · (.+)$/, function (m, s, a, f) { return (s || '') + a + ' — arme de fiche · ' + statsFR(f); }],
    [/^(STR|DEX|WIS|AGI) (-?\d+) — base (-?\d+)(?: · modifier ([+-]\d+))?$/, function (m, st, v, b, mo) { return STAT_FR[st] + ' ' + v + ' — base ' + b + (mo ? ' · modificateur ' + mo : ''); }],
    [/^(STR|DEX|WIS|AGI) (-?\d+)$/, function (m, st, v) { return STAT_FR[st] + ' ' + v; }],
    [/^(STR|DEX|WIS|AGI) (-?\d+) — base (-?\d+) · modifier ([+-]?\d+) · floored at 0 \(actual sum (-?\d+), §[\d.]+\)$/, function (m, st, v, b, mo, s) { return STAT_FR[st] + ' ' + v + ' — base ' + b + ' · modificateur ' + mo + ' · plancher à 0 (somme réelle ' + s + ')'; }],
    [/^real sum (-?\d+) — floored at 0 — removing a malus gives nothing back until the debt is covered\.$/, 'somme réelle $1 — plancher à 0 — retirer un malus ne rend rien tant que la dette n’est pas couverte.'],
    [/^the piece goes back to your hand — it will cost (\d+) HP$/, 'la pièce retourne dans ta main — ça coûtera $1 PV'],
    [/^(\d+) HP$/, '$1 PV'], [/^(.+) · (\d+) \/ (\d+) HP · (\d+) card\(s\) in hand$/, '$1 · $2 / $3 PV · $4 carte(s) en main'],
    [/^(\d) — (Trap|Mob|Chest) · (.+)$/, function (m, f, i, r) { return f + ' — ' + ({ Trap: 'Piège', Mob: 'Mob', Chest: 'Coffre' })[i] + ' · ' + r; }],
    [/^(.+) is muted: it never opens a window for you — click to be asked$/, '$1 est en sourdine : elle n’ouvre jamais de fenêtre pour toi — clique pour être interrogé'],
    [/^(.+) is muted: it changes rolls only if you open its eye — click to be asked$/, '$1 est en sourdine : elle ne change les jets que si tu ouvres son œil — clique pour être interrogé'],
    [/^\+(STR|DEX|WIS|AGI):$/, function (m, st) { return '+' + STAT_FR[st] + ' :'; }],
    [/^(\d+)\+ : Loot$/, '$1+ : Butin'],
    [/^SPECTATING — (.+) vs (.+)$/, 'EN TRAIN DE REGARDER — $1 contre $2'],
    [/^(\d+) slot\(s\) on this sheet$/, '$1 emplacement(s) sur cette fiche'],
    [/^(.+) WINS$/, '$1 GAGNE'], [/^\+(\d+) teeth — (.+) won$/, '+$1 dents — $2 a gagné'],
    [/^✦ (.+) completes (.+) \(\+(\d+) pts?\)$/, '✦ $1 accomplit $2 (+$3 pt)'],
    [/^☠ (.+) kills (.+) \(\+(\d+) pts?\)$/, '☠ $1 tue $2 (+$3 pt)'],
    [/^(.+) deals$/, '$1 inflige'], [/^DMG to (.+)$/, 'DÉGÂTS à $1'],
    [/^(\d+) HP of (\d+) — below the alert threshold of (\d+)$/, '$1 PV sur $2 — sous le seuil d’alerte de $3'],
    [/^Max HP: (\d+)$/, 'PV max : $1'], [/^(\d+) HP of (\d+)$/, '$1 PV sur $2'],
    [/^SCHOOLS OF MAGIC ([\s\S]+)$/, function (m, r) { return 'ÉCOLES DE MAGIE\n' + (r === 'none' ? 'aucune' : r.replace(/\b(FIRE|FROST|LIGHTNING)\b/g, function (e) { return ({ FIRE: 'FEU', FROST: 'GIVRE', LIGHTNING: 'FOUDRE' })[e]; })); }],
    [/^(FIRE|FROST|LIGHTNING) (\d+)$/, function (m, e, v) { return ({ FIRE: 'FEU', FROST: 'GIVRE', LIGHTNING: 'FOUDRE' })[e] + ' ' + v; }],
    [/^(.+) — click: hand, gear, points$/, function (m, a) { return (a === 'no points scored' ? 'aucun point marqué' : a) + ' — clic : main, équipement, points'; }],
    [/^(\d+) deaths? in the game$/, '$1 mort(s) dans la partie'],
    /* les gabarits `${…}` de main.ts restes anglais (harnais, meme tamis) */
    [/^(.+) DIES$/, '$1 MEURT'], [/^(.+) TAKES THE PORTAL$/, '$1 PREND LE PORTAIL'], [/^(.+) LOSES (.+)$/, '$1 PERD $2'],
    [/^(.+)’S TABLE — THE GOBLIN CASINO$/, 'LA TABLE DE $1 — THE GOBLIN CASINO'], [/^LOOP ROLL · (.+)$/, 'JET EN BOUCLE · $1'],
    [/^CHOOSE YOUR TARGET · (.+)$/, 'CHOISIS TA CIBLE · $1'], [/^(.+) GIVES (\d+)$/, '$1 DONNE $2'], [/^(.+) GIVES$/, '$1 DONNE'],
    /* le bandeau d'attente d'un autre siege (main.ts::peindreLAttenteDUnAutre), avec ou sans chrono */
    [/^⏳ (WAITING — )?(.+) is (reacting|choosing… (.+?))( · .+)?$/, function (m, w, n, v, q, c) {
      var Q = { 'a target': 'une cible', 'rock-paper-scissors': 'pierre-feuille-ciseaux', 'loot': 'un butin', 'a discard': 'une défausse',
        'flee or fight': 'fuir ou combattre', 'a card': 'une carte', 'an invitation': 'une invitation', 'a number': 'un nombre', 'an answer': 'une réponse' };
      return '⏳ ' + (w ? 'EN ATTENTE — ' : '') + n + (q === undefined ? ' réagit' : ' choisit… ' + (Q[q] || q)) + (c || '');
    }],
    [/^(⊘ )?combat turn of (.+) — not yours$/, function (m, p, n) { return (p || '') + 'tour de combat de ' + n + ' — pas le tien'; }],
    /* S1556 - 389 (1) : l'encart des copies (Copy Cats, Confused Parrot) */
    [/^(.+) — WHO GETS EACH COPY\?$/, '$1 — QUI REÇOIT CHAQUE COPIE ?'], [/^Copy (\d+) →$/, 'Copie $1 →'],
    [/^(.+) \(you\)$/, '$1 (toi)'],
    [/^TRADE WITH (.+)$/, 'TROC AVEC $1'], [/^(.+) ⇄ (.+) — TRADING$/, '$1 ⇄ $2 — EN TROC'], [/^hand revealed: (.+)$/, 'main révélée : $1'], [/^(.+) broke the tie$/, '$1 a départagé'],
    [/^gives back (.+)$/, 'rend $1'], [/^drawn from the deck (.+)$/, 'tiré du paquet $1'], [/^1d(\d+) — landed on (\d+)$/, '1d$1 — tombé sur $2'],
    [/^from (\d+) to (\d+):$/, 'de $1 à $2 :'],
    [/^Last one inside — the dungeon doesn't do private parties\. It spat you out\.(.*)$/, 'Dernier dedans — le donjon ne fait pas de soirées privées. Il t’a recraché.$1'],
    [/^(\d+) cards? — (.+) \(the cards stay secret\)$/, '$1 carte(s) — $2 (les cartes restent secrètes)'],
    [/^(.+) on (.+) · (.+) →$/, '$1 sur $2 · $3 →'], [/^(\d+) teeth on (.+)$/, '$1 dents sur $2'],
    [/^(\d+) to (\d+) teeth · they win: double · they lose: you lose them$/, '$1 à $2 dents · s’il gagne : le double · s’il perd : tu les perds'],
    [/^(\d+) possible targets — your target:$/, '$1 cibles possibles — ta cible :'], [/^(\d+) cards? in hand$/, '$1 carte(s) en main'],
    [/^the last of (\d+)$/, 'le dernier de $1'], [/^the sheet has no (.+) slot$/, 'la fiche n’a pas d’emplacement $1'],
    [/^teeth ×2 · \+(\d+) if the objective is met — awaiting the engine$/, 'dents ×2 · +$1 si l’objectif est atteint — en attente du moteur'],
    [/^today’s twist not yet in the engine: (.+)$/, 'la variante du jour n’est pas encore dans le moteur : $1'],
    [/^roll (\d+)$/, 'jet $1'],
    /* la borne du tour de donjon (main.ts, palier du tour) : « draw LEGENDARY · Collapse 1d20 · portal at 1+ » */
    [/^(?:draw [A-Z]+|Collapse 1d\d+|portal at \d+\+)(?: · (?:draw [A-Z]+|Collapse 1d\d+|portal at \d+\+))*$/, function (m) {
      return m.split(/\s+·\s+/).map(function (b) {
        var d = /^draw ([A-Z]+)$/.exec(b);
        if (d) return 'pioche ' + ({ COMMON: 'COMMUN', UNCOMMON: 'PEU COMMUN', RARE: 'RARE', EPIC: 'ÉPIQUE', LEGENDARY: 'LÉGENDAIRE' }[d[1]] || d[1]);
        var p = /^portal at (\d+)\+$/.exec(b);
        return p ? 'portail à ' + p[1] + '+' : b;
      }).join('  ·  ');
    }],
    [/^killed by (.+)$/, function (m, b) { return 'tué par ' + (b === 'the Collapse' ? 'le Collapse' : b); }],
    [/^you kill (.+)$/, 'tu tues $1'], [/^YOUR TEETH (.+)$/, 'TES DENTS $1'],
    [/^\+(\d+) XP → (.+) level (\d+)$/, '+$1 XP → $2 niveau $3'],
    [/^Mob kills (\d+)$/, 'Mobs tués $1'], [/^Table bonus (\d+)$/, 'Prime de table $1'],
    [/^arcane (\d+) · chaos (\d+) · fire (\d+) · frost (\d+) · lightning (\d+) · poison (\d+)$/, 'arcane $1 · chaos $2 · feu $3 · givre $4 · foudre $5 · poison $6'],
    [/^(.+) — your target: your attack goes at them$/, '$1 — ta cible : ton attaque va sur lui'],
    [/^target (.+)$/, 'cibler $1'],
    [/^(.+) will ask you when it can answer — click to mute it$/, '$1 te demandera quand elle peut répondre — clique pour la mettre en sourdine'],
    [/^(.+) — tap: the card in big$/, '$1 — touche : la carte en grand'],
    [/^grade (\d+) frame$/, 'cadre de grade $1'], [/^(\d+) points? this game$/, '$1 point(s) cette partie'],
    [/^gear score (\d+) — what they carry, weighted by rarity$/, 'score d’équipement $1 — ce qu’il porte, pondéré par la rareté'],
    [/^(\d+) action\(s\) left of (\d+)$/, '$1 action(s) restante(s) sur $2'],
    [/^(.+?) · (.+?) · (\d+) HP out of (\d+) · (\d+) card\(s\) · (.+)$/, function (m, a, b, h, x, c, o) { return a + ' · ' + b + ' · ' + h + ' PV sur ' + x + ' · ' + c + ' carte(s) · ' + (o === '— off-tile' ? '— hors tuile' : o); }],
    [/^(.+) joins the fight(?: — (.+))?$/, function (m, a, r) { return a + ' entre dans le combat' + (r ? ' — ' + r.split(' · ').map(function (x) { return x === 'CANNOT BE KILLED' ? 'INTUABLE' : x.replace(/^(\d+) HP$/, '$1 PV'); }).join(' · ') : ''); }],
    [/^server started (.+)$/, 'serveur démarré $1'],
    [/^END TURN — (\d+) to discard$/, 'FIN DU TOUR — $1 à défausser'],
    /* S1489 - note 368 (10) et (5) : HOW IT ENDED et les des du draft, en francais. */
    [/^(.+) was killed by (.+)$/, function (m, a, b) { return a + ' a été tué par ' + (b === 'the Collapse' ? 'le Collapse' : b); }],
    [/^(.+) stays dead — no return this run$/, '$1 reste mort — pas de retour ce run'],
    [/^(.+) extracted through a portal$/, '$1 est sorti par un portail'],
    [/^(.+) was the last one inside — extracted automatically \(\+(\d+) pt\)$/, '$1 était le dernier dedans — sorti d’office (+$2 pt)'],
    [/^(.+) died$/, '$1 est mort'],
    [/^WHO PICKS FIRST — 1d(\d+)$/, 'QUI CHOISIT EN PREMIER — 1d$1']
  ];
  /* 339 (2) — l'ecran double ses blancs autour de « · » et de « — » (mesure : « ”  ·  card ») : chaque
     espace d'un motif vaut UN OU PLUSIEURS blancs. */
  EN_FR_MOTIFS = EN_FR_MOTIFS.map(function (m) { return [new RegExp(m[0].source.replace(/ /g, '\\s+'), m[0].flags), m[1]]; });
  /* S1419 - note 241 (1) : LE JEU EST ECRIT EN ANGLAIS, A LA SOURCE. `main.ts` portait
     son francais et ce module le traduisait libelle par libelle : une cle peinte dans
     une phrase composee passait en francais (« la piece retourne dans ta main — will
     cost 2 PV », vu au DOM). Le jeu declare desormais l'ANGLAIS comme origine (index.html) ;
     le mode FRANCAIS d'OPTIONS lit ce lexique A L'ENVERS (anglais -> francais), sans
     ses motifs a nombre : une partie des libelles restera en anglais en FRANCAIS. */
  (function () {
    var inv = {};
    for (var k in FR_EN) {
      if (Object.prototype.hasOwnProperty.call(FR_EN, k) && !Object.prototype.hasOwnProperty.call(inv, FR_EN[k])) inv[FR_EN[k]] = k;
    }
    for (var e in EN_FR) { if (Object.prototype.hasOwnProperty.call(EN_FR, e)) inv[e] = EN_FR[e]; }
    EN_FR = inv;
  })();

  var ORIGINE = 'FR';
  var dico = null, motifs = null;
  var originaux = new WeakMap();
  var observateur = null;

  function lis() {
    try {
      var p = window.LLProfil && window.LLProfil.lis();
      var l = p && p.options && p.options.langue;
      if (l === 'FR' || l === 'EN') return l;
    } catch (e) { /* stockage refusé : la langue d'origine */ }
    return null;
  }

  /* ⛑ S1392 · O-T3 (note 215 ②) — sans réglage, L'ANGLAIS, sur toutes les
     surfaces (la cible du jeu, Croze 14/09). Avant : la langue d'ORIGINE de
     chaque page, donc le jeu en français chez qui n'avait jamais ouvert
     OPTIONS — les captures de Croze. */
  /* S1552 - note 390 (5) : au PREMIER lancement (aucun reglage au profil), la langue du navigateur ; ensuite celle
     du profil, qui ne change jamais toute seule (GLOSSAIRE 1 bis). */
  function duNavigateur() {
    try { return /^fr\b/i.test(String(navigator.language || '')) ? 'FR' : 'EN'; } catch (e) { return 'EN'; }
  }
  function cible() { return lis() || duNavigateur(); }

  /* ⛑ S1392 · O-T3 (note 215 ②) — « les noms des personnages à la place de
     JOUEUR N, partout ». Le jeu imprime l'identifiant du siège en cent
     endroits ; la table siège → personnage vient de `main.ts` (`noms`), et
     elle vaut dans LES DEUX langues : un nom n'est pas un mot. */
  var NOMS = null;
  var RE_SIEGE = /\b(?:Joueur|JOUEUR) (\d+)\b/g;
  function nomme(s) {
    if (NOMS === null) return s;
    return s.replace(RE_SIEGE, function (m, k) {
      return Object.prototype.hasOwnProperty.call(NOMS, 'Joueur ' + k) ? NOMS['Joueur ' + k] : m;
    });
  }

  /* Une chaine entiere -> sa traduction (ou elle-meme). ⛑ S1399 : partagee par
     les textes ET les infobulles ; et « Nom — raison » traduit sa raison quand
     elle est une cle (les infobulles des lignes de fiche : « Ice Bolt — le
     geste de ce tour de combat est employé »). */
  function traduisLaChaine(s) {
    var nommé = nomme(s);
    var t = dico !== null && Object.prototype.hasOwnProperty.call(dico, nommé) ? dico[nommé] : null;
    if (t === null && motifs !== null) {
      for (var i = 0; i < motifs.length; i += 1) {
        if (motifs[i][0].test(nommé)) { t = nommé.replace(motifs[i][0], motifs[i][1]); break; }
      }
    }
    if (t === null && dico !== null) {
      var k = nommé.indexOf(' — ');
      if (k > 0) {
        var raison = nommé.slice(k + 3);
        var r = Object.prototype.hasOwnProperty.call(dico, raison) ? dico[raison]
          : Object.prototype.hasOwnProperty.call(dico, '⊘ ' + raison) ? dico['⊘ ' + raison].replace(/^⊘ /, '') : null;
        if (r === null && motifs !== null) {
          for (var m2 = 0; m2 < motifs.length; m2 += 1) {
            if (motifs[m2][0].test(raison)) { r = raison.replace(motifs[m2][0], motifs[m2][1]); break; }
          }
        }
        if (r !== null) t = nommé.slice(0, k + 3) + r;
      }
    }
    /* S1419 - note 241 (1) : une option a plusieurs effets est peinte en UNE chaine,
       les effets joints par « · » (le moteur, `optionLabel`) : chaque morceau se traduit. */
    if (t === null && dico !== null && nommé.indexOf(' · ') > 0) {
      var morceaux = nommé.split(' · ');
      var change = false;
      for (var q = 0; q < morceaux.length; q += 1) {
        var mq = morceaux[q];
        var tq = Object.prototype.hasOwnProperty.call(dico, mq) ? dico[mq] : null;
        if (tq === null && motifs !== null) {
          for (var z = 0; z < motifs.length; z += 1) {
            if (motifs[z][0].test(mq)) { tq = mq.replace(motifs[z][0], motifs[z][1]); break; }
          }
        }
        if (tq !== null && tq !== mq) { morceaux[q] = tq; change = true; }
      }
      if (change) t = morceaux.join(' · ');
    }
    /* S1419 - note 241 (1) : une phrase COMPOSEE (« T1 · ⚔ COMBAT CLOSED — <cause du
       moteur> · <suite> ») ne tombe ni sur une cle entiere ni sur un decoupage : en
       anglais, chaque cle FRANCAISE de 10 caracteres et plus qu'elle CONTIENT est
       remplacee, la plus longue d'abord (vu au DOM, S1419). */
    if (dico === FR_EN) {
      var source = t === null ? nommé : t;
      var re = sousChaines();
      if (re !== null && re.test(source)) {
        re.lastIndex = 0;
        var remplacé = source.replace(re, function (m) { return FR_EN[m]; });
        if (remplacé !== source) t = remplacé;
      }
    }
    var rendu = t === null ? nommé : t;
    return dico === EN_FR ? hpEnAnglais(rendu) : rendu;
  }
  var RE_SOUS_CHAINES = undefined;
  function sousChaines() {
    if (RE_SOUS_CHAINES !== undefined) return RE_SOUS_CHAINES;
    var cles = [];
    for (var k in FR_EN) {
      if (Object.prototype.hasOwnProperty.call(FR_EN, k) && k.length >= 10 && /[a-zà-ÿ]/i.test(k) && k !== FR_EN[k]) cles.push(k);
    }
    cles.sort(function (a, b) { return b.length - a.length; });
    RE_SOUS_CHAINES = cles.length === 0 ? null
      : new RegExp(cles.map(function (k) { return k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|'), 'g');
    return RE_SOUS_CHAINES;
  }

  function traduitUnTexte(n) {
    var brut = n.nodeValue;
    if (brut === null) return;
    var s = brut.trim();
    if (s === '') return;
    /* S1466 - note 350 (1) : sur un BOUTON, « BACK » est un retour (RETOUR), jamais l'emplacement DOS. */
    var t = dico === EN_FR && s === 'BACK' && n.parentElement !== null && n.parentElement.closest('button') !== null
      ? 'RETOUR' : traduisLaChaine(s);
    if (t === s) return;
    originaux.set(n, brut);
    n.nodeValue = brut.replace(s, t);
  }

  /* ⛑ S1399 · O-T3 — les INFOBULLES : « toute chaîne visible » (note 215 ②). */
  var titresOriginaux = new WeakMap();
  function traduitUnTitre(el) {
    if (!el || el.nodeType !== 1) return;
    var brut = el.getAttribute('title');
    if (brut === null) return;
    var s = brut.trim();
    if (s === '') return;
    var t = traduisLaChaine(s);
    if (t === s) return;
    titresOriginaux.set(el, brut);
    el.setAttribute('title', t);
  }
  function parcoursDesTitres(racine) {
    if (!racine || racine.nodeType !== 1) return;
    if (racine.hasAttribute('title')) traduitUnTitre(racine);
    var l = racine.querySelectorAll('[title]');
    for (var i = 0; i < l.length; i += 1) traduitUnTitre(l[i]);
  }

  function parcours(racine, f) {
    if (racine.nodeType === 3) { f(racine); return; }
    var w = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT);
    var n;
    while ((n = w.nextNode())) f(n);
  }

  function arrête() {
    if (observateur !== null) { observateur.disconnect(); observateur = null; }
  }

  function applique() {
    arrête();
    try { document.documentElement.lang = cible() === 'EN' ? 'en' : 'fr'; } catch (e) { /* */ }
    /* Revenir à l'origine : chaque nœud traduit reprend sa valeur d'avant. */
    parcours(document.body, function (n) {
      if (originaux.has(n)) { n.nodeValue = originaux.get(n); originaux.delete(n); }
    });
    var avecTitre = document.body.querySelectorAll('[title]');
    for (var q = 0; q < avecTitre.length; q += 1) {
      if (titresOriginaux.has(avecTitre[q])) {
        avecTitre[q].setAttribute('title', titresOriginaux.get(avecTitre[q]));
        titresOriginaux.delete(avecTitre[q]);
      }
    }
    /* S1419 - note 241 (1) : la page dit sa langue, mais le MOTEUR ecrit encore des
       phrases francaises (raisons de jouabilite, refus, causes) que l'ecran recopie : en
       ANGLAIS, le lexique FR -> EN reste donc TOUJOURS pose (vu au DOM : « un Skill se
       declare sur son tour de COMBAT » repassait en francais quand le jeu s'est declare
       anglais). En FRANCAIS, le lexique a l'envers. */
    if (cible() === 'EN') { dico = FR_EN; motifs = FR_EN_MOTIFS; }
    else if (ORIGINE === 'FR') { dico = null; motifs = null; }
    else { dico = EN_FR; motifs = EN_FR_MOTIFS; }
    if (dico === null && NOMS === null) return;
    parcours(document.body, traduitUnTexte);
    parcoursDesTitres(document.body);
    observateur = new MutationObserver(function (lot) {
      for (var i = 0; i < lot.length; i += 1) {
        var m = lot[i];
        if (m.type === 'characterData') traduitUnTexte(m.target);
        else if (m.type === 'attributes') traduitUnTitre(m.target);
        else {
          for (var j = 0; j < m.addedNodes.length; j += 1) {
            parcours(m.addedNodes[j], traduitUnTexte);
            parcoursDesTitres(m.addedNodes[j]);
          }
        }
      }
    });
    observateur.observe(document.body, { childList: true, subtree: true, characterData: true,
      attributes: true, attributeFilter: ['title'] });
  }

  function pose(l) {
    if (l !== 'FR' && l !== 'EN') return;
    try {
      window.LLProfil.modifie(function (p) {
        if (p.options === null || typeof p.options !== 'object') p.options = {};
        p.options.langue = l;
      });
    } catch (e) { /* stockage refusé : l'effet vaut pour la séance */ }
    applique();
  }

  /* Chaque page déclare sa langue d'origine, une fois, quand son corps existe. */
  function installe(origine) {
    ORIGINE = origine === 'EN' ? 'EN' : 'FR';
    if (document.body) applique();
    else document.addEventListener('DOMContentLoaded', applique);
  }

  /* La table siège → personnage, reposée par le jeu à chaque rendu : ne
     refait le passage que si elle a CHANGÉ (une nouvelle partie). */
  var nomsClé = '';
  function noms(table) {
    var clé = JSON.stringify(table || null);
    if (clé === nomsClé) return;
    nomsClé = clé;
    NOMS = table || null;
    if (document.body) applique();
  }

  /* S1457 - note 336 (5) : une phrase que l'ecran DECOUPE (le de en icone, l'objet colore) n'est plus un
     seul noeud de texte, et le lexique ne reconnait pas ses morceaux : l'ecran la traduit ENTIERE avant. */
  function traduis(s) { return dico === null ? s : traduisLaChaine(s); }
  window.LLLangue = { lis: lis, cible: cible, pose: pose, installe: installe, applique: applique, noms: noms, traduis: traduis };
})();
