// The app — where things actually happen. Not a scripted demo: the coach adds their
// own remarks, each tagged live on-device, then gets a real half-time plan synthesized
// from exactly those remarks.
import { doc, headerHtml, footerHtml } from './shared.js';

const CSS = `
  .apphead{padding:132px 0 8px}
  .apptitle{font-size:clamp(30px,4.4vw,46px);line-height:1.1;letter-spacing:-.02em;margin:0;font-weight:500}
  .apptitle em{font-style:normal;color:var(--life)}
  .grid{display:grid;grid-template-columns:1fr;gap:18px;margin-top:30px}
  @media(min-width:920px){.grid{grid-template-columns:1.15fr .85fr;align-items:start}}
  .card{background:var(--surface);border:1px solid var(--border-soft);border-radius:16px}
  .card .hd{padding:15px 20px;border-bottom:1px solid var(--border-soft);display:flex;justify-content:space-between;align-items:center}
  .card .hd h3{margin:0;font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted-fg)}
  .card .bd{padding:20px}
  .badge2{font-family:var(--mono);font-size:11.5px;color:var(--lineage)}
  .squadref{color:var(--muted-fg);font-size:12.5px;margin-bottom:16px}
  .num{display:inline-block;font-family:var(--mono);font-size:11.5px;color:var(--muted-fg);background:var(--bg);border:1px solid var(--border-soft);border-radius:7px;padding:2px 7px;margin:2px 4px 0 0}
  .num b{color:var(--fg);font-weight:500}
  .adder{display:flex;gap:10px;flex-wrap:wrap}
  .mfield{width:74px;flex:0 0 auto}
  .tfield{flex:1;min-width:200px}
  label.mini{display:block;font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin:0 0 6px}
  input[type=text],input[type=number]{width:100%;background:var(--bg);color:var(--fg);border:1px solid var(--border);border-radius:11px;padding:13px 14px;font:inherit;font-size:15px;outline:none;transition:border-color .15s,box-shadow .15s}
  input:focus{border-color:var(--life);box-shadow:0 0 0 3px oklch(0.74 0.18 162 / .16)}
  input::placeholder{color:var(--faint)}
  .addbtn{align-self:flex-end}
  .exs{margin-top:14px;display:flex;gap:8px;flex-wrap:wrap}
  .ex{background:var(--bg);border:1px solid var(--border-soft);color:var(--muted-fg);font:inherit;font-size:12.5px;padding:8px 12px;border-radius:999px;cursor:pointer;text-align:left;transition:border-color .15s,color .15s}
  .ex:hover{border-color:var(--border);color:var(--fg)}
  .feed{margin-top:6px;max-height:44vh;overflow:auto}
  .rrow{display:grid;grid-template-columns:46px 96px 1fr auto;gap:12px;align-items:baseline;padding:12px 4px;animation:in .25s ease}
  .rrow+.rrow{border-top:1px solid var(--border-soft)}
  @keyframes in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  .clock{color:var(--faint);font-family:var(--mono);font-size:12.5px}
  .say2{color:var(--fg);font-size:14.5px}.say2.neg{color:oklch(0.74 0.13 25)}.say2.pos{color:var(--life)}
  .meta{margin-top:7px;display:flex;gap:6px;flex-wrap:wrap}
  .phase{font-family:var(--mono);font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--muted-fg);border:1px solid var(--border-soft);border-radius:6px;padding:4px 8px;height:fit-content}
  .who{font-family:var(--mono);font-size:11.5px;color:var(--fg);background:var(--muted);border:1px solid var(--border);border-radius:6px;padding:3px 8px}
  .theme{font-size:12px;color:var(--muted-fg);background:var(--surface2);border:1px solid var(--border-soft);border-radius:6px;padding:3px 8px}
  .del{background:none;border:0;color:var(--faint);cursor:pointer;font-size:16px;line-height:1;padding:2px 6px}
  .del:hover{color:var(--danger)}
  .empty{color:var(--muted-fg);padding:26px 4px;text-align:center;font-size:14px}
  .thinking{display:flex;gap:10px;align-items:center;color:var(--muted-fg);font-size:14px;padding:10px 4px}
  .spin{width:15px;height:15px;border:2px solid var(--muted);border-top-color:var(--life);border-radius:50%;animation:sp .8s linear infinite}
  @keyframes sp{to{transform:rotate(360deg)}}
  .planbtn{width:100%;justify-content:center;margin-top:2px}
  .status{display:flex;gap:11px;align-items:center;margin:14px 0;color:var(--muted-fg);font-size:14px}
  .adj{display:flex;gap:14px;padding:15px;border:1px solid var(--border-soft);border-radius:11px;margin-top:11px;background:var(--bg);animation:in .3s ease}
  .adj .n{flex:0 0 24px;height:24px;border-radius:50%;border:1px solid var(--border);background:var(--muted);color:var(--fg);font-family:var(--mono);font-size:12px;display:grid;place-items:center}
  .adj .tx{font-size:14.5px;line-height:1.55}
  .tools{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:18px}
  select{background:var(--muted);color:var(--fg);border:1px solid var(--border);border-radius:9px;padding:9px 11px;font:inherit;font-size:13px}
  .sec-btn{background:var(--muted);color:var(--fg);border:1px solid var(--border);font:inherit;font-size:13px;font-weight:500;padding:10px 14px;border-radius:999px;cursor:pointer;transition:border-color .2s}
  .sec-btn:hover{border-color:oklch(0.30 0 0)}
  #tstat{font-size:13px}
  .hint{color:var(--muted-fg);font-size:13px;margin-top:10px}
`;

