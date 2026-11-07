/*
 * mur_etoile.js — S1672 · note 490 : LE BOUNTY WALL EN ÉTOILE.
 *
 * Phrase de Croze (note 490) : *« j'ouvre le Bounty Wall : je vois toute l'étoile, je zoome jusqu'à une bounty, je
 * lis sa condition, je dézoome d'un geste. »*
 *
 * (1) LA CARTE — un canvas plein écran, parchemin et encre. Au centre le Spirit of the Dungeon (le tronc
 * `pointe: null`, ses bounties sur deux anneaux en quinconce : il en porte 29), les six esprits d'école aux six
 * pointes de l'hexagramme (`pointe` 0 = en haut, sens horaire — l'ordre de `bounty_wall.js`), chaque rang de leur
 * arbre en satellite : un rang = une bounty (sa condition, son compteur, sa récompense). Accomplie = allumée,
 * en cours = compteur, esprit endormi = ternie. La récompense s'écrit au-delà du nœud, le pacte est un anneau d'or.
 *
 * (2) LA NAVIGATION — zoom continu à la molette et au pincement (de la vue d'ensemble au nœud plein écran),
 * déplacement à la souris (ou au doigt), double-clic sur un nœud = recentrer et zoomer dessus, double-clic dans le
 * vide ou OVERVIEW = la vue d'ensemble ; clic sur une bounty = son détail (condition en phrase complète, 482 ③).
 * Échap ferme le détail, puis la carte. Tout mouvement est animé (une image par rafraîchissement), jamais un saut.
 *
 * ⚠ UNE SEULE SOURCE : `LLBountyWall.etat(profil)` — exactement ce que lit la page d'aujourd'hui. Rien n'est
 * recalculé ici : l'état d'un nœud (`a_toi` / `pret` / `lock`), le compteur (`n`), le sommeil (`dort`), le pacte
 * (`pacte`) et la phrase de la condition (`phrase`) sont ceux du module.
 *
 * Passe suivante (3) : remplacer la page BOUNTY WALL et l'ouvrir centrée sur l'esprit cliqué au HOME.
 */
