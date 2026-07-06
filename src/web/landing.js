// Landing page — product marketing only. No scripted demo, no jargon, no italic.
// Scroll-driven GSAP: hero line reveal, card reveals, a word-by-word color scrub on
// "Why it matters", and staggered feature reveals.
import { doc, headerHtml, footerHtml } from './shared.js';

const ic = {
  listen: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10v4"/><path d="M7.5 6.5v11"/><path d="M12 4v16"/><path d="M16.5 8v8"/><path d="M21 10.5v3"/></svg>',
  plan: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5.5" y="4.5" width="13" height="16" rx="2"/><path d="M9 4.5V3.5h6v1"/><path d="M9 10h6M9 13.5h6M9 17h4"/></svg>',
  lock: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10.5" width="14" height="9.5" rx="2.2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>',
};

const HERO_CSS = `
  .hero{padding:176px 0 82px;text-align:center;display:flex;flex-direction:column;align-items:center}
  .badge{display:inline-flex;align-items:center;gap:9px;border:1px solid var(--border);background:oklch(0.18 0 0 / .5);
    border-radius:999px;padding:8px 15px;font-size:12.5px;color:var(--muted-fg);font-family:var(--mono);margin-bottom:36px;letter-spacing:.02em}
  .ping{position:relative;width:7px;height:7px;flex:0 0 auto}
  .ping i{position:absolute;inset:0;border-radius:50%;background:var(--life)}
  .ping i:first-child{animation:pg 1.8s cubic-bezier(0,0,.2,1) infinite;opacity:.6}
  @keyframes pg{75%,100%{transform:scale(2.4);opacity:0}}
  h1{font-size:clamp(54px,10.6vw,132px);line-height:.98;letter-spacing:-.04em;margin:0;font-weight:550;max-width:16ch}
  h1 em{font-style:normal;color:var(--life)}
  .hero .say-lede{text-align:center;font-size:20px;max-width:700px;margin-top:34px;color:var(--muted-fg)}
  .herocta{display:flex;gap:14px;align-items:center;margin-top:42px;flex-wrap:wrap;justify-content:center}
  .sline{overflow:hidden;padding-bottom:.04em}

  .pillars{display:grid;grid-template-columns:1fr;gap:16px}
  @media(min-width:860px){.pillars{grid-template-columns:repeat(3,1fr)}}
  .pcell{display:flex;flex-direction:column;background:oklch(0.115 0 0);border:1px solid oklch(0.22 0 0);border-radius:18px;padding:32px 28px}
  .pcell .ico{width:46px;height:46px;border-radius:12px;display:grid;place-items:center;border:1px solid oklch(0.26 0 0);background:oklch(0.15 0 0);margin-bottom:22px;color:var(--life)}
  .pcell h3{margin:0 0 10px;font-size:20px;font-weight:550;letter-spacing:-.015em}
  .pcell p{margin:0;color:var(--muted-fg);font-size:15px;line-height:1.65}
  .pcell .k{margin-top:auto;padding-top:24px;font-family:var(--mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint)}

  .why-sec{padding:120px 0}
  .whytext{font-size:clamp(27px,3.9vw,48px);line-height:1.34;color:var(--fg);margin:0;max-width:1000px;letter-spacing:-.015em;font-weight:500}

  .bento{display:grid;grid-template-columns:1fr;gap:16px}
  @media(min-width:780px){.bento{grid-template-columns:repeat(6,1fr)}.s3{grid-column:span 3}.s2{grid-column:span 2}}
  .fc{background:oklch(0.115 0 0);border:1px solid oklch(0.20 0 0);border-radius:18px;padding:28px;grid-column:span 6;display:flex;flex-direction:column;transition:border-color .2s}
  .fc:hover{border-color:oklch(0.28 0 0)}
  .fc .fe{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted-fg);display:flex;align-items:center;gap:8px}
  .fc .fe .d{width:5px;height:5px;border-radius:50%;background:var(--life)}
  .fc h3{margin:16px 0 9px;font-size:21px;font-weight:550;letter-spacing:-.015em}
  .fc p{margin:0;color:var(--muted-fg);font-size:15px;line-height:1.65}

  .faq{max-width:820px}
  .fitem{border-bottom:1px solid var(--border-soft)}
  .fq{width:100%;text-align:left;background:none;border:0;color:var(--fg);font:inherit;font-size:17px;font-weight:500;
    padding:24px 4px;display:flex;justify-content:space-between;align-items:center;gap:14px;cursor:pointer}
  .fq .ic{color:var(--muted-fg);transition:transform .2s,color .2s;flex:0 0 auto}
  .fitem.open .fq .ic{transform:rotate(45deg);color:var(--life)}
  .fa{max-height:0;overflow:hidden;transition:max-height .28s ease}
  .fa .inner{padding:0 4px 26px;color:var(--muted-fg);font-size:15.5px;line-height:1.7;max-width:700px}

  .closing{text-align:center;padding:44px 0 20px}
  .closing h2{font-size:clamp(34px,6vw,64px);letter-spacing:-.035em;margin:0;font-weight:550}
  .closing h2 em{font-style:normal;color:var(--life)}
`;

