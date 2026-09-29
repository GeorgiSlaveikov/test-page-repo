const { products, productTranslations = {}, ...contacts } = window.STUDIO;
const t = window.ESSENTIA_I18N.t;
const localizedProduct = product => ({ ...product, ...productTranslations[window.ESSENTIA_I18N.language]?.[product.id] });
const grid = document.querySelector('#product-grid');
const filterBar = document.querySelector('#filters');
const search = document.querySelector('#search');
const dialog = document.querySelector('#product-dialog');
let category = 'All objects';
const categories = ['All objects', ...new Set(products.map(product => product.category))];
const icons = { 'All objects': '▦', 'Cookie cutters': '✿', Lamps: '◠', 'Medal hangers': '♧' };
categories.sort((a, b) => {
  const order = ['All objects', 'Cookie cutters', 'Lamps', 'Medal hangers'];
  return (order.includes(a) ? order.indexOf(a) : 99) - (order.includes(b) ? order.indexOf(b) : 99);
});
for (const name of categories) {
  const button = document.createElement('button');
  button.className = 'filter'; button.dataset.category = name;
  const icon = document.createElement('span'); icon.setAttribute('aria-hidden', 'true'); icon.textContent = icons[name] || '◇';
  const label = document.createElement('span'); label.className = 'filter-label'; label.textContent = t(name);
  button.append(icon, label);
  button.addEventListener('click', () => { category = name; render(); });
  filterBar.append(button);
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
    card.style.setProperty('--reveal-delay', `${Math.min(grid.children.length, 5) * 25}ms`);
    const visual = document.createElement('div'); visual.className = 'product-visual';
    const image = document.createElement('img'); image.src = product.image; image.alt = product.alt; image.loading = 'lazy'; image.width = 600; image.height = 480; visual.append(image);
    if (product.badge) { const badge = document.createElement('span'); badge.className = 'badge'; badge.textContent = t(product.badge); visual.append(badge); }
    const arrow = document.createElement('span'); arrow.className = 'card-arrow'; arrow.textContent = '↗'; arrow.setAttribute('aria-hidden', 'true'); visual.append(arrow);
    const type = document.createElement('span'); type.className = 'product-category'; type.textContent = t(product.category);
    const title = document.createElement('h3'); title.textContent = product.name;
    const label = document.createElement('p'); label.textContent = product.label;
    card.append(visual, type, title, label); card.addEventListener('click', () => openProduct(original)); grid.append(card);
  }
  document.querySelector('#result-count').textContent = `${visible.length} ${t(visible.length === 1 ? 'countOne' : 'countMany')}`;
  document.querySelector('#empty-state').hidden = visible.length !== 0;
}
function openProduct(original) {
  const product = localizedProduct(original);
  document.querySelector('#dialog-image').src = product.image; document.querySelector('#dialog-image').alt = product.alt;
  document.querySelector('#dialog-category').textContent = t(product.category); document.querySelector('#dialog-title').textContent = product.name;
  document.querySelector('#dialog-description').textContent = product.description;
  const list = document.createElement('ul');
  for (const detail of product.details || []) { const item = document.createElement('li'); item.textContent = detail; list.append(item); }
  document.querySelector('#dialog-details').replaceChildren(list); dialog.showModal(); document.body.classList.add('modal-open');
}
let closingDialog;
function closeDialog() {
  if (closingDialog) return closingDialog;
  if (!dialog.open) return Promise.resolve();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
  const link = document.createElement('a'); link.className = 'button secondary'; link.textContent = `${label} ↗`; link.href = key === 'email' ? `mailto:${value}` : value;
  if (key !== 'email') { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
  document.querySelector('#contact-links').append(link);
}
document.querySelector('#contact-placeholder').hidden = document.querySelector('#contact-links').children.length !== 0;
}
document.addEventListener('essentia:languagechange', () => { syncThemeButton(); renderContacts(); render(); });
document.querySelector('#year').textContent = new Date().getFullYear();
syncThemeButton(); renderContacts(); render();
