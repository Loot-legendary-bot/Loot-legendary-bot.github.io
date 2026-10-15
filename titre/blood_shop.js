/*
 * blood_shop.js — BS-1 LE BLOOD SHOP (note 252, `docs/MONNAIE.md` §11).
 *
 * Phrase de Croze (note 252) : *« J'ouvre le Blood Shop : une vitrine de quatre
 * objets qui change le lundi, mes portraits alt, des cartes brillantes, des
 * cadres, des dos, le pass ; les prix en sang et en euros ; rien ne s'achète
 * encore mais tout se voit. »*
 *
 * Il s'ouvre depuis le compteur de Sang du HUD (`#sangwrap`). Sept onglets
 * (§11.4) : FEATURED · PORTRAITS · FOILS · FRAMES · BACKS · PASS · BUNDLES.
 * Chaque prix en sang ET en euros (500 sang = 4,99 €, §11.4). GET BLOOD ouvre
 * les quatre paliers et dit « coming with Steam ». Aucun bouton n'achète, aucune
 * minuterie : la vitrine dit « rotates on Monday ».
 *
 * La vitrine est tirée à la graine de la SEMAINE (ISO) : même vitrine pour tous
 * toute la semaine, une autre le lundi. Le curseur de §11.1 n'a pas de prix en
 * sang : sa place va à une Foil (`Q-BS-VITRINE`).
 *
 * Ce qui n'a pas encore d'art (portraits alt, dos légendaires, cadres et
 * titres) se MONTRE avec son prix et « arriving when Croze draws it ».
 */
