const header = document.querySelector('.site-header');
const menuBtn = document.getElementById('menuBtn');
const drawer = document.getElementById('mobileDrawer');
const searchBtn = document.getElementById('searchBtn');
const searchPanel = document.getElementById('searchPanel');
const searchClose = document.getElementById('searchClose');
const siteSearch = document.getElementById('siteSearch');
const searchSubmit = document.getElementById('searchSubmit');
const searchHint = document.getElementById('searchHint');

const setDrawer = (open) => {
  menuBtn.classList.toggle('active', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  drawer.classList.toggle('open', open);
  drawer.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
};

menuBtn.addEventListener('click', () => setDrawer(!drawer.classList.contains('open')));
drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setDrawer(false)));

const setSearch = (open) => {
  searchPanel.classList.toggle('open', open);
  searchPanel.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) setTimeout(() => siteSearch.focus(), 150);
};
searchBtn.addEventListener('click', () => setSearch(true));
searchClose.addEventListener('click', () => setSearch(false));
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') { setSearch(false); setDrawer(false); }
});

const runSearch = () => {
  const q = siteSearch.value.trim().toLowerCase();
  if (!q) { searchHint.textContent = '请输入关键词，例如：人工智能、课程、活动、招生'; return; }
  const sections = [...document.querySelectorAll('main section')];
  const hit = sections.find(s => s.textContent.toLowerCase().includes(q));
  if (hit) {
    setSearch(false);
    hit.scrollIntoView({behavior:'smooth', block:'start'});
    searchHint.textContent = '可搜索：学院、人工智能、课程、活动、招生';
  } else {
    searchHint.textContent = `未找到“${siteSearch.value.trim()}”，请尝试其他关键词。`;
  }
};
searchSubmit.addEventListener('click', runSearch);
siteSearch.addEventListener('keydown', e => { if (e.key === 'Enter') runSearch(); });

document.getElementById('langBtn').addEventListener('click', () => {
  document.getElementById('langBtn').textContent = document.getElementById('langBtn').textContent === 'EN' ? '中' : 'EN';
});

window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 40), {passive:true});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, {threshold:0.12});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
setTimeout(() => document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible')), 1200);

const filterButtons = document.querySelectorAll('.news-tabs button');
filterButtons.forEach(btn => btn.addEventListener('click', () => {
  filterButtons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const filter = btn.dataset.filter;
  document.querySelectorAll('[data-category]').forEach(item => {
    item.classList.toggle('hidden', filter !== 'all' && item.dataset.category !== filter);
  });
}));
