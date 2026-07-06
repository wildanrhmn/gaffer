// Single-page landing UI, served as a string. Self-contained (inline CSS + JS).
// Design language: pure-neutral dark, restrained green/violet accents used only as
// highlights, Instrument Serif italic for emphasis, mono for data, generous spacing.
export const PAGE = /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Gaffer — the on-device assistant coach for grassroots football</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
<style>
  :root{
    --bg:oklch(0.07 0 0); --fg:oklch(0.96 0 0);
    --surface:oklch(0.10 0 0); --surface2:oklch(0.115 0 0);
    --muted:oklch(0.18 0 0); --muted-fg:oklch(0.60 0 0); --faint:oklch(0.45 0 0);
    --border:oklch(0.20 0 0); --border-soft:oklch(0.145 0 0);
    --life:oklch(0.74 0.18 162); --lineage:oklch(0.70 0.18 290); --danger:oklch(0.66 0.21 25);
    --r:0.625rem;
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
      radial-gradient(760px 460px at 50% -6%, oklch(0.74 0.18 162 / .09), transparent 70%),
      radial-gradient(600px 420px at 12% 26%, oklch(0.70 0.18 290 / .07), transparent 72%)}
  body::after{content:"";position:fixed;inset:0;z-index:-2;pointer-events:none;opacity:.4;
    background-image:radial-gradient(circle at 1px 1px, rgba(255,255,255,.05) 1px, transparent 0);background-size:34px 34px}
  a{color:var(--fg);text-decoration:none}
  ::selection{background:var(--life);color:var(--bg)}
  ::-webkit-scrollbar{width:9px;height:9px}
  ::-webkit-scrollbar-thumb{background:var(--muted);border-radius:9px}
  ::-webkit-scrollbar-thumb:hover{background:var(--faint)}
  .wrap{max-width:1080px;margin:0 auto;padding:0 24px}
  svg{display:block}

  /* header */
  header.site{position:sticky;top:0;z-index:30;transition:background .25s,border-color .25s;border-bottom:1px solid transparent}
  header.site.scrolled{background:oklch(0.07 0 0 / .78);backdrop-filter:blur(12px);border-color:var(--border-soft)}
  .bar{display:flex;align-items:center;gap:26px;height:66px}
  .logo{font-weight:600;font-size:18px;letter-spacing:-.01em;display:flex;align-items:center;gap:9px}
  .logo .dot{width:7px;height:7px;border-radius:50%;background:var(--life);box-shadow:0 0 12px var(--life)}
  .nav{display:flex;gap:26px;margin-left:6px}
  .nav a{color:var(--muted-fg);font-size:14px;transition:color .15s}
  .nav a:hover{color:var(--fg)}
  .hcta{margin-left:auto;display:flex;gap:14px;align-items:center}
  .ghost{color:var(--muted-fg);font-size:14px}.ghost:hover{color:var(--fg)}
  @media(max-width:760px){.nav{display:none}}

  /* buttons */
  .btn{display:inline-flex;align-items:center;gap:8px;font:inherit;font-size:14px;font-weight:500;
    border-radius:999px;cursor:pointer;border:1px solid var(--border);background:var(--muted);color:var(--fg);
    padding:10px 18px;position:relative;overflow:hidden;transition:transform .25s,border-color .2s}
  .btn:hover{transform:translateY(-1px);border-color:oklch(0.30 0 0)}
  .btn.lg{padding:14px 24px;font-size:15px}
  .btn.pri::after{content:"";position:absolute;inset:0;width:38%;pointer-events:none;
    background:linear-gradient(90deg,transparent,oklch(0.74 0.18 162 / .30),transparent);
    transform:skewX(-14deg) translateX(-180%);animation:shine 3.6s ease-in-out infinite}
  @keyframes shine{0%{transform:skewX(-14deg) translateX(-180%)}42%,100%{transform:skewX(-14deg) translateX(420%)}}
  .btn.subtle{background:transparent;border-color:var(--border)}
  .btn:disabled{opacity:.5;cursor:default;transform:none}

  /* announce */
  .announce{border-bottom:1px solid var(--border-soft)}
  .announce .row{display:flex;align-items:center;gap:12px;height:40px;font-size:12.5px;color:var(--muted-fg);
    font-family:var(--mono);flex-wrap:wrap;overflow:hidden;letter-spacing:.01em}
  .announce .k{color:var(--fg)}
  .sep{color:var(--faint)}

  /* eyebrow / section header */
  .eyebrow{display:flex;align-items:center;gap:14px;border-top:1px solid var(--border-soft);
    border-bottom:1px solid var(--border-soft);padding:11px 0;margin:0 0 40px}
  .eyebrow .sq{width:9px;height:9px;transform:rotate(45deg);border:1px solid oklch(0.96 0 0 / .7);flex:0 0 auto}
  .eyebrow .lbl{font-family:var(--mono);font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:oklch(0.96 0 0 / .72)}
  .eyebrow .dots{flex:1;height:2px;opacity:.6;
    background-image:radial-gradient(circle, rgba(255,255,255,.42) 1px, transparent 1px);background-size:8px 2px;background-repeat:repeat-x}

  section{padding:56px 0}
  .lede{font-size:clamp(28px,4vw,44px);line-height:1.12;letter-spacing:-.02em;margin:0;font-weight:500;max-width:760px}
  .lede em{font-family:var(--serif);font-style:italic;font-weight:400}
  .lede .mut{color:var(--muted-fg)}
  .say-lede{color:var(--muted-fg);font-size:17px;max-width:600px;margin:18px 0 0;line-height:1.6}

  /* hero */
  .hero{padding:96px 0 64px;text-align:center;display:flex;flex-direction:column;align-items:center}
  .badge{display:inline-flex;align-items:center;gap:9px;border:1px solid var(--border);background:oklch(0.18 0 0 / .5);
    border-radius:999px;padding:7px 14px;font-size:12.5px;color:var(--muted-fg);font-family:var(--mono);margin-bottom:34px}
  .ping{position:relative;width:7px;height:7px;flex:0 0 auto}
  .ping i{position:absolute;inset:0;border-radius:50%;background:var(--life)}
  .ping i:first-child{animation:ping 1.8s cubic-bezier(0,0,.2,1) infinite;opacity:.6}
  @keyframes ping{75%,100%{transform:scale(2.4);opacity:0}}
  h1{font-size:clamp(46px,8.4vw,104px);line-height:1.0;letter-spacing:-.035em;margin:0;font-weight:500;max-width:14ch}
  h1 em{font-family:var(--serif);font-style:italic;font-weight:400;color:var(--life)}
  .hero .say-lede{text-align:center;font-size:19px;max-width:640px;margin-top:30px}
  .herocta{display:flex;gap:14px;align-items:center;margin-top:38px;flex-wrap:wrap;justify-content:center}

  /* pillars */
  .pillars{display:grid;grid-template-columns:1fr;gap:1px;background:var(--border-soft);border:1px solid var(--border-soft);border-radius:14px;overflow:hidden}
  @media(min-width:860px){.pillars{grid-template-columns:repeat(3,1fr)}}
  .pcell{background:var(--bg);padding:30px 28px}
  .pcell .ico{width:38px;height:38px;border-radius:10px;display:grid;place-items:center;border:1px solid var(--border);background:var(--surface);margin-bottom:18px;color:var(--muted-fg)}
  .pcell h3{margin:0 0 8px;font-size:18px;font-weight:500;letter-spacing:-.01em}
  .pcell p{margin:0;color:var(--muted-fg);font-size:14.5px;line-height:1.6}
  .pcell .k{margin-top:18px;font-family:var(--mono);font-size:11.5px;color:var(--faint);letter-spacing:.02em}
  .pcell .k b{color:var(--life);font-weight:400}
  .pcell .k b.v{color:var(--lineage)}

  /* why band */
  .why p{font-size:clamp(20px,2.6vw,27px);line-height:1.5;color:var(--muted-fg);margin:0;max-width:900px;letter-spacing:-.01em}
  .why p b{color:var(--fg);font-weight:500}
  .why p em{font-family:var(--serif);font-style:italic;color:var(--fg);font-weight:400}

  /* bento */
  .bento{display:grid;grid-template-columns:1fr;gap:14px}
  @media(min-width:780px){.bento{grid-template-columns:repeat(6,1fr)}.s3{grid-column:span 3}.s2{grid-column:span 2}}
  .fc{background:var(--surface);border:1px solid var(--border-soft);border-radius:14px;padding:24px;grid-column:span 6;transition:border-color .2s}
  .fc:hover{border-color:var(--border)}
  .fc .fe{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted-fg);display:flex;align-items:center;gap:8px}
  .fc .fe .d{width:5px;height:5px;border-radius:50%;background:var(--life)}
  .fc .fe .d.v{background:var(--lineage)}
  .fc h3{margin:14px 0 8px;font-size:19px;font-weight:500;letter-spacing:-.01em}
  .fc p{margin:0;color:var(--muted-fg);font-size:14.5px;line-height:1.6}
  .fc p b{color:var(--fg);font-weight:500}
  .fc .model{margin-top:16px;display:inline-block;font-family:var(--mono);font-size:11.5px;color:var(--faint);border:1px solid var(--border-soft);border-radius:7px;padding:4px 9px}

  /* generic card */
  .card{background:var(--surface);border:1px solid var(--border-soft);border-radius:14px}
  .card .hd{padding:15px 20px;border-bottom:1px solid var(--border-soft);display:flex;justify-content:space-between;align-items:center}
  .card .hd h3{margin:0;font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted-fg)}
  .badge2{font-family:var(--mono);font-size:11.5px;color:var(--lineage)}

  /* try it */
  .try{padding:26px;margin-top:8px}
  .inputrow{display:flex;gap:12px;flex-wrap:wrap}
  .field{flex:1;min-width:240px}
  input[type=text]{width:100%;background:var(--bg);color:var(--fg);border:1px solid var(--border);border-radius:11px;
    padding:15px 16px;font:inherit;font-size:15px;outline:none;transition:border-color .15s,box-shadow .15s}
  input[type=text]:focus{border-color:var(--life);box-shadow:0 0 0 3px oklch(0.74 0.18 162 / .16)}
  input::placeholder{color:var(--faint)}
  .exs{margin-top:14px;display:flex;gap:8px;flex-wrap:wrap}
  .ex{background:var(--bg);border:1px solid var(--border-soft);color:var(--muted-fg);font:inherit;font-size:12.5px;
    padding:8px 12px;border-radius:999px;cursor:pointer;text-align:left;transition:border-color .15s,color .15s}
  .ex:hover{border-color:var(--border);color:var(--fg)}
  .squadref{margin-top:16px;color:var(--muted-fg);font-size:12.5px}
  .num{display:inline-block;font-family:var(--mono);font-size:11.5px;color:var(--muted-fg);background:var(--bg);
    border:1px solid var(--border-soft);border-radius:7px;padding:2px 7px;margin:2px 4px 0 0}
  .num b{color:var(--fg);font-weight:500}
  #tagout{margin-top:18px}
  .thinking{display:flex;gap:10px;align-items:center;color:var(--muted-fg);font-size:14px;padding:6px 2px}
  .tagres{border:1px solid var(--border);border-radius:12px;padding:16px 18px;background:var(--bg);animation:in .25s ease}
  .say{font-size:16px;font-family:var(--serif);font-style:italic;font-size:19px}
  .say.neg{color:oklch(0.72 0.15 25)}.say.pos{color:var(--life)}
  .tagrow{margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;align-items:center}
  .phase{font-family:var(--mono);font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--muted-fg);border:1px solid var(--border-soft);border-radius:6px;padding:4px 8px}
  .who{font-family:var(--mono);font-size:11.5px;color:var(--fg);background:var(--muted);border:1px solid var(--border);border-radius:6px;padding:3px 8px}
  .theme{font-size:12px;color:var(--muted-fg);background:var(--surface2);border:1px solid var(--border-soft);border-radius:6px;padding:3px 8px}
  .senti{font-family:var(--mono);font-size:11px;margin-left:auto;color:var(--faint);text-transform:uppercase;letter-spacing:.08em}
  .senti.neg{color:oklch(0.66 0.18 25)}.senti.pos{color:var(--life)}
  .dim{color:var(--muted-fg)}

  /* match */
  .cta{display:flex;gap:16px;align-items:center;margin:6px 0 20px;flex-wrap:wrap}
  .matchbar{margin:20px 0 0;padding:16px 18px;background:var(--surface);border:1px solid var(--border-soft);border-radius:12px}
  .vs{font-size:18px;font-weight:500;letter-spacing:-.01em}
  .grid{display:grid;grid-template-columns:1fr;gap:16px}
  @media(min-width:900px){.grid{grid-template-columns:1.1fr .9fr}}
  .feed{max-height:56vh;overflow:auto;padding:8px}
  .rrow{display:grid;grid-template-columns:46px 96px 1fr;gap:12px;align-items:baseline;padding:11px 10px;animation:in .25s ease}
  .rrow+.rrow{border-top:1px solid var(--border-soft)}
  @keyframes in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  .clock{color:var(--faint);font-family:var(--mono);font-size:12.5px}
  .say2{color:var(--fg);font-size:14.5px}.say2.neg{color:oklch(0.74 0.13 25)}.say2.pos{color:var(--life)}
  .meta{margin-top:7px;display:flex;gap:6px;flex-wrap:wrap}
  .empty{color:var(--muted-fg);padding:28px;text-align:center;font-size:14px}
  .ht{padding:20px}
  .status{display:flex;gap:11px;align-items:center;margin:14px 0;color:var(--muted-fg);font-size:14px}
  .spin{width:15px;height:15px;border:2px solid var(--muted);border-top-color:var(--life);border-radius:50%;animation:sp .8s linear infinite}
  @keyframes sp{to{transform:rotate(360deg)}}
  .adj{display:flex;gap:14px;padding:15px;border:1px solid var(--border-soft);border-radius:11px;margin-top:11px;background:var(--bg);animation:in .3s ease}
  .adj .n{flex:0 0 24px;height:24px;border-radius:50%;border:1px solid var(--border);background:var(--muted);color:var(--fg);font-family:var(--mono);font-size:12px;display:grid;place-items:center}
  .adj .tx{font-size:14.5px;line-height:1.55}
  .tools{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:18px}
  select{background:var(--muted);color:var(--fg);border:1px solid var(--border);border-radius:9px;padding:9px 11px;font:inherit;font-size:13px}
  .sec-btn{background:var(--muted);color:var(--fg);border:1px solid var(--border);font:inherit;font-size:13px;font-weight:500;padding:10px 14px;border-radius:999px;cursor:pointer;transition:border-color .2s}
  .sec-btn:hover{border-color:oklch(0.30 0 0)}
  #tstat{font-size:13px}

  /* faq */
  .faq{max-width:800px}
  .fitem{border-bottom:1px solid var(--border-soft)}
  .fq{width:100%;text-align:left;background:none;border:0;color:var(--fg);font:inherit;font-size:16px;font-weight:500;
    padding:20px 4px;display:flex;justify-content:space-between;align-items:center;gap:14px;cursor:pointer}
  .fq .ic{color:var(--muted-fg);transition:transform .2s,color .2s;flex:0 0 auto}
  .fitem.open .fq .ic{transform:rotate(45deg);color:var(--life)}
  .fa{max-height:0;overflow:hidden;transition:max-height .28s ease}
  .fa .inner{padding:0 4px 22px;color:var(--muted-fg);font-size:15px;line-height:1.65;max-width:680px}

  footer{margin-top:40px;border-top:1px solid var(--border-soft);padding:40px 0 60px}
  .foot{display:flex;gap:26px;justify-content:space-between;flex-wrap:wrap;align-items:flex-start}
  .foot .brand{font-size:18px;font-weight:500;display:flex;align-items:center;gap:9px}
  .foot .brand .dot{width:7px;height:7px;border-radius:50%;background:var(--life)}
  .foot .desc{color:var(--muted-fg);font-size:14px;max-width:340px;margin-top:12px;line-height:1.6}
  .foot .fine{color:var(--faint);font-family:var(--mono);font-size:11.5px;margin-top:16px;letter-spacing:.01em}
  .foot .links{display:flex;flex-direction:column;gap:12px}
  .foot .links a{color:var(--muted-fg);font-size:14px}.foot .links a:hover{color:var(--fg)}
