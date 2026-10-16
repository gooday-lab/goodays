/* GoOdays — UI lite (untuk halaman tanpa script.js utama: deals, checklist)
   Menyediakan: menu mobile, sticky CTA, scroll reveal, toast,
   tracking klik afiliasi. */
(function () {
  function showToast(message) {
    const toast = document.querySelector('.toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => toast.classList.remove('show'), 3400);
  }
  window.showToast = showToast;

  // menu
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => nav.classList.remove('open')));
  }

  // reveal
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
      const shouldShow = window.scrollY > 550;
      if (shouldShow === shown) return;
      shown = shouldShow;
      if (shown) { bar.hidden = false; bar.classList.add('is-visible'); }
      else { bar.hidden = true; bar.classList.remove('is-visible'); }
    };
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
  }

  // affiliate tracking + missing-link feedback
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-aff], a.affiliate-link');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href === '#') {
      event.preventDefault();
      showToast('Link afiliasi belum ditambahkan untuk produk ini.');
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
})();