const BODY = `
${headerHtml({ links: [{ href: '/#how', label: 'How it works' }, { href: '/#features', label: 'Features' }], cta: { label: 'Home', href: '/' } })}

<main class="wrap">
  <section class="apphead">
    <div class="eyebrow"><span class="sq"></span><span class="lbl" id="vs">Your match</span><span class="dots"></span></div>
    <h1 class="apptitle">Coach the match. <em>Get the plan.</em></h1>
    <p class="say-lede">Add what you would call out from the touchline — by name or number. Each note is tagged on your device as you go. When you are ready, get your half-time plan.</p>
  </section>

  <section style="padding-top:0">
    <div class="grid">
      <div class="card">
        <div class="hd"><h3>Live touchline <span id="count" class="dim"></span></h3><button class="del" id="clear" title="Clear session" style="font-size:12px">clear</button></div>
        <div class="bd">
          <div class="squadref">Your squad: <span id="squad"></span></div>
          <div class="adder">
            <div class="mfield"><label class="mini">Min</label><input type="number" id="min" min="0" max="90" value="3"></div>
            <div class="tfield"><label class="mini">Remark</label><input type="text" id="remark" placeholder="e.g. their 9 keeps beating Sofia at the back post" autocomplete="off"></div>
            <button class="btn pri addbtn" id="add">Add →</button>
          </div>
          <div class="exs" id="examples"></div>
          <div class="feed" id="feed"><div class="empty">Add a few remarks above to build the match.</div></div>
        </div>
      </div>

      <div class="card">
        <div class="hd"><h3>Half-time plan</h3><span id="planbadge" class="badge2"></span></div>
        <div class="bd">
          <button class="btn pri lg planbtn" id="getplan" disabled>Get half-time plan</button>
          <div class="hint" id="planhint">Add at least a couple of remarks first.</div>
          <div id="plan"></div>
        </div>
      </div>
    </div>
  </section>
</main>

${footerHtml()}
`;

