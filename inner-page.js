const PAGE_GROUPS = {
  about: {
    title: '走进学院',
    pages: [
      ['about', '关于学院', './about.html'],
      ['org-structure', '组织架构', './org-structure.html'],
      ['faculty', '师资团队', './faculty.html'],
      ['dean-message', '院长寄语', './dean-message.html']
    ]
  },
  news: {
    title: '学院资讯',
    pages: [
      ['news', '新闻动态', './news.html'],
      ['college-updates', '学院动态', './college-updates.html']
    ]
  },
  education: {
    title: '学生培养',
    pages: [
      ['courses', '学院课程', './courses.html'],
      ['admissions', '招生信息', './admissions.html'],
      ['teaching-calendar', '教学日历', './teaching-calendar.html']
    ]
  },
  research: {
    title: '科研动态',
    pages: [
      ['academic-events', '学术活动', './academic-events.html'],
      ['research-results', '科研成果', './research-results.html']
    ]
  }
};

const PAGE_META = {
  'about': ['about', '关于学院', 'ABOUT THE SCHOOL', '学院介绍页面框架已建立，后续可补充学院定位、发展历程、办学理念与基本情况。'],
  'org-structure': ['about', '组织架构', 'ORGANIZATION', '组织架构页面框架已建立，后续可加入学院治理结构、行政架构图与相关职能说明。'],
  'faculty': ['about', '师资团队', 'FACULTY', '师资团队页面框架已建立，后续可加入教师分类、个人主页、研究方向与人物照片。'],
  'dean-message': ['about', '院长寄语', 'DEAN\'S MESSAGE', '院长寄语页面框架已建立，后续可加入院长照片、署名、寄语正文与相关介绍。'],
  'news': ['news', '新闻动态', 'NEWS', '新闻动态页面框架已建立，后续可接入新闻列表、封面图、日期、分类与详情页面。'],
  'college-updates': ['news', '学院动态', 'SCHOOL UPDATES', '学院动态页面框架已建立，后续可展示学院建设、合作交流、人才培养与日常动态。'],
  'courses': ['education', '学院课程', 'COURSES', '学院课程页面框架已建立，后续可按课程类别、学期、教师与课程层级组织内容。'],
  'admissions': ['education', '招生信息', 'ADMISSIONS', '招生信息页面框架已建立，后续可加入招生项目、申请要求、时间节点、材料清单与常见问题。'],
  'teaching-calendar': ['education', '教学日历', 'ACADEMIC CALENDAR', '教学日历页面框架已建立，后续可加入学期周次、课程安排、考试、放假与重要教学节点。'],
  'academic-events': ['research', '学术活动', 'ACADEMIC EVENTS', '学术活动页面框架已建立，后续可加入讲座、研讨会、Workshop、课程与活动详情。'],
  'research-results': ['research', '科研成果', 'RESEARCH OUTPUTS', '科研成果页面框架已建立，后续可按论文、项目、奖项、软件与代表成果组织内容。']
};

const pageKey = document.body.dataset.page;
const meta = PAGE_META[pageKey];

if (meta) {
  const [groupKey, title, enTitle, description] = meta;
  const group = PAGE_GROUPS[groupKey];
  document.title = `${title}｜数学与人工智能学院`;

  const hero = document.getElementById('innerHeroContent');
  if (hero) {
    hero.innerHTML = `
      <div class="breadcrumb"><a href="./">首页</a><span>/</span><span>${group.title}</span><span>/</span><span>${title}</span></div>
      <h1>${title}</h1>
      <p>${enTitle}</p>`;
  }

  const pageArea = document.getElementById('pageArchitecture');
  if (pageArea) {
    pageArea.innerHTML = `
      <aside class="page-sidebar">
        <h2>${group.title}</h2>
        <nav>
          ${group.pages.map(([key, label, href]) => `<a class="${key === pageKey ? 'active' : ''}" href="${href}">${label}</a>`).join('')}
        </nav>
      </aside>
      <section class="page-placeholder reveal">
        <p class="page-kicker">${enTitle} / 页面架构</p>
        <h2>${title}</h2>
        <p>${description}</p>
        <div class="placeholder-grid">
          <div class="placeholder-card"><span>01</span><strong>首屏与页面标题区</strong></div>
          <div class="placeholder-card"><span>02</span><strong>主要内容展示区</strong></div>
          <div class="placeholder-card"><span>03</span><strong>后续扩展内容区</strong></div>
        </div>
        <div class="page-note">当前仅完成页面路由、导航关系、侧栏与基础版式。具体内容和视觉细节等待下一步逐页设计。</div>
      </section>`;
  }
}
