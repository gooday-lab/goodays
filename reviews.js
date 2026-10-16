const reviewsClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
let currentLang = 'id';
let categories = [];
let products = [];
let activeCategory = new URLSearchParams(window.location.search).get('category') || 'all';
let requestedProductSlug = new URLSearchParams(window.location.search).get('product') || '';
let selectedProductId = null;
let activeMediaIndex = 0;
let searchTerm = '';
const $ = (selector) => document.querySelector(selector);

const copy = {
  id: { announcement: 'Temuan bagus, dipilih dengan penuh perhatian.', announcementLink: 'Lihat rekomendasi →', navHome: 'Home', navCategories: 'Categories', navArticles: 'Articles', navReviews: 'Product Reviews', navAbout: 'About', explore: 'Jelajahi temuan', reviewEyebrow: 'PRODUCT REVIEWS', pageTitle: 'Dicoba, diuji,<br><em>layak dibagikan.</em>', pageIntro: 'Kelebihan yang jelas, kekurangan yang jujur, dan detail yang membantumu memilih dengan percaya diri.', browseBy: 'JELAJAHI DENGAN', backHome: 'Kembali ke home', allReviews: 'SEMUA REVIEW', allProducts: 'Semua product reviews', products: 'produk', details: 'Lihat detail', hideDetails: 'Tutup detail', pros: 'Kelebihan', cons: 'Kekurangan', checkPrice: 'Cek harga <span>↗</span>', noProducts: 'Belum ada produk published di kategori ini.', searchPlaceholder: 'Cari nama produk atau brand...', noDetail: 'Pilih produk untuk melihat detail.', previousMedia: 'Media sebelumnya', nextMedia: 'Media berikutnya', productVideo: 'Video produk', openVideo: 'Buka video', footerText: 'Temuan pilihan untuk kehidupan sehari-hari.', allRights: 'Hak cipta dilindungi.', madeWith: 'Dibuat untuk browsing yang lebih baik.' },
  en: { announcement: 'Thoughtful finds, chosen with care.', announcementLink: 'See recommendations →', navHome: 'Home', navCategories: 'Categories', navArticles: 'Articles', navReviews: 'Product Reviews', navAbout: 'About', explore: 'Explore finds', reviewEyebrow: 'PRODUCT REVIEWS', pageTitle: 'Tried, tested,<br><em>worth sharing.</em>', pageIntro: 'Clear pros, honest cons, and the details that help you decide with confidence.', browseBy: 'BROWSE BY', backHome: 'Back to home', allReviews: 'ALL REVIEWS', allProducts: 'All product reviews', products: 'products', details: 'View details', hideDetails: 'Hide details', pros: 'Pros', cons: 'Cons', checkPrice: 'Check price <span>↗</span>', noProducts: 'No published products in this category yet.', searchPlaceholder: 'Search product name or brand...', noDetail: 'Select a product to see its details.', previousMedia: 'Previous media', nextMedia: 'Next media', productVideo: 'Product video', openVideo: 'Open video', footerText: 'Curated finds for everyday life.', allRights: 'All rights reserved.', madeWith: 'Made for better browsing.' }
};
Object.assign(copy.id, { compareTitle: '3 TERBAIK DI KATEGORI INI', comparePick: 'PILIHAN KAMI', bestOverall: 'Terbaik', priceNote: 'Harga & stok bisa berubah kapan saja — selalu cek harga terkini di Shopee.', disclosure: 'Beberapa link di halaman ini adalah link afiliasi Shopee — pembelian lewat link tersebut menghasilkan komisi untuk GoOdays tanpa biaya tambahan untukmu.' });
Object.assign(copy.en, { compareTitle: 'TOP 3 IN THIS CATEGORY', comparePick: 'OUR PICK', bestOverall: 'Best', priceNote: 'Prices & stock can change anytime — always check the current price on Shopee.', disclosure: 'Some links on this page are Shopee affiliate links — purchases through them earn GoOdays a commission at no extra cost to you.' });
function escapeHtml(value = '') { return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char])); }
function localized(row, field) { return row[`${field}_${currentLang}`] || row[`${field}_en`] || row[`${field}_id`] || ''; }
function formatDescription(value = '') { return String(value).split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean).map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`).join(''); }
function renderStars(rating) { const value = Math.max(0, Math.min(5, Number(rating) || 0)); const full = Math.floor(value); const half = value - full >= 0.5; const stars = Array.from({ length: 5 }, (_, index) => { const className = index < full ? 'is-full' : index === full && half ? 'is-half' : 'is-empty'; return `<span class="rating-star ${className}" aria-hidden="true">★</span>`; }).join(''); return `<span class="rating-stars" aria-label="${value} out of 5 stars">${stars}</span>`; }
function applyLanguage(lang) { currentLang = lang; document.documentElement.lang = lang; document.querySelectorAll('[data-i18n]').forEach((el) => { const value = copy[lang][el.dataset.i18n]; if (value !== undefined) el.innerHTML = value; }); const searchInput = $('#productSearch'); if (searchInput) searchInput.placeholder = copy[lang].searchPlaceholder; document.querySelector('.lang-switch').textContent = lang === 'id' ? 'EN' : 'ID'; renderCategoryNav(); renderProducts(); }
function showToast(message) { const toast = $('#toast'); toast.textContent = message; toast.classList.add('show'); clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => toast.classList.remove('show'), 3300); }

async function loadReviews() {
  const [categoryResult, productResult] = await Promise.all([
    reviewsClient.from('categories').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
    reviewsClient.from('products').select('*, category:categories(id,name_id,name_en), media:product_media(*)').eq('is_published', true).order('created_at', { ascending: false })
  ]);
  if (categoryResult.error || productResult.error) { $('#productList').innerHTML = `<div class="empty-detail">${escapeHtml(categoryResult.error?.message || productResult.error?.message || 'Unable to load reviews.')}</div>`; return; }
  categories = categoryResult.data || []; products = productResult.data || [];
  if (requestedProductSlug) {
    const requestedProduct = products.find((product) => product.slug === requestedProductSlug);
    if (requestedProduct) {
      selectedProductId = requestedProduct.id;
      setTimeout(() => $('#productDetail')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }
  if (activeCategory !== 'all' && !categories.some((category) => category.slug === activeCategory)) activeCategory = 'all';
  renderCategoryNav(); renderProducts();
}
function renderCategoryNav() {
  $('#categoryNav').innerHTML = `<button class="category-link ${activeCategory === 'all' ? 'active' : ''}" data-category="all"><span class="category-emoji">✦</span>${copy[currentLang].allReviews}</button>` + categories.map((category) => `<button class="category-link ${activeCategory === category.slug ? 'active' : ''}" data-category="${escapeHtml(category.slug)}"><span class="category-emoji">${escapeHtml(category.emoji || '•')}</span>${escapeHtml(localized(category, 'name'))}</button>`).join('');
  $('#categoryNav').querySelectorAll('[data-category]').forEach((button) => button.addEventListener('click', () => { activeCategory = button.dataset.category; const url = new URL(window.location.href); if (activeCategory === 'all') url.searchParams.delete('category'); else url.searchParams.set('category', activeCategory); window.history.replaceState({}, '', url); selectedProductId = null; renderCategoryNav(); renderProducts(); }));
}
function filteredProducts() { let result = activeCategory === 'all' ? products : products.filter((product) => product.category_id === categories.find((category) => category.slug === activeCategory)?.id); const query = searchTerm.trim().toLowerCase(); if (!query) return result; return result.filter((product) => [product.name, product.brand, localized(product, 'summary'), localized(product, 'description')].filter(Boolean).join(' ').toLowerCase().includes(query)); }
function renderProducts() {
  const visibleProducts = filteredProducts();
  const category = categories.find((item) => item.slug === activeCategory);
  $('#activeCategoryLabel').textContent = category ? `${category.emoji || ''} ${localized(category, 'name')}` : copy[currentLang].allReviews;
  $('#activeCategoryTitle').textContent = category ? localized(category, 'name') : copy[currentLang].allProducts;
  $('#resultCount').textContent = `${visibleProducts.length} ${copy[currentLang].products}`;
  if (!visibleProducts.length) { $('#productList').innerHTML = `<div class="loading-state">${copy[currentLang].noProducts}</div>`; $('#productDetail').innerHTML = `<div class="empty-detail">${copy[currentLang].noDetail}</div>`; return; }
  selectedProductId = selectedProductId && visibleProducts.some((product) => product.id === selectedProductId) ? selectedProductId : null;
  $('#productList').innerHTML = visibleProducts.map((product) => `<button class="product-row ${product.id === selectedProductId ? 'selected' : ''}" type="button" data-product="${escapeHtml(product.id)}"><span class="product-main"><span class="product-row-title">${escapeHtml(product.name)}</span><span class="product-row-summary">${escapeHtml(localized(product, 'summary'))}</span></span><span class="product-meta"><span class="product-price">${escapeHtml(product.price_text || '—')}</span><span class="product-rating">★ ${product.rating ? `${escapeHtml(product.rating)} / 5` : '—'}</span></span></button>`).join('');
  $('#productList').querySelectorAll('.product-row').forEach((button) => button.addEventListener('click', () => { const isClosing = selectedProductId === button.dataset.product; if (!isClosing && selectedProductId !== button.dataset.product) activeMediaIndex = 0; selectedProductId = isClosing ? null : button.dataset.product; renderProducts(); if (!isClosing) $('#productDetail').scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
  const selected = visibleProducts.find((product) => product.id === selectedProductId); renderDetail(selected);
  renderCompareStrip(visibleProducts);
}
function productMedia(product) {
  const media = [];
  if (product.image_url) media.push({ media_type: 'image', media_url: product.image_url, alt_text: product.name });
  (product.media || []).slice().sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).forEach((item) => {
    if (!item.media_url || media.some((existing) => existing.media_url === item.media_url)) return;
    media.push(item);
  });
  return media;
}
function videoEmbedUrl(value) {
  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();
    let videoId = '';
    if (host === 'youtu.be') videoId = parsed.pathname.slice(1).split('/')[0];
    if (host.includes('youtube.com')) videoId = parsed.searchParams.get('v') || parsed.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1] || '';
    if (videoId) return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`;
    if (host.includes('vimeo.com')) {
      const vimeoId = parsed.pathname.match(/\/(\d+)(?:$|\/)/)?.[1];
      if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}`;
    }
  } catch (_error) {
    return '';
  }
  return '';
}
function renderVideoMedia(item, productName) {
  const url = String(item.media_url || '').trim();
  const embedUrl = videoEmbedUrl(url);
  if (embedUrl) return `<iframe class="gallery-video-frame" src="${escapeHtml(embedUrl)}" title="${escapeHtml(productName)} — ${escapeHtml(copy[currentLang].productVideo)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
  if (/\.(mp4|webm|ogg)(?:[?#]|$)/i.test(url)) return `<video class="gallery-video" controls playsinline preload="metadata"><source src="${escapeHtml(url)}">${escapeHtml(copy[currentLang].openVideo)}</video>`;
  return `<div class="gallery-video-link"><span>▶</span><a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(copy[currentLang].openVideo)} ↗</a></div>`;
}
function renderGallery(product) {
  const media = productMedia(product);
  if (!media.length) return '<div class="detail-image detail-placeholder">✦</div>';
  activeMediaIndex = Math.max(0, Math.min(activeMediaIndex, media.length - 1));
  const current = media[activeMediaIndex];
  const content = current.media_type === 'video' ? renderVideoMedia(current, product.name) : `<img src="${escapeHtml(current.media_url)}" alt="${escapeHtml(current.alt_text || product.name)}">`;
  const controls = media.length > 1 ? `<button class="gallery-arrow gallery-prev" type="button" data-gallery-prev aria-label="${escapeHtml(copy[currentLang].previousMedia)}">←</button><button class="gallery-arrow gallery-next" type="button" data-gallery-next aria-label="${escapeHtml(copy[currentLang].nextMedia)}">→</button>` : '';
  const dots = media.length > 1 ? `<div class="gallery-dots" role="tablist" aria-label="${escapeHtml(product.name)} media">${media.map((_item, index) => `<button type="button" class="gallery-dot ${index === activeMediaIndex ? 'active' : ''}" data-gallery-index="${index}" role="tab" aria-selected="${index === activeMediaIndex}"></button>`).join('')}</div>` : '';
  return `<div class="detail-image product-gallery" id="productGallery"><div class="gallery-stage ${current.media_type === 'video' ? 'is-video' : ''}">${content}${controls}</div>${dots}</div>`;
}
function attachGalleryEvents(product) {
  const media = productMedia(product);
  const gallery = $('#productGallery');
  if (!gallery || media.length < 2) return;
  gallery.querySelector('[data-gallery-prev]')?.addEventListener('click', () => { activeMediaIndex = (activeMediaIndex - 1 + media.length) % media.length; renderDetail(product); });
  gallery.querySelector('[data-gallery-next]')?.addEventListener('click', () => { activeMediaIndex = (activeMediaIndex + 1) % media.length; renderDetail(product); });
  gallery.querySelectorAll('[data-gallery-index]').forEach((button) => button.addEventListener('click', () => { activeMediaIndex = Number(button.dataset.galleryIndex); renderDetail(product); }));
}
function renderDetail(product) {
  if (!product) { $('#productDetail').innerHTML = `<div class="empty-detail">${copy[currentLang].noDetail}</div>`; return; }
  const pros = product.pros?.[currentLang] || product.pros?.en || product.pros?.id || [];
  const cons = product.cons?.[currentLang] || product.cons?.en || product.cons?.id || [];
  const badge = localized(product, 'badge');
  const button = product.affiliate_url ? `<a class="button button-orange" data-aff="review-detail" data-product="${escapeHtml(product.name)}" href="${escapeHtml(product.affiliate_url)}" target="_blank" rel="nofollow sponsored noopener">${copy[currentLang].checkPrice}</a>` : '';
  $('#productDetail').innerHTML = `<div class="detail-grid">${renderGallery(product)}<div class="detail-copy">${badge ? `<span class="pill">${escapeHtml(badge)}</span>` : ''}<h2>${escapeHtml(product.name)}</h2><div class="detail-meta"><span class="detail-rating">${renderStars(product.rating)} <span class="rating-text">${product.rating ? `${escapeHtml(product.rating)} / 5` : ''}</span></span><span class="detail-price">${escapeHtml(product.price_text || '—')}</span></div><div class="detail-summary">${formatDescription(localized(product, 'description') || localized(product, 'summary'))}</div>${button}<div class="detail-columns"><div class="detail-pros"><h4>${copy[currentLang].pros}</h4><ul>${pros.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div><div class="detail-cons"><h4>${copy[currentLang].cons}</h4><ul>${cons.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div></div></div></div>`;
  attachGalleryEvents(product);
  updateReviewSticky(product);
}
function renderCompareStrip(visibleProducts) {
  const strip = $('#compareStrip');
  if (!strip) return;
  const top = visibleProducts.slice().sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0)).slice(0, 3);
  if (top.length < 2) { strip.innerHTML = ''; strip.hidden = true; return; }
  strip.hidden = false;
  strip.innerHTML = `<p class="compare-title">${copy[currentLang].compareTitle}</p><div class="compare-grid">${top.map((product, index) => `<div class="compare-card ${index === 0 ? 'compare-winner' : ''}">${index === 0 ? `<span class="compare-flag">${copy[currentLang].comparePick}</span>` : ''}<strong>${escapeHtml(product.name)}</strong><span class="compare-rating">${renderStars(product.rating)} ${product.rating ? `${escapeHtml(product.rating)} / 5` : ''}</span><span class="compare-price">${escapeHtml(product.price_text || '—')}</span>${product.affiliate_url ? `<a class="button button-small button-shopee" data-aff="compare-${index + 1}" data-product="${escapeHtml(product.name)}" href="${escapeHtml(product.affiliate_url)}" target="_blank" rel="nofollow sponsored noopener">${copy[currentLang].checkPrice}</a>` : `<button class="button button-small button-dark" type="button" data-select-product="${escapeHtml(product.id)}">${copy[currentLang].details}</button>`}</div>`).join('')}</div>`;
  strip.querySelectorAll('[data-select-product]').forEach((button) => button.addEventListener('click', () => { selectedProductId = button.dataset.selectProduct; renderProducts(); $('#productDetail').scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
}
function updateReviewSticky(product) {
  const bar = $('#reviewSticky');
  if (!bar) return;
  if (!product || !product.affiliate_url) { bar.hidden = true; return; }
  bar.hidden = false;
  bar.innerHTML = `<span>${escapeHtml(product.name)}</span><a class="button button-small button-shopee" data-aff="sticky-detail" data-product="${escapeHtml(product.name)}" href="${escapeHtml(product.affiliate_url)}" target="_blank" rel="nofollow sponsored noopener">${copy[currentLang].checkPrice}</a>`;
}

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
menuToggle.addEventListener('click', () => { const open = nav.classList.toggle('open'); menuToggle.setAttribute('aria-expanded', open); });
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => nav.classList.remove('open')));
document.querySelector('.lang-switch').addEventListener('click', () => applyLanguage(currentLang === 'id' ? 'en' : 'id'));
$('#productSearch').addEventListener('input', (event) => { searchTerm = event.target.value; selectedProductId = null; renderProducts(); });
applyLanguage('id');
loadReviews();
