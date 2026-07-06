// The app — voice-first and low-friction. Set up your squad once (persists on device),
// then during a match you just tap the mic and talk: Gaffer transcribes on-device
// (Whisper), tags it against your squad, and builds the plan. No typing required.
import { doc, headerHtml, footerHtml } from './shared.js';

const micIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';

const CSS = `
  .app{padding:120px 0 40px}
  .eyebrow{margin-bottom:26px}
  .apptitle{font-size:clamp(30px,4.4vw,48px);line-height:1.1;letter-spacing:-.02em;margin:0;font-weight:550}
  .apptitle em{font-style:normal;color:var(--life)}
  .sub{color:var(--muted-fg);font-size:17px;max-width:660px;margin:16px 0 0;line-height:1.6}
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
  .hint{color:var(--muted-fg);font-size:13px;margin-top:12px}

  /* setup — game-like squad */
  .squad-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-top:24px}
  .squad-head .cnt{font-family:var(--mono);font-size:12px;color:var(--faint)}
  .qadd{display:grid;grid-template-columns:104px 1fr auto;gap:10px;align-items:end;margin-top:12px}
  @media(max-width:520px){.qadd{grid-template-columns:80px 1fr auto}}
  .kbdhint{font-family:var(--mono);font-size:11px;color:var(--faint);margin-top:9px}
  .squad-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:10px;margin-top:16px}
  .jersey{position:relative;background:linear-gradient(180deg,oklch(0.145 0 0),oklch(0.11 0 0));border:1px solid var(--border);border-radius:14px;padding:18px 12px 15px;text-align:center;overflow:hidden;animation:pop .2s ease}
  @keyframes pop{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:none}}
  .jersey::before{content:"";position:absolute;inset:0 0 auto 0;height:34px;background:linear-gradient(180deg,oklch(0.74 0.18 162 / .10),transparent)}
  .jersey .no{position:relative;font-family:var(--mono);font-size:34px;font-weight:500;color:var(--life);line-height:1;letter-spacing:-.02em}
  .jersey .nm{margin-top:9px;font-size:14px;font-weight:500;color:var(--fg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .jersey .x{position:absolute;top:7px;right:8px;background:none;border:0;color:var(--faint);cursor:pointer;font-size:15px;line-height:1;opacity:0;transition:opacity .15s}
  .jersey:hover .x{opacity:1}.jersey .x:hover{color:var(--danger)}
  .squad-empty{grid-column:1/-1;color:var(--muted-fg);padding:26px 4px;text-align:center;font-size:14px;border:1px dashed var(--border-soft);border-radius:14px}
  .setup-actions{margin-top:26px;display:flex;gap:14px;align-items:center;flex-wrap:wrap}

  /* match */
  .matchbar{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:4px}
  .vs{font-size:clamp(22px,3vw,30px);font-weight:550;letter-spacing:-.02em;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  .vs .sep{color:var(--faint);font-weight:400}
  .oppin{background:none;border:0;border-bottom:1px dashed var(--border);color:var(--fg);font:inherit;font-size:inherit;font-weight:550;letter-spacing:-.02em;width:11ch;padding:0 2px 3px;outline:none}
  .oppin:focus{border-bottom-color:var(--life)}.oppin::placeholder{color:var(--faint)}
  .matchbar .spacer{flex:1}
  .halfseg{display:inline-flex;border:1px solid var(--border);border-radius:999px;overflow:hidden}
  .halfseg button{background:none;border:0;color:var(--muted-fg);font:inherit;font-size:13px;padding:8px 16px;cursor:pointer}
  .halfseg button.on{background:var(--muted);color:var(--fg)}
  .grid{display:grid;grid-template-columns:1fr;gap:18px;margin-top:22px}
  @media(min-width:940px){.grid{grid-template-columns:1.18fr .82fr;align-items:start}}
  .squadref{color:var(--muted-fg);font-size:12.5px;margin-bottom:18px}
  .num{display:inline-block;font-family:var(--mono);font-size:11.5px;color:var(--muted-fg);background:var(--bg);border:1px solid var(--border-soft);border-radius:7px;padding:2px 7px;margin:2px 4px 0 0}
  .num b{color:var(--fg);font-weight:500}

  /* voice capture */
  .micbar{display:flex;gap:14px;align-items:center;flex-wrap:wrap}
  .mic{display:inline-flex;align-items:center;gap:11px;background:linear-gradient(180deg,var(--life),oklch(0.62 0.16 162));color:#05140a;border:0;border-radius:999px;padding:15px 24px;font:inherit;font-weight:600;font-size:15.5px;cursor:pointer;transition:transform .15s}
  .mic:hover{transform:translateY(-1px)}
  .mic.rec{background:#2a1414;color:#ffc2c2;animation:mpulse 1.5s infinite}
  .mic.rec svg{color:#ff6a6a}
  @keyframes mpulse{0%{box-shadow:0 0 0 0 rgba(255,90,90,.45)}70%{box-shadow:0 0 0 18px rgba(255,90,90,0)}100%{box-shadow:0 0 0 0 rgba(255,90,90,0)}}
  .mic.proc{opacity:.65;cursor:default}
  .minf{display:flex;align-items:center;gap:8px;color:var(--muted-fg);font-family:var(--mono);font-size:12px}
  .minf input{width:64px}
  .capmsg{margin-top:14px;color:var(--muted-fg);font-size:13.5px;min-height:18px;display:flex;align-items:center;gap:9px}
  .spin{width:14px;height:14px;border:2px solid var(--muted);border-top-color:var(--life);border-radius:50%;animation:sp .8s linear infinite;display:inline-block}
  @keyframes sp{to{transform:rotate(360deg)}}
  .typerow{display:grid;grid-template-columns:1fr auto;gap:10px;margin-top:14px}
  .typerow[hidden]{display:none}

  .feed{margin-top:16px;max-height:44vh;overflow:auto}
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
  .sec-btn{background:var(--muted);color:var(--fg);border:1px solid var(--border);font:inherit;font-size:13px;font-weight:500;padding:10px 14px;border-radius:999px;cursor:pointer;transition:border-color .2s}
  .sec-btn:hover{border-color:oklch(0.30 0 0)}
  #tstat{font-size:13px}
`;

