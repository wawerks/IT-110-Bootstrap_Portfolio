/**
 * Lenis smooth scroll + GSAP / ScrollTrigger + Vanta scroll interactivity
 */
(function () {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof Lenis === 'undefined') {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({
    duration: 1.2,
    easing: function (t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    },
    orientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.88,
    touchMultiplier: 1.12,
  });

  window.portfolioLenis = lenis;

  function lenisScrollTop() {
    if (typeof lenis.scroll === 'number') return lenis.scroll;
    if (typeof lenis.actualScroll === 'number') return lenis.actualScroll;
    return window.scrollY || document.documentElement.scrollTop;
  }

  ScrollTrigger.scrollerProxy(document.documentElement, {
    scrollTop: function (value) {
      if (arguments.length) {
        lenis.scrollTo(value, { immediate: true });
      }
      return lenisScrollTop();
    },
    getBoundingClientRect: function () {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    },
    pinType: document.documentElement.style.transform ? 'transform' : 'fixed',
  });

  var lastVelocity = 0;
  lenis.on('scroll', function (e) {
    ScrollTrigger.update();
    window.dispatchEvent(new Event('scroll'));
    if (e && typeof e.velocity === 'number') {
      lastVelocity = e.velocity;
    }
  });

  gsap.ticker.add(function (time) {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = anchor.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;
      var target = document.querySelector(href);
      if (!target) return;
      if (anchor.classList.contains('scroll-top')) return;
      e.preventDefault();
      var margin = parseInt(getComputedStyle(target).scrollMarginTop, 10) || 0;
      lenis.scrollTo(target, {
        offset: -(margin + 72),
        duration: 1.35,
      });
    });
  });

  function refreshScrollTriggers() {
    ScrollTrigger.refresh();
    if (window.portfolioHeroVanta && typeof window.portfolioHeroVanta.resize === 'function') {
      window.portfolioHeroVanta.resize();
    }
    if (window.portfolioTechstackVanta && typeof window.portfolioTechstackVanta.resize === 'function') {
      window.portfolioTechstackVanta.resize();
    }
  }

  window.addEventListener('load', function () {
    refreshScrollTriggers();
    setTimeout(refreshScrollTriggers, 400);
    setTimeout(refreshScrollTriggers, 1200);
  });

  if (typeof imagesLoaded !== 'undefined') {
    var iso = document.querySelector('.isotope-container');
    if (iso) {
      imagesLoaded(iso, refreshScrollTriggers);
    }
  }

  /* ---- Vanta: scroll-driven NET parameters + wheel/touch speed ---- */
  function tryVantaOptions(instance, patch) {
    if (!instance || typeof instance.setOptions !== 'function') return;
    try {
      instance.setOptions(patch);
    } catch (err) {
      /* older Vanta builds may omit setOptions */
    }
  }

  function vantaVelocityBoost() {
    return Math.min(1.28, 1 + Math.abs(lastVelocity) * 0.02);
  }

  var vantaHeroRaf = null;
  var vantaHeroProgress = 0;
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    end: 'bottom top',
    scrub: 1.1,
    onUpdate: function (self) {
      vantaHeroProgress = self.progress;
      if (vantaHeroRaf) return;
      vantaHeroRaf = requestAnimationFrame(function () {
        vantaHeroRaf = null;
        var p = vantaHeroProgress;
        var b = vantaVelocityBoost();
        tryVantaOptions(window.portfolioHeroVanta, {
          spacing: (12 + p * 12) * b,
          maxDistance: (16 + p * 16) * b,
          points: Math.round(9 + p * 5),
          scale: b,
          scaleMobile: b,
        });
      });
    },
  });

  var vantaTechRaf = null;
  var vantaTechProgress = 0;
  ScrollTrigger.create({
    trigger: '.about-techstack-band',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1.2,
    onUpdate: function (self) {
      vantaTechProgress = self.progress;
      if (vantaTechRaf) return;
      vantaTechRaf = requestAnimationFrame(function () {
        vantaTechRaf = null;
        var p = vantaTechProgress;
        var b = vantaVelocityBoost();
        tryVantaOptions(window.portfolioTechstackVanta, {
          spacing: (12 + p * 14) * b,
          maxDistance: (17 + p * 15) * b,
          scale: 0.96 + (b - 1) * 0.9,
          scaleMobile: 0.96 + (b - 1) * 0.9,
        });
      });
    },
  });

  /* ---- Hero ---- */
  var heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTl
    .from('#hero .container h2', { y: 56, opacity: 0, duration: 1 }, 0)
    .from('#hero .container p', { y: 32, opacity: 0, duration: 0.9 }, 0.32)
    .from('#hero .vanta-bg', { scale: 1.12, opacity: 0, duration: 1.25, ease: 'power2.out' }, 0);

  gsap.to('#hero .vanta-bg', {
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.25,
    },
    y: '22%',
    scale: 1.06,
    ease: 'none',
    transformOrigin: '50% 50%',
  });

  /* ---- Tech stack NET layer (parallax on canvas, content stays sharp) ---- */
  gsap.to('#techstack-vanta canvas', {
    scrollTrigger: {
      trigger: '.about-techstack-band',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.15,
    },
    yPercent: -9,
    scale: 1.1,
    ease: 'none',
    transformOrigin: '50% 45%',
  });

  /* ---- Section titles: replay when entering / leaving ---- */
  gsap.utils.toArray('.section-title').forEach(function (el) {
    gsap.from(el.children.length ? Array.from(el.children) : el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none reverse',
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: 'power2.out',
    });
  });

  /* ---- Tech stack copy + icon rows ---- */
  var techContent = document.querySelector('.techstack-content');
  if (techContent) {
    var techParts = techContent.querySelectorAll('h3, p, h5, .d-flex');
    gsap.from(techParts, {
      scrollTrigger: {
        trigger: '#techstack-vanta',
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
      y: 32,
      opacity: 0,
      duration: 0.65,
      stagger: 0.06,
      ease: 'power2.out',
    });
  }

  var skillsBlock = document.querySelector('.skills-animation');
  if (skillsBlock) {
    gsap.from(skillsBlock.querySelectorAll('.progress'), {
      scrollTrigger: {
        trigger: skillsBlock,
        start: 'top 82%',
        toggleActions: 'play none none reverse',
      },
      x: -28,
      opacity: 0,
      duration: 0.55,
      stagger: 0.07,
      ease: 'power2.out',
    });
  }

  var isoContainer = document.querySelector('.isotope-container');
  if (isoContainer) {
    gsap.from(isoContainer.querySelectorAll('.portfolio-item'), {
      scrollTrigger: {
        trigger: isoContainer,
        start: 'top 88%',
        toggleActions: 'play none none reverse',
      },
      y: 48,
      opacity: 0,
      duration: 0.65,
      stagger: { each: 0.05, from: 'start' },
      ease: 'power2.out',
    });
  }

  var aboutMain = document.querySelector('#about > .container:not(.section-title)');
  if (aboutMain) {
    gsap.from(aboutMain, {
      scrollTrigger: {
        trigger: aboutMain,
        start: 'top 88%',
        toggleActions: 'play none none reverse',
      },
      y: 44,
      opacity: 0,
      duration: 0.85,
      ease: 'power2.out',
    });
  }

  gsap.utils.toArray('#resume .row > .col-lg-6').forEach(function (col, i) {
    gsap.from(col, {
      scrollTrigger: {
        trigger: col,
        start: 'top 88%',
        toggleActions: 'play none none reverse',
      },
      x: i % 2 === 0 ? -36 : 36,
      opacity: 0,
      duration: 0.75,
      ease: 'power2.out',
    });
  });
})();
