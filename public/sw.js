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

// إشعارات الخصومات (Web Push) — الرسالة بتوصل كـ JSON من مسار الإرسال
// السيرفري وبتتحول لإشعار حقيقي هنا حتى لو الموقع/التطبيق مقفول.
self.addEventListener("push", (event) => {
  let data = { title: "خصومات", body: "" };
  try {
    data = event.data.json();
  } catch {
    // تجاهل — لو الرسالة مش JSON صالح
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "خصومات", {
      body: data.body || "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      dir: "rtl",
      lang: "ar",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsList) => {
      const existing = clientsList.find((c) => "focus" in c);
      if (existing) return existing.focus();
      return self.clients.openWindow("/");
    })
  );
});
