const articleClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const articleSlug = new URLSearchParams(window.location.search).get('slug');
let currentLang = 'id';
let currentArticle = null;
let relatedArticles = [];

const copy = {
  id: {
    announcement: 'Temuan bagus, dipilih dengan penuh perhatian.', announcementLink: 'Lihat rekomendasi →', navHome: 'Home', navCategories: 'Categories', navArticles: 'Articles', navReviews: 'Product Reviews', navAbout: 'About', explore: 'Jelajahi temuan', backToArticles: 'Kembali ke artikel', articleEyebrow: 'JURNAL', sidebarLabel: 'BAIK UNTUK DIKETAHUI', sidebarText: 'Panduan penuh perhatian untuk pilihan sehari-hari yang lebih baik.', loading: 'Memuat artikel...', loadingContent: 'Memuat cerita...', articleNotFound: 'Artikel tidak ditemukan', articleNotFoundText: 'Artikel ini mungkin belum dipublikasikan atau URL-nya tidak lengkap.', loadError: 'Artikel tidak dapat dimuat', loadErrorText: 'Periksa koneksi Supabase lalu coba muat ulang halaman.', relatedEyebrow: 'LANJUTKAN MENJELAJAH', relatedTitle: 'Lebih banyak<br><em>yang bisa dibaca.</em>', allArticles: 'Semua artikel <span>→</span>', newArticle: 'ARTIKEL LAIN', footerText: 'Temuan pilihan untuk kehidupan sehari-hari.', allRights: 'Hak cipta dilindungi.', madeWith: 'Dibuat untuk browsing yang lebih baik.'
  },
  en: {
    announcement: 'Thoughtful finds, chosen with care.', announcementLink: 'See recommendations →', navHome: 'Home', navCategories: 'Categories', navArticles: 'Articles', navReviews: 'Product Reviews', navAbout: 'About', explore: 'Explore finds', backToArticles: 'Back to articles', articleEyebrow: 'THE JOURNAL', sidebarLabel: 'GOOD TO KNOW', sidebarText: 'Thoughtful guides for better everyday choices.', loading: 'Loading article...', loadingContent: 'Loading story...', articleNotFound: 'Article not found', articleNotFoundText: 'This article may not be published yet or its URL is incomplete.', loadError: 'Article could not be loaded', loadErrorText: 'Check the Supabase connection and try loading the page again.', relatedEyebrow: 'KEEP EXPLORING', relatedTitle: 'More good<br><em>things to read.</em>', allArticles: 'All articles <span>→</span>', newArticle: 'MORE FROM THE JOURNAL', footerText: 'Curated finds for everyday life.', allRights: 'All rights reserved.', madeWith: 'Made for better browsing.'
  }
};

const $ = (selector) => document.querySelector(selector);

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
}

function localized(row, field) {
  return row?.[`${field}_${currentLang}`] || row?.[`${field}_en`] || row?.[`${field}_id`] || '';
}

function formatContent(value = '') {
  return String(value).trim().split(/\n\s*\n/).filter(Boolean).map((paragraph) => {
    const trimmed = paragraph.trim();
    const headingMatch = trimmed.match(/^(#{2,3})\s+(.+)$/s);
    if (headingMatch) {
      const tag = headingMatch[1].length === 2 ? 'h2' : 'h3';
      return `<${tag}>${escapeHtml(headingMatch[2])}</${tag}>`;
    }
    return `<p>${escapeHtml(trimmed).replace(/\n/g, '<br>')}</p>`;
  }).join('');
}

function formatDate(value) {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat(currentLang === 'id' ? 'id-ID' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value));
  } catch (_error) {
    return '';
  }
}

function applyLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const value = copy[lang][element.dataset.i18n];
    if (value !== undefined) element.innerHTML = value;
  });
  $('.lang-switch').textContent = lang === 'id' ? 'EN' : 'ID';
  $('.lang-switch').setAttribute('aria-label', lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia');
  if (currentArticle) renderArticle();
  if (relatedArticles.length) renderRelated();
}

