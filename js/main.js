/* ============================================================
   MARKO UJC – SKUPNA JAVASCRIPT DATOTEKA
   ============================================================
   Tukaj ni potrebno ničesar spreminjati za osnovno vzdrževanje.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ── STICKY NAV ── */
  const nav = document.querySelector('.site-nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  /* ── MOBILNI MENI ── */
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileNav = document.querySelector('.nav-mobile');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── SCROLL REVEAL ── */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length > 0) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ── FORMSPREE PLACEHOLDER GUARD ── */
  document.querySelectorAll('form[action*="formspree.io"]').forEach(function (form) {
    form.addEventListener('submit', async function (event) {
      if (form.id === 'form-content') return;

      event.preventDefault();

      if (form.action.includes('TVOJ_FORMSPREE_ID')) {
        alert('Pred objavo zamenjaj TVOJ_FORMSPREE_ID s pravim Formspree ID-jem.');
        return;
      }

      const button = form.querySelector('button[type="submit"]');
      if (button) {
        button.disabled = true;
        button.textContent = 'Pošiljam...';
      }

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });

        if (!response.ok) throw new Error('Formspree error');
        form.reset();
        alert('Prijava je zabeležena.');
      } catch (error) {
        alert('Prijave trenutno ni bilo mogoče poslati. Poskusi znova kasneje.');
      } finally {
        if (button) {
          button.disabled = false;
          button.textContent = 'Prijava';
        }
      }
    });
  });

});
