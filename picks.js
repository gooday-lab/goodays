/* ============================================================
   GoOdays — Affiliate & Top Picks configuration
   ------------------------------------------------------------
   INI FILE YANG KAMU EDIT. Versi bahasa Indonesia dipertahankan
   agar mudah diedit. See docs/HOW-TO-SHOPEE-AFFILIATE.md

   CARA PAKAI SINGKAT:
   1. Daftar Shopee Affiliate: https://affiliate.shopee.co.id
   2. Generate link produk di menu "Link Generator" portal affiliate
   3. Tempel linknya di field `shopeeUrl` di bawah (jangan pakai link
      produk biasa — harus link dari portal affiliate supaya ketrack)
   4. Simpan file. Selesai.

   TIPS TRACKING:
   - Di portal Shopee, pakai SubID berbeda per penempatan, misalnya:
     homepage-picks / reviews-detail / sticky-bar / newsletter
   - Link yang sudah mengandung sub_id1 akan dipakai apa adanya.
   - Atau biarkan kosong, builder di bawah akan menambahkan
     sub_id1 otomatis sesuai penempatan tombol.
   ============================================================ */

window.GOODAYS_AFFILIATE = {
  // SubID default kalau link yang ditempel belum punya sub_id1
  defaultSubId: 'goodays-web',
  // Set true kalau ingin semua link dibuka di tab baru (disarankan)
  openInNewTab: true
};

/* ------------------------------------------------------------
   TOP PICKS — "Pilihan Terbaik Bulan Ini"
   ------------------------------------------------------------
   Isi 3 slot di bawah. Contoh yang ada hanya PLACEHOLDER —
   ganti dengan produk pilihanmu sendiri + link afiliasimu.
   Field:
     badge    : label kecil (mis. "Best Overall")
     name     : nama produk
     rating   : 1–5 (pakai angka jujur dari hasil risetmu)
     price    : perkiraan harga, mis. "Rp250–350 rb"
     verdict  : satu kalimat kenapa produk ini menang
     pros     : 2–3 poin singkat
     shopeeUrl: TEMPET LINK AFILIASI SHOPEE DI SINI
     reviewUrl: halaman review detail (opsional)
   ------------------------------------------------------------ */
window.GOODAYS_PICKS = [
  {
    id: 'best-overall',
    badge: { id: 'Best Overall', en: 'Best Overall' },
    name: 'Contoh: Produk Terbaik Secara Keseluruhan',
    rating: 4.8,
    price: 'Rp500–700 rb',
    verdict: {
      id: 'Produk yang paling seimbang — kualitas, fitur, dan harga dalam satu paket.',
      en: 'The most balanced pick — quality, features and price in one package.'
    },
    pros: {
      id: ['Kualitas terbaik di kelasnya', 'Tahan lama', 'Paling banyak direkomendasikan'],
      en: ['Best build quality in class', 'Built to last', 'Most recommended by buyers']
    },
    shopeeUrl: '', // ← TEMPET LINK AFILIASI SHOPEE DI SINI
    reviewUrl: 'reviews.html'
  },
  {
    id: 'best-budget',
    badge: { id: 'Best Budget', en: 'Best Budget' },
    name: 'Contoh: Produk Terbaik dengan Budget Minim',
    rating: 4.6,
    price: 'Rp100–250 rb',
    verdict: {
      id: 'Harga paling masuk akal tanpa mengorbankan hal-hal penting.',
      en: 'The smartest spend — saves money without cutting the essentials.'
    },
    pros: {
      id: ['Harga paling bersahabat', 'Fitur inti lengkap', 'Value terbaik'],
      en: ['Friendliest price', 'All essential features', 'Best value for money']
    },
    shopeeUrl: '', // ← TEMPET LINK AFILIASI SHOPEE DI SINI
    reviewUrl: 'reviews.html'
  },
  {
    id: 'best-premium',
    badge: { id: 'Best Premium', en: 'Best Premium' },
    name: 'Contoh: Produk Premium Terbaik',
    rating: 4.9,
    price: 'Rp1 jt+',
    verdict: {
      id: 'Kalau budget bukan masalah, ini yang terbaik — dan tahan paling lama.',
      en: 'If budget is no issue, this is the best — and it lasts the longest.'
    },
    pros: {
      id: ['Kualitas premium', 'Pengalaman pakai terbaik', 'Worth it jangka panjang'],
      en: ['Premium quality', 'Best user experience', 'Worth it long term']
    },
    shopeeUrl: '', // ← TEMPET LINK AFILIASI SHOPEE DI SINI
    reviewUrl: 'reviews.html'
  }
];

/* ============================================================
   DI BAWAH INI: HELPER — tidak perlu diubah
   ============================================================ */

/** Bangun URL afiliasi final: tambah sub_id1 (penempatan) bila belum ada. */
window.goodaysBuildAffiliateUrl = function buildAffiliateUrl(rawUrl, placement) {
  const url = (rawUrl || '').trim();
  if (!url || url === '#') return '';
  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has('sub_id1')) {
      const sub = placement || window.GOODAYS_AFFILIATE.defaultSubId;
      parsed.searchParams.set('sub_id1', sub);
    }
    return parsed.toString();
  } catch (error) {
    return url; // bukan URL absolut (mis. shortlink) — pakai apa adanya
  }
};

/** Tracking klik keluar ke Shopee (kompatibel GA4 / GTM bila dipasang). */
window.goodaysTrackAffiliateClick = function trackAffiliateClick(productName, placement) {
  try {
    const log = JSON.parse(localStorage.getItem('goodays_aff_clicks') || '[]');
    log.push({ product: productName, placement, at: new Date().toISOString() });
    localStorage.setItem('goodays_aff_clicks', JSON.stringify(log.slice(-200)));
  } catch (error) { /* localStorage bisa gagal di mode private */ }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'outbound_shopee_click', product: productName, placement });
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'outbound_shopee_click', { product: productName, placement });
  }
};
