// S-GUARD PWA Service Worker v1.0.0
const CACHE_NAME = 'sguard-pwa-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png'
];

// 1. 설치 (Install) & 정적 에셋 사전 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Cache addAll skipped for some assets:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. 활성화 (Activate) & 구버전 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. 네트워크 요청 (Fetch)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API나 외부 Worker 요청은 네트워크 직접 통신 (캐시 우회)
  if (
    url.origin.includes('workers.dev') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/auth') ||
    url.pathname.startsWith('/sms') ||
    url.pathname.startsWith('/users') ||
    url.pathname.startsWith('/companies') ||
    url.pathname.startsWith('/organizations') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  // SPA 내비게이션 및 정적 리소스: Stale-While-Revalidate 또는 Network-First
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Network error occurred', { status: 408, headers: { 'Content-Type': 'text/plain' } });
        });
      })
  );
});

// 4. 푸시 알림 수신 (Push Notification)
self.addEventListener('push', (event) => {
  let data = { title: 'S-GUARD 관제 알림', body: '새로운 도급 공정 알림이 도착했습니다.' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'S-GUARD 관제 알림', body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/favicon.svg',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 5. 알림 클릭 이벤트
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
