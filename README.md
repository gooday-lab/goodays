# GoOdays — goodays.pages.dev

Situs kurasi produk dengan review jujur. Vanilla HTML/CSS/JS + Supabase,
deploy di Cloudflare Pages. Identitas visual: cream/orange editorial.

## Struktur

```
index.html                  Homepage (funnel: hero → trust → top picks → kategori
                            → cara kami memilih → jurnal → review → FAQ → newsletter)
reviews.html                Halaman review (perbandingan Top 3 + sticky CTA beli)
checklist-beli-bijak.html   Lead magnet (checklist 10 poin) untuk newsletter
styles.css                  Design system + conversion layer
reviews.css                 Style khusus halaman review
script.js                   i18n (ID/EN) + Supabase content + form + modal
upgrade.js                  Conversion layer: top picks, rotator, sticky CTA, tracking
picks.js                    ★ KONFIGURASI AFFILIASI + TOP PICKS (edit ini)
supabase-config.js          Kredensial Supabase (publishable key)
tools/shopee-link-builder.html  Tools internal: build link afiliasi + SubID
docs/HOW-TO-SHOPEE-AFFILIATE.md Panduan daftar & pasang link Shopee Affiliate
docs/SEED-PRODUCTS.md       Riset awal produk & ide konten SEO
robots.txt, sitemap.xml     SEO
assets/logo.png             Logo
```

## Setup cepat

1. **Pasang link afiliasi** → ikuti `docs/HOW-TO-SHOPEE-AFFILIATE.md`
2. **Isi Top Picks** → edit `picks.js` (ganti "Contoh: ..." dengan produk asli)
3. **Test** → buka `index.html`, klik tiap tombol "Cek harga di Shopee"
4. **Deploy** → Cloudflare Pages (folder ini langsung jadi artifact, tanpa build)

## Deploy (Cloudflare Pages)

- Build command: *(kosong)* — static site
- Output directory: `/` (root repo)
- Push ke `main` → otomatis deploy (kalau repo terhubung ke Cloudflare)

## Tracking

Semua tombol beli punya atribut `data-aff` (penempatan) dan `data-product`.
Klik dikirim ke `dataLayer` / `gtag` sebagai event `outbound_shopee_click`
(kompatibel GA4/GTM). Riwayat klik juga tersimpan lokal di
`localStorage.goodays_aff_clicks` untuk cek cepat.

SubID per penempatan (lihat tabel di `docs/HOW-TO-SHOPEE-AFFILIATE.md`)
membuat laporan Shopee Affiliate menunjukkan tombol mana yang paling
menghasilkan.

## Roadmap

- **Phase 1 (selesai)**: conversion upgrade homepage + review page,
  sistem afiliasi, lead magnet, FAQ schema, SEO (sitemap/OG/JSON-LD)
- **Phase 2**: migrasi ke Astro (SSG) untuk speed/SEO maksimal +
  review page per produk (`/reviews/[kategori]/[produk]/`) dengan
  schema `Product`/`Review`
- **Phase 3**: email automation untuk The Good List + halaman Deals
  yang diupdate mingguan
