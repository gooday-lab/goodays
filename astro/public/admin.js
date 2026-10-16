const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const state = { user: null, view: 'products', categories: [], records: {} };
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
}
function showToast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('show'); clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => el.classList.remove('show'), 3400); }
function showNotice(message) { const el = $('#globalNotice'); el.textContent = message; el.classList.add('show'); }
function clearNotice() { $('#globalNotice').classList.remove('show'); }
function tableFor(type) { return type === 'products' ? 'products' : type === 'articles' ? 'articles' : 'categories'; }
function labelStatus(status, published) { return published || status === 'published' ? '<span class="badge badge-green">Published</span>' : '<span class="badge badge-orange">Draft</span>'; }

async function boot() {
  const { data: { session } } = await client.auth.getSession();
  if (session) await enterApp(session);
  else showLogin();
  client.auth.onAuthStateChange((_event, sessionState) => { if (sessionState && !state.user) enterApp(sessionState); });
}
function showLogin() { $('#authScreen').classList.remove('is-hidden'); $('#appShell').classList.add('is-hidden'); }
async function enterApp(session) {
  state.user = session.user;
  try {
    const { data: isAdmin, error } = await client.rpc('is_admin');
    if (error || !isAdmin) throw new Error('Akun ini belum terdaftar sebagai admin GoOdays.');
    $('#authScreen').classList.add('is-hidden'); $('#appShell').classList.remove('is-hidden'); $('#userEmail').textContent = state.user.email || 'Admin';
    await loadCategories();
    await switchView(state.view);
  } catch (error) {
    showLogin(); $('#loginError').textContent = error.message; await client.auth.signOut();
  }
}

$('#loginForm').addEventListener('submit', async (event) => {
  event.preventDefault(); $('#loginError').textContent = '';
  const email = $('#loginEmail').value.trim(); const password = $('#loginPassword').value;
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) { $('#loginError').textContent = error.message; return; }
  await enterApp(data.session);
});
$('#logoutButton').addEventListener('click', async () => { await client.auth.signOut(); state.user = null; showLogin(); });
$$('.side-link').forEach((button) => button.addEventListener('click', () => switchView(button.dataset.view)));

async function loadCategories() {
  const { data, error } = await client.from('categories').select('*').order('sort_order', { ascending: true });
  if (error) throw error; state.categories = data || [];
}
async function switchView(view) {
  state.view = view; $$('.side-link').forEach((button) => button.classList.toggle('active', button.dataset.view === view));
  $$('.view').forEach((section) => section.classList.toggle('active', section.id === `view-${view}`));
  $('#pageTitle').textContent = view.charAt(0).toUpperCase() + view.slice(1);
  clearNotice();
  if (view === 'overview') return renderOverview();
  if (view === 'messages') return renderMessages();
  await renderList(view);
}

async function renderOverview() {
  const [products, articles, categories] = await Promise.all([
    client.from('products').select('id,is_published', { count: 'exact' }),
    client.from('articles').select('id,status', { count: 'exact' }),
    client.from('categories').select('id', { count: 'exact' })
  ]);
  $('#view-overview').innerHTML = `<div class="welcome-card"><p class="eyebrow">GOOD TO SEE YOU</p><h2>Make something<br>worth finding.</h2><p>Kelola konten GoOdays dari satu tempat. Mulai dari menambahkan produk affiliate atau menulis artikel SEO baru.</p></div><div class="stats-grid"><div class="stat-card"><span>Total products</span><strong>${products.count ?? 0}</strong></div><div class="stat-card"><span>Published articles</span><strong>${(articles.data || []).filter((item) => item.status === 'published').length}</strong></div><div class="stat-card"><span>Categories</span><strong>${categories.count ?? 0}</strong></div></div>`;
}

