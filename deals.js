/* ============================================================
   GoOdays — Deals configuration (Phase 3.1)
   ------------------------------------------------------------
   ISI FILE INI dengan deal yang sedang berjalan.

   ATURAN HARGA (penting — jangan dilewati):
   - Harga HANYA ditampilkan kalau kamu isi sendiri dan benar-benar
     terverifikasi (cek di halaman produk Shopee saat ini).
   - `oldPrice` (harga coret) WAJIB benar-benar harga normal sebelum
     diskon. Kalau tidak yakin, KOSONGKAN — kartu tetap tampil tanpa
     harga coret.
   - Cara paling akurat & otomatis: pakai WIDGET resmi Shopee.
     Di portal affiliate → menu "Alat/Tools" → pilih produk →
     "Widget Produk" / "Product Widget" → copy kode embed →
     tempel di field `widgetEmbed`. Harga & gambar akan update
     otomatis dari Shopee, dan tetap terhitung komisi afiliasimu.

   FIELD:
     title      : nama produk yang ditampilkan
     category   : label kecil (tech / gadgets / coffee / home / gaming)
     priceText  : harga saat ini, mis. "Rp449.000" (opsional)
     oldPrice   : harga normal sebelum diskon (opsional — hanya jika yakin)
     validUntil : "YYYY-MM-DD" — deal hilang otomatis setelah tanggal ini
     verdict    : 1 kalimat kenapa ini layak (tanpa klaim berlebihan)
     shopeeUrl  : LINK AFILIASI (wajib — deal tanpa link tidak ditampilkan)
     widgetEmbed: kode embed widget resmi Shopee (opsional, pengganti harga manual)

   MENAMBAH PRODUK BARU:
   Copy salah satu blok { ... }, ubah isinya, simpan. Selesai —
   kartu otomatis muncul di halaman Deals.
   ============================================================ */

