// Shared web foundation: design tokens, the floating-pill header, footer, logo
// marks, GSAP loader, and a document builder. Every page composes from here so the
// design system lives in one place. Served as strings (no build step).

export const DEFAULT_MARK = 'chevron';

// --- Logo marks (monochrome, currentColor, 24x24 stroke) ---------------------------
const MARK_PATHS = {
  chevron:
    '<path d="M4 13.5 12 6l8 7.5"/><path d="M4 19 12 11.5 20 19"/>',
  waveform:
    '<path d="M4 9.5v5"/><path d="M8 5.5v13"/><path d="M12 3v18"/><path d="M16 7v10"/><path d="M20 9.5v5"/>',
  nodes:
    '<circle cx="12" cy="4.6" r="1.9"/><circle cx="4.8" cy="18" r="1.9"/><circle cx="19.2" cy="18" r="1.9"/><path d="M11.2 6.2 5.7 16.1M12.8 6.2 18.3 16.1M6.7 18h10.6"/>',
  whistle:
    '<circle cx="9" cy="14" r="5"/><path d="M13.4 11.8 20.5 9.2v4l-5 1.8"/><path d="M9 9V6.4"/><circle cx="9" cy="14" r="1.25"/>',
};

export const MARKS = [
  { id: 'chevron', label: 'Advance', sub: 'A double chevron — pushing the team forward. Crisp at any size; the safe, confident pick.' },
  { id: 'whistle', label: 'Whistle', sub: 'The universal sign of the coach. Warmest and most literal; a little busier when tiny.' },
  { id: 'waveform', label: 'Voice', sub: 'A sound wave — Gaffer listens to you talk. Leans into the "it hears you" idea.' },
  { id: 'nodes', label: 'Formation', sub: 'Three connected players — a shape, a team, a network. The most abstract option.' },
];