</style>
</head>
<body>
<header class="site" id="siteHeader">
  <div class="wrap bar">
    <div class="logo"><span class="dot"></span>Gaffer</div>
    <nav class="nav">
      <a href="#how">How it works</a>
      <a href="#features">Features</a>
      <a href="#try">Try it</a>
      <a href="#faq">FAQ</a>
    </nav>
    <div class="hcta">
      <a class="ghost" href="https://github.com/wildanrhmn/gaffer" target="_blank" rel="noopener">GitHub</a>
      <a class="btn pri" href="#try">Try it live</a>
    </div>
  </div>
</header>

<div class="announce">
  <div class="wrap row">
    <span class="k">Tether Developers Cup</span><span class="sep">/</span><span>QVAC · Local AI track</span>
    <span class="sep">·</span><span>runs 100% on device</span><span class="sep">·</span><span>no cloud · no API key · MIT</span>
  </div>
</div>

<main class="wrap">
  <!-- HERO -->
  <header class="hero" id="top">
    <div class="badge"><span class="ping"><i></i><i></i></span>On-device AI · grassroots football</div>
    <h1>Your assistant coach. On the touchline. <em>Offline.</em></h1>
    <p class="say-lede">Talk through a match like you already do. Gaffer transcribes and tags every remark on your device, then at half-time hands you three concrete adjustments — read aloud, in your language. The kids' data never leaves the touchline.</p>
    <div class="herocta">
      <a class="btn pri lg" href="#try">Tag your own remark →</a>
      <a class="btn subtle lg" href="#match">Watch the demo</a>
    </div>
  </header>

  <!-- HOW -->
  <section id="how">
    <div class="eyebrow"><span class="sq"></span><span class="lbl">How it works</span><span class="dots"></span></div>
    <h2 class="lede">One coach's voice. <em class="mut">Three on-device engines.</em></h2>
    <p class="say-lede">Everything runs on hardware you already own — a mid-range phone and an old laptop.</p>
    <div class="pillars" style="margin-top:36px">
      <div class="pcell">
        <div class="ico">🎙️</div>
        <h3>Listen &amp; understand</h3>
        <p>Whisper transcribes each remark and a small language model tags it — which player, which phase of play, which recurring theme — in about a fifth of a second.</p>
        <div class="k">Whisper + Qwen3 · <b>on-device</b></div>
      </div>
      <div class="pcell">
        <div class="ico">🛰️</div>
        <h3>Offload the heavy thinking</h3>
        <p>The one heavy call — the half-time synthesis — is delegated from the phone to your laptop over peer-to-peer, with automatic local fallback. No server in the middle.</p>
        <div class="k">QVAC delegation · <b class="v">Hyperswarm DHT</b></div>
      </div>
      <div class="pcell">
        <div class="ico">🔊</div>
        <h3>Speak it, translate it</h3>
        <p>The three adjustments are read aloud in your earbud and translated on-device for a multilingual bench — all without a single network request.</p>
        <div class="k">Supertonic TTS + Bergamot NMT</div>
      </div>
    </div>
  </section>

  <!-- WHY -->
  <section>
    <div class="eyebrow"><span class="sq"></span><span class="lbl">Why it exists</span><span class="dots"></span></div>
    <div class="why">
      <p>Match analysis today means <b>Veo, Hudl, Trace</b> — thousands in hardware plus a cloud subscription, and your footage lives on their servers. The tens of millions of volunteer coaches get nothing: they can't afford it, and the footage contains <b>minors</b> that can't be uploaded to a cloud AI. <em>Gaffer exists because it's local</em> — the kids' data never leaves the touchline.</p>
    </div>
  </section>

  <!-- FEATURES -->
  <section id="features">
    <div class="eyebrow"><span class="sq"></span><span class="lbl">Under the hood</span><span class="dots"></span></div>
    <h2 class="lede">Five local-AI capabilities. <em class="mut">All load-bearing.</em></h2>
    <p class="say-lede">Not a logo bolted on — every one is verified running on-device, end to end.</p>
    <div class="bento" style="margin-top:36px">
      <div class="fc s3">
        <div class="fe"><span class="d"></span>Tagging</div>
        <h3>It knows who you mean</h3>
        <p>"Their 7 got in behind Priya" resolves to <b>our #2 Priya</b>, not the opponent's 7 — a deterministic guardrail small models can't fake. Every remark gets a player, a phase, a theme, and a sentiment.</p>
        <div class="model">Qwen3-1.7B · ~0.2s each</div>
      </div>
      <div class="fc s3">
        <div class="fe"><span class="d v"></span>P2P synthesis</div>
        <h3>The phone offloads to the laptop</h3>
        <p>At half-time the heavy model runs on your laptop over pure peer-to-peer and sends back three specific adjustments — the same call falls back to local if no laptop is around.</p>
        <div class="model">QVAC delegate · Hyperswarm DHT</div>
      </div>
      <div class="fc s2">
        <div class="fe"><span class="d"></span>Speech</div>
        <h3>Transcribe the touchline</h3>
        <p>Whisper turns narration into text, on-device, offline.</p>
        <div class="model">Whisper</div>
      </div>
      <div class="fc s2">
        <div class="fe"><span class="d"></span>Read-back</div>
        <h3>In your earbud</h3>
        <p>Supertonic reads the plan aloud on the walk to the huddle.</p>
        <div class="model">Supertonic TTS</div>
      </div>
      <div class="fc s2">
        <div class="fe"><span class="d"></span>Translate</div>
        <h3>For the whole bench</h3>
        <p>The adjustments in ES · PT · FR · DE · IT, computed locally.</p>
        <div class="model">Bergamot NMT</div>
      </div>
    </div>
  </section>

  <!-- TRY -->
  <section id="try">
    <div class="eyebrow"><span class="sq"></span><span class="lbl">Try it live · on your device</span><span class="dots"></span></div>
    <h2 class="lede">Type a touchline remark. <em>Watch the model tag it.</em></h2>
    <p class="say-lede">This isn't a canned demo — your text is analyzed live by the model running on this machine.</p>
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

  <!-- MATCH -->
  <section id="match">
    <div class="eyebrow"><span class="sq"></span><span class="lbl">The sample match</span><span class="dots"></span></div>
    <h2 class="lede">A full half, <em>tagged live, then synthesized.</em></h2>
    <p class="say-lede">A replay of a sample game standing in for a live mic — every tag and the half-time plan are computed on-device each time you press kick off.</p>
    <div class="matchbar"><span class="vs" id="vs">—</span><div class="meta" id="squad" style="margin-top:10px"></div></div>
    <div class="cta" style="margin-top:18px">
      <button class="btn pri lg" id="go">Kick off ▶</button>
      <span class="dim" id="hint" style="font-size:13.5px">Watch the timeline build itself, then the half-time card.</span>
    </div>
    <div class="grid">
      <div class="card">
        <div class="hd"><h3>Live touchline <span id="count" class="dim"></span></h3></div>
        <div class="feed" id="feed"><div class="empty">Press <b>Kick off</b> to replay the match.</div></div>
      </div>
      <div class="card">
        <div class="hd"><h3>Half-time</h3><span id="htbadge" class="badge2"></span></div>
        <div class="ht" id="ht"><div class="empty">The three adjustments appear here at half-time.</div></div>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section id="faq">
    <div class="eyebrow"><span class="sq"></span><span class="lbl">Questions</span><span class="dots"></span></div>
    <h2 class="lede">Straight answers.</h2>
    <div class="faq" id="faqList" style="margin-top:24px"></div>
  </section>
