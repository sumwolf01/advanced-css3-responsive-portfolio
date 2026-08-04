/* ==========================================================================
   REID KESSLER PORTFOLIO — script.js
   Vanilla JS only. No dependencies.
   ========================================================================== */

(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     1. THEME TOGGLE (light / dark, persisted via localStorage)
     --------------------------------------------------------------------- */
  const THEME_KEY = 'portfolio-theme';
  const body = document.body;
  const themeToggle = document.getElementById('theme-toggle');

  function applyTheme(theme) {
    body.setAttribute('data-theme', theme);
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    }
  }

  function getPreferredTheme() {
    const stored = safeGetItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function safeGetItem(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (err) {
      return null;
    }
  }

  function safeSetItem(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (err) {
      /* localStorage unavailable (private browsing, disabled, etc.) — theme just won't persist */
    }
  }

  applyTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const current = body.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      safeSetItem(THEME_KEY, next);
    });
  }

  /* ---------------------------------------------------------------------
     2. MOBILE NAVIGATION
     --------------------------------------------------------------------- */
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');

  function closeMenu() {
    if (!navLinks || !menuToggle) return;
    navLinks.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------------------------------------------------------------------
     3. SMOOTH SCROLLING (in-page anchors, accounting for sticky header)
     --------------------------------------------------------------------- */
  const header = document.querySelector('.site-header');

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const headerHeight = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
      window.scrollTo({ top: top, behavior: 'smooth' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  /* ---------------------------------------------------------------------
     4. ACTIVE NAVIGATION HIGHLIGHTING (scroll-spy via IntersectionObserver)
     --------------------------------------------------------------------- */
  const sections = document.querySelectorAll('main section[id]');
  const navLinkEls = document.querySelectorAll('.nav-link');

  if ('IntersectionObserver' in window && sections.length) {
    const spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinkEls.forEach(function (link) {
              link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
            });
          }
        });
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach(function (section) {
      spyObserver.observe(section);
    });
  }

  /* ---------------------------------------------------------------------
     5. SCROLL REVEAL ANIMATIONS
     --------------------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealEls.length) {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ---------------------------------------------------------------------
     6. SCROLL PROGRESS RULER (decorative — mirrors the drafting theme)
     --------------------------------------------------------------------- */
  const scrollRuler = document.getElementById('scroll-ruler');

  function updateScrollRuler() {
    if (!scrollRuler) return;
    const doc = document.documentElement;
    const scrollTop = window.scrollY;
    const scrollHeight = doc.scrollHeight - doc.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    scrollRuler.style.width = progress + '%';
  }

  window.addEventListener('scroll', updateScrollRuler, { passive: true });
  updateScrollRuler();

  /* ---------------------------------------------------------------------
     7. CONTACT FORM (client-side validation + friendly status message)
     No backend is wired up — this simulates a submit so the form is
     fully functional to try, and easy to connect to a real endpoint later.
     --------------------------------------------------------------------- */
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = contactForm.querySelector('#name');
      const email = contactForm.querySelector('#email');
      const subject = contactForm.querySelector('#subject');
      const message = contactForm.querySelector('#message');

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!name.value.trim() || !subject.value.trim() || !message.value.trim()) {
        formStatus.textContent = 'Please fill in every field before sending.';
        return;
      }

      if (!emailPattern.test(email.value.trim())) {
        formStatus.textContent = 'That email address doesn\u2019t look right — please check it.';
        email.focus();
        return;
      }

      formStatus.textContent = 'Message sent. Thanks for reaching out — I\u2019ll reply within two business days.';
      contactForm.reset();
    });
  }
})();
