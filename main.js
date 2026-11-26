/* =====================================================================
   Lubie Aparelhos Auditivos — script compartilhado (todas as páginas)
   Todas as funções são "guardadas" (checam se o elemento existe),
   então este mesmo arquivo pode ser incluído em qualquer página.
   ===================================================================== */

// ── Navbar scroll ─────────────────────────────────────────────────────────────
(function () {
  var nav = document.getElementById('nav');
  if (!nav) return;
  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });
})();

// ── Menu mobile ───────────────────────────────────────────────────────────────
function toggleNav() {
  var el = document.getElementById('navLinks');
  if (el) el.classList.toggle('open');
}
document.querySelectorAll('.nav__links a').forEach(function (a) {
  a.addEventListener('click', function () {
    var el = document.getElementById('navLinks');
    if (el) el.classList.remove('open');
  });
});

// ── First-click attribution (UTM + gclid) ─────────────────────────────────────
(function () {
  var KEY = 'lubie_first_touch';
  if (!sessionStorage.getItem(KEY + '_seen')) {
    if (!localStorage.getItem(KEY)) {
      var params = new URLSearchParams(window.location.search);
      var source   = params.get('utm_source')   || (params.get('gclid') ? 'google' : (document.referrer ? new URL(document.referrer).hostname : 'direct'));
      var medium   = params.get('utm_medium')   || (params.get('gclid') ? 'cpc'    : (document.referrer ? 'referral' : 'direct'));
      var campaign = params.get('utm_campaign') || params.get('utm_content') || '';
      var gclid    = params.get('gclid') || '';
      localStorage.setItem(KEY, JSON.stringify({ source: source, medium: medium, campaign: campaign, gclid: gclid, ts: new Date().toISOString() }));
    }
    sessionStorage.setItem(KEY + '_seen', '1');
  }
})();

function getFirstTouch() {
  try { return JSON.parse(localStorage.getItem('lubie_first_touch')) || {}; } catch (e) { return {}; }
}

// ── Rastreia cliques de contato (WhatsApp / Telefone) como conversão ───────────
function trackContactClick(type) {
  type = type || 'contact';
  if (typeof gtag === 'undefined') return;
  if (sessionStorage.getItem('lubie_conv_contact')) return;
  sessionStorage.setItem('lubie_conv_contact', '1');
  var ft = getFirstTouch();

  gtag('event', type + '_click', Object.assign(
    { 'event_category': 'contato', 'event_label': type },
    ft.source ? { 'utm_source': ft.source, 'utm_medium': ft.medium, 'utm_campaign': ft.campaign } : {}
  ));

  // Se o formulário já tem telefone preenchido, envia Enhanced Conversions para Contato
  var waVal = (document.getElementById('wa-input') || {}).value || '';
  var nomeVal = (document.getElementById('f-nome') || {}).value || '';
  if (waVal) {
    sendEnhancedConversionContact(waVal, nomeVal, ft);
  } else {
    gtag('event', 'conversion', Object.assign(
      { 'send_to': 'AW-16922891425/daYdCJaU0akaEKGpu4U_' },
      ft.source ? { 'utm_source': ft.source, 'utm_medium': ft.medium, 'utm_campaign': ft.campaign, 'gclid': ft.gclid } : {}
    ));
  }
}

// ── Enhanced Conversions para cliques de Contato (daYdCJaU0akaEKGpu4U_) ────────
async function sendEnhancedConversionContact(phoneRaw, nomeRaw, ft) {
  try {
    if (typeof gtag === 'undefined') return;
    ft = ft || getFirstTouch();
    var digits = phoneRaw.replace(/\D/g, '').replace(/^0+/, '');
    var e164   = '+' + (digits.startsWith('55') ? digits : '55' + digits);
    var userData = { 'sha256_phone_number': await sha256Hex(e164) };
    if (nomeRaw) {
      var firstName = nomeRaw.trim().split(/\s+/)[0].toLowerCase();
      userData['sha256_first_name'] = await sha256Hex(firstName);
    }
    gtag('event', 'conversion', Object.assign(
      { 'send_to': 'AW-16922891425/daYdCJaU0akaEKGpu4U_', 'user_data': userData },
      ft.source ? { 'utm_source': ft.source, 'utm_medium': ft.medium, 'utm_campaign': ft.campaign, 'gclid': ft.gclid } : {}
    ));
  } catch (err) {
    // Fallback sem enhanced data
    var ft2 = ft || getFirstTouch();
    gtag('event', 'conversion', Object.assign(
      { 'send_to': 'AW-16922891425/daYdCJaU0akaEKGpu4U_' },
      ft2.source ? { 'utm_source': ft2.source, 'utm_medium': ft2.medium, 'utm_campaign': ft2.campaign, 'gclid': ft2.gclid } : {}
    ));
    console.warn('Enhanced Conversions contact error:', err);
  }
}

