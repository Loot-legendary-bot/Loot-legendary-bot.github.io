# assets/audio — structure v1

## Regle
Le disque est stable. Le routage est de la donnee.
Un fichier ne bouge JAMAIS une fois depose. Changer d'avis = editer une cellule
de l'onglet `Sons`, jamais un `git mv`.

## Arborescence
    assets/audio/
      music/     16 pistes   R128 -16 LUFS  (11 tenues, 5 HORS CIBLE -- voir plus bas)
      ambient/    7 boucles  R128 -20 LUFS  (passe SOUS la musique)
      sfx/       45 effets   crete -1 dBFS  (pas de R128 : inutile sur un transitoire court)

Le dossier = le bus. Il est fixe a l'ingestion car il determine la
normalisation. Tout le reste (event, gain, boucle) vit dans le classeur.

## Format
OGG Vorbis q5, 48 kHz. Pochettes et ID3 supprimes.
Vorbis et non MP3 : le MP3 porte un padding d'encodeur qui cree un trou
audible a chaque rebouclage.

## Colonnes de sons.csv
  sound_id        identite du fichier. Ne change jamais.
  bus             SFX / AMBIENT / MUSIC
  event           TODO_EVENT partout. A remplir contre la liste reelle des
                  evenements du moteur, PAS depuis hint_croze.
  hint_croze      annotation d'origine, verbatim. Colonne humaine, jamais lue
                  par une machine.
  gain_db         0 par defaut. C'est le bouton de mixage : il change le
                  rendu sans jamais re-encoder un fichier.
  boucle          TODO_BOUCLE sur music et ambient.
  lieu            OU la piste sonne : HOME / DONJON / DUEL / FIN. Vide = le
                  sac du donjon, c'est-a-dire le comportement d'avant la
                  colonne. C'est la SEULE colonne de routage, et elle est
                  lue par une machine (contrairement a hint_croze).

Plusieurs sound_id peuvent partager un meme `event` : le moteur tire alors une
variante au hasard. C'est deja le cas de fait pour tile_move_door_01..05,
dice_roll_01..03 et melee_sword_combo_01..02.

## Hors depot
_hors_depot/ n'entre pas dans git. Voir NOTE_LICENCE.txt.

## Valeur connue hors cible
amb_home_fire_night_01 est a -0.3 dBTP au lieu de -1.0. Le crepitement de feu
a un facteur de crete trop eleve pour tenir -20 LUFS et -1 dBTP ensemble.
Ne clippe pas. Ne pas lui ajouter de gain positif.

## Les cinq musiques de la note 108 : deposees SANS ingestion (S850)
menu_home_1, midnight_shadows, neon_dungeon_party, quest_for_the_lost_star et
shadowed_path sont arrivees a -11.9 / -12.1 / -12.2 / -12.6 / -12.7 LUFS, soit
environ 4 dB AU-DESSUS de la cible du bus, et deux d'entre elles a +0.4 et
+1.0 dBFS de crete -- donc deja ecretees dans le fichier.

Mesure faite au decodeur du navigateur, corroboree sur les onze anciennes dont
les nombres publies ici sont reproduits a l'identique. L'instrument est
`packages/debug-ui/tools/mesure_musiques.js` ; il se relance, il ne se recopie
pas :

    await import('/tools/mesure_musiques.js').then((m) => m.mesure())

En attendant une re-ingestion, leur colonne `gain_db` porte la compensation qui
les ramene a -16 LUFS (-4.1 / -3.9 / -3.8 / -3.4 / -3.3). C'est exactement ce
que cette colonne est : le bouton de mixage, sans re-encoder un fichier. Le
jour ou la source est normalisee, les cinq reviennent a 0. Porte a Croze sous
`Q-MUSIQUE-NIVEAU`.

