// The single-page UI, served as a string. Self-contained: inline CSS + JS, no CDN.
export const PAGE = /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Gaffer — on-device football film room</title>
<style>
  :root{
    --bg:#060d08; --panel:#0d1710; --panel2:#0a130c; --line:#1b2c1f; --line2:#26402b;
    --ink:#e9f1ea; --dim:#8aa891; --grass:#3ddc61; --grass2:#1f9d3a;
    --gold:#f2c14e; --warn:#ff7a7a; --good:#57d67d; --chip:#132018;
  }
  *{box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{margin:0;color:var(--ink);background:var(--bg);
    font:15px/1.55 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
    -webkit-font-smoothing:antialiased}
  /* faint pitch grid + top glow */
  body::before{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;
    background:
      radial-gradient(900px 500px at 50% -8%, rgba(61,220,97,.10), transparent 60%),
      repeating-linear-gradient(0deg, transparent 0 46px, rgba(255,255,255,.018) 46px 47px),
      repeating-linear-gradient(90deg, transparent 0 46px, rgba(255,255,255,.018) 46px 47px)}
  .wrap{max-width:1080px;margin:0 auto;padding:0 20px}
  a{color:var(--grass);text-decoration:none}

  /* nav */
  nav{display:flex;align-items:center;gap:12px;padding:18px 0;position:sticky;top:0;z-index:5;
    background:linear-gradient(180deg,var(--bg),rgba(6,13,8,.75) 70%,transparent);backdrop-filter:blur(6px)}
  .brand{font-weight:800;font-size:20px;letter-spacing:.3px;display:flex;align-items:center;gap:8px}
  .brand b{color:var(--grass)}
  .pills{margin-left:auto;display:flex;gap:7px;flex-wrap:wrap}
  .pill{font-size:11.5px;font-weight:600;padding:5px 11px;border:1px solid var(--line2);border-radius:999px;
    color:var(--dim);background:var(--panel2)}
  .pill.on{color:var(--grass);border-color:var(--grass2)}
  .pill.p2p{color:var(--gold);border-color:#5a4d24}

  /* hero */
  .hero{padding:46px 0 20px;text-align:center}
  .kicker{display:inline-block;font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;
    color:var(--grass);border:1px solid var(--grass2);border-radius:999px;padding:5px 12px;margin-bottom:20px;background:#0c1a10}
  h1{font-size:clamp(38px,7vw,76px);line-height:.98;letter-spacing:-2px;margin:0;font-weight:850}
  h1 .g{color:var(--grass)}
  .sub{max-width:640px;margin:20px auto 0;color:var(--dim);font-size:17px}
  .sub b{color:var(--ink);font-weight:600}

  /* explainer strip */
  .how{display:grid;grid-template-columns:1fr;gap:12px;margin:30px 0 6px}
  @media(min-width:760px){.how{grid-template-columns:repeat(3,1fr)}}
  .step{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px 16px}
  .step .n{width:24px;height:24px;border-radius:7px;background:#12251a;border:1px solid var(--grass2);color:var(--grass);
    font-weight:800;font-size:13px;display:grid;place-items:center;margin-bottom:10px}
  .step h3{margin:0 0 4px;font-size:14px}
  .step p{margin:0;color:var(--dim);font-size:13px}
  .banner{margin:16px 0 0;padding:12px 14px;border-radius:12px;border:1px dashed var(--line2);background:var(--panel2);
    color:var(--dim);font-size:13.5px;text-align:center}
  .banner b{color:var(--ink)}

  /* section heads */
  .sec{margin:52px 0 16px;display:flex;align-items:baseline;gap:10px}
  .sec h2{font-size:22px;margin:0;letter-spacing:-.3px}
  .sec span{color:var(--dim);font-size:13px}

  /* cards */
  .card{background:var(--panel);border:1px solid var(--line);border-radius:18px}
  .card .hd{padding:14px 18px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center}
  .card .hd h3{margin:0;font-size:12px;letter-spacing:.7px;text-transform:uppercase;color:var(--dim)}
  .badge{font-size:12px;color:var(--gold);font-weight:600}

  /* try-it */
  .try{padding:18px}
  .inputrow{display:flex;gap:10px;flex-wrap:wrap}
  .field{flex:1;min-width:240px;position:relative}
  input[type=text]{width:100%;background:#0a130d;color:var(--ink);border:1px solid var(--line2);border-radius:12px;
    padding:14px 15px;font:inherit;outline:none;transition:border .15s, box-shadow .15s}
  input[type=text]:focus{border-color:var(--grass);box-shadow:0 0 0 3px rgba(61,220,97,.18)}
  input::placeholder{color:#5f7a67}
  button{font:inherit;font-weight:700;cursor:pointer;border:0;border-radius:12px}
  .primary{color:#05140a;background:linear-gradient(180deg,var(--grass),var(--grass2));padding:14px 20px}
  .primary:disabled{opacity:.55;cursor:default}
  .sec-btn{background:#132018;color:var(--ink);border:1px solid var(--line2);font-weight:600;padding:10px 14px}
  .exs{margin-top:12px;display:flex;gap:8px;flex-wrap:wrap}
  .ex{background:#0f1a13;border:1px solid var(--line);color:var(--dim);font-weight:500;font-size:12.5px;padding:7px 11px;border-radius:999px;text-align:left}
  .ex:hover{border-color:var(--grass2);color:var(--ink)}
  .squadref{margin-top:14px;color:var(--dim);font-size:12.5px}
  .num{display:inline-block;font-size:12px;color:var(--dim);background:var(--chip);border:1px solid var(--line);border-radius:8px;padding:2px 7px;margin:2px 3px 0 0}
  .num b{color:var(--ink)}
  #tagout{margin-top:16px}
  .thinking{display:flex;gap:9px;align-items:center;color:var(--dim);font-size:14px;padding:6px 2px}
  .tagres{border:1px solid var(--line2);border-radius:14px;padding:14px 15px;background:var(--panel2);animation:in .25s ease}
  .say{font-size:16px}
  .say.neg{color:#ffbdbd}.say.pos{color:var(--good)}
  .tagrow{margin-top:12px;display:flex;gap:7px;flex-wrap:wrap;align-items:center}
  .phase{font-size:11px;text-transform:uppercase;letter-spacing:.4px;color:#bfe9c6;background:#12251699;border:1px solid var(--line2);border-radius:7px;padding:3px 8px}
  .who{font-size:12px;color:var(--gold);background:#241f0f;border:1px solid #4a3f1f;border-radius:7px;padding:3px 8px}
  .theme{font-size:12px;color:var(--dim);background:var(--chip);border:1px solid var(--line);border-radius:7px;padding:3px 8px}
  .senti{font-size:12px;margin-left:auto;color:var(--dim)}
  .senti.neg{color:var(--warn)}.senti.pos{color:var(--good)}
  .dim{color:var(--dim)}

  /* match replay */
  .cta{display:flex;gap:14px;align-items:center;margin:8px 0 18px;flex-wrap:wrap}
  .matchbar{margin-bottom:16px;padding:14px 16px;background:var(--panel);border:1px solid var(--line);border-radius:14px}
  .vs{font-weight:800;font-size:18px}
  .grid{display:grid;grid-template-columns:1fr;gap:16px}
  @media(min-width:860px){.grid{grid-template-columns:1.12fr .88fr}}
  .feed{max-height:56vh;overflow:auto;padding:6px}
  .row{display:grid;grid-template-columns:44px 88px 1fr;gap:10px;align-items:baseline;padding:9px 10px;border-radius:10px;animation:in .25s ease}
  .row+.row{border-top:1px solid #16201580}
  @keyframes in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  .clock{color:var(--dim);font-variant-numeric:tabular-nums;font-size:13px}
  .say2{color:var(--ink)}.say2.neg{color:#ffbdbd}.say2.pos{color:var(--good)}
  .meta{margin-top:5px;display:flex;gap:5px;flex-wrap:wrap}
  .empty{color:var(--dim);padding:26px;text-align:center;font-size:14px}
  .ht{padding:18px}
  .status{display:flex;gap:10px;align-items:center;margin:12px 0;color:var(--dim);font-size:14px}
  .spin{width:15px;height:15px;border:2px solid #2a3a29;border-top-color:var(--grass);border-radius:50%;animation:sp .8s linear infinite}
  @keyframes sp{to{transform:rotate(360deg)}}
  .adj{display:flex;gap:12px;padding:13px;border:1px solid var(--line2);border-radius:12px;margin-top:10px;background:var(--panel2);animation:in .3s ease}
  .adj .n{flex:0 0 26px;height:26px;border-radius:50%;background:var(--grass);color:#05140a;font-weight:800;display:grid;place-items:center}
  .tools{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:16px}
  select{background:#132018;color:var(--ink);border:1px solid var(--line2);border-radius:10px;padding:9px 10px;font:inherit}
  #tstat{font-size:13px}
  footer{margin:64px 0 40px;text-align:center;color:var(--dim);font-size:12.5px;border-top:1px solid var(--line);padding-top:22px}
</style>
</head>
<body>
<div class="wrap">
  <nav>
    <div class="brand"><b>Gaffer</b> ⚽</div>
    <div class="pills">
      <span class="pill on">on-device</span>
      <span class="pill on">no cloud</span>
      <span class="pill on">no API key</span>
      <span class="pill" id="mode">local</span>
    </div>
  </nav>

  <header class="hero">
    <span class="kicker">Local AI · Tether Developers Cup</span>
    <h1>Your assistant coach.<br>On the touchline. <span class="g">Offline.</span></h1>
    <p class="sub">Talk through a match like you already do. Gaffer transcribes and tags every remark
      <b>on your device</b>, then at half-time hands you three concrete adjustments — read aloud, in your
      language. No cloud. The kids' data never leaves the touchline.</p>

    <div class="how">
      <div class="step"><div class="n">1</div><h3>You talk, it listens</h3><p>Every touchline remark is transcribed and tagged — which player, which phase, which theme — by a small model running on your GPU.</p></div>
      <div class="step"><div class="n">2</div><h3>A tactical timeline builds</h3><p>Not a transcript — a live, structured picture of the match: recurring issues, who's involved, what's working.</p></div>
      <div class="step"><div class="n">3</div><h3>Half-time plan</h3><p>The heavy synthesis is offloaded to your laptop over peer-to-peer, and three specific adjustments come back.</p></div>
    </div>
    <div class="banner">👇 The match below is a <b>replay of a sample game</b> — a stand-in for a live touchline mic. Every tag and the half-time plan are <b>computed live on your device</b> each time. Want proof it's real? <b>Type your own remark</b> and watch the model tag it.</div>
  </header>

  <!-- TRY IT LIVE -->
  <div class="sec"><h2>Try it live</h2><span>type a coaching remark → the on-device model tags it</span></div>
  <div class="card try">
    <div class="inputrow">
      <div class="field"><input type="text" id="remark" placeholder="e.g. their 9 keeps beating Sofia at the back post…" autocomplete="off"></div>
      <button class="primary" id="tagbtn">Tag it →</button>
    </div>
    <div class="exs" id="examples"></div>
    <div class="squadref">Reference these players by name or number: <span id="squad2"></span></div>
    <div id="tagout"></div>
  </div>

  <!-- MATCH REPLAY -->
  <div class="sec"><h2>Sample match</h2><span id="vs2">a full half, tagged live</span></div>
  <div class="matchbar"><span class="vs" id="vs">—</span><div class="meta" id="squad" style="margin-top:8px"></div></div>
  <div class="cta">
    <button class="primary" id="go">Kick off ▶</button>
    <span class="dim" id="hint" style="font-size:13px">Watch the timeline build itself, then the half-time card.</span>
  </div>
  <div class="grid">
    <div class="card">
      <div class="hd"><h3>Live touchline <span id="count" class="dim"></span></h3></div>
      <div class="feed" id="feed"><div class="empty">Press <b>Kick off</b> to replay the match.</div></div>
    </div>
    <div class="card">
      <div class="hd"><h3>Half-time</h3><span id="htbadge" class="badge"></span></div>
      <div class="ht" id="ht"><div class="empty">The three adjustments appear here at half-time.</div></div>
    </div>
  </div>

  <footer>Gaffer · match analysis for the 99% of football that isn't professional. On your hardware, not theirs.<br>
    Built on QVAC (on-device AI) + Pears (P2P). MIT licensed.</footer>
</div>

<script>
const $=(s)=>document.querySelector(s);
let delegated=false, providerKey=null, langs=[], roster=[], adjText='';
const LNAME={es:'Español',pt:'Português',fr:'Français',de:'Deutsch',it:'Italiano'};
function escapeHtml(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}

fetch('/api/config').then(r=>r.json()).then(c=>{
  delegated=c.delegated; providerKey=c.providerKey; langs=c.langs||[]; roster=c.roster||[];
  if(delegated){ const m=$('#mode'); m.textContent='P2P → laptop'; m.className='pill p2p'; }
  $('#vs').textContent=(c.team||'')+'  vs  '+(c.opponent||'');
  const chips=roster.map(p=>'<span class="num"><b>#'+p.number+'</b> '+p.name+'</span>').join('');
  $('#squad').innerHTML=chips; $('#squad2').innerHTML=chips;
});

/* ---- Try it live ---- */
const examples=[
  "Their 9 keeps beating Sofia at the back post, that's twice now.",
  "Lovely ball Mei, that's exactly what we want.",
  "We're losing every second ball in midfield, Nadia step up."
];
$('#examples').innerHTML=examples.map((t,i)=>'<button class="ex" data-i="'+i+'">'+escapeHtml(t)+'</button>').join('');
$('#examples').onclick=(e)=>{ const b=e.target.closest('.ex'); if(b){ $('#remark').value=examples[+b.dataset.i]; $('#remark').focus(); } };

async function tagNow(){
  const text=$('#remark').value.trim(); if(!text) return;
  const btn=$('#tagbtn'), out=$('#tagout'); btn.disabled=true;
  out.innerHTML='<div class="thinking"><span class="spin"></span> tagging on-device…</div>';
  try{
    const r=await fetch('/api/tag?text='+encodeURIComponent(text));
    const j=await r.json(); if(j.error) throw new Error(j.error);
    out.innerHTML=tagCard(text,j);
  }catch(e){ out.innerHTML='<div class="thinking">Error: '+escapeHtml(e.message)+'</div>'; }
  finally{ btn.disabled=false; }
}
$('#tagbtn').onclick=tagNow;
$('#remark').addEventListener('keydown',(e)=>{ if(e.key==='Enter'){ e.preventDefault(); tagNow(); } });

function tagCard(text,j){
  const who=j.players.length?j.players.map(p=>'<span class="who">#'+p.n+(p.name?' '+escapeHtml(p.name):'')+'</span>').join(''):'<span class="dim">no player named</span>';
  const themes=j.themes.map(t=>'<span class="theme">'+escapeHtml(t)+'</span>').join('');
  const tone=j.sentiment<-0.15?'neg':j.sentiment>0.15?'pos':'';
  const senti=j.sentiment<-0.15?'⚠ concern':j.sentiment>0.15?'👍 praise':'• note';
  return '<div class="tagres"><div class="say '+tone+'">"'+escapeHtml(text)+'"</div>'+
    '<div class="tagrow"><span class="phase">'+escapeHtml(j.phase)+'</span>'+who+themes+
    '<span class="senti '+tone+'">'+senti+'</span></div></div>';
}

/* ---- Match replay (SSE) ---- */
function phaseRow(e){
  const who=e.players.map(p=>'<span class="who">#'+p.n+(p.name?' '+escapeHtml(p.name):'')+'</span>').join(' ');
  const themes=e.themes.map(t=>'<span class="theme">'+escapeHtml(t)+'</span>').join(' ');
  const tone=e.sentiment<-0.15?'neg':e.sentiment>0.15?'pos':'';
  const div=document.createElement('div'); div.className='row';
  div.innerHTML='<span class="clock">'+e.clock+'</span><span class="phase">'+escapeHtml(e.phase)+'</span>'+
    '<div><span class="say2 '+tone+'">'+escapeHtml(e.text)+'</span>'+
    ((who||themes)?'<div class="meta">'+who+' '+themes+'</div>':'')+'</div>';
  return div;
}

$('#go').onclick=()=>{
  $('#go').disabled=true; $('#hint').textContent=''; $('#feed').innerHTML=''; $('#ht').innerHTML='';
  let n=0; const es=new EventSource('/api/stream');
  es.onmessage=(ev)=>{
    const e=JSON.parse(ev.data);
    if(e.type==='match'){ $('#vs').textContent=e.team+'  vs  '+e.opponent; }
    else if(e.type==='utterance'){ const f=$('#feed'); f.appendChild(phaseRow(e)); f.scrollTop=f.scrollHeight; $('#count').textContent='· '+(++n)+' remarks'; }
    else if(e.type==='halftime'){
      const chips=e.themes.slice(0,6).map(([t,c])=>'<span class="theme">'+escapeHtml(t)+' ×'+c+'</span>').join(' ');
      $('#ht').innerHTML='<div class="dim">Recurring themes</div><div class="meta" style="margin:8px 0 4px">'+chips+'</div>'+
        '<div class="status"><span class="spin"></span> Synthesizing three adjustments'+
        (delegated?' — <span class="badge">delegated to your laptop over P2P</span>':' (on-device)')+'…</div>';
    }
    else if(e.type==='adjustments'){
      const secs=(e.ms/1000).toFixed(1);
      $('#htbadge').textContent=e.delegated?('▲ P2P · '+secs+'s'):(secs+'s · local');
      adjText=e.items.map((a,i)=>(i+1)+'. '+a).join('  ');
      let html='<div class="dim">Coach — three things for the second half'+(e.delegated?' <span class="badge">(computed on your laptop, not the phone)</span>':'')+':</div>';
      e.items.forEach((a,i)=>{ html+='<div class="adj"><div class="n">'+(i+1)+'</div><div>'+escapeHtml(a)+'</div></div>'; });
      html+='<div class="tools"><button class="sec-btn" id="say">🔊 Read aloud</button>';
      if(langs.length){ html+='<select id="lang">'+langs.map(l=>'<option value="'+l+'">'+(LNAME[l]||l)+'</option>').join('')+'</select><button class="sec-btn" id="tr">Translate for the bench</button>'; }
      html+='<span id="tstat" class="dim"></span></div><audio id="au" hidden></audio>';
      $('#ht').innerHTML=html; wireTools();
    }
    else if(e.type==='done'){ es.close(); $('#go').disabled=false; $('#go').textContent='Replay ▶'; }
    else if(e.type==='error'){ es.close(); $('#ht').innerHTML='<div class="empty">Error: '+escapeHtml(e.message)+'</div>'; $('#go').disabled=false; }
  };
  es.onerror=()=>{ es.close(); $('#go').disabled=false; };
};

function wireTools(){
  const say=$('#say'), au=$('#au'), tr=$('#tr'), tstat=$('#tstat');
  if(say) say.onclick=async()=>{
    say.disabled=true; tstat.textContent='synthesizing on-device…';
    try{ const r=await fetch('/api/tts?text='+encodeURIComponent(adjText)); if(!r.ok) throw 0;
      const b=await r.blob(); au.src=URL.createObjectURL(b); await au.play(); tstat.textContent='';
    }catch(_){ tstat.textContent='TTS failed'; } finally{ say.disabled=false; }
  };
  if(tr) tr.onclick=async()=>{
    const to=$('#lang').value; tr.disabled=true; tstat.textContent='translating on-device…';
    try{ const r=await fetch('/api/translate?to='+to+'&text='+encodeURIComponent(adjText));
      const j=await r.json(); tstat.innerHTML='<span class="badge">'+(LNAME[to]||to)+'</span> '+escapeHtml(j.text||j.error||'');
    }catch(_){ tstat.textContent='translation failed'; } finally{ tr.disabled=false; }
  };
}
</script>
</body>
</html>`;