// ── Google Ads Enhanced Conversions (user_data) ───────────────────────────────
async function sha256Hex(str) {
  var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
}

async function sendEnhancedConversion(phoneRaw, nomeRaw) {
  try {
    if (typeof gtag === 'undefined') return;
    var digits = phoneRaw.replace(/\D/g, '').replace(/^0+/, '');
    var e164   = '+' + (digits.startsWith('55') ? digits : '55' + digits);
    var userData = { 'sha256_phone_number': await sha256Hex(e164) };
    if (nomeRaw) {
      var firstName = nomeRaw.trim().split(/\s+/)[0].toLowerCase();
      userData['sha256_first_name'] = await sha256Hex(firstName);
    }
    var ft = getFirstTouch();
    gtag('event', 'conversion', Object.assign(
      { 'send_to': 'AW-16922891425/4R7pCKCfg6IcEKGpu4U_', 'user_data': userData },
      ft.source ? { 'utm_source': ft.source, 'utm_medium': ft.medium, 'utm_campaign': ft.campaign, 'gclid': ft.gclid } : {}
    ));
  } catch (err) {
    console.warn('Enhanced Conversions error:', err);
  }
}

// ── Submit do formulário de agendamento ───────────────────────────────────────
function handleSubmit(e) {
  e.preventDefault();
  var btn = e.target.querySelector('button[type="submit"]');

  var nome   = (document.getElementById('f-nome')   || {}).value || '';
  var wa     = (document.getElementById('wa-input') || {}).value || '';
  var idade  = (document.getElementById('f-idade')  || {}).value || '';
  var motivo = (document.getElementById('f-motivo') || {}).value || '';
  var bairro = (document.getElementById('f-bairro') || {}).value || '';
  var msg    = (document.getElementById('f-msg')    || {}).value || '';

  // Dispara conversão de formulário — com Enhanced Conversions se tiver telefone
  if (wa) {
    sendEnhancedConversion(wa, nome); // inclui user_data (sha256 phone + nome)
  } else if (typeof gtag !== 'undefined') {
    gtag('event', 'conversion', { 'send_to': 'AW-16922891425/4R7pCKCfg6IcEKGpu4U_' });
  }

  var texto = 'Olá! Gostaria de agendar uma avaliação auditiva na Lubie.\n\n';
  texto += '*Nome:* ' + nome + '\n';
  texto += '*WhatsApp:* ' + wa + '\n';
  if (idade)  texto += '*Idade:* ' + idade + ' anos\n';
  if (motivo) texto += '*Motivo:* ' + motivo + '\n';
  if (bairro) texto += '*Bairro/Cidade:* ' + bairro + '\n';
  if (msg)    texto += '*Observação:* ' + msg + '\n';

  var waLink = 'https://wa.me/554132057295?text=' + encodeURIComponent(texto);

  var waNumCliente = wa.replace(/\D/g, '').replace(/^0+/, '');
  var waNumFull = waNumCliente.startsWith('55') ? waNumCliente : '55' + waNumCliente;
  var textoLubie = 'Olá ' + nome + '! Sou a Jéssica da Lubie Aparelhos Auditivos 👂\nVi que você se interessou em agendar uma avaliação auditiva gratuita. Posso te ajudar?';
  var waLinkParaLubie = 'https://wa.me/' + waNumFull + '?text=' + encodeURIComponent(textoLubie);

  var waLinkField = document.getElementById('f-wa-link');
  var origemField = document.getElementById('f-origem');
  var ft = getFirstTouch();
  var origem = ft.source ? (ft.source + ' / ' + ft.medium + (ft.campaign ? ' / ' + ft.campaign : '')) : 'direto';
  if (waLinkField) waLinkField.value = waLinkParaLubie;
  if (origemField) origemField.value = origem;

  var fd = new URLSearchParams();
  fd.append('form-name', 'agendamento');
  fd.append('nome', nome);
  fd.append('whatsapp', wa);
  fd.append('link_whatsapp', waLinkParaLubie);
  fd.append('origem', origem);
  if (ft.gclid) fd.append('gclid', ft.gclid);
  if (idade)  fd.append('idade', idade);
  if (motivo) fd.append('motivo', motivo);
  if (bairro) fd.append('bairro', bairro);
  if (msg)    fd.append('mensagem', msg);
  fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: fd.toString() })
    .catch(function (err) { console.warn('Netlify form:', err); });

  if (btn) {
    btn.textContent = '✅ Abrindo WhatsApp…';
    btn.style.background = 'var(--marrom)';
    btn.disabled = true;
  }
  window.open(waLink, '_blank');
  setTimeout(function () {
    if (btn) {
      btn.textContent = 'Agendar Avaliação Gratuita';
      btn.style.background = '';
      btn.disabled = false;
    }
    e.target.reset();
  }, 3000);
}

