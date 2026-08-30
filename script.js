/* =========================================================
   SenTree — script.js
   Vanilla JS only. No dependencies.
   ========================================================= */
// Runs immediately (script is placed at end of body, so the DOM is already
// parsed). Only once we know JS is actually executing do we let CSS hide
// .reveal elements pending animation — see the .js-ready rules in style.css.
// If this file fails to load at all, text stays visible with no animation.
document.documentElement.classList.add('js-ready');

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky navbar + scroll progress ---------- */
  const navbar = document.getElementById('navbar');
  const progressBar = document.getElementById('scrollProgress');
  const backToTop = document.getElementById('backToTop');

  function onScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (progressBar) progressBar.style.width = pct + '%';
    if (navbar) navbar.classList.toggle('is-scrolled', scrollTop > 8);
    if (backToTop) backToTop.classList.toggle('is-visible', scrollTop > 480);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Scroll reveal animations ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback: no IntersectionObserver support
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Accordions (FAQ + Privacy Policy) ---------- */
  // Scoped per .accordion container so opening an item in one accordion
  // (e.g. Privacy Policy) doesn't collapse an open item in another (e.g. FAQ).
  document.querySelectorAll('.accordion').forEach((accordion) => {
    const accordionItems = accordion.querySelectorAll('.accordion__item');

    accordionItems.forEach((item) => {
      const trigger = item.querySelector('.accordion__trigger');
      const panel = item.querySelector('.accordion__panel');
      if (!trigger || !panel) return;

      panel.style.maxHeight = '0px';

      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        // Close all other items within this same accordion (single-open)
        accordionItems.forEach((other) => {
          if (other !== item) {
            other.classList.remove('is-open');
            other.querySelector('.accordion__trigger').setAttribute('aria-expanded', 'false');
            other.querySelector('.accordion__panel').style.maxHeight = '0px';
          }
        });

        if (isOpen) {
          item.classList.remove('is-open');
          trigger.setAttribute('aria-expanded', 'false');
          panel.style.maxHeight = '0px';
        } else {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
          panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      });
    });
  });

  /* ---------- Contact form ---------- */
  // Static site (GitHub Pages), so submissions are sent via Formspree —
  // a free form-backend service that forwards each submission straight
  // to your Gmail inbox. No server code required.
  //
  // SETUP REQUIRED (do this once):
  // 1. Create a free form at https://formspree.io
  // 2. Enter your Gmail address as the destination and verify it
  //    (Formspree emails you a confirmation link — click it)
  // 3. Copy the Form ID Formspree gives you (looks like "mzbqwepr")
  // 4. Paste it into FORMSPREE_FORM_ID below, replacing the placeholder
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xppawyyl';

  const contactForm = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!formNote) return;

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
      formNote.style.color = '';
      formNote.textContent = '';

      try {
        const response = await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(contactForm)
        });

        if (response.ok) {
          formNote.style.color = 'var(--verify)';
          formNote.textContent = "Thanks — your message has been sent. We'll get back to you shortly.";
          contactForm.reset();
        } else {
          const data = await response.json().catch(() => null);
          formNote.style.color = '#C0392B';
          formNote.textContent = (data && data.errors)
            ? data.errors.map((err) => err.message).join(', ')
            : 'Something went wrong sending your message. Please try again or email us directly.';
        }
      } catch (err) {
        formNote.style.color = '#C0392B';
        formNote.textContent = 'Network error — please check your connection and try again.';
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalBtnText; }
      }
    });
  }

  /* ---------- Smooth scroll for in-page anchors (nav offset aware) ---------- */
  const navHeight = document.querySelector('.navbar')?.offsetHeight || 72;

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - (navHeight - 4);
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

});
