const CACHE_NAME = 'bait-alagha-v2';
const assets = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/Images/Logo.avif',
  '/Images/Cover.avif'
];

// مرحلة التثبيت: إجبار السيرفس وركر الجديد على التفعيل فوراً
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// مرحلة التنشيط: حذف الملفات القديمة (v1) لضمان ظهور التعديلات الجديدة
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  return self.clients.claim();
});

// جلب البيانات: محاولة البحث في الكاش أولاً، وإذا لم يوجد نأتي به من السيرفر
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