</main>

<footer>
  <div class="wrap foot">
    <div>
      <div class="brand"><span class="dot"></span>Gaffer</div>
      <div class="desc">Match analysis for the 99% of football that isn't professional. On your hardware, not theirs.</div>
      <div class="fine">QVAC (on-device AI) + Pears (P2P) · MIT · Tether Developers Cup</div>
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

const hdr=$('#siteHeader');
addEventListener('scroll',()=>{ hdr.classList.toggle('scrolled', scrollY>8); }, {passive:true});

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
  ['What is the "provider" / peer-to-peer part?','The one heavy call — the half-time synthesis — can be offloaded from the phone to your laptop over peer-to-peer (a phone cannot comfortably run the bigger model). Start the provider on your laptop, and the app uses it automatically, falling back to local if it is not there.'],
  ['Why does being local matter here?','Grassroots footage and match notes involve minors, which legally and ethically cannot be uploaded to a cloud AI. Local-first is the only way this tool can exist — and it means no subscription and no billing for a volunteer coach.'],
  ['What hardware do I need?','Node.js 22.17+ and any modern laptop. A GPU (Vulkan on Windows/Linux, Metal on macOS) makes it fast; without one it falls back to CPU, just slower.'],
];
$('#faqList').innerHTML=FAQ.map(([q,a],i)=>
  '<div class="fitem'+(i===0?' open':'')+'"><button class="fq" data-i="'+i+'">'+escapeHtml(q)+
  '<span class="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span></button>'+
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
  const senti=j.sentiment<-0.15?'concern':j.sentiment>0.15?'praise':'note';
  return '<div class="tagres"><div class="say '+tone+'">"'+escapeHtml(text)+'"</div>'+
    '<div class="tagrow"><span class="phase">'+escapeHtml(j.phase)+'</span>'+who+themes+
    '<span class="senti '+tone+'">'+senti+'</span></div></div>';
}

