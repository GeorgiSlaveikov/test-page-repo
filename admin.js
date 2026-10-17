(() => {
  const modal = document.createElement('dialog');
  modal.id = 'admin-dialog';
  modal.setAttribute('aria-labelledby', 'admin-title');
  modal.innerHTML = `<div class="admin-heading"><h2 id="admin-title">Studio admin</h2><button type="button" class="icon-button" id="admin-close" aria-label="Close admin">×</button></div>
  <p id="admin-status" role="status"></p>
  <form id="admin-login" class="admin-form"><label>Username<input name="username" value="admin" autocomplete="username" readonly></label><label>Password<input name="password" type="password" autocomplete="current-password" required></label><button class="button primary">Log in</button></form>
  <section id="admin-panel" hidden><div class="admin-actions"><button type="button" class="button secondary" id="admin-new">+ Add product</button><button type="button" class="button secondary" id="admin-logout">Log out</button></div>
  <p>Edit a product, then publish to update the public catalog. Photos: JPEG, PNG or WebP, up to 8 MB.</p><div id="admin-list"></div>
  <form id="admin-editor" class="admin-form" hidden><h3 id="admin-editor-title">Product</h3><div class="admin-columns"><label>Category<input name="category" list="admin-categories" required maxlength="100"></label><datalist id="admin-categories"></datalist><label>Badge<input name="badge" maxlength="100" placeholder="Optional"></label></div>
  <div class="admin-columns"><fieldset><legend>English</legend><label>Name<input name="name" required maxlength="150"></label><label>Short description<input name="label" maxlength="300"></label><label>Description<textarea name="description" rows="4" maxlength="5000"></textarea></label><label>Details (one per line)<textarea name="details" rows="3"></textarea></label><label>Photo description<input name="alt" maxlength="300"></label></fieldset>
  <fieldset><legend>Български (optional)</legend><label>Име<input name="bgName" maxlength="150"></label><label>Кратко описание<input name="bgLabel" maxlength="300"></label><label>Описание<textarea name="bgDescription" rows="4" maxlength="5000"></textarea></label><label>Детайли (по един на ред)<textarea name="bgDetails" rows="3"></textarea></label><label>Описание на снимката<input name="bgAlt" maxlength="300"></label></fieldset></div>
  <label>Photo<input name="photo" type="file" accept="image/jpeg,image/png,image/webp"></label><img id="admin-preview" alt="Photo preview" hidden><div class="admin-actions"><button class="button primary">Publish product</button><button type="button" class="button secondary" id="admin-delete">Delete product</button></div></form>
  <form id="admin-contacts" class="admin-form"><h3>Contact settings</h3><label>Email<input name="email" type="email"></label><label>Instagram URL<input name="instagram" type="url" pattern="https://.*"></label><label>TikTok URL<input name="tiktok" type="url" pattern="https://.*"></label><button class="button primary">Publish contacts</button></form></section>`;
  document.body.append(modal);
  const $ = selector => modal.querySelector(selector);
  const status = message => { $('#admin-status').textContent = message; };
  let catalog, editing = null, connected = false;
  async function api(url, method = 'GET', body) {
    const response = await fetch('/api/' + url, { method, headers: body ? { 'Content-Type':'application/json' } : {}, body: body ? JSON.stringify(body) : undefined });
    if (!response.headers.get('content-type')?.includes('application/json')) throw Error('Admin requires the Node.js server. Run npm start and open http://localhost:3000.');
    const result = await response.json();
    if (!response.ok) {
      if (response.status === 401) showPanel(false);
      throw Error(result.error || 'Request failed');
    }
    return result;
  }
  function showPanel(loggedIn) { $('#admin-login').hidden = loggedIn; $('#admin-panel').hidden = !loggedIn; }
  function list() {
    $('#admin-list').replaceChildren(); $('#admin-categories').replaceChildren();
    for (const category of new Set(catalog.products.map(p => p.category))) { const option = document.createElement('option'); option.value = category; $('#admin-categories').append(option); }
    for (const product of catalog.products) {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'admin-item';
      const image = document.createElement('img'); image.src = product.image; image.alt = '';
      const name = document.createElement('span'); name.textContent = product.name + ' · ' + product.category;
      const edit = document.createElement('span'); edit.textContent = 'Edit →'; button.append(image, name, edit);
      button.addEventListener('click', () => editor(product)); $('#admin-list').append(button);
    }
    for (const key of ['email','instagram','tiktok']) $('#admin-contacts').elements[key].value = catalog[key] || '';
  }
  function editor(product) {
    editing = product?.id || null; const form = $('#admin-editor'); form.reset(); form.hidden = false;
    const bg = catalog.productTranslations?.bg?.[editing] || {};
    for (const key of ['name','category','badge','label','description','alt']) form.elements[key].value = product?.[key] || '';
    form.elements.details.value = (product?.details || []).join('\n');
    for (const key of ['name','label','description','alt','details']) form.elements['bg'+key[0].toUpperCase()+key.slice(1)].value = Array.isArray(bg[key]) ? bg[key].join('\n') : bg[key] || '';
    $('#admin-delete').hidden = !editing; $('#admin-preview').hidden = !product;
    if (product) $('#admin-preview').src = product.image;
    $('#admin-editor-title').textContent = product ? 'Edit product' : 'New product'; form.elements.name.focus();
  }
  async function publish(next) { await api('catalog','PUT',next); catalog = next; window.refreshCatalog(catalog); list(); status('Published. Your changes are now visible to visitors.'); }
  function action(handler) { return async event => { event.preventDefault(); const buttons = [...modal.querySelectorAll('button')]; buttons.forEach(b => b.disabled = true); try { await handler(event); } catch(error) { status(error.message); } finally { buttons.forEach(b => b.disabled = false); } }; }
  document.querySelector('#admin-open').addEventListener('click', async () => {
    modal.showModal(); status('');
    try { if (!connected) { catalog = await api('catalog'); connected = true; } const session = await api('session'); showPanel(session.authenticated); if (session.authenticated) list(); } catch(error) { status(error.message); }
  });
  $('#admin-close').onclick = () => modal.close();
  $('#admin-login').addEventListener('submit', action(async () => {
    const form = $('#admin-login'); await api('login','POST',{ username:form.elements.username.value, password:form.elements.password.value }); form.elements.password.value = '';
    catalog = await api('catalog'); showPanel(true); list(); status('Welcome back.');
  }));
  $('#admin-logout').onclick = action(async () => { await api('logout','POST',{}); showPanel(false); $('#admin-editor').hidden = true; status('Logged out.'); });
  $('#admin-new').onclick = () => editor(null);
  let previewURL;
  $('#admin-editor').elements.photo.onchange = event => { if (previewURL) URL.revokeObjectURL(previewURL); const file = event.target.files[0]; if (file) { previewURL = URL.createObjectURL(file); $('#admin-preview').src = previewURL; $('#admin-preview').hidden = false; } };
  $('#admin-editor').addEventListener('submit', action(async () => {
    const form = $('#admin-editor'), fields = form.elements, next = structuredClone(catalog);
    const product = editing ? { ...next.products.find(p => p.id === editing) } : { id:crypto.randomUUID() };
    for (const key of ['name','category','badge','label','description','alt']) product[key] = fields[key].value.trim();
    product.details = fields.details.value.split('\n').map(s => s.trim()).filter(Boolean);
    const file = fields.photo.files[0];
    if (file) {
      if (file.size > 8*1024*1024) throw Error('Photo must be under 8 MB');
      status('Uploading photo…');
      const base64 = await new Promise((resolve,reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result.split(',')[1]); reader.onerror = reject; reader.readAsDataURL(file); });
      product.image = (await api('upload','POST',{ base64 })).image;
    }
    if (!product.image) throw Error('Please choose a photo');
    next.productTranslations ||= {}; next.productTranslations.bg ||= {};
    const bg = {};
    for (const key of ['name','label','description','alt','details']) { const value = fields['bg'+key[0].toUpperCase()+key.slice(1)].value.trim(); if (value) bg[key] = key === 'details' ? value.split('\n').filter(Boolean) : value; }
    next.productTranslations.bg[product.id] = bg;
    if (editing) next.products[next.products.findIndex(p => p.id === editing)] = product; else next.products.push(product);
    await publish(next); editor(product);
  }));
  $('#admin-delete').onclick = action(async () => {
    if (!editing || !confirm('Delete this product from the public catalog?')) return;
    const next = structuredClone(catalog); next.products = next.products.filter(p => p.id !== editing);
    for (const translations of Object.values(next.productTranslations || {})) delete translations[editing];
    await publish(next); $('#admin-editor').hidden = true; editing = null;
  });
  $('#admin-contacts').addEventListener('submit', action(async () => { const next = structuredClone(catalog); for (const key of ['email','instagram','tiktok']) next[key] = $('#admin-contacts').elements[key].value.trim(); await publish(next); }));
  if (location.protocol !== 'file:') api('catalog').then(value => { catalog = value; connected = true; window.refreshCatalog(value); }).catch(() => {});
})();
