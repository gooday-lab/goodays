/* GoOdays — Newsletter automation (Phase 3)
   Modes: 'mailchimp' (real newsletter via embedded form action) | 'local' (fallback).
   Config: newsletter-config.js

   Dua jalur submit:
   - Halaman dengan script.js (index) → script.js mendelegasi ke
     window.goodaysNewsletterSubmit (mailchimp mode TIDAK di-preventDefault,
     jadi submit native ke Mailchimp tetap jalan).
   - Halaman lain (deals) → auto-bind di bawah. */
(function () {
  const config = window.GOODAYS_NEWSLETTER || { mode: 'local' };
  const isMailchimp = config.mode === 'mailchimp' && config.formAction;

  // setup form action + hidden fields + iframe (sekali di awal)
  if (isMailchimp) {
    document.querySelectorAll('#newsletterForm').forEach((form) => {
      form.setAttribute('method', 'POST');
      form.setAttribute('action', config.formAction);
      form.setAttribute('target', 'nlFrame');
      if (config.uParam && !form.querySelector('input[name="u"]')) {
        const u = document.createElement('input'); u.type = 'hidden'; u.name = 'u'; u.value = config.uParam; form.appendChild(u);
      }
      if (config.idParam && !form.querySelector('input[name="id"]')) {
        const id = document.createElement('input'); id.type = 'hidden'; id.name = 'id'; id.value = config.idParam; form.appendChild(id);
      }
      if (!document.getElementById('nlFrame')) {
        const iframe = document.createElement('iframe');
        iframe.id = 'nlFrame'; iframe.name = 'nlFrame';
        iframe.style.display = 'none'; iframe.title = 'newsletter';
        document.body.appendChild(iframe);
      }
    });
  }

  window.goodaysNewsletterSubmit = function (form, lang, event) {
    if (isMailchimp) {
      // biarkan submit native ke Mailchimp (iframe), lalu konfirmasi
      setTimeout(() => {
        form.reset();
        if (window.showToast) window.showToast('Terima kasih! Cek email untuk konfirmasi langganan.');
      }, 700);
      return;
    }
    if (event) event.preventDefault();
    const email = form.querySelector('input[type="email"]')?.value || '';
    try {
      const list = JSON.parse(localStorage.getItem('goodays_newsletter') || '[]');
      list.push({ email, at: new Date().toISOString() });
      localStorage.setItem('goodays_newsletter', JSON.stringify(list.slice(-500)));
    } catch { /* private mode */ }
    form.reset();
    console.warn('[GoOdays] Newsletter masih mode local — hubungkan Mailchimp di newsletter-config.js agar email benar-benar terkirim.');
    if (window.showToast) window.showToast('Terima kasih! Kamu masuk daftar The Good List.');
  };

  // auto-bind untuk halaman tanpa script.js (mis. deals.html)
  if (!window.goodaysScriptLoaded) {
    document.querySelectorAll('#newsletterForm').forEach((form) => {
      form.addEventListener('submit', (event) => window.goodaysNewsletterSubmit(form, 'id', event));
    });
  }
})();
