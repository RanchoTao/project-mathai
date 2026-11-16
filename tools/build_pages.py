#!/usr/bin/env python3
"""Generate every HTML page from shared partials.

    python3 tools/build_pages.py

Header, navigation, search, mobile drawer and footer live here once, so all
pages stay identical. Page bodies:
  - homepage            -> tools/home.html
  - organization page   -> tools/org-structure.main.html
  - other inner pages   -> PAGE_META below (structured placeholders)
Edit those sources, then re-run this script. Do not hand-edit the generated
*.html files in the repository root.
"""
from pathlib import Path
import html
import math
import random

ROOT = Path(__file__).resolve().parent.parent
TOOLS = ROOT / "tools"

SCHOOL = "数学与人工智能学院"
INSTITUTE = "北京雁栖湖应用数学研究院"
EMAIL = "mathai@bimsa.cn"
PHONE = "010-60661855"
ADDRESS = "北京市怀柔区河防口村 544 号"

NAV = [
    {"key": "about", "no": "01", "title": "走进学院", "en": "About",
     "intro": "了解学院定位、治理结构、师资队伍与院长寄语。",
     "items": [("about", "关于学院"), ("org-structure", "组织架构"), ("faculty", "师资团队"), ("dean-message", "院长寄语")],
     "feature": ("ORGANIZATION", "学院组织架构与任职教师", "org-structure", "Σ")},
    {"key": "news", "no": "02", "title": "学院资讯", "en": "News",
     "intro": "汇集学院新闻、建设进展与重要动态。",
     "items": [("news", "新闻动态"), ("college-updates", "学院动态")],
     "feature": ("NEWS", "学院新闻与建设动态", "news", "∂")},
    {"key": "education", "no": "03", "title": "学生培养", "en": "Education",
     "intro": "围绕课程、招生与教学安排组织人才培养信息。",
     "items": [("courses", "学院课程"), ("admissions", "招生信息"), ("teaching-calendar", "教学日历")],
     "feature": ("ADMISSIONS", "招生项目与申请信息", "admissions", "∞")},
    {"key": "research", "no": "04", "title": "科研动态", "en": "Research",
     "intro": "展示学术活动、研究进展与代表性科研成果。",
     "items": [("academic-events", "学术活动"), ("research-results", "科研成果")],
     "feature": ("EVENTS", "讲座、研讨会与专题课程", "academic-events", "π")},
]

PAGE_META = {
    "about": ("About the School", "学院介绍页面将呈现学院定位、发展历程、办学理念与基本情况。",
              ["学院定位与使命", "发展历程", "办学理念与特色"]),
    "faculty": ("Faculty", "师资团队页面将按教师类别呈现个人主页、研究方向与代表性成果。",
                ["教师分类与筛选", "教师卡片与研究方向", "个人主页链接"]),
    "dean-message": ("Dean's Message", "院长寄语页面将呈现院长照片、署名与寄语正文。",
                     ["院长照片与署名", "寄语正文", "相关链接"]),
    "news": ("News", "新闻动态页面将接入新闻列表、封面图、日期、分类与详情页面。",
             ["头条新闻轮播", "分类新闻列表", "分页与归档"]),
    "college-updates": ("School Updates", "学院动态页面将展示学院建设、合作交流、人才培养与日常动态。",
                        ["动态时间线", "合作与交流", "图片集"]),
    "courses": ("Courses", "学院课程页面将按课程类别、学期、教师与课程层级组织内容。",
                ["课程体系图", "按学期筛选", "课程详情与大纲"]),
    "admissions": ("Admissions", "招生信息页面将包含招生项目、申请要求、时间节点、材料清单与常见问题。",
                   ["招生项目", "申请时间线", "常见问题"]),
    "teaching-calendar": ("Academic Calendar", "教学日历页面将呈现学期周次、课程安排、考试、放假与重要教学节点。",
                          ["学期周历", "考试与假期", "重要节点提醒"]),
    "academic-events": ("Academic Events", "学术活动页面将汇集讲座、研讨会、Workshop 与专题课程。",
                        ["活动海报墙", "按类型与月份筛选", "活动详情与报名"]),
    "research-results": ("Research", "科研成果页面将按论文、项目、奖项、软件与代表成果组织内容。",
                         ["代表性成果", "论文与项目列表", "研究方向索引"]),
    "org-structure": ("Organization", "以学院治理与教学协作为主线展示核心岗位关系，并将任职教师团队单独分区呈现。", []),
}

