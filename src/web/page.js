// The single-page UI, served as a string. Self-contained: inline CSS + JS, no CDN.
export const PAGE = /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Gaffer — on-device football film room</title>
<style>
  :root{
    --bg:#0b0f0c; --panel:#121a14; --panel2:#0e150f; --line:#20301f;
    --ink:#e8f0e6; --dim:#8fa389; --grass:#2fbf4e; --grass2:#1e8f3a;
    --warn:#ff6b6b; --good:#57d67d; --gold:#e9c46a; --chip:#1b271a;
  }
  *{box-sizing:border-box}
  body{margin:0;background:radial-gradient(1200px 600px at 70% -10%, #14201400, #0b0f0c),var(--bg);
    color:var(--ink);font:15px/1.5 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
  .wrap{max-width:1100px;margin:0 auto;padding:28px 20px 80px}
  header{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
  .logo{font-weight:800;font-size:26px;letter-spacing:.5px}
  .logo b{color:var(--grass)}
  .tag{color:var(--dim);font-size:13px}
  .pills{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap}
  .pill{font-size:12px;padding:5px 10px;border:1px solid var(--line);border-radius:999px;color:var(--dim);background:var(--panel2)}
  .pill.on{color:var(--grass);border-color:var(--grass2)}
  .pill.p2p{color:var(--gold);border-color:#5a4d24}
  .matchbar{margin-top:18px;padding:14px 16px;background:var(--panel);border:1px solid var(--line);border-radius:14px}
  .vs{font-weight:700;font-size:18px}
  .squad{margin-top:8px;display:flex;gap:6px;flex-wrap:wrap}
  .num{font-size:12px;color:var(--dim);background:var(--chip);border:1px solid var(--line);border-radius:8px;padding:3px 7px}
  .num b{color:var(--ink)}
  .cta{margin:18px 0;display:flex;gap:12px;align-items:center}
  button{font:inherit;font-weight:700;color:#04120a;background:linear-gradient(180deg,var(--grass),var(--grass2));
    border:0;border-radius:10px;padding:11px 18px;cursor:pointer}
  button:disabled{opacity:.5;cursor:default}
  .grid{display:grid;grid-template-columns:1fr;gap:18px}
  @media(min-width:840px){.grid{grid-template-columns:1.15fr .85fr}}
  .card{background:var(--panel);border:1px solid var(--line);border-radius:14px;overflow:hidden}
  .card h2{margin:0;padding:12px 16px;font-size:13px;letter-spacing:.6px;text-transform:uppercase;color:var(--dim);
    border-bottom:1px solid var(--line);background:var(--panel2);display:flex;justify-content:space-between;align-items:center}
  .feed{max-height:60vh;overflow:auto;padding:6px}
  .row{display:grid;grid-template-columns:46px 92px 1fr;gap:10px;align-items:baseline;padding:8px 10px;border-radius:10px;
    animation:in .25s ease}
  .row+.row{border-top:1px solid #16201580}
  @keyframes in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  .clock{color:var(--dim);font-variant-numeric:tabular-nums;font-size:13px}
  .phase{font-size:11px;text-transform:uppercase;letter-spacing:.4px;color:#bfe9c6;background:#12251699;
    border:1px solid var(--line);border-radius:7px;padding:2px 6px;text-align:center;height:fit-content}
  .say{color:var(--ink)}
  .say.neg{color:#ffb4b4}.say.pos{color:var(--good)}
  .meta{margin-top:5px;display:flex;gap:5px;flex-wrap:wrap}
  .who{font-size:11px;color:var(--gold);background:#241f0f;border:1px solid #4a3f1f;border-radius:6px;padding:1px 6px}
  .theme{font-size:11px;color:var(--dim);background:var(--chip);border:1px solid var(--line);border-radius:6px;padding:1px 6px}
  .ht{padding:16px}
  .ht .muted{color:var(--dim);font-size:13px}
  .status{display:flex;gap:10px;align-items:center;margin:12px 0;color:var(--dim);font-size:14px}
  .spin{width:16px;height:16px;border:2px solid #2a3a29;border-top-color:var(--grass);border-radius:50%;animation:sp .8s linear infinite}
  @keyframes sp{to{transform:rotate(360deg)}}
  .adj{display:flex;gap:12px;padding:12px;border:1px solid var(--line);border-radius:12px;margin-top:10px;background:var(--panel2);
    animation:in .3s ease}
  .adj .n{flex:0 0 26px;height:26px;border-radius:50%;background:var(--grass);color:#04120a;font-weight:800;
    display:grid;place-items:center}
  .badge{font-size:12px;color:var(--gold)}
  .tools{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:14px}
  button.sec{background:#17251a;color:var(--ink);border:1px solid var(--line);font-weight:600;padding:8px 12px}
  select{background:#17251a;color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:7px 8px;font:inherit}
  #tstat{font-size:13px}
  .foot{margin-top:26px;color:var(--dim);font-size:12px;text-align:center}
  .empty{color:var(--dim);padding:22px;text-align:center;font-size:14px}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <div class="logo"><b>Gaffer</b> ⚽</div>
    <div class="tag">private, offline AI film room for grassroots football</div>
    <div class="pills">
      <span class="pill on">on-device</span>
      <span class="pill on">no cloud</span>
      <span class="pill on">no API key</span>
      <span class="pill" id="mode">local</span>
    </div>
  </header>

  <div class="matchbar">
    <span class="vs" id="vs">—</span>
    <div class="squad" id="squad"></div>
  </div>

  <div class="cta">
    <button id="go">Kick off ▶</button>
    <span class="muted" id="hint" style="color:var(--dim);font-size:13px">Coach narrates from the touchline; each remark is transcribed &amp; tagged on-device.</span>
  </div>

  <div class="grid">
    <div class="card">
      <h2>Live touchline <span id="count" class="muted" style="color:var(--dim)"></span></h2>
      <div class="feed" id="feed"><div class="empty">Press <b>Kick off</b> to start the match.</div></div>
    </div>
    <div class="card">
      <h2>Half-time <span id="htbadge" class="badge"></span></h2>
      <div class="ht" id="ht"><div class="empty">The three adjustments appear here at half-time.</div></div>
    </div>
  </div>

  <div class="foot">Runs on QVAC (on-device AI) + Pears (P2P). The kids' data never leaves the touchline.</div>
</div>

<script>
const $ = (s)=>document.querySelector(s);
let delegated=false, providerKey=null;

let langs=[], adjText='';
const LNAME={es:'Español',pt:'Português',fr:'Français',de:'Deutsch',it:'Italiano'};
fetch('/api/config').then(r=>r.json()).then(c=>{
  delegated=c.delegated; providerKey=c.providerKey; langs=c.langs||[];
  if(delegated){ const m=$('#mode'); m.textContent='P2P → laptop'; m.className='pill p2p'; }
});

function phaseRow(e){
  const who = e.players.map(p=>'<span class="who">#'+p.n+(p.name?' '+p.name:'')+'</span>').join(' ');
  const themes = e.themes.map(t=>'<span class="theme">'+t+'</span>').join(' ');
  const tone = e.sentiment<-0.15?'neg':e.sentiment>0.15?'pos':'';
  const div=document.createElement('div'); div.className='row';
  div.innerHTML='<span class="clock">'+e.clock+'</span>'+
    '<span class="phase">'+e.phase+'</span>'+
    '<div><span class="say '+tone+'">'+escapeHtml(e.text)+'</span>'+
    ((who||themes)?'<div class="meta">'+who+' '+themes+'</div>':'')+'</div>';
  return div;
}
function escapeHtml(s){return s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));}

function wireTools(){
  const say=$('#say'), au=$('#au'), tr=$('#tr'), tstat=$('#tstat');
  if(say) say.onclick=async()=>{
    say.disabled=true; tstat.textContent='synthesizing on-device…';
    try{ const r=await fetch('/api/tts?text='+encodeURIComponent(adjText));
      if(!r.ok) throw 0; const b=await r.blob(); au.src=URL.createObjectURL(b); await au.play(); tstat.textContent='';
    }catch(_){ tstat.textContent='TTS failed'; } finally{ say.disabled=false; }
  };
  if(tr) tr.onclick=async()=>{
    const to=$('#lang').value; tr.disabled=true; tstat.textContent='translating on-device…';
    try{ const r=await fetch('/api/translate?to='+to+'&text='+encodeURIComponent(adjText));
      const j=await r.json(); tstat.innerHTML='<span class="badge">'+(LNAME[to]||to)+'</span> '+escapeHtml(j.text||j.error||'');
    }catch(_){ tstat.textContent='translation failed'; } finally{ tr.disabled=false; }
  };
}

$('#go').onclick=()=>{
  $('#go').disabled=true; $('#hint').textContent='';
  $('#feed').innerHTML=''; $('#ht').innerHTML='';
  let n=0;
  const es=new EventSource('/api/stream');
  es.onmessage=(ev)=>{
    const e=JSON.parse(ev.data);
    if(e.type==='match'){
      $('#vs').textContent=e.team+'  vs  '+e.opponent;
      $('#squad').innerHTML=e.roster.map(p=>'<span class="num"><b>#'+p.number+'</b> '+p.name+'</span>').join('');
    }
    else if(e.type==='utterance'){
      const f=$('#feed'); f.appendChild(phaseRow(e)); f.scrollTop=f.scrollHeight;
      $('#count').textContent='· '+(++n)+' remarks';
    }
    else if(e.type==='halftime'){
      const chips=e.themes.slice(0,6).map(([t,c])=>'<span class="theme">'+t+' ×'+c+'</span>').join(' ');
      $('#ht').innerHTML='<div class="muted">Recurring themes</div><div class="meta" style="margin:8px 0 4px">'+chips+'</div>'+
        '<div class="status"><span class="spin"></span> Synthesizing three adjustments'+
        (delegated?' — <span class="badge">delegated to your laptop over P2P</span>':' (on-device)')+'…</div>';
    }
    else if(e.type==='adjustments'){
      const secs=(e.ms/1000).toFixed(1);
      $('#htbadge').textContent=e.delegated?('▲ P2P · '+secs+'s'):(secs+'s · local');
      adjText=e.items.map((a,i)=>(i+1)+'. '+a).join('  ');
      let html='<div class="muted">Coach — three things for the second half'+
        (e.delegated?' <span class="badge">(computed on your laptop, not the phone)</span>':'')+':</div>';
      e.items.forEach((a,i)=>{ html+='<div class="adj"><div class="n">'+(i+1)+'</div><div>'+escapeHtml(a)+'</div></div>'; });
      html+='<div class="tools"><button class="sec" id="say">🔊 Read aloud</button>';
      if(langs.length){ html+='<select id="lang">'+langs.map(l=>'<option value="'+l+'">'+(LNAME[l]||l)+'</option>').join('')+'</select><button class="sec" id="tr">Translate for the bench</button>'; }
      html+='<span id="tstat" class="muted" style="color:var(--dim)"></span></div><audio id="au" hidden></audio>';
      $('#ht').innerHTML=html;
      wireTools();
    }
    else if(e.type==='done'){ es.close(); $('#go').disabled=false; $('#go').textContent='Replay ▶'; }
    else if(e.type==='error'){ es.close(); $('#ht').innerHTML='<div class="empty">Error: '+escapeHtml(e.message)+'</div>'; $('#go').disabled=false; }
  };
  es.onerror=()=>{ es.close(); $('#go').disabled=false; };
};
</script>
</body>
</html>`;
