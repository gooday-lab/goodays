/* ============================================================
   GoOdays — Newsletter configuration (Phase 3)
   ------------------------------------------------------------
   Pilih salah satu mode. Default: 'local' (email tersimpan lokal,
   TAPI ini BUKAN newsletter sungguhan — hanya placeholder jujur
   sampai kamu menghubungkan provider).

   REKOMENDASI: Mailchimp gratis (sampai 500 kontak) — paling mudah.

   Cara ambil form action Mailchimp:
   1. Daftar https://mailchimp.com (gratis)
   2. Audience → Signup forms → Embedded forms
   3. Copy URL di action form: "https://xxx.usX.list-manage.com/subscribe/post?u=...&id=..."
   4. Tempel di bawah sebagai `formAction`
   5. Copy nilai input hidden "u" dan "id" ke `uParam` / `idParam`

   Alternatif: Brevo (gratis 300 email/hari) juga punya embedded form
   dengan cara yang sama.

   Catatan keamanan: JANGAN taruh API key provider di file ini —
   file ini diakses publik. Pakai selalu embedded form / form action.
   ============================================================ */

window.GOODAYS_NEWSLETTER = {
  mode: 'local',        // 'mailchimp' | 'local'
  formAction: '',       // contoh: 'https://xxx.us1.list-manage.com/subscribe/post?u=abc&id=def'
  uParam: '',           // nilai hidden input "u" dari Mailchimp
  idParam: '',          // nilai hidden input "id" dari Mailchimp
  listName: 'The Good List'
};
