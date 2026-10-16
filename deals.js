/* ============================================================
   GoOdays — Deals configuration (Phase 3)
   ------------------------------------------------------------
   ISI FILE INI dengan deal/murah yang sedang berjalan.
   Setiap deal butuh: judul, kategori, harga coret + harga baru,
   tanggal berakhir (untuk countdown), dan link afiliasi Shopee.

   Catatan jujur: hanya masukkan deal yang BENAR-BENAR lebih murah
   dari harga normal. Countdown memakai `validUntil` — kalau lewat,
   deal otomatis disembunyikan. Jangan perpanjang diskon palsu.
   ============================================================ */

window.GOODAYS_DEALS = [
  {
    id: 'deal-1',
    title: 'Contoh: TWS ANC Diskon Payday',
    category: 'gadgets',
    oldPrice: 'Rp599.000',
    newPrice: 'Rp449.000',
    validUntil: '2026-12-31', // format YYYY-MM-DD — deal disembunyikan setelah tanggal ini
    verdict: {
      id: 'Harga terbaik 30 hari terakhir — cocok kalau sudah nunggu lama.',
      en: 'Best price in the last 30 days — good pick if you have been waiting.'
    },
    shopeeUrl: '' // ← TEMPET LINK AFILIASI SHOPEE DI SINI
  },
  {
    id: 'deal-2',
    title: 'Contoh: Grinder Kopi Manual Bundle',
    category: 'coffee',
    oldPrice: 'Rp329.000',
    newPrice: 'Rp249.000',
    validUntil: '2026-12-31',
    verdict: {
      id: 'Bundle yang benar-benar berguna — bukan bundling barang nganggur.',
      en: 'A bundle that is actually useful — not filler items.'
    },
    shopeeUrl: ''
  },
  {
    id: 'deal-3',
    title: 'Contoh: Monitor 27" 144Hz Flash Sale',
    category: 'tech',
    oldPrice: 'Rp2.799.000',
    newPrice: 'Rp2.299.000',
    validUntil: '2026-12-31',
    verdict: {
      id: 'Turun Rp500 rb dari harga normal — worth it kalau memang butuh monitor.',
      en: 'Rp500k below normal price — worth it if you actually need a monitor.'
    },
    shopeeUrl: ''
  }
];

/* ============================================================
   HELPER — tidak perlu diubah
   ============================================================ */
(function dealsEngine() {
  const t = {
    id: {
      eyebrow: 'UPDATE MINGGUAN',
      title: 'Deal yang benar-benar<br><em>lebih murah.</em>',
      intro: 'Bukan semua yang diskon itu deal. Di sini hanya harga yang memang lebih baik dari biasanya — dicek sebelum ditampilkan.',
      endsIn: 'Berakhir',
      days: 'hari',
      today: 'Hari ini',
      expired: 'Berakhir',
      was: 'Harga normal',
      now: 'Harga sekarang',
      checkPrice: 'Cek harga di Shopee <span>↗</span>',
      empty: 'Belum ada deal aktif minggu ini. Cek lagi besok — atau lihat Top Picks kami.',
      picksLink: 'Lihat Top Picks <span>→</span>',
      note: 'Harga & stok bisa berubah kapan saja. Deal yang sudah berakhir otomatis disembunyikan. Pembelian lewat link di atas membantu GoOdays — tanpa biaya tambahan untukmu.',
      howTitle: 'Cara kami memilih deal',
      how1: 'Harga dicek terhadap harga normal 30 hari terakhir',
      how2: 'Produknya tetap harus layak — diskon besar tidak menyelamatkan produk jelek',
      how3: 'Tanggal berakhir jelas — kalau tidak ada, kami tidak tampilkan'
    },
    en: {
      eyebrow: 'WEEKLY UPDATE',
      title: 'Deals that are truly<br><em>cheaper.</em>',
      intro: 'Not every discount is a deal. Only prices that are genuinely better than usual make it here — checked before listed.',
      endsIn: 'Ends in',
      days: 'days',
      today: 'Today',
      expired: 'Ended',
      was: 'Regular price',
      now: 'Price now',
      checkPrice: 'Check price on Shopee <span>↗</span>',
      empty: 'No active deals this week. Check back tomorrow — or see our Top Picks.',
      picksLink: 'See Top Picks <span>→</span>',
      note: 'Prices & stock can change anytime. Ended deals are hidden automatically. Purchases through the links above keep GoOdays running — at no extra cost to you.',
      howTitle: 'How we pick deals',
      how1: 'Price checked against the regular price of the last 30 days',
      how2: 'The product still has to be worth it — a big discount does not save a bad product',
      how3: 'Clear end date — if there is none, we do not list it'
    }
  };

  function daysLeft(dateString) {
    const end = new Date(dateString + 'T23:59:59');
    const diff = Math.ceil((end - new Date()) / 86400000);
    return diff;
  }

  function buildUrl(raw) {
    if (window.goodaysBuildAffiliateUrl) return window.goodaysBuildAffiliateUrl(raw, 'deals-page');
    return raw || '';
  }

  function renderDeals(lang) {
    const grid = document.getElementById('dealGrid');
    if (!grid) return;
    const copy = t[lang] || t.id;
    const deals = (window.GOODAYS_DEALS || []).filter((deal) => daysLeft(deal.validUntil) > 0);
    if (!deals.length) {
      grid.innerHTML = `<div class="home-reviews-empty">${copy.empty} <a class="text-link" href="/#picks">${copy.picksLink}</a></div>`;
      return;
    }
    grid.innerHTML = deals.map((deal, index) => {
      const left = daysLeft(deal.validUntil);
      const url = buildUrl(deal.shopeeUrl);
      const verdict = (deal.verdict && (deal.verdict[lang] || deal.verdict.en)) || '';
      const chip = left <= 1 ? copy.today : `${copy.endsIn} ${left} ${copy.days}`;
      return `<article class="deal-card ${index === 0 ? 'is-featured' : ''}">
        <span class="deal-chip ${left <= 2 ? 'is-urgent' : ''}">⏳ ${chip}</span>
        <span class="deal-cat">${deal.category || ''}</span>
        <h3 class="deal-title">${deal.title}</h3>
        <div class="deal-prices"><span class="deal-old">${copy.was}: <s>${deal.oldPrice || ''}</s></span><strong class="deal-new">${deal.newPrice || ''}</strong></div>
        <p class="deal-verdict">${verdict}</p>
        <a class="button button-shopee affiliate-link" data-aff="deal-${deal.id}" data-product="${deal.title}"${url ? ` href="${url}" target="_blank" rel="nofollow sponsored noopener"` : ' href="#"'}>${copy.checkPrice}</a>
      </article>`;
    }).join('');
  }

  window.renderDeals = renderDeals;

  function initDeals() {
    const lang = (localStorage.getItem('goodays_lang') || 'id');
    // copy for static blocks
    document.querySelectorAll('[data-deals-copy]').forEach((el) => {
      const value = (t[lang] || t.id)[el.dataset.dealsCopy];
      if (value !== undefined) el.innerHTML = value;
    });
    renderDeals(lang);
    // re-render on language switch
    document.querySelectorAll('.lang-switch').forEach((btn) => btn.addEventListener('click', () => {
      setTimeout(() => {
        const nextLang = localStorage.getItem('goodays_lang') || 'id';
        document.querySelectorAll('[data-deals-copy]').forEach((el) => {
          const value = (t[nextLang] || t.id)[el.dataset.dealsCopy];
          if (value !== undefined) el.innerHTML = value;
        });
        renderDeals(nextLang);
      }, 30);
    }));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initDeals);
  else initDeals();
})();
