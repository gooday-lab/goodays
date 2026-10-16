/* GoOdays — Phase 2 UI layer (works on build-rendered markup).
   Depends on window.translations from /js/i18n.js */
(function () {
  let currentLang = localStorage.getItem('goodays_lang') || 'id';
  const toastEl = document.querySelector('.toast');

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3400);
  }
  window.showToast = showToast;

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('goodays_lang', lang);
    document.documentElement.lang = lang;
    const t = window.translations ? window.translations[lang] : {};
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const value = t[el.dataset.i18n];
      if (value !== undefined) el.innerHTML = value;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const value = t[el.dataset.i18nPlaceholder];
      if (value !== undefined) el.placeholder = value;
    });
    document.querySelectorAll('.lang-switch').forEach((btn) => {
      btn.textContent = lang === 'id' ? 'EN' : 'ID';
      btn.setAttribute('aria-label', lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia');
    });
    if (typeof window.onLanguageChange === 'function') window.onLanguageChange(lang);
  }
  window.applyLanguage = applyLanguage;

  document.querySelectorAll('.lang-switch').forEach((btn) =>
    btn.addEventListener('click', () => applyLanguage(currentLang === 'id' ? 'en' : 'id')));

  // mobile menu
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => nav.classList.remove('open')));
  }

  // announcement rotator
  const rotator = document.querySelector('.announcement-rotator');
  if (rotator && window.translations) {
    let index = 0;
    setInterval(() => {
      index = (index + 1) % 3;
      rotator.classList.add('is-fading');
      setTimeout(() => {
        rotator.textContent = window.translations[currentLang][`rotator${index + 1}`] || rotator.textContent;
        rotator.classList.remove('is-fading');
      }, 350);
    }, 5200);
  }

  // scroll reveal
  const revealItems = document.querySelectorAll('.reveal');
  if (revealItems.length) {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
        });
      }, { threshold: 0.15 });
      revealItems.forEach((item) => observer.observe(item));
    } else {
      revealItems.forEach((item) => item.classList.add('is-visible'));
    }
  }

  // sticky CTA
  const bar = document.getElementById('stickyCta');
  if (bar) {
    let shown = false;
    const toggle = () => {
      const shouldShow = window.scrollY > 650;
      if (shouldShow === shown) return;
      shown = shouldShow;
      if (shown) { bar.hidden = false; bar.classList.add('is-visible'); }
      else { bar.hidden = true; bar.classList.remove('is-visible'); }
    };
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
  }

  // affiliate click tracking + missing-link feedback
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-aff], a.affiliate-link');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href === '#') {
      event.preventDefault();
      showToast(currentLang === 'id'
        ? 'Link afiliasi belum ditambahkan untuk produk ini.'
        : 'No affiliate link added for this product yet.');
      return;
    }
    const name = link.dataset.product || link.textContent.trim().slice(0, 40);
    try {
      const log = JSON.parse(localStorage.getItem('goodays_aff_clicks') || '[]');
      log.push({ product: name, placement: link.dataset.aff || 'organic', at: new Date().toISOString() });
      localStorage.setItem('goodays_aff_clicks', JSON.stringify(log.slice(-200)));
    } catch { /* private mode */ }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'outbound_shopee_click', product: name, placement: link.dataset.aff || 'organic' });
    if (typeof window.gtag === 'function') window.gtag('event', 'outbound_shopee_click', { product: name, placement: link.dataset.aff || 'organic' });
  });

  // newsletter (Phase 2: honest local capture until an email tool is connected)
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = newsletterForm.querySelector('input[type="email"]')?.value || '';
      try {
        const list = JSON.parse(localStorage.getItem('goodays_newsletter') || '[]');
        list.push({ email, at: new Date().toISOString() });
        localStorage.setItem('goodays_newsletter', JSON.stringify(list));
      } catch { /* private mode */ }
      newsletterForm.reset();
      showToast(currentLang === 'id'
        ? 'Terima kasih! Kamu akan masuk daftar The Good List.'
        : 'Thank you! You are on The Good List.');
    });
  }

  applyLanguage(currentLang);
})();
