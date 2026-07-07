// The app — pitch-centric and voice-first. One big pitch is the constant: you build
// your formation on it, then it stays through the match. During play you just tap the
// mic and talk — it transcribes on-device (Whisper), tags it, and the player you
// mention lights up on the pitch. Everything is local; your squad persists on device.
import { doc, headerHtml, footerHtml } from './shared.js';

const micIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';

const PITCH_SVG = `<svg class="pitchbg" viewBox="0 0 150 100" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#153619"/><stop offset="1" stop-color="#0c220f"/></linearGradient></defs>
  <rect width="150" height="100" fill="url(#pg)"/>
  <g fill="#ffffff" fill-opacity="0.022"><rect x="0" width="18.75" height="100"/><rect x="37.5" width="18.75" height="100"/><rect x="75" width="18.75" height="100"/><rect x="112.5" width="18.75" height="100"/></g>
  <g fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="0.4">
    <rect x="4" y="4" width="142" height="92" rx="1.5"/>
    <line x1="75" y1="4" x2="75" y2="96"/>
    <circle cx="75" cy="50" r="10"/>
    <rect x="4" y="28" width="20" height="44"/><rect x="4" y="40" width="7" height="20"/>
    <rect x="126" y="28" width="20" height="44"/><rect x="139" y="40" width="7" height="20"/>
    <path d="M24 40 A11 11 0 0 1 24 60"/><path d="M126 40 A11 11 0 0 0 126 60"/>
  </g>
  <g fill="#ffffff" fill-opacity="0.26"><circle cx="75" cy="50" r="0.9"/><circle cx="16" cy="50" r="0.9"/><circle cx="134" cy="50" r="0.9"/></g>
</svg>`;

