/**
 * Lenis smooth scroll + GSAP / ScrollTrigger
 */
(function () {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof Lenis === 'undefined') {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({
    duration: 1.15,
    easing: function (t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    },
    orientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.85,
    touchMultiplier: 1.1,
  });

  window.portfolioLenis = lenis;

  lenis.on('scroll', ScrollTrigger.update);

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
        duration: 1.25,
      });
    });
  });

  function refreshScrollTriggers() {
    ScrollTrigger.refresh();
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

  var heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTl
    .from('#hero .container h2', { y: 56, opacity: 0, duration: 1 }, 0)
    .from('#hero .container p', { y: 32, opacity: 0, duration: 0.9 }, 0.32)
    .from('#hero > img', { scale: 1.1, opacity: 0, duration: 1.25, ease: 'power2.out' }, 0);

  gsap.to('#hero > img', {
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.2,
    },
    y: '18%',
    ease: 'none',
  });

  gsap.utils.toArray('.section-title').forEach(function (el) {
    gsap.from(el.children.length ? Array.from(el.children) : el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
      y: 36,
      opacity: 0,
      duration: 0.75,
      stagger: 0.1,
      ease: 'power2.out',
    });
  });

  var skillsBlock = document.querySelector('.skills-animation');
  if (skillsBlock) {
    gsap.from(skillsBlock.querySelectorAll('.progress'), {
      scrollTrigger: {
        trigger: skillsBlock,
        start: 'top 82%',
        toggleActions: 'play none none none',
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
        toggleActions: 'play none none none',
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
        toggleActions: 'play none none none',
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
        toggleActions: 'play none none none',
      },
      x: i % 2 === 0 ? -36 : 36,
      opacity: 0,
      duration: 0.75,
      ease: 'power2.out',
    });
  });

  var pf = document.querySelector('.portfolio-filters');
  if (pf) {
    gsap.from(pf.children, {
      scrollTrigger: {
        trigger: pf,
        start: 'top 92%',
        toggleActions: 'play none none none',
      },
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.06,
      ease: 'power2.out',
    });
  }
})();
