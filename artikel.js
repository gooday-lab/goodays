/* GoOdays — Artikel helper (Phase 4)
   Membuat tombol CTA "Cek Harga di Shopee" dari picks.js/deals.js,
   supaya link afiliasi selalu konsisten dan tetap ter-track.

   Pakai di artikel:
   <div class="cta-box" data-pick="best-overall" data-label="Cek harga Soundcore Q20i"></div>
   <div class="cta-box" data-deal="deal-1" data-label="Cek harga promo"></div>
*/
(function () {
  function resolveUrl(source, id) {
    const build = window.goodaysBuildAffiliateUrl;
    if (source === 'pick') {
      const pick = (window.GOODAYS_PICKS || []).find((p) => p.id === id);
      return pick && build ? build(pick.shopeeUrl, `article-pick-${id}`) : (pick ? pick.shopeeUrl : '');
    }
    const deal = (window.GOODAYS_DEALS || []).find((d) => d.id === id);
    return deal && build ? build(deal.shopeeUrl, `article-deal-${id}`) : (deal ? deal.shopeeUrl : '');
  }

  function renderCtas() {
    document.querySelectorAll('.cta-box').forEach((box) => {
      const pickId = box.dataset.pick;
      const dealId = box.dataset.deal;
      const url = pickId ? resolveUrl('pick', pickId) : resolveUrl('deal', dealId);
      const label = box.dataset.label || 'Cek harga di Shopee';
      const note = box.dataset.note || 'Harga & stok bisa berubah — cek terbaru sebelum membeli.';
      box.innerHTML = `
        <div class="cta-inner">
          <a class="button button-shopee affiliate-link" data-aff="article-${pickId || dealId}" data-product="${label}"
             ${url ? `href="${url}" target="_blank" rel="nofollow sponsored noopener"` : 'href="#"'}>${label} <span>↗</span></a>
          <a class="text-link" href="/#picks">Lihat Top Picks <span>→</span></a>
          <small>${note}</small>
        </div>`;
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderCtas);
  else renderCtas();
})();