const CSS = `
  .app{padding:118px 0 40px}
  .eyebrow{margin-bottom:22px}
  .apptitle{font-size:clamp(28px,4vw,44px);line-height:1.1;letter-spacing:-.02em;margin:0;font-weight:550}
  .apptitle em{font-style:normal;color:var(--life)}
  .sub{color:var(--muted-fg);font-size:16px;max-width:640px;margin:14px 0 0;line-height:1.6}
  .card{background:oklch(0.11 0 0);border:1px solid oklch(0.20 0 0);border-radius:18px}
  .card .hd{padding:15px 20px;border-bottom:1px solid var(--border-soft);display:flex;justify-content:space-between;align-items:center;gap:12px}
  .card .hd h3{margin:0;font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted-fg)}
  .card .bd{padding:20px}
  label.mini{display:block;font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin:0 0 7px}
  input[type=text],input[type=number]{width:100%;background:var(--bg);color:var(--fg);border:1px solid var(--border);border-radius:11px;padding:12px 14px;font:inherit;font-size:15px;outline:none;transition:border-color .15s,box-shadow .15s}
  input:focus{border-color:var(--life);box-shadow:0 0 0 3px oklch(0.74 0.18 162 / .16)}
  input::placeholder{color:var(--faint)}
  .link{background:none;border:0;color:var(--muted-fg);font:inherit;font-size:13px;cursor:pointer;text-decoration:underline;text-underline-offset:3px;padding:0}
  .link:hover{color:var(--fg)}
  .muted{color:var(--muted-fg)} .hint{color:var(--muted-fg);font-size:13px;margin-top:12px}

  /* match header */
  .matchbar{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
  .vs{font-size:clamp(22px,3vw,32px);font-weight:550;letter-spacing:-.02em;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  .vs .sep{color:var(--faint);font-weight:400}
  .oppin{background:none;border:0;border-bottom:1px dashed var(--border);color:var(--fg);font:inherit;font-size:inherit;font-weight:550;letter-spacing:-.02em;width:11ch;padding:0 2px 3px;outline:none}
  .oppin:focus{border-bottom-color:var(--life)}.oppin::placeholder{color:var(--faint)}
  .matchbar .spacer{flex:1}
  .halfseg{display:inline-flex;border:1px solid var(--border);border-radius:999px;overflow:hidden}
  .halfseg button{background:none;border:0;color:var(--muted-fg);font:inherit;font-size:13px;padding:8px 16px;cursor:pointer}
  .halfseg button.on{background:var(--muted);color:var(--fg)}
  .sec-btn{background:var(--muted);color:var(--fg);border:1px solid var(--border);font:inherit;font-size:13px;font-weight:500;padding:9px 14px;border-radius:999px;cursor:pointer;transition:border-color .2s}
  .sec-btn:hover{border-color:oklch(0.30 0 0)}

  /* the pitch (big, persistent) */
  .pitch-wrap{position:relative;width:100%;max-width:980px;aspect-ratio:3/2;border-radius:18px;overflow:hidden;border:1px solid var(--border);margin:22px auto 0;box-shadow:0 30px 80px -40px rgba(0,0,0,.85);touch-action:none}
  @media(max-width:600px){.pitch-wrap{aspect-ratio:4/3}}
  .pitchbg{position:absolute;inset:0;width:100%;height:100%;display:block}
  .tok-layer{position:absolute;inset:0}
  .pitch-empty{position:absolute;left:16px;right:16px;bottom:18px;text-align:center;color:rgba(255,255,255,.62);font-size:13px;line-height:1.5}
  .tok{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:4px;user-select:none;-webkit-user-select:none;animation:pop .18s ease}
  @keyframes pop{from{opacity:0;transform:translate(-50%,-50%) scale(.7)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
  .pitch-wrap:not(.locked) .tok{cursor:grab;touch-action:none}
  .tok.drag{cursor:grabbing;z-index:6}.tok.drag .jer{transform:scale(1.1)}
  .tok .jer{width:46px;height:46px;border-radius:50%;background:linear-gradient(180deg,#3ddc61,#1a8f37);color:#04120a;font-family:var(--mono);font-weight:600;font-size:17px;display:grid;place-items:center;border:2px solid rgba(255,255,255,.9);box-shadow:0 5px 14px rgba(0,0,0,.55);transition:transform .12s}
  @media(max-width:600px){.tok .jer{width:38px;height:38px;font-size:14px}}
  .tok .lab{font-size:11px;color:#fff;background:rgba(0,0,0,.58);padding:1px 7px;border-radius:6px;white-space:nowrap;max-width:90px;overflow:hidden;text-overflow:ellipsis}
  .tok .x{position:absolute;top:-7px;right:-7px;width:19px;height:19px;border-radius:50%;background:#2a1414;color:#ffb0b0;border:1px solid #5a2b2b;font-size:12px;line-height:1;cursor:pointer;display:none;place-items:center;padding:0}
  .pitch-wrap:not(.locked) .tok:hover .x{display:grid}
  .tok.hl .jer{animation:hl 1.6s ease}
  @keyframes hl{0%{box-shadow:0 0 0 0 rgba(61,220,97,.75)}70%{box-shadow:0 0 0 16px rgba(61,220,97,0)}100%{box-shadow:0 0 0 0 rgba(61,220,97,0)}}
  .cbadge{position:absolute;top:-8px;left:-8px;min-width:19px;height:19px;padding:0 4px;border-radius:10px;background:#0b1b10;border:1px solid oklch(0.5 0.13 162);color:var(--life);font-family:var(--mono);font-size:11px;line-height:1;display:grid;place-items:center;box-shadow:0 2px 6px rgba(0,0,0,.5)}

  .fpresets{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:18px}
  .fplabel{font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin-right:2px}
  .fchip{background:var(--bg);border:1px solid var(--border);color:var(--muted-fg);font:inherit;font-size:13px;font-weight:500;padding:7px 13px;border-radius:999px;cursor:pointer;transition:border-color .15s,color .15s}
  .fchip:hover{border-color:var(--life);color:var(--fg)}

  /* setup controls */
  .setup-row{display:grid;grid-template-columns:minmax(0,260px) 1fr;gap:18px;align-items:end;margin-top:24px}
  @media(max-width:700px){.setup-row{grid-template-columns:1fr}}
  .addbar{display:grid;grid-template-columns:90px 1fr auto;gap:10px;align-items:end}
  @media(max-width:420px){.addbar{grid-template-columns:70px 1fr auto}}
  .kbdhint{font-family:var(--mono);font-size:11px;color:var(--faint);margin-top:12px;line-height:1.5}
  .setup-actions{margin-top:22px;display:flex;gap:14px;align-items:center;flex-wrap:wrap}

  /* voice capture */
  .microw{display:flex;justify-content:center;gap:14px;align-items:center;flex-wrap:wrap;margin-top:26px}
  .mic{display:inline-flex;align-items:center;gap:11px;background:linear-gradient(180deg,var(--life),oklch(0.62 0.16 162));color:#05140a;border:0;border-radius:999px;padding:16px 28px;font:inherit;font-weight:600;font-size:16px;cursor:pointer;transition:transform .15s}
  .mic:hover{transform:translateY(-1px)}
  .mic.rec{background:#2a1414;color:#ffc2c2;animation:mpulse 1.5s infinite}.mic.rec svg{color:#ff6a6a}
  @keyframes mpulse{0%{box-shadow:0 0 0 0 rgba(255,90,90,.45)}70%{box-shadow:0 0 0 18px rgba(255,90,90,0)}100%{box-shadow:0 0 0 0 rgba(255,90,90,0)}}
  .mic.proc{opacity:.65;cursor:default}
  .minf{display:flex;align-items:center;gap:8px;color:var(--muted-fg);font-family:var(--mono);font-size:12px}.minf input{width:64px}
  .capmsg{margin-top:12px;color:var(--muted-fg);font-size:13.5px;min-height:18px;display:flex;align-items:center;gap:9px;justify-content:center}
  .spin{width:14px;height:14px;border:2px solid var(--muted);border-top-color:var(--life);border-radius:50%;animation:sp .8s linear infinite;display:inline-block}
  @keyframes sp{to{transform:rotate(360deg)}}
  .typerow{display:grid;grid-template-columns:1fr auto;gap:10px;margin:14px auto 0;max-width:560px}
  .typerow[hidden]{display:none}

  .mgrid{display:grid;grid-template-columns:1fr;gap:18px;margin-top:26px}
  @media(min-width:900px){.mgrid{grid-template-columns:1.1fr .9fr;align-items:start}}
  .feed{max-height:40vh;overflow:auto}
  .rrow{display:grid;grid-template-columns:46px 92px 1fr auto;gap:12px;align-items:baseline;padding:12px 4px;animation:in .25s ease}
  .rrow+.rrow{border-top:1px solid var(--border-soft)}
  @keyframes in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  .clock{color:var(--faint);font-family:var(--mono);font-size:12.5px}
  .say2{color:var(--fg);font-size:14.5px}.say2.neg{color:oklch(0.74 0.13 25)}.say2.pos{color:var(--life)}
  .meta{margin-top:7px;display:flex;gap:6px;flex-wrap:wrap}
  .phase{font-family:var(--mono);font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--muted-fg);border:1px solid var(--border-soft);border-radius:6px;padding:4px 8px;height:fit-content}
  .who{font-family:var(--mono);font-size:11.5px;color:var(--fg);background:var(--muted);border:1px solid var(--border);border-radius:6px;padding:3px 8px}
  .theme{font-size:12px;color:var(--muted-fg);background:var(--surface2);border:1px solid var(--border-soft);border-radius:6px;padding:3px 8px}
  .del{background:none;border:0;color:var(--faint);cursor:pointer;font-size:16px;line-height:1;padding:2px 6px}.del:hover{color:var(--danger)}
  .empty{color:var(--muted-fg);padding:22px 4px;text-align:center;font-size:14px}
  .acts{display:flex;gap:10px;flex-wrap:wrap}
  .badge2{font-family:var(--mono);font-size:11.5px;color:var(--lineage)}
  .adj{display:flex;gap:14px;padding:15px;border:1px solid var(--border-soft);border-radius:11px;margin-top:11px;background:var(--bg);animation:in .3s ease}
  .adj .n{flex:0 0 24px;height:24px;border-radius:50%;border:1px solid var(--border);background:var(--muted);color:var(--fg);font-family:var(--mono);font-size:12px;display:grid;place-items:center}
  .adj .tx{font-size:14.5px;line-height:1.55}
  .report{margin-top:12px;white-space:pre-wrap;font-size:14.5px;line-height:1.7;color:var(--fg)}
  .report .lbl{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--life);display:block;margin:14px 0 6px}
  .tools{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:18px}
  select{background:var(--muted);color:var(--fg);border:1px solid var(--border);border-radius:9px;padding:9px 11px;font:inherit;font-size:13px}
  #tstat{font-size:13px}
`;

