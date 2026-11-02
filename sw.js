// Service worker: guarda la app en el teléfono para abrirla rápido y sin conexión.
const V = 'limoncito-v5';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'favicon.png', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png',
  'lib/jspdf.umd.min.js', 'lib/xlsx.full.min.js', 'lib/pdf.min.js', 'lib/pdf.worker.min.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.pathname.includes('/api/')) return;           // los datos siempre van directo al servidor
  if (r.mode === 'navigate') {                                               // la página: primero la red (para tomar actualizaciones)
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put('index.html', cp)); return res; })
      .catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(h => h || fetch(r).then(res => {      // lo demás: primero lo guardado
    if (res.ok || res.type === 'opaque') { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
    return res;
  })));
});