const BODY = `
${headerHtml({ links: [
  { href: '/#how', label: 'How it works' },
  { href: '/#features', label: 'Features' },
  { href: '/#faq', label: 'FAQ' },
] })}

<main class="wrap">
  <section class="hero" id="top">
    <div class="badge"><span class="ping"><i></i><i></i></span>Built for touchline coaches</div>
    <h1>Your assistant coach, <em>on the touchline.</em></h1>
    <p class="say-lede">You already talk through every match. Gaffer listens, keeps track of what's really happening on the pitch, and hands you three clear changes to make at half-time. It runs on your own phone, even where there's no signal.</p>
    <div class="herocta">
      <a class="btn pri lg" href="/app">Open the app →</a>
      <a class="btn subtle lg" href="/#how">See how it works</a>
    </div>
  </section>

  <section id="how">
    <div class="eyebrow" data-reveal><span class="sq"></span><span class="lbl">How it works</span><span class="dots"></span></div>
    <h2 class="lede" data-reveal>Coach like you always do. <em>Gaffer does the rest.</em></h2>
    <p class="say-lede" data-reveal style="margin-left:0;text-align:left">No new habits and no gadgets. Prop your phone on the fence and talk.</p>
    <div class="pillars" data-cards style="margin-top:40px">
      <div class="pcell">
        <div class="ico">${ic.listen}</div>
        <h3>It follows the whole match</h3>
        <p>Talk out loud the way you already do. Gaffer turns it into a running picture of the game: who's struggling, what keeps breaking down, and what's working. You never touch your phone.</p>
        <div class="k">Hands-free</div>
      </div>
      <div class="pcell">
        <div class="ico">${ic.plan}</div>
        <h3>A real plan at half-time</h3>
        <p>When the whistle goes, you get three specific changes for the second half. Named players and the real pattern behind each one, not vague "keep it up" advice.</p>
        <div class="k">Named players and real patterns</div>
      </div>
      <div class="pcell">
        <div class="ico">${ic.lock}</div>
        <h3>Private, and works anywhere</h3>
        <p>Nothing is uploaded and nothing sits on someone else's server. It all happens on your own devices. No signal at the pitch? It still works.</p>
        <div class="k">On your device</div>
      </div>
    </div>
  </section>

  <section class="why-sec">
    <div class="eyebrow" data-reveal><span class="sq"></span><span class="lbl">Why it matters</span><span class="dots"></span></div>
    <p class="whytext">Real match analysis was built for academies and pro clubs: expensive cameras, monthly subscriptions, and your footage sitting on someone else's servers. The millions of people coaching kids on a Sunday morning get none of it. Gaffer gives every coach that same edge, for free, on the phone already in their pocket.</p>
  </section>

  <section id="features">
    <div class="eyebrow" data-reveal><span class="sq"></span><span class="lbl">What you get</span><span class="dots"></span></div>
    <h2 class="lede" data-reveal>Everything an analyst would give you. <em>Minus the analyst.</em></h2>
    <div class="bento" data-cards style="margin-top:40px">
      <div class="fc s3">
        <div class="fe"><span class="d"></span>Live match memory</div>
        <h3>Nothing slips past you</h3>
        <p>Every moment you call out is remembered, tied to the right player and the phase of play, so the patterns that matter don't get lost in the noise of a 90-minute match.</p>
      </div>
      <div class="fc s3">
        <div class="fe"><span class="d"></span>Half-time, sorted</div>
        <h3>Three changes, ready on the whistle</h3>
        <p>Walk into the huddle knowing exactly what to say. Concrete adjustments drawn from your own words, not a generic checklist.</p>
      </div>
      <div class="fc s2">
        <div class="fe"><span class="d"></span>Read aloud</div>
        <h3>In your ear</h3>
        <p>Hear the plan on the walk over. No squinting at a screen.</p>
      </div>
      <div class="fc s2">
        <div class="fe"><span class="d"></span>Any language</div>
        <h3>For the whole bench</h3>
        <p>Share the plan with an assistant or parent in their language, instantly.</p>
      </div>
      <div class="fc s2">
        <div class="fe"><span class="d"></span>Knows your squad</div>
        <h3>The right player, always</h3>
        <p>Say a name or a number. It never mixes your players up with the opposition.</p>
      </div>
    </div>
  </section>

  <section id="faq">
    <div class="eyebrow" data-reveal><span class="sq"></span><span class="lbl">Questions</span><span class="dots"></span></div>
    <h2 class="lede" data-reveal>Straight answers.</h2>
    <div class="faq" id="faqList" data-reveal style="margin-top:26px"></div>
  </section>

  <section class="closing">
    <h2 data-reveal>Ready to coach with <em>a plan</em>?</h2>
    <div class="herocta" data-reveal style="margin-top:28px"><a class="btn pri lg" href="/app">Open the app →</a></div>
  </section>
</main>

${footerHtml()}
`;