const BODY = `
${headerHtml({ links: [{ href: '/#how', label: 'How it works' }, { href: '/#features', label: 'Features' }], cta: { label: 'Home', href: '/' } })}

<main class="wrap app">
  <div id="setupTop">
    <div class="eyebrow"><span class="sq"></span><span class="lbl">Your squad</span><span class="dots"></span></div>
    <h1 class="apptitle">Set your <em>formation</em>.</h1>
    <p class="sub">Add your players and drag them into shape. It's saved on your device and stays on screen through the match — during play you just tap the mic and talk.</p>
  </div>

  <div id="matchTop" hidden>
    <div class="matchbar">
      <span class="vs"><span id="teamLbl">—</span><span class="sep">vs</span><input class="oppin" id="oppInput" placeholder="Opponent"></span>
      <span class="spacer"></span>
      <div class="halfseg" id="halfSeg"><button data-h="1" class="on">1st half</button><button data-h="2">2nd half</button></div>
      <button class="sec-btn" id="editTeam">Edit team</button>
      <button class="sec-btn" id="newMatch">New match</button>
    </div>
  </div>

  <div class="pitch-wrap" id="pitch">
    ${PITCH_SVG}
    <div class="tok-layer" id="tokens"></div>
    <div class="pitch-empty" id="pitchEmpty">Add your players below — they'll appear on the pitch.<br>Drag them to set your formation.</div>
  </div>

  <!-- SETUP controls -->
  <div id="setupCtl">
    <div class="setup-row">
      <div><label class="mini">Team name (optional)</label><input type="text" id="teamName" placeholder="e.g. Riverside U-14" autocomplete="off"></div>
      <div>
        <label class="mini">Add a player <span id="squadCnt" class="muted" style="font-family:var(--mono);letter-spacing:.02em;text-transform:none"></span></label>
        <div class="addbar">
          <input type="number" id="pNum" placeholder="No." min="1" max="99">
          <input type="text" id="pName" placeholder="Player name" autocomplete="off">
          <button class="btn pri" id="pAdd">Add</button>
        </div>
      </div>
    </div>
    <div class="fpresets" id="fpresets"><span class="fplabel">Quick formation</span><button class="fchip" data-f="4-4-2">4-4-2</button><button class="fchip" data-f="4-3-3">4-3-3</button><button class="fchip" data-f="4-2-3-1">4-2-3-1</button><button class="fchip" data-f="3-5-2">3-5-2</button><button class="fchip" data-f="3-4-3">3-4-3</button></div>
    <div class="kbdhint">Number, name, Enter for the next. Tap a formation or drag players on the pitch to set your shape.</div>
    <div class="setup-actions">
      <button class="btn pri lg" id="startMatch" disabled>Start a match →</button>
      <span class="muted" id="setupHint" style="font-size:13px"></span>
    </div>
  </div>

  <!-- MATCH controls -->
  <div id="matchCtl" hidden>
    <div class="microw">
      <button class="mic" id="mic">${micIcon}<span id="micLabel">Tap to record a note</span></button>
      <span class="minf">min <input type="number" id="min" min="0" max="120" value="3"></span>
      <button class="link" id="typeToggle">or type it</button>
    </div>
    <div class="capmsg" id="capmsg"></div>
    <div class="typerow" id="typeRow" hidden>
      <input type="text" id="remark" placeholder="Type what you would call out" autocomplete="off">
      <button class="btn pri" id="addText">Add</button>
    </div>

    <div class="mgrid">
      <div class="card">
        <div class="hd"><h3>Match notes <span id="count" class="muted"></span></h3></div>
        <div class="bd"><div class="feed" id="feed"><div class="empty">Tap the mic and say what you'd call out. It's transcribed and tagged on your device, and the player lights up on the pitch.</div></div></div>
      </div>
      <div class="card">
        <div class="hd"><h3>Match analysis</h3><span id="anaBadge" class="badge2"></span></div>
        <div class="bd">
          <div class="acts"><button class="btn pri" id="getplan" disabled>Half-time plan</button><button class="sec-btn" id="getreport" disabled>Full-time report</button></div>
          <div class="hint" id="anaHint">Add a couple of notes, then get your half-time plan.</div>
          <div id="analysis"></div>
        </div>
      </div>
    </div>
  </div>
</main>

${footerHtml()}
`;

