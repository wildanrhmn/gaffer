// Landing page — bold, cinematic, scroll-driven. No italic.
//   How it works : pinned card-stack (each card advances, the previous falls back + blurs)
//   Why it matters: pinned full-screen word reveal (grey+blur -> white+sharp on scroll)
//   What you get : staggered bento reveal (deliberately different from How it works)
// All progressive: without GSAP everything is visible and readable.
import { doc, headerHtml, footerHtml } from './shared.js';

const ic = {
  listen: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10v4"/><path d="M7.5 6.5v11"/><path d="M12 4v16"/><path d="M16.5 8v8"/><path d="M21 10.5v3"/></svg>',
  plan: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5.5" y="4.5" width="13" height="16" rx="2"/><path d="M9 4.5V3.5h6v1"/><path d="M9 10h6M9 13.5h6M9 17h4"/></svg>',
  lock: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10.5" width="14" height="9.5" rx="2.2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>',
};

const HOW_CARDS = [
  { n: '01', ic: ic.listen, h: 'It follows the whole match', p: 'Talk out loud the way you already do. Gaffer turns it into a running picture of the game: who is struggling, what keeps breaking down, and what is working. You never touch your phone.' },
  { n: '02', ic: ic.plan, h: 'A real plan at half-time', p: 'When the whistle goes, you get three specific changes for the second half. Named players and the real pattern behind each one, not vague "keep it up" advice.' },
  { n: '03', ic: ic.lock, h: 'Private, and works anywhere', p: 'Nothing is uploaded and nothing sits on someone else\'s server. It all happens on your own devices. No signal at the pitch? It still works.' },
];

