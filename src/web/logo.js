// Logo options — pick a Gaffer mark. Shows each mark on dark + light, a header
// mockup, and size samples, with SVG / 1024px PNG export for the chosen one.
import { doc, headerHtml, footerHtml, MARKS, markSvg } from './shared.js';

const CSS = `
  .lhead{padding:128px 0 6px}
  .lhead h1{font-size:clamp(30px,4.4vw,46px);letter-spacing:-.02em;margin:0;font-weight:500}
  .lhead h1 em{font-style:normal;color:var(--life)}
  .opts{display:grid;grid-template-columns:1fr;gap:16px;margin-top:30px}
  @media(min-width:760px){.opts{grid-template-columns:1fr 1fr}}
  .opt{text-align:left;background:var(--surface);border:1px solid var(--border-soft);border-radius:16px;padding:20px;cursor:pointer;transition:border-color .2s,background .2s}
  .opt:hover{border-color:var(--border)}
  .opt.sel{border-color:oklch(0.74 0.18 162 / .55);background:oklch(0.74 0.18 162 / .05)}
  .opt .top{display:flex;justify-content:space-between;align-items:center}
  .opt .name{font-size:17px;font-weight:500}
  .opt .pick{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;border:1px solid var(--border);color:var(--faint);border-radius:999px;padding:3px 9px}
  .opt.sel .pick{border-color:oklch(0.74 0.18 162 / .55);color:var(--life)}
  .opt .sub{color:var(--muted-fg);font-size:12.5px;line-height:1.55;margin:8px 0 0;min-height:40px}
  .prev{margin-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .prev>div{height:120px;display:grid;place-items:center;border-radius:12px}
  .prev .dk{background:#0a0a0a;color:var(--fg)}
  .prev .lt{background:#f4f4f5;color:#0b0b0b}
  .mock{margin-top:12px;display:flex;align-items:center;gap:10px;border:1px solid var(--border-soft);background:#0a0a0a;border-radius:12px;padding:12px 16px}
  .mock .wm{font-family:var(--serif);font-style:italic;font-size:19px}
  .mock .sizes{margin-left:auto;display:flex;align-items:center;gap:12px;color:var(--muted-fg)}
  .sub-asset{margin-top:44px;border-top:1px solid var(--border-soft);padding-top:32px}
  .sub-asset .row{display:grid;grid-template-columns:auto 1fr;gap:26px;align-items:start;margin-top:18px}
  @media(max-width:640px){.sub-asset .row{grid-template-columns:1fr}}
  .sub-asset .frame{border:1px solid var(--border-soft);border-radius:16px;overflow:hidden;width:300px;height:300px;max-width:100%}
  .dl{display:flex;gap:12px;flex-wrap:wrap;margin-top:6px}
`;

const OPTIONS = MARKS.map((m) => `
  <button class="opt${m.id === MARKS[0].id ? ' sel' : ''}" data-id="${m.id}">
    <div class="top"><span class="name">${m.label}</span><span class="pick">${m.id === MARKS[0].id ? 'selected' : 'select'}</span></div>
    <p class="sub">${m.sub}</p>
    <div class="prev">
      <div class="dk">${markSvg(m.id, 56)}</div>
      <div class="lt">${markSvg(m.id, 56)}</div>
    </div>
    <div class="mock">${markSvg(m.id, 22)}<span class="wm">gaffer</span>
      <span class="sizes">${markSvg(m.id, 16)}${markSvg(m.id, 20)}${markSvg(m.id, 26)}</span>
    </div>
  </button>`).join('');

const BODY = `
${headerHtml({ links: [{ href: '/#how', label: 'How it works' }, { href: '/#features', label: 'Features' }], cta: { label: 'Open the app', href: '/app' } })}

<main class="wrap">
  <section class="lhead">
    <div class="eyebrow"><span class="sq"></span><span class="lbl">Identity</span><span class="dots"></span></div>
    <h1>Pick the Gaffer <em>mark</em>.</h1>
    <p class="say-lede">Four monochrome directions, all in the same neutral system. Choose one, preview it on light and dark, and export an SVG or a 1024px PNG.</p>
    <div class="opts" id="opts">${OPTIONS}</div>

    <div class="sub-asset">
      <div class="eyebrow"><span class="sq"></span><span class="lbl">Export · <span id="selName">${MARKS[0].label}</span></span><span class="dots"></span></div>
      <div class="row">
        <div class="frame" id="frame"></div>
        <div>
          <p class="dim" style="font-size:14px;max-width:520px">Near-black base with a soft green glow, a faint dot grid, and the mark struck in green at the center — 1024×1024. SVG for the header and favicon; PNG for anywhere that needs a raster.</p>
          <div class="dl">
            <button class="btn pri" id="png">Download 1024 PNG</button>
            <button class="btn subtle" id="svg">Download SVG</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>

${footerHtml()}
`;

