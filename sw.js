// Service Worker: アプリシェルはキャッシュ優先、コンテンツはネットワーク優先(オフライン時はキャッシュ)
const VERSION = "kaizodo-v9";
const SHELL = [
  "./", "index.html", "manifest.json", "icon.svg",
  "css/style.css",
  "js/app.js", "js/store.js", "js/player.js", "js/home.js", "js/matome.js", "js/diagrams.js",
  "js/radio.js", "js/zukan.js", "js/kiroku.js", "js/settings.js",
  "data/models.json", "data/characters.json",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;

  // 音声(MP3)は SW を通さず必ず直接ネットワークへ。
  // iOS Safari は <audio> に Range リクエストを投げるが、SW が横取りして 206 をキャッシュ/
  // 200 で返すと iOS では再生が壊れる。Range 付きリクエストと .mp3 は素通しする。
  if (url.pathname.endsWith(".mp3") || e.request.headers.has("range")) return;

  // コンテンツと台帳類は常に新鮮さ優先(毎朝更新されるため)
  const networkFirst = url.pathname.includes("/content/") || url.pathname.endsWith("data/models.json");
  if (networkFirst) {
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => (e.request.mode === "navigate" ? caches.match("index.html") : undefined))
    )
  );
});