## Une piste peut etre au bon bus et au mauvais endroit (S850, resolu au S929)
Le bus dit COMMENT un son sonne (sa normalisation a l'ingestion), jamais OU il
sonne. `menu_home_1` est la musique du HOME (note 108) : elle est au bus MUSIC
et elle doit rester HORS du sac du donjon.

Du S850 au S928, cet ecart etait une liste de NOMS ecrite dans `main.ts`
(`MUSIQUES_DU_HOME`) -- un routage dans du CODE, ce que la Regle ci-dessus
interdit. Croze a tranche (note 111 (3)) : c'est la colonne `lieu`, et elle
existe depuis le S929. La liste de noms a disparu du code.

Ce qui reste VIDE, et c'est voulu : les 52 lignes AMBIENT et SFX. Croze n'a
tranche que les musiques. `amb_home_fire_night_01` porte dans `hint_croze`
l'annotation << HOME SCREEN OUTSIDE THE DUNGEON BY NIGHT >> et tourne toujours
dans le sac d'ambiance du donjon : cette colonne-la est humaine et n'est jamais
lue par une machine, c'est a Croze de trancher. Le jour ou il ecrit HOME dans
la colonne `lieu` de cette ligne, il n'y a PLUS UNE LIGNE DE CODE a toucher.

`DUEL` et `FIN` sont du vocabulaire declare a zero porteur : le mot est accepte
et la piste sort du sac du donjon, mais aucun lecteur ne les joue encore. C'est
un manque NOMME, pas un silence.

## L'INGESTION A ENFIN SA COMMANDE (S1142) — et l'encodeur n'etait pas absent, il etait ABSENT DE LA MACHINE

Du S850 a ce palier, ce fichier decrivait un FORMAT (`OGG Vorbis q5, 48 kHz`) sans
dire par quoi l'obtenir, et la mesure faite au S850 -- *« aucun encodeur sur la
machine : `ffmpeg`, `oggenc`, `sox`, `opusenc`, `avconv`, les cinq absents »* --
s'est recopiee de palier en palier comme une propriete du lieu. **Re-mesuree ici :
les cinq sont toujours absents du PATH, et c'est vrai.** Ce qui etait faux est la
conclusion posee a cote : un encodeur s'installe, HORS du depot, en une commande.

    npm install ffmpeg-static        (dans un dossier de travail, jamais ici)

*Un gel se re-mesure, il ne se recopie pas* -- et celui-ci tenait depuis presque
trois cents paliers sur une mesure JUSTE dont la conclusion ne l'etait pas.

### La chaine, marche par marche

Elle est en DEUX passes, et la seconde ne se lance jamais seule : la premiere
MESURE le fichier, la seconde applique ce qu'elle a mesure. Une passe unique de
`loudnorm` travaille en aveugle sur un flux et rend une loudness approximative.

    # passe 1 -- mesure, aucune ecriture
    ffmpeg -i "<source>" -af loudnorm=I=-16:TP=-1.0:LRA=11:print_format=json -f null -

    # passe 2 -- application des cinq nombres de la passe 1, puis encodage
    ffmpeg -i "<source>" \
      -af "loudnorm=I=-16:TP=-1.0:LRA=11:measured_I=..:measured_TP=..:measured_LRA=..:measured_thresh=..:offset=..:linear=true" \
      -vn -map_metadata -1 -ar 48000 -ac 2 -c:a libvorbis -q:a 5 "music/<sound_id>.ogg"

`-vn -map_metadata -1` est ce qui tient la ligne « Pochettes et ID3 supprimes »
ci-dessus : sans lui la pochette entre dans le `.ogg` comme un flux video.

### Le verdict se lit sur la SORTIE, jamais sur l'intention

    ffmpeg -i "music/<sound_id>.ogg" -af ebur128=peak=true -f null -

C'est ce nombre-la qui va dans les colonnes `lufs_i` et `crete_dbtp`, jamais
celui de la passe 1 -- *un plafond declare n'est pas un plafond mesure*. Et la
preuve finale n'est ni l'un ni l'autre : c'est le decodeur du NAVIGATEUR
(`AudioContext.decodeAudioData`), qui dit la frequence, les canaux et la duree
du fichier tel qu'il sera servi.

### Ou vont les sources

`_hors_depot/` -- ce dossier etait DECLARE ici et dans `snd/.gitignore` depuis le
premier jour, et il n'existait pas encore au disque. Croze depose ses `.mp3` dans
`music/` (c'est le dossier qu'il connait) ; l'ingestion les en sort et les y range,
leur nom reste ecrit dans la colonne `fichier_source`. **`music/` reste donc
entierement visible a git** : le jour ou un fichier neuf y tombe, `git status` le
dit. Une regle `.gitignore` posee sur `music/*.mp3` aurait ferme cette porte-la,
et un depot suivant serait arrive en silence.

### Les cinq de la note 108 ne sont PAS re-ingerees, et c'est une decision

Elles portent toujours leur compensation `gain_db` (-4.1 / -3.9 / -3.8 / -3.4 /
-3.3). La note 122 (3) a tranche : *« si l'oreille de Croze les entend, je
re-encode ; sinon, rien »*. L'encodeur existe desormais ICI, ce qui change le
COUT de cette decision (un remplacement sur place, pas un depot de plus) -- pas
la decision. Deux d'entre elles sont ecretees DANS le fichier (+0.4 et +1.0
dBFS) et aucun `gain_db` ne defait un ecretage : le jour ou Croze dit un mot, la
chaine ci-dessus les rend a -16 LUFS / -1 dBTP et les cinq reviennent a 0.
