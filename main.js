/* 数学与人工智能学院 · interactions (no dependencies) */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lockScroll = (on) => { document.documentElement.style.overflow = on ? 'hidden' : ''; };

  /* ---------- Image fallback: never show a broken image ---------- */
  const glyphs = ['Σ', '∂', '∫', 'π', '∞'];
  const fallback = (img, k) => {
    if (img.dataset.failed) return;
    img.dataset.failed = '1';
    const host = img.closest('.hero-slide, .news-slide, .person-photo');
    if (host && !host.querySelector('.cover')) {
      const c = document.createElement('i');
      c.className = `cover ${k % 2 ? 'deep' : ''}`;
      c.dataset.glyph = glyphs[k % glyphs.length];
      c.setAttribute('aria-hidden', 'true');
      if (host.classList.contains('hero-slide')) c.style.cssText = 'position:absolute;inset:0';
      img.replaceWith(c);
    } else {
      img.remove();
    }
  };
  $$('img').forEach((img, k) => {
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) fallback(img, k);
    img.addEventListener('error', () => fallback(img, k));
  });

  /* ---------- Header: solid after hero, tucks away on scroll down ---------- */
  const header = $('.site-header');
  const hero = $('#hero');
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    if (header && !header.classList.contains('solid-lock')) {
      const threshold = hero ? Math.max(80, hero.offsetHeight - 160) : 10;
      header.classList.toggle('scrolled', y > threshold || !hero);
      const megaOpen = header.matches(':hover') || header.contains(document.activeElement);
      header.classList.toggle('tucked', y > 600 && y > lastY + 4 && !megaOpen && !document.body.classList.contains('drawer-open'));
      if (y < lastY - 4) header.classList.remove('tucked');
    }
    lastY = y;
    // back-to-top progress ring
    const max = document.documentElement.scrollHeight - innerHeight;
    if (toTop) {
      toTop.classList.toggle('show', y > 700);
      if (ringBar) ringBar.style.strokeDashoffset = String(151 * (1 - Math.min(1, y / Math.max(1, max))));
    }
  };
  const toTop = $('#toTop');
  const ringBar = toTop && $('.bar', toTop);
  if (toTop) toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile drawer with accordion groups ---------- */
  const menuBtn = $('#menuBtn');
  const drawer = $('#mobileDrawer');
  const setDrawer = (open) => {
    if (!menuBtn || !drawer) return;
    menuBtn.classList.toggle('active', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    drawer.classList.toggle('open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    header?.classList.toggle('drawer-open', open);
    document.body.classList.toggle('drawer-open', open);
    lockScroll(open);
  };
  menuBtn?.addEventListener('click', () => setDrawer(!drawer.classList.contains('open')));
  $$('.mobile-nav-head').forEach(btn => btn.addEventListener('click', () => {
    const group = btn.parentElement;
    const open = !group.classList.contains('open');
    group.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  }));
  drawer && $$('a', drawer).forEach(a => a.addEventListener('click', () => setDrawer(false)));
  addEventListener('resize', () => { if (innerWidth > 1024 && drawer?.classList.contains('open')) setDrawer(false); });

  /* ---------- Search: site index + current page sections ---------- */
  const SITE_INDEX = [
    ['首页', './', '学院首页 数学 人工智能'],
    ...$$('.desktop-nav .nav-item').flatMap(item => {
      const group = $('.nav-trigger', item)?.textContent.trim() || '';
      const intro = $('.mega-intro p', item)?.textContent || '';
      return $$('.mega-links a', item).map(a => [a.textContent.trim(), a.getAttribute('href'), `${group} ${intro}`]);
    })
  ];
  const searchPanel = $('#searchPanel');
  const siteSearch = $('#siteSearch');
  const searchHint = $('#searchHint');
  const suggest = $('.search-suggest');
  let results;
  let returnFocus = null;
  const setSearch = (open, query = '') => {
    if (!searchPanel) return;
    if (open) returnFocus = document.activeElement;
    searchPanel.classList.toggle('open', open);
    searchPanel.setAttribute('aria-hidden', String(!open));
    lockScroll(open);
    if (open) {
      siteSearch.value = query;
      setTimeout(() => siteSearch.focus(), 120);
      if (query) runSearch();
    } else {
      returnFocus?.focus?.();
    }
  };
  const render = (items) => {
    if (!results) { results = document.createElement('div'); results.className = 'search-results'; suggest.after(results); }
    results.innerHTML = items.map(([label, href, note]) => `<a href="${href}"><strong>${label}</strong><span>${note}</span></a>`).join('');
  };
  const runSearch = () => {
    const raw = siteSearch.value.trim();
    const q = raw.toLowerCase();
    render([]);
    if (!q) { searchHint.textContent = '热门搜索'; suggest.hidden = false; return; }
    suggest.hidden = true;
    const hits = SITE_INDEX
      .filter(([label, , kw]) => `${label} ${kw}`.toLowerCase().includes(q))
      .sort((a, b) => Number(b[0].toLowerCase().includes(q)) - Number(a[0].toLowerCase().includes(q)))
      .map(([label, href, kw]) => [label, href, kw.split(' ')[0]]);
    const section = $$('main section[id]:not(#hero)').find(s => s.textContent.toLowerCase().includes(q));
    if (section) hits.unshift(['本页相关内容', `#${section.id}`, '跳转到当前页面中的匹配位置']);
    if (!hits.length) { searchHint.textContent = `未找到“${raw}”，请尝试其他关键词。`; return; }
    searchHint.textContent = `找到 ${hits.length} 个相关结果`;
    render(hits);
    $$('a[href^="#"]', results).forEach(a => a.addEventListener('click', () => setSearch(false)));
  };
  $('#searchBtn')?.addEventListener('click', () => setSearch(true));
  $('#searchClose')?.addEventListener('click', () => setSearch(false));
  $('#searchSubmit')?.addEventListener('click', runSearch);
  siteSearch?.addEventListener('keydown', e => { if (e.key === 'Enter') runSearch(); });
  siteSearch?.addEventListener('input', () => { if (!siteSearch.value.trim()) runSearch(); });
  suggest && $$('button', suggest).forEach(b => b.addEventListener('click', () => { siteSearch.value = b.textContent; runSearch(); }));
  $('#quickForm')?.addEventListener('submit', e => { e.preventDefault(); setSearch(true, $('#quickInput').value.trim()); });
  addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (searchPanel?.classList.contains('open')) setSearch(false); setDrawer(false); }
    if (e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); setSearch(true); }
  });

  /* ---------- Hero carousel ---------- */
  if (hero) {
    const slides = $$('.hero-slide', hero);
    const texts = $$('.hero-text', hero);
    const dots = $$('.hero-dot', hero);
    const now = $('#heroNow');
    const INTERVAL = 6500;
    hero.style.setProperty('--hero-interval', `${INTERVAL}ms`);
    let i = 0, timer = null, paused = false;
    const go = (n) => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => { s.classList.toggle('is-active', k === i); s.setAttribute('aria-hidden', String(k !== i)); });
      texts.forEach((t, k) => t.classList.toggle('is-active', k === i));
      dots.forEach((d, k) => {
        d.classList.remove('is-active'); void d.offsetWidth; // restart progress animation
        d.classList.toggle('is-active', k === i); d.setAttribute('aria-selected', String(k === i));
      });
      if (now) now.textContent = String(i + 1).padStart(2, '0');
      schedule();
    };
    const schedule = () => { clearTimeout(timer); if (!paused && !reduceMotion) timer = setTimeout(() => go(i + 1), INTERVAL); };
    const pause = (p) => { paused = p; hero.classList.toggle('paused', p); p ? clearTimeout(timer) : schedule(); };
    dots.forEach((d, k) => d.addEventListener('click', () => go(k)));
    $$('.hero-arrow', hero).forEach(b => b.addEventListener('click', () => go(i + Number(b.dataset.dir))));
    $('.hero-copy', hero).addEventListener('mouseenter', () => pause(true));
    $('.hero-copy', hero).addEventListener('mouseleave', () => pause(false));
    hero.addEventListener('focusin', () => pause(true));
    hero.addEventListener('focusout', () => pause(false));
    document.addEventListener('visibilitychange', () => pause(document.hidden));
    hero.addEventListener('keydown', e => { if (e.key === 'ArrowRight') go(i + 1); if (e.key === 'ArrowLeft') go(i - 1); });
    let sx = null;
    hero.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', e => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1)); sx = null; });
    if (reduceMotion) hero.classList.add('paused');
    schedule();
  }

  /* ---------- News: stage + list switcher, category tabs ---------- */
  const stage = $('#newsStage');
  if (stage) {
    const slides = $$('.news-slide', stage);
    const items = $$('.news-item');
    const dotsBox = $('.news-stage-dots', stage);
    dotsBox.innerHTML = slides.map(() => '<button type="button" tabindex="-1"></button>').join('');
    const dots = $$('button', dotsBox);
    let cur = 0, t = null, hold = false;
    const show = (n) => {
      cur = n;
      slides.forEach((s, k) => s.classList.toggle('is-active', k === n));
      dots.forEach((d, k) => d.classList.toggle('is-active', k === n));
      items.forEach(it => it.classList.toggle('is-active', Number(it.dataset.slide) === n));
    };
    const visible = () => items.filter(it => !it.classList.contains('hidden')).map(it => Number(it.dataset.slide));
    const next = () => { const v = visible(); const p = v.indexOf(cur); show(v[(p + 1) % v.length] ?? 0); };
    const loop = () => { clearInterval(t); if (!reduceMotion) t = setInterval(() => { if (!hold) next(); }, 5000); };
    items.forEach(it => {
      it.addEventListener('mouseenter', () => { hold = true; show(Number(it.dataset.slide)); });
      it.addEventListener('focus', () => { hold = true; show(Number(it.dataset.slide)); });
      it.addEventListener('mouseleave', () => { hold = false; });
      it.addEventListener('blur', () => { hold = false; });
    });
    stage.addEventListener('mouseenter', () => { hold = true; });
    stage.addEventListener('mouseleave', () => { hold = false; });
    dots.forEach((d, k) => d.addEventListener('click', () => show(k)));
    $$('.news-tabs button').forEach(btn => btn.addEventListener('click', () => {
      $$('.news-tabs button').forEach(b => { b.classList.toggle('active', b === btn); b.setAttribute('aria-selected', String(b === btn)); });
      const f = btn.dataset.filter;
      items.forEach(it => it.classList.toggle('hidden', f !== 'all' && it.dataset.category !== f));
      show(visible()[0] ?? 0);
    }));
    show(0); loop();
  }

  /* ---------- Draggable horizontal rails (events, faculty) ---------- */
  const makeRail = (rail, { arrows = [], bar = null } = {}) => {
    if (!rail) return;
    const step = () => { const c = rail.firstElementChild; return c ? c.getBoundingClientRect().width + 24 : 300; };
    const update = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      arrows.forEach(a => { a.disabled = Number(a.dataset.dir) < 0 ? rail.scrollLeft <= 2 : rail.scrollLeft >= max - 2; });
      if (bar) {
        const frac = rail.clientWidth / Math.max(rail.scrollWidth, 1);
        bar.style.width = `${Math.min(100, frac * 100)}%`;
        bar.style.transform = `translateX(${max > 0 ? (rail.scrollLeft / max) * ((1 - frac) / frac) * 100 : 0}%)`;
      }
    };
    arrows.forEach(a => a.addEventListener('click', () => rail.scrollBy({ left: Number(a.dataset.dir) * step(), behavior: 'smooth' })));
    rail.addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    rail.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); rail.scrollBy({ left: step(), behavior: 'smooth' }); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); rail.scrollBy({ left: -step(), behavior: 'smooth' }); }
    });
    // mouse drag (touch uses native scrolling)
    let down = false, startX = 0, startLeft = 0, moved = false;
    rail.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; startX = e.clientX; startLeft = rail.scrollLeft; });
    addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 5) { moved = true; rail.classList.add('dragging'); }
      rail.scrollLeft = startLeft - dx;
    });
    addEventListener('pointerup', () => { if (!down) return; down = false; setTimeout(() => rail.classList.remove('dragging'), 0); });
    rail.addEventListener('click', e => { if (moved) { e.preventDefault(); moved = false; } }, true);
    update();
    return update;
  };
  const eventRail = $('#eventRail');
  const updateEvents = makeRail(eventRail, { arrows: $$('.rail-arrow'), bar: $('#railBar') });
  makeRail($('.faculty-rail'));
  $$('.event-tabs button').forEach(btn => btn.addEventListener('click', () => {
    $$('.event-tabs button').forEach(b => { b.classList.toggle('active', b === btn); b.setAttribute('aria-selected', String(b === btn)); });
    const type = btn.dataset.type;
    $$('.poster', eventRail).forEach(p => p.classList.toggle('hidden', type !== 'all' && p.dataset.type !== type && p.dataset.type !== 'all'));
    eventRail.scrollTo({ left: 0 });
    updateEvents?.();
  }));

  /* ---------- Research tabs (click + arrow keys, auto-advance until touched) ---------- */
  const rTabs = $$('.r-tab');
  if (rTabs.length) {
    const panels = $$('.r-panel');
    let r = 0, auto = !reduceMotion, rt = null;
    const select = (n, focus = false) => {
      r = (n + rTabs.length) % rTabs.length;
      rTabs.forEach((t, k) => { t.classList.toggle('active', k === r); t.setAttribute('aria-selected', String(k === r)); t.tabIndex = k === r ? 0 : -1; });
      panels.forEach((p, k) => p.classList.toggle('active', k === r));
      if (focus) rTabs[r].focus();
    };
    rTabs.forEach((t, k) => {
      t.addEventListener('click', () => { auto = false; select(k); });
      t.addEventListener('keydown', e => {
        if (['ArrowDown', 'ArrowRight'].includes(e.key)) { e.preventDefault(); auto = false; select(r + 1, true); }
        if (['ArrowUp', 'ArrowLeft'].includes(e.key)) { e.preventDefault(); auto = false; select(r - 1, true); }
      });
    });
    const stageEl = $('.r-stage');
    const io = new IntersectionObserver(([en]) => {
      clearInterval(rt);
      if (en.isIntersecting && auto) rt = setInterval(() => auto ? select(r + 1) : clearInterval(rt), 5200);
    }, { threshold: .4 });
    stageEl && io.observe(stageEl);
    select(0);
  }

  /* ---------- Reveal on scroll ---------- */
  if ('IntersectionObserver' in window && !reduceMotion) {
    const ob = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('visible'); ob.unobserve(en.target); }
    }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach(el => ob.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('visible'));
  }
})();
