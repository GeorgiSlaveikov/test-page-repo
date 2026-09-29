// Language controls initialize independently of the product catalog.
(() => {
  let language = 'bg';
  let transition;
  try { if (localStorage.getItem('essentia-language') === 'en') language = 'en'; } catch {}
  const t = key => window.TRANSLATIONS?.[language]?.[key] ?? key;

  function applyLanguage(animate = false) {
    document.documentElement.lang = language;
    document.title = t('pageTitle');
    document.querySelector('meta[name="description"]').content = t('metaDescription');
    // Markup comes only from our trusted, local translation dictionary.
    document.querySelectorAll('[data-i18n]').forEach(element => { element.innerHTML = t(element.dataset.i18n); });
    for (const attribute of ['aria-label', 'placeholder', 'alt']) {
      document.querySelectorAll(`[data-i18n-${attribute}]`).forEach(element => {
        element.setAttribute(attribute, t(element.getAttribute(`data-i18n-${attribute}`)));
      });
    }
    document.querySelectorAll('[data-language]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.language === language));
    });
    document.dispatchEvent(new CustomEvent('essentia:languagechange', { detail: { language } }));
    transition?.cancel();
    if (animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      transition = document.querySelector('main').animate(
        [{ opacity: .55, transform: 'translateY(3px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 220, easing: 'ease-out' }
      );
    }
  }

  window.ESSENTIA_I18N = { t, get language() { return language; } };
  document.querySelectorAll('[data-language]').forEach(button => {
    button.addEventListener('click', () => {
      const next = button.dataset.language;
      if (!['bg', 'en'].includes(next) || next === language) return;
      language = next;
      try { localStorage.setItem('essentia-language', language); } catch {}
      applyLanguage(true);
    });
  });
  applyLanguage();
})();