const BODY = `
${headerHtml({ links: [{ href: '/#how', label: 'How it works' }, { href: '/#features', label: 'Features' }], cta: { label: 'Home', href: '/' } })}

<main class="wrap app">
  <!-- BUILD YOUR SQUAD (one time, persists on device) -->
  <section id="setup" hidden>
    <div class="eyebrow"><span class="sq"></span><span class="lbl">Your squad</span><span class="dots"></span></div>
    <h1 class="apptitle">Build your <em>squad</em>.</h1>
    <p class="sub">Do this once — it's saved on your device and ready every match. Add a few players to start and the rest whenever. During games you never type; you just tap the mic and talk.</p>

    <div class="card" style="margin-top:28px">
      <div class="bd">
        <div style="max-width:340px"><label class="mini">Team name (optional)</label><input type="text" id="teamName" placeholder="e.g. Riverside U-14" autocomplete="off"></div>

        <div class="squad-head"><label class="mini" style="margin:0">Players</label><span class="cnt" id="squadCnt">0 players</span></div>
        <div class="qadd">
          <div><input type="number" id="pNum" placeholder="No." min="1" max="99"></div>
          <div><input type="text" id="pName" placeholder="Player name" autocomplete="off"></div>
          <button class="btn pri" id="pAdd">Add</button>
        </div>
        <div class="kbdhint">Type a number and name, then press Enter for the next.</div>
        <div class="squad-grid" id="players"></div>

        <div class="setup-actions">
          <button class="btn pri lg" id="startMatch" disabled>Start a match →</button>
          <button class="link" id="sampleBtn">Load a sample squad</button>
          <span class="muted" id="setupHint" style="font-size:13px"></span>
        </div>
      </div>
    </div>
  </section>

  <!-- MATCH (voice-first) -->
  <section id="match" hidden>
    <div class="matchbar">
      <span class="vs"><span id="teamLbl">—</span><span class="sep">vs</span><input class="oppin" id="oppInput" placeholder="Opponent"></span>
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
          <div class="micbar">
            <button class="mic" id="mic">${micIcon}<span id="micLabel">Tap and say a note</span></button>
            <span class="minf">min <input type="number" id="min" min="0" max="120" value="3"></span>
            <button class="link" id="typeToggle">or type it</button>
          </div>
          <div class="capmsg" id="capmsg"></div>
          <div class="typerow" id="typeRow" hidden>
            <input type="text" id="remark" placeholder="Type what you would call out" autocomplete="off">
            <button class="btn pri" id="addText">Add</button>
          </div>
          <div class="feed" id="feed"><div class="empty">Tap the mic and say what you'd call out. It's transcribed and tagged on your device.</div></div>
        </div>
      </div>

      <div class="card">
        <div class="hd"><h3>Match analysis</h3><span id="anaBadge" class="badge2"></span></div>
        <div class="bd">
          <div class="acts">
            <button class="btn pri" id="getplan" disabled>Half-time plan</button>
            <button class="sec-btn" id="getreport" disabled>Full-time report</button>
          </div>
          <div class="hint" id="anaHint">Add a couple of notes, then get your half-time plan.</div>
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
const TEAM_KEY="gaffer:team:v2", MATCH_KEY="gaffer:match:v2";
const LNAME={es:"Español",pt:"Português",fr:"Français",de:"Deutsch",it:"Italiano"};

let delegated=false, langs=[];
let team=load(TEAM_KEY);   // {name, roster:[{number,name}]}
let match=load(MATCH_KEY); // {half, opponent, utterances:[...]}
let lastText="";

function load(k){ try{ return JSON.parse(localStorage.getItem(k)); }catch(_){ return null; } }
function save(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(_){} }
fetch("/api/config").then(r=>r.json()).then(c=>{ delegated=c.delegated; langs=c.langs||[]; });

function show(view){ $("#setup").hidden=view!=="setup"; $("#match").hidden=view!=="match"; if(view==="match") renderMatch(); }
function hasTeam(){ return team && Array.isArray(team.roster) && team.roster.length>0; }
function boot(){ if(hasTeam()){ if(!match) match={half:1,opponent:"",utterances:[]}; show("match"); } else openSetup(); }

/* ---------- SETUP ---------- */
let draft=[];
function openSetup(){ team=team||{name:"",roster:[]}; $("#teamName").value=team.name||""; draft=(team.roster||[]).map(p=>({...p})); renderPlayers(); show("setup"); }
function renderPlayers(){
  const el=$("#players");
  if(!draft.length){ el.innerHTML='<div class="squad-empty">No players yet. Add your squad above — even a few is enough to start.</div>'; }
  else{ draft.sort((a,b)=>a.number-b.number);
    el.innerHTML=draft.map((p,i)=>'<div class="jersey"><button class="x" data-i="'+i+'" title="Remove">×</button><div class="no">'+p.number+'</div><div class="nm">'+esc(p.name)+'</div></div>').join(""); }
  $("#squadCnt").textContent=draft.length+" player"+(draft.length===1?"":"s");
  $("#startMatch").disabled=draft.length<1;
}
function addPlayer(){
  const num=parseInt($("#pNum").value,10), name=$("#pName").value.trim();
  if(!Number.isInteger(num)||!name){ $("#setupHint").textContent="Enter a number and a name."; return; }
  if(draft.some(p=>p.number===num)){ $("#setupHint").textContent="Number "+num+" is already taken."; return; }
  draft.push({number:num,name}); $("#pNum").value=""; $("#pName").value=""; $("#setupHint").textContent=""; $("#pNum").focus(); renderPlayers();
}
$("#pAdd").onclick=addPlayer;
$("#pNum").addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); $("#pName").focus(); }});
$("#pName").addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); addPlayer(); }});
$("#players").addEventListener("click",e=>{ const b=e.target.closest("[data-i]"); if(b){ draft.splice(+b.dataset.i,1); renderPlayers(); }});
$("#sampleBtn").onclick=()=>{ $("#teamName").value="Riverside U-14"; draft=[[1,"Amara"],[2,"Priya"],[4,"Sofia"],[5,"Chloe"],[3,"Isla"],[6,"Nadia"],[8,"Grace"],[10,"Mei"],[7,"Zara"],[11,"Leah"],[9,"Fatima"]].map(([n,nm])=>({number:n,name:nm})); renderPlayers(); };
$("#startMatch").onclick=()=>{ team={name:$("#teamName").value.trim()||"My team",roster:draft.map(p=>({...p}))}; save(TEAM_KEY,team); if(!match) match={half:1,opponent:"",utterances:[]}; saveMatch(); show("match"); };

/* ---------- MATCH ---------- */
function saveMatch(){ save(MATCH_KEY,match); }
function rosterForApi(){ return team.roster.map(p=>({number:p.number,name:p.name})); }
function renderMatch(){
  $("#teamLbl").textContent=team.name; $("#oppInput").value=match.opponent||"";
  $("#squad").innerHTML=team.roster.slice().sort((a,b)=>a.number-b.number).map(p=>'<span class="num"><b>#'+p.number+'</b> '+esc(p.name)+'</span>').join("");
  $("#halfSeg").querySelectorAll("button").forEach(b=>b.classList.toggle("on",+b.dataset.h===match.half));
  renderFeed();
}
$("#oppInput").addEventListener("input",()=>{ match.opponent=$("#oppInput").value.trim(); saveMatch(); });
$("#halfSeg").addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return; match.half=+b.dataset.h; saveMatch(); renderMatch(); });
$("#editTeam").onclick=openSetup;
$("#newMatch").onclick=()=>{ if(!confirm("Start a new match? This clears the notes (your squad is kept).")) return; match={half:1,opponent:"",utterances:[]}; lastText=""; $("#analysis").innerHTML=""; $("#anaBadge").textContent=""; saveMatch(); renderMatch(); };

function renderFeed(){
  const f=$("#feed");
  if(!match.utterances.length){ f.innerHTML='<div class="empty">Tap the mic and say what you\\'d call out. It\\'s transcribed and tagged on your device.</div>'; }
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
$("#feed").addEventListener("click",e=>{ const b=e.target.closest("[data-del]"); if(b){ match.utterances.splice(+b.dataset.del,1); saveMatch(); renderFeed(); }});

function curMin(){ return Math.max(0,Math.min(120,parseInt($("#min").value||"1",10))); }
function bumpMin(){ $("#min").value=Math.min(120,curMin()+2); }
function addNote(u){ match.utterances.push(u); saveMatch(); renderFeed(); bumpMin(); }
function capMsg(html,spin){ $("#capmsg").innerHTML=(spin?'<span class="spin"></span>':'')+(html||""); }

/* ---------- voice capture (tap-to-talk → on-device Whisper) ---------- */
let stream=null, rec=null, chunks=[], recording=false;
function setMic(state){
  const m=$("#mic"), l=$("#micLabel"); m.classList.remove("rec","proc");
  if(state==="rec"){ m.classList.add("rec"); l.textContent="Listening… tap to stop"; }
  else if(state==="proc"){ m.classList.add("proc"); l.textContent="Working…"; }
  else{ l.textContent="Tap and say a note"; }
}
async function startRec(){
  try{
    if(!stream) stream=await navigator.mediaDevices.getUserMedia({audio:true});
    chunks=[]; rec=new MediaRecorder(stream); rec.ondataavailable=e=>{ if(e.data&&e.data.size) chunks.push(e.data); }; rec.onstop=onStop;
    rec.start(); recording=true; setMic("rec"); capMsg("");
  }catch(e){ capMsg("Microphone not available — type your note instead."); showType(true); }
}
function stopRec(){ if(rec&&recording){ recording=false; try{ rec.stop(); }catch(_){}; setMic("proc"); } }
async function onStop(){
  const blob=new Blob(chunks,{type:(rec&&rec.mimeType)||"audio/webm"});
  const min=curMin();
  try{
    capMsg("Transcribing on-device…",true);
    const audio=await blobToWav16(blob);
    const r=await fetch("/api/voicenote",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({audio,roster:rosterForApi()})});
    const j=await r.json(); if(j.error) throw new Error(j.error);
    if(!j.text){ capMsg("Didn't catch that — try again."); setMic("idle"); return; }
    addNote({text:j.text,tMs:min*60000,players:j.players,phase:j.phase,themes:j.themes,sentiment:j.sentiment});
    capMsg(""); setMic("idle");
  }catch(e){ capMsg("Could not transcribe: "+e.message); setMic("idle"); }
}
$("#mic").onclick=()=>{ if($("#mic").classList.contains("proc")) return; recording?stopRec():startRec(); };

/* record blob -> 16kHz mono PCM WAV -> base64 */
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

/* type fallback */
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
