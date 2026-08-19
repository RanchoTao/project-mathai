# Design QA

## Scope

Homepage implementation inspired by the information hierarchy and editorial rhythm of `https://www.bza.edu.cn/`, adapted for 北京应用数学研究院 / 数学与人工智能学院.

## Source grounding

- Reference homepage structure captured through web retrieval: full-screen institutional presentation, academy introduction, research divisions, calendar/events, news, feature content, slogan/footer.
- BIMSA public website used to ground research directions, current event names, news topics and contact information.
- No BZA logo, QR code, institutional copy, or protected brand identity was reused.

## Implementation verification

Local browser rendering was verified with Chromium/Playwright using an inlined copy of the final static site because direct localhost/file URL navigation is restricted by the execution environment.

### Desktop — 1440 × 1000

- No JavaScript console/page errors.
- Document width equals viewport width (no horizontal overflow).
- Desktop navigation visible.
- Search overlay opens and closes correctly.
- Search can locate a matching section.
- News category filter correctly hides nonmatching cards.
- Deferred reveal content reaches visible state.

### Mobile — 390 × 844

- No JavaScript console/page errors.
- Document width equals viewport width (no horizontal overflow).
- Desktop navigation hidden; mobile menu control visible.
- Mobile drawer opens to full viewport width.
- Research cards stack to a single-column layout.
- Deferred reveal content reaches visible state.

## Remaining production work

- Pixel-level source comparison is intentionally not claimed; the target is a design adaptation, not a copied BZA brand surface.
- Official school naming, logo/VI, approved copy, CMS endpoints, news/detail routes, filing information and production analytics still need institutional confirmation.

final result: passed
