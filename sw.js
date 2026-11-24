// Service worker: lets the app open without internet once it has been loaded.
// App files are fetched from the network first (so your published changes show up)
// and taken from the cache when the phone is offline.

const CACHE = 'bibcit-v122';
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
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== MUSIC_CACHE).map(k => caches.delete(k))))
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

// The background music: downloaded whole once and kept on the phone (also offline). It has its own
// cache, so a new app version does not download it again; give MUSIC_CACHE a new name when the music
// file changes. The browser asks for a long sound in parts (a "range"): each part is cut out of the copy.
const MUSIC_CACHE = 'bibcit-music-1';
async function musicResponse(request) {
  const cache = await caches.open(MUSIC_CACHE);
  let whole = await cache.match(request.url);
  if (!whole) {
    try {
      const res = await fetch(request.url);
      if (res.status !== 200) return res;
      await cache.put(request.url, res.clone());
      whole = res;
    } catch {
      return new Response('', { status: 504 });
    }
  }
  const range = /bytes=(\d*)-(\d*)/.exec(request.headers.get('range') || '');
  if (!range) return whole;
  const data = await whole.arrayBuffer();
  const size = data.byteLength;
  let start = range[1] ? +range[1] : size - +range[2];
  let end = range[1] && range[2] ? Math.min(+range[2], size - 1) : size - 1;
  if (start >= size || start < 0) return new Response('', { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  return new Response(data.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': whole.headers.get('Content-Type') || 'audio/mp4',
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes',
    },
  });
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.origin === self.location.origin && url.pathname.includes('/api/')) return; // laptop server only
  if (url.origin === self.location.origin && url.pathname.includes('/music/')) {
    event.respondWith(musicResponse(request));
    return;
  }
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