ICONS = """<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<symbol id="i-search" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></symbol>
<symbol id="i-down" viewBox="0 0 10 10"><path d="M1.5 3.5 5 7l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.4"/></symbol>
<symbol id="i-left" viewBox="0 0 16 16"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></symbol>
<symbol id="i-right" viewBox="0 0 16 16"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></symbol>
<symbol id="i-up" viewBox="0 0 16 16"><path d="M3 10l5-5 5 5" fill="none" stroke="currentColor" stroke-width="1.6"/></symbol>
<symbol id="i-pin" viewBox="0 0 16 16"><path d="M8 15s5-4.6 5-8.5A5 5 0 0 0 3 6.5C3 10.4 8 15 8 15Z" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="6.5" r="1.8" fill="none" stroke="currentColor" stroke-width="1.3"/></symbol>
<symbol id="i-clock" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.3" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M8 4.5V8l2.4 1.6" fill="none" stroke="currentColor" stroke-width="1.3"/></symbol>
<symbol id="i-mail" viewBox="0 0 16 16"><rect x="1.8" y="3.3" width="12.4" height="9.4" rx="1" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="m2.3 4 5.7 4.6L13.7 4" fill="none" stroke="currentColor" stroke-width="1.3"/></symbol>
<symbol id="i-phone" viewBox="0 0 16 16"><path d="M5.2 2.2 3 2.6c-.6 4.9 4.6 10.9 10.4 10.4l.4-2.2-2.9-1.4-1.3 1.3C8 10 6 8 5.3 6.5L6.6 5.2Z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></symbol>
</defs></svg>"""


def esc(s):
    return html.escape(s, quote=True)


def page_title(key):
    for g in NAV:
        for k, label in g["items"]:
            if k == key:
                return g, label
    return None, None


def header(current=None, solid=False):
    nav_html = []
    for g in NAV:
        active = " is-active" if current in [k for k, _ in g["items"]] else ""
        links = "".join(f'<a href="./{k}.html">{esc(l)}</a>' for k, l in g["items"])
        fen, ftitle, fkey, glyph = g["feature"]
        nav_html.append(f'''
      <div class="nav-item{active}">
        <a class="nav-trigger" href="./{g["items"][0][0]}.html">{g["title"]}<svg aria-hidden="true"><use href="#i-down"/></svg></a>
        <div class="mega-panel" role="group" aria-label="{g["title"]}">
          <div class="mega-inner">
            <div class="mega-intro"><small>{g["en"].upper()} / {g["no"]}</small><strong>{g["title"]}</strong><p>{g["intro"]}</p></div>
            <div class="mega-links">{links}</div>
            <a class="mega-feature" href="./{fkey}.html"><i class="cover deep" data-glyph="{glyph}"></i><span>{fen}</span><b>{ftitle}</b></a>
          </div>
        </div>
      </div>''')
    drawer = []
    for g in NAV:
        links = "".join(f'<a href="./{k}.html">{esc(l)}</a>' for k, l in g["items"])
        is_open = " open" if current in [k for k, _ in g["items"]] else ""
        drawer.append(f'''
      <div class="mobile-nav-group{is_open}">
        <button class="mobile-nav-head" type="button" aria-expanded="{str(bool(is_open)).lower()}"><span>{g["no"]}</span>{g["title"]}<i aria-hidden="true"></i></button>
        <div class="mobile-subnav"><div>{links}</div></div>
      </div>''')
    cls = "site-header solid" if solid else "site-header"
    return f'''{ICONS}
  <a class="skip-link" href="#main">跳到主要内容</a>
  <div class="brand-bar" aria-hidden="true"></div>
  <header class="{cls}" id="top">
    <a class="brand" href="./" aria-label="{SCHOOL}首页">
      <img src="./assets/mark.svg" alt="" width="40" height="56" />
      <span class="brand-copy"><strong>{SCHOOL}</strong><small>{INSTITUTE}</small></span>
    </a>
    <div class="header-right">
      <nav class="utility" aria-label="常用链接">
        <a href="https://www.bimsa.cn/" target="_blank" rel="noreferrer">研究院官网</a>
        <a href="./admissions.html">招生信息</a>
        <a href="./academic-events.html">学术活动</a>
        <a href="mailto:{EMAIL}">联系我们</a>
      </nav>
      <div class="header-row">
        <nav class="desktop-nav" aria-label="主导航">{"".join(nav_html)}
        </nav>
        <div class="header-actions">
          <button class="search-btn" id="searchBtn" type="button" aria-label="打开搜索"><svg aria-hidden="true"><use href="#i-search"/></svg></button>
          <button class="menu-btn" id="menuBtn" type="button" aria-label="打开菜单" aria-expanded="false" aria-controls="mobileDrawer"><span></span><span></span></button>
        </div>
      </div>
    </div>
  </header>

  <div class="search-panel" id="searchPanel" aria-hidden="true" role="dialog" aria-label="站内搜索">
    <button class="search-close" id="searchClose" type="button" aria-label="关闭搜索">×</button>
    <div class="search-inner">
      <p>SEARCH</p>
      <label for="siteSearch">站内搜索</label>
      <div class="search-line"><input id="siteSearch" type="search" placeholder="输入关键词，如：课程、招生、学术活动" autocomplete="off" /><button type="button" id="searchSubmit">搜索</button></div>
      <small id="searchHint">热门搜索</small>
      <div class="search-suggest">
        <button type="button">招生</button><button type="button">课程</button><button type="button">学术活动</button><button type="button">组织架构</button><button type="button">科研成果</button>
      </div>
    </div>
  </div>

  <aside class="mobile-drawer" id="mobileDrawer" aria-hidden="true">
    <nav aria-label="移动端主导航">{"".join(drawer)}
    </nav>
    <div class="mobile-utility"><a href="https://www.bimsa.cn/" target="_blank" rel="noreferrer">研究院官网</a><a href="mailto:{EMAIL}">{EMAIL}</a></div>
  </aside>'''