(function () {
  'use strict';
  var BW = window.LLBountyWall;
  if (!BW) { return; }

  /* La géométrie, en unités du monde ; la vue la cadre entière à l'ouverture. */
  var R_ESPRIT = 500;     /* centre → esprit d'école */
  var R_SAT = 175;        /* esprit → ses bounties */
  /* centre → les bounties du Donjon : DEUX anneaux en quinconce (il en porte 29 — mesuré au premier rendu, un seul
     anneau les entassait) ; l'intérieur écrit sa récompense vers le centre, l'extérieur vers les esprits */
  var R_SAT_NEUTRE = [175, 290];
  var ARC = 200;          /* l'éventail des bounties autour d'un esprit, en degrés, tourné vers l'extérieur */
  var M_ESPRIT = 62, M_NEUTRE = 78, M_SAT = 25;
  /* S1675 · note 498 ② (c) — « il faut mettre sur fond sombre » : le parchemin devient une nuit d'encre, et
     l'ENCRE devient l'os (le trait et le texte clairs sur le fond sombre). */
  var ENCRE = '#e9dcbd', ENCRE_PALE = 'rgba(233,220,189,.32)', OR = '#d9a441';
  var FOND_NOEUD = '#231b14', TEXTE_DOUX = '#b9a684', PANNEAU = 'rgba(22,17,12,.96)';

  var images = {};
  function charge(src) {
    if (images[src]) { return images[src]; }
    var im = new Image();
    im.onload = function () { demande(); };
    im.src = src;
    images[src] = im;
    return im;
  }
  function image(id) { return charge('/art/mur/pp_' + id + '.webp'); }

  /* S1675 · note 498 ② (a) — l'image de CE QU'ON DÉBLOQUE, les chemins de la page du mur (`ecran_titre.html`
     `medaillon`) : le portrait du perso, la vitrine de la peau de dés, le curseur, le dos. Des dents, un accès ou
     l'Epic n'ont pas d'image : `null` (le nœud écrit alors sa récompense). `grand` = l'asset en grand (ESPACE). */
  function assetDe(x, grand) {
    if (!x) { return null; }
    if (x.p) { return grand ? '/art/personnages/grand/' + x.p + '.webp' : '/art/personnages/all_ico_webp_CORRECTED_ALL/200px/' + x.p + '_200px.webp'; }
    if (x.u) { return '/art/curseurs/' + x.u + '.png'; }
    if (x.k) { return '/art/dos/' + x.k + '.webp'; }
    if (x.d) { return (x.d === 'bones' || x.d === 'pierre') ? '/dice/' + x.d + '/d20_face_20.webp' : '/dice/' + x.d + '/vitrine.webp'; }
    return null;
  }

  function angleDe(pointe) { return (-90 + 60 * pointe) * Math.PI / 180; }
  function court(n) {
    n = Number(n || 0);
    if (n >= 10000) { return Math.round(n / 1000) + 'k'; }
    if (n >= 1000) { return (Math.round(n / 100) / 10) + 'k'; }
    return String(n);
  }

  /* L'état d'une bounty, lu sur le module : accomplie (tous ses nœuds sont à toi), verrouillée (l'esprit dort),
     sinon en cours (son compteur contre le seuil du prochain nœud). */
  function etatDeLaBounty(g, dort) {
    var finie = g.noeuds.every(function (x) { return x.s === 'a_toi'; });
    if (finie) { return 'allumee'; }
    if (dort) { return 'ternie'; }
    /* S1672 · 490 (3) — le seuil est atteint mais la récompense n'est pas prise (`pret` du module) : elle se
       réclame sur la page (pacte, achat, dents) — la fiche y mène */
    /* (`suivant` du module = le premier nœud VERROUILLÉ : un nœud prêt n'y est jamais — mesuré, « 23/23 » s'écrivait) */
    if (g.noeuds.some(function (x) { return x.s === 'pret'; })) { return 'prete'; }
    return 'en_cours';
  }

  /* Le plan : chaque nœud avec sa place dans le monde. Rebâti à chaque ouverture (le profil a pu changer). */
  function plan() {
    var profil = window.LLProfil ? window.LLProfil.lis() : {};
    var ofs = (profil && profil.mur && Array.isArray(profil.mur.offertes)) ? profil.mur.offertes : [];
    var troncs = BW.etat(profil, ofs);
    var pacte = BW.pacte(profil);
    var liste = [];
    troncs.forEach(function (t) {
      var neutre = t.pointe === null;
      var a = neutre ? -Math.PI / 2 : angleDe(t.pointe);
      var x = neutre ? 0 : Math.cos(a) * R_ESPRIT;
      var y = neutre ? 0 : Math.sin(a) * R_ESPRIT;
      var dort = BW.dort(profil, t.id);
      var k = t.rangs.length;
      var sats = t.rangs.map(function (g, i) {
        var b;
        if (neutre) {
          b = -Math.PI / 2 + (i + 0.5) * (2 * Math.PI / k);
        } else {
          var ouverture = ARC * Math.PI / 180;
          b = a + (k === 1 ? 0 : -ouverture / 2 + ouverture * i / (k - 1));
        }
        var dedans = neutre && i % 2 === 0;
        var r = neutre ? R_SAT_NEUTRE[dedans ? 0 : 1] : R_SAT;
        /* la bounty montrée : le premier nœud qui n'est pas encore à toi (prêt ou verrouillé), sinon le dernier */
        var prochain = g.noeuds.filter(function (x) { return x.s !== 'a_toi'; })[0] || g.noeuds[g.noeuds.length - 1];
        return {
          g: g, x: x + Math.cos(b) * r, y: y + Math.sin(b) * r, angle: dedans ? b + Math.PI : b, neutre: neutre,
          etat: etatDeLaBounty(g, dort), nom: prochain.nom, seuil: prochain.a, noeud: prochain,
          condition: BW.phrase(g, prochain.a), record: BW.record ? BW.record(g) : null
        };
      });
      liste.push({ t: t, x: x, y: y, a: a, neutre: neutre, dort: dort, pacte: pacte === t.id, sats: sats });
    });
    return liste;
  }

  var couche = null, toile = null, ctx = null, esprits = [], fiche = null;

  /* ── LA VUE : écran = monde × k + (ox, oy). `vue` est ce qui est peint, `cible` ce vers quoi elle glisse. ── */
  var vue = null, cible = null, image_en_cours = 0;
  function ensemble() {
    var w = toile.clientWidth, h = toile.clientHeight;
    var rayon = R_ESPRIT + R_SAT + M_SAT + 120;
    var k = Math.min(w, h) / (2 * rayon);
    return { k: k, ox: w / 2, oy: h / 2 + 18 * k };
  }
  function bornes() {
    var e = ensemble();
    var w = toile.clientWidth, h = toile.clientHeight;
    /* du recul sous la vue d'ensemble jusqu'au nœud qui remplit l'écran */
    return { min: e.k * 0.6, max: Math.min(w, h) / (2 * M_SAT * 1.25) };
  }
  function borne(k) { var b = bornes(); return Math.max(b.min, Math.min(b.max, k)); }
  function versMonde(sx, sy) { return { x: (sx - vue.ox) / vue.k, y: (sy - vue.oy) / vue.k }; }
  /* zoomer autour d'un point de l'écran : le point du monde sous le curseur reste sous le curseur */
  function zoomAutour(base, facteur, sx, sy) {
    var k = borne(base.k * facteur);
    var mx = (sx - base.ox) / base.k, my = (sy - base.oy) / base.k;
    return { k: k, ox: sx - mx * k, oy: sy - my * k };
  }
  function centreSur(x, y, k) {
    k = borne(k);
    return { k: k, ox: toile.clientWidth / 2 - x * k, oy: toile.clientHeight / 2 - y * k };
  }
  /* le glissé : 22 % du chemin restant par image — rapide, fluide, sans jamais dépasser */
  function anime() {
    image_en_cours = 0;
    if (!toile || cible === null) { return; }
    var t = 0.22;
    var lk = Math.log(vue.k), ck = Math.log(cible.k);
    var k = Math.exp(lk + (ck - lk) * t);
    /* l'origine suit le zoom de façon à garder fixe le point que la cible garde fixe */
    var ox = vue.ox + (cible.ox - vue.ox) * t, oy = vue.oy + (cible.oy - vue.oy) * t;
    vue = { k: k, ox: ox, oy: oy };
    if (Math.abs(ck - Math.log(vue.k)) < 0.002 && Math.abs(cible.ox - vue.ox) < 0.5 && Math.abs(cible.oy - vue.oy) < 0.5) {
      vue = cible; cible = null;
    }
    dessine();
    if (cible !== null) { demande(); }
  }
  function demande() { if (toile && image_en_cours === 0) { image_en_cours = window.requestAnimationFrame(anime); } }
  function vaVers(v) { cible = v; demande(); }

  function medaillon(x, y, r, id, teinte, etat) {
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.closePath();
    ctx.fillStyle = FOND_NOEUD; ctx.fill();
    var im = image(id);
    if (im.complete && im.naturalWidth > 0) {
      ctx.save(); ctx.clip();
      if (etat === 'ternie') { ctx.filter = 'grayscale(1) sepia(.5) brightness(.85)'; ctx.globalAlpha = .55; }
      ctx.drawImage(im, x - r, y - r, 2 * r, 2 * r);
      ctx.restore();
    }
    ctx.lineWidth = r * 0.09; ctx.strokeStyle = etat === 'ternie' ? ENCRE_PALE : teinte; ctx.stroke();
    ctx.lineWidth = r * 0.03; ctx.strokeStyle = ENCRE; ctx.stroke();
    ctx.restore();
  }

  function texte(s, x, y, taille, couleur, graisse) {
    ctx.font = (graisse || 700) + ' ' + taille + 'px "Big Shoulders Display","Alegreya",serif';
    ctx.fillStyle = couleur; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(s, x, y);
  }
  /* une phrase sur deux lignes au plus, coupée aux mots, centrée */
  function phrase(s, x, y, taille, couleur, largeur) {
    ctx.font = '600 ' + taille + 'px "Alegreya",serif';
    ctx.fillStyle = couleur; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    var mots = String(s).split(' '), lignes = [], l = '';
    mots.forEach(function (m) {
      var essai = l === '' ? m : l + ' ' + m;
      if (ctx.measureText(essai).width > largeur && l !== '') { lignes.push(l); l = m; } else { l = essai; }
    });
    if (l !== '') { lignes.push(l); }
    lignes.slice(0, 3).forEach(function (li, i) { ctx.fillText(li, x, y + i * taille * 1.15); });
  }

  function dessine() {
    if (!toile) { return; }
    var dpr = window.devicePixelRatio || 1;
    var w = toile.clientWidth, h = toile.clientHeight;
    if (toile.width !== Math.round(w * dpr) || toile.height !== Math.round(h * dpr)) {
      toile.width = Math.round(w * dpr); toile.height = Math.round(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    /* le parchemin */
    var fond = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
    fond.addColorStop(0, '#2a2018'); fond.addColorStop(0.6, '#15100b'); fond.addColorStop(1, '#060403');
    ctx.fillStyle = fond; ctx.fillRect(0, 0, w, h);

    ctx.translate(vue.ox, vue.oy); ctx.scale(vue.k, vue.k);
    /* au-delà de ce zoom, la condition de chaque bounty s'écrit sous sa récompense (lisible : ≥ ~11 px à l'écran) */
    var conditions = vue.k * 7 >= 11;

    /* l'hexagramme : deux triangles d'encre entre les six esprits */
    var pointes = esprits.filter(function (e) { return !e.neutre; })
      .sort(function (a, b) { return a.t.pointe - b.t.pointe; });
    if (pointes.length === 6) {
      ctx.lineWidth = 3; ctx.strokeStyle = ENCRE_PALE;
      [[0, 2, 4], [1, 3, 5]].forEach(function (tri) {
        ctx.beginPath();
        tri.forEach(function (i, j) { var p = pointes[i]; if (j === 0) { ctx.moveTo(p.x, p.y); } else { ctx.lineTo(p.x, p.y); } });
        ctx.closePath(); ctx.stroke();
      });
    }
    /* les liens : centre → esprit, esprit → ses bounties ; ils s'ALLUMENT (couleur de l'esprit) quand l'esprit est
       éveillé, restent en pointillé d'encre pâle quand il dort */
    esprits.forEach(function (e) {
      if (!e.neutre) {
        ctx.setLineDash(e.dort ? [10, 10] : []);
        ctx.lineWidth = 2.5; ctx.strokeStyle = e.dort ? ENCRE_PALE : e.t.teinte;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(e.x, e.y); ctx.stroke();
      }
      e.sats.forEach(function (s) {
        ctx.setLineDash(s.etat === 'ternie' ? [6, 8] : []);
        ctx.lineWidth = s.etat === 'allumee' ? 3 : 1.6;
        ctx.strokeStyle = s.etat === 'ternie' ? ENCRE_PALE : (e.neutre ? ENCRE : e.t.teinte);
        ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(s.x, s.y); ctx.stroke();
      });
    });
    ctx.setLineDash([]);

    /* les bounties : nœud + compteur dedans, récompense (puis condition, de près) au-delà */
    esprits.forEach(function (e) {
      e.sats.forEach(function (s) {
        var choisie = fiche !== null && fiche.s === s;
        ctx.save();
        if (s.etat === 'allumee' || choisie) { ctx.shadowColor = choisie ? OR : e.t.teinte; ctx.shadowBlur = 22; }
        ctx.beginPath(); ctx.arc(s.x, s.y, M_SAT, 0, 2 * Math.PI);
        ctx.fillStyle = s.etat === 'allumee' ? e.t.teinte : s.etat === 'ternie' ? 'rgba(120,104,80,.35)' : FOND_NOEUD;
        ctx.fill();
        ctx.restore();
        /* 498 ② (a) — l'image de la récompense DANS le cercle (ternie si l'esprit dort, à peine voilée en cours) */
        var src = assetDe(s.noeud, false);
        var im = src === null ? null : charge(src);
        var aImage = im !== null && im.complete && im.naturalWidth > 0;
        if (aImage) {
          ctx.save();
          ctx.beginPath(); ctx.arc(s.x, s.y, M_SAT - 1.5, 0, 2 * Math.PI); ctx.clip();
          if (s.etat === 'ternie') { ctx.filter = 'grayscale(1) brightness(.6)'; ctx.globalAlpha = .6; }
          else if (s.etat === 'en_cours') { ctx.globalAlpha = .85; }
          var cote = 2 * (M_SAT - 1.5);
          var rap = im.naturalWidth / im.naturalHeight;
          /* un curseur ou un dé : contenu entier ; un portrait ou un dos : couvre le cercle */
          var couvre = !!(s.noeud.p || s.noeud.k);
          var lw = couvre ? (rap >= 1 ? cote * rap : cote) : (rap >= 1 ? cote : cote * rap);
          var lh = couvre ? (rap >= 1 ? cote : cote / rap) : (rap >= 1 ? cote / rap : cote);
          if (!couvre) { lw *= 0.86; lh *= 0.86; }
          ctx.drawImage(im, s.x - lw / 2, s.y - lh / 2, lw, lh);
          ctx.restore();
        }
        ctx.beginPath(); ctx.arc(s.x, s.y, M_SAT, 0, 2 * Math.PI);
        ctx.lineWidth = choisie ? 4 : 2.2; ctx.strokeStyle = choisie ? OR : s.etat === 'ternie' ? ENCRE_PALE : (s.etat === 'allumee' ? e.t.teinte : ENCRE); ctx.stroke();
        /* l'état en surimpression : avec une image, une pastille au bas du cercle ; sans image, au centre */
        var py = aImage ? s.y + M_SAT - 2 : s.y;
        function pastille(txt, taille, couleur) {
          if (aImage) {
            ctx.font = '800 ' + taille + 'px "Big Shoulders Display","Alegreya",serif';
            var lp = ctx.measureText(txt).width + 8;
            ctx.fillStyle = 'rgba(10,7,5,.88)';
            ctx.beginPath(); ctx.rect(s.x - lp / 2, py - taille * 0.65, lp, taille * 1.3); ctx.fill();
          }
          texte(txt, s.x, py, taille, couleur, 800);
        }
        if (s.etat === 'prete') {
          ctx.beginPath(); ctx.arc(s.x, s.y, M_SAT + 5, 0, 2 * Math.PI);
          ctx.lineWidth = 5; ctx.strokeStyle = OR; ctx.stroke();
          pastille('READY', 11, OR);
        } else if (s.etat === 'en_cours') {
          var part = Math.max(0, Math.min(1, s.g.n / Math.max(1, s.seuil)));
          if (part > 0) {
            ctx.beginPath(); ctx.arc(s.x, s.y, M_SAT + 5, -Math.PI / 2, -Math.PI / 2 + part * 2 * Math.PI);
            ctx.lineWidth = 5; ctx.strokeStyle = e.neutre ? OR : e.t.teinte; ctx.stroke();
          }
          pastille(court(s.g.n) + '/' + court(s.seuil), aImage ? 11 : 13, ENCRE);
        } else if (s.etat === 'allumee') {
          if (aImage) { pastille('✓', 13, '#fff8e6'); } else { texte('✓', s.x, s.y + 1, 24, '#fff8e6', 900); }
        } else {
          if (aImage) { pastille('🔒', 10, TEXTE_DOUX); } else { texte('🔒', s.x, s.y + 1, 16, ENCRE_PALE, 400); }
        }
        var ux = Math.cos(s.angle), uy = Math.sin(s.angle);
        var lx = s.x + ux * (M_SAT + 34), ly = s.y + uy * (M_SAT + 26);
        var pale = s.etat === 'ternie' ? ENCRE_PALE : ENCRE;
        texte(s.nom, lx, ly, s.neutre ? 12 : 14, pale, 700);
        if (conditions) {
          /* la condition sous la récompense, dans le sens de lecture (toujours en dessous à l'écran) */
          phrase(s.condition, lx, ly + 11, 7, s.etat === 'ternie' ? ENCRE_PALE : TEXTE_DOUX, 64);
        }
      });
    });

    /* les esprits par-dessus leurs liens */
    esprits.forEach(function (e) {
      var r = e.neutre ? M_NEUTRE : M_ESPRIT;
      if (e.pacte) {
        ctx.beginPath(); ctx.arc(e.x, e.y, r + 14, 0, 2 * Math.PI);
        ctx.lineWidth = 6; ctx.strokeStyle = OR; ctx.stroke();
        texte('PACT ×' + String(BW.PACTE), e.x, e.y - r - 30, 15, OR, 900);
      }
      medaillon(e.x, e.y, r, e.t.id, e.t.teinte, e.dort ? 'ternie' : 'eveille');
      texte(e.neutre ? 'SPIRIT OF THE DUNGEON' : e.t.t.toUpperCase(), e.x, e.y + r + 22, e.neutre ? 22 : 20,
        e.dort ? ENCRE_PALE : ENCRE, 900);
      if (e.dort) { texte('sleeping', e.x, e.y + r + 44, 14, ENCRE_PALE, 600); }
    });
  }

  /* ── LE TOUCHER : ce qu'il y a sous un point de l'écran ── */
  function sous(sx, sy) {
    var m = versMonde(sx, sy);
    var mieux = null, d0 = Infinity;
    esprits.forEach(function (e) {
      var r = e.neutre ? M_NEUTRE : M_ESPRIT;
      var d = Math.hypot(m.x - e.x, m.y - e.y);
      if (d <= r && d < d0) { mieux = { e: e, s: null }; d0 = d; }
      e.sats.forEach(function (s) {
        var ds = Math.hypot(m.x - s.x, m.y - s.y);
        /* une marge de 8 px à l'écran : un petit nœud vu de loin reste attrapable */
        if (ds <= M_SAT + 8 / vue.k && ds < d0) { mieux = { e: e, s: s }; d0 = ds; }
      });
    });
    return mieux;
  }

  /* ── LE DÉTAIL D'UNE BOUNTY (482 ③ : la condition en phrase complète) ── */
  var panneau = null;
  function montreLaFiche(e, s) {
    fiche = { e: e, s: s };
    if (panneau === null) {
      panneau = document.createElement('div');
      panneau.style.cssText = 'position:absolute;right:18px;bottom:18px;width:min(360px,calc(100% - 36px));box-sizing:border-box;' +
        'padding:14px 16px 16px;background:' + PANNEAU + ';border:2px solid ' + ENCRE_PALE + ';border-radius:6px;' +
        'box-shadow:0 8px 28px rgba(0,0,0,.6);color:' + ENCRE + ';font:600 16px/1.3 "Alegreya",serif';
      couche.appendChild(panneau);
    }
    var etat = s.etat === 'allumee' ? 'DONE' : s.etat === 'ternie' ? 'LOCKED — the spirit sleeps'
      : s.etat === 'prete' ? 'READY TO CLAIM' : 'IN PROGRESS';
    var rec = s.record ? ' (' + s.record + ')' : '';
    panneau.innerHTML = '';
    function ligne(txt, css) { var d = document.createElement('div'); d.textContent = txt; d.style.cssText = css; panneau.appendChild(d); return d; }
    ligne((e.neutre ? 'SPIRIT OF THE DUNGEON' : e.t.t.toUpperCase()) + ' · ' + etat,
      'font:900 13px/1 "Big Shoulders Display",sans-serif;letter-spacing:.12em;color:' + (e.neutre ? OR : e.t.teinte) + ';margin-bottom:6px');
    ligne(s.nom, 'font:900 24px/1.05 "Big Shoulders Display",sans-serif;letter-spacing:.04em;margin-bottom:8px');
    ligne(s.condition + '.', 'font:600 17px/1.3 "Alegreya",serif;margin-bottom:8px');
    ligne('Progress: ' + Number(s.g.n || 0).toLocaleString('en-US') + ' / ' + Number(s.seuil || 0).toLocaleString('en-US') + rec,
      'font:700 15px/1.2 "Alegreya",serif;color:' + TEXTE_DOUX);
    var x = document.createElement('button');
    x.type = 'button'; x.textContent = '✕'; x.title = 'Close (Esc)';
    x.style.cssText = 'position:absolute;right:8px;top:6px;cursor:pointer;border:0;background:none;font:900 18px/1 sans-serif;color:' + ENCRE;
    x.addEventListener('click', fermeLaFiche);
    panneau.appendChild(x);
    if (s.etat === 'prete' && options.page) {
      var va = document.createElement('button');
      va.type = 'button'; va.textContent = 'CLAIM IT ON THE WALL ▸';
      va.style.cssText = 'margin-top:10px;cursor:pointer;padding:6px 12px;font:900 16px/1 "Big Shoulders Display",sans-serif;' +
        'letter-spacing:.08em;color:#1a120a;background:' + OR + ';border:2px solid ' + OR + ';border-radius:4px';
      va.addEventListener('click', function () { options.page(e.t.id); });
      panneau.appendChild(va);
    }
    demande(); dessine();
  }
  function fermeLaFiche() {
    fiche = null;
    if (panneau !== null) { panneau.remove(); panneau = null; }
    if (toile) { dessine(); }
  }

  /* ── LES GESTES ── */
  var pointeurs = {}, glisse = null, pince = null, bouge = false;
  function pos(ev) { var r = toile.getBoundingClientRect(); return { x: ev.clientX - r.left, y: ev.clientY - r.top }; }
  function surMolette(ev) {
    ev.preventDefault();
    var p = pos(ev);
    /* la molette s'accumule dans la cible : plusieurs crans rapides = un seul glissé continu */
    var base = cible || vue;
    var d = ev.deltaMode === 1 ? ev.deltaY * 33 : ev.deltaY;
    vaVers(zoomAutour(base, Math.exp(-d * 0.0018), p.x, p.y));
  }
  function surAppui(ev) {
    try { toile.setPointerCapture(ev.pointerId); } catch (e) { /* un pointeur déjà relâché : le glissé marche sans */ }
    pointeurs[ev.pointerId] = pos(ev);
    var ids = Object.keys(pointeurs);
    bouge = false;
    if (ids.length === 1) {
      glisse = { x: pointeurs[ids[0]].x, y: pointeurs[ids[0]].y, ox: vue.ox, oy: vue.oy };
    } else if (ids.length === 2) {
      var a = pointeurs[ids[0]], b = pointeurs[ids[1]];
      pince = { d: Math.hypot(a.x - b.x, a.y - b.y), vue: vue };
      glisse = null;
    }
  }
  function surMouvement(ev) {
    if (!(ev.pointerId in pointeurs)) { return; }
    pointeurs[ev.pointerId] = pos(ev);
    var ids = Object.keys(pointeurs);
    if (pince !== null && ids.length === 2) {
      var a = pointeurs[ids[0]], b = pointeurs[ids[1]];
      var d = Math.hypot(a.x - b.x, a.y - b.y);
      cible = null;
      vue = zoomAutour(pince.vue, d / Math.max(1, pince.d), (a.x + b.x) / 2, (a.y + b.y) / 2);
      bouge = true; dessine();
    } else if (glisse !== null) {
      var p = pointeurs[ids[0]];
      if (Math.hypot(p.x - glisse.x, p.y - glisse.y) > 4) { bouge = true; }
      if (bouge) {
        cible = null;
        vue = { k: vue.k, ox: glisse.ox + p.x - glisse.x, oy: glisse.oy + p.y - glisse.y };
        dessine();
      }
    }
  }
  function surRelâche(ev) {
    var p = pointeurs[ev.pointerId];
    delete pointeurs[ev.pointerId];
    if (Object.keys(pointeurs).length < 2) { pince = null; }
    if (Object.keys(pointeurs).length === 0) {
      if (!bouge && p) {
        /* un clic sans glissé : une bounty ouvre son détail, un esprit se recentre */
        var h = sous(p.x, p.y);
        if (h !== null && h.s !== null) { montreLaFiche(h.e, h.s); }
        else if (h !== null) { vaVers(centreSur(h.e.x, h.e.y, Math.max(vue.k, ensemble().k * 2.2))); }
      }
      glisse = null;
    }
  }
  function surDoubleClic(ev) {
    var p = pos(ev);
    var h = sous(p.x, p.y);
    var w = toile.clientWidth, hh = toile.clientHeight;
    if (h !== null && h.s !== null) {
      /* la bounty remplit un tiers de l'écran, récompense et condition lisibles */
      vaVers(centreSur(h.s.x, h.s.y, Math.min(w, hh) / (2 * (M_SAT + 95))));
      montreLaFiche(h.e, h.s);
    } else if (h !== null) {
      var r = (h.e.neutre ? R_SAT_NEUTRE[1] : R_SAT) + M_SAT + 70;
      vaVers(centreSur(h.e.x, h.e.y, Math.min(w, hh) / (2 * r)));
    } else {
      vaVers(ensemble());
    }
  }

  function ferme() {
    if (!couche) { return; }
    fermeLaFiche();
    if (image_en_cours) { window.cancelAnimationFrame(image_en_cours); image_en_cours = 0; }
    couche.remove(); couche = null; toile = null; ctx = null; cible = null;
    window.removeEventListener('resize', auRedimensionnement);
    document.removeEventListener('keydown', touche, true);
    document.removeEventListener('keyup', toucheRelâchée, true);
    window.removeEventListener('blur', cacheLAsset);
    loupe = null; survol = null;
  }
  /* S1675 · note 498 ② (b) — « une touche enfoncée où l'on voit l'asset » : ESPACE maintenu montre en grand, au
     centre, la récompense de la bounty SURVOLÉE (sinon celle de la fiche ouverte) ; relâché, il se referme. */
  var survol = null, loupe = null;
  function surSurvol(ev) { if (toile) { var p = pos(ev); var h = sous(p.x, p.y); survol = h !== null && h.s !== null ? h : null; } }
  function montreLAsset() {
    var h = survol || fiche;
    if (!h || !couche || loupe !== null) { return; }
    var s = h.s, src = assetDe(s.noeud, true);
    loupe = document.createElement('div');
    loupe.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;' +
      'gap:14px;background:rgba(5,3,2,.82);pointer-events:none;z-index:2';
    if (src !== null) {
      var im = document.createElement('img');
      im.src = src; im.alt = s.nom;
      im.style.cssText = 'max-width:min(62vw,720px);max-height:66vh;object-fit:contain;filter:drop-shadow(0 12px 40px rgba(0,0,0,.8))' +
        (s.etat === 'ternie' ? ';filter:grayscale(1) brightness(.7)' : '');
      /* le grand portrait manque : le 200 px, plutôt qu'une image cassée */
      im.addEventListener('error', function () { var p = assetDe(s.noeud, false); if (p !== null && im.src.indexOf(p) < 0) { im.src = p; } });
      loupe.appendChild(im);
    } else {
      var v = document.createElement('div');
      v.textContent = s.noeud && s.noeud.t ? court(s.noeud.t) + ' 🦷' : (s.noeud && s.noeud.x ? 'DPT' : '?');
      v.style.cssText = 'font:900 120px/1 "Big Shoulders Display",sans-serif;color:' + OR;
      loupe.appendChild(v);
    }
    var n = document.createElement('div');
    n.textContent = s.nom;
    n.style.cssText = 'font:900 32px/1 "Big Shoulders Display",sans-serif;letter-spacing:.08em;color:' + ENCRE;
    loupe.appendChild(n);
    couche.appendChild(loupe);
  }
  function cacheLAsset() { if (loupe !== null) { loupe.remove(); loupe = null; } }
  function toucheRelâchée(ev) { if (ev.key === ' ' || ev.code === 'Space') { cacheLAsset(); } }
  function touche(ev) {
    if (ev.key === ' ' || ev.code === 'Space') {
      ev.stopPropagation(); ev.preventDefault();
      if (!ev.repeat) { montreLAsset(); }
      return;
    }
    if (ev.key === 'Escape') {
      ev.stopPropagation(); ev.preventDefault();
      if (fiche !== null) { fermeLaFiche(); } else { retour(); }
    }
  }
  /* S1672 · 490 (3) — BACK et Échap : là d'où l'on vient (le HOME, quand la page l'a fourni), sinon la page */
  function retour() { if (options.retour) { options.retour(); } else { ferme(); } }
  function auRedimensionnement() { if (toile) { vue = ensemble(); cible = null; dessine(); } }

  function bouton(txt, titre, gauche, css) {
    var b = document.createElement('button');
    b.type = 'button'; b.textContent = txt; b.title = titre;
    b.style.cssText = 'position:absolute;top:14px;' + (gauche ? 'left' : 'right') + ':18px;cursor:pointer;padding:6px 14px;' +
      'font:900 18px/1 "Big Shoulders Display","Arial Black",sans-serif;letter-spacing:.1em;color:' + ENCRE + ';' +
      'background:rgba(22,17,12,.85);border:2px solid ' + ENCRE_PALE + ';border-radius:4px;' + (css || '');
    couche.appendChild(b);
    return b;
  }

  var options = {};
  /* `ouvre(espritId, { retour, page })` — S1672 · 490 (3) : la carte EST le Bounty Wall. `espritId` = l'esprit
     cliqué au HOME (la carte part de l'étoile entière et glisse sur sa branche) ; `retour()` = BACK / Échap ;
     `page(id)` = les gestes que seule la page sait faire (pacte, offrandes, réclamer, charmes, contrats). */
  function ouvre(espritId, opts) {
    if (couche) { return; }
    options = opts || {};
    esprits = plan();
    couche = document.createElement('div');
    couche.id = 'mur-etoile';
    couche.setAttribute('role', 'dialog');
    couche.setAttribute('aria-label', 'Bounty Wall — the star');
    couche.style.cssText = 'position:fixed;inset:0;z-index:9000;background:#0b0806';
    toile = document.createElement('canvas');
    toile.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:grab';
    couche.appendChild(toile);
    var titre = document.createElement('div');
    titre.textContent = 'BOUNTY WALL';
    titre.style.cssText = 'position:absolute;left:0;right:0;top:14px;text-align:center;pointer-events:none;' +
      'font:900 34px/1 "Big Shoulders Display","Arial Black",sans-serif;letter-spacing:.14em;color:' + ENCRE;
    couche.appendChild(titre);
    var aide = document.createElement('div');
    aide.textContent = 'Scroll or pinch to zoom · drag to move · click a bounty to read it · double-click to focus · hold SPACE to see the reward';
    aide.style.cssText = 'position:absolute;left:18px;bottom:14px;pointer-events:none;font:600 14px/1.2 "Alegreya",serif;color:' + ENCRE_PALE;
    couche.appendChild(aide);
    bouton('⟵ BACK', 'Back (Esc)', true).addEventListener('click', retour);
    bouton('⤢ OVERVIEW', 'See the whole star (or double-click an empty spot)', false)
      .addEventListener('click', function () { vaVers(ensemble()); });
    if (options.page) {
      bouton('PACTS & OFFERINGS ▸', 'Pacts, offerings, rewards to claim and contracts — on the wall', false, 'top:58px')
        .addEventListener('click', function () { options.page(fiche !== null ? fiche.e.t.id : null); });
    }
    document.body.appendChild(couche);
    ctx = toile.getContext('2d');
    vue = ensemble(); cible = null;
    toile.addEventListener('wheel', surMolette, { passive: false });
    toile.addEventListener('pointerdown', surAppui);
    toile.addEventListener('pointermove', surMouvement);
    toile.addEventListener('pointerup', surRelâche);
    toile.addEventListener('pointercancel', surRelâche);
    toile.addEventListener('dblclick', surDoubleClic);
    window.addEventListener('resize', auRedimensionnement);
    document.addEventListener('keydown', touche, true);
    document.addEventListener('keyup', toucheRelâchée, true);
    window.addEventListener('blur', cacheLAsset);
    toile.addEventListener('pointermove', surSurvol);
    toile.addEventListener('pointerleave', function () { survol = null; });
    dessine();
    if (espritId) { vise(espritId); }
  }
  function vise(id) {
    var e = esprits.filter(function (x) { return x.t.id === id; })[0];
    if (!e || !toile) { return; }
    var r = (e.neutre ? R_SAT_NEUTRE[1] : R_SAT) + M_SAT + 70;
    vaVers(centreSur(e.x, e.y, Math.min(toile.clientWidth, toile.clientHeight) / (2 * r)));
  }

  window.LLMurEtoile = {
    ouvre: ouvre, ferme: ferme, plan: plan,
    /* pour la passe (3) et les preuves : la vue courante, et viser un esprit */
    vue: function () { return vue; },
    vise: vise, ouverte: function () { return couche !== null; }
  };
})();
