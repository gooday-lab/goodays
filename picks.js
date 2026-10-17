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
    badge: { id: 'PILIHAN UTAMA', en: 'TOP PICK' },
    name: 'Osmo Pocket 3 — gimbal kamera saku 4K untuk vlog',
    rating: null, // ← isi setelah risetmu (jangan karang angka)
    price: '', // ← isi harga saat ini setelah cek di Shopee
    verdict: {
      id: 'Gimbal kamera saku dengan layar yang bisa diputar — banyak dipakai vlogger karena hasilnya stabil dan praktis dibawa.',
      en: 'A pocket gimbal camera with a rotating screen — popular with vloggers for its stabilization and portability.'
    },
    pros: {
      id: ['Layar 2 inci yang bisa diputar', 'Video 4K dengan stabilisasi gimbal', 'Ringkas — muat di saku'],
      en: ['2-inch rotating screen', '4K video with gimbal stabilization', 'Pocket-sized portability']
    },
    shopeeUrl: 'https://s.shopee.co.id/2LZ7p1FHLm',
    reviewUrl: 'reviews.html'
  },
  {
    id: 'best-budget',
    badge: { id: 'AKSESORIS SHOOTING', en: 'SHOOTING ADD-ON' },
    name: 'GOOJODOQ Kipas Tangan 2500 mAh untuk shooting outdoor',
    rating: null, // ← isi setelah risetmu
    price: '',
    verdict: {
      id: 'Aksesoris kecil yang berguna saat merekam di luar ruangan — bantu tetap nyaman di cuaca panas.',
      en: 'A small accessory that helps when recording outdoors — stay comfortable in hot weather.'
    },
    pros: {
      id: ['Baterai 2500 mAh', 'Mini dan portabel', 'Teman shooting outdoor'],
      en: ['2500 mAh battery', 'Mini and portable', 'Outdoor shooting companion']
    },
    shopeeUrl: 'https://s.shopee.co.id/70KxNcVPgg',
    reviewUrl: 'reviews.html'
  },
  {
    id: 'best-premium',
    badge: { id: 'TWS HEMAT', en: 'BUDGET TWS' },
    name: 'ACEFAST T8 — TWS mini dengan ENC',
    rating: null,
    price: '',
    verdict: {
      id: 'TWS ringan dengan mikrofon ENC untuk panggilan lebih jernih — pilihan hemat untuk pemakaian harian.',
      en: 'Lightweight TWS with ENC mics for clearer calls — a budget-friendly daily pick.'
    },
    pros: {
      id: ['True wireless bluetooth', 'ENC untuk panggilan jernih', 'Desain mini dan ringan'],
      en: ['True wireless bluetooth', 'ENC for clearer calls', 'Mini, lightweight design']
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