(function () {
  'use strict';
  var EUROS_PAR_SANG = 4.99 / 500;
  var PALIERS = [[500, '4,99'], [1200, '9,99'], [2600, '19,99'], [5500, '39,99']];
  var ONGLETS = [['featured', 'Featured'], ['portraits', 'Portraits'], ['foils', 'Foils'],
    ['frames', 'Frames'], ['backs', 'Backs'], ['pass', 'Pass'], ['bundles', 'Bundles']];
  var onglet = 'featured', page = 0, voile = null, cartes = null, ligne = null;

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) { e.className = cls; }
    if (txt !== undefined) { e.textContent = txt; }
    return e;
  }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function euros(sang) { return (Math.round(sang * EUROS_PAR_SANG * 100) / 100).toFixed(2).replace('.', ','); }
  function solde() { try { return window.LLProfil.lis().sang || 0; } catch (e) { return 0; } }

  /* la semaine ISO (le lundi l'ouvre) — la graine de la vitrine */
  function semaine(d) {
    var t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    var j = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - j);
    var an = t.getUTCFullYear();
    return an * 100 + Math.ceil(((t - Date.UTC(an, 0, 1)) / 86400000 + 1) / 7);
  }
  function tirage(graine) {
    var a = graine >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function persos() {
    /* `CHARS` / `idDuPerso` sont ceux du HOME (scripts classiques, même portée) */
    try { return CHARS.map(function (c) { return { nom: c.name, id: idDuPerso(c.name) }; }); }
    catch (e) { return []; }
  }
  function cartesVues() {
    var p = null;
    try { p = window.LLProfil.lis(); } catch (e) { p = null; }
    var vues = p && p.codex && p.codex.seen && Array.isArray(p.codex.seen.loots) ? p.codex.seen.loots : [];
    var loots = cartes ? cartes : [];
    return loots.filter(function (c) { return vues.indexOf(c.id) >= 0; });
  }
  function chargeLesCartes() {
    if (cartes !== null) { return Promise.resolve(); }
    return fetch('/titre/codex.gen.json', { cache: 'no-store' }).then(function (r) { return r.json(); })
      .then(function (d) {
        var b = (d.boites || []).filter(function (x) { return x.cle === 'loots'; })[0];
        cartes = b ? b.items : [];
      }, function () { cartes = []; });
  }

  function style() {
    if (document.getElementById('bs-style')) { return; }
    var s = document.createElement('style');
    s.id = 'bs-style';
    s.textContent =
      '#bshop{position:absolute;inset:0;z-index:78;display:grid;grid-template-rows:auto auto 1fr auto;' +
      'padding:4cqh 4cqw;box-sizing:border-box;gap:1.6cqh;color:#e9e4d8;' +
      'background:radial-gradient(90% 80% at 50% 30%,rgba(40,10,9,.97) 0%,rgba(7,6,5,.985) 75%)}' +
      '#bshop .bs-tete{display:flex;align-items:center;gap:2cqw}' +
      '#bshop h2{margin:0;font:900 4.6cqh/1 "Arial Black",Impact,sans-serif;letter-spacing:.06em;text-transform:uppercase}' +
      '#bshop .bs-solde{font:700 2.2cqh/1 ui-monospace,monospace;color:#e79a91}' +
      '#bshop .bs-vide{flex:1}' +
      '#bshop button{all:unset;cursor:pointer;padding:1.1cqh 1.6cqw;font:900 1.8cqh/1 "Arial Black",sans-serif;' +
      'text-transform:uppercase;letter-spacing:.05em;color:#cfc6b4;border:.2cqh solid rgba(233,228,216,.3)}' +
      '#bshop button:hover{color:#fff}' +
      '#bshop button.rouge{background:#a3231d;color:#f4ecda;border-color:#a3231d}' +
      '#bshop .bs-onglets{display:flex;gap:.8cqw;flex-wrap:wrap}' +
      '#bshop .bs-onglets button.sel{color:#f4ecda;border-color:#e9e4d8;background:rgba(163,35,29,.35)}' +
      '#bshop .bs-corps{min-height:0;overflow:hidden;display:flex;flex-direction:column;gap:1.4cqh}' +
      '#bshop .bs-dit{margin:0;font:400 1.9cqh/1.35 "Courier Prime",ui-monospace,monospace;color:#9d9586}' +
      '#bshop .bs-grille{display:grid;grid-template-columns:repeat(4,1fr);gap:1.6cqw;min-height:0}' +
      '#bshop .bs-grille.six{grid-template-columns:repeat(6,1fr)}' +
      '#bshop .bs-item{position:relative;display:flex;flex-direction:column;gap:.8cqh;padding:1.4cqh 1cqw;' +
      'background:rgba(6,5,6,.85);border:.2cqh solid #3a3631;cursor:pointer;min-width:0}' +
      '#bshop .bs-item:hover{border-color:#a3231d}' +
      '#bshop .bs-art{height:22cqh;display:grid;place-items:center;overflow:hidden;background:#0b0a09}' +
      '#bshop .bs-grille.six .bs-art{height:18cqh}' +
      '#bshop .bs-art img{max-width:100%;max-height:100%;object-fit:contain}' +
      '#bshop .bs-art .bs-ombre{font:400 1.6cqh/1.3 "Courier Prime",monospace;color:#6f685d;text-align:center;padding:0 1cqw}' +
      '#bshop .bs-nom{font:900 1.9cqh/1.1 "Arial Black",sans-serif;text-transform:uppercase;letter-spacing:.03em}' +
      '#bshop .bs-quoi{font:400 1.5cqh/1.3 "Courier Prime",monospace;color:#9d9586}' +
      '#bshop .bs-prix{display:flex;align-items:baseline;gap:.8cqw;font:700 2cqh/1 ui-monospace,monospace;color:#e79a91}' +
      '#bshop .bs-prix s{color:#6f685d;font-weight:400}' +
      '#bshop .bs-prix i{font-style:normal;font-weight:400;color:#cfc6b4;font-size:1.6cqh}' +
      '#bshop .bs-remise{position:absolute;z-index:2;top:1cqh;right:1cqw;padding:.4cqh .6cqw;font:900 1.4cqh/1 "Arial Black",sans-serif;' +
      'background:#a3231d;color:#f4ecda}' +
      '#bshop .bs-pied{display:flex;align-items:center;gap:1.6cqw;font:400 1.7cqh/1.3 "Courier Prime",monospace;color:#9d9586}' +
      '#bshop .bs-msg{color:#e9e4d8}' +
      /* la FOIL : cadre doré et reflet qui passe (cosmétique pur, §11.1) */
      '#bshop .foil{position:relative;display:inline-block;max-height:100%;border:.35cqh solid #c9a24a;' +
      'box-shadow:0 0 1.2cqh rgba(201,162,74,.55);overflow:hidden;line-height:0}' +
      '#bshop .foil img{display:block;max-height:20cqh}' +
      '#bshop .bs-grille.six .foil img{max-height:16cqh}' +
      '#bshop .foil::after{content:"";position:absolute;inset:-40%;pointer-events:none;mix-blend-mode:screen;' +
      'background:linear-gradient(115deg,transparent 38%,rgba(255,236,170,.55) 47%,rgba(160,220,255,.45) 52%,transparent 61%);' +
      'animation:bs-reflet 2.8s ease-in-out infinite}' +
      '@keyframes bs-reflet{0%{transform:translateX(-45%)}100%{transform:translateX(45%)}}' +
      '#bshop .bs-paliers{display:grid;grid-template-columns:repeat(4,1fr);gap:1.6cqw}';
    document.head.appendChild(s);
  }

  function item(grille, o) {
    var b = el('div', 'bs-item');
    if (o.remise) { b.appendChild(el('span', 'bs-remise', '-20%')); }
    var art = el('div', 'bs-art');
    if (o.foil) {
      var f = el('span', 'foil'); var im = document.createElement('img');
      im.src = o.foil; im.alt = o.nom; im.onerror = function () { f.remove(); };
      f.appendChild(im); art.appendChild(f);
    } else if (o.art) {
      var img = document.createElement('img'); img.src = o.art; img.alt = o.nom;
      img.onerror = function () { img.remove(); };
      art.appendChild(img);
      if (o.ombre) { art.style.position = 'relative'; }
    }
    if (o.ombre) { art.appendChild(el('div', 'bs-ombre', o.ombre)); }
    b.appendChild(art);
    b.appendChild(el('div', 'bs-nom', o.nom));
    if (o.quoi) { b.appendChild(el('div', 'bs-quoi', o.quoi)); }
    var prix = el('div', 'bs-prix');
    if (o.euros !== undefined) {
      prix.appendChild(document.createTextNode(o.euros + ' €'));
    } else {
      if (o.avant) { prix.appendChild(el('s', '', fmt(o.avant))); }
      prix.appendChild(document.createTextNode(fmt(o.prix) + ' blood'));
      prix.appendChild(el('i', '', '≈ ' + euros(o.prix) + ' €'));
    }
    b.appendChild(prix);
    b.addEventListener('click', function () {
      /* S1426 - FL-1 : une Foil dont Croze a depose la video s'ouvre en carte cinematique. */
      if (o.cine && window.LLFoils) { window.LLFoils.ouvre(o.cine, false); }
      dit('Nothing is for sale yet — the Blood Shop opens with Steam. ' + o.nom + ': '
        + (o.euros !== undefined ? o.euros + ' €' : fmt(o.prix) + ' blood') + '.');
    });
    grille.appendChild(b);
  }
  function dit(t) { if (ligne) { ligne.textContent = t; } }

  function vitrine() {
    var r = tirage(semaine(new Date()));
    var ps = persos();
    var out = [];
    var p = ps.length ? ps[Math.floor(r() * ps.length)] : null;
    if (p) { out.push({ nom: 'Alt portrait — ' + p.nom, quoi: 'Portrait, banner and icon.', art: '/art/personnages/' + p.id + '.webp', ombre: 'alt art arriving when Croze draws it', prix: 160, avant: 200, remise: true }); }
    out.push({ nom: 'Legendary card back', quoi: 'Beyond the Bounty Wall backs.', art: '/art/dos/alt_legendary.webp', ombre: 'arriving when Croze draws it', prix: 240, avant: 300, remise: true });
    out.push({ nom: ['Profile frame', 'Name colour', 'Title'][Math.floor(r() * 3)], quoi: 'Shown in the room and the ranking.', ombre: 'arriving', prix: 80, avant: 100, remise: true });
    var vues = cartesVues();
    var pool = vues.length ? vues : (cartes || []);
    var c = pool.length ? pool[Math.floor(r() * pool.length)] : null;
    if (c) { out.push({ nom: 'Foil — ' + c.nom, quoi: 'Plays exactly like the card.', foil: c.art, prix: 40, avant: 50, remise: true }); }
    return out;
  }

  function peins() {
    var corps = voile.querySelector('.bs-corps');
    corps.innerHTML = '';
    voile.querySelectorAll('.bs-onglets button').forEach(function (b) { b.classList.toggle('sel', b.dataset.k === onglet); });
    var g;
    if (onglet === 'featured') {
      corps.appendChild(el('p', 'bs-dit', 'Four things, 20% off. The window rotates on Monday — nothing is gone for good, everything comes back.'));
      g = el('div', 'bs-grille'); corps.appendChild(g);
      vitrine().forEach(function (o) { item(g, o); });
    } else if (onglet === 'portraits') {
      corps.appendChild(el('p', 'bs-dit', 'The second art of a character: portrait, banner and icon. One per character, as Croze draws them.'));
      var ps = persos();
      var n = 12, pages = Math.max(1, Math.ceil(ps.length / n));
      page = Math.min(page, pages - 1);
      g = el('div', 'bs-grille six'); corps.appendChild(g);
      ps.slice(page * n, page * n + n).forEach(function (p) {
        item(g, { nom: p.nom, art: '/art/personnages/' + p.id + '.webp', ombre: 'alt art arriving', prix: 200 });
      });
      pager(corps, pages);
    } else if (onglet === 'foils') {
      var vues = cartesVues();
      corps.appendChild(el('p', 'bs-dit', 'The shining version of a loot card you have discovered (your Codex): a golden frame and a moving sheen, in game and in the Codex. It plays exactly like the card. 50 blood each · 400 for ten.'));
      if (vues.length === 0) {
        corps.appendChild(el('p', 'bs-dit', 'You have not discovered a loot card yet: play a game, every card you meet goes into your Codex and can get its Foil.'));
        return;
      }
      var m = 11, nb = Math.max(1, Math.ceil(vues.length / m));
      page = Math.min(page, nb - 1);
      g = el('div', 'bs-grille six'); corps.appendChild(g);
      item(g, { nom: 'Ten Foils', quoi: 'Ten cards of your choice.', ombre: '★ ×10', prix: 400 });
      vues.slice(page * m, page * m + m).forEach(function (c) {
        var cine = window.LLFoils && window.LLFoils.video(c.id) ? c.id : null;
        item(g, { nom: c.nom, foil: c.art, prix: 50, cine: cine, quoi: cine ? '▶ Moving art: click to see it.' : undefined });
      });
      pager(corps, nb);
    } else if (onglet === 'frames') {
      corps.appendChild(el('p', 'bs-dit', 'What the others see of you: in the room, on the ranking.'));
      g = el('div', 'bs-grille'); corps.appendChild(g);
      [['Profile frame', 'Around your name on the ranking.'], ['Name colour', 'Your name, in the room and on the ranking.'],
        ['Title', 'Shown under your name.']].forEach(function (x) {
        item(g, { nom: x[0], quoi: x[1] + ' 100–150 blood (Croze sets each one).', ombre: 'arriving', prix: 100 });
      });
    } else if (onglet === 'backs') {
      corps.appendChild(el('p', 'bs-dit', 'Card backs beyond the Bounty Wall ones. The Alt and Alt Legendary backs stay in teeth, at the Vault.'));
      g = el('div', 'bs-grille'); corps.appendChild(g);
      item(g, { nom: 'Legendary card back', quoi: 'One of a kind.', art: '/art/dos/alt_legendary.webp', ombre: 'arriving when Croze draws it', prix: 300 });
    } else if (onglet === 'pass') {
      corps.appendChild(el('p', 'bs-dit', 'The Dungeon Pro Tour season track: 20 cosmetic rewards earned by playing ranked. The free track exists; the pass doubles its steps. The only thing with an end date: the season.'));
      g = el('div', 'bs-grille'); corps.appendChild(g);
      item(g, { nom: 'Season pass', quoi: 'Season 1 premium track.', ombre: '20 rewards', prix: 1000 });
      /* S1450 - note 311 (2) : le pass EST le Pro Tour - endormi avec lui (« The Pro Tour opens soon. »). */
      if (window.LL_DPT_ENDORMI) {
        var pz = g.lastChild; pz.title = window.LL_DPT_DORT;
        pz.style.cssText += ';filter:grayscale(1);opacity:.45;cursor:not-allowed';
        var oz = pz.querySelector('.bs-ombre'); if (oz) { oz.textContent = window.LL_DPT_DORT; }
      }
    } else if (onglet === 'bundles') {
      /* S1426 - note 253 (3), MONNAIE 12 : les bundles portent aussi de la CHANCE et des ESSENCES --
         jamais une MASSIVE, jamais plus qu'un mois de jeu gratuit, et jamais vendues seules. */
      corps.appendChild(el('p', 'bs-dit', 'Real money, once Steam is plugged in. Luck and essences are only ever sold in these two bundles — never alone, never a MASSIVE essence.'));
      g = el('div', 'bs-grille'); corps.appendChild(g);
      item(g, { nom: 'Starter', quoi: "500 blood + one alt portrait of your choice + 1 FLOOR WAX + 3 SMALL essences of your choice. First purchase only — ×2 on your first purchase.", ombre: "500 + portrait + WAX + 3 SMALL", euros: '4,99' });
      item(g, { nom: 'Supporter', quoi: '2,600 blood + the title SUPPORTER + a unique card back + 1 DUNGEON BLEACH + 3 BIG essences.', ombre: '2,600 + title + back + BLEACH + 3 BIG', euros: '19,99' });
    }
  }
  function pager(corps, pages) {
    if (pages <= 1) { return; }
    var r = el('div', 'bs-pied');
    var av = el('button', '', '◀'); av.type = 'button';
    av.addEventListener('click', function () { page = (page + pages - 1) % pages; peins(); });
    var ap = el('button', '', '▶'); ap.type = 'button';
    ap.addEventListener('click', function () { page = (page + 1) % pages; peins(); });
    r.appendChild(av); r.appendChild(el('span', '', (page + 1) + ' / ' + pages)); r.appendChild(ap);
    corps.appendChild(r);
  }

  function getBlood() {
    var corps = voile.querySelector('.bs-corps');
    corps.innerHTML = '';
    voile.querySelectorAll('.bs-onglets button').forEach(function (b) { b.classList.remove('sel'); });
    corps.appendChild(el('p', 'bs-dit', 'Blood comes with Steam. Until then, your balance is what the game gives: the first Pro Tour win of a season, the free season track.'));
    var g = el('div', 'bs-paliers'); corps.appendChild(g);
    PALIERS.forEach(function (x) { item(g, { nom: fmt(x[0]) + ' blood', ombre: 'coming with Steam', euros: x[1] }); });
    dit('GET BLOOD — coming with Steam.');
  }

  function ferme() { if (voile) { voile.remove(); voile = null; } }
  function ouvre() {
    style();
    ferme();
    onglet = 'featured'; page = 0;
    var ecran = document.getElementById('screen') || document.body;
    voile = el('div'); voile.id = 'bshop';
    voile.addEventListener('keydown', function (e) { if (e.key === 'Escape') { ferme(); } e.stopPropagation(); });
    var tete = el('div', 'bs-tete');
    tete.appendChild(el('h2', '', 'Blood Shop'));
    tete.appendChild(el('span', 'bs-solde', 'Your blood: ' + fmt(solde())));
    tete.appendChild(el('span', 'bs-vide'));
    var gb = el('button', 'rouge', 'Get blood'); gb.type = 'button'; gb.addEventListener('click', getBlood);
    tete.appendChild(gb);
    var x = el('button', '', 'Close'); x.type = 'button'; x.addEventListener('click', ferme);
    tete.appendChild(x);
    voile.appendChild(tete);
    var ongl = el('div', 'bs-onglets');
    ONGLETS.forEach(function (o) {
      var b = el('button', '', o[1]); b.type = 'button'; b.dataset.k = o[0];
      b.addEventListener('click', function () { onglet = o[0]; page = 0; dit(''); peins(); });
      ongl.appendChild(b);
    });
    voile.appendChild(ongl);
    voile.appendChild(el('div', 'bs-corps'));
    var pied = el('div', 'bs-pied');
    pied.appendChild(el('span', '', 'Blood never buys teeth, a character, a Bounty Wall die, an essence, luck, an invitation, a Pro Tour ticket, a wall step — nothing that changes a game.'));
    voile.appendChild(pied);
    ligne = el('div', 'bs-pied bs-msg', ''); voile.appendChild(ligne);
    ecran.appendChild(voile);
    peins();
    chargeLesCartes().then(function () { if (voile) { peins(); } });
  }

  window.LLBloodShop = { ouvre: ouvre, ferme: ferme };
})();
