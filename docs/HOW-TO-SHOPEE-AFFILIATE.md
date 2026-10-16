# Cara Setup Link Afiliasi Shopee untuk GoOdays

Langkah lengkap dari nol sampai tombol "Cek Harga di Shopee" menghasilkan komisi.
Estimasi waktu: 30–45 menit untuk setup awal.

---

## Langkah 1 — Daftar Shopee Affiliate Program

1. Buka **https://affiliate.shopee.co.id**
2. Login dengan akun Shopee-mu (boleh akun yang sama dengan akun belanja)
3. Isi formulir pendaftaran:
   - **Platform/media**: pilih *Website* → isi `goodays.pages.dev`
   - **Media sosial**: tambahkan `instagram.com/oddychris` dan `tiktok.com/@thomasoddy`
   - **Konten**: jelaskan singkat — "Situs kurasi produk dengan review jujur
     (tech, gaming, home, coffee, gadgets) dalam Bahasa Indonesia & Inggris"
4. Tunggu approval (biasanya 1–3 hari kerja)

> Tips: akun TikTok/IG yang aktif memperbesar peluang approval. Sebutkan juga
> jumlah followers apa adanya.

## Langkah 2 — Generate link afiliasi

Di dashboard affiliate:
1. Menu **Link Generator** (atau "Produk" → cari produk → "Buat Link")
2. Tempel URL produk Shopee yang mau direkomendasikan
3. **SubID**: isi sesuai penempatan tombol (lihat tabel di bawah)
4. Klik **Generate** → salin hasilnya (biasanya `https://s.shopee.co.id/xxxxx`)

## Langkah 3 — Tempel link di situs

### Untuk Top Picks (homepage)
Buka **`tools/shopee-link-builder.html`** di browser → tempel link → pilih
penempatan → salin hasilnya ke **`picks.js`** pada field `shopeeUrl`.

Atau edit langsung `picks.js`:
```js
shopeeUrl: 'https://s.shopee.co.id/xxxxx',
```

### Untuk produk di halaman Review
Di dashboard Supabase → tabel `products` → isi kolom **`affiliate_url`**
dengan link afiliasinya. Tombol "Cek harga" akan otomatis muncul.

## Skema SubID (biar tahu tombol mana yang menghasilkan)

| Penempatan | SubID |
|---|---|
| Top Picks — Best Overall | `picks-best-overall` |
| Top Picks — Best Budget | `picks-best-budget` |
| Top Picks — Best Premium | `picks-best-premium` |
| Tombol detail di halaman review | `review-detail` |
| Kartu perbandingan (Top 3) | `compare-1` … `compare-3` |
| Sticky bar mobile | `sticky-detail` |
| Newsletter | `newsletter` |
| Bio Instagram | `social-ig` |
| Bio TikTok | `social-tt` |

Laporan performa ada di dashboard Shopee Affiliate → menu **Data/Report**,
dikelompokkan per SubID. Dari situ kelihatan penempatan mana yang paling
menghasilkan — lalu optimasi di situ.

## Jenis link & aturan teknis

- **Link panjang** (`shopee.co.id/...?af_clickid=...`) — bisa ditambah
  `sub_id1` otomatis oleh `picks.js` / link builder.
- **Link pendek** (`s.shopee.co.id/xxxxx`) — tidak bisa ditambah parameter,
  jadi pilih SubID **saat generate** di portal.
- Semua link keluar otomatis memakai `rel="nofollow sponsored noopener"`
  (sudah diatur oleh kode situs) — ini wajib untuk kepatuhan Google
  terhadap link berbayar.

## Kepatuhan & kepercayaan (jangan dilewati)

1. **Disclosure afiliasi harus terlihat** — sudah ada di homepage (FAQ +
   bagian "Detail Penting") dan di halaman review. Jangan dihapus.
2. **Jangan mengklaim hal palsu** — rating dan klaim di `picks.js` harus
   hasil risetmu sendiri.
3. **Harga berubah** — karenanya setiap halaman review punya catatan
   "harga & stok bisa berubah". Update `price_text` di Supabase secara berkala.
4. **Konsistensi** — kalau produk tidak layak, jangan dipasangi link hanya
   karena komisinya besar. Kepercayaan pembaca = aset jangka panjang.

## Checklist setelah link dipasang

- [ ] Klik setiap tombol → memang mengarah ke produk yang benar (tab baru)
- [ ] Link dari portal affiliate (ada `af_clickid` / shortlink Shopee)
- [ ] SubID sesuai penempatan
- [ ] Produk di `picks.js` diganti dari "Contoh: ..." menjadi produk asli
- [ ] Rating & harga di `picks.js` sesuai hasil riset
- [ ] Disclosure tetap terlihat

## Alur kerja rutin (mingguan, ±30 menit)

1. Cek harga produk di 3 Top Picks — update `price` di `picks.js` kalau berubah
2. Cek laporan SubID di dashboard Shopee — mana yang CTR-nya rendah?
3. Update 1 review / 1 artikel baru (SEO)
4. Share 1 pick ke IG/TikTok dengan link afiliasi (`social-ig` / `social-tt`)