// ── Scroll animations ─────────────────────────────────────────────────────────
var obs = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.diff-card,.svc-card,.aparelho-card,.dep-card,.blog-card').forEach(function (el) {
  el.style.opacity = '0';
  el.style.transform = 'translateY(18px)';
  el.style.transition = 'opacity .5s ease, transform .5s ease';
  obs.observe(el);
});

// ── FAQ accordion ─────────────────────────────────────────────────────────────
function toggleFaq(btn) {
  var answer = btn.nextElementSibling;
  var isOpen = answer.classList.contains('open');
  document.querySelectorAll('.faq-a.open').forEach(function (a) { a.classList.remove('open'); });
  document.querySelectorAll('.faq-q.open').forEach(function (b) { b.classList.remove('open'); });
  if (!isOpen) {
    answer.classList.add('open');
    btn.classList.add('open');
  }
}

// ── Depoimentos – "Ler mais" ──────────────────────────────────────────────────
(function () {
  document.querySelectorAll('.dep-text').forEach(function (p) {
    var btn = document.createElement('button');
    btn.className = 'dep-ler-mais';
    btn.textContent = 'Ler mais ↓';
    btn.addEventListener('click', function () {
      p.classList.toggle('dep-expanded');
      btn.textContent = p.classList.contains('dep-expanded') ? 'Mostrar menos ↑' : 'Ler mais ↓';
    });
    p.parentNode.insertBefore(btn, p.nextSibling);
  });
})();

// ── Depoimentos Carousel ──────────────────────────────────────────────────────
(function () {
  var track   = document.getElementById('depTrack');
  var prevBtn = document.getElementById('depPrev');
  var nextBtn = document.getElementById('depNext');
  var dotsEl  = document.getElementById('depDots');
  if (!track) return;

  var cards = Array.from(track.children);
  var current = 0;
  var visibleCount = 3;

  function getVisible() {
    var w = window.innerWidth;
    if (w <= 620) return 1;
    if (w <= 960) return 2;
    return 3;
  }
  function totalPages() { return Math.ceil(cards.length / visibleCount); }
  function buildDots() {
    dotsEl.innerHTML = '';
    var pages = totalPages();
    for (var i = 0; i < pages; i++) {
      var dot = document.createElement('button');
      dot.className = 'dep-dot' + (i === current ? ' active' : '');
      dot.setAttribute('aria-label', 'Página ' + (i + 1));
      (function (idx) { dot.addEventListener('click', function () { goTo(idx); }); })(i);
      dotsEl.appendChild(dot);
    }
  }
  function goTo(page) {
    var pages = totalPages();
    current = Math.max(0, Math.min(page, pages - 1));
    var cardW = track.parentElement.offsetWidth;
    var gap = 24;
    var step = (cardW + gap) / visibleCount;
    track.style.transform = 'translateX(-' + (current * visibleCount * step) + 'px)';
    Array.from(dotsEl.children).forEach(function (d, i) { d.classList.toggle('active', i === current); });
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current >= pages - 1;
  }
  function init() { visibleCount = getVisible(); buildDots(); goTo(0); }
  prevBtn.addEventListener('click', function () { goTo(current - 1); });
  nextBtn.addEventListener('click', function () { goTo(current + 1); });
  window.addEventListener('resize', function () { init(); });
  init();

  var startX = 0, dragging = false, moved = false;
  function onDown(e) { dragging = true; moved = false; startX = (e.touches ? e.touches[0].clientX : e.clientX); track.style.transition = 'none'; }
  function onMove(e) { if (!dragging) return; var dx = (e.touches ? e.touches[0].clientX : e.clientX) - startX; if (Math.abs(dx) > 5) { moved = true; if (e.cancelable) e.preventDefault(); } }
  function onUp(e) {
    if (!dragging) return;
    dragging = false; track.style.transition = '';
    var dx = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX) - startX;
    if (moved && Math.abs(dx) > 50) { goTo(dx < 0 ? current + 1 : current - 1); } else { goTo(current); }
  }
  track.addEventListener('mousedown', onDown);
  track.addEventListener('mousemove', onMove);
  track.addEventListener('mouseup', onUp);
  track.addEventListener('mouseleave', onUp);
  track.addEventListener('touchstart', onDown, { passive: true });
  track.addEventListener('touchmove', onMove, { passive: false });
  track.addEventListener('touchend', onUp);
})();

