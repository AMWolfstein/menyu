// Service worker بسيط لتحقيق شرط "قابلية التثبيت" (installability) على أندرويد
// فقط — بدون أي تخزين مؤقت لبيانات Firestore الحية، عشان الأسعار والمنيو
// تفضل تتحدث فورًا زي ما هي مصممة، حتى بعد تثبيت التطبيق.

const CACHE_NAME = "menyu-shell-v1";
const PRECACHE_URLS = ["/", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // نتعامل بس مع طلبات GET من نفس الأصل (assets ثابتة). أي حاجة تانية —
  // Firestore، Cloudinary، طلبات POST/PUT، إلخ — بتعدي على طول للشبكة من
  // غير أي تدخل، عشان البيانات الحية ما تتصرفش أبدًا من نسخة مخزّنة قديمة.
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match("/")))
  );
});
