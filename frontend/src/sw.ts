/// <reference lib="WebWorker" />

const sw = self as unknown as ServiceWorkerGlobalScope;

const API_HOSTS = ["localhost:8000", "localhost:5173"];

sw.addEventListener("install", (event) => {
  event.waitUntil(sw.skipWaiting());
});

sw.addEventListener("activate", (event) => {
  event.waitUntil(sw.clients.claim());
});

sw.addEventListener("fetch", (event) => {
  // Phase 1: 不拦截 API 请求，直接走网络
  const url = new URL(event.request.url);
  if (API_HOSTS.some((host) => url.host === host) && url.pathname.startsWith("/auth") || url.pathname.startsWith("/plans")) {
    return; // 不拦截，让浏览器直接处理
  }
  // 其他请求透传
  event.respondWith(fetch(event.request));
});
