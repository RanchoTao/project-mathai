const SITE_IDENTITY = {
  instituteName: '北京雁栖湖应用数学研究院',
  collegeEmail: 'mathai@bimsa.cn'
};

const normalizeSiteIdentity = () => {
  const replaceIdentity = (value = '') => value
    .replaceAll('北京应用数学研究院', SITE_IDENTITY.instituteName)
    .replaceAll('北京应用数学院', SITE_IDENTITY.instituteName)
    .replaceAll('administration@bimsa.cn', SITE_IDENTITY.collegeEmail);

  document.title = replaceIdentity(document.title);

  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute('content', replaceIdentity(description.getAttribute('content') || ''));

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach(node => {
    const updated = replaceIdentity(node.nodeValue || '');
    if (updated !== node.nodeValue) node.nodeValue = updated;
  });

  document.querySelectorAll('[href],[title],[aria-label],[alt]').forEach(el => {
    ['href', 'title', 'aria-label', 'alt'].forEach(attr => {
      if (!el.hasAttribute(attr)) return;
      const value = el.getAttribute(attr) || '';
      const updated = replaceIdentity(value);
      if (updated !== value) el.setAttribute(attr, updated);
    });
  });

  document.querySelectorAll('.brand-copy small,.footer-brand span').forEach(el => {
    el.textContent = SITE_IDENTITY.instituteName;
  });

  document.querySelectorAll('.footer-contact a[href^="mailto:"]').forEach(a => {
    if ((a.textContent || '').includes('administration@bimsa.cn') || a.getAttribute('href')?.includes('administration@bimsa.cn')) {
      a.textContent = SITE_IDENTITY.collegeEmail;
      a.href = `mailto:${SITE_IDENTITY.collegeEmail}`;
    }
  });
};

normalizeSiteIdentity();

const header = document.querySelector('.site-header');
const menuBtn = document.getElementById('menuBtn');
const drawer = document.getElementById('mobileDrawer');
const searchBtn = document.getElementById('searchBtn');
const searchPanel = document.getElementById('searchPanel');
const searchClose = document.getElementById('searchClose');
const siteSearch = document.getElementById('siteSearch');
const searchSubmit = document.getElementById('searchSubmit');
const searchHint = document.getElementById('searchHint');
const langBtn = document.getElementById('langBtn');

if (!document.querySelector('link[href$="nav.css"]')) {
  const navStyle = document.createElement('link');
  navStyle.rel = 'stylesheet';
  navStyle.href = './nav.css';
  document.head.appendChild(navStyle);
}

const NAV_GROUPS = [
  {
    key: 'about',
    no: '01',
    title: '走进学院',
    en: 'ABOUT',
    intro: '了解学院定位、治理结构、师资队伍与院长寄语。',
    href: './about.html',
    items: [
      ['关于学院', './about.html'],
      ['组织架构', './org-structure.html'],
      ['师资团队', './faculty.html'],
      ['院长寄语', './dean-message.html']
    ]
  },
  {
    key: 'news',
    no: '02',
    title: '学院资讯',
    en: 'NEWS',
    intro: '汇集学院新闻、建设进展与重要动态。',
    href: './news.html',
    items: [
      ['新闻动态', './news.html'],
      ['学院动态', './college-updates.html']
    ]
  },
  {
    key: 'education',
    no: '03',
    title: '学生培养',
    en: 'EDUCATION',
    intro: '围绕课程、招生与教学安排组织人才培养信息。',
    href: './courses.html',
    items: [
      ['学院课程', './courses.html'],
      ['招生信息', './admissions.html'],
      ['教学日历', './teaching-calendar.html']
    ]
  },
  {
    key: 'research',
    no: '04',
    title: '科研动态',
    en: 'RESEARCH',
    intro: '展示学术活动、研究进展与代表性科研成果。',
    href: './academic-events.html',
    items: [
      ['学术活动', './academic-events.html'],
      ['科研成果', './research-results.html']
    ]
  }
];

