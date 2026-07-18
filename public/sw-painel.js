// public/sw-painel.js
// Service Worker mínimo para o Painel Elétrica & Art.
// Objetivo atual: apenas tornar o PWA "instalável" de fato no Android.
// Sem cache agressivo por enquanto, para não servir dados desatualizados
// do painel administrativo.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Passthrough: deixa toda requisição seguir normalmente pra rede.
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
