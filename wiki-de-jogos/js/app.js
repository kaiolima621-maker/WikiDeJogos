/* Wiki de Jogos — protótipo front-end (HTML + CSS + JS, sem backend).
   Os dados vêm de data/games.json. Se o arquivo não puder ser lido (abrir o
   index.html com duplo clique bloqueia fetch no Chrome), usa data/games-data.js. */
(function () {
  'use strict';

  /* ---------- utilidades ---------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  let DB = { eras: [], jogos: [] };
  const byId = {};
  const eraById = {};
  let rotaAtual = 'home';
  let estadoCat = { q: '', tag: '', era: '' };

  const app = $('#app');
  const campo = $('#q');
  const caixaSug = $('#sugestoes');

  /* ---------- ilustrações genéricas (capas e consoles) ---------- */
  const Y = '#ffc933', W = '#ffffff', B = '#0a1d4d', O = '#ff7a45';
  const ICONES = {
    gamepad: `<rect x="6" y="20" width="52" height="26" rx="13" fill="${W}"/><rect x="15" y="31" width="14" height="4" fill="${B}"/><rect x="20" y="26" width="4" height="14" fill="${B}"/><circle cx="42" cy="30" r="3.5" fill="${O}"/><circle cx="49" cy="36" r="3.5" fill="${Y}"/>`,
    joystick: `<rect x="10" y="42" width="44" height="13" rx="4" fill="${W}"/><rect x="29.5" y="20" width="5" height="24" fill="${W}"/><circle cx="32" cy="15" r="9" fill="${O}"/><circle cx="20" cy="48.5" r="2.6" fill="${Y}"/><circle cx="44" cy="48.5" r="2.6" fill="${Y}"/>`,
    arcade: `<path d="M20 6h24l6 14v38H14V20z" fill="${W}"/><rect x="21" y="14" width="22" height="16" rx="2" fill="${B}"/><rect x="24" y="17" width="16" height="10" rx="1" fill="${Y}"/><rect x="18" y="35" width="28" height="7" fill="${B}" opacity=".2"/><circle cx="26" cy="38.5" r="3" fill="${O}"/><rect x="35" y="36.5" width="4" height="4" fill="${Y}"/><rect x="41" y="36.5" width="4" height="4" fill="${Y}"/>`,
    cartucho: `<rect x="14" y="6" width="36" height="46" rx="4" fill="${W}"/><rect x="19" y="12" width="26" height="20" rx="2" fill="${B}"/><rect x="22" y="15" width="20" height="14" fill="${Y}"/><rect x="20" y="38" width="24" height="5" fill="${B}" opacity=".25"/><rect x="18" y="52" width="28" height="6" fill="${O}"/>`,
    disco: `<circle cx="32" cy="32" r="25" fill="${W}"/><circle cx="32" cy="32" r="17" fill="none" stroke="${B}" stroke-width="2" opacity=".3"/><circle cx="32" cy="32" r="8" fill="${Y}"/><circle cx="32" cy="32" r="3" fill="${B}"/><path d="M32 11a21 21 0 0 1 21 21" stroke="${O}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    terminal: `<rect x="6" y="12" width="52" height="40" rx="5" fill="${B}" stroke="${W}" stroke-width="3"/><path d="M16 26l9 6-9 6" stroke="${Y}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="31" y="38" width="15" height="4" fill="${W}"/>`,
    osciloscopio: `<rect x="8" y="10" width="48" height="44" rx="6" fill="${W}"/><rect x="14" y="16" width="36" height="28" rx="3" fill="${B}"/><path d="M16 30c4-10 8-10 12 0s8 10 12 0 6-6 8-2" stroke="${Y}" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="20" cy="49" r="2.5" fill="${O}"/><circle cx="30" cy="49" r="2.5" fill="${Y}" /><rect x="38" y="47" width="12" height="4" rx="2" fill="${B}" opacity=".3"/>`,
    foguete: `<path d="M32 4c10 8 13 22 10 36H22C19 26 22 12 32 4z" fill="${W}"/><circle cx="32" cy="23" r="5.5" fill="${B}"/><circle cx="32" cy="23" r="2.6" fill="${Y}"/><path d="M22 33l-9 11 11-3zM42 33l9 11-11-3z" fill="${O}"/><path d="M27 42h10l-5 16z" fill="${Y}"/>`,
    labirinto: `<rect x="8" y="8" width="48" height="48" rx="4" fill="${B}" stroke="${W}" stroke-width="3"/><path d="M8 22h30M56 38H26M20 38V22M44 22v16M26 50h20" stroke="${Y}" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="14" cy="46" r="3" fill="${O}"/>`,
    espada: `<path d="M32 3l6 9v28H26V12z" fill="${W}"/><rect x="17" y="40" width="30" height="6" rx="3" fill="${Y}"/><rect x="29" y="46" width="6" height="11" fill="${O}"/><circle cx="32" cy="59" r="3.5" fill="${Y}"/>`,
    plataforma: `<rect x="6" y="44" width="20" height="14" fill="${W}"/><rect x="22" y="32" width="20" height="26" fill="${W}" opacity=".85"/><rect x="38" y="20" width="20" height="38" fill="${W}" opacity=".7"/><path d="M48 20V6" stroke="${Y}" stroke-width="3"/><path d="M48 6l11 4-11 4z" fill="${O}"/>`,
    'quebra-cabeca': `<path d="M14 18h12a6 6 0 1 1 12 0h12v12a6 6 0 1 0 0 12v12H38a6 6 0 1 0-12 0H14V42a6 6 0 1 1 0-12z" fill="${Y}" stroke="${W}" stroke-width="3" stroke-linejoin="round"/>`,
    raio: `<path d="M38 3L13 36h15l-5 25 28-35H36z" fill="${Y}" stroke="${W}" stroke-width="2" stroke-linejoin="round"/>`,
    mira: `<circle cx="32" cy="32" r="19" fill="none" stroke="${W}" stroke-width="4"/><path d="M32 4v16M32 44v16M4 32h16M44 32h16" stroke="${W}" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="32" r="4.5" fill="${O}"/>`,
    mundo: `<circle cx="32" cy="32" r="24" fill="none" stroke="${W}" stroke-width="4"/><ellipse cx="32" cy="32" rx="10" ry="24" fill="none" stroke="${W}" stroke-width="3"/><path d="M8 32h48M12 20h40M12 44h40" stroke="${W}" stroke-width="3"/><circle cx="48" cy="14" r="6" fill="${Y}"/>`,
    movimento: `<rect x="24" y="8" width="16" height="48" rx="6" fill="${W}"/><circle cx="32" cy="20" r="3.5" fill="${O}"/><rect x="28" y="30" width="8" height="4" rx="2" fill="${B}" opacity=".3"/><path d="M15 24c-4 6-4 10 0 16M8 20c-7 9-7 15 0 24M49 24c4 6 4 10 0 16M56 20c7 9 7 15 0 24" stroke="${Y}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    nota: `<path d="M28 46V14l24-6v34" stroke="${W}" stroke-width="4" fill="none" stroke-linejoin="round"/><ellipse cx="21" cy="48" rx="8.5" ry="6.5" fill="${Y}"/><ellipse cx="45" cy="44" rx="8.5" ry="6.5" fill="${Y}"/>`,
    celular: `<rect x="18" y="4" width="28" height="56" rx="6" fill="${W}"/><rect x="22" y="12" width="20" height="34" rx="2" fill="${B}"/><circle cx="32" cy="53" r="3" fill="${Y}"/><path d="M28 21l11 8-11 8z" fill="${O}"/>`,
    vr: `<rect x="6" y="20" width="52" height="25" rx="11" fill="${W}"/><rect x="12" y="25" width="16" height="15" rx="6" fill="${B}"/><rect x="36" y="25" width="16" height="15" rx="6" fill="${B}"/><path d="M6 32H2M58 32h4" stroke="${Y}" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="32" r="3" fill="${O}"/>`,
    cubo: `<path d="M32 5l23 13v28L32 59 9 46V18z" fill="${W}"/><path d="M32 5l23 13-23 13L9 18z" fill="${Y}"/><path d="M32 31l23-13v28L32 59z" fill="${O}"/><path d="M9 18l23 13v28L9 46z" fill="${W}" opacity=".85"/>`,
    pin: `<path d="M32 4c11 0 19 8 19 19 0 15-19 35-19 35S13 38 13 23C13 12 21 4 32 4z" fill="${W}"/><circle cx="32" cy="23" r="7.5" fill="${O}"/><ellipse cx="32" cy="60" rx="13" ry="3" fill="${Y}"/>`,
    trofeu: `<path d="M18 7h28v15c0 10-6 16-14 16s-14-6-14-16z" fill="${Y}"/><path d="M18 12H8c0 10 4 16 12 18M46 12h10c0 10-4 16-12 18" stroke="${W}" stroke-width="3" fill="none"/><rect x="28" y="38" width="8" height="10" fill="${W}"/><rect x="20" y="48" width="24" height="9" rx="2" fill="${W}"/>`,
    console: `<rect x="5" y="24" width="54" height="24" rx="5" fill="${W}"/><rect x="11" y="31" width="24" height="4" fill="${B}" opacity=".3"/><rect x="11" y="38" width="14" height="3" fill="${B}" opacity=".3"/><circle cx="47" cy="36" r="5" fill="${O}"/><rect x="12" y="48" width="9" height="6" fill="${Y}"/><rect x="43" y="48" width="9" height="6" fill="${Y}"/>`,
    portatil: `<rect x="14" y="4" width="36" height="56" rx="6" fill="${W}"/><rect x="19" y="10" width="26" height="22" rx="2" fill="${B}"/><rect x="22" y="13" width="20" height="16" fill="${Y}"/><rect x="21" y="43" width="12" height="3" fill="${B}" opacity=".35"/><rect x="25.5" y="38.5" width="3" height="12" fill="${B}" opacity=".35"/><circle cx="41" cy="42" r="3" fill="${O}"/><circle cx="46" cy="48" r="3" fill="${Y}"/>`,
    tv: `<rect x="6" y="12" width="52" height="36" rx="5" fill="${W}"/><rect x="12" y="18" width="34" height="24" rx="2" fill="${B}"/><circle cx="52" cy="26" r="2.5" fill="${O}"/><circle cx="52" cy="35" r="2.5" fill="${Y}"/><path d="M22 54h20M32 48v6" stroke="${Y}" stroke-width="3"/>`
  };
  const icone = (nome) => ICONES[nome] || ICONES.gamepad;

  const CORES_ERA = {
    primordios: ['#0b1f4d', '#1c3f91'], primeira: ['#10337a', '#1d4fd8'], segunda: ['#0f2f78', '#2563eb'],
    terceira: ['#0b3a8f', '#1e6bff'], quarta: ['#102a6b', '#2f5fe0'], quinta: ['#0a2a66', '#1f7ae0'],
    sexta: ['#0d2c6e', '#3a6ff0'], setima: ['#0e2762', '#2e63d9'], oitava: ['#0b2a6a', '#2b7bff'], nona: ['#0a1f55', '#3b6cff']
  };

  function quebrar(texto, max) {
    const linhas = [];
    let atual = '';
    texto.split(' ').forEach((p) => {
      const tenta = (atual + ' ' + p).trim();
      if (tenta.length > max && atual) { linhas.push(atual); atual = p; } else { atual = tenta; }
    });
    if (atual) linhas.push(atual);
    return linhas.slice(0, 4);
  }

  function capaSVG(j) {
    const c = CORES_ERA[j.era] || ['#0a1d4d', '#1d4fd8'];
    const id = 'c-' + j.id;
    const linhas = quebrar(j.titulo, 15);
    const y0 = 336 - (linhas.length - 1) * 26;
    const textos = linhas.map((l, i) =>
      `<text x="150" y="${y0 + i * 26}" text-anchor="middle" class="capa-t">${esc(l)}</text>`).join('');
    return `<svg viewBox="0 0 300 400" role="img" aria-label="Capa ilustrativa de ${esc(j.titulo)}" preserveAspectRatio="xMidYMid slice">` +
      `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset="1" stop-color="${c[1]}"/></linearGradient>` +
      `<pattern id="${id}-p" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.4" fill="#ffffff" opacity=".16"/></pattern></defs>` +
      `<rect width="300" height="400" fill="url(#${id})"/><rect width="300" height="400" fill="url(#${id}-p)"/>` +
      `<circle cx="150" cy="135" r="84" fill="#0a1d4d" opacity=".4"/><circle cx="150" cy="135" r="84" fill="none" stroke="#ffc933" stroke-width="5"/>` +
      `<g transform="translate(86 71) scale(2)">${icone(j.icone)}</g>` +
      textos +
      `<rect x="0" y="354" width="300" height="46" fill="#ffc933"/><text x="150" y="385" text-anchor="middle" class="capa-a">${esc(j.ano)}</text></svg>`;
  }

  function capaHTML(j) {
    if (j.imagem) {
      return `<div class="capa"><img src="${esc(j.imagem)}" alt="Capa de ${esc(j.titulo)}" loading="lazy" data-fallback="${esc(j.id)}"></div>`;
    }
    return `<div class="capa">${capaSVG(j)}</div>`;
  }

  function consoleVisual(era) {
    if (era.imagem) return `<img src="${esc(era.imagem)}" alt="Console principal: ${esc(era.console)}" loading="lazy">`;
    const c = CORES_ERA[era.id] || ['#0a1d4d', '#1d4fd8'];
    const id = 'e-' + era.id;
    return `<svg viewBox="0 0 300 200" role="img" aria-label="Ilustração do console principal: ${esc(era.console)}">` +
      `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset="1" stop-color="${c[1]}"/></linearGradient>` +
      `<pattern id="${id}-p" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.4" fill="#ffffff" opacity=".16"/></pattern></defs>` +
      `<rect width="300" height="200" rx="12" fill="url(#${id})"/><rect width="300" height="200" rx="12" fill="url(#${id}-p)"/>` +
      `<ellipse cx="150" cy="170" rx="90" ry="8" fill="#000000" opacity=".25"/>` +
      `<g transform="translate(70 22) scale(2.4)">${icone(era.icone)}</g></svg>`;
  }

  /* imagem quebrada: volta para a capa ilustrada */
  document.addEventListener('error', (e) => {
    const t = e.target;
    if (t && t.tagName === 'IMG' && t.dataset && t.dataset.fallback && byId[t.dataset.fallback] && t.parentNode) {
      t.parentNode.innerHTML = capaSVG(byId[t.dataset.fallback]);
    }
  }, true);

  /* ---------- dados e busca ---------- */
  async function carregarDados() {
    if (location.protocol === 'file:' && window.WIKI_DB) return window.WIKI_DB;
    try {
      const r = await fetch('data/games.json');
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.json();
    } catch (e) {
      if (window.WIKI_DB) return window.WIKI_DB;
      throw e;
    }
  }

  function prepararDados(db) {
    DB = db;
    db.eras.forEach((e) => { eraById[e.id] = e; });
    db.jogos.forEach((j) => {
      const era = eraById[j.era] || db.eras[0];
      j.era = era.id;
      j._era = era;
      j.tags = j.tags || [];
      j.mecanicas = j.mecanicas || [];
      j._titulo = norm(j.titulo);
      j._tags = norm(j.tags.join(' '));
      j._busca = norm([j.titulo, j.ano, j.empresa, j.genero, j.sinopse, era.nome, era.anos, j.tags.join(' '), j.mecanicas.join(' ')].join(' '));
      byId[j.id] = j;
    });
  }

  function pontos(j, tokens) {
    let p = 0;
    tokens.forEach((t) => {
      if (j._titulo.indexOf(t) === 0) p += 5;
      else if (j._titulo.indexOf(t) !== -1) p += 3;
      if (j._tags.indexOf(t) !== -1) p += 1;
    });
    return p;
  }

  function buscar(q, filtros) {
    const f = filtros || {};
    const tokens = norm(q).split(/\s+/).filter(Boolean);
    const lista = DB.jogos.filter((j) => {
      if (f.tag && !j.tags.some((t) => norm(t) === norm(f.tag))) return false;
      if (f.era && j.era !== f.era) return false;
      return tokens.every((t) => j._busca.indexOf(t) !== -1);
    });
    lista.sort((a, b) => (tokens.length ? pontos(b, tokens) - pontos(a, tokens) : 0) || a.ano - b.ano || a.titulo.localeCompare(b.titulo));
    return lista;
  }

  function tagsPopulares(n) {
    const cont = {};
    DB.jogos.forEach((j) => j.tags.forEach((t) => { cont[t] = (cont[t] || 0) + 1; }));
    return Object.keys(cont).sort((a, b) => cont[b] - cont[a] || a.localeCompare(b)).slice(0, n).map((t) => ({ tag: t, n: cont[t] }));
  }

  function urlCatalogo(o) {
    const p = new URLSearchParams();
    if (o.q) p.set('q', o.q);
    if (o.tag) p.set('tag', o.tag);
    if (o.era) p.set('era', o.era);
    const s = p.toString();
    return '#/jogos' + (s ? '?' + s : '');
  }

  function setTitulo(t) {
    document.title = t === 'Wiki de Jogos' ? t : t + ' · Wiki de Jogos';
  }

  /* ---------- peças de HTML ---------- */
  function cardPioneiro(j) {
    return `<a class="card-pioneiro" href="#/jogo/${encodeURIComponent(j.id)}">${capaHTML(j)}` +
      `<div class="cp-body"><span class="cp-ano">${esc(j.ano)}</span><h3>${esc(j.titulo)}</h3><p class="frase">${esc(j.frase)}</p></div></a>`;
  }

  function cardJogo(j) {
    return `<a class="card-jogo" href="#/jogo/${encodeURIComponent(j.id)}">${capaHTML(j)}` +
      `<div><h3>${esc(j.titulo)}</h3><p class="meta">${esc(j.ano)} · ${esc(j._era.nome)}</p>` +
      `<p class="meta">${esc(j.genero)}</p></div></a>`;
  }

  function chipsTags(tags) {
    return tags.map((t) => `<li><a class="chip tag" href="${urlCatalogo({ tag: t })}">#${esc(t)}</a></li>`).join('');
  }

  /* ---------- páginas ---------- */
  function renderHome(secao) {
    rotaAtual = 'home';
    const pioneiros = DB.jogos.filter((j) => j.pioneiro).sort((a, b) => a.ano - b.ano);
    const anos = DB.jogos.map((j) => j.ano);
    const populares = tagsPopulares(18);

    app.innerHTML = `
      <section class="hero">
        <div class="wrap hero-in">
          <p class="eyebrow">PROJETO ACADÊMICO · PROTÓTIPO</p>
          <h1>Do osciloscópio ao <span>metaverso</span></h1>
          <p class="lead">Explore a história dos videogames: os primeiros consoles, a evolução das gerações e os jogos que criaram as mecânicas que ainda jogamos hoje.</p>
          <div class="hero-actions">
            <a class="btn" href="#/secao/linha-do-tempo">Ver linha do tempo</a>
            <a class="btn btn-ghost" href="#/jogos">Explorar todos os jogos</a>
          </div>
          <ul class="stats" aria-label="Números da wiki">
            <li><strong>${DB.jogos.length}</strong><span>jogos</span></li>
            <li><strong>${DB.eras.length}</strong><span>gerações e eras</span></li>
            <li><strong>${Math.min.apply(null, anos)}–${Math.max.apply(null, anos)}</strong><span>anos cobertos</span></li>
          </ul>
        </div>
      </section>

      <section class="bloco" id="pioneiros" aria-labelledby="h-pioneiros">
        <div class="wrap">
          <header class="bloco-head">
            <span class="kicker warm">Mecânicas pioneiras</span>
            <h2 id="h-pioneiros">Galeria de Pioneiros</h2>
            <p>Jogos que criaram ideias hoje presentes em quase tudo o que jogamos.</p>
          </header>
          <div class="galeria">${pioneiros.map(cardPioneiro).join('')}</div>
        </div>
      </section>

      <section class="bloco" id="linha-do-tempo" aria-labelledby="h-tempo">
        <div class="wrap">
          <header class="bloco-head">
            <span class="kicker">Origem e evolução</span>
            <h2 id="h-tempo">Linha do Tempo</h2>
            <p>Escolha uma geração para ver o resumo, o console principal e os jogos que marcaram a época.</p>
          </header>
          <div class="tl" role="group" aria-label="Gerações de consoles">
            ${DB.eras.map((e, i) => `<button class="tl-item" type="button" data-era="${esc(e.id)}" aria-pressed="${i === 0}" aria-controls="tl-panel">
              <span class="tl-dot" aria-hidden="true"></span><span class="tl-anos">${esc(e.anos)}</span><span class="tl-nome">${esc(e.nome)}</span></button>`).join('')}
          </div>
          <div id="tl-panel" class="tl-panel" aria-live="polite"></div>
        </div>
      </section>

      <section class="bloco" aria-labelledby="h-tags">
        <div class="wrap">
          <header class="bloco-head">
            <span class="kicker">Categorias</span>
            <h2 id="h-tags">Explorar por tag</h2>
            <p>Toque em uma tag para ver todos os jogos relacionados.</p>
          </header>
          <ul class="chips">${populares.map((t) => `<li><a class="chip" href="${urlCatalogo({ tag: t.tag })}">#${esc(t.tag)} <small>${t.n}</small></a></li>`).join('')}</ul>
        </div>
      </section>

      <section class="bloco apoie" id="apoie" aria-labelledby="h-apoie">
        <div class="wrap apoie-grid">
          <div>
            <span class="kicker warm">Comunidade</span>
            <h2 id="h-apoie">Apoie / Seja um contribuinte</h2>
            <p class="sub">Conhece um jogo que ficou de fora ou viu algo errado em uma página? Conte aqui. Toda contribuição ajuda a wiki a crescer.</p>
          </div>
          <form class="form" id="form-apoie" novalidate>
            <label for="ap-nome">Seu nome<input id="ap-nome" name="nome" maxlength="60" autocomplete="name"></label>
            <label for="ap-assunto">Jogo ou assunto<input id="ap-assunto" name="assunto" maxlength="80" placeholder="Ex.: Mortal Kombat"></label>
            <label for="ap-texto">Sua contribuição<textarea id="ap-texto" name="texto" maxlength="500" placeholder="O que você quer acrescentar ou corrigir?"></textarea></label>
            <button class="btn btn-warm" type="submit">Enviar contribuição</button>
            <p class="form-msg" id="ap-msg" role="status" aria-live="polite"></p>
            <p class="dica">Protótipo: nenhuma informação é enviada ou guardada.</p>
          </form>
        </div>
      </section>`;

    pintarEra(DB.eras[0].id);
    $$('.tl-item').forEach((b) => b.addEventListener('click', () => {
      $$('.tl-item').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      pintarEra(b.dataset.era);
    }));
    $('#form-apoie').addEventListener('submit', enviarContribuicao);

    setTitulo('Wiki de Jogos');
    if (secao && document.getElementById(secao)) {
      requestAnimationFrame(() => document.getElementById(secao).scrollIntoView({ block: 'start' }));
    } else {
      window.scrollTo(0, 0);
    }
  }

  function pintarEra(id) {
    const e = eraById[id];
    if (!e) return;
    const jogos = DB.jogos.filter((j) => j.era === id).sort((a, b) => a.ano - b.ano);
    $('#tl-panel').innerHTML = `
      <div class="tl-visual">${consoleVisual(e)}
        <p class="legenda">Console principal: ${esc(e.console)}</p>
        ${e.imagem ? '' : '<small>Ilustração genérica. Coloque uma foto em “imagem” no JSON.</small>'}
      </div>
      <div class="tl-info">
        <p class="era-anos">${esc(e.anos)}</p>
        <h3>${esc(e.nome)}: ${esc(e.titulo)}</h3>
        <p>${esc(e.resumo)}</p>
        <h4>Jogos que marcaram a época</h4>
        ${jogos.length
          ? `<ul class="chips">${jogos.map((j) => `<li><a class="chip" href="#/jogo/${encodeURIComponent(j.id)}">${esc(j.titulo)} <small>${esc(j.ano)}</small></a></li>`).join('')}</ul>`
          : '<p class="dica">Ainda não há jogos cadastrados nesta era.</p>'}
      </div>`;
  }

  function enviarContribuicao(ev) {
    ev.preventDefault();
    const f = ev.target;
    const nome = f.nome.value.trim();
    const assunto = f.assunto.value.trim();
    const texto = f.texto.value.trim();
    const msg = $('#ap-msg');
    if (!nome || !assunto || texto.length < 5) {
      msg.className = 'form-msg erro';
      msg.textContent = 'Preencha seu nome, o assunto e escreva pelo menos algumas palavras.';
      return;
    }
    msg.className = 'form-msg ok';
    msg.textContent = 'Obrigado, ' + nome + '! Sua contribuição sobre “' + assunto + '” foi recebida.';
    f.reset();
  }

  function renderCatalogo(params) {
    rotaAtual = 'jogos';
    estadoCat = { q: params.get('q') || '', tag: params.get('tag') || '', era: params.get('era') || '' };
    if (campo.value !== estadoCat.q) campo.value = estadoCat.q;

    app.innerHTML = `
      <section class="wrap pagina" aria-labelledby="h-cat">
        <nav class="migalhas" aria-label="Você está em"><a href="#/">Início</a><span aria-hidden="true">›</span><span>Jogos</span></nav>
        <header class="cat-head"><h1 id="h-cat"></h1><p id="cat-sub"></p></header>
        <div class="filtros">
          <h2>Gerações</h2>
          <div class="chips" id="f-eras"></div>
          <div class="chips" id="f-tag"></div>
        </div>
        <div class="grade" id="lista"></div>
      </section>`;
    pintarCatalogo();
    setTitulo('Jogos');
    window.scrollTo(0, 0);
  }

  function pintarCatalogo() {
    const { q, tag, era } = estadoCat;
    const lista = buscar(q, { tag, era });
    const titulo = q ? 'Resultados para “' + q + '”' : tag ? 'Tag #' + tag : 'Todos os jogos';
    $('#h-cat').textContent = titulo;
    $('#cat-sub').textContent = lista.length + (lista.length === 1 ? ' jogo encontrado' : ' jogos encontrados');

    const todas = `<a class="chip ${era ? '' : 'on'}" href="${urlCatalogo({ q, tag })}">Todas</a>`;
    $('#f-eras').innerHTML = todas + DB.eras.map((e) =>
      `<a class="chip ${era === e.id ? 'on' : ''}" href="${urlCatalogo({ q, tag, era: e.id })}">${esc(e.nome)}</a>`).join('');
    $('#f-tag').innerHTML = tag
      ? `<a class="chip on" href="${urlCatalogo({ q, era })}" aria-label="Remover filtro da tag ${esc(tag)}">#${esc(tag)} ✕</a>` : '';

    $('#lista').innerHTML = lista.length
      ? lista.map(cardJogo).join('')
      : `<p class="vazio" style="grid-column:1/-1">Nenhum jogo encontrado. Tente outro nome, ano, empresa ou tag, como “Nintendo”, “1985” ou “RPG”.</p>`;
  }

  function renderJogo(id) {
    const j = byId[id];
    if (!j) return renderNaoEncontrado();
    rotaAtual = 'jogo';
    const era = j._era;
    const parecidos = DB.jogos.filter((x) => x.id !== j.id && x.era === j.era).slice(0, 3);

    app.innerHTML = `
      <article class="wrap pagina">
        <nav class="migalhas" aria-label="Você está em">
          <a href="#/">Início</a><span aria-hidden="true">›</span>
          <a href="${urlCatalogo({ era: era.id })}">${esc(era.nome)}</a><span aria-hidden="true">›</span>
          <span>${esc(j.titulo)}</span>
        </nav>

        <header class="jogo-topo">
          <figure class="jogo-capa">${capaHTML(j)}<figcaption>${j.imagem ? '' : 'Capa ilustrativa'}</figcaption></figure>
          <div class="jogo-intro">
            <span class="kicker">${esc(era.nome)} · ${esc(j.ano)}</span>
            <h1>${esc(j.titulo)}</h1>
            <p class="rotulo">Sinopse</p>
            <p class="sinopse">${esc(j.sinopse)}</p>
            ${j.pioneiro ? `<p class="selo">★ Jogo pioneiro: ${esc(j.frase)}</p>` : ''}
          </div>
        </header>

        <section class="secao" aria-labelledby="h-ficha">
          <h2 id="h-ficha">Ficha técnica</h2>
          <dl class="ficha">
            <div><dt>Gênero</dt><dd>${esc(j.genero)}</dd></div>
            <div><dt>Geração e ano de lançamento</dt><dd>${esc(era.nome)} · ${esc(j.ano)}</dd></div>
            <div><dt>Empresa desenvolvedora</dt><dd>${esc(j.empresa)}</dd></div>
          </dl>
        </section>

        <section class="secao" aria-labelledby="h-mec">
          <h2 id="h-mec">Mecânicas marcantes</h2>
          <ul class="mecanicas">${j.mecanicas.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>
        </section>

        <section class="secao sabia" aria-labelledby="h-sabia">
          <h2 id="h-sabia">VOCÊ SABIA?</h2>
          <ul><li>${esc(j.curiosidade)}</li></ul>
        </section>

        <section class="secao" aria-labelledby="h-tags-jogo">
          <h2 id="h-tags-jogo">Tags</h2>
          <ul class="chips">${chipsTags(j.tags)}</ul>
        </section>

        <section class="secao comentarios" aria-labelledby="h-com">
          <h2 id="h-com">Comentários (<span id="com-n">0</span>)</h2>
          <form class="form" id="form-com" novalidate>
            <label for="com-nome">Seu nome<input id="com-nome" name="nome" maxlength="40" autocomplete="nickname"></label>
            <label for="com-texto">Comentário<textarea id="com-texto" name="texto" maxlength="400" placeholder="O que você lembra deste jogo?"></textarea></label>
            <button class="btn" type="submit">Publicar comentário</button>
            <p class="form-msg" id="com-msg" role="status" aria-live="polite"></p>
            <p class="dica">Protótipo: os comentários ficam salvos só neste navegador (localStorage).</p>
          </form>
          <ul class="com-lista" id="com-lista"></ul>
        </section>

        ${parecidos.length ? `<section class="secao" aria-labelledby="h-rel"><h2 id="h-rel">Mais de ${esc(era.nome)}</h2><div class="grade">${parecidos.map(cardJogo).join('')}</div></section>` : ''}
      </article>`;

    pintarComentarios(j.id);
    $('#form-com').addEventListener('submit', (ev) => enviarComentario(ev, j.id));
    setTitulo(j.titulo);
    window.scrollTo(0, 0);
  }

  function renderNaoEncontrado() {
    rotaAtual = 'erro';
    app.innerHTML = `<section class="wrap pagina"><div class="vazio"><h1>Página não encontrada</h1><p>Esse jogo não está na wiki. <a href="#/jogos">Veja todos os jogos</a> ou <a href="#/">volte ao início</a>.</p></div></section>`;
    setTitulo('Página não encontrada');
  }

  /* ---------- comentários (localStorage, com plano B em memória) ---------- */
  const CHAVE = 'wikijogos:comentarios';
  let memoria = {};

  function lerComentarios() {
    try {
      const raw = localStorage.getItem(CHAVE);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* sem acesso ao armazenamento */ }
    return memoria;
  }

  function gravarComentarios(obj) {
    memoria = obj;
    try { localStorage.setItem(CHAVE, JSON.stringify(obj)); } catch (e) { /* segue só em memória */ }
  }

  function pintarComentarios(id) {
    const lista = lerComentarios()[id] || [];
    $('#com-n').textContent = lista.length;
    $('#com-lista').innerHTML = lista.length
      ? lista.slice().reverse().map((c) => {
        const d = new Date(c.quando);
        const data = isNaN(d) ? '' : d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
        return `<li class="com"><span class="com-av" aria-hidden="true">${esc(c.nome.charAt(0).toUpperCase())}</span>
          <div><p class="com-meta"><strong>${esc(c.nome)}</strong> · ${esc(data)}</p><p class="texto">${esc(c.texto)}</p></div></li>`;
      }).join('')
      : '<li class="vazio">Nenhum comentário ainda. Seja a primeira pessoa a comentar!</li>';
  }

  function enviarComentario(ev, id) {
    ev.preventDefault();
    const f = ev.target;
    const nome = f.nome.value.trim();
    const texto = f.texto.value.trim();
    const msg = $('#com-msg');
    if (!nome || texto.length < 3) {
      msg.className = 'form-msg erro';
      msg.textContent = 'Informe seu nome e escreva um comentário com pelo menos 3 letras.';
      return;
    }
    const tudo = lerComentarios();
    (tudo[id] = tudo[id] || []).push({ nome: nome, texto: texto, quando: new Date().toISOString() });
    gravarComentarios(tudo);
    f.texto.value = '';
    msg.className = 'form-msg ok';
    msg.textContent = 'Comentário publicado.';
    pintarComentarios(id);
  }

  /* ---------- busca no topo ---------- */
  let itensSug = [];
  let ativo = -1;

  function fecharSug() {
    caixaSug.hidden = true;
    caixaSug.innerHTML = '';
    campo.setAttribute('aria-expanded', 'false');
    campo.removeAttribute('aria-activedescendant');
    itensSug = [];
    ativo = -1;
  }

  function mostrarSug(q) {
    itensSug = q.trim() ? buscar(q).slice(0, 6) : [];
    if (!itensSug.length) { fecharSug(); return; }
    caixaSug.innerHTML = itensSug.map((j, i) =>
      `<li role="option" id="sug-${i}" data-id="${esc(j.id)}" aria-selected="false"><span class="sug-t">${esc(j.titulo)}</span><span class="sug-m">${esc(j.ano)} · ${esc(j._era.nome)}</span></li>`).join('');
    caixaSug.hidden = false;
    campo.setAttribute('aria-expanded', 'true');
    ativo = -1;
  }

  function marcarSug(i) {
    ativo = i;
    $$('#sugestoes li').forEach((li, k) => li.setAttribute('aria-selected', String(k === i)));
    if (i >= 0) campo.setAttribute('aria-activedescendant', 'sug-' + i); else campo.removeAttribute('aria-activedescendant');
  }

  function iniciarBusca() {
    campo.addEventListener('input', () => {
      const q = campo.value;
      if (rotaAtual === 'jogos') {
        estadoCat.q = q;
        history.replaceState(null, '', urlCatalogo(estadoCat));
        pintarCatalogo();
        fecharSug();
      } else {
        mostrarSug(q);
      }
    });

    campo.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' && itensSug.length) { e.preventDefault(); marcarSug((ativo + 1) % itensSug.length); }
      else if (e.key === 'ArrowUp' && itensSug.length) { e.preventDefault(); marcarSug((ativo - 1 + itensSug.length) % itensSug.length); }
      else if (e.key === 'Escape') { fecharSug(); }
      else if (e.key === 'Enter' && ativo >= 0) {
        e.preventDefault();
        const id = itensSug[ativo].id;
        fecharSug();
        location.hash = '#/jogo/' + encodeURIComponent(id);
      }
    });

    $('#form-busca').addEventListener('submit', (e) => {
      e.preventDefault();
      const q = campo.value.trim();
      fecharSug();
      location.hash = urlCatalogo({ q: q });
    });

    caixaSug.addEventListener('mousedown', (e) => {
      const li = e.target.closest('li[data-id]');
      if (!li) return;
      e.preventDefault();
      const id = li.dataset.id;
      fecharSug();
      location.hash = '#/jogo/' + encodeURIComponent(id);
    });

    document.addEventListener('click', (e) => { if (!e.target.closest('.busca')) fecharSug(); });
  }

  /* ---------- rotas ---------- */
  function marcarMenu(rota, secao) {
    $$('.menu a').forEach((a) => {
      const alvo = a.dataset.nav;
      const ativoMenu = (alvo === 'home' && rota === 'home' && !secao) ||
        (alvo === 'jogos' && (rota === 'jogos' || rota === 'jogo')) ||
        (alvo === secao);
      if (ativoMenu) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  function roteador() {
    const h = location.hash.replace(/^#\/?/, '');
    const partes = h.split('?');
    const seg = partes[0].split('/').filter(Boolean).map(decodeURIComponent);
    const params = new URLSearchParams(partes[1] || '');
    fecharSug();
    let secao = '';

    if (!seg.length) renderHome();
    else if (seg[0] === 'secao') { secao = seg[1] || ''; renderHome(secao); }
    else if (seg[0] === 'jogos') renderCatalogo(params);
    else if (seg[0] === 'jogo') renderJogo(seg[1]);
    else renderNaoEncontrado();

    marcarMenu(rotaAtual, secao);
  }

  /* ---------- início ---------- */
  async function iniciar() {
    iniciarBusca();
    const pular = $('.skip');
    if (pular) pular.addEventListener('click', (e) => { e.preventDefault(); app.focus(); });
    try {
      prepararDados(await carregarDados());
    } catch (e) {
      app.innerHTML = '<div class="carregando"><h1>Não foi possível carregar os dados</h1><p>Abra o projeto por um servidor local (por exemplo, a extensão Live Server) ou mantenha o arquivo data/games-data.js junto do index.html.</p></div>';
      return;
    }
    window.addEventListener('hashchange', roteador);
    roteador();
  }

  iniciar();
})();
