/**
 * Top Picks — server-rendered at build time (SEO-visible).
 * Same data contract as the Phase 1 picks.js; edit here for the Astro build.
 */
export interface Pick {
  id: string;
  badge: { id: string; en: string };
  name: string;
  rating: number | null;
  price: string;
  verdict: { id: string; en: string };
  pros: { id: string[]; en: string[] };
  shopeeUrl: string;
  reviewUrl: string;
}

export const AFFILIATE = {
  defaultSubId: 'goodays-web',
  buildUrl(rawUrl: string, placement: string): string {
    const url = (rawUrl || '').trim();
    if (!url) return '';
    try {
      const parsed = new URL(url);
      if (!parsed.searchParams.has('sub_id1')) parsed.searchParams.set('sub_id1', placement);
      return parsed.toString();
    } catch {
      return url;
    }
  }
};

export const PICKS: Pick[] = [
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
    shopeeUrl: '', // ← TEMPET LINK AFILIASI SHOPEE DI SINI
    reviewUrl: '/reviews/'
  },
  {
    id: 'best-budget',
    badge: { id: 'Best Budget', en: 'Best Budget' },
    name: 'V60 Dripper Set + Grinder Manual Entry — ritual kopi di bawah Rp300 rb',
    rating: null,
    price: '±Rp150–300 rb (cek terbaru)',
    verdict: {
      id: 'Contoh kurasi: cara termurah naik level dari kopi sachet — hasilnya jauh lebih enak, alatnya tahan bertahun-tahun.',
      en: 'Curation example: the cheapest upgrade from instant coffee — far better taste, tools last for years.'
    },
    pros: {
      id: ['Harga paling bersahabat', 'Hasil jauh lebih baik dari kopi sachet', 'Tahan lama'],
      en: ['Friendliest price', 'Far better than instant coffee', 'Built to last']
    },
    shopeeUrl: '',
    reviewUrl: '/reviews/'
  },
  {
    id: 'best-premium',
    badge: { id: 'Best Premium', en: 'Best Premium' },
    name: 'Monitor 27" 144Hz IPS — upgrade terbaik untuk kerja & gaming',
    rating: null,
    price: '±Rp2–3 jt (cek terbaru)',
    verdict: {
      id: 'Contoh kurasi: upgrade yang paling terasa setiap hari — sekali beli, dipakai 5–7 tahun.',
      en: 'Curation example: the upgrade you feel every single day — bought once, used 5–7 years.'
    },
    pros: {
      id: ['Upgrade paling terasa', 'Awet 5–7 tahun', 'Worth it jangka panjang'],
      en: ['Most noticeable upgrade', 'Lasts 5–7 years', 'Worth it long term']
    },
    shopeeUrl: '',
    reviewUrl: '/reviews/'
  }
];