window.GOODAYS_DEALS = [
  {
    id: 'deal-1',
    title: 'Lampu Perangkap Nyamuk Elektrik LED UV',
    category: 'home',
    priceText: '',      // ← isi harga saat ini (cek di Shopee dulu)
    oldPrice: '',       // ← isi HANYA jika harga coret benar-benar akurat
    validUntil: '2026-12-31',
    verdict: {
      id: 'Cara mengurangi nyamuk di kamar tanpa semprotan — cek rating dan ulasan pembeli di Shopee sebelum membeli.',
      en: 'A chemical-free way to reduce mosquitoes indoors — check buyer ratings on Shopee before buying.'
    },
    shopeeUrl: 'https://s.shopee.co.id/1LgadKegDJ', // ← LINK AFILIASI TERPASANG (konfirmasi produk)
    widgetEmbed: '' // ← opsional: tempel kode widget resmi Shopee di sini untuk harga live
  },
  {
    id: 'deal-2',
    title: 'KiTBEEZ K-POCKET — Action Camera Saku 4K',
    category: 'gadgets',
    priceText: '',
    oldPrice: '',
    validUntil: '2026-12-31',
    verdict: {
      id: 'Action camera saku dengan pelacakan wajah AI dan filter bawaan — harga ramah untuk pemula konten.',
      en: 'A pocket action camera with AI face tracking and built-in filters — budget-friendly for new creators.'
    },
    shopeeUrl: 'https://s.shopee.co.id/2gByDnzfQC', // ← LINK AFILIASI TERPASANG (konfirmasi produk)
    widgetEmbed: ''
  },
  {
    id: 'deal-3',
    title: 'Slot deal berikutnya — menunggu link afiliasi',
    category: 'tech',
    priceText: '',
    oldPrice: '',
    validUntil: '2026-12-31',
    verdict: {
      id: 'Pilihan ketiga minggu ini — link afiliasi menyusul.',
      en: 'Third pick this week — affiliate link coming soon.'
    },
    shopeeUrl: '', // ← belum ada link — kartu ini otomatis disembunyikan sampai diisi
    widgetEmbed: ''
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
      was: 'Harga normal',
      checkPrice: 'Cek harga di Shopee <span>↗</span>',
      empty: 'Belum ada deal aktif minggu ini. Cek lagi besok — atau lihat Top Picks kami.',
      picksLink: 'Lihat Top Picks <span>→</span>',
      note: 'Harga & stok bisa berubah kapan saja. Setiap pembelian lewat link di atas membantu GoOdays — tanpa biaya tambahan untukmu.',
      howTitle: 'Cara kami memilih deal',
      how1: 'Harga dicek terhadap harga normal sebelumnya',
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
      was: 'Regular price',
      checkPrice: 'Check price on Shopee <span>↗</span>',
      empty: 'No active deals this week. Check back tomorrow — or see our Top Picks.',
      picksLink: 'See Top Picks <span>→</span>',
      note: 'Prices & stock can change anytime. Purchases through the links above keep GoOdays running — at no extra cost to you.',
      howTitle: 'How we pick deals',
      how1: 'Price checked against the previous regular price',
      how2: 'The product still has to be worth it — a big discount does not save a bad product',
      how3: 'Clear end date — if there is none, we do not list it'
    }
  };

  function daysLeft(dateString) {
    if (!dateString) return 999;
    const end = new Date(dateString + 'T23:59:59');
    return Math.ceil((end - new Date()) / 86400000);
  }

  function buildUrl(raw) {
    if (window.goodaysBuildAffiliateUrl) return window.goodaysBuildAffiliateUrl(raw, 'deals-page');
    return raw || '';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[c]));
  }

  /** Widget resmi Shopee kadang memakai <script> — innerHTML tidak
      mengeksekusinya, jadi script dibuat ulang secara manual. */
  function activateScripts(container) {
    container.querySelectorAll('script').forEach((old) => {
      const s = document.createElement('script');
      Array.from(old.attributes).forEach((attr) => s.setAttribute(attr.name, attr.value));
      s.textContent = old.textContent;
      old.parentNode.replaceChild(s, old);
    });
  }

  function renderDeals(lang) {
    const grid = document.getElementById('dealGrid');
    if (!grid) return;
    const copy = t[lang] || t.id;
    const deals = (window.GOODAYS_DEALS || [])
      .filter((deal) => deal.shopeeUrl || deal.widgetEmbed)      // tanpa link = tidak ditampilkan
      .filter((deal) => daysLeft(deal.validUntil) > 0);           // kadaluarsa = disembunyikan

    if (!deals.length) {
      grid.innerHTML = `<div class="home-reviews-empty">${copy.empty} <a class="text-link" href="/#picks">${copy.picksLink}</a></div>`;
      return;
    }

    grid.innerHTML = deals.map((deal) => {
      const left = daysLeft(deal.validUntil);
      const url = buildUrl(deal.shopeeUrl);
      const verdict = (deal.verdict && (deal.verdict[lang] || deal.verdict.en)) || '';
      const chip = left <= 1 ? copy.today : `${copy.endsIn} ${left} ${copy.days}`;
      const priceRow = deal.oldPrice
        ? `<div class="deal-prices"><span class="deal-old">${copy.was}: <s>${escapeHtml(deal.oldPrice)}</s></span>${deal.priceText ? `<strong class="deal-new">${escapeHtml(deal.priceText)}</strong>` : ''}</div>`
        : (deal.priceText ? `<div class="deal-prices"><strong class="deal-new">${escapeHtml(deal.priceText)}</strong></div>` : '');
      const widget = deal.widgetEmbed
        ? `<div class="deal-widget">${deal.widgetEmbed}</div>`
        : `<a class="button button-shopee affiliate-link" data-aff="deal-${escapeHtml(deal.id)}" data-product="${escapeHtml(deal.title)}"${url ? ` href="${escapeHtml(url)}" target="_blank" rel="nofollow sponsored noopener"` : ' href="#"'}>${copy.checkPrice}</a>`;
      return `<article class="deal-card">
        <span class="deal-chip ${left <= 2 ? 'is-urgent' : ''}">⏳ ${chip}</span>
        <span class="deal-cat">${escapeHtml(deal.category || '')}</span>
        <h3 class="deal-title">${escapeHtml(deal.title)}</h3>
        ${priceRow}
        <p class="deal-verdict">${escapeHtml(verdict)}</p>
        ${widget}
      </article>`;
    }).join('');

    activateScripts(grid);
  }

  window.renderDeals = renderDeals;

  function applyCopy(lang) {
    document.querySelectorAll('[data-deals-copy]').forEach((el) => {
      const value = (t[lang] || t.id)[el.dataset.dealsCopy];
      if (value !== undefined) el.innerHTML = value;
    });
  }

  function initDeals() {
    const lang = localStorage.getItem('goodays_lang') || 'id';
    applyCopy(lang);
    renderDeals(lang);
    document.querySelectorAll('.lang-switch').forEach((btn) => btn.addEventListener('click', () => {
      setTimeout(() => {
        const nextLang = localStorage.getItem('goodays_lang') || 'id';
        applyCopy(nextLang);
        renderDeals(nextLang);
      }, 30);
    }));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initDeals);
  else initDeals();
})();
