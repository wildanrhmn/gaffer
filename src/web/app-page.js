// The app — a real, ready-to-use tool. No scripted demo and no server-side fixture:
// the coach sets up their own squad (persisted on device), then runs an actual match.
// Flow: Set up team → First half (live tagging) → Half-time plan → Second half → Full-time report.
import { doc, headerHtml, footerHtml } from './shared.js';

const CSS = `
  .app{padding:120px 0 40px}
  .eyebrow{margin-bottom:26px}
  .apptitle{font-size:clamp(30px,4.4vw,48px);line-height:1.1;letter-spacing:-.02em;margin:0;font-weight:550}
  .apptitle em{font-style:normal;color:var(--life)}
  .sub{color:var(--muted-fg);font-size:17px;max-width:640px;margin:16px 0 0;line-height:1.6}
  .card{background:oklch(0.11 0 0);border:1px solid oklch(0.20 0 0);border-radius:18px}
  .card .hd{padding:16px 22px;border-bottom:1px solid var(--border-soft);display:flex;justify-content:space-between;align-items:center;gap:12px}
  .card .hd h3{margin:0;font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted-fg)}
  .card .bd{padding:22px}
  label.mini{display:block;font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin:0 0 7px}
  input[type=text],input[type=number]{width:100%;background:var(--bg);color:var(--fg);border:1px solid var(--border);border-radius:11px;padding:13px 14px;font:inherit;font-size:15px;outline:none;transition:border-color .15s,box-shadow .15s}
  input:focus{border-color:var(--life);box-shadow:0 0 0 3px oklch(0.74 0.18 162 / .16)}
  input::placeholder{color:var(--faint)}
  .link{background:none;border:0;color:var(--muted-fg);font:inherit;font-size:13px;cursor:pointer;text-decoration:underline;text-underline-offset:3px;padding:0}
  .link:hover{color:var(--fg)}
  .muted{color:var(--muted-fg)}

  /* setup */
  .two{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  @media(max-width:560px){.two{grid-template-columns:1fr}}
  .addrow{display:grid;grid-template-columns:78px 1fr 110px auto;gap:10px;align-items:end;margin-top:8px}
  @media(max-width:560px){.addrow{grid-template-columns:70px 1fr auto}.addrow .posf{display:none}}
  .players{margin-top:16px;display:flex;flex-direction:column;gap:8px}
  .prow{display:flex;align-items:center;gap:12px;padding:11px 14px;border:1px solid var(--border-soft);border-radius:12px;background:var(--bg)}
  .prow .pn{font-family:var(--mono);font-size:13px;color:var(--fg);background:var(--muted);border:1px solid var(--border);border-radius:7px;padding:3px 9px;min-width:38px;text-align:center}
  .prow .pnm{font-weight:500}
  .prow .ppos{margin-left:auto;font-family:var(--mono);font-size:11px;color:var(--faint);text-transform:uppercase}
  .prow .x{background:none;border:0;color:var(--faint);cursor:pointer;font-size:18px;line-height:1}
  .prow .x:hover{color:var(--danger)}
  .empty{color:var(--muted-fg);padding:22px 4px;text-align:center;font-size:14px}
  .setup-actions{margin-top:24px;display:flex;gap:14px;align-items:center;flex-wrap:wrap}

  /* match */
  .matchbar{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:6px}
  .vs{font-size:clamp(22px,3vw,30px);font-weight:550;letter-spacing:-.02em}
  .matchbar .spacer{flex:1}
  .halfseg{display:inline-flex;border:1px solid var(--border);border-radius:999px;overflow:hidden}
  .halfseg button{background:none;border:0;color:var(--muted-fg);font:inherit;font-size:13px;padding:8px 16px;cursor:pointer}
  .halfseg button.on{background:var(--muted);color:var(--fg)}
  .grid{display:grid;grid-template-columns:1fr;gap:18px;margin-top:22px}
  @media(min-width:940px){.grid{grid-template-columns:1.18fr .82fr;align-items:start}}
  .squadref{color:var(--muted-fg);font-size:12.5px;margin-bottom:16px}
  .num{display:inline-block;font-family:var(--mono);font-size:11.5px;color:var(--muted-fg);background:var(--bg);border:1px solid var(--border-soft);border-radius:7px;padding:2px 7px;margin:2px 4px 0 0}
  .num b{color:var(--fg);font-weight:500}
  .adder{display:grid;grid-template-columns:78px 1fr auto;gap:10px;align-items:end}
  @media(max-width:520px){.adder{grid-template-columns:64px 1fr auto}}
  .feed{margin-top:8px;max-height:46vh;overflow:auto}
  .rrow{display:grid;grid-template-columns:46px 92px 1fr auto;gap:12px;align-items:baseline;padding:12px 4px;animation:in .25s ease}
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
  .thinking{display:flex;gap:10px;align-items:center;color:var(--muted-fg);font-size:14px;padding:10px 4px}
  .spin{width:15px;height:15px;border:2px solid var(--muted);border-top-color:var(--life);border-radius:50%;animation:sp .8s linear infinite}
  @keyframes sp{to{transform:rotate(360deg)}}
  .acts{display:flex;gap:10px;flex-wrap:wrap}
  .badge2{font-family:var(--mono);font-size:11.5px;color:var(--lineage)}
  .adj{display:flex;gap:14px;padding:15px;border:1px solid var(--border-soft);border-radius:11px;margin-top:11px;background:var(--bg);animation:in .3s ease}
  .adj .n{flex:0 0 24px;height:24px;border-radius:50%;border:1px solid var(--border);background:var(--muted);color:var(--fg);font-family:var(--mono);font-size:12px;display:grid;place-items:center}
  .adj .tx{font-size:14.5px;line-height:1.55}
  .report{margin-top:12px;white-space:pre-wrap;font-size:14.5px;line-height:1.7;color:var(--fg)}
  .report .lbl{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--life);display:block;margin:14px 0 6px}
  .tools{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:18px}
  select{background:var(--muted);color:var(--fg);border:1px solid var(--border);border-radius:9px;padding:9px 11px;font:inherit;font-size:13px}
  .sec-btn{background:var(--muted);color:var(--fg);border:1px solid var(--border);font:inherit;font-size:13px;font-weight:500;padding:10px 14px;border-radius:999px;cursor:pointer;transition:border-color .2s}
  .sec-btn:hover{border-color:oklch(0.30 0 0)}
  #tstat{font-size:13px}
  .hint{color:var(--muted-fg);font-size:13px;margin-top:12px}
`;