// ── Blog dinâmico via RSS do Wix ──────────────────────────────────────────────
(function () {
  var grid = document.getElementById('blog-grid');
  if (!grid) return;

  var MAX_POSTS = grid.getAttribute('data-max') ? parseInt(grid.getAttribute('data-max'), 10) : 6;
  var FEED_URL  = 'https://blog.lubieaparelhosauditivos.com.br/blog-feed.xml';
  var PROXY     = 'https://api.allorigins.win/get?url=' + encodeURIComponent(FEED_URL);
  var RSS2JSON  = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(FEED_URL) + '&count=' + MAX_POSTS;

  function stripHtml(h) { var t = document.createElement('div'); t.innerHTML = h; return t.textContent || t.innerText || ''; }
  function truncate(str, n) { if (str.length <= n) return str; return str.slice(0, str.lastIndexOf(' ', n)) + '…'; }

  function renderCard(item) {
    var card = document.createElement('a');
    card.className = 'blog-card';
    card.href = item.link; card.target = '_blank'; card.rel = 'noopener';

    var imgWrap = document.createElement('div');
    imgWrap.className = 'blog-img';
    if (item.img) {
      var img = document.createElement('img');
      img.src = item.img; img.alt = item.title; img.loading = 'lazy';
      imgWrap.appendChild(img);
    } else {
      imgWrap.innerHTML = '<div class="blog-img-placeholder">🦻</div>';
    }

    var body = document.createElement('div'); body.className = 'blog-body';
    var tag = document.createElement('p'); tag.className = 'blog-tag'; tag.textContent = item.category || 'Saúde Auditiva';
    var title = document.createElement('h3'); title.className = 'blog-title'; title.textContent = item.title;
    var excerpt = document.createElement('p'); excerpt.className = 'blog-excerpt'; excerpt.textContent = truncate(stripHtml(item.description || ''), 140);
    var link = document.createElement('a'); link.href = item.link; link.target = '_blank'; link.className = 'blog-link'; link.textContent = 'Leia o artigo completo →';

    body.appendChild(tag); body.appendChild(title); body.appendChild(excerpt); body.appendChild(link);
    card.appendChild(imgWrap); card.appendChild(body);
    return card;
  }

  function extractImg(item) {
    var enclosure = item.querySelector('enclosure');
    if (enclosure && /image/i.test(enclosure.getAttribute('type') || '')) return enclosure.getAttribute('url') || '';
    var selectors = ['media\\:content', 'content', 'media\\:thumbnail', 'thumbnail', 'wix\\:photo'];
    for (var s = 0; s < selectors.length; s++) {
      try { var el = item.querySelector(selectors[s]); if (el) { var u = el.getAttribute('url') || el.getAttribute('src') || el.textContent.trim(); if (u) return u; } } catch (e) {}
    }
    var descEl = item.querySelector('description');
    var rawd = descEl ? descEl.textContent : '';
    var mSrc = rawd.match(/src=["']([^"']+\.(jpg|jpeg|png|webp|gif)[^"']*)["']/i);
    if (mSrc) return mSrc[1];
    var mUrl = rawd.match(/https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|webp)/i);
    if (mUrl) return mUrl[0];
    var imgEl = item.querySelector('image');
    if (imgEl) { var urlEl = imgEl.querySelector('url'); if (urlEl) return urlEl.textContent.trim(); }
    return '';
  }

  function parseRss(xml) {
    var items = xml.querySelectorAll('item');
    var posts = [];
    items.forEach(function (item) {
      var catEl = item.querySelector('category');
      posts.push({
        title: item.querySelector('title') ? item.querySelector('title').textContent.trim() : '',
        link: item.querySelector('link') ? item.querySelector('link').textContent.trim() : '#',
        description: item.querySelector('description') ? item.querySelector('description').textContent : '',
        category: catEl ? catEl.textContent.trim() : 'Saúde Auditiva',
        img: extractImg(item)
      });
    });
    return posts.slice(0, MAX_POSTS);
  }

  function reObserve() {
    grid.querySelectorAll('.blog-card').forEach(function (el) {
      el.style.opacity = '0'; el.style.transform = 'translateY(18px)';
      el.style.transition = 'opacity .5s ease, transform .5s ease';
      obs.observe(el);
    });
  }

  function tryRss2Json() {
    return fetch(RSS2JSON).then(function (r) { return r.json(); }).then(function (data) {
      if (data.status !== 'ok' || !data.items || !data.items.length) throw new Error('rss2json vazio');
      grid.innerHTML = '';
      data.items.slice(0, MAX_POSTS).forEach(function (item) {
        grid.appendChild(renderCard({
          title: item.title || '',
          link: item.link || '#',
          description: item.description || item.content || '',
          category: (item.categories && item.categories.length) ? item.categories[0] : 'Saúde Auditiva',
          img: item.thumbnail || (item.enclosure && item.enclosure.link) || ''
        }));
      });
      reObserve();
    });
  }

  function tryAllOrigins() {
    return fetch(PROXY).then(function (r) { return r.json(); }).then(function (data) {
      if (!data.contents) throw new Error('allorigins vazio');
      var xml = new DOMParser().parseFromString(data.contents, 'text/xml');
      var posts = parseRss(xml);
      if (!posts.length) throw new Error('allorigins sem posts');
      grid.innerHTML = '';
      posts.forEach(function (p) { grid.appendChild(renderCard(p)); });
      reObserve();
    });
  }

  // Fallback estático com artigos reais do blog (caso os proxies falhem)
  function showStaticFallback() {
    var BLOG = 'https://blog.lubieaparelhosauditivos.com.br/post/';
    var POSTS = [
      { img: 'Rexton_Reach_Ric_14.webp', category: 'Sinais', title: 'Como saber se está na hora de usar um aparelho auditivo?', link: BLOG + 'como-saber-se-est%C3%A1-na-hora-de-usar-um-aparelho-auditivo', description: 'Os principais sinais de que a audição precisa de atenção e quando procurar uma avaliação.' },
      { img: 'rexton-reach.webp', category: 'Tecnologia', title: 'Como funcionam os aparelhos auditivos modernos?', link: BLOG + 'como-funcionam-os-aparelhos-auditivos-modernos', description: 'Entenda a tecnologia, a inteligência artificial e a conectividade dos aparelhos atuais.' },
      { img: 'saude-auditiva.webp', category: 'Curitiba', title: 'Onde fazer teste auditivo gratuito em Curitiba?', link: BLOG + 'onde-fazer-teste-auditivo-gratuito-em-curitiba-avalia%C3%A7%C3%A3o-com-aparelhos-auditivos-na-lubie', description: 'Avaliação auditiva sem custo e sem compromisso com a Fga. Jéssica, no São Francisco.' },
      { img: 'sobre-jessica.webp', category: 'Direitos / PCD', title: 'Perda auditiva dá direito a PCD? O que mudou com a nova lei', link: BLOG + 'perda-auditiva-d%C3%A1-direito-a-pcd-o-que-mudou-com-a-nova-lei', description: 'A Lei 14.768/2023 ampliou o reconhecimento da deficiência auditiva. Entenda os critérios.' },
      { img: 'Acessorios-Olivas.webp', category: 'Acessórios', title: 'Pilhas para aparelho auditivo: onde comprar em Curitiba', link: BLOG + 'pilhas-para-aparelho-auditivo-onde-comprar-em-curitiba', description: 'Tipos, tamanhos e onde encontrar pilhas e acessórios na Lubie.' },
      { img: 'aparelhos.webp', category: 'Tecnologia', title: 'Aparelho recarregável ou com pilha: qual escolher?', link: 'https://blog.lubieaparelhosauditivos.com.br/blog', description: 'Vantagens de cada tipo e como escolher de acordo com a sua rotina.' }
    ];
    grid.innerHTML = '';
    POSTS.slice(0, MAX_POSTS).forEach(function (p) { grid.appendChild(renderCard(p)); });
    reObserve();
  }

  tryRss2Json()
    .catch(function () { return tryAllOrigins(); })
    .catch(function () { showStaticFallback(); });
})();

/* ── GALERIA LIGHTBOX ── */
(function () {
  if (!document.querySelector('.galeria-item')) return;

  var lb = document.createElement('div');
  lb.className = 'galeria-lightbox';
  lb.innerHTML = '<button class="galeria-lightbox__close" aria-label="Fechar">&times;</button><img src="" alt="">';
  document.body.appendChild(lb);

  var lbImg = lb.querySelector('img');

  lb.querySelector('.galeria-lightbox__close').addEventListener('click', close);
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  function open(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt || '';
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  document.querySelectorAll('.galeria-item').forEach(function (item) {
    var img = item.querySelector('img');
    item.addEventListener('click', function () {
      open(img.src, img.alt);
    });
  });
})();
