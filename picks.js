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
    name: 'Anker Soundcore Q20i — TWS ANC terbaik di bawah Rp500 rb',
    rating: null, // ← isi setelah risetmu (jangan karang angka)
    price: '±Rp450–550 rb (cek terbaru)',
    verdict: {
      id: 'Contoh kurasi: TWS dengan ANC yang benar-benar terasa di kelas harganya — paling seimbang untuk dipakai harian.',
      en: 'Curation example: TWS with genuinely effective ANC for the money — the most balanced pick for daily use.'
    },
    pros: {
      id: ['ANC terasa di kelasnya', 'Baterai ~40 jam', 'Banyak ulasan pembeli positif'],
      en: ['Effective ANC for the price', '~40h battery', 'Lots of positive buyer reviews']
    },
    shopeeUrl: 'https://s.shopee.co.id/2LZ7p1FHLm', // ← LINK AFILIASI TERPASANG (konfirmasi: ini produk best-overall?)
    reviewUrl: 'reviews.html'
  },
  {
    id: 'best-budget',
    badge: { id: 'Best Budget', en: 'Best Budget' },
    name: 'V60 Dripper Set + Grinder Manual Entry — ritual kopi di bawah Rp300 rb',
    rating: null, // ← isi setelah risetmu
    price: '±Rp150–300 rb (cek terbaru)',
    verdict: {
      id: 'Contoh kurasi: cara termurah naik level dari kopi sachet — hasilnya jauh lebih enak, alatnya tahan bertahun-tahun.',
      en: 'Curation example: the cheapest upgrade from instant coffee — far better taste, tools last for years.'
    },
    pros: {
      id: ['Harga paling bersahabat', 'Hasil jauh lebih baik dari kopi sachet', 'Tahan lama'],
      en: ['Friendliest price', 'Far better than instant coffee', 'Built to last']
    },
    shopeeUrl: 'https://s.shopee.co.id/70KxNcVPgg', // ← LINK AFILIASI TERPASANG (konfirmasi: ini produk best-budget?)
    reviewUrl: 'reviews.html'
  },
  {
    id: 'best-premium',
    badge: { id: 'Best Premium', en: 'Best Premium' },
    name: 'Monitor 27" 144Hz IPS — upgrade terbaik untuk kerja & gaming',
    rating: null, // ← isi setelah risetmu
    price: '±Rp2–3 jt (cek terbaru)',
    verdict: {
      id: 'Contoh kurasi: upgrade yang paling terasa setiap hari — sekali beli, dipakai 5–7 tahun.',
      en: 'Curation example: the upgrade you feel every single day — bought once, used 5–7 years.'
    },
    pros: {
      id: ['Upgrade paling terasa', 'Awet 5–7 tahun', 'Worth it jangka panjang'],
      en: ['Most noticeable upgrade', 'Lasts 5–7 years', 'Worth it long term']
    },
    shopeeUrl: 'https://s.shopee.co.id/7faeAuV2bT', // ← LINK AFILIASI TERPASANG (konfirmasi: ini produk best-premium?)
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