const SCRIPT = `
const $=(s)=>document.querySelector(s);
const enc=encodeURIComponent;
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function mmss(ms){const s=Math.floor(ms/1000);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
let delegated=false, langs=[], roster=[], adjText='';
const LNAME={es:'Español',pt:'Português',fr:'Français',de:'Deutsch',it:'Italiano'};
let utt=[]; // {text,tMs,players:[{n,name}],phase,themes,sentiment}

fetch('/api/config').then(r=>r.json()).then(c=>{
  delegated=c.delegated; langs=c.langs||[]; roster=c.roster||[];
  if(c.team) $('#vs').textContent=c.team+' vs '+c.opponent;
  $('#squad').innerHTML=roster.map(p=>'<span class="num"><b>#'+p.number+'</b> '+p.name+'</span>').join('');
});

const examples=[
  "Their 9 keeps beating Sofia at the back post, that's twice now.",
  "Lovely ball Mei, that's exactly what we want.",
  "We're losing every second ball in midfield, Nadia step up.",
  "Great block Priya, that's defending.",
  "We keep switching off at their throw-ins near our box.",
];
$('#examples').innerHTML=examples.map((t,i)=>'<button class="ex" data-i="'+i+'">'+esc(t)+'</button>').join('');
$('#examples').onclick=(e)=>{ const b=e.target.closest('.ex'); if(b) addRemark(examples[+b.dataset.i]); };

function render(){
  const f=$('#feed');
  if(!utt.length){ f.innerHTML='<div class="empty">Add a few remarks above to build the match.</div>'; }
  else{
    utt.sort((a,b)=>a.tMs-b.tMs);
    f.innerHTML=utt.map((u,i)=>{
      const who=u.players.map(p=>'<span class="who">#'+p.n+(p.name?' '+esc(p.name):'')+'</span>').join(' ');
      const themes=u.themes.map(t=>'<span class="theme">'+esc(t)+'</span>').join(' ');
      const tone=u.sentiment<-0.15?'neg':u.sentiment>0.15?'pos':'';
      return '<div class="rrow"><span class="clock">'+mmss(u.tMs)+'</span><span class="phase">'+esc(u.phase)+'</span>'+
        '<div><span class="say2 '+tone+'">'+esc(u.text)+'</span>'+((who||themes)?'<div class="meta">'+who+' '+themes+'</div>':'')+'</div>'+
        '<button class="del" data-del="'+i+'" title="Remove">×</button></div>';
    }).join('');
    f.scrollTop=f.scrollHeight;
  }
  $('#count').textContent=utt.length?('· '+utt.length+' remark'+(utt.length>1?'s':'')):'';
  const ready=utt.length>=1;
  $('#getplan').disabled=!ready;
  $('#planhint').style.display=ready?'none':'block';
}
$('#feed').addEventListener('click',(e)=>{const b=e.target.closest('[data-del]'); if(b){ utt.splice(+b.dataset.del,1); render(); }});
$('#clear').onclick=()=>{ utt=[]; $('#plan').innerHTML=''; $('#planbadge').textContent=''; render(); };

async function addRemark(text){
  text=(text||'').trim(); if(!text) return;
  const btn=$('#add'); btn.disabled=true;
  const min=Math.max(0,Math.min(90,parseInt($('#min').value||'1',10)));
  try{
    const r=await fetch('/api/tag?text='+enc(text)); const j=await r.json();
    if(j.error) throw new Error(j.error);
    utt.push({text,tMs:min*60000,players:j.players,phase:j.phase,themes:j.themes,sentiment:j.sentiment});
    render();
    $('#remark').value=''; $('#min').value=Math.min(90,min+2); $('#remark').focus();
  }catch(e){ alert('Could not tag that remark: '+e.message); }
  finally{ btn.disabled=false; }
}
$('#add').onclick=()=>addRemark($('#remark').value);
$('#remark').addEventListener('keydown',(e)=>{ if(e.key==='Enter'){ e.preventDefault(); addRemark($('#remark').value); }});

$('#getplan').onclick=async()=>{
  const btn=$('#getplan'); btn.disabled=true;
  $('#plan').innerHTML='<div class="status"><span class="spin"></span> Synthesizing your plan'+(delegated?' — <span class="badge2">on your laptop over P2P</span>':' on-device')+'…</div>';
  try{
    const body=JSON.stringify({half:true,utterances:utt.map(u=>({text:u.text,tMs:u.tMs,players:u.players.map(p=>p.n),phase:u.phase,themes:u.themes,sentiment:u.sentiment}))});
    const r=await fetch('/api/synthesize',{method:'POST',headers:{'content-type':'application/json'},body});
    const j=await r.json(); if(j.error) throw new Error(j.error);
    const secs=(j.ms/1000).toFixed(1);
    $('#planbadge').textContent=j.delegated?('P2P · '+secs+'s'):(secs+'s');
    adjText=j.adjustments.map((a,i)=>(i+1)+'. '+a).join('  ');
    let html='<div class="dim" style="font-size:13.5px;margin-top:4px">Three things for the second half:</div>';
    j.adjustments.forEach((a,i)=>{ html+='<div class="adj"><div class="n">'+(i+1)+'</div><div class="tx">'+esc(a)+'</div></div>'; });
    html+='<div class="tools"><button class="sec-btn" id="say">🔊 Read aloud</button>';
    if(langs.length){ html+='<select id="lang">'+langs.map(l=>'<option value="'+l+'">'+(LNAME[l]||l)+'</option>').join('')+'</select><button class="sec-btn" id="tr">Translate</button>'; }
    html+='<span id="tstat" class="dim"></span></div><audio id="au" hidden></audio>';
    $('#plan').innerHTML=html; wireTools();
  }catch(e){ $('#plan').innerHTML='<div class="empty">Could not build the plan: '+esc(e.message)+'</div>'; }
  finally{ btn.disabled=false; }
};

function wireTools(){
  const say=$('#say'), au=$('#au'), tr=$('#tr'), tstat=$('#tstat');
  if(say) say.onclick=async()=>{
    say.disabled=true; tstat.textContent='synthesizing on-device…';
    try{ const r=await fetch('/api/tts?text='+enc(adjText)); if(!r.ok) throw 0;
      const b=await r.blob(); au.src=URL.createObjectURL(b); await au.play(); tstat.textContent='';
    }catch(_){ tstat.textContent='audio failed'; } finally{ say.disabled=false; }
  };
  if(tr) tr.onclick=async()=>{
    const to=$('#lang').value; tr.disabled=true; tstat.textContent='translating on-device…';
    try{ const r=await fetch('/api/translate?to='+to+'&text='+enc(adjText));
      const j=await r.json(); tstat.innerHTML='<span class="badge2">'+(LNAME[to]||to)+'</span> '+esc(j.text||j.error||'');
    }catch(_){ tstat.textContent='translation failed'; } finally{ tr.disabled=false; }
  };
}

const hdr=document.getElementById('hdr');
addEventListener('scroll',()=>hdr.classList.toggle('scrolled',scrollY>8),{passive:true});
`;

export const APP_PAGE = doc({ title: 'Gaffer — your match', body: BODY, style: CSS, script: SCRIPT });