def footer_art():
    """Yanqi Lake: layered mountain ridges + lake ripples, gold line art."""
    rnd = random.Random(7)
    W, H = 1600, 220

    def ridge(base, amp, freq, phase, step=16):
        pts = []
        for x in range(0, W + step, step):
            y = base - amp * (0.55 * math.sin(x / freq + phase) + 0.3 * math.sin(x / (freq * .43) + phase * 2.1) + 0.15 * math.sin(x / (freq * .17) + phase * 3.3))
            pts.append((x, round(y, 1)))
        d = f"M{pts[0][0]} {pts[0][1]}" + "".join(f" L{x} {y}" for x, y in pts[1:])
        return d

    paths = [
        (ridge(118, 46, 210, .4), .55),
        (ridge(138, 34, 160, 1.9), .8),
        (ridge(156, 22, 120, 3.1), 1),
    ]
    out = [f'<svg class="footer-art" viewBox="0 0 {W} {H}" preserveAspectRatio="none" aria-hidden="true" focusable="false">']
    out.append('<circle class="sun" cx="1180" cy="70" r="26" fill="none" stroke="currentColor" stroke-width="1" opacity=".55"/>')
    for d, op in paths:
        out.append(f'<path d="{d}" fill="none" stroke="currentColor" stroke-width="1.2" opacity="{op}"/>')
    # lake ripples
    for i in range(7):
        y = 178 + i * 6
        segs = []
        x = rnd.randint(0, 80)
        while x < W:
            ln = rnd.randint(40, 180)
            segs.append(f"M{x} {y} H{min(W, x + ln)}")
            x += ln + rnd.randint(30, 120)
        out.append(f'<path d="{" ".join(segs)}" stroke="currentColor" stroke-width="1" opacity="{.5 - i * .055:.2f}"/>')
    out.append(f'<rect x="0" y="{H-14}" width="{W}" height="14" fill="#071635"/>')
    out.append('</svg>')
    return "".join(out)


def footer():
    cols = []
    for g in NAV:
        links = "".join(f'<a href="./{k}.html">{esc(l)}</a>' for k, l in g["items"])
        cols.append(f'<div class="footer-col"><strong>{g["title"]}</strong>{links}</div>')
    return f'''
  <footer class="site-footer" id="contact">
    {footer_art()}
    <div class="wrap footer-main">
      <div>
        <div class="footer-brand"><img src="./assets/mark.svg" alt="" width="36" height="50" /><div><strong>{SCHOOL}</strong><span>{INSTITUTE}</span></div></div>
        <div class="footer-contact">
          <p><svg aria-hidden="true"><use href="#i-pin"/></svg>{ADDRESS}</p>
          <p><svg aria-hidden="true"><use href="#i-phone"/></svg><a href="tel:+861060661855">{PHONE}</a></p>
          <p><svg aria-hidden="true"><use href="#i-mail"/></svg><a href="mailto:{EMAIL}">{EMAIL}</a></p>
        </div>
      </div>
      {"".join(cols)}
    </div>
    <div class="wrap"><div class="footer-bottom">
      <span>© 2026 School of Mathematics &amp; Artificial Intelligence, BIMSA</span>
      <span>前端原型 · 内容待学院核验后正式发布</span>
    </div></div>
  </footer>

  <button class="to-top" id="toTop" type="button" aria-label="返回顶部">
    <svg class="ring" viewBox="0 0 52 52" aria-hidden="true"><circle class="track" cx="26" cy="26" r="24"/><circle class="bar" cx="26" cy="26" r="24"/></svg>
    <svg class="chev" aria-hidden="true"><use href="#i-up"/></svg>
  </button>'''