// Build the composition SVG for a mark id (used for preview + export).
function compositionSvg(id) {
  const inner = markSvg(id, 512, 'style="color:#3ddc61"');
  return `<svg id="subsvg" width="100%" height="100%" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="gGlow" cx="0.3" cy="0.24" r="0.6"><stop offset="0%" stop-color="#3ddc61" stop-opacity="0.30"/><stop offset="100%" stop-color="#3ddc61" stop-opacity="0"/></radialGradient>
      <radialGradient id="gGlow2" cx="0.82" cy="0.85" r="0.5"><stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.20"/><stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/></radialGradient>
      <pattern id="gGrid" width="64" height="64" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#ffffff" fill-opacity="0.05"/></pattern>
    </defs>
    <rect width="1024" height="1024" rx="200" fill="#080808"/>
    <rect width="1024" height="1024" rx="200" fill="url(#gGrid)"/>
    <rect width="1024" height="1024" rx="200" fill="url(#gGlow)"/>
    <rect width="1024" height="1024" rx="200" fill="url(#gGlow2)"/>
    <rect x="3" y="3" width="1018" height="1018" rx="197" fill="none" stroke="#3ddc61" stroke-opacity="0.28" stroke-width="2"/>
    <svg x="256" y="256" width="512" height="512" viewBox="0 0 24 24">${inner.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</svg>
  </svg>`;
}

const SCRIPT = `
const MARKS=${JSON.stringify(MARKS.map((m) => ({ id: m.id, label: m.label })))};
const COMP=${JSON.stringify(Object.fromEntries(MARKS.map((m) => [m.id, compositionSvg(m.id)])))};
let sel=MARKS[0].id;
const frame=document.getElementById('frame');
function renderSub(){ frame.innerHTML=COMP[sel]; document.getElementById('selName').textContent=(MARKS.find(m=>m.id===sel)||{}).label; }
renderSub();
document.getElementById('opts').addEventListener('click',(e)=>{
  const b=e.target.closest('.opt'); if(!b) return;
  sel=b.dataset.id;
  document.querySelectorAll('.opt').forEach(o=>{o.classList.toggle('sel',o===b); o.querySelector('.pick').textContent=(o===b)?'selected':'select';});
  renderSub();
});
function svgString(){ const s=document.getElementById('subsvg'); return '<?xml version="1.0" encoding="UTF-8"?>'+new XMLSerializer().serializeToString(s); }
document.getElementById('svg').onclick=()=>{
  const blob=new Blob([svgString()],{type:'image/svg+xml;charset=utf-8'}); const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download='gaffer-'+sel+'-1024.svg'; a.click(); URL.revokeObjectURL(url);
};
document.getElementById('png').onclick=async()=>{
  const btn=document.getElementById('png'); btn.disabled=true; const old=btn.textContent; btn.textContent='Rendering…';
  try{
    const url=URL.createObjectURL(new Blob([svgString()],{type:'image/svg+xml;charset=utf-8'}));
    const img=new Image(); await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;img.src=url;});
    const c=document.createElement('canvas'); c.width=1024; c.height=1024; c.getContext('2d').drawImage(img,0,0,1024,1024); URL.revokeObjectURL(url);
    const a=document.createElement('a'); a.href=c.toDataURL('image/png'); a.download='gaffer-'+sel+'-1024.png'; a.click();
  }catch(_){ alert('PNG export failed — use the SVG and convert in any browser.'); }
  finally{ btn.disabled=false; btn.textContent=old; }
};
const hdr=document.getElementById('hdr'); addEventListener('scroll',()=>hdr.classList.toggle('scrolled',scrollY>8),{passive:true});
`;

export const LOGO_PAGE = doc({ title: 'Gaffer — identity', body: BODY, style: CSS, script: SCRIPT });
