const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<script defer src="([^"]+)"/g, '<script type="text/plain" data-motion-src="$1"');
const start = html.indexOf('  /* manifesto word split');
const end = html.indexOf('\n});\n/* 3D hero sculpture', start);
let setup = html.slice(start, end);
setup = setup.replace(/  \/\* manifesto word split[\s\S]*?  const expo = 'expo.out';/, `  if (!root.classList.contains('motion')) return;
  const desktop = matchMedia('(min-width: 768px)');
  const idle = () => new Promise(resolve => {
    const next = () => setTimeout(resolve, 0);
    if (window.requestIdleCallback) requestIdleCallback(next, { timeout: 1200 });
    else setTimeout(next, 50);
  });
  const loadScript = source => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = source.dataset.motionSrc;
    script.integrity = source.integrity;
    script.crossOrigin = source.crossOrigin;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  const once = (target, start, animate) => {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      if (root.classList.contains('motion')) animate();
    }, { rootMargin: '0px 0px -' + (100 - start) + '% 0px' });
    observer.observe(el);
  };
  const expo = 'expo.out';
  const setupMotion = async () => {
    await idle();
    const sources = [...document.querySelectorAll('[data-motion-src]')];
    await loadScript(sources[0]);
    await idle();
    if (desktop.matches) {
      await loadScript(sources[1]);
      await idle();
      gsap.registerPlugin(ScrollTrigger);
      await idle();
      await loadScript(sources[2]);
      await idle();
      /* Desktop smooth scroll; mobile keeps native scrolling. */
      if (window.Lenis) {
        const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(t => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
        document.querySelectorAll('a[href^="#"]').forEach(a => {
          const id = a.getAttribute('href');
          if (id.length > 1) a.addEventListener('click', e => { e.preventDefault(); lenis.scrollTo(id, { offset: -24, duration: 1.6 }); });
        });
      }
    }
    await idle();`);
setup = setup.replace("  document.querySelectorAll('[data-count]').forEach(el => {", "  for (const el of document.querySelectorAll('[data-count]')) {\n    await idle();");
setup = setup.replace("    gsap.to(o, { v: end,", "    once(el, 92, () => gsap.to(o, { v: end,");
setup = setup.replace("      scrollTrigger: { trigger: el, start: 'top 92%', once: true },\n", '');
setup = setup.replace("maximumFractionDigits: dec }) });\n  });", "maximumFractionDigits: dec }) }));\n  }");
const revealStart = setup.indexOf('  /* staggered reveals */');
const revealEnd = setup.indexOf('  const mm =', revealStart);
setup = setup.slice(0, revealStart) + `  /* One observer replaces per-element trigger measurement and global refresh.
     Only offscreen elements animate; visible content never flashes or disappears. */
  const revealObserver = new IntersectionObserver(entries => {
    const els = entries.filter(e => e.isIntersecting).map(e => e.target);
    els.forEach(el => revealObserver.unobserve(el));
    if (!els.length || !root.classList.contains('motion')) return;
    gsap.fromTo(els, { opacity: 0, y: 56, ...(desktop.matches ? { filter: 'blur(8px)' } : {}) },
      { opacity: 1, y: 0, ...(desktop.matches ? { filter: 'blur(0px)' } : {}), duration: 1.3, ease: expo, stagger: 0.1,
        onComplete: () => els.forEach(el => { el.classList.add('in'); gsap.set(el, { clearProps: 'opacity,transform,filter' }); }) });
  }, { rootMargin: '0px 0px -12% 0px' });
  for (const section of document.querySelectorAll('main > section')) {
    await idle();
    const reveals = [...section.querySelectorAll('[data-reveal]')];
    const below = reveals.map(el => el.getBoundingClientRect().top >= innerHeight);
    reveals.forEach((el, i) => { if (below[i]) revealObserver.observe(el); else el.classList.add('in'); });
  }
  await idle();

  if (desktop.matches) {
` + setup.slice(revealEnd);
setup = setup.replace("  /* manifesto: words light up as you read */", "  }\n  await idle();\n\n  /* manifesto: split only when its animation is about to be used */\n  const man = document.getElementById('manifesto');\n  const lightWords = () => {\n    man.innerHTML = man.textContent.trim().split(/\\s+/).map(w => `<span class=\"w\">${w}</span>`).join(' ');\n");
setup = setup.replace("    scrollTrigger: { trigger: '#manifesto', start: 'top 80%', end: 'bottom 45%', scrub: true } });", "    ...(desktop.matches && window.ScrollTrigger ? { scrollTrigger: { trigger: '#manifesto', start: 'top 80%', end: 'bottom 45%', scrub: true } } : { duration: 1.3 }) });\n  };\n  if (desktop.matches) lightWords(); else once(man, 80, lightWords);\n  await idle();");
setup = setup.replace("  gsap.from('.ev',", "  once('.cal', 85, () => gsap.from('.ev',");
setup = setup.replace("    scrollTrigger: { trigger: '.cal', start: 'top 85%', once: true } });", "    }));\n  await idle();");
setup = setup.replace("  gsap.from('[data-bar]', { scaleX: 0, duration: 1.6, ease: expo, scrollTrigger: { trigger: '[data-bar]', start: 'top 90%', once: true } });", "  once('[data-bar]', 90, () => gsap.from('[data-bar]', { scaleX: 0, duration: 1.6, ease: expo }));\n  await idle();");
setup = setup.replace("  gsap.from('.tile',", "  once('.board', 85, () => gsap.from('.tile',");
setup = setup.replace("    scrollTrigger: { trigger: '.board', start: 'top 85%', once: true } });", "    }));\n  await idle();");
setup = setup.replace("  gsap.to('.rail i', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#steps', start: 'top 60%', end: 'bottom 60%', scrub: true } });", "  if (desktop.matches) gsap.to('.rail i', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#steps', start: 'top 60%', end: 'bottom 60%', scrub: true } });\n  else once('#steps', 60, () => gsap.to('.rail i', { scaleY: 1, duration: 1.3, ease: expo }));\n  await idle();");
setup = setup.replace("  const loops = [...document.querySelectorAll('[data-marquee]')].map(m => {", "  const loops = [];\n  for (const m of document.querySelectorAll('[data-marquee]')) {\n    await idle();");
setup = setup.replace("    return tw;\n  });\n  ScrollTrigger.create({", "    loops.push(tw);\n  }\n  if (desktop.matches) ScrollTrigger.create({");
setup = setup.replace("  if (matchMedia('(hover: hover)').matches) {", "  await idle();\n  if (desktop.matches && matchMedia('(hover: hover)').matches) {");
setup += `
  };
  const startMotion = () => setupMotion().catch(() => {
    root.classList.remove('motion');
    if (window.gsap) gsap.set('[data-reveal], .tile, .ev, [data-bar]', { clearProps: 'opacity,transform,filter' });
  });
  if (document.readyState === 'complete') startMotion();
  else addEventListener('load', startMotion, { once: true });`;
html = html.slice(0, start) + setup + html.slice(end);
// Libraries now load after load; the existing safety net must not disable motion first.
html = html.replace("addEventListener('load', () => { if (!window.gsap) document.documentElement.classList.remove('motion'); });", "// setupMotion handles CDN failures and restores visible static content.");
fs.writeFileSync('index.html', html);
