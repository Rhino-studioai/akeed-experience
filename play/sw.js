// The Akeed Experience: offline cache. The game page is fetched fresh when online; 3D models and icons come from the cache.
const CACHE = 'akeed-v2';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./game.html', './manifest.webmanifest', './icon-192.png', './icon-512.png']).catch(() => {}))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url); if (e.request.method !== 'GET') return;
  const isModel = u.pathname.endsWith('.glb') || u.pathname.endsWith('.png') || u.hostname.includes('cdnjs.cloudflare.com') || u.hostname.includes('fonts.g');
  if (isModel) { e.respondWith(caches.open(CACHE).then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok || r.type === 'opaque') c.put(e.request, r.clone()); return r; })))); return; }
  if (u.pathname.endsWith('game.html') || u.pathname.endsWith('/play/') ) { e.respondWith(fetch(e.request).then(r => { const cl = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cl)); return r; }).catch(() => caches.match(e.request).then(h => h || caches.match('./game.html')))); }
});
