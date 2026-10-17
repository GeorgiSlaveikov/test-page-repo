const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
test('admin authentication protects publishing and uploads', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'essentia-test-'));
  const child = spawn(process.execPath, ['server.cjs'], { env:{ ...process.env, PORT:'3099', DATA_DIR:directory }, stdio:['ignore','pipe','pipe'] });
  try {
    await new Promise((resolve,reject) => { child.stdout.once('data',resolve); child.once('error',reject); child.once('exit',code => reject(Error('Server exited '+code))); });
    const request = (url, body, cookie, method='POST') => fetch('http://127.0.0.1:3099'+url, { method, headers:{ 'Content-Type':'application/json', ...(cookie ? { cookie } : {}) }, body:JSON.stringify(body) });
    assert.equal((await fetch('http://127.0.0.1:3099/')).status,200);
    assert.equal((await fetch('http://127.0.0.1:3099/server.cjs')).status,404);
    assert.equal((await request('/api/catalog',{},null,'PUT')).status,401);
    assert.equal((await request('/api/upload',{})).status,401);
    assert.equal((await request('/api/login',{ username:'admin',password:'wrong' })).status,401);
    const login = await request('/api/login',{ username:'admin',password:process.env.ADMIN_PASSWORD || '06012023' });
    assert.equal(login.status,200); const cookie = login.headers.get('set-cookie').split(';')[0];
    assert.match(login.headers.get('set-cookie'), /HttpOnly/);
    assert.equal((await request('/api/catalog',{ products:[{ id:'bad' }] },cookie,'PUT')).status,400);
    assert.equal((await request('/api/upload',{ base64:Buffer.from('<script>bad</script>').toString('base64') },cookie)).status,400);
    const upload = await request('/api/upload',{ base64:'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=' },cookie);
    assert.equal(upload.status,200);
    const image = (await upload.json()).image;
    assert.equal((await fetch('http://127.0.0.1:3099'+image)).status,200);
    const catalog = await fetch('http://127.0.0.1:3099/api/catalog').then(r => r.json());
    catalog.products.push({ id:'test', name:'Test photo', category:'New category', image, details:[] });
    assert.equal((await request('/api/catalog',catalog,cookie,'PUT')).status,200);
    assert.equal((await fetch('http://127.0.0.1:3099/api/catalog').then(r => r.json())).products.at(-1).name,'Test photo');
    assert.equal(JSON.parse(fs.readFileSync(path.join(directory,'catalog.json'))).products.at(-1).image,image);
    assert.equal((await fetch('http://127.0.0.1:3099/api/session',{ headers:{ cookie } }).then(r => r.json())).authenticated,true);
    assert.equal((await request('/api/logout',{},cookie)).status,200);
    assert.equal((await request('/api/catalog',{},cookie,'PUT')).status,401);
  } finally { child.kill(); await new Promise(resolve => child.exitCode !== null ? resolve() : child.once('exit',resolve)); fs.rmSync(directory, { recursive:true, force:true }); }
});
