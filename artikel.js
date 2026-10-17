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
      let url = '';
      let affTag = '';
      if (pickId) { url = resolveUrl('pick', pickId); affTag = `article-pick-${pickId}`; }
      else if (dealId) { url = resolveUrl('deal', dealId); affTag = `article-deal-${dealId}`; }
      else if (box.dataset.link) { url = box.dataset.link; } // link internal biasa (tanpa afiliasi)
      const isAffiliate = !!(pickId || dealId);
      const label = box.dataset.label || (isAffiliate ? 'Cek harga di Shopee' : 'Lihat Top Picks');
      const note = box.dataset.note || (isAffiliate ? 'Harga & stok bisa berubah — cek terbaru sebelum membeli.' : '');
      box.innerHTML = `
        <div class="cta-inner">
          <a class="button button-shopee${isAffiliate ? ' affiliate-link' : ''}" ${isAffiliate ? `data-aff="${affTag}" data-product="${label}"` : ''}
             ${url ? `href="${url}"${isAffiliate ? ' target="_blank" rel="nofollow sponsored noopener"' : ''}` : 'href="#"'}>${label} <span>↗</span></a>
          ${isAffiliate ? '<a class="text-link" href="/#picks">Lihat Top Picks <span>→</span></a>' : ''}
          <small>${note}</small>
        </div>`;
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderCtas);
  else renderCtas();
})();