const SCRIPT = `
const FAQ=[
  ['What is Gaffer?','An assistant coach that runs on your phone. You talk through a match like normal, it keeps track of what is happening, and at half-time it gives you three specific changes to make for the second half.'],
  ['Do I need any special equipment?','No, just your phone. If you have a laptop at home, Gaffer can lean on it to think a little faster, but that is entirely optional.'],
  ['Does it work without internet?','Yes. After a one-time setup it runs completely offline, which is exactly what you want on a pitch with no signal.'],
  ['Is my team data private?','Completely. Nothing is uploaded and nothing is stored on anyone else\\'s server. Everything stays on your own device, which matters when you are coaching kids.'],
  ['Who is it for?','Any coach without an analyst: grassroots, youth, women\\'s, and rec football. If you have ever wished you had someone tracking the game for you, that is the idea.'],
  ['What does it cost?','Nothing. Gaffer is free.'],
];
const faqList=document.getElementById('faqList');
function esc(s){return String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));}
faqList.innerHTML=FAQ.map(([q,a],i)=>
  '<div class="fitem'+(i===0?' open':'')+'"><button class="fq" data-i="'+i+'">'+esc(q)+
  '<span class="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span></button>'+
  '<div class="fa"><div class="inner">'+esc(a)+'</div></div></div>').join('');
faqList.addEventListener('click',(e)=>{
  const b=e.target.closest('.fq'); if(!b) return;
  const item=b.parentElement, fa=item.querySelector('.fa'), open=item.classList.contains('open');
  document.querySelectorAll('.fitem').forEach(it=>{ it.classList.remove('open'); it.querySelector('.fa').style.maxHeight='0px'; });
  if(!open){ item.classList.add('open'); fa.style.maxHeight=fa.scrollHeight+'px'; }
});
requestAnimationFrame(()=>{ const f=document.querySelector('.fitem.open .fa'); if(f) f.style.maxHeight=f.scrollHeight+'px'; });

const hdr=document.getElementById('hdr');
addEventListener('scroll',()=>hdr.classList.toggle('scrolled',scrollY>8),{passive:true});

/* GSAP — progressive enhancement (content is fully visible without it) */
function animate(){
  if(!window.gsap) return;
  const g=window.gsap; g.registerPlugin(window.ScrollTrigger, window.SplitText);

  // hero: line-mask reveal
  try{
    const h=document.querySelector('.hero h1');
    const split=window.SplitText.create(h,{type:'lines',mask:'lines',linesClass:'sline'});
    g.from(split.lines,{yPercent:118,duration:1,ease:'power4.out',stagger:.12,delay:.05});
  }catch(_){}
  g.from('.hero .badge',{y:14,opacity:0,duration:.6});
  g.from('.hero .say-lede',{y:16,opacity:0,duration:.7,delay:.55});
  g.from('.hero .herocta',{y:16,opacity:0,duration:.7,delay:.7});

  if(!window.ScrollTrigger) return;

  // simple reveals
  document.querySelectorAll('[data-reveal]').forEach(el=>g.from(el,{y:26,opacity:0,duration:.7,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 86%'}}));

  // card grids: rise + settle out of a blur, staggered
  document.querySelectorAll('[data-cards]').forEach(grp=>{
    g.from(grp.children,{y:60,opacity:0,scale:.94,filter:'blur(12px)',duration:.9,ease:'power3.out',stagger:.13,
      scrollTrigger:{trigger:grp,start:'top 82%'}});
  });

  // why: words light up from grey to white as you scroll through
  try{
    const wt=document.querySelector('.whytext');
    const ws=window.SplitText.create(wt,{type:'words'});
    g.set(ws.words,{color:'#4a4a4a'});
    g.to(ws.words,{color:'#eef1ee',ease:'none',stagger:{each:0.4},
      scrollTrigger:{trigger:'.why-sec',start:'top 66%',end:'bottom 80%',scrub:0.5}});
  }catch(_){}
}
if(document.fonts&&document.fonts.ready){ document.fonts.ready.then(animate); } else { addEventListener('load',animate); }
`;

export const LANDING = doc({ title: 'Gaffer — the assistant coach for grassroots football', body: BODY, style: HERO_CSS, script: SCRIPT, gsap: true });