const CSS = `
  .hero{padding:180px 0 90px;text-align:center;display:flex;flex-direction:column;align-items:center}
  .badge{display:inline-flex;align-items:center;gap:9px;border:1px solid var(--border);background:oklch(0.18 0 0 / .5);
    border-radius:999px;padding:8px 15px;font-size:12.5px;color:var(--muted-fg);font-family:var(--mono);margin-bottom:36px;letter-spacing:.02em}
  .ping{position:relative;width:7px;height:7px;flex:0 0 auto}
  .ping i{position:absolute;inset:0;border-radius:50%;background:var(--life)}
  .ping i:first-child{animation:pg 1.8s cubic-bezier(0,0,.2,1) infinite;opacity:.6}
  @keyframes pg{75%,100%{transform:scale(2.4);opacity:0}}
  h1{font-size:clamp(56px,11vw,140px);line-height:.96;letter-spacing:-.045em;margin:0;font-weight:550;max-width:15ch}
  h1 em{font-style:normal;color:var(--life)}
  .hero .say-lede{text-align:center;font-size:20px;max-width:700px;margin-top:36px;color:var(--muted-fg)}
  .herocta{display:flex;gap:14px;align-items:center;margin-top:44px;flex-wrap:wrap;justify-content:center}
  .sline{overflow:hidden;padding-bottom:.06em}

  /* HOW IT WORKS — pinned card deck */
  .how-head{margin:0 0 30px}
  .how-head h2{font-size:clamp(30px,5vw,56px);letter-spacing:-.03em;margin:0;font-weight:550}
  .how-head h2 em{font-style:normal;color:var(--life)}
  .how-stage{position:relative}
  .how-stage.pinned{height:100vh;display:grid;place-items:center}
  .how-inner{width:100%}
  .how-inner .eyebrow{margin-bottom:34px}
  .how-deck{display:grid;grid-template-columns:1fr;gap:16px;width:100%}
  @media(min-width:860px){.how-deck{grid-template-columns:repeat(3,1fr)}}
  .how-deck.stacked{display:block;position:relative;width:min(940px,95vw);height:460px;margin:0 auto}
  .how-deck.stacked .hcard{position:absolute;top:0;left:0;width:100%}
  .steps{position:absolute;top:-44px;right:0;display:flex;gap:12px;font-family:var(--mono);font-size:12px;color:var(--faint);z-index:2}
  .steps b{color:var(--muted-fg);font-weight:400;transition:color .3s}
  .steps b.on{color:var(--life)}
  .hcard{background:oklch(0.12 0 0);border:1px solid oklch(0.24 0 0);border-radius:26px;padding:clamp(40px,5vw,60px);display:flex;flex-direction:column;min-height:440px;box-shadow:0 30px 90px -40px rgba(0,0,0,.85)}
  .hcard .row{display:flex;align-items:center;justify-content:space-between}
  .hcard .ico{width:60px;height:60px;border-radius:16px;display:grid;place-items:center;border:1px solid oklch(0.28 0 0);background:oklch(0.16 0 0);color:var(--life)}
  .hcard .ico svg{width:28px;height:28px}
  .hcard .idx{font-family:var(--mono);font-size:clamp(56px,8.5vw,120px);font-weight:400;color:oklch(0.26 0 0);letter-spacing:-.04em;line-height:1}
  .hcard h3{margin:auto 0 16px;font-size:clamp(28px,3.9vw,46px);font-weight:550;letter-spacing:-.02em}
  .hcard p{margin:0;color:var(--muted-fg);font-size:clamp(17px,1.5vw,20px);line-height:1.55;max-width:60ch}

  /* WHY IT MATTERS — numbered points, per-item scroll reveal */
  .why-sec{padding:80px 0 110px}
  .whylist{list-style:none;margin:44px 0 0;padding:0;display:flex;flex-direction:column;gap:clamp(44px,8vh,104px)}
  .whyitem{display:grid;grid-template-columns:auto 1fr;gap:clamp(20px,4vw,56px);align-items:start}
  .whyitem .wn{font-family:var(--mono);font-size:clamp(15px,1.3vw,19px);color:var(--life);padding-top:.7em;letter-spacing:.02em}
  .whyitem p{margin:0;font-size:clamp(28px,4.8vw,60px);line-height:1.16;font-weight:550;letter-spacing:-.02em;color:var(--fg)}
  .whyitem .wd{display:inline-block;will-change:filter,color,opacity}

  /* WHAT YOU GET — bento (staggered reveal) */
  .bento{display:flex;flex-direction:column;gap:16px}
  .fc{background:oklch(0.115 0 0);border:1px solid oklch(0.20 0 0);border-radius:22px;padding:clamp(32px,4vw,52px);display:flex;flex-direction:column;transition:border-color .2s}
  .fc:hover{border-color:oklch(0.28 0 0)}
  .fc .fe{font-family:var(--mono);font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted-fg);display:flex;align-items:center;gap:9px}
  .fc .fe .d{width:6px;height:6px;border-radius:50%;background:var(--life)}
  .fc h3{margin:16px 0 10px;font-size:clamp(24px,2.9vw,36px);font-weight:550;letter-spacing:-.02em}
  .fc p{margin:0;color:var(--muted-fg);font-size:clamp(16px,1.5vw,19px);line-height:1.6;max-width:74ch}

  .faq{max-width:none}
  .fitem{border-bottom:1px solid var(--border-soft)}
  .fq{width:100%;text-align:left;background:none;border:0;color:var(--fg);font:inherit;font-size:clamp(20px,2.2vw,27px);font-weight:500;letter-spacing:-.01em;
    padding:30px 4px;display:flex;justify-content:space-between;align-items:center;gap:18px;cursor:pointer}
  .fq .ic{color:var(--muted-fg);transition:transform .2s,color .2s;flex:0 0 auto}
  .fq .ic svg{width:24px;height:24px}
  .fitem.open .fq .ic{transform:rotate(45deg);color:var(--life)}
  .fa{max-height:0;overflow:hidden;transition:max-height .3s ease}
  .fa .inner{padding:0 4px 32px;color:var(--muted-fg);font-size:clamp(16px,1.5vw,19px);line-height:1.7;max-width:none}

  /* CLOSING — glowing panel */
  .closing{width:100vw;margin:44px calc(50% - 50vw) 30px;padding:0 clamp(24px,4vw,64px)}
  .closing-card{position:relative;overflow:hidden;max-width:1280px;margin:0 auto;border:1px solid oklch(0.26 0 0);border-radius:30px;
    background:radial-gradient(120% 130% at 50% -10%, oklch(0.74 0.18 162 / .16), transparent 60%), oklch(0.12 0 0);
    padding:clamp(74px,11vw,140px) clamp(40px,8vw,120px);text-align:center}
  .closing-card::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:.5;
    background-image:radial-gradient(circle at 1px 1px, rgba(255,255,255,.05) 1px, transparent 0);background-size:30px 30px}
  .closing-card h2{position:relative;font-size:clamp(38px,7vw,80px);letter-spacing:-.04em;margin:0;font-weight:550;line-height:1}
  .closing-card h2 em{font-style:normal;color:var(--life)}
  .closing-card p{position:relative;color:var(--muted-fg);font-size:18px;margin:20px auto 0;max-width:520px}
  .closing-card .herocta{position:relative;margin-top:36px}

  @media(max-width:680px){
    .hero{padding:116px 0 52px}
    h1{font-size:clamp(38px,11.5vw,62px);letter-spacing:-.03em}
    .hero .say-lede{font-size:17px;margin-top:26px}
    .herocta{margin-top:32px}
    .btn.lg{padding:13px 20px;font-size:14.5px}
    .steps{display:none}
    .how-deck{gap:14px}
    .hcard{min-height:0;padding:26px 24px;border-radius:20px}
    .hcard .row{align-items:flex-start}
    .hcard .ico{width:50px;height:50px}
    .hcard .ico svg{width:24px;height:24px}
    .hcard .idx{font-size:52px}
    .hcard h3{margin:20px 0 12px;font-size:25px}
    .hcard p{font-size:16px}
    .whyitem{gap:16px}
    .whyitem .wn{font-size:13px;padding-top:.35em}
    .whyitem p{font-size:clamp(24px,7.6vw,34px)}
    .fc{padding:26px 22px;border-radius:18px}
    .fc h3{font-size:23px}
    .fc p{font-size:16px}
    .fq{font-size:20px;padding:22px 4px;gap:14px}
    .fa .inner{font-size:16px;padding-bottom:26px}
    .closing{padding:0 14px}
    .closing-card{padding:56px 26px;border-radius:24px}
    .closing-card h2{font-size:clamp(30px,9vw,46px)}
    .closing-card p{font-size:16px}
  }
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
      <a class="btn pri lg" href="/app">Launch App →</a>
      <a class="btn subtle lg" href="/#how">See how it works</a>
    </div>
  </section>

  <section id="how">
    <div class="how-stage" id="howStage">
      <div class="how-inner">
        <div class="eyebrow"><span class="sq"></span><span class="lbl">How it works</span><span class="dots"></span></div>
        <div class="how-deck" id="howDeck">
          <div class="steps" id="steps"><b>01</b><b>02</b><b>03</b></div>
          ${HOW_CARDS.map((c) => `
        <div class="hcard">
          <div class="row"><div class="ico">${c.ic}</div><div class="idx">${c.n}</div></div>
          <h3>${c.h}</h3>
          <p>${c.p}</p>
        </div>`).join('')}
        </div>
      </div>
    </div>
  </section>

  <section class="why-sec">
    <div class="eyebrow" data-reveal><span class="sq"></span><span class="lbl">Why it matters</span><span class="dots"></span></div>
    <ol class="whylist" id="whylist">
      <li class="whyitem"><span class="wn">01</span><p>Real match analysis was built for academies and pro clubs: expensive cameras and monthly subscriptions.</p></li>
      <li class="whyitem"><span class="wn">02</span><p>Your footage ends up sitting on someone else's servers.</p></li>
      <li class="whyitem"><span class="wn">03</span><p>The millions of people coaching kids on a Sunday morning get none of it.</p></li>
      <li class="whyitem"><span class="wn">04</span><p>Gaffer gives every coach that same edge, for free, on the phone already in their pocket.</p></li>
    </ol>
  </section>

  <section id="features">
    <div class="eyebrow" data-reveal><span class="sq"></span><span class="lbl">What you get</span><span class="dots"></span></div>
    <h2 class="lede" data-reveal>Everything an analyst would give you. <em>Minus the analyst.</em></h2>
    <div class="bento" data-cards style="margin-top:40px">
      <div class="fc s3"><div class="fe"><span class="d"></span>Live match memory</div><h3>Nothing slips past you</h3><p>Every moment you call out is remembered, tied to the right player and the phase of play, so the patterns that matter don't get lost in the noise of a 90-minute match.</p></div>
      <div class="fc s3"><div class="fe"><span class="d"></span>Half-time, sorted</div><h3>Three changes, ready on the whistle</h3><p>Walk into the huddle knowing exactly what to say. Concrete adjustments drawn from your own words, not a generic checklist.</p></div>
      <div class="fc s2"><div class="fe"><span class="d"></span>Read aloud</div><h3>In your ear</h3><p>Hear the plan on the walk over. No squinting at a screen.</p></div>
      <div class="fc s2"><div class="fe"><span class="d"></span>Any language</div><h3>For the whole bench</h3><p>Share the plan with an assistant or parent in their language, instantly.</p></div>
      <div class="fc s2"><div class="fe"><span class="d"></span>Knows your squad</div><h3>The right player, always</h3><p>Say a name or a number. It never mixes your players up with the opposition.</p></div>
    </div>
  </section>

  <section id="faq">
    <div class="eyebrow" data-reveal><span class="sq"></span><span class="lbl">Questions</span><span class="dots"></span></div>
    <h2 class="lede" data-reveal>Straight answers.</h2>
    <div class="faq" id="faqList" data-reveal style="margin-top:26px"></div>
  </section>

  <section class="closing">
    <div class="closing-card" data-reveal>
      <h2>Ready to coach with <em>a plan</em>?</h2>
      <p>Free, private, and running on the phone already in your pocket.</p>
      <div class="herocta"><a class="btn pri lg" href="/app">Launch App →</a></div>
    </div>
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

/* wrap each why point into per-word spans for the scroll reveal */
(function(){
  document.querySelectorAll('.whyitem p').forEach(el=>{
    const frag=document.createDocumentFragment();
    el.textContent.split(/(\\s+)/).forEach(t=>{
      if(/^\\s+$/.test(t)) frag.appendChild(document.createTextNode(t));
      else if(t){ const s=document.createElement('span'); s.className='wd'; s.textContent=t; frag.appendChild(s); }
    });
    el.textContent=''; el.appendChild(frag);
  });
})();

/* GSAP — progressive enhancement */
function animate(){
  if(!window.gsap) return;
  const g=window.gsap; g.registerPlugin(window.ScrollTrigger, window.SplitText);

  // hero line-mask reveal
  try{
    const split=window.SplitText.create('.hero h1',{type:'lines',mask:'lines',linesClass:'sline'});
    g.from(split.lines,{yPercent:120,duration:1,ease:'power4.out',stagger:.12,delay:.05});
  }catch(_){}
  g.from('.hero .badge',{y:14,opacity:0,duration:.6});
  g.from('.hero .say-lede',{y:16,opacity:0,duration:.7,delay:.55});
  g.from('.hero .herocta',{y:16,opacity:0,duration:.7,delay:.7});

  if(!window.ScrollTrigger) return;
  const ST=window.ScrollTrigger;

  document.querySelectorAll('[data-reveal]').forEach(el=>g.from(el,{y:26,opacity:0,duration:.7,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%'}}));

  // HOW IT WORKS: pinned card deck on desktop; on mobile it falls back to a simple
  // stacked list (matchMedia auto-reverts the pin/timeline when the query stops matching).
  g.matchMedia().add('(min-width: 760px)', () => {
    const stage=document.getElementById('howStage'), deck=document.getElementById('howDeck');
    const cards=g.utils.toArray('#howDeck .hcard'); if(cards.length<2) return;
    stage.classList.add('pinned'); deck.classList.add('stacked');
    const steps=document.querySelectorAll('#steps b');
    g.set(cards,{opacity:0,yPercent:26,scale:.9,filter:'blur(6px)'});
    g.set(cards[0],{opacity:1,yPercent:0,scale:1,filter:'blur(0px)'});
    steps.forEach((s,k)=>s.classList.toggle('on',k===0));
    const tl=g.timeline({scrollTrigger:{trigger:stage,start:'top top',end:'+='+(cards.length*430),pin:true,scrub:.5,
      onUpdate:(self)=>{ const i=Math.round(self.progress*(cards.length-1)); steps.forEach((s,k)=>s.classList.toggle('on',k<=i)); }}});
    for(let i=1;i<cards.length;i++){
      tl.to(cards[i-1],{yPercent:-26,scale:.86,opacity:0,filter:'blur(10px)',ease:'none'},i-1)
        .to(cards[i],{yPercent:0,scale:1,opacity:1,filter:'blur(0px)',ease:'none'},i-1);
    }
    return () => { stage.classList.remove('pinned'); deck.classList.remove('stacked'); g.set(cards,{clearProps:'all'}); };
  });

  // WHY IT MATTERS: each numbered point lights up (grey+blur -> white+sharp) as it scrolls in
  document.querySelectorAll('.whyitem').forEach(item=>{
    const words=item.querySelectorAll('.wd'); if(!words.length) return;
    g.set(words,{color:'#3a3a3a',filter:'blur(6px)'});
    g.to(words,{color:'#f1f3f1',filter:'blur(0px)',ease:'none',stagger:.12,
      scrollTrigger:{trigger:item,start:'top 82%',end:'top 42%',scrub:.4}});
  });

  // WHAT YOU GET: staggered bento reveal (distinct from How it works)
  document.querySelectorAll('[data-cards]').forEach(grp=>{
    g.from(grp.children,{y:56,opacity:0,scale:.95,duration:.8,ease:'power3.out',stagger:.1,
      scrollTrigger:{trigger:grp,start:'top 84%'}});
  });

  ST.refresh();
}
if(document.fonts&&document.fonts.ready){ document.fonts.ready.then(animate); } else { addEventListener('load',animate); }
`;

export const LANDING = doc({ title: 'Gaffer — the assistant coach for grassroots football', body: BODY, style: CSS, script: SCRIPT, gsap: true });
