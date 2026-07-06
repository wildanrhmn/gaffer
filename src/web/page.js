// The single-page landing UI, served as a string. Self-contained: inline CSS + JS,
// no CDN, no external assets. Structure: sticky header · announcement bar · hero ·
// three pillars · why-it-exists · feature bento · live tagging · match replay · FAQ · footer.
export const PAGE = /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Gaffer — the on-device assistant coach for grassroots football</title>
<style>
  :root{
    --bg:#060d08; --panel:#0e1911; --panel2:#0b140d; --line:#1b2c1f; --line2:#26402b;
    --ink:#e9f1ea; --dim:#8aa891; --dim2:#6f8c77; --grass:#3ddc61; --grass2:#1f9d3a;
    --gold:#f2c14e; --warn:#ff7a7a; --good:#57d67d; --chip:#132018; --r:16px;
  }
  *{box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{margin:0;color:var(--ink);background:var(--bg);
    font:15px/1.55 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
    -webkit-font-smoothing:antialiased}
  body::before{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;
    background:
      radial-gradient(1000px 560px at 50% -10%, rgba(61,220,97,.11), transparent 62%),
      repeating-linear-gradient(0deg, transparent 0 46px, rgba(255,255,255,.017) 46px 47px),
      repeating-linear-gradient(90deg, transparent 0 46px, rgba(255,255,255,.017) 46px 47px)}
  a{color:var(--grass);text-decoration:none}
  .wrap{max-width:1120px;margin:0 auto;padding:0 20px}
  svg{display:block}

  /* header */
  header.site{position:sticky;top:0;z-index:20;border-bottom:1px solid transparent;transition:border .2s,background .2s}
  header.site.scrolled{background:rgba(6,13,8,.82);backdrop-filter:blur(10px);border-color:var(--line)}
  .bar{display:flex;align-items:center;gap:20px;height:64px}
  .logo{font-weight:800;font-size:19px;letter-spacing:.3px;display:flex;align-items:center;gap:8px}
  .logo b{color:var(--grass)}
  .nav{display:flex;gap:22px;margin-left:8px}
  .nav a{color:var(--dim);font-weight:500;font-size:14.5px}
  .nav a:hover{color:var(--ink)}
  .hcta{margin-left:auto;display:flex;gap:10px;align-items:center}
  .ghost{color:var(--dim);font-weight:600;font-size:14px}
  .ghost:hover{color:var(--ink)}
  .btn{display:inline-flex;align-items:center;gap:8px;font-weight:700;border-radius:999px;cursor:pointer;border:0;font:inherit;font-weight:700}
  .btn.pri{color:#05140a;background:linear-gradient(180deg,var(--grass),var(--grass2));padding:9px 16px}
  .btn.pri:hover{filter:brightness(1.06)}
  .btn.ghostpill{color:var(--ink);background:#132018;border:1px solid var(--line2);padding:9px 15px;font-weight:600}
  @media(max-width:720px){.nav{display:none}}

  /* announcement */
  .announce{border-bottom:1px solid var(--line);background:var(--panel2)}
  .announce .wrap{display:flex;align-items:center;gap:10px;height:38px;font-size:12.5px;color:var(--dim);flex-wrap:wrap;overflow:hidden}
  .announce b{color:var(--grass);font-weight:700}
  .sep{opacity:.4}

  /* hero */
  .hero{text-align:center;padding:64px 0 26px}
  .kicker{display:inline-block;font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;
    color:var(--grass);border:1px solid var(--grass2);border-radius:999px;padding:6px 13px;margin-bottom:22px;background:#0c1a10}
  h1{font-size:clamp(38px,7.4vw,78px);line-height:.97;letter-spacing:-2px;margin:0;font-weight:850}
  h1 .g{color:var(--grass)}
  .sub{max-width:660px;margin:22px auto 0;color:var(--dim);font-size:17.5px}
  .sub b{color:var(--ink);font-weight:600}
  .herocta{display:flex;gap:12px;justify-content:center;align-items:center;margin-top:28px;flex-wrap:wrap}
  .btn.lg{padding:14px 22px;font-size:15px}

  /* section scaffolding */
  section{padding:22px 0}
  .eyebrow{color:var(--grass);font-weight:700;font-size:12.5px;letter-spacing:1.2px;text-transform:uppercase}
  .h2{font-size:clamp(26px,4vw,38px);letter-spacing:-.8px;margin:10px 0 0;font-weight:820}
  .h2 span{color:var(--dim)}
  .lead{color:var(--dim);font-size:16px;max-width:640px;margin:12px 0 0}
  .center{text-align:center}
  .center .lead{margin-left:auto;margin-right:auto}

  /* pillars */
  .pillars{display:grid;grid-template-columns:1fr;gap:16px;margin-top:26px}
  @media(min-width:820px){.pillars{grid-template-columns:repeat(3,1fr)}}
  .pill-card{background:var(--panel);border:1px solid var(--line);border-radius:var(--r);padding:22px;position:relative;overflow:hidden}
  .pill-card:hover{border-color:var(--line2)}
  .picon{width:42px;height:42px;border-radius:11px;display:grid;place-items:center;background:#12251a;border:1px solid var(--grass2);color:var(--grass);margin-bottom:14px}
  .pill-card h3{margin:0 0 6px;font-size:17px}
  .pill-card p{margin:0;color:var(--dim);font-size:14px}
  .pill-card .tagline{margin-top:14px;font-size:12px;color:var(--gold);font-weight:600}

  /* why band */
  .why{background:var(--panel2);border:1px solid var(--line);border-radius:20px;padding:28px;margin-top:8px}
  .why p{font-size:clamp(17px,2.4vw,22px);line-height:1.45;color:var(--dim);margin:0;max-width:900px}
  .why p b{color:var(--ink)}
  .why .em{color:var(--grass)}

  /* bento features */
  .bento{display:grid;grid-template-columns:1fr;gap:14px;margin-top:26px}
  @media(min-width:760px){.bento{grid-template-columns:repeat(6,1fr)}}
  .fcard{background:var(--panel);border:1px solid var(--line);border-radius:var(--r);padding:20px;grid-column:span 6}
  @media(min-width:760px){.span3{grid-column:span 3}.span2{grid-column:span 2}.span6{grid-column:span 6}}
  .fcard .fe{color:var(--grass);font-weight:700;font-size:11.5px;letter-spacing:1px;text-transform:uppercase;display:flex;align-items:center;gap:8px}
  .fcard h3{margin:10px 0 6px;font-size:18px;letter-spacing:-.3px}
  .fcard p{margin:0;color:var(--dim);font-size:14px}
  .fcard .model{margin-top:12px;display:inline-block;font-size:12px;color:var(--dim);background:var(--chip);border:1px solid var(--line);border-radius:8px;padding:3px 9px}

  /* try-it */
  .card{background:var(--panel);border:1px solid var(--line);border-radius:18px}
  .try{padding:20px;margin-top:22px}
  .inputrow{display:flex;gap:10px;flex-wrap:wrap}
  .field{flex:1;min-width:240px}
  input[type=text]{width:100%;background:#0a130d;color:var(--ink);border:1px solid var(--line2);border-radius:12px;
    padding:14px 15px;font:inherit;outline:none;transition:border .15s,box-shadow .15s}
  input[type=text]:focus{border-color:var(--grass);box-shadow:0 0 0 3px rgba(61,220,97,.18)}
  input::placeholder{color:#5f7a67}
  button:disabled{opacity:.55;cursor:default}
  .exs{margin-top:12px;display:flex;gap:8px;flex-wrap:wrap}
  .ex{background:#0f1a13;border:1px solid var(--line);color:var(--dim);font-weight:500;font-size:12.5px;padding:7px 11px;border-radius:999px;text-align:left;cursor:pointer}
  .ex:hover{border-color:var(--grass2);color:var(--ink)}
  .squadref{margin-top:14px;color:var(--dim);font-size:12.5px}
  .num{display:inline-block;font-size:12px;color:var(--dim);background:var(--chip);border:1px solid var(--line);border-radius:8px;padding:2px 7px;margin:2px 3px 0 0}
  .num b{color:var(--ink)}
  #tagout{margin-top:16px}
  .thinking{display:flex;gap:9px;align-items:center;color:var(--dim);font-size:14px;padding:6px 2px}
  .tagres{border:1px solid var(--line2);border-radius:14px;padding:14px 15px;background:var(--panel2);animation:in .25s ease}
  .say{font-size:16px}.say.neg{color:#ffbdbd}.say.pos{color:var(--good)}
  .tagrow{margin-top:12px;display:flex;gap:7px;flex-wrap:wrap;align-items:center}
  .phase{font-size:11px;text-transform:uppercase;letter-spacing:.4px;color:#bfe9c6;background:#12251699;border:1px solid var(--line2);border-radius:7px;padding:3px 8px}
  .who{font-size:12px;color:var(--gold);background:#241f0f;border:1px solid #4a3f1f;border-radius:7px;padding:3px 8px}
  .theme{font-size:12px;color:var(--dim);background:var(--chip);border:1px solid var(--line);border-radius:7px;padding:3px 8px}
  .senti{font-size:12px;margin-left:auto;color:var(--dim)}.senti.neg{color:var(--warn)}.senti.pos{color:var(--good)}
  .dim{color:var(--dim)}

  /* match */
  .cta{display:flex;gap:14px;align-items:center;margin:8px 0 18px;flex-wrap:wrap}
  .matchbar{margin-bottom:16px;padding:14px 16px;background:var(--panel);border:1px solid var(--line);border-radius:14px}
  .vs{font-weight:800;font-size:18px}
  .grid{display:grid;grid-template-columns:1fr;gap:16px}
  @media(min-width:880px){.grid{grid-template-columns:1.12fr .88fr}}
  .hd{padding:14px 18px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center}
  .hd h3{margin:0;font-size:12px;letter-spacing:.7px;text-transform:uppercase;color:var(--dim)}
  .badge{font-size:12px;color:var(--gold);font-weight:600}
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
  .sec-btn{background:#132018;color:var(--ink);border:1px solid var(--line2);font-weight:600;padding:10px 14px;border-radius:12px;cursor:pointer}
  #tstat{font-size:13px}

  /* FAQ */
  .faq{max-width:820px;margin:26px auto 0}
  .fitem{border:1px solid var(--line);border-radius:14px;background:var(--panel);margin-bottom:10px;overflow:hidden}
  .fq{width:100%;text-align:left;background:none;border:0;color:var(--ink);font:inherit;font-weight:650;font-size:15.5px;
    padding:16px 18px;display:flex;justify-content:space-between;align-items:center;gap:12px;cursor:pointer}
  .fq .ic{color:var(--grass);transition:transform .2s;flex:0 0 auto}
  .fitem.open .fq .ic{transform:rotate(45deg)}
  .fa{max-height:0;overflow:hidden;transition:max-height .25s ease}
  .fa .inner{padding:0 18px 16px;color:var(--dim);font-size:14.5px}

  footer{margin-top:56px;border-top:1px solid var(--line);padding:30px 0 46px}
  .foot{display:flex;gap:18px;justify-content:space-between;flex-wrap:wrap;align-items:flex-start}
  .foot .brand{font-weight:800;font-size:18px}.foot .brand b{color:var(--grass)}
  .foot .desc{color:var(--dim);font-size:13px;max-width:320px;margin-top:8px}
  .foot .links{display:flex;gap:22px;flex-wrap:wrap}
  .foot .links a{color:var(--dim);font-size:14px}.foot .links a:hover{color:var(--ink)}
  .foot .fine{color:var(--dim2);font-size:12px;margin-top:22px}
</style>
</head>
<body>
<header class="site" id="siteHeader">
  <div class="wrap bar">
    <div class="logo"><b>Gaffer</b> ⚽</div>
    <nav class="nav">
      <a href="#how">How it works</a>
      <a href="#features">Features</a>
      <a href="#try">Try it</a>
      <a href="#faq">FAQ</a>
    </nav>
    <div class="hcta">
      <a class="ghost" href="https://github.com/wildanrhmn/gaffer" target="_blank" rel="noopener">GitHub</a>
      <a class="btn pri" href="#try">Try it live ›</a>
    </div>
  </div>
</header>

<div class="announce">
  <div class="wrap">
    <span>⚽ <b>Tether Developers Cup</b> · QVAC (Local AI) track</span>
    <span class="sep">·</span><span>runs 100% on your device</span>
    <span class="sep">·</span><span>no cloud · no API key · MIT</span>
  </div>
</div>

<main class="wrap">
  <!-- HERO -->
  <header class="hero" id="top">
    <span class="kicker">On-device AI · grassroots football</span>
    <h1>Your assistant coach.<br>On the touchline. <span class="g">Offline.</span></h1>
    <p class="sub">Talk through a match like you already do. Gaffer transcribes and tags every remark
      <b>on your device</b>, then at half-time hands you three concrete adjustments — read aloud, in your
      language. No cloud. The kids' data never leaves the touchline.</p>
    <div class="herocta">
      <a class="btn pri lg" href="#try">Tag your own remark ›</a>
      <a class="btn ghostpill lg" href="#match">Watch the demo</a>
    </div>
  </header>

  <!-- THREE PILLARS -->
  <section id="how">
    <div class="center">
      <div class="eyebrow">How it works</div>
      <h2 class="h2">One coach's voice. <span>Three on-device engines.</span></h2>
      <p class="lead">Everything runs on hardware you already own — a mid-range phone and an old laptop.</p>
    </div>
    <div class="pillars">
      <div class="pill-card">
        <div class="picon">🎙️</div>
        <h3>Listen &amp; understand</h3>
        <p>Whisper transcribes each remark and a small language model tags it — which player, which phase of play, which recurring theme — in about a fifth of a second.</p>
        <div class="tagline">Whisper + Qwen3 · on-device</div>
      </div>
      <div class="pill-card">
        <div class="picon">🛰️</div>
        <h3>Offload the heavy thinking</h3>
        <p>The one heavy call — the half-time synthesis — is delegated from the phone to your laptop over peer-to-peer, with automatic local fallback. No server in the middle.</p>
        <div class="tagline">QVAC delegation · Hyperswarm DHT</div>
      </div>
      <div class="pill-card">
        <div class="picon">🔊</div>
        <h3>Speak it, translate it</h3>
        <p>The three adjustments are read aloud in your earbud and translated on-device for a multilingual bench — all without a single network request.</p>
        <div class="tagline">Supertonic TTS + Bergamot NMT</div>
      </div>
    </div>
  </section>

  <!-- WHY IT EXISTS -->
  <section>
    <div class="why">
      <div class="eyebrow" style="margin-bottom:14px">Why it exists</div>
      <p>Match analysis today means <b>Veo, Hudl, Trace</b> — thousands in hardware plus a cloud subscription,
        and your footage lives on their servers. The tens of millions of <b>volunteer</b> coaches get nothing:
        they can't afford it, and the footage contains <b>minors</b> that can't be uploaded to a cloud AI.
        <span class="em">Gaffer exists because it's local</span> — the kids' data never leaves the touchline,
        pitches with no signal still work, and there's no API key for a volunteer to manage.</p>
    </div>
  </section>

  <!-- FEATURE BENTO -->
  <section id="features">
    <div class="center">
      <div class="eyebrow">Under the hood</div>
      <h2 class="h2">Five local-AI capabilities. <span>All load-bearing.</span></h2>
      <p class="lead">Not a logo bolted on — every one is verified running on-device, end to end.</p>
    </div>
    <div class="bento">
      <div class="fcard span3">
        <div class="fe">🏷️ Tagging</div>
        <h3>It knows who you mean</h3>
        <p>"Their 7 got in behind Priya" resolves to <b>our #2 Priya</b>, not the opponent's 7 — a deterministic guardrail small models can't fake. Every remark gets a player, a phase, a theme, and a sentiment.</p>
        <div class="model">Qwen3-1.7B · ~0.2s each</div>
      </div>
      <div class="fcard span3">
        <div class="fe">🛰️ P2P synthesis</div>
        <h3>The phone offloads to the laptop</h3>
        <p>At half-time the heavy model runs on your laptop over pure peer-to-peer and sends back three specific adjustments — the same call falls back to local if no laptop is around.</p>
        <div class="model">QVAC delegate · Hyperswarm DHT</div>
      </div>
      <div class="fcard span2">
        <div class="fe">🎙️ Speech</div>
        <h3>Transcribe the touchline</h3>
        <p>Whisper turns narration into text, on-device, offline.</p>
        <div class="model">Whisper</div>
      </div>
      <div class="fcard span2">
        <div class="fe">🔊 Read-back</div>
        <h3>In your earbud</h3>
        <p>Supertonic reads the plan aloud on the walk to the huddle.</p>
        <div class="model">Supertonic TTS</div>
      </div>
      <div class="fcard span2">
        <div class="fe">🌐 Translate</div>
        <h3>For the whole bench</h3>
        <p>The adjustments in ES · PT · FR · DE · IT, computed locally.</p>
        <div class="model">Bergamot NMT</div>
      </div>
    </div>
  </section>

  <!-- TRY IT LIVE -->
  <section id="try">
    <div class="eyebrow">Try it live · on your device</div>
    <h2 class="h2">Type a touchline remark. <span>Watch the model tag it.</span></h2>
    <p class="lead">This isn't a canned demo — your text is analyzed live by the model running on this machine.</p>
    <div class="card try">
      <div class="inputrow">
        <div class="field"><input type="text" id="remark" placeholder="e.g. their 9 keeps beating Sofia at the back post…" autocomplete="off"></div>
        <button class="btn pri lg" id="tagbtn">Tag it →</button>
      </div>
      <div class="exs" id="examples"></div>
      <div class="squadref">Reference these players by name or number: <span id="squad2"></span></div>
      <div id="tagout"></div>
    </div>
  </section>

  <!-- MATCH REPLAY -->
  <section id="match">
    <div class="eyebrow">The sample match</div>
    <h2 class="h2">A full half, <span>tagged live, then synthesized.</span></h2>
    <p class="lead">A replay of a sample game standing in for a live mic — every tag and the half-time plan are computed on-device each time you press kick off.</p>
    <div class="matchbar" style="margin-top:18px"><span class="vs" id="vs">—</span><div class="meta" id="squad" style="margin-top:8px"></div></div>
    <div class="cta">
      <button class="btn pri lg" id="go">Kick off ▶</button>
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
  </section>

  <!-- FAQ -->
  <section id="faq">
    <div class="center">
      <div class="eyebrow">Questions</div>
      <h2 class="h2">Straight answers.</h2>
    </div>
    <div class="faq" id="faqList"></div>
  </section>
</main>

<footer>
  <div class="wrap foot">
    <div>
      <div class="brand"><b>Gaffer</b> ⚽</div>
      <div class="desc">Match analysis for the 99% of football that isn't professional. On your hardware, not theirs.</div>
      <div class="fine">Built on QVAC (on-device AI) + Pears (P2P). MIT licensed. Tether Developers Cup — QVAC track.</div>
    </div>
    <div class="links">
      <a href="#how">How it works</a>
      <a href="#features">Features</a>
      <a href="#try">Try it</a>
      <a href="#faq">FAQ</a>
      <a href="https://github.com/wildanrhmn/gaffer" target="_blank" rel="noopener">GitHub ↗</a>
    </div>
  </div>
</footer>

<script>
const $=(s)=>document.querySelector(s);
let delegated=false, providerKey=null, langs=[], roster=[], adjText='';
const LNAME={es:'Español',pt:'Português',fr:'Français',de:'Deutsch',it:'Italiano'};
function escapeHtml(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}

/* header shadow on scroll */
const hdr=$('#siteHeader');
addEventListener('scroll',()=>{ hdr.classList.toggle('scrolled', scrollY>8); }, {passive:true});

/* config */
fetch('/api/config').then(r=>r.json()).then(c=>{
  delegated=c.delegated; providerKey=c.providerKey; langs=c.langs||[]; roster=c.roster||[];
  $('#vs').textContent=(c.team||'')+'  vs  '+(c.opponent||'');
  const chips=roster.map(p=>'<span class="num"><b>#'+p.number+'</b> '+p.name+'</span>').join('');
  $('#squad').innerHTML=chips; $('#squad2').innerHTML=chips;
});

/* FAQ */
const FAQ=[
  ['What exactly is Gaffer?','A private, offline AI film room for grassroots football. You narrate a match from the touchline; it transcribes and tags every remark on your device, builds a live tactical timeline, and at half-time gives you three concrete adjustments — read aloud and translatable.'],
  ['Does it really run without the cloud?','Yes. Every model — speech-to-text, the language model, text-to-speech, and translation — runs on your own device through the QVAC SDK. No servers, no API keys, and your data never leaves the machine.'],
  ['Do I need internet?','Only on the very first run, to download the models (~2–3 GB) into ~/.qvac/models. After that it works fully offline — which is the point, because pitches often have no signal.'],
  ['What is the "provider" / peer-to-peer part?','The one heavy call — the half-time synthesis — can be offloaded from the phone to your laptop over peer-to-peer (a phone can\\'t comfortably run the bigger model). Start the provider on your laptop, and the app uses it automatically, falling back to local if it isn\\'t there.'],
  ['Why does being local matter here?','Grassroots footage and match notes involve minors, which legally and ethically can\\'t be uploaded to a cloud AI. Local-first is the only way this tool can exist — and it means no subscription and no billing for a volunteer coach.'],
  ['What hardware do I need?','Node.js 22.17+ and any modern laptop. A GPU (Vulkan on Windows/Linux, Metal on macOS) makes it fast; without one it falls back to CPU, just slower.'],
];
$('#faqList').innerHTML=FAQ.map(([q,a],i)=>
  '<div class="fitem'+(i===0?' open':'')+'"><button class="fq" data-i="'+i+'">'+escapeHtml(q)+
  '<span class="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span></button>'+
  '<div class="fa"><div class="inner">'+escapeHtml(a)+'</div></div></div>').join('');
$('#faqList').addEventListener('click',(e)=>{
  const b=e.target.closest('.fq'); if(!b) return;
  const item=b.parentElement, fa=item.querySelector('.fa'), open=item.classList.contains('open');
  document.querySelectorAll('.fitem').forEach(it=>{ it.classList.remove('open'); it.querySelector('.fa').style.maxHeight='0px'; });
  if(!open){ item.classList.add('open'); fa.style.maxHeight=fa.scrollHeight+'px'; }
});
requestAnimationFrame(()=>{ const f=document.querySelector('.fitem.open .fa'); if(f) f.style.maxHeight=f.scrollHeight+'px'; });

/* Try it live */
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
  try{ const r=await fetch('/api/tag?text='+encodeURIComponent(text)); const j=await r.json();
    if(j.error) throw new Error(j.error); out.innerHTML=tagCard(text,j);
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

/* Match replay */
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