def doc(title, description, body_class, body, extra_css=(), current=None, solid=False):
    css = "".join(f'\n  <link rel="stylesheet" href="./{c}" />' for c in ("styles.css", "nav.css", *extra_css))
    return f'''<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="{esc(description)}" />
  <meta name="theme-color" content="#0c2350" />
  <title>{esc(title)}</title>
  <link rel="icon" href="./assets/mark.svg" type="image/svg+xml" />{css}
  <noscript><style>.reveal{{opacity:1!important;transform:none!important}}</style></noscript>
</head>
<body class="{body_class}">
{header(current, solid)}
{body}
{footer()}

  <script src="./main.js"></script>
</body>
</html>
'''


def inner_page(key):
    group, label = page_title(key)
    en, lede, blocks = PAGE_META[key]
    cur = ' aria-current="page"'
    side = "".join(
        f'<a class="{"active" if k == key else ""}" href="./{k}.html"{cur if k == key else ""}>{esc(l)}</a>'
        for k, l in group["items"])
    idx = [k for k, _ in group["items"]].index(key)
    items = group["items"]
    prev_link = f'<a href="./{items[idx-1][0]}.html"><small>上一页</small><b>{items[idx-1][1]}</b></a>' if idx > 0 else ""
    next_link = f'<a href="./{items[idx+1][0]}.html"><small>下一页</small><b>{items[idx+1][1]}</b></a>' if idx < len(items) - 1 else ""

    if key == "org-structure":
        content = (TOOLS / "org-structure.main.html").read_text()
    else:
        cards = "".join(f'<div class="placeholder-card"><span>{i+1:02d}</span><strong>{esc(b)}</strong></div>' for i, b in enumerate(blocks))
        content = f'''
          <p class="page-kicker">{esc(en)}</p>
          <h2 class="page-title">{esc(label)}</h2>
          <div class="page-rule"></div>
          <p>{esc(lede)}</p>
          <div class="placeholder-grid">{cards}</div>
          <div class="page-note">本页已完成路由、导航与版式框架，正文、图片与数据待学院提供后填充。</div>'''

    body = f'''
  <main id="main">
    <section class="inner-hero" data-en="{esc(en)}">
      <div class="wrap">
        <nav class="breadcrumb" aria-label="面包屑"><a href="./">首页</a><span aria-hidden="true">/</span><a href="./{items[0][0]}.html">{group["title"]}</a><span aria-hidden="true">/</span><span aria-current="page">{esc(label)}</span></nav>
        <h1>{esc(label)}</h1>
        <div class="en">{esc(en)}</div>
      </div>
    </section>
    <div class="page-shell">
      <div class="page-architecture">
        <aside class="page-sidebar">
          <h2><small>{group["en"].upper()}</small>{group["title"]}</h2>
          <nav aria-label="{group["title"]}栏目">{side}</nav>
        </aside>
        <article class="page-content reveal">{content}
          <nav class="page-pager" aria-label="栏目翻页">{prev_link}{next_link}</nav>
        </article>
      </div>
    </div>
  </main>'''
    extra = ("org-structure.css",) if key == "org-structure" else ()
    return doc(f"{label}｜{SCHOOL}", f"{INSTITUTE} {SCHOOL} {label}", f"inner-page page-{key}", body,
               extra_css=extra, current=key, solid=True)



# ---------------------------------------------------------------- generated art
def _svg(w, h, inner, cls=""):
    return f'<svg viewBox="0 0 {w} {h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"{cls}>{inner}</svg>'