function messageStatusBadge(status) {
  const labels = { new: 'New', read: 'Read', replied: 'Replied', archived: 'Archived' };
  const className = status === 'new' ? 'badge-orange' : status === 'archived' ? 'badge-orange' : 'badge-green';
  return `<span class="badge ${className}">${labels[status] || escapeHtml(status || 'Unknown')}</span>`;
}
function formatMessageDate(value) {
  if (!value) return '—';
  try { return new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }); } catch (_error) { return '—'; }
}
async function renderMessages() {
  const section = $('#view-messages'); section.innerHTML = '<div class="empty">Loading messages...</div>';
  const { data, error } = await client.from('contact_messages').select('*').order('created_at', { ascending: false });
  if (error) { showNotice(`${error.message} Jalankan supabase-contact-messages.sql terlebih dahulu.`); section.innerHTML = '<div class="empty">Messages belum tersedia.</div>'; return; }
  state.records.messages = data || [];
  if (!data.length) { section.innerHTML = '<div class="toolbar"><div><h2>0 messages</h2><p>Pesan dari form Contact akan tampil di sini.</p></div></div><div class="table-wrap"><div class="empty">Belum ada pesan masuk.</div></div>'; return; }
  section.innerHTML = `<div class="toolbar"><div><h2>${data.length} messages</h2><p>Pesan yang dikirim melalui form Contact website.</p></div></div><div class="table-wrap"><table class="messages-table"><thead><tr><th>Sender</th><th>Message</th><th>Status</th><th>Received</th><th></th></tr></thead><tbody>${data.map((row) => `<tr><td><span class="item-name">${escapeHtml(row.name)}</span><div class="item-sub">${escapeHtml(row.email)}</div></td><td class="message-cell">${escapeHtml(row.message).replace(/\n/g, '<br>')}</td><td>${messageStatusBadge(row.status)}</td><td>${formatMessageDate(row.created_at)}</td><td><div class="row-actions"><button class="icon-button" data-action="message-status" data-id="${row.id}" data-status="read">Mark read</button><button class="icon-button" data-action="message-status" data-id="${row.id}" data-status="archived">Archive</button><button class="icon-button" data-action="message-delete" data-id="${row.id}">Delete</button></div></td></tr>`).join('')}</tbody></table></div>`;
}

async function renderList(view) {
  const section = $(`#view-${view}`); section.innerHTML = '<div class="empty">Loading...</div>';
  let query;
  if (view === 'products') query = client.from('products').select('*, category:categories(name_id,name_en), media:product_media(*)').order('created_at', { ascending: false });
  if (view === 'articles') query = client.from('articles').select('*, category:categories(name_id,name_en)').order('created_at', { ascending: false });
  if (view === 'categories') query = client.from('categories').select('*').order('sort_order', { ascending: true });
  const { data, error } = await query;
  if (error) { showNotice(error.message); section.innerHTML = '<div class="empty">Tidak dapat memuat data.</div>'; return; }
  state.records[view] = data || [];
  const singular = view === 'products' ? 'product' : view === 'articles' ? 'article' : 'category';
  section.innerHTML = `<div class="toolbar"><div><h2>${data.length} ${view}</h2><p>Kelola konten yang tampil di website.</p></div><button class="button button-orange" data-action="add" data-type="${view}">+ Add ${singular}</button></div>${tableHtml(view, data)}`;
}
function tableHtml(view, rows) {
  if (!rows.length) return '<div class="table-wrap"><div class="empty">Belum ada data. Tambahkan item pertama kamu.</div></div>';
  if (view === 'categories') return `<div class="table-wrap"><table><thead><tr><th>Category</th><th>Slug</th><th>Status</th><th>Order</th><th></th></tr></thead><tbody>${rows.map((row) => `<tr><td><span class="item-name">${escapeHtml(row.emoji || '')} ${escapeHtml(row.name_id)}</span><div class="item-sub">${escapeHtml(row.name_en)}</div></td><td>${escapeHtml(row.slug)}</td><td>${row.is_active ? '<span class="badge badge-green">Active</span>' : '<span class="badge badge-orange">Hidden</span>'}</td><td>${row.sort_order}</td><td>${actionsHtml('categories', row.id)}</td></tr>`).join('')}</tbody></table></div>`;
  if (view === 'products') return `<div class="table-wrap"><table><thead><tr><th>Product</th><th>Category</th><th>Rating</th><th>Status</th><th></th></tr></thead><tbody>${rows.map((row) => `<tr><td><span class="item-name">${escapeHtml(row.name)}</span><div class="item-sub">${escapeHtml(row.brand || '')}</div></td><td>${escapeHtml(row.category?.name_id || '—')}</td><td>★ ${row.rating || '—'}</td><td>${labelStatus('', row.is_published)}</td><td>${actionsHtml('products', row.id)}</td></tr>`).join('')}</tbody></table></div>`;
  return `<div class="table-wrap"><table><thead><tr><th>Article</th><th>Category</th><th>Status</th><th>Published</th><th></th></tr></thead><tbody>${rows.map((row) => `<tr><td><span class="item-name">${escapeHtml(row.title_id)}</span><div class="item-sub">${escapeHtml(row.slug)}</div></td><td>${escapeHtml(row.category?.name_id || '—')}</td><td>${labelStatus(row.status, false)}</td><td>${row.published_at ? new Date(row.published_at).toLocaleDateString('id-ID') : '—'}</td><td>${actionsHtml('articles', row.id)}</td></tr>`).join('')}</tbody></table></div>`;
}
function actionsHtml(type, id) { return `<div class="row-actions"><button class="icon-button" data-action="edit" data-type="${type}" data-id="${id}">Edit</button><button class="icon-button" data-action="delete" data-type="${type}" data-id="${id}">Delete</button></div>`; }