function renderError(type = 'notFound') {
  const title = type === 'notFound' ? copy[currentLang].articleNotFound : copy[currentLang].loadError;
  const text = type === 'notFound' ? copy[currentLang].articleNotFoundText : copy[currentLang].loadErrorText;
  $('#articleHeader').innerHTML = `<div class="article-error"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(text)}</span></div>`;
  $('#articleContent').innerHTML = '';
  $('#relatedSection').hidden = true;
}

function renderArticle() {
  const article = currentArticle;
  const title = localized(article, 'title');
  const excerpt = localized(article, 'excerpt');
  const category = article.category ? localized(article.category, 'name') : '';
  const date = formatDate(article.published_at);
  const meta = [category ? `<span class="article-category">${escapeHtml(category)}</span>` : '', date ? `<span class="meta-separator">•</span><span>${escapeHtml(date)}</span>` : '', article.author ? `<span class="meta-separator">•</span><span>${escapeHtml(article.author)}</span>` : ''].filter(Boolean).join('');

  document.title = `${title || 'Article'} — GoOdays`;
  const description = document.querySelector('meta[name="description"]');
  if (description && excerpt) description.setAttribute('content', excerpt);
  $('#articleHeader').innerHTML = `<h1>${escapeHtml(title)}</h1>${excerpt ? `<p class="article-excerpt">${escapeHtml(excerpt)}</p>` : ''}<div class="article-meta">${meta}</div>`;

  const cover = article.cover_image_url ? `<figure class="article-cover"><img src="${escapeHtml(article.cover_image_url)}" alt="${escapeHtml(title)}" loading="eager"></figure>` : '<div class="article-cover"><div class="article-cover-placeholder">G</div></div>';
  const content = formatContent(localized(article, 'content') || excerpt);
  $('#articleContent').innerHTML = `${cover}<div class="article-body">${content || `<p>${escapeHtml(copy[currentLang].articleNotFoundText)}</p>`}</div>`;
}

function renderRelated() {
  if (!relatedArticles.length) {
    $('#relatedSection').hidden = true;
    return;
  }
  $('#relatedSection').hidden = false;
  $('#relatedGrid').innerHTML = relatedArticles.map((article) => {
    const title = localized(article, 'title');
    const excerpt = localized(article, 'excerpt');
    const image = article.cover_image_url ? `<img src="${escapeHtml(article.cover_image_url)}" alt="${escapeHtml(title)}" loading="lazy">` : '<span class="related-card-placeholder">G</span>';
    return `<a class="related-card" href="article.html?slug=${encodeURIComponent(article.slug)}"><div class="related-card-image">${image}</div><div class="related-card-content"><p class="article-kicker">${escapeHtml(copy[currentLang].newArticle)}</p><h3>${escapeHtml(title)}</h3>${excerpt ? `<p>${escapeHtml(excerpt)}</p>` : ''}</div></a>`;
  }).join('');
}

async function loadArticle() {
  if (!articleSlug) {
    renderError('notFound');
    return;
  }
  const { data, error } = await articleClient.from('articles').select('*, category:categories(name_id,name_en)').eq('slug', articleSlug).eq('status', 'published').maybeSingle();
  if (error) {
    console.warn('GoOdays article could not be loaded', error);
    renderError('loadError');
    return;
  }
  if (!data) {
    renderError('notFound');
    return;
  }
  currentArticle = data;
  renderArticle();

  const relatedQuery = articleClient.from('articles').select('id,slug,title_id,title_en,excerpt_id,excerpt_en,cover_image_url,published_at').eq('status', 'published').neq('id', data.id).order('published_at', { ascending: false }).limit(3);
  const { data: related, error: relatedError } = await relatedQuery;
  if (!relatedError) {
    relatedArticles = related || [];
    renderRelated();
  }
}

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
menuToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', open);
});
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => nav.classList.remove('open')));
$('.lang-switch').addEventListener('click', () => applyLanguage(currentLang === 'id' ? 'en' : 'id'));

applyLanguage('id');
loadArticle();
