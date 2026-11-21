// Service worker: lets the app open without internet once it has been loaded.
// App files are fetched from the network first (so your published changes show up)
// and taken from the cache when the phone is offline.

const CACHE = 'bibcit-v25';
const APP_FILES = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'letters.js',
  'audio/index.json',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(APP_FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function saveCopy(request, response) {
  if (response.ok || response.type === 'opaque') {
    const copy = response.clone();
    caches.open(CACHE).then(cache => cache.put(request, copy));
  }
  return response;
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.origin === self.location.origin && url.pathname.includes('/api/')) return; // laptop server only
  if (url.origin === self.location.origin) {
    event.respondWith(
      // 'no-cache': always ask GitHub whether the file changed (otherwise the phone may keep
      // using a downloaded copy for up to 10 minutes after you publish)
      fetch(request, { cache: 'no-cache' })
        .then(response => saveCopy(request, response))
        .catch(() =>
          caches.match(request, { ignoreSearch: true })
            .then(hit => hit || caches.match('index.html'))
        )
    );
  } else if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    // The font never changes: use the saved copy when there is one.
    event.respondWith(
      caches.match(request).then(hit => hit || fetch(request).then(response => saveCopy(request, response)))
    );
  }
});