const SCRIPT = `
const $=(s)=>document.querySelector(s);
const enc=encodeURIComponent;
function esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
function mmss(ms){const t=Math.floor(ms/1000);return String(Math.floor(t/60)).padStart(2,"0")+":"+String(t%60).padStart(2,"0");}
const TEAM_KEY="gaffer:team:v3", MATCH_KEY="gaffer:match:v3";
const LNAME={es:"Español",pt:"Português",fr:"Français",de:"Deutsch",it:"Italiano"};

let delegated=false, langs=[], mode="setup", lastText="";
let team=load(TEAM_KEY);   // {name, roster:[{number,name,x,y,position}]}
let match=load(MATCH_KEY); // {half, opponent, utterances:[...]}
let draft=[];              // working roster while in setup

function load(k){ try{ return JSON.parse(localStorage.getItem(k)); }catch(_){ return null; } }
function save(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(_){} }
fetch("/api/config").then(r=>r.json()).then(c=>{ delegated=c.delegated; langs=c.langs||[]; });

/* formation slots (horizontal: x = own-goal→attack left→right, y = top→bottom) */
const SLOTS=[[8,50],[24,20],[24,40],[24,60],[24,80],[50,26],[50,50],[50,74],[76,26],[76,50],[76,74]];
function slotFor(i){ return SLOTS[i]||[38+((i*17)%40),44+((i*13)%12)]; }
function role(x,y){ if(x<=15) return "GK"; const s=y<34?"R":y>66?"L":"C"; if(x<=40) return s==="C"?"CB":s+"B"; if(x<=64) return s+"M"; return s==="C"?"ST":s+"W"; }
function pitchPlayers(){ return mode==="setup"?draft:(team?team.roster:[]); }
const FORMATIONS={
  "4-4-2":[[8,50],[24,18],[24,40],[24,60],[24,82],[50,18],[50,40],[50,60],[50,82],[77,38],[77,62]],
  "4-3-3":[[8,50],[24,18],[24,40],[24,60],[24,82],[48,28],[48,50],[48,72],[77,22],[77,50],[77,78]],
  "4-2-3-1":[[8,50],[24,18],[24,40],[24,60],[24,82],[42,38],[42,62],[62,22],[62,50],[62,78],[80,50]],
  "3-5-2":[[8,50],[24,30],[24,50],[24,70],[48,14],[48,34],[48,50],[48,66],[48,86],[77,38],[77,62]],
  "3-4-3":[[8,50],[24,30],[24,50],[24,70],[50,18],[50,40],[50,60],[50,82],[77,22],[77,50],[77,78]],
};
function applyFormation(name){ const s=FORMATIONS[name]; if(!s) return; draft.forEach((p,i)=>{ if(s[i]){ p.x=s[i][0]; p.y=s[i][1]; } }); renderPitch(); }
/* how many notes reference each player, this match */
function noteCounts(){ const m={}; (match?match.utterances:[]).forEach(u=>(u.players||[]).forEach(p=>{ m[p.n]=(m[p.n]||0)+1; })); return m; }
function updateCounts(){ if(mode!=="match") return; const c=noteCounts(); $("#tokens").querySelectorAll(".tok").forEach(t=>{ const n=+t.dataset.num, v=c[n]||0; let b=t.querySelector(".cbadge"); if(v>0){ if(!b){ b=document.createElement("div"); b.className="cbadge"; t.appendChild(b); } b.textContent=v; } else if(b){ b.remove(); } }); }

function show(view){
  mode=view;
  $("#setupTop").hidden=view!=="setup"; $("#matchTop").hidden=view!=="match";
  $("#setupCtl").hidden=view!=="setup"; $("#matchCtl").hidden=view!=="match";
  $("#pitch").classList.toggle("locked",view==="match");
  if(view==="match") renderMatch(); else renderPitch();
}
function hasTeam(){ return team && Array.isArray(team.roster) && team.roster.length>0; }
function boot(){ if(hasTeam()){ if(!match) match={half:1,opponent:"",utterances:[]}; show("match"); } else openSetup(); }

/* ---------- PITCH (shared) ---------- */
function renderPitch(){
  const editable=mode==="setup", players=pitchPlayers();
  $("#tokens").innerHTML=players.map((p,i)=>'<div class="tok" data-i="'+i+'" data-num="'+p.number+'" style="left:'+p.x+'%;top:'+p.y+'%">'+(editable?'<button class="x" data-x="'+i+'" title="Remove">×</button>':"")+'<div class="jer">'+p.number+'</div><div class="lab">'+esc(p.name)+'</div></div>').join("");
  if($("#pitchEmpty")) $("#pitchEmpty").style.display=players.length?"none":"block";
  if(editable){ if($("#squadCnt")) $("#squadCnt").textContent=players.length?("· "+players.length+" on the pitch"):""; if($("#startMatch")) $("#startMatch").disabled=players.length<1; bindDrag(); }
}
function bindDrag(){
  const pitch=$("#pitch");
  $("#tokens").querySelectorAll(".tok").forEach(tok=>{
    tok.onpointerdown=(e)=>{
      if(mode!=="setup"||e.target.closest(".x")) return; e.preventDefault();
      const i=+tok.dataset.i; tok.classList.add("drag"); try{ tok.setPointerCapture(e.pointerId); }catch(_){}
      const rect=pitch.getBoundingClientRect();
      const move=(ev)=>{ let x=(ev.clientX-rect.left)/rect.width*100, y=(ev.clientY-rect.top)/rect.height*100; x=Math.max(4,Math.min(96,x)); y=Math.max(6,Math.min(94,y)); tok.style.left=x+"%"; tok.style.top=y+"%"; if(draft[i]){ draft[i].x=x; draft[i].y=y; } };
      const up=()=>{ tok.classList.remove("drag"); tok.removeEventListener("pointermove",move); tok.removeEventListener("pointerup",up); tok.removeEventListener("pointercancel",up); };
      tok.addEventListener("pointermove",move); tok.addEventListener("pointerup",up); tok.addEventListener("pointercancel",up);
    };
  });
}
function highlight(nums){ (nums||[]).forEach(n=>{ const t=$('#tokens .tok[data-num="'+n+'"]'); if(t){ t.classList.remove("hl"); void t.offsetWidth; t.classList.add("hl"); } }); }

/* ---------- SETUP ---------- */
function openSetup(){ team=team||{name:"",roster:[]}; $("#teamName").value=team.name||"";
  draft=(team.roster||[]).map((p,i)=>({number:p.number,name:p.name,x:typeof p.x==="number"?p.x:slotFor(i)[0],y:typeof p.y==="number"?p.y:slotFor(i)[1]}));
  show("setup"); }
function addPlayer(){
  const num=parseInt($("#pNum").value,10), name=$("#pName").value.trim();
  if(!Number.isInteger(num)||!name){ $("#setupHint").textContent="Enter a number and a name."; return; }
  if(draft.some(p=>p.number===num)){ $("#setupHint").textContent="Number "+num+" is already taken."; return; }
  const s=slotFor(draft.length); draft.push({number:num,name,x:s[0],y:s[1]});
  $("#pNum").value=""; $("#pName").value=""; $("#setupHint").textContent=""; $("#pNum").focus(); renderPitch();
}
$("#pAdd").onclick=addPlayer;
$("#fpresets").addEventListener("click",e=>{ const b=e.target.closest("[data-f]"); if(b) applyFormation(b.dataset.f); });
$("#pNum").addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); $("#pName").focus(); }});
$("#pName").addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); addPlayer(); }});
$("#tokens").addEventListener("click",e=>{ const b=e.target.closest("[data-x]"); if(b&&mode==="setup"){ draft.splice(+b.dataset.x,1); renderPitch(); }});
$("#startMatch").onclick=()=>{ team={name:$("#teamName").value.trim()||"My team",roster:draft.map(p=>({number:p.number,name:p.name,x:p.x,y:p.y,position:role(p.x,p.y)}))}; save(TEAM_KEY,team); if(!match) match={half:1,opponent:"",utterances:[]}; saveMatch(); show("match"); };

/* ---------- MATCH ---------- */
function saveMatch(){ save(MATCH_KEY,match); }
function rosterForApi(){ return team.roster.map(p=>({number:p.number,name:p.name,position:p.position})); }
function renderMatch(){
  $("#teamLbl").textContent=team.name; $("#oppInput").value=match.opponent||"";
  $("#halfSeg").querySelectorAll("button").forEach(b=>b.classList.toggle("on",+b.dataset.h===match.half));
  renderPitch(); renderFeed(); updateCounts();
}
$("#oppInput").addEventListener("input",()=>{ match.opponent=$("#oppInput").value.trim(); saveMatch(); });
$("#halfSeg").addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return; match.half=+b.dataset.h; saveMatch(); renderMatch(); });
$("#editTeam").onclick=openSetup;
$("#newMatch").onclick=()=>{ if(!confirm("Start a new match? This clears the notes (your squad is kept).")) return; match={half:1,opponent:"",utterances:[]}; lastText=""; $("#analysis").innerHTML=""; $("#anaBadge").textContent=""; saveMatch(); renderMatch(); };

function renderFeed(){
  const f=$("#feed");
  if(!match.utterances.length){ f.innerHTML='<div class="empty">Tap the mic and say what you\\'d call out. It\\'s transcribed and tagged on your device, and the player lights up on the pitch.</div>'; }
  else{ match.utterances.sort((a,b)=>a.tMs-b.tMs);
    f.innerHTML=match.utterances.map((u,i)=>{
      const who=(u.players||[]).map(p=>'<span class="who">#'+p.n+(p.name?' '+esc(p.name):'')+'</span>').join(" ");
      const themes=(u.themes||[]).map(t=>'<span class="theme">'+esc(t)+'</span>').join(" ");
      const tone=u.sentiment<-0.15?"neg":u.sentiment>0.15?"pos":"";
      return '<div class="rrow"><span class="clock">'+mmss(u.tMs)+'</span><span class="phase">'+esc(u.phase||"general")+'</span><div><span class="say2 '+tone+'">'+esc(u.text)+'</span>'+((who||themes)?'<div class="meta">'+who+' '+themes+'</div>':'')+'</div><button class="del" data-del="'+i+'" title="Remove">×</button></div>';
    }).join(""); f.scrollTop=f.scrollHeight; }
  $("#count").textContent=match.utterances.length?("· "+match.utterances.length+" note"+(match.utterances.length>1?"s":"")):"";
  const ready=match.utterances.length>=1; $("#getplan").disabled=!ready; $("#getreport").disabled=!ready; $("#anaHint").style.display=ready?"none":"block";
}
$("#feed").addEventListener("click",e=>{ const b=e.target.closest("[data-del]"); if(b){ match.utterances.splice(+b.dataset.del,1); saveMatch(); renderFeed(); updateCounts(); }});

function curMin(){ return Math.max(0,Math.min(120,parseInt($("#min").value||"1",10))); }
function bumpMin(){ $("#min").value=Math.min(120,curMin()+2); }
function addNote(u){ match.utterances.push(u); saveMatch(); renderFeed(); bumpMin(); highlight((u.players||[]).map(p=>p.n)); updateCounts(); }
function capMsg(html,spin){ $("#capmsg").innerHTML=(spin?'<span class="spin"></span>':"")+(html||""); }

/* voice capture (tap-to-talk → on-device Whisper) */
let stream=null, rec=null, chunks=[], recording=false;
function setMic(state){ const m=$("#mic"), l=$("#micLabel"); m.classList.remove("rec","proc");
  if(state==="rec"){ m.classList.add("rec"); l.textContent="Listening… tap to stop"; }
  else if(state==="proc"){ m.classList.add("proc"); l.textContent="Working…"; }
  else l.textContent="Tap to record a note"; }
async function startRec(){
  try{ if(!stream) stream=await navigator.mediaDevices.getUserMedia({audio:true});
    chunks=[]; rec=new MediaRecorder(stream); rec.ondataavailable=e=>{ if(e.data&&e.data.size) chunks.push(e.data); }; rec.onstop=onStop;
    rec.start(); recording=true; setMic("rec"); capMsg("");
  }catch(e){ capMsg("Microphone not available — type your note instead."); showType(true); }
}
function stopRec(){ if(rec&&recording){ recording=false; try{ rec.stop(); }catch(_){}; setMic("proc"); } }
async function onStop(){
  const blob=new Blob(chunks,{type:(rec&&rec.mimeType)||"audio/webm"}); const min=curMin();
  try{ capMsg("Transcribing on-device…",true);
    const audio=await blobToWav16(blob);
    const r=await fetch("/api/voicenote",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({audio,roster:rosterForApi()})});
    const j=await r.json(); if(j.error) throw new Error(j.error);
    if(!j.text){ capMsg("Didn't catch that — try again."); setMic("idle"); return; }
    addNote({text:j.text,tMs:min*60000,players:j.players,phase:j.phase,themes:j.themes,sentiment:j.sentiment}); capMsg(""); setMic("idle");
  }catch(e){ capMsg("Could not transcribe: "+e.message); setMic("idle"); }
}
$("#mic").onclick=()=>{ if($("#mic").classList.contains("proc")) return; recording?stopRec():startRec(); };

async function blobToWav16(blob){
  const ac=new (window.AudioContext||window.webkitAudioContext)();
  const decoded=await ac.decodeAudioData(await blob.arrayBuffer());
  const chs=decoded.numberOfChannels, len=decoded.length, mono=new Float32Array(len);
  for(let c=0;c<chs;c++){ const d=decoded.getChannelData(c); for(let i=0;i<len;i++) mono[i]+=d[i]/chs; }
  const outRate=16000, inRate=decoded.sampleRate, outLen=Math.max(1,Math.floor(len*outRate/inRate)), out=new Float32Array(outLen);
  for(let i=0;i<outLen;i++){ const t=i*inRate/outRate, i0=Math.floor(t), i1=Math.min(i0+1,len-1), f=t-i0; out[i]=mono[i0]*(1-f)+mono[i1]*f; }
  try{ ac.close(); }catch(_){}
  const buf=new ArrayBuffer(44+outLen*2), dv=new DataView(buf), ws=(o,s)=>{ for(let i=0;i<s.length;i++) dv.setUint8(o+i,s.charCodeAt(i)); };
  ws(0,"RIFF"); dv.setUint32(4,36+outLen*2,true); ws(8,"WAVE"); ws(12,"fmt "); dv.setUint32(16,16,true); dv.setUint16(20,1,true); dv.setUint16(22,1,true); dv.setUint32(24,outRate,true); dv.setUint32(28,outRate*2,true); dv.setUint16(32,2,true); dv.setUint16(34,16,true); ws(36,"data"); dv.setUint32(40,outLen*2,true);
  let o=44; for(let i=0;i<outLen;i++){ let s=Math.max(-1,Math.min(1,out[i])); dv.setInt16(o,s<0?s*0x8000:s*0x7fff,true); o+=2; }
  const bytes=new Uint8Array(buf); let bin=""; const CH=0x8000;
  for(let i=0;i<bytes.length;i+=CH) bin+=String.fromCharCode.apply(null,bytes.subarray(i,i+CH));
  return btoa(bin);
}

function showType(on){ $("#typeRow").hidden=!on; if(on) $("#remark").focus(); }
$("#typeToggle").onclick=()=>showType($("#typeRow").hidden);
async function addText(){
  const text=$("#remark").value.trim(); if(!text) return; const btn=$("#addText"); btn.disabled=true; const min=curMin();
  try{ const r=await fetch("/api/tag",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({text,roster:rosterForApi()})});
    const j=await r.json(); if(j.error) throw new Error(j.error);
    addNote({text,tMs:min*60000,players:j.players,phase:j.phase,themes:j.themes,sentiment:j.sentiment}); $("#remark").value=""; $("#remark").focus();
  }catch(e){ alert("Could not tag that: "+e.message); } finally{ btn.disabled=false; }
}
$("#addText").onclick=addText;
$("#remark").addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); addText(); }});

/* analysis */
function payload(extra){ return Object.assign({team:team.name,opponent:match.opponent||"Opponent",roster:rosterForApi(),utterances:match.utterances.map(u=>({text:u.text,tMs:u.tMs,players:(u.players||[]).map(p=>p.n),phase:u.phase,themes:u.themes,sentiment:u.sentiment}))},extra||{}); }
function analysing(label){ $("#analysis").innerHTML='<div class="hint" style="display:flex;gap:9px;align-items:center;margin-top:14px"><span class="spin"></span> '+label+(delegated?' — <span class="badge2">on your laptop over P2P</span>':" on-device")+'…</div>'; }
function toolsRow(){ let h='<div class="tools"><button class="sec-btn" id="say">🔊 Read aloud</button>'; if(langs.length){ h+='<select id="lang">'+langs.map(l=>'<option value="'+l+'">'+(LNAME[l]||l)+'</option>').join("")+'</select><button class="sec-btn" id="tr">Translate</button>'; } return h+'<span id="tstat" class="muted"></span></div><audio id="au" hidden></audio>'; }
$("#getplan").onclick=async()=>{ $("#getplan").disabled=true; analysing("Building your half-time plan");
  try{ const r=await fetch("/api/synthesize",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload({half:match.half===1}))}); const j=await r.json(); if(j.error) throw new Error(j.error);
    $("#anaBadge").textContent=(j.delegated?"P2P · ":"")+(j.ms/1000).toFixed(1)+"s"; lastText=j.adjustments.map((a,i)=>(i+1)+". "+a).join("  ");
    let html='<div class="muted" style="font-size:13.5px;margin-top:6px">'+(match.half===1?"Three things for the second half:":"Three things to take into the next match:")+'</div>';
    j.adjustments.forEach((a,i)=>{ html+='<div class="adj"><div class="n">'+(i+1)+'</div><div class="tx">'+esc(a)+'</div></div>'; });
    $("#analysis").innerHTML=html+toolsRow(); wireTools();
  }catch(e){ $("#analysis").innerHTML='<div class="empty">Could not build the plan: '+esc(e.message)+'</div>'; } finally{ $("#getplan").disabled=false; }
};
$("#getreport").onclick=async()=>{ $("#getreport").disabled=true; analysing("Writing the match report");
  try{ const r=await fetch("/api/report",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload())}); const j=await r.json(); if(j.error) throw new Error(j.error);
    $("#anaBadge").textContent=(j.delegated?"P2P · ":"")+(j.ms/1000).toFixed(1)+"s"; lastText=j.report;
    $("#analysis").innerHTML='<div class="report">'+esc(j.report).replace(/^(PATTERNS:|PLAYERS:)/gm,'<span class="lbl">$1</span>')+'</div>'+toolsRow(); wireTools();
  }catch(e){ $("#analysis").innerHTML='<div class="empty">Could not write the report: '+esc(e.message)+'</div>'; } finally{ $("#getreport").disabled=false; }
};
function wireTools(){
  const say=$("#say"), au=$("#au"), tr=$("#tr"), tstat=$("#tstat");
  if(say) say.onclick=async()=>{ say.disabled=true; tstat.textContent="synthesizing on-device…";
    try{ const r=await fetch("/api/tts?text="+enc(lastText)); if(!r.ok) throw 0; const b=await r.blob(); au.src=URL.createObjectURL(b); await au.play(); tstat.textContent=""; }catch(_){ tstat.textContent="audio failed"; } finally{ say.disabled=false; } };
  if(tr) tr.onclick=async()=>{ const to=$("#lang").value; tr.disabled=true; tstat.textContent="translating on-device…";
    try{ const r=await fetch("/api/translate?to="+to+"&text="+enc(lastText)); const j=await r.json(); tstat.innerHTML='<span class="badge2">'+(LNAME[to]||to)+'</span> '+esc(j.text||j.error||""); }catch(_){ tstat.textContent="translation failed"; } finally{ tr.disabled=false; } };
}

const hdr=document.getElementById("hdr");
addEventListener("scroll",()=>hdr.classList.toggle("scrolled",scrollY>8),{passive:true});
boot();
`;

export const APP_PAGE = doc({ title: 'Gaffer — your match', body: BODY, style: CSS, script: SCRIPT });