const currentPage = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
const isCurrent = (href) => href.replace('./', '').toLowerCase() === currentPage;

const desktopNav = document.querySelector('.desktop-nav');
if (desktopNav) {
  desktopNav.classList.add('nav-mega');
  desktopNav.innerHTML = NAV_GROUPS.map(group => {
    const active = group.items.some(([, href]) => isCurrent(href));
    const cols = group.items.length === 2 ? 'cols-2' : group.items.length === 3 ? 'cols-3' : '';
    return `
      <div class="nav-item${active ? ' is-active' : ''}">
        <a class="nav-trigger" href="${group.href}">${group.title}</a>
        <div class="mega-panel" aria-label="${group.title}扩展导航">
          <div class="mega-intro">
            <small>${group.en} / ${group.no}</small>
            <strong>${group.title}</strong>
            <p>${group.intro}</p>
          </div>
          <div class="mega-links ${cols}">
            ${group.items.map(([label, href]) => `<a href="${href}">${label}</a>`).join('')}
          </div>
        </div>
      </div>`;
  }).join('');
}

const mobileNav = drawer?.querySelector('nav');
if (mobileNav) {
  mobileNav.className = 'mobile-nav-groups';
  mobileNav.innerHTML = NAV_GROUPS.map(group => `
    <div class="mobile-nav-group">
      <a href="${group.href}"><span>${group.no}</span>${group.title}</a>
      <div class="mobile-subnav">
        ${group.items.map(([label, href]) => `<a href="${href}">${label}</a>`).join('')}
      </div>
    </div>`).join('');
}

const brand = document.querySelector('.brand');
if (brand) brand.setAttribute('href', './');

const setDrawer = (open) => {
  if (!menuBtn || !drawer) return;
  menuBtn.classList.toggle('active', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  drawer.classList.toggle('open', open);
  drawer.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
};

if (menuBtn && drawer) {
  menuBtn.addEventListener('click', () => setDrawer(!drawer.classList.contains('open')));
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setDrawer(false)));
}

const setSearch = (open) => {
  if (!searchPanel) return;
  searchPanel.classList.toggle('open', open);
  searchPanel.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
  if (open && siteSearch) setTimeout(() => siteSearch.focus(), 150);
};

if (searchBtn) searchBtn.addEventListener('click', () => setSearch(true));
if (searchClose) searchClose.addEventListener('click', () => setSearch(false));
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    setSearch(false);
    setDrawer(false);
  }
});

const runSearch = () => {
  if (!siteSearch || !searchHint) return;
  const q = siteSearch.value.trim().toLowerCase();
  if (!q) {
    searchHint.textContent = '请输入关键词，例如：学院、课程、活动、招生';
    return;
  }
  const sections = [...document.querySelectorAll('main section')];
  const hit = sections.find(s => s.textContent.toLowerCase().includes(q));
  if (hit) {
    setSearch(false);
    hit.scrollIntoView({ behavior: 'smooth', block: 'start' });
    searchHint.textContent = '可搜索：学院、课程、活动、招生';
  } else {
    searchHint.textContent = `未找到“${siteSearch.value.trim()}”，请尝试其他关键词。`;
  }
};

if (searchSubmit) searchSubmit.addEventListener('click', runSearch);
if (siteSearch) siteSearch.addEventListener('keydown', e => { if (e.key === 'Enter') runSearch(); });

if (langBtn) {
  langBtn.addEventListener('click', () => {
    langBtn.textContent = langBtn.textContent === 'EN' ? '中' : 'EN';
  });
}

const updateHeader = () => {
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 40);
};
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  setTimeout(() => document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible')), 1200);
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
}

const filterButtons = document.querySelectorAll('.news-tabs button');
filterButtons.forEach(btn => btn.addEventListener('click', () => {
  filterButtons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const filter = btn.dataset.filter;
  document.querySelectorAll('[data-category]').forEach(item => {
    item.classList.toggle('hidden', filter !== 'all' && item.dataset.category !== filter);
  });
}));
