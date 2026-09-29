// Optional local browser smoke check. Requires Chrome with remote debugging on 9222.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
(async () => {
  const tabs = await (await fetch('http://127.0.0.1:9222/json')).json();
  const tab = tabs.find(t => t.type === 'page');
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
  let id = 0;
  const pending = new Map(), errors = [];
  ws.addEventListener('message', event => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.text);
    if (msg.id) { const p = pending.get(msg.id); pending.delete(msg.id); msg.error ? p.reject(msg.error) : p.resolve(msg.result); }
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => { pending.set(++id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
  const evaluate = async expression => { const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails)); return result.result.value; };
  async function click(selector) {
    const point = await evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); element.scrollIntoView({block:'center', behavior:'instant'}); const r = element.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2}; })()`);
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 });
  }
  await send('Runtime.enable'); await send('Page.enable');
  await send('Page.addScriptToEvaluateOnNewDocument', { source: "try { localStorage.removeItem('essentia-language'); } catch {}" }).then(result => { globalThis.initScript = result.identifier; });
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: process.env.CATALOG_URL || pathToFileURL(path.join(__dirname, 'index.html')).href });
  for (let i = 0; i < 50; i++) { if (await evaluate("document.querySelectorAll('.product-card').length === 6")) break; await new Promise(r => setTimeout(r, 100)); }
  assert.equal(await evaluate("document.querySelectorAll('.product-card').length"), 6);
  assert.equal(await evaluate("document.querySelectorAll('.site-header img, footer img').length"), 0);
  assert.equal(await evaluate('document.documentElement.lang'), 'bg');
  assert.equal(await evaluate("document.querySelector('.product-card h3').textContent"), 'Лампа Bloom');
  assert.equal(await evaluate("document.querySelector('#search').placeholder"), 'Потърсете нещо…');
  await evaluate("search.value='формички'; search.dispatchEvent(new Event('input'))");
  assert.equal(await evaluate("document.querySelectorAll('.product-card').length"), 2);
  await evaluate("document.querySelector('.product-card').click()");
  assert.equal(await evaluate("document.querySelector('#dialog-title').textContent"), 'Формички „Цветна градина“');
  await evaluate("dialog.close(); document.querySelector('#reset-filters').click()");
  await click('[data-language=en]');
  assert.equal(await evaluate('document.documentElement.lang'), 'en');
  assert.equal(await evaluate("localStorage.getItem('essentia-language')"), 'en');
  await evaluate("Promise.all([...document.images].map(i => i.decode().catch(() => {})))");
  assert.equal(await evaluate('[...document.images].every(i => i.complete && i.naturalWidth > 0)'), true);
  await evaluate("document.querySelector('[data-category=\"Lamps\"]').click()");
  assert.equal(await evaluate("document.querySelectorAll('.product-card').length"), 2);
  await evaluate("search.value='ripple'; search.dispatchEvent(new Event('input'))");
  assert.equal(await evaluate("document.querySelectorAll('.product-card').length"), 1);
  await evaluate("document.querySelector('[data-language=bg]').click()");
  assert.equal(await evaluate("search.value === 'ripple' && category === 'Lamps' && document.querySelectorAll('.product-card').length === 1"), true);
  assert.equal(await evaluate("document.querySelector('.product-card h3').textContent"), 'Лампа Ripple');
  await evaluate("document.querySelector('[data-language=en]').click()");
  await evaluate("document.querySelector('.product-card').focus(); document.querySelector('.product-card').click()");
  assert.equal(await evaluate("dialog.open && document.querySelector('#dialog-title').textContent === 'The Ripple lamp'"), true);
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  for (let i = 0; i < 20; i++) { if (await evaluate('!dialog.open')) break; await new Promise(r => setTimeout(r, 25)); }
  assert.equal(await evaluate('dialog.open'), false);
  assert.equal(await evaluate("document.activeElement.className"), 'product-card');
  await evaluate("search.value='zzzz'; search.dispatchEvent(new Event('input'))");
  assert.equal(await evaluate("document.querySelector('#empty-state').hidden"), false);
  await evaluate("document.querySelector('#reset-filters').click(); document.documentElement.dataset.theme='light'; window.scrollTo(0,0)");
  assert.equal(await evaluate("document.querySelectorAll('.product-card').length"), 6);
  fs.mkdirSync('.preview', { recursive: true });
  async function screenshot(name) {
    await evaluate("Promise.all([...document.images].map(i => i.decode().catch(() => {})))");
    await evaluate("document.fonts.ready");
    await new Promise(r => setTimeout(r, 350));
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
    fs.writeFileSync(`.preview/${name}.png`, Buffer.from(shot.data, 'base64'));
  }
  await screenshot('desktop-light');
  await evaluate("document.querySelector('#theme-toggle').click()");
  assert.equal(await evaluate("localStorage.getItem('lf-theme')"), 'dark');
  await screenshot('desktop-dark');
  await evaluate("document.querySelector('[data-language=bg]').click()");
  // Rapid changes must not leave stale language content or an animation overlay.
  await evaluate("for (const lang of ['en','bg','en','bg']) document.querySelector(`[data-language=${lang}]`).click()");
  assert.equal(await evaluate("document.documentElement.lang === 'bg' && document.querySelector('.product-card h3').textContent === 'Лампа Bloom'"), true);
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await click('[data-language=en]');
  await evaluate("document.querySelector('.product-card').click()");
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  assert.equal(await evaluate('dialog.open'), false);
  await send('Emulation.setEmulatedMedia', { features: [] });
  await click('[data-language=bg]');
  await screenshot('desktop-bg-dark');
  await evaluate("document.documentElement.dataset.theme='light'");
  await screenshot('desktop-bg-light');
  for (const width of [320, 390, 768, 1024, 1440]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: width < 768 });
    for (const lang of ['en', 'bg']) {
      await click(`[data-language=${lang}]`);
      assert.equal(await evaluate('document.documentElement.lang'), lang);
      assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, `overflow at ${width}px in ${lang}`);
    }
    if (width === 390) {
      await evaluate("document.documentElement.dataset.theme='light'; window.scrollTo(0,0)");
      await screenshot('mobile-bg-light');
      await evaluate("document.querySelector('.product-card').click()");
      assert.equal(await evaluate('dialog.getBoundingClientRect().width <= innerWidth'), true);
      await evaluate('dialog.close()');
    }
  }
  await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: globalThis.initScript });
  await evaluate("document.querySelector('[data-language=en]').click()");
  await send('Page.reload');
  for (let i = 0; i < 50; i++) { if (await evaluate("document.documentElement.lang === 'en' && document.querySelectorAll('.product-card').length === 6")) break; await new Promise(r => setTimeout(r, 100)); }
  assert.equal(await evaluate('document.documentElement.lang'), 'en');
  await evaluate("document.querySelector('[data-language=bg]').click()");
  // The header must remain usable even when the catalog script fails to load.
  if (process.env.CATALOG_URL) {
    await send('Network.enable');
    await send('Network.setBlockedURLs', { urls: ['*app.js*'] });
    await send('Page.reload');
    for (let i = 0; i < 50; i++) { if (await evaluate('!!window.ESSENTIA_I18N')) break; await new Promise(r => setTimeout(r, 100)); }
    assert.equal(await evaluate('typeof render'), 'undefined');
    await click('[data-language=en]');
    assert.equal(await evaluate('document.documentElement.lang'), 'en');
    assert.equal(await evaluate("document.querySelector('[data-i18n=navCollection]').textContent"), 'The collection');
    await click('[data-language=bg]');
    await send('Network.setBlockedURLs', { urls: [] });
    await send('Page.reload');
    for (let i = 0; i < 50; i++) { if (await evaluate("document.querySelectorAll('.product-card').length === 6")) break; await new Promise(r => setTimeout(r, 100)); }
  }
  assert.deepEqual(errors, []);
  console.log('PASS: name-only branding, BG default, real BG/EN clicks + persistence + rapid switching, translated search/dialogs, reduced motion, Escape/focus, themes, and both languages at 320/390/768/1024/1440px.');
  ws.close();
})().catch(e => { console.error(e); process.exit(1); });