$('.admin-main').addEventListener('click', async (event) => {
  const action = event.target.closest('[data-action]'); if (!action) return;
  const { action: type, type: collection, id } = action.dataset;
  if (type === 'message-status') return updateMessageStatus(id, action.dataset.status);
  if (type === 'message-delete') return deleteMessage(id);
  if (type === 'add') return openEditor(collection);
  if (type === 'edit') return openEditor(collection, id);
  if (type === 'delete') return deleteRecord(collection, id);
});

async function updateMessageStatus(id, status) {
  const { error } = await client.from('contact_messages').update({ status }).eq('id', id);
  if (error) { showNotice(error.message); return; }
  showToast('Status pesan berhasil diperbarui.'); await renderMessages();
}
async function deleteMessage(id) {
  if (!confirm('Hapus pesan ini?')) return;
  const { error } = await client.from('contact_messages').delete().eq('id', id);
  if (error) { showNotice(error.message); return; }
  showToast('Pesan berhasil dihapus.'); await renderMessages();
}

function categoryOptions(selected = '') { return '<option value="">Uncategorized</option>' + state.categories.map((cat) => `<option value="${cat.id}" ${cat.id === selected ? 'selected' : ''}>${escapeHtml(cat.emoji || '')} ${escapeHtml(cat.name_id)}</option>`).join(''); }
function field(label, name, value = '', options = {}) { const required = options.required ? 'required' : ''; const full = options.full ? 'full' : ''; const type = options.type || 'text'; const attributes = [options.step ? `step="${options.step}"` : '', options.min !== undefined ? `min="${options.min}"` : '', options.max !== undefined ? `max="${options.max}"` : ''].filter(Boolean).join(' '); if (type === 'textarea') return `<label class="${full}">${label}<textarea name="${name}" ${required} placeholder="${options.placeholder || ''}">${escapeHtml(value)}</textarea></label>`; return `<label class="${full}">${label}<input type="${type}" name="${name}" value="${escapeHtml(value)}" ${required} ${attributes} placeholder="${options.placeholder || ''}"></label>`; }
function fileUploadField(label, name, accept = 'image/png,image/jpeg,image/webp,image/gif', multiple = false) { return `<label class="upload-field full">${label}<input type="file" name="${name}" accept="${accept}" ${multiple ? 'multiple' : ''}><small>${multiple ? 'Pilih satu atau beberapa file. ' : ''}JPG, PNG, WEBP atau GIF — maksimal 5 MB per file.</small></label>`; }
function check(label, name, checked) { return `<label class="check-label"><input type="checkbox" name="${name}" ${checked ? 'checked' : ''}> ${label}</label>`; }
function mediaEditorHtml(record = {}) {
  const media = (record.media || []).slice().sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  if (!media.length) return '<div class="media-manager full"><small>Belum ada media tambahan. Gambar lama dari Image URL tetap digunakan sebagai fallback.</small></div>';
  return `<div class="media-manager full"><span class="field-label">Media tersimpan</span><div class="media-manager-list">${media.map((item) => `<div class="media-manager-item" data-media-id="${escapeHtml(item.id)}"><span class="media-type">${item.media_type === 'video' ? 'VIDEO' : 'IMAGE'}</span><span class="media-url">${escapeHtml(item.media_url)}</span><button type="button" class="icon-button" data-action="remove-media" data-media-id="${escapeHtml(item.id)}">Remove</button></div>`).join('')}</div></div>`;
}
function openEditor(type, id = '') {
  const record = id ? (state.records[type] || []).find((item) => item.id === id) : {};
  const form = $('#editorForm'); form.dataset.type = type; form.dataset.id = id; form.dataset.deleteMedia = '';
  $('#modalKicker').textContent = id ? 'EDIT' : 'NEW'; $('#modalTitle').textContent = `${id ? 'Edit' : 'Add'} ${type.slice(0, -1)}`;
  if (type === 'categories') form.innerHTML = `<div class="form-grid">${field('Name Indonesia', 'name_id', record.name_id, { required: true })}${field('Name English', 'name_en', record.name_en, { required: true })}${field('Slug', 'slug', record.slug, { required: true })}${field('Emoji', 'emoji', record.emoji)}${field('Description Indonesia', 'description_id', record.description_id, { type: 'textarea' })}${field('Description English', 'description_en', record.description_en, { type: 'textarea' })}${field('Sort order', 'sort_order', record.sort_order || 0, { type: 'number' })}<div>${check('Active', 'is_active', record.is_active !== false)}</div></div>${formActions()}`;
  if (type === 'products') form.innerHTML = `<div class="form-grid">${field('Product name', 'name', record.name, { required: true })}${field('Brand', 'brand', record.brand)}${field('Slug', 'slug', record.slug, { required: true })}<label>Category<select name="category_id">${categoryOptions(record.category_id)}</select></label>${field('Summary Indonesia', 'summary_id', record.summary_id, { type: 'textarea' })}${field('Summary English', 'summary_en', record.summary_en, { type: 'textarea' })}${field('Description Indonesia', 'description_id', record.description_id, { type: 'textarea', full: true })}${field('Description English', 'description_en', record.description_en, { type: 'textarea', full: true })}${mediaEditorHtml(record)}${fileUploadField('Upload product images', 'image_files', 'image/png,image/jpeg,image/webp,image/gif', true)}${field('Image URL utama (optional)', 'image_url', record.image_url, { full: true })}${field('Video URL (optional)', 'video_url', (record.media || []).find((item) => item.media_type === 'video')?.media_url || '', { full: true, placeholder: 'https://www.youtube.com/watch?v=...' })}${field('Price text', 'price_text', record.price_text)}${field('Rating (0–5, step 0.5)', 'rating', record.rating, { type: 'number', step: '0.5', min: '0', max: '5' })}${field('Affiliate URL', 'affiliate_url', record.affiliate_url, { full: true })}${field('Pros Indonesia (one per line)', 'pros_id', record.pros?.id?.join('\n'), { type: 'textarea' })}${field('Pros English (one per line)', 'pros_en', record.pros?.en?.join('\n'), { type: 'textarea' })}${field('Cons Indonesia (one per line)', 'cons_id', record.cons?.id?.join('\n'), { type: 'textarea' })}${field('Cons English (one per line)', 'cons_en', record.cons?.en?.join('\n'), { type: 'textarea' })}${field('Badge Indonesia', 'badge_id', record.badge_id)}${field('Badge English', 'badge_en', record.badge_en)}<div class="checks">${check('Show on Home', 'is_featured', record.is_featured)}${check('Published', 'is_published', record.is_published)}</div></div>${formActions()}`;
  if (type === 'articles') form.innerHTML = `<div class="form-grid">${field('Judul Indonesia', 'title_id', record.title_id, { required: true, full: true })}${field('Title English', 'title_en', record.title_en, { required: true, full: true })}${field('Slug', 'slug', record.slug, { required: true })}<label>Category<select name="category_id">${categoryOptions(record.category_id)}</select></label>${field('Excerpt Indonesia', 'excerpt_id', record.excerpt_id, { type: 'textarea' })}${field('Excerpt English', 'excerpt_en', record.excerpt_en, { type: 'textarea' })}${field('Content Indonesia', 'content_id', record.content_id, { type: 'textarea', full: true })}${field('Content English', 'content_en', record.content_en, { type: 'textarea', full: true })}${fileUploadField('Upload cover image', 'cover_image_file')}${field('Cover image URL (optional)', 'cover_image_url', record.cover_image_url, { full: true })}${field('SEO title Indonesia', 'seo_title_id', record.seo_title_id)}${field('SEO title English', 'seo_title_en', record.seo_title_en)}${field('SEO description Indonesia', 'seo_description_id', record.seo_description_id, { type: 'textarea' })}${field('SEO description English', 'seo_description_en', record.seo_description_en, { type: 'textarea' })}<label>Status<select name="status"><option value="draft" ${record.status !== 'published' ? 'selected' : ''}>Draft</option><option value="published" ${record.status === 'published' ? 'selected' : ''}>Published</option></select></label>${formActions()}</div>`;
  $('#editorModal').classList.add('open'); $('#editorModal').setAttribute('aria-hidden', 'false');
}
function formActions() { return '<div class="form-actions full"><button type="button" class="button button-light" id="cancelEditor">Cancel</button><button type="submit" class="button button-orange">Save changes <span>↗</span></button></div>'; }
function closeEditor() { $('#editorModal').classList.remove('open'); $('#editorModal').setAttribute('aria-hidden', 'true'); }
$('#modalClose').addEventListener('click', closeEditor); $('.modal-backdrop').addEventListener('click', closeEditor); document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeEditor(); });
$('#editorForm').addEventListener('click', (event) => {
  if (event.target.id === 'cancelEditor') closeEditor();
  const removeButton = event.target.closest('[data-action="remove-media"]');
  if (!removeButton) return;
  const mediaId = removeButton.dataset.mediaId;
  const ids = ($('#editorForm').dataset.deleteMedia || '').split(',').filter(Boolean);
  if (!ids.includes(mediaId)) ids.push(mediaId);
  $('#editorForm').dataset.deleteMedia = ids.join(',');
  removeButton.closest('.media-manager-item')?.remove();
});
$('#editorForm').addEventListener('submit', saveRecord);

