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
    'PASSER — je ne réagis pas': 'PASS — I don’t react',
    'PASSER LA MAIN': 'PASS',
    'PASSER': 'PASS',
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
    'le portail est ouvert sur TOUTES les tuiles': 'the portal is open on EVERY tile',
    'à l’Upkeep : aucun Collapse, aucun portail': 'at Upkeep: no Collapse, no portal',
    'COMMENT ON MARQUE': 'HOW YOU SCORE',
    'quête accomplie +1 · joueur tué +1 · Last Out +1 · Boss tué +2 · Sub-Boss 0':
      'quest done +1 · player killed +1 · Last Out +1 · Boss killed +2 · Sub-Boss 0',
    'extraction : tu sors vivant, tes points sont gardés et ton équipement passe au run 2':
      'extraction: you get out alive, your points are kept and your gear carries into run 2',
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
    [/^RUN (\d+) · TOUR DE DONJON (\d+)$/, 'RUN $1 · DUNGEON TURN $2'],
    [/^(\d+) POINTS?$/, '$1 POINTS'],
    [/^(\d+) emplacement\(s\) sur cette fiche$/, '$1 slot(s) on this sheet'],
    [/^garder (\d+) carte\(s\)$/, 'keep $1 card(s)'],
    [/^RUN (\d+) · TOUR (\d+)$/, 'RUN $1 · TURN $2'],
    [/^le portail ouvre sur un jet ≥ (\d+)$/, 'the portal opens on a roll ≥ $1'],
    [/^à l’Upkeep : 1d(\d+) — le même dé fait les dégâts du Collapse et ouvre le portail$/, 'at Upkeep: 1d$1 — the same die deals the Collapse damage and opens the portal'],
    [/^1d(\d+) = dégâts$/, '1d$1 = damage'],
    [/^(\d+)\/(\d+) par tour de donjon$/, '$1/$2 per dungeon turn'],
    [/^défausser (\d+)$/, 'discard $1'],
    [/^(\d+) passif\(s\) — ils s’appliquent seuls, rien à jouer ici$/, '$1 passive(s) — they apply on their own, nothing to play here'],
    [/^la fiche n’a pas d’emplacement ([A-Z]+)$/, 'the sheet has no $1 slot'],
    [/^(\d+) tuiles en jeu, choisis celle où tu atterris$/, '$1 tiles in play, choose the one you land on'],
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
    '· TOI': '· YOU',
    'TOI': 'YOU',
    'PAS MAINTENANT': 'NOT NOW',
    '⏱ la scène se joue encore — ta question arrive juste après, et rien ne passera à ta place avant': '⏱ the scene is still playing — your question comes right after, and nothing will pass for you before',
    '⏱ le dé est encore en train de se montrer — le compte à rebours n’a pas commencé, et rien ne passera à ta place avant': '⏱ the die is still showing — the countdown has not started, and nothing will pass for you before',
    'CE QUI SE PASSE DANS CE COMBAT': 'WHAT HAPPENS IN THIS FIGHT',
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
    'AUCUNE TUILE — ce siège n’est sur aucune tuile en ce moment': 'NO TILE — this seat is on no tile right now',
    'AUCUNE TUILE — le Duel Final ne se tient sur aucune tuile': 'NO TILE — the Final Duel is held on no tile',
    'TU ES MORT — tu regardes': 'YOU ARE DEAD — you watch',
    'leurs mains restent cachées · tu ne peux plus jouer ni réagir': 'their hands stay hidden · you can no longer play or react',
    'TU REGARDES': 'YOU ARE WATCHING',
    '⟵ MON PLATEAU': '⟵ MY BOARD',
    'ÉPUISÉE': 'SPENT',
    '⊘ déjà employée ce TOUR DE DONJON — elle revient à la fin du tour de donjon, pas à la fin de ton tour': '⊘ already used this DUNGEON TURN — it comes back at the end of the dungeon turn, not at the end of your turn',
    '⊘ changer d\'équipement appartient à son propre tour de combat': '⊘ changing gear belongs to your own combat turn',
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
    'Rien de la partie n\'est tiré avant le dernier READY : le premier Upkeep, les tuiles de départ et le jet d\'ordre attendent derrière cette porte.': 'Nothing in the game is drawn before the last READY: the first Upkeep, the starting tiles and the order roll wait behind this door.',
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
    'rien à viser — un joueur de la tuile, au choix': 'nothing to target — a player on the tile, your choice',
    '⊘ rien à viser — un joueur de la tuile, au choix': '⊘ nothing to target — a player on the tile, your choice',
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
    'attend qu’un mob soit tiré': 'waits for a mob to be drawn',
    '⊘ attend qu’un mob soit tiré': '⊘ waits for a mob to be drawn',
    'attend que quelqu’un te fuie': 'waits for someone to flee you',
    '⊘ attend que quelqu’un te fuie': '⊘ waits for someone to flee you',
    '⚑ une réponse t’est demandée — panneau ci-contre': '⚑ an answer is asked of you — panel alongside',
    '⊘ aucun tour de combat dû à ce siège (on attend une action)': '⊘ no combat turn owed by this seat (an action is awaited)',
    '⊘ aucun tour de combat dû à ce siège (on attend un choix)': '⊘ no combat turn owed by this seat (a choice is awaited)',
    'TON TOUR — tu agis': 'YOUR TURN — you act',
    'une action': 'one action',
    'le Collapse': 'the Collapse',
    '— une sortie est disponible sur cette tuile (§4.2)': '— an exit is available on this tile (§4.2)',
    '⊘ cette carte est offerte dans une question en cours — elle ne bouge pas tant que tu n\'as pas répondu': '⊘ this card is offered in a pending question — it does not move until you answer',
    '⊘ ne se joue pas pendant un combat': '⊘ cannot be played during a fight',
    'FIN DU RUN 1': 'END OF RUN 1',
    'les scores, le stuff, et ce qui reste en main': 'the scores, the gear, and what is left in hand',
    'repart de zéro · le stash revient en main': 'starts from zero · the stash comes back to hand',
    'clique n’importe où pour le détail des points': 'click anywhere for the point details',
    'DÉPOUILLE': 'REMAINS',
    'LE MOMENT OÙ ÇA COMPTE': 'THE MOMENT THAT COUNTS',
    'LE RUN EST FINI': 'THE RUN IS OVER',
    'la partie se termine — clique n’importe où pour aller au tableau': 'the game ends — click anywhere to go to the board',
    'la main est vide : il n\'y a rien à mettre à l\'abri': 'the hand is empty: there is nothing to keep safe',
    '⊘ on ne réarrange pas son équipement pendant qu\'une carte vient le prendre': '⊘ you don’t rearrange your gear while a card is taking it',
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
    'à débloquer au Bounty Wall': 'to unlock on the Bounty Wall',
    'ta cible : ton attaque part sur lui': 'your target: your attack goes at it',
    'ne réagit à rien : elle se déclenche par un coût': 'reacts to nothing: it is triggered by a cost',
    'le commit et l’heure où TON serveur a démarré (JOUER.bat) — à citer dans tout signalement. S’il date d’hier, ferme la fenêtre noire et relance : le code a bougé depuis, ton écran ne l’a pas': 'the commit and time YOUR server started (JOUER.bat) — quote it in any report. If it dates from yesterday, close the black window and relaunch: the code has moved since, your screen has not',
    'ouvrir le mode admin (?debug=1) — ce n\'est pas l\'écran du joueur': 'open admin mode (?debug=1) — not the player’s screen',
    'graine · tour · qui la partie attend · depuis combien de temps plus rien ne bouge · les 40 dernières lignes du journal — un symptôme = un collage. Marche partie figée, et sans presse-papier.': 'seed · turn · who the game waits for · how long nothing has moved · the last 40 log lines — one symptom = one paste. Works on a frozen game, and without clipboard.',
    'la NOUVELLE TABLE, le son (ambiance · musique) et la résolution — Échap ouvre et referme, comme dans MTG Arena, Hearthstone et Slay the Spire : elle ferme ce qui est ouvert, et s’il n’y a rien d’ouvert, elle ouvre ce panneau': 'the NEW TABLE, sound (ambience · music) and resolution — Esc opens and closes, as in MTG Arena, Hearthstone and Slay the Spire: it closes what is open, and if nothing is open, it opens this panel',
    'bascule vers la vue compacte — le jeu continue dessous, et la scène finit de se raconter en petit': 'switch to the compact view — the game goes on underneath, and the scene finishes in small',
    'la pièce retourne dans ta main': 'the piece goes back to your hand',
    'tout lire en grand — Échap pour revenir': 'read it all in big — Esc to go back',
    'la table normale, avec les joueurs — le combat continue · Échap': 'the normal table, with the players — the fight goes on · Esc',
    'revenir au combat': 'back to the fight',
    'retombe : définitif': 'falls back: permanent',
    'la vue suit celui qui joue — clique pour revenir à ton plateau': 'the view follows whoever plays — click to go back to your board',
    'le joueur précédent (flèche gauche)': 'previous player (left arrow)',
    'le joueur suivant (flèche droite)': 'next player (right arrow)',
    'revenir à mon plateau — Échap aussi': 'back to my board — Esc too',
    'changer d\'équipement appartient à son propre tour de combat': 'changing gear belongs to your own combat turn',
    'tu valides la fiche de chaque siège, l’un après l’autre — au lieu de laisser la graine choisir pour eux': 'you confirm each seat’s sheet, one after the other — instead of letting the seed choose for them',
    'le Skill de ce tour est déjà employé — un seul par tour de combat': 'this turn’s Skill is already used — one per combat turn',
    'MOVE — PIOCHE une tuile du deck et s’y rend. La destination est SUBIE (SPEC §5.3) : on ne choisit pas où l’on va, et on ne clique pas une tuile déjà en jeu.': 'MOVE — DRAWS a tile from the deck and goes there. The destination is FORCED (SPEC §5.3): you do not choose where you go, and you do not click a tile already in play.',
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
    '⊘ rien à viser — tous les adversaires du combat': '⊘ nothing to target — all opponents in the fight',
    'rien à viser — tous les adversaires du combat': 'nothing to target — all opponents in the fight',
    'rien à viser — un présent de la tuile, joueur ou Mob, lanceur exclu — au choix': 'nothing to target — anyone on the tile, player or Mob, caster excluded — your choice',
    '⊘ rien à viser — un présent de la tuile, joueur ou Mob, lanceur exclu — au choix': '⊘ nothing to target — anyone on the tile, player or Mob, caster excluded — your choice',
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
    [/il a quitté la tuile/g, 'left the tile'],
    [/il a pris le portail/g, 'took the portal'],
    [/il est tombé/g, 'fell'],
    [/contre un Mob/g, 'against a Mob'],
    [/le Collapse/g, 'the Collapse'],
    [/ ou /g, ' or '],
    [/— hors tuile/g, '— off tile'],
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
    [/que quelqu’un entre sur une tuile/g, 'someone entering a tile'],
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
    [/^gear score (\d+) — ce qu'il porte, pesé par rareté \((.+)\)$/, 'gear score $1 — what they wear, weighted by rarity ($2)'],
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
    [/^⟶ LE COMBAT · (.+) · ROUND (\d+)$/, avecFragments('⟶ THE FIGHT · $1 · ROUND $2')],
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
    [/^T(\d+) · (.+) entre dans (.+)  ·  en piochant une tuile$/, 'T$1 · $2 enters $3  ·  by drawing a tile'],
    [/^T(\d+) · (.+) équipe (.+) → ([A-Z]+)$/, 'T$1 · $2 equips $3 → $4'],
    [/^Le corps de (.+)$/, 'The body of $1'],
    [/^LOOT A CORPSE — (.+) \((\d+) carte\(s\)\)$/, 'LOOT A CORPSE — $1 ($2 card(s))'],
    [/^(\d+) pièce\(s\) équipable\(s\) — dans la main, ci-contre$/, '$1 equippable piece(s) — in hand, alongside'],
    [/^tirage de table — aucun dé · intervalle (.+) → « (.+) »$/, 'table draw — no die · range $1 → « $2 »'],
    [/^(\d*d\d+) · intervalle (.+) → « (.+) »  ·  ⚠ touche toute la table, où qu’ils soient dans le donjon$/, '$1 · range $2 → « $3 »  ·  ⚠ hits the whole table, wherever they are in the dungeon'],
    [/^(\d*d\d+) · intervalle (.+) → « (.+) »  ·  ⚠ touche tous les joueurs présents sur la tuile, engagés ou non$/, '$1 · range $2 → « $3 »  ·  ⚠ hits every player on the tile, engaged or not'],
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
    [/^T(\d+) · TÉLÉPORT — (.+) → une tuile piochée du deck courant, subie$/, 'T$1 · TELEPORT — $2 → a tile drawn from the current deck, forced'],
    [/^T(\d+) · DÉFAUSSE — (.+) ·$/, 'T$1 · DISCARD — $2 ·'],
    [/^CONSULTATION — (.+) · posée par (.+)  ·  (\d+) invité\(s\), (\d+) en attente$/, 'CONSULTATION — $1 · asked by $2  ·  $3 invited, $4 waiting'],
    [/^les camps : (.+)$/, 'the sides: $1'],
    [/^(.+) — qu’il y aille$/, '$1 — let them go'],
    [/^=  (\d+) dégâts bruts \(§8\.1\) — les PV suivent, à l'écriture$/, '=  $1 raw damage (§8.1) — HP follow when written'],
    [/^SA DERNIÈRE TUILE CONNUE — (.+) — elle n’est plus en jeu$/, 'THEIR LAST KNOWN TILE — $1 — no longer in play'],
    [/^(.+) — RIEN NE S’EST PASSÉ$/, '$1 — NOTHING HAPPENED'],
    [/^ÉCOLE CHOISIE · (.+)$/, 'SCHOOL CHOSEN · $1'],
    [/^·  (.+)  ·  il est à$/, '·  $1  ·  they are at'],
    [/^·  (.+)  ·  il reste$/, '·  $1  ·  left:'],
    [/^T(\d+) · ♦ GOBLIN CASINO FERMÉ — égalité à$/, 'T$1 · ♦ GOBLIN CASINO CLOSED — tie at']
  ];
  FR_EN_MOTIFS = FR_EN_MOTIFS.concat(FR_EN_MOTIFS_2);

  /* Le HOME, écrit en anglais -> français. Les NOMS (Vault, Bounty Wall, Dive,
     Dungeon Pro League…) restent : ce sont des titres de Croze, pas des mots. */
  var EN_FR = {
    'Back': 'Retour',
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
  function cible() { return lis() || 'EN'; }

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
    return t === null ? nommé : t;
  }

  function traduitUnTexte(n) {
    var brut = n.nodeValue;
    if (brut === null) return;
    var s = brut.trim();
    if (s === '') return;
    var t = traduisLaChaine(s);
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
    if (cible() === ORIGINE) { dico = null; motifs = null; }
    else {
      dico = ORIGINE === 'FR' ? FR_EN : EN_FR;
      motifs = ORIGINE === 'FR' ? FR_EN_MOTIFS : EN_FR_MOTIFS;
    }
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

  window.LLLangue = { lis: lis, cible: cible, pose: pose, installe: installe, applique: applique, noms: noms };
})();
