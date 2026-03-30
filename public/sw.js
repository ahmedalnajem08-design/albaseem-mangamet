/// <reference lib="webworker" />

const CACHE_NAME = 'albaseem-v2';
const OFFLINE_URL = '/offline.html';

// ملفات للتخزين المؤقت
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/sounds/notification.mp3'
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// استراتيجية التخزين
self.addEventListener('fetch', (event) => {
  // تخطي طلبات غير GET
  if (event.request.method !== 'GET') return;

  // تخطي طلبات API
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'غير متصل بالإنترنت' }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // استراتيجية Network First للصفحات
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // تخزين الصفحة للOffline
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // استراتيجية Cache First للموارد الثابتة
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // تحديث الكاش في الخلفية
        fetch(event.request).then((response) => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response);
          });
        });
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          // تخزين الموارد الجديدة
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // صور بديلة
          if (event.request.destination === 'image') {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#f0f0f0" width="100" height="100"/><text x="50%" y="50%" fill="#999" text-anchor="middle">📷</text></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          }
        });
    })
  );
});

// استقبال الرسائل
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// إشعارات Push - مع دعم الصوت
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  const data = event.data?.json() ?? {};
  const title = data.title || 'AL-BASEEM';
  const body = data.body || 'لديك إشعار جديد';
  const notificationData = data.data || {};

  // خيارات الإشعار مع صوت
  const options = {
    body: body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200, 100, 200], // نمط اهتزاز قوي
    tag: notificationData.type || 'general', // تجميع الإشعارات
    renotify: true, // إشعار حتى لو نفس الـ tag
    requireInteraction: true, // يبقى الإشعار حتى يضغط المستخدم
    data: notificationData,
    actions: [
      { action: 'view', title: 'عرض' },
      { action: 'dismiss', title: 'إغلاق' }
    ],
    // إعدادات Android
    sound: '/sounds/notification.mp3',
    // أولوية عالية
    priority: 'high'
  };

  // إرسال رسالة للـ clients لتشغيل الصوت
  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'PLAY_NOTIFICATION_SOUND'
      });
    });
  });

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// النقر على الإشعار
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  if (action === 'dismiss') {
    return;
  }

  // تحديد الصفحة بناءً على نوع الإشعار
  let url = '/';

  if (data?.type === 'task') {
    url = '/?section=tasks';
  } else if (data?.type === 'reminder') {
    url = '/?section=reminders';
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // البحث عن نافذة مفتوحة
      for (const client of clientList) {
        if (client.url.includes(url.split('?')[0]) && 'focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            data: data
          });
          return client.focus();
        }
      }
      // فتح نافذة جديدة
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// إغلاق الإشعار
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});

// معالجة أخطاء push
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Push subscription changed');
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    }).then(subscription => {
      // إرسال الاشتراك الجديد للسيرفر
      return fetch('/api/notifications/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });
    })
  );
});
