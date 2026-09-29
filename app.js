const { products, productTranslations = {}, ...contacts } = window.STUDIO;
let language = 'bg';
try { if (localStorage.getItem('essentia-language') === 'en') language = 'en'; } catch {}
const t = key => window.TRANSLATIONS[language][key] ?? key;
const localizedProduct = product => ({ ...product, ...productTranslations[language]?.[product.id] });
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
const closeDialog = () => dialog.close();
document.querySelector('#close-dialog').addEventListener('click', closeDialog);
dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(); } });
document.querySelector('#dialog-contact').addEventListener('click', () => { closeDialog(); setTimeout(() => document.querySelector('#contact a, #contact h2').focus({ preventScroll: true }), 0); });
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
function applyLanguage() {
  document.documentElement.lang = language;
  document.title = t('pageTitle');
  document.querySelector('meta[name="description"]').content = t('metaDescription');
  // Only trusted strings from translations.js are inserted as markup.
  document.querySelectorAll('[data-i18n]').forEach(element => { element.innerHTML = t(element.dataset.i18n); });
  for (const attribute of ['aria-label', 'placeholder', 'alt']) {
    document.querySelectorAll(`[data-i18n-${attribute}]`).forEach(element => element.setAttribute(attribute, t(element.getAttribute(`data-i18n-${attribute}`))));
  }
  document.querySelectorAll('[data-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === language)));
  syncThemeButton(); renderContacts(); render();
}
document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => {
  language = button.dataset.language;
  try { localStorage.setItem('essentia-language', language); } catch {}
  applyLanguage();
}));
document.querySelector('#year').textContent = new Date().getFullYear();
applyLanguage();