async function uploadImage(file, folder, slug) {
  if (!file.type.startsWith('image/')) throw new Error('File harus berupa gambar.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Ukuran gambar maksimal 5 MB.');
  const extension = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const safeSlug = (slug || 'image').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
  const path = `${folder}/${Date.now()}-${safeSlug}.${extension}`;
  const { error } = await client.storage.from('site-images').upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  const { data } = client.storage.from('site-images').getPublicUrl(path);
  return data.publicUrl;
}

async function saveRecord(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const type = form.dataset.type;
  const id = form.dataset.id;
  const currentRecord = id ? (state.records[type] || []).find((item) => item.id === id) : {};
  const values = Object.fromEntries(new FormData(form).entries());
  const table = tableFor(type);
  let payload;
  if (type === 'categories') payload = { name_id: values.name_id, name_en: values.name_en, slug: values.slug, emoji: values.emoji || null, description_id: values.description_id || null, description_en: values.description_en || null, sort_order: Number(values.sort_order || 0), is_active: values.is_active === 'on' };
  if (type === 'products') payload = { name: values.name, brand: values.brand || null, slug: values.slug, category_id: values.category_id || null, summary_id: values.summary_id || null, summary_en: values.summary_en || null, description_id: values.description_id || null, description_en: values.description_en || null, image_url: values.image_url || null, price_text: values.price_text || null, affiliate_url: values.affiliate_url || null, rating: values.rating ? Number(values.rating) : null, pros: { id: splitLines(values.pros_id), en: splitLines(values.pros_en) }, cons: { id: splitLines(values.cons_id), en: splitLines(values.cons_en) }, badge_id: values.badge_id || null, badge_en: values.badge_en || null, is_featured: values.is_featured === 'on', is_published: values.is_published === 'on' };
  if (type === 'articles') payload = { title_id: values.title_id, title_en: values.title_en, slug: values.slug, category_id: values.category_id || null, excerpt_id: values.excerpt_id || null, excerpt_en: values.excerpt_en || null, content_id: values.content_id || null, content_en: values.content_en || null, cover_image_url: values.cover_image_url || null, seo_title_id: values.seo_title_id || null, seo_title_en: values.seo_title_en || null, seo_description_id: values.seo_description_id || null, seo_description_en: values.seo_description_en || null, status: values.status, published_at: values.status === 'published' ? new Date().toISOString() : null };
  const fileInput = form.querySelector('input[name="image_files"], input[name="cover_image_file"]');
  const files = fileInput ? [...fileInput.files] : [];
  if (type !== 'products' && files[0]) {
    try {
      showNotice('Uploading image...');
      const publicUrl = await uploadImage(files[0], 'articles', values.slug);
      payload.cover_image_url = publicUrl;
    } catch (error) {
      showNotice(error.message);
      return;
    }
  }
  if (id) payload.id = id;
  const { data: saved, error } = await client.from(table).upsert(payload).select().single();
  if (error) { showNotice(error.message); return; }

  if (type === 'products') {
    const productId = saved.id;
    const deleteIds = (form.dataset.deleteMedia || '').split(',').filter(Boolean);
    if (deleteIds.length) {
      const { error: deleteError } = await client.from('product_media').delete().in('id', deleteIds);
      if (deleteError) { showNotice(deleteError.message); return; }
    }

    const existingMedia = (currentRecord.media || []).filter((item) => !deleteIds.includes(item.id));
    let nextSort = existingMedia.reduce((max, item) => Math.max(max, Number(item.sort_order) || 0), -1) + 1;
    const uploadedMedia = [];
    if (files.length) {
      try {
        showNotice(`Uploading ${files.length} product image${files.length > 1 ? 's' : ''}...`);
        for (const file of files) {
          const publicUrl = await uploadImage(file, 'products', values.slug);
          uploadedMedia.push({ product_id: productId, media_type: 'image', media_url: publicUrl, alt_text: values.name || 'GoOdays product image', sort_order: nextSort++, is_primary: existingMedia.length === 0 && uploadedMedia.length === 0 });
        }
        const { error: mediaError } = await client.from('product_media').insert(uploadedMedia);
        if (mediaError) { showNotice(mediaError.message); return; }
        if (!payload.image_url && !currentRecord.image_url && uploadedMedia[0]) {
          const { error: primaryError } = await client.from('products').update({ image_url: uploadedMedia[0].media_url }).eq('id', productId);
          if (primaryError) { showNotice(primaryError.message); return; }
        }
      } catch (uploadError) {
        showNotice(uploadError.message);
        return;
      }
    }

    const { data: oldVideos, error: videoReadError } = await client.from('product_media').select('id').eq('product_id', productId).eq('media_type', 'video');
    if (videoReadError) { showNotice(videoReadError.message); return; }
    if (oldVideos?.length) {
      const { error: videoDeleteError } = await client.from('product_media').delete().in('id', oldVideos.map((item) => item.id));
      if (videoDeleteError) { showNotice(videoDeleteError.message); return; }
    }
    const videoUrl = String(values.video_url || '').trim();
    if (videoUrl) {
      const { error: videoInsertError } = await client.from('product_media').insert({ product_id: productId, media_type: 'video', media_url: videoUrl, alt_text: `${values.name || 'Product'} video`, sort_order: nextSort });
      if (videoInsertError) { showNotice(videoInsertError.message); return; }
    }
  }

  closeEditor();
  showToast('Data berhasil disimpan.');
  await loadCategories();
  await renderList(type);
}
function splitLines(value = '') { return value.split('\n').map((item) => item.trim()).filter(Boolean); }
async function deleteRecord(type, id) { if (!confirm('Hapus item ini?')) return; const { error } = await client.from(tableFor(type)).delete().eq('id', id); if (error) { showNotice(error.message); return; } showToast('Data berhasil dihapus.'); await renderList(type); }

boot();
