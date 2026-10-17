const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const root = __dirname, data = process.env.DATA_DIR || path.join(root, 'data'), uploads = path.join(data, 'uploads');
fs.mkdirSync(uploads, { recursive: true });
const catalogPath = path.join(data, 'catalog.json');
const seed = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(root, 'products.js'), 'utf8'), seed);
let catalog = fs.existsSync(catalogPath) ? JSON.parse(fs.readFileSync(catalogPath)) : seed.window.STUDIO;
const passwordHash = crypto.scryptSync(process.env.ADMIN_PASSWORD || '06012023', 'essentia-admin', 64);
const sessions = new Map(), attempts = new Map();
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp' };
function validate(value) {
  if (!value || !Array.isArray(value.products) || value.products.length > 500) throw Error('Invalid catalog');
  const ids = new Set();
  for (const p of value.products) {
    if (!p.id || ids.has(p.id) || !p.name?.trim() || !p.category?.trim() || !/^(images\/|\/uploads\/|https:\/\/)/.test(p.image) || !Array.isArray(p.details)) throw Error('Invalid product');
    ids.add(p.id);
  }
  return value;
}
http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const reply = (code, value) => { res.writeHead(code, { 'Content-Type':'application/json', 'Cache-Control':'no-store' }); res.end(JSON.stringify(value)); };
  res.setHeader('X-Content-Type-Options', 'nosniff');
  try {
    const token = /(?:^|; )essentia_session=([a-f0-9]+)/.exec(req.headers.cookie || '')?.[1];
    const authenticated = sessions.get(token) > Date.now();
    if (url.pathname === '/api/catalog' && req.method === 'GET') return reply(200, catalog);
    if (url.pathname === '/api/session' && req.method === 'GET') return reply(200, { authenticated });
    if (url.pathname.startsWith('/api/')) {
      if (!['POST','PUT'].includes(req.method)) return reply(405, { error:'Method not allowed' });
      if (req.headers.origin && req.headers.origin !== `${req.socket.encrypted ? 'https' : 'http'}://${req.headers.host}`) return reply(403, { error:'Invalid origin' });
      if (req.headers['content-type'] !== 'application/json') return reply(415, { error:'JSON required' });
      if (url.pathname !== '/api/login' && !authenticated) return reply(401, { error:'Please log in' });
      let body = '', bytes = 0;
      for await (const chunk of req) { bytes += chunk.length; if (bytes > 12000000) { reply(413, { error:'Upload too large (8 MB maximum)' }); return; } body += chunk; }
      const input = JSON.parse(body || '{}');
      if (url.pathname === '/api/login') {
        const key = req.socket.remoteAddress, previous = attempts.get(key);
        const attempt = previous && previous.until > Date.now() ? previous : { count:0, until:Date.now()+900000 };
        if (attempt.count >= 10) return reply(429, { error:'Too many attempts. Try again in 15 minutes.' });
        if (input.username !== 'admin' || !crypto.timingSafeEqual(crypto.scryptSync(String(input.password), 'essentia-admin', 64), passwordHash)) {
          attempt.count++; attempts.set(key, attempt); return reply(401, { error:'Incorrect username or password' });
        }
        attempts.delete(key);
        for (const [key, expiry] of sessions) if (expiry < Date.now()) sessions.delete(key);
        const session = crypto.randomBytes(32).toString('hex'); sessions.set(session, Date.now()+28800000);
        res.setHeader('Set-Cookie', `essentia_session=${session}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${req.socket.encrypted || process.env.COOKIE_SECURE === '1' ? '; Secure' : ''}`);
        return reply(200, { ok:true });
      }
      if (url.pathname === '/api/logout') { sessions.delete(token); res.setHeader('Set-Cookie','essentia_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'); return reply(200, { ok:true }); }
      if (url.pathname === '/api/catalog' && req.method === 'PUT') {
        const next = validate(input); fs.writeFileSync(catalogPath+'.tmp', JSON.stringify(next, null, 2)); fs.renameSync(catalogPath+'.tmp', catalogPath); catalog = next;
        return reply(200, { ok:true });
      }
      if (url.pathname === '/api/upload') {
        const buffer = Buffer.from(input.base64 || '', 'base64');
        let ext;
        if (buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) ext = '.png';
        else if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) ext = '.jpg';
        else if (buffer.toString('ascii',0,4) === 'RIFF' && buffer.toString('ascii',8,12) === 'WEBP') ext = '.webp';
        if (!ext || buffer.length > 8*1024*1024) return reply(400, { error:'Choose a PNG, JPEG or WebP photo under 8 MB' });
        const name = crypto.randomUUID()+ext; fs.writeFileSync(path.join(uploads,name),buffer); return reply(200, { image:'/uploads/'+name });
      }
      return reply(404, { error:'Not found' });
    }
    if (!['GET','HEAD'].includes(req.method)) return reply(405, { error:'Method not allowed' });
    const pathname = decodeURIComponent(url.pathname);
    const allowed = /^\/(index\.html|styles\.css|app\.js|admin\.js|products\.js|language\.js|translations\.js)$/.test(pathname) || /^\/images\/[\w.-]+$/.test(pathname);
    const upload = /^\/uploads\/[\w-]+\.(png|jpg|webp)$/.test(pathname);
    if (pathname !== '/' && !allowed && !upload) return reply(404, { error:'Not found' });
    const file = upload ? path.join(uploads,path.basename(pathname)) : path.join(root,pathname === '/' ? 'index.html' : pathname.slice(1));
    if (!fs.existsSync(file)) return reply(404, { error:'Not found' });
    res.writeHead(200, { 'Content-Type':mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control':'no-cache' });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  } catch (error) { reply(400, { error:'Unable to process request. Check the entered data.' }); }
}).listen(Number(process.env.PORT || 3000), process.env.HOST || '127.0.0.1', () => console.log('Essentia: http://localhost:'+(process.env.PORT || 3000)));