/* Match replay */
function phaseRow(e){
  const who=e.players.map(p=>'<span class="who">#'+p.n+(p.name?' '+escapeHtml(p.name):'')+'</span>').join(' ');
  const themes=e.themes.map(t=>'<span class="theme">'+escapeHtml(t)+'</span>').join(' ');
  const tone=e.sentiment<-0.15?'neg':e.sentiment>0.15?'pos':'';
  const div=document.createElement('div'); div.className='rrow';
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
      $('#ht').innerHTML='<div class="dim" style="font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase">Recurring themes</div><div class="meta" style="margin:10px 0 4px">'+chips+'</div>'+
        '<div class="status"><span class="spin"></span> Synthesizing three adjustments'+
        (delegated?' — <span class="badge2">delegated to your laptop over P2P</span>':' (on-device)')+'…</div>';
    }
    else if(e.type==='adjustments'){
      const secs=(e.ms/1000).toFixed(1);
      $('#htbadge').textContent=e.delegated?('P2P · '+secs+'s'):(secs+'s · local');
      adjText=e.items.map((a,i)=>(i+1)+'. '+a).join('  ');
      let html='<div class="dim" style="font-size:13.5px">Coach — three things for the second half'+(e.delegated?' <span class="badge2">(computed on your laptop, not the phone)</span>':'')+':</div>';
      e.items.forEach((a,i)=>{ html+='<div class="adj"><div class="n">'+(i+1)+'</div><div class="tx">'+escapeHtml(a)+'</div></div>'; });
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
      const j=await r.json(); tstat.innerHTML='<span class="badge2">'+(LNAME[to]||to)+'</span> '+escapeHtml(j.text||j.error||'');
    }catch(_){ tstat.textContent='translation failed'; } finally{ tr.disabled=false; }
  };
}
</script>
</body>
</html>`;