const BODY = `
${headerHtml({ links: [{ href: '/#how', label: 'How it works' }, { href: '/#features', label: 'Features' }], cta: { label: 'Home', href: '/' } })}

<main class="wrap app">
  <!-- SET UP YOUR TEAM -->
  <section id="setup" hidden>
    <div class="eyebrow"><span class="sq"></span><span class="lbl">Set up</span><span class="dots"></span></div>
    <h1 class="apptitle">Your <em>squad</em>.</h1>
    <p class="sub">Add your team once and Gaffer remembers it on this device. Everything stays local. You can edit it any time.</p>

    <div class="card" style="margin-top:28px">
      <div class="bd">
        <div class="two">
          <div><label class="mini">Your team</label><input type="text" id="teamName" placeholder="e.g. Riverside U-14" autocomplete="off"></div>
          <div><label class="mini">Opponent</label><input type="text" id="oppName" placeholder="e.g. Oakfield" autocomplete="off"></div>
        </div>

        <div style="margin-top:22px"><label class="mini">Add players</label></div>
        <div class="addrow">
          <div><input type="number" id="pNum" placeholder="No." min="1" max="99"></div>
          <div><input type="text" id="pName" placeholder="Player name" autocomplete="off"></div>
          <div class="posf"><input type="text" id="pPos" placeholder="Pos (opt)" autocomplete="off"></div>
          <button class="btn pri" id="pAdd">Add</button>
        </div>
        <div class="players" id="players"></div>

        <div class="setup-actions">
          <button class="btn pri lg" id="startMatch" disabled>Start match →</button>
          <button class="link" id="sampleBtn">Load a sample squad</button>
          <span class="muted" id="setupHint" style="font-size:13px"></span>
        </div>
      </div>
    </div>
  </section>

  <!-- MATCH -->
  <section id="match" hidden>
    <div class="matchbar">
      <span class="vs" id="vs">—</span>
      <span class="spacer"></span>
      <div class="halfseg" id="halfSeg"><button data-h="1" class="on">1st half</button><button data-h="2">2nd half</button></div>
      <button class="sec-btn" id="editTeam">Edit team</button>
      <button class="sec-btn" id="newMatch">New match</button>
    </div>

    <div class="grid">
      <div class="card">
        <div class="hd"><h3>Live touchline <span id="count" class="muted"></span></h3></div>
        <div class="bd">
          <div class="squadref">Your squad: <span id="squad"></span></div>
          <div class="adder">
            <div><label class="mini">Min</label><input type="number" id="min" min="0" max="120" value="3"></div>
            <div><label class="mini">What you would call out</label><input type="text" id="remark" placeholder="e.g. their 9 keeps beating Sofia at the back post" autocomplete="off"></div>
            <button class="btn pri" id="add" style="align-self:end">Add →</button>
          </div>
          <div class="feed" id="feed"><div class="empty">Add what you say from the touchline. Each note is tagged on your device.</div></div>
        </div>
      </div>

      <div class="card">
        <div class="hd"><h3>Match analysis</h3><span id="anaBadge" class="badge2"></span></div>
        <div class="bd">
          <div class="acts">
            <button class="btn pri" id="getplan" disabled>Half-time plan</button>
            <button class="sec-btn" id="getreport" disabled>Full-time report</button>
          </div>
          <div class="hint" id="anaHint">Add a couple of remarks, then generate your half-time plan.</div>
          <div id="analysis"></div>
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
function esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
function mmss(ms){const t=Math.floor(ms/1000);return String(Math.floor(t/60)).padStart(2,"0")+":"+String(t%60).padStart(2,"0");}
const TEAM_KEY="gaffer:team:v1", MATCH_KEY="gaffer:match:v1";
const LNAME={es:"Español",pt:"Português",fr:"Français",de:"Deutsch",it:"Italiano"};

let delegated=false, langs=[];
let team=load(TEAM_KEY) || null;          // {team, opponent, roster:[{number,name,position}]}
let match=load(MATCH_KEY) || null;        // {half, utterances:[...]}
let lastText="";

function load(k){ try{ return JSON.parse(localStorage.getItem(k)); }catch(_){ return null; } }
function save(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(_){ } }

fetch("/api/config").then(r=>r.json()).then(c=>{ delegated=c.delegated; langs=c.langs||[]; });

/* ---------- routing between setup and match ---------- */
function show(view){
  $("#setup").hidden = view!=="setup";
  $("#match").hidden = view!=="match";
  if(view==="match") renderMatch();
}
function hasTeam(){ return team && team.team && Array.isArray(team.roster) && team.roster.length>0; }
function boot(){
  if(hasTeam()){ if(!match) match={half:1,utterances:[]}; show("match"); }
  else { openSetup(); }
}

/* ---------- SETUP ---------- */
let draftRoster=[];
function openSetup(){
  team = team || {team:"",opponent:"",roster:[]};
  $("#teamName").value=team.team||"";
  $("#oppName").value=team.opponent||"";
  draftRoster = (team.roster||[]).map(p=>({...p}));
  renderPlayers();
  show("setup");
}
function renderPlayers(){
  const el=$("#players");
  if(!draftRoster.length){ el.innerHTML='<div class="empty">No players yet. Add your squad above.</div>'; }
  else{
    draftRoster.sort((a,b)=>a.number-b.number);
    el.innerHTML=draftRoster.map((p,i)=>'<div class="prow"><span class="pn">#'+p.number+'</span><span class="pnm">'+esc(p.name)+'</span>'+(p.position?'<span class="ppos">'+esc(p.position)+'</span>':'<span class="ppos"></span>')+'<button class="x" data-i="'+i+'" title="Remove">×</button></div>').join("");
  }
  $("#startMatch").disabled = !( $("#teamName").value.trim() && draftRoster.length );
}
function addPlayer(){
  const num=parseInt($("#pNum").value,10), name=$("#pName").value.trim(), pos=$("#pPos").value.trim();
  if(!Number.isInteger(num)||!name){ $("#setupHint").textContent="Enter a number and a name."; return; }
  if(draftRoster.some(p=>p.number===num)){ $("#setupHint").textContent="That number is already taken."; return; }
  draftRoster.push({number:num,name:name,position:pos||undefined});
  $("#pNum").value=""; $("#pName").value=""; $("#pPos").value=""; $("#setupHint").textContent=""; $("#pNum").focus();
  renderPlayers();
}
$("#pAdd").onclick=addPlayer;
["pNum","pName","pPos"].forEach(id=>$("#"+id).addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); addPlayer(); }}));
$("#players").addEventListener("click",e=>{ const b=e.target.closest("[data-i]"); if(b){ draftRoster.splice(+b.dataset.i,1); renderPlayers(); }});
$("#teamName").addEventListener("input",renderPlayers);
$("#sampleBtn").onclick=()=>{
  $("#teamName").value="Riverside U-14"; $("#oppName").value="Oakfield";
  draftRoster=[[1,"Amara","GK"],[2,"Priya","RB"],[4,"Sofia","RCB"],[5,"Chloe","LCB"],[3,"Isla","LB"],[6,"Nadia","DM"],[8,"Grace","CM"],[10,"Mei","AM"],[7,"Zara","RW"],[11,"Leah","LW"],[9,"Fatima","ST"]].map(([n,nm,ps])=>({number:n,name:nm,position:ps}));
  renderPlayers();
};
$("#startMatch").onclick=()=>{
  team={ team:$("#teamName").value.trim(), opponent:$("#oppName").value.trim()||"Opponent", roster:draftRoster.map(p=>({...p})) };
  save(TEAM_KEY,team);
  if(!match) match={half:1,utterances:[]};
  saveMatch(); show("match");
};

/* ---------- MATCH ---------- */
function saveMatch(){ save(MATCH_KEY,match); }
function rosterForApi(){ return team.roster.map(p=>({number:p.number,name:p.name})); }

function renderMatch(){
  $("#vs").textContent=team.team+"  vs  "+team.opponent;
  $("#squad").innerHTML=team.roster.slice().sort((a,b)=>a.number-b.number).map(p=>'<span class="num"><b>#'+p.number+'</b> '+esc(p.name)+'</span>').join("");
  $("#halfSeg").querySelectorAll("button").forEach(b=>b.classList.toggle("on", +b.dataset.h===match.half));
  renderFeed();
}
$("#halfSeg").addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return; match.half=+b.dataset.h; saveMatch(); renderMatch(); });
$("#editTeam").onclick=openSetup;
$("#newMatch").onclick=()=>{ if(!confirm("Start a new match? This clears the current notes (your squad is kept).")) return; match={half:1,utterances:[]}; lastText=""; $("#analysis").innerHTML=""; $("#anaBadge").textContent=""; saveMatch(); renderMatch(); };

function renderFeed(){
  const f=$("#feed");
  if(!match.utterances.length){ f.innerHTML='<div class="empty">Add what you say from the touchline. Each note is tagged on your device.</div>'; }
  else{
    match.utterances.sort((a,b)=>a.tMs-b.tMs);
    f.innerHTML=match.utterances.map((u,i)=>{
      const who=(u.players||[]).map(p=>'<span class="who">#'+p.n+(p.name?' '+esc(p.name):'')+'</span>').join(" ");
      const themes=(u.themes||[]).map(t=>'<span class="theme">'+esc(t)+'</span>').join(" ");
      const tone=u.sentiment<-0.15?"neg":u.sentiment>0.15?"pos":"";
      return '<div class="rrow"><span class="clock">'+mmss(u.tMs)+'</span><span class="phase">'+esc(u.phase||"general")+'</span>'+
        '<div><span class="say2 '+tone+'">'+esc(u.text)+'</span>'+((who||themes)?'<div class="meta">'+who+' '+themes+'</div>':'')+'</div>'+
        '<button class="del" data-del="'+i+'" title="Remove">×</button></div>';
    }).join("");
    f.scrollTop=f.scrollHeight;
  }
  $("#count").textContent=match.utterances.length?("· "+match.utterances.length+" note"+(match.utterances.length>1?"s":"")):"";
  const ready=match.utterances.length>=1;
  $("#getplan").disabled=!ready; $("#getreport").disabled=!ready;
  $("#anaHint").style.display=ready?"none":"block";
}
$("#feed").addEventListener("click",e=>{ const b=e.target.closest("[data-del]"); if(b){ match.utterances.splice(+b.dataset.del,1); saveMatch(); renderFeed(); }});

async function addRemark(){
  const text=$("#remark").value.trim(); if(!text) return;
  const btn=$("#add"); btn.disabled=true;
  const min=Math.max(0,Math.min(120,parseInt($("#min").value||"1",10)));
  try{
    const r=await fetch("/api/tag",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({text,roster:rosterForApi()})});
    const j=await r.json(); if(j.error) throw new Error(j.error);
    match.utterances.push({text,tMs:min*60000,players:j.players,phase:j.phase,themes:j.themes,sentiment:j.sentiment});
    saveMatch(); renderFeed();
    $("#remark").value=""; $("#min").value=Math.min(120,min+2); $("#remark").focus();
  }catch(e){ alert("Could not tag that remark: "+e.message); }
  finally{ btn.disabled=false; }
}
$("#add").onclick=addRemark;
$("#remark").addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); addRemark(); }});

function payload(extra){ return Object.assign({team:team.team,opponent:team.opponent,roster:rosterForApi(),utterances:match.utterances.map(u=>({text:u.text,tMs:u.tMs,players:(u.players||[]).map(p=>p.n),phase:u.phase,themes:u.themes,sentiment:u.sentiment}))},extra||{}); }
function analysing(label){ $("#analysis").innerHTML='<div class="thinking"><span class="spin"></span> '+label+(delegated?' — <span class="badge2">on your laptop over P2P</span>':" on-device")+'…</div>'; }
function toolsRow(){ let h='<div class="tools"><button class="sec-btn" id="say">🔊 Read aloud</button>'; if(langs.length){ h+='<select id="lang">'+langs.map(l=>'<option value="'+l+'">'+(LNAME[l]||l)+'</option>').join("")+'</select><button class="sec-btn" id="tr">Translate</button>'; } return h+'<span id="tstat" class="muted"></span></div><audio id="au" hidden></audio>'; }

$("#getplan").onclick=async()=>{
  $("#getplan").disabled=true; analysing("Building your half-time plan");
  try{
    const r=await fetch("/api/synthesize",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload({half:match.half===1}))});
    const j=await r.json(); if(j.error) throw new Error(j.error);
    $("#anaBadge").textContent=(j.delegated?"P2P · ":"")+ (j.ms/1000).toFixed(1)+"s";
    lastText=j.adjustments.map((a,i)=>(i+1)+". "+a).join("  ");
    let html='<div class="muted" style="font-size:13.5px;margin-top:4px">'+(match.half===1?"Three things for the second half:":"Three things to take into the next match:")+'</div>';
    j.adjustments.forEach((a,i)=>{ html+='<div class="adj"><div class="n">'+(i+1)+'</div><div class="tx">'+esc(a)+'</div></div>'; });
    $("#analysis").innerHTML=html+toolsRow(); wireTools();
  }catch(e){ $("#analysis").innerHTML='<div class="empty">Could not build the plan: '+esc(e.message)+'</div>'; }
  finally{ $("#getplan").disabled=false; }
};
$("#getreport").onclick=async()=>{
  $("#getreport").disabled=true; analysing("Writing the match report");
  try{
    const r=await fetch("/api/report",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload())});
    const j=await r.json(); if(j.error) throw new Error(j.error);
    $("#anaBadge").textContent=(j.delegated?"P2P · ":"")+ (j.ms/1000).toFixed(1)+"s";
    lastText=j.report;
    const htmlReport=esc(j.report).replace(/^(PATTERNS:|PLAYERS:)/gm,'<span class="lbl">$1</span>');
    $("#analysis").innerHTML='<div class="report">'+htmlReport+'</div>'+toolsRow(); wireTools();
  }catch(e){ $("#analysis").innerHTML='<div class="empty">Could not write the report: '+esc(e.message)+'</div>'; }
  finally{ $("#getreport").disabled=false; }
};

function wireTools(){
  const say=$("#say"), au=$("#au"), tr=$("#tr"), tstat=$("#tstat");
  if(say) say.onclick=async()=>{
    say.disabled=true; tstat.textContent="synthesizing on-device…";
    try{ const r=await fetch("/api/tts?text="+enc(lastText)); if(!r.ok) throw 0; const b=await r.blob(); au.src=URL.createObjectURL(b); await au.play(); tstat.textContent=""; }
    catch(_){ tstat.textContent="audio failed"; } finally{ say.disabled=false; }
  };
  if(tr) tr.onclick=async()=>{
    const to=$("#lang").value; tr.disabled=true; tstat.textContent="translating on-device…";
    try{ const r=await fetch("/api/translate?to="+to+"&text="+enc(lastText)); const j=await r.json(); tstat.innerHTML='<span class="badge2">'+(LNAME[to]||to)+'</span> '+esc(j.text||j.error||""); }
    catch(_){ tstat.textContent="translation failed"; } finally{ tr.disabled=false; }
  };
}

const hdr=document.getElementById("hdr");
addEventListener("scroll",()=>hdr.classList.toggle("scrolled",scrollY>8),{passive:true});
boot();
`;

export const APP_PAGE = doc({ title: 'Gaffer — your match', body: BODY, style: CSS, script: SCRIPT });
