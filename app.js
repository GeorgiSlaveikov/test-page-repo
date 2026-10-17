const arrowIcon = '<svg class="ui-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M7 17 17 7M7 7h10v10"/></svg>';
const { products, productTranslations = {}, ...contacts } = window.STUDIO;
const t = window.ESSENTIA_I18N.t;
const localizedProduct = product => ({ ...product, ...productTranslations[window.ESSENTIA_I18N.language]?.[product.id] });
const grid = document.querySelector('#product-grid');
const filterBar = document.querySelector('#filters');
const search = document.querySelector('#search');
const dialog = document.querySelector('#product-dialog');
let category = 'All objects';
function rebuildFilters() {
filterBar.replaceChildren();
const categories = ['All objects', ...new Set(products.map(product => product.category))];
categories.sort((a, b) => {
  const order = ['All objects', 'Cookie cutters', 'Lamps', 'Medal hangers'];
  return (order.includes(a) ? order.indexOf(a) : 99) - (order.includes(b) ? order.indexOf(b) : 99);
});
for (const name of categories) {
  const button = document.createElement('button');
  button.className = 'filter'; button.dataset.category = name;
  const label = document.createElement('span'); label.className = 'filter-label'; label.textContent = t(name);
  button.append(label);
  button.addEventListener('click', () => { category = name; render(); });
  filterBar.append(button);
}
}
function render() {
  const query = search.value.trim().toLowerCase();
  const visible = products.filter(p => {
    const translated = localizedProduct(p);
    const searchable = [p, translated, productTranslations.bg?.[p.id]].filter(Boolean).map(item => `${item.name} ${item.label} ${item.description}`).join(' ');
    return (category === 'All objects' || p.category === category) && `${searchable} ${p.category} ${t(p.category)}`.toLowerCase().includes(query);
  });
  filterBar.querySelectorAll('button').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.category === category));
    button.querySelector('.filter-label').textContent = t(button.dataset.category);
  });
  grid.replaceChildren();
  for (const original of visible) {
    const product = localizedProduct(original);
    const card = document.createElement('button'); card.className = 'product-card'; card.setAttribute('aria-label', `${t('viewProduct')} ${product.name}`);
    const ratio = (product.width || 600) / (product.height || 480);
    card.style.setProperty('--photo-ratio', ratio);
    card.style.setProperty('--card-width', `${Math.max(240, Math.min(620, ratio * 360))}px`);
    card.style.setProperty('--reveal-delay', `${Math.min(grid.children.length, 5) * 25}ms`);
    const visual = document.createElement('div'); visual.className = 'product-visual';
    const image = document.createElement('img'); image.src = product.image; image.alt = product.alt; image.loading = 'lazy'; image.width = product.width || 600; image.height = product.height || 480; visual.append(image);
    if (product.badge) { const badge = document.createElement('span'); badge.className = 'badge'; badge.textContent = t(product.badge); visual.append(badge); }
    const arrow = document.createElement('span'); arrow.className = 'card-arrow'; arrow.innerHTML = arrowIcon; arrow.setAttribute('aria-hidden', 'true'); visual.append(arrow);
    const type = document.createElement('span'); type.className = 'product-category'; type.textContent = t(product.category);
    const title = document.createElement('h3'); title.textContent = product.name;
    const label = document.createElement('p'); label.textContent = product.label;
    card.append(visual, type, title, label); card.addEventListener('click', () => openProduct(original)); grid.append(card);
  }
  document.querySelector('#result-count').textContent = `${visible.length} ${t(visible.length === 1 ? 'countOne' : 'countMany')}`;
  document.querySelector('#empty-state').hidden = visible.length !== 0;
}
let activeProduct;
function openProduct(original) {
  activeProduct = original;
  const product = localizedProduct(original);
  document.querySelector('#dialog-image').src = product.image; document.querySelector('#dialog-image').alt = product.alt;
  const thumbnails = document.querySelector('#dialog-thumbnails');
  thumbnails.replaceChildren();
  const photos = product.images || [product.image];
  thumbnails.hidden = photos.length < 2;
  photos.forEach((src, index) => {
    const button = document.createElement('button'); button.type = 'button';
    button.setAttribute('aria-label', `${product.name} — ${index + 1} / ${photos.length}`);
    button.setAttribute('aria-pressed', String(index === 0));
    const image = document.createElement('img'); image.src = src; image.alt = ''; image.loading = 'lazy';
    button.append(image);
    button.addEventListener('click', () => {
      document.querySelector('#dialog-image').src = src;
      thumbnails.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    });
    thumbnails.append(button);
  });
  document.querySelector('#dialog-category').textContent = t(product.category); document.querySelector('#dialog-title').textContent = product.name;
  document.querySelector('#dialog-description').textContent = product.description;
  const list = document.createElement('ul');
  for (const detail of product.details || []) { const item = document.createElement('li'); item.textContent = detail; list.append(item); }
  document.querySelector('#dialog-details').replaceChildren(list); if (!dialog.open) dialog.showModal(); document.body.classList.add('modal-open');
}
let closingDialog;
function closeDialog() {
  if (closingDialog) return closingDialog;
  if (!dialog.open) return Promise.resolve();
  if (typeof dialog.animate !== 'function' || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    dialog.close();
    return Promise.resolve();
  }
  dialog.classList.add('is-closing');
  const animation = dialog.animate(
    [{ opacity: 1, transform: 'translateY(0) scale(1)' }, { opacity: 0, transform: 'translateY(8px) scale(.985)' }],
    { duration: 150, easing: 'ease-in' }
  );
  closingDialog = animation.finished.catch(() => {}).then(() => {
    dialog.close();
    dialog.classList.remove('is-closing');
    closingDialog = null;
  });
  return closingDialog;
}
dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(); });
document.querySelector('#close-dialog').addEventListener('click', closeDialog);
dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(); } });
document.querySelector('#dialog-contact').addEventListener('click', () => {
  closeDialog().then(() => document.querySelector('#contact a, #contact h2').focus({ preventScroll: true }));
});
search.addEventListener('input', render);
document.querySelector('#reset-filters').addEventListener('click', () => { category = 'All objects'; search.value = ''; render(); search.focus(); });
const themeButton = document.querySelector('#theme-toggle');
function syncThemeButton() { const dark = document.documentElement.dataset.theme === 'dark'; themeButton.setAttribute('aria-label', t(dark ? 'lightTheme' : 'darkTheme')); themeButton.title = themeButton.getAttribute('aria-label'); themeButton.setAttribute('aria-pressed', String(dark)); }
themeButton.addEventListener('click', () => { const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = theme; try { localStorage.setItem('lf-theme', theme); } catch {} syncThemeButton(); });
function renderContacts() {
document.querySelector('#contact-links').replaceChildren();
for (const [key, label] of [['email', t('email')], ['instagram', 'Instagram'], ['tiktok', 'TikTok']]) {
  const value = contacts[key]?.trim(); if (!value) continue;
  if (key !== 'email' && !/^https:\/\//i.test(value)) continue;
  const link = document.createElement('a'); link.className = 'button secondary';
  const icons = {
    email: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/></svg>',
    instagram: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>'
  };
  if (icons[key]) link.insertAdjacentHTML('beforeend', icons[key]);
  const text = document.createElement('span'); text.textContent = key === 'email' ? value : key === 'instagram' ? '@essentiaa_studio' : label;
  link.append(text); link.href = key === 'email' ? `mailto:${value}` : value;
  if (key === 'instagram') link.setAttribute('aria-label', 'Instagram @essentiaa_studio');
  if (key === 'email') link.setAttribute('aria-label', `${t('email')}: ${value}`);
  if (key !== 'email') { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
  document.querySelector('#contact-links').append(link);
}
document.querySelector('#contact-placeholder').hidden = document.querySelector('#contact-links').children.length !== 0;
}
document.addEventListener('essentia:languagechange', () => {
  rebuildFilters(); syncThemeButton(); renderContacts(); render();
  if (dialog.open && activeProduct) {
    const photo = document.querySelector('#dialog-image').getAttribute('src');
    openProduct(activeProduct);
    const index = (activeProduct.images || [activeProduct.image]).indexOf(photo);
    document.querySelector('#dialog-thumbnails').children[index]?.click();
  }
});
rebuildFilters(); syncThemeButton(); renderContacts(); render();