def art_hero():
    rnd = random.Random(11)
    W, H = 1600, 900
    pts = [(rnd.uniform(560, 1600), rnd.uniform(40, 860)) for _ in range(70)]
    lines = []
    for i, (x1, y1) in enumerate(pts):
        near = sorted(pts, key=lambda p: (p[0]-x1)**2 + (p[1]-y1)**2)[1:4]
        for x2, y2 in near:
            lines.append(f'M{x1:.0f} {y1:.0f}L{x2:.0f} {y2:.0f}')
    dots = "".join(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{rnd.choice([1.6,2.2,3])}"/>' for x, y in pts)
    rings = "".join(f'<circle cx="1180" cy="420" r="{r}" fill="none"/>' for r in (120, 200, 290, 390, 500))
    waves = []
    for k in range(9):
        d = "M" + " L".join(f"{x} {700 + 26*k + 38*math.sin(x/170 + k*.55):.1f}" for x in range(0, W+20, 20))
        waves.append(f'<path d="{d}"/>')
    inner = (f'<g stroke="#d8bd8a" stroke-opacity=".16" fill="none" stroke-width="1">{rings}</g>'
             f'<g stroke="#9cc0ff" stroke-opacity=".18" stroke-width="1" fill="none"><path d="{" ".join(lines)}"/></g>'
             f'<g fill="#d8bd8a" fill-opacity=".7">{dots}</g>'
             f'<g stroke="#fff" stroke-opacity=".08" fill="none">{"".join(waves)}</g>')
    return _svg(W, H, inner)


def art_math():
    W, H = 800, 520
    grid = "".join(f'<path d="M{x} 0V{H}"/>' for x in range(0, W, 40)) + "".join(f'<path d="M0 {y}H{W}"/>' for y in range(0, H, 40))
    curves = []
    for k in range(1, 14):
        r = k * 26
        d = "M" + " L".join(
            f"{560 + r*math.cos(t)*(1+.18*math.sin(3*t)):.1f} {200 + r*.72*math.sin(t)*(1+.18*math.cos(2*t)):.1f}"
            for t in [i * 2 * math.pi / 120 for i in range(121)])
        curves.append(f'<path d="{d}"/>')
    inner = (f'<g stroke="#fff" stroke-opacity=".06">{grid}</g>'
             f'<g fill="none" stroke="#d8bd8a" stroke-opacity=".45" stroke-width="1">{"".join(curves)}</g>'
             '<text x="70" y="150" font-family="Georgia,serif" font-style="italic" font-size="64" fill="#fff" fill-opacity=".12">∇·F = ρ</text>')
    return _svg(W, H, inner)


def art_ai():
    W, H = 800, 520
    layers = [4, 7, 9, 7, 3]
    xs = [180 + i * 130 for i in range(len(layers))]
    nodes = [[(xs[i], 260 + (j - (n-1)/2) * 46) for j in range(n)] for i, n in enumerate(layers)]
    edges = []
    for a, b in zip(nodes, nodes[1:]):
        for (x1, y1) in a:
            for (x2, y2) in b:
                edges.append(f"M{x1} {y1:.0f}L{x2} {y2:.0f}")
    circles = "".join(f'<circle cx="{x}" cy="{y:.0f}" r="7"/>' for layer in nodes for x, y in layer)
    inner = (f'<g stroke="#9cc0ff" stroke-opacity=".16" stroke-width="1"><path d="{" ".join(edges)}"/></g>'
             f'<g fill="#0c2350" stroke="#d8bd8a" stroke-width="1.4">{circles}</g>')
    return _svg(W, H, inner)


def art_science():
    W, H = 800, 520
    lattice = "".join(f'<circle cx="{x}" cy="{y}" r="2.2"/>' for x in range(40, W, 48) for y in range(30, H, 48))
    orbits = "".join(
        f'<ellipse cx="540" cy="230" rx="{rx}" ry="{rx*.36:.0f}" transform="rotate({rot} 540 230)"/>'
        for rx, rot in ((210, -18), (210, 42), (210, 102), (120, 10), (120, 70), (120, 130)))
    inner = (f'<g fill="#fff" fill-opacity=".12">{lattice}</g>'
             f'<g fill="none" stroke="#d8bd8a" stroke-opacity=".5" stroke-width="1.1">{orbits}</g>'
             '<circle cx="540" cy="230" r="16" fill="#d8bd8a" fill-opacity=".8"/>')
    return _svg(W, H, inner)


ART = {"{{ART_HERO}}": art_hero, "{{ART_MATH}}": art_math, "{{ART_AI}}": art_ai, "{{ART_SCI}}": art_science}


def main():
    home = (TOOLS / "home.html").read_text()
    for token, fn in ART.items():
        home = home.replace(token, fn())
    (ROOT / "index.html").write_text(doc(
        f"{SCHOOL}｜{INSTITUTE}",
        f"{INSTITUTE}{SCHOOL}：面向数学基础、人工智能与科学智能的人才培养与科研协作。",
        "home", home))
    for g in NAV:
        for k, _ in g["items"]:
            (ROOT / f"{k}.html").write_text(inner_page(k))
    print("built", 1 + sum(len(g["items"]) for g in NAV), "pages")


if __name__ == "__main__":
    main()