/** Return an inline SVG string for a mark. */
export function markSvg(id, size = 24, extra = '') {
  const paths = MARK_PATHS[id] || MARK_PATHS[DEFAULT_MARK];
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${paths}</svg>`;
}

// --- Fonts + stylesheet ------------------------------------------------------------
export const FONT_LINKS = ``;

export const STYLE = /* css */ `
  :root{
    --bg:oklch(0.07 0 0); --fg:oklch(0.96 0 0);
    --surface:oklch(0.10 0 0); --surface2:oklch(0.115 0 0);
    --muted:oklch(0.18 0 0); --muted-fg:oklch(0.60 0 0); --faint:oklch(0.45 0 0);
    --border:oklch(0.20 0 0); --border-soft:oklch(0.145 0 0);
    --life:oklch(0.74 0.18 162); --lineage:oklch(0.70 0.18 290); --danger:oklch(0.66 0.21 25);
    --sans:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    --serif:"Instrument Serif",ui-serif,Georgia,"Times New Roman",serif;
    --mono:ui-monospace,"SF Mono","JetBrains Mono","Cascadia Code",Menlo,Consolas,monospace;
  }
  *{box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 var(--sans);
    -webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
  body::before{content:"";position:fixed;inset:0;z-index:-2;pointer-events:none;
    background:
      radial-gradient(820px 500px at 50% -8%, oklch(0.74 0.18 162 / .09), transparent 70%),
      radial-gradient(640px 440px at 88% 12%, oklch(0.70 0.18 290 / .07), transparent 72%)}
  body::after{content:"";position:fixed;inset:0;z-index:-2;pointer-events:none;opacity:.4;
    background-image:radial-gradient(circle at 1px 1px, rgba(255,255,255,.05) 1px, transparent 0);background-size:34px 34px}
  a{color:var(--fg);text-decoration:none}
  ::selection{background:var(--life);color:var(--bg)}
  ::-webkit-scrollbar{width:9px;height:9px}
  ::-webkit-scrollbar-thumb{background:var(--muted);border-radius:9px}
  ::-webkit-scrollbar-thumb:hover{background:var(--faint)}
  .wrap{max-width:1040px;margin:0 auto;padding:0 24px}
  svg{display:block}

  /* floating pill header */
  .hdr{position:fixed;left:0;right:0;top:0;z-index:50;padding:16px 20px;transition:padding .25s}
  .hdr .pill{max-width:1000px;margin:0 auto;height:56px;display:grid;grid-template-columns:auto 1fr auto;align-items:center;
    border:1px solid oklch(0.28 0 0 / .55);background:oklch(0.085 0 0 / .72);backdrop-filter:blur(16px) saturate(1.2);
    border-radius:999px;padding-left:20px;padding-right:8px;transition:background .25s,border-color .25s}
  .hdr.scrolled .pill{background:oklch(0.085 0 0 / .9)}
  .brand{display:flex;align-items:center;gap:9px;color:var(--fg)}
  .brand .wm{font-size:19px;font-weight:650;letter-spacing:-.03em;line-height:1}
  .hlinks{display:flex;justify-content:center;gap:2px}
  .hlinks a{color:var(--muted-fg);font-size:14px;padding:8px 14px;border-radius:999px;transition:color .15s,background .15s}
  .hlinks a:hover{color:var(--fg);background:oklch(0.16 0 0 / .6)}
  .hright{justify-self:end}
  @media(max-width:760px){.hlinks{display:none}}

  /* buttons */
  .btn{display:inline-flex;align-items:center;gap:8px;font:inherit;font-size:14px;font-weight:500;
    border-radius:999px;cursor:pointer;border:1px solid var(--border);background:var(--muted);color:var(--fg);
    padding:10px 18px;position:relative;overflow:hidden;transition:transform .25s,border-color .2s;text-decoration:none}
  .btn:hover{transform:translateY(-1px);border-color:oklch(0.32 0 0)}
  .btn.lg{padding:14px 24px;font-size:15px}
  .btn.sm{padding:8px 15px;font-size:13.5px}
  .btn.pri::after{content:"";position:absolute;inset:0;width:38%;pointer-events:none;
    background:linear-gradient(90deg,transparent,oklch(0.74 0.18 162 / .30),transparent);
    transform:skewX(-14deg) translateX(-180%);animation:shine 3.8s ease-in-out infinite}
  @keyframes shine{0%{transform:skewX(-14deg) translateX(-180%)}42%,100%{transform:skewX(-14deg) translateX(440%)}}
  .btn.subtle{background:transparent;border-color:var(--border)}
  .btn:disabled{opacity:.5;cursor:default;transform:none}

  /* section scaffolding */
  section{padding:60px 0}
  .eyebrow{display:flex;align-items:center;gap:14px;border-top:1px solid var(--border-soft);
    border-bottom:1px solid var(--border-soft);padding:11px 0;margin:0 0 40px}
  .eyebrow .sq{width:9px;height:9px;transform:rotate(45deg);border:1px solid oklch(0.96 0 0 / .7);flex:0 0 auto}
  .eyebrow .lbl{font-family:var(--mono);font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:oklch(0.96 0 0 / .72)}
  .eyebrow .dots{flex:1;height:2px;opacity:.6;
    background-image:radial-gradient(circle, rgba(255,255,255,.42) 1px, transparent 1px);background-size:8px 2px;background-repeat:repeat-x}
  .lede{font-size:clamp(28px,4vw,44px);line-height:1.12;letter-spacing:-.02em;margin:0;font-weight:500;max-width:820px}
  .lede em{font-style:normal;color:var(--life)}
  .lede .mut{color:var(--muted-fg)}
  .say-lede{color:var(--muted-fg);font-size:17px;max-width:620px;margin:18px 0 0;line-height:1.65}
  .dim{color:var(--muted-fg)}

  /* footer */
  footer{margin-top:40px;border-top:1px solid var(--border-soft);padding:44px 0 64px}
  .foot{display:flex;gap:26px;justify-content:space-between;flex-wrap:wrap;align-items:flex-start}
  .foot .brand .wm{font-size:20px}
  .foot .desc{color:var(--muted-fg);font-size:14px;max-width:340px;margin-top:12px;line-height:1.6}
  .foot .fine{color:var(--faint);font-family:var(--mono);font-size:11.5px;margin-top:16px;letter-spacing:.02em}
  .foot .links{display:flex;flex-direction:column;gap:12px}
  .foot .links a{color:var(--muted-fg);font-size:14px}.foot .links a:hover{color:var(--fg)}
`;

// --- Header / footer HTML ----------------------------------------------------------
export function headerHtml({ cta = { label: 'Open the app', href: '/app' }, links = [] } = {}) {
  const linkHtml = links.map((l) => `<a href="${l.href}">${l.label}</a>`).join('');
  return `<header class="hdr" id="hdr">
    <div class="pill">
      <a class="brand" href="/">${markSvg(DEFAULT_MARK, 22)}<span class="wm">gaffer</span></a>
      <nav class="hlinks">${linkHtml}</nav>
      <div class="hright"><a class="btn pri sm" href="${cta.href}">${cta.label}</a></div>
    </div>
  </header>`;
}

export function footerHtml() {
  return `<footer><div class="wrap foot">
    <div>
      <a class="brand" href="/">${markSvg(DEFAULT_MARK, 20)}<span class="wm">gaffer</span></a>
      <div class="desc">The assistant coach for grassroots football. It listens, keeps track of the match, and hands you a plan at half-time, all on your own phone.</div>
      <div class="fine">Made for touchline coaches · runs on your device</div>
    </div>
    <div class="links">
      <a href="/">Home</a>
      <a href="/#how">How it works</a>
      <a href="/#features">Features</a>
      <a href="/app">Open the app</a>
    </div>
  </div></footer>`;
}

// GSAP from CDN (all plugins free). gsap.from() keeps content visible if it fails to load.
export const GSAP_SCRIPTS = `
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js"></script>`;

/** Build a full HTML document. `style` is page-specific CSS appended to the shared sheet. */
export function doc({ title, body, script = '', style = '', gsap = false }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
${FONT_LINKS}
<style>${STYLE}${style}</style>
</head>
<body>
${body}
${gsap ? GSAP_SCRIPTS : ''}
<script>${script}</script>
</body>
</html>`;
}
