/// <reference lib="WebWorker" />

const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener("install", (event) => {
  event.waitUntil(sw.skipWaiting());
});

sw.addEventListener("activate", (event) => {
  event.waitUntil(sw.clients.claim());
});

sw.addEventListener("fetch", (event) => {
  // Phase 1: 透传网络请求，为后续 IndexedDB 离线缓存预留
  event.respondWith(fetch(event.request));
});
